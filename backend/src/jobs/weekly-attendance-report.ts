// weekly-attendance-report.ts
// Weekly HTML attendance report + Excel attachment (.xlsx)
// Lists students with attendance% below THRESHOLD per course,
// only if total lectures >= MIN_TOTAL_LECTURES.

import 'dotenv/config';
import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';
import ExcelJS from 'exceljs';

// Settings
const THRESHOLD = Number(process.env.THRESHOLD ?? 70);
const MIN_TOTAL_LECTURES = Number(process.env.MIN_TOTAL_LECTURES ?? 5);
const DRY_RUN = process.env.DRY_RUN === '1';
const TODAY = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

// DB row type
type Row = {
  userid: number;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  studentnumber: number | string | null;

  courseid: number;
  code: string | null;
  course_name: string | null;
  group_name: string | null;

  total_lectures: number | null;
  attended_lectures: number | null;
  accepted_absences: number | null;
  unexcused_absences: number | null;
  attendance_percentage: number | null;
  last_attendance_info: Date | string | null;
};

async function main() {
  console.log(
    `[weekly-attendance-report] Start THRESHOLD=${THRESHOLD}% MIN_TOTAL_LECTURES=${MIN_TOTAL_LECTURES} DRY_RUN=${DRY_RUN}`
  );

  // DB connection
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER_GUEST,
    password: process.env.DB_PASS_GUEST,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5
  });

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

      COUNT(DISTINCT CASE WHEN a.status = 1 THEN l.lectureid END) AS attended_lectures,
      COUNT(DISTINCT CASE WHEN a.status = 2 THEN l.lectureid END) AS accepted_absences,

      (
        COUNT(DISTINCT l.lectureid)
          - COUNT(DISTINCT CASE WHEN a.status = 1 THEN l.lectureid END)
          - COUNT(DISTINCT CASE WHEN a.status = 2 THEN l.lectureid END)
        ) AS unexcused_absences,

      ROUND(
        COUNT(DISTINCT CASE WHEN a.status = 1 THEN l.lectureid END) * 100.0 /
        NULLIF(
          COUNT(DISTINCT l.lectureid)
            - COUNT(DISTINCT CASE WHEN a.status = 2 THEN l.lectureid END),
          0
        ),
        1
      ) AS attendance_percentage,

      MAX(l.start_date) AS last_attendance_info
    FROM users u
           JOIN usercourses uc ON u.userid = uc.userid
           JOIN courses c ON uc.courseid = c.courseid
           LEFT JOIN studentgroups sg ON u.studentgroupid = sg.studentgroupid
           JOIN courseinstructors ci ON c.courseid = ci.courseid
           LEFT JOIN lecture l ON c.courseid = l.courseid
           LEFT JOIN attendance a
                     ON l.lectureid = a.lectureid
                       AND a.usercourseid = uc.usercourseid
    WHERE u.staff = 0
      AND u.activeStatus = 1
      AND c.start_date <= DATE_ADD(CURDATE(), INTERVAL 1 MONTH)
      AND (
      (c.end_date IS NOT NULL AND c.end_date >= CURDATE())
        OR
      (c.end_date IS NULL AND c.start_date >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH))
      )
    GROUP BY u.userid, c.courseid
    HAVING attendance_percentage < ?
       AND total_lectures >= ?
    ORDER BY c.name, u.last_name, u.first_name;
  `;

  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(sql, [THRESHOLD, MIN_TOTAL_LECTURES]);
    const data = rows as Row[];

    if (data.length === 0) {
      const msg = `No students below ${THRESHOLD}% with at least ${MIN_TOTAL_LECTURES} lectures.`;

      if (!DRY_RUN) {
        await sendMail({
          subject: `Weekly Attendance Report — ${TODAY} — No Students Below Threshold`,
          text: msg,
          html: `<p>${escapeHtml(msg)}</p>`
        });
      }
      return;
    }

    // Group rows by course
    const byCourse = new Map<number, { header: string; items: Row[] }>();
    for (const r of data) {
      if (!byCourse.has(r.courseid)) {
        byCourse.set(r.courseid, {
          header: `${r.course_name ?? 'Course'} (${r.code ?? '-'})`,
          items: []
        });
      }
      byCourse.get(r.courseid)!.items.push(r);
    }

    // TEXT fallback
    let textBody =
      `Students below ${THRESHOLD}% attendance (min ${MIN_TOTAL_LECTURES} lectures)\n` +
      `Date: ${TODAY}\n\n`;

    for (const { header, items } of byCourse.values()) {
      textBody += `${header}\n`;
      for (const r of items) {
        const pct = r.attendance_percentage != null ? `${r.attendance_percentage}%` : '';
        textBody += ` - ${r.last_name} ${r.first_name} (${pct})\n`;
      }
      textBody += `\n`;
    }

    // HTML REPORT – light-theme friendly (works in dark mode too)
    let html = `
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            background: #ffffff;
            color: #000000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            margin: 20px;
            padding: 0;
          }
          h1 {
            font-size: 20px;
            font-weight: bold;
            margin: 0 0 10px 0;
            color: #000000;
          }
          h2 {
            font-size: 16px;
            margin: 25px 0 10px 0;
            color: #000000;
          }
          p {
            color: #333333;
            margin: 0 0 15px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
          }
          th, td {
            border: 1px solid #999999;
            padding: 8px 10px;
            text-align: left;
            font-size: 12px;
            color: #000000;
            background-color: #ffffff;
          }
          th {
            background-color: #f0f0f0;
            font-weight: bold;
          }
          .course-separator {
            margin-top: 25px;
          }
        </style>
      </head>
      <body>
        <h1>Weekly Attendance Report — ${TODAY}</h1>
        <p>Students below <strong>${THRESHOLD}%</strong> attendance (min <strong>${MIN_TOTAL_LECTURES}</strong> lectures).</p>
    `;

    for (const { header, items } of byCourse.values()) {
      html += `<div class="course-separator"></div>`;
      html += `<h2>${escapeHtml(header)}</h2>`;
      html += `
        <table>
          <thead>
            <tr>
              <th>Student number</th>
              <th>Last name</th>
              <th>First name</th>
              <th>Group</th>
              <th>Attendance %</th>
              <th>Attended</th>
              <th>Unexcused absences</th>
              <th>Accepted absences</th>
              <th>Total lectures</th>
              <th>Email</th>
              <th>Last attendance</th>
            </tr>
          </thead>
          <tbody>
      `;

      for (const r of items) {
        const pct = r.attendance_percentage != null ? `${r.attendance_percentage}%` : '';
        const lastInfo =
          r.last_attendance_info instanceof Date
            ? r.last_attendance_info.toISOString().slice(0, 10)
            : r.last_attendance_info ?? '';

        html += `
          <tr>
            <td>${escapeHtml(String(r.studentnumber ?? ''))}</td>
            <td>${escapeHtml(r.last_name ?? '')}</td>
            <td>${escapeHtml(r.first_name ?? '')}</td>
            <td>${escapeHtml(r.group_name ?? '')}</td>
            <td>${escapeHtml(pct)}</td>
            <td>${r.attended_lectures ?? ''}</td>
            <td>${r.unexcused_absences ?? ''}</td>
            <td>${r.accepted_absences ?? ''}</td>
            <td>${r.total_lectures ?? ''}</td>
            <td>${escapeHtml(r.email ?? '')}</td>
            <td>${escapeHtml(String(lastInfo))}</td>
          </tr>
        `;
      }

      html += `</tbody></table>`;
    }

    html += `</body></html>`;

    // Excel attachment
    const excelBuffer = await createAttendanceExcel(data);

    if (!DRY_RUN) {
      await sendMail({
        subject: `Weekly Attendance Report — Students Below ${THRESHOLD}% (Min ${MIN_TOTAL_LECTURES} Lectures) — ${TODAY}`,
        text: textBody,
        html,
        attachments: [
          {
            filename: `attendance-report-${TODAY}.xlsx`,
            content: excelBuffer
          }
        ]
      });
    }
  } finally {
    conn.release();
    await pool.end();
    console.log('[weekly-attendance-report] Done.');
  }
}

// ---------------------------------------------------------------------------
// Excel generation
// ---------------------------------------------------------------------------

async function createAttendanceExcel(data: Row[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Attendance Report');

  // Group by course
  const courses = new Map<number, Row[]>();
  for (const r of data) {
    if (!courses.has(r.courseid)) courses.set(r.courseid, []);
    courses.get(r.courseid)!.push(r);
  }

  let rowIndex = 1;

  for (const rows of courses.values()) {
    const c = rows[0];
    const title = `${c.course_name ?? 'Course'} (${c.code ?? '-'})`;

    worksheet.mergeCells(rowIndex, 1, rowIndex, 11);
    const titleCell = worksheet.getCell(rowIndex, 1);
    titleCell.value = title;
    titleCell.font = { bold: true, size: 14 };
    rowIndex++;

    const headers = [
      'studentnumber',
      'last_name',
      'first_name',
      'group_name',
      'attendance_percentage',
      'attended',
      'unexcused_absences',
      'accepted_absences',
      'total_lectures',
      'email',
      'last_attendance_info'
    ];

    worksheet.addRow(headers);
    worksheet.getRow(rowIndex).font = { bold: true };
    rowIndex++;

    for (const r of rows) {
      worksheet.addRow([
        r.studentnumber ?? '',
        r.last_name ?? '',
        r.first_name ?? '',
        r.group_name ?? '',
        r.attendance_percentage != null ? `${r.attendance_percentage}%` : '',
        r.attended_lectures ?? '',
        r.unexcused_absences ?? '',
        r.accepted_absences ?? '',
        r.total_lectures ?? '',
        r.email ?? '',
        r.last_attendance_info instanceof Date
          ? r.last_attendance_info.toISOString().slice(0, 10)
          : r.last_attendance_info ?? ''
      ]);
      rowIndex++;
    }

    rowIndex++;
  }

  worksheet.columns.forEach((col: any) => {
    if (!col) return;
    let max = 12;
    col.eachCell?.({ includeEmpty: true }, (cell: any) => {
      const val = cell.value ?? '';
      const s = typeof val === 'string' ? val : val.toString();
      max = Math.max(max, s.length);
    });
    col.width = max + 2;
  });

  const bytes = await workbook.xlsx.writeBuffer();
  return Buffer.from(bytes);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------------------------------------------------------------------------
// Email sending
// ---------------------------------------------------------------------------

async function sendMail(opts: {
  subject: string;
  text: string;
  html: string;
  attachments?: { filename: string; content: Buffer }[];
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM, // e.g. "Metropolia Attend — Läsnäoloraportit <attendreporter@gmail.com>"
    to: process.env.MAIL_TO,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
    attachments: opts.attachments
  });
}

main().catch(err => {
  console.error('[weekly-attendance-report] Error:', err);
  process.exit(1);
});
