// weekly-attendance-report.ts
// Weekly report: lists students with attendance% below THRESHOLD per course,
// only if total TeacherLectures >= MIN_TOTAL_LECTURES, then emails counselor.
// Uses mysql2/promise + nodemailer. Safe to run with read-only DB user.

import 'dotenv/config';
import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';

const THRESHOLD = Number(process.env.THRESHOLD ?? 70);
const MIN_TOTAL_LECTURES = Number(process.env.MIN_TOTAL_LECTURES ?? 5);
const DRY_RUN = process.env.DRY_RUN === '1';

type Row = {
  userid: number;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  // schema: int(11) -> voi tulla numerona; käsitellään stringiksi tulosteessa
  studentnumber: number | string | null;
  courseid: number;
  code: string | null;
  course_name: string | null;
  group_name: string | null;
  total_lectures: number | null;
  attended_lectures: number | null;
  attendance_percentage: number | null;
  // MAX(l.start_date) -> palautuu usein Date-oliona
  last_attendance_info: Date | string | null;
};

async function main() {
  console.log(
    `[weekly-attendance-report] Start THRESHOLD=${THRESHOLD}% MIN_TOTAL_LECTURES=${MIN_TOTAL_LECTURES} DRY_RUN=${DRY_RUN}`
  );

  // DB pool (read-only credentials recommended)
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER_GUEST,        // read-only user
    password: process.env.DB_PASS_GUEST,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5
  });

  // SQL mirrors your existing logic and adds HAVING for threshold + min TeacherLectures
  // English comments as requested
  const sql = `
    SELECT
      u.userid,
      u.email,
      u.first_name,
      u.last_name,
      u.studentnumber,
      c.courseid,
      c.code,
      c.name AS course_name,
      sg.group_name,
      COUNT(DISTINCT l.lectureid) AS total_lectures,
      COUNT(DISTINCT CASE WHEN a.status = 1 THEN a.attendanceid END) AS attended_lectures,
      ROUND(
        COUNT(DISTINCT CASE WHEN a.status = 1 THEN a.attendanceid END) * 100.0 /
        NULLIF(COUNT(DISTINCT l.lectureid), 0),
        1
      ) AS attendance_percentage,
      MAX(l.start_date) AS last_attendance_info
    FROM users u
           JOIN usercourses uc ON u.userid = uc.userid
           JOIN courses c ON uc.courseid = c.courseid
           LEFT JOIN studentgroups sg ON u.studentgroupid = sg.studentgroupid
           JOIN courseinstructors ci ON c.courseid = ci.courseid
           LEFT JOIN lecture l ON c.courseid = l.courseid
           LEFT JOIN attendance a ON l.lectureid = a.lectureid AND a.usercourseid = uc.usercourseid
    WHERE u.staff = 0
      AND c.start_date <= DATE_ADD(CURDATE(), INTERVAL 1 MONTH)
      AND (
      (c.end_date IS NOT NULL AND c.end_date >= CURDATE())
        OR
      (c.end_date IS NULL AND c.start_date >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH))
      )
    GROUP BY u.userid, c.courseid
    HAVING attendance_percentage < ?
       AND total_lectures >= ?
    ORDER BY c.name, u.last_name, u.first_name
  `;

  const conn = await pool.getConnection();
  try {
    console.log('[weekly-attendance-report] Querying DB...');
    const [rows] = await conn.query(sql, [THRESHOLD, MIN_TOTAL_LECTURES]);
    const data = rows as Row[];

    if (data.length === 0) {
      const msg = `No students below ${THRESHOLD}% with at least ${MIN_TOTAL_LECTURES} lectures.`;
      console.log(msg);
      if (!DRY_RUN) {
        await sendMail({
          subject: `Attendance report: none < ${THRESHOLD}% (min ${MIN_TOTAL_LECTURES})`,
          text: msg
        });
        console.log('[weekly-attendance-report] Email sent (empty report).');
      }
      return;
    }

    // Group by course id for readability
    const byCourse = new Map<number, { header: string; items: Row[] }>();
    for (const r of data) {
      const key = r.courseid;
      const header = `${r.course_name ?? 'Course'} (${r.code ?? '-'}) [id ${r.courseid}]`;
      if (!byCourse.has(key)) byCourse.set(key, { header, items: [] });
      byCourse.get(key)!.items.push(r);
    }

    // Build plain text body
    let body = `Students below ${THRESHOLD}% attendance with at least ${MIN_TOTAL_LECTURES} lectures (per course):\n\n`;
    for (const { header, items } of byCourse.values()) {
      body += `${header}\n`;
      for (const r of items) {
        const pct = r.attendance_percentage ?? 0;
        const total = r.total_lectures ?? 0;
        const att = r.attended_lectures ?? 0;
        const grp = r.group_name ? `, group ${r.group_name}` : '';
        const email = r.email ?? '';
        const name = `${r.last_name ?? ''} ${r.first_name ?? ''}`.trim();
        const studentNum = r.studentnumber != null ? String(r.studentnumber) : '-';
        body += `- ${name} (user ${r.userid}, student ${studentNum}${grp}) — ${pct}% (${att}/${total}) — ${email}\n`;
      }
      body += `\n`;
    }

    // Prepare CSV attachment (only if we have data)
    let csv: string | null = null;
    if (data.length > 0) {
      const csvHeader = [
        'course_id','course_code','course_name',
        'user_id','studentnumber','last_name','first_name','group_name',
        'attendance_pct','attended','total','email','last_attendance_info'
      ].join(',');
      const csvLines = data.map(r => [
        r.courseid,
        safeCsv(r.code),
        safeCsv(r.course_name),
        r.userid,
        safeCsv(r.studentnumber),
        safeCsv(r.last_name),
        safeCsv(r.first_name),
        safeCsv(r.group_name),
        r.attendance_percentage ?? '',
        r.attended_lectures ?? '',
        r.total_lectures ?? '',
        safeCsv(r.email),
        safeCsv(r.last_attendance_info)
      ].join(','));
      csv = [csvHeader, ...csvLines].join('\n');
    }

    console.log(body);

    if (!DRY_RUN) {
      await sendMail({
        subject: `Attendance report: < ${THRESHOLD}% (min ${MIN_TOTAL_LECTURES})`,
        text: body,
        attachments: csv ? [{ filename: `attendance-below-${THRESHOLD}-min-${MIN_TOTAL_LECTURES}.csv`, content: csv }] : undefined
      });
      console.log('[weekly-attendance-report] Email sent.');
    } else {
      console.log('[weekly-attendance-report] DRY_RUN=1 — email not sent.');
    }
  } finally {
    conn.release();
    await pool.end();
    console.log('[weekly-attendance-report] Done.');
  }
}

//helpers
function safeCsv(v: unknown): string {
  // null/undefined -> empty quoted field
  if (v === null || v === undefined) return '""';

  // Date -> YYYY-MM-DD
  if (v instanceof Date) {
    const iso = v.toISOString().slice(0, 10);
    return `"${iso}"`;
  }

  // Other primitives/objects -> string + escape quotes
  const s = String(v).replace(/"/g, '""');
  return `"${s}"`;
}

async function sendMail(opts: { subject: string; text: string; attachments?: { filename: string; content: string }[] }) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: process.env.MAIL_TO,
    subject: opts.subject,
    text: opts.text,
    attachments: opts.attachments
  });
}

main().catch(err => {
  console.error('[weekly-attendance-report] Error:', err);
  process.exit(1);
});
