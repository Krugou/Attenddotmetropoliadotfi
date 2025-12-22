import { FieldPacket, ResultSetHeader, RowDataPacket } from 'mysql2';
import createPool from '../config/createPool.js';

const pool = createPool('ADMIN');

// Helpers
// Generic SELECT helper — returns rows + field metadata
const query = <T extends RowDataPacket[]>(
  sql: string,
  params: any[] = [],
): Promise<[T, FieldPacket[]]> => pool.promise().query<T>(sql, params);

// Types
interface Course {
  courseid?: number;
  name: string;
  start_date: Date;
  end_date: Date;
  code: string;
  studentgroupid: number;
  instructoremail: string;
}

interface CourseResults {
  courseid?: number;
  name: string;
  start_date: Date;
  end_date: Date;
  code: string;
  student_group: string;
  topics: string[];
  instructors: string[];
}

interface CourseModel {
  findCourseIdUsingCourseCode(coursecode: string): Promise<RowDataPacket[]>;
  fetchAllCourses(): Promise<RowDataPacket[]>;
  findByCourseId(id: number): Promise<Course | null>;
  deleteByCourseId(id: number): Promise<void>;
  updateCourseDetails(
    id: number,
    name: string,
    start_date: Date,
    end_date: Date,
    code: string,
    studentgroupid: number,
  ): Promise<void>;
  findByCode(code: string): Promise<Course | null>;
  getCoursesByInstructorEmail(email: string): Promise<Course[]>;
  countCourses(): Promise<number>;
  getCoursesByCourseId(courseId: number): Promise<Course[]>;
  insertCourse(
    name: string,
    startDateString: string,
    endDateString: string,
    code: string,
    studentGroupId: number,
  ): Promise<ResultSetHeader>;
  getStudentsCourses(email: string): Promise<Course[]>;
  deleteCourse(courseId: number): Promise<string | undefined>;
  updateCourseInfo(
    courseid: number,
    name: string,
    start_date: Date,
    end_date: Date,
    code: string,
    studentgroupname: string,
    instructors: string[],
    topic_names: string[],
  ): Promise<RowDataPacket[]>;
  getCoursesWithDetails(): Promise<CourseResults[]>;
  getAllStudentsOnCourse(courseId: string): Promise<RowDataPacket[]>;
  updateStudentCourses(courseid: number, studentid: number): Promise<Course[]>;
}

// Model
const course: CourseModel = {
  // Get all courses with group name and aggregated topic names
  async fetchAllCourses() {
    try {
      console.log('row 187, coursemodel.ts, fetching all courses');
      const [rows] = await query<RowDataPacket[]>(
        `SELECT courses.*, studentgroups.group_name AS studentgroup_name,
                GROUP_CONCAT(DISTINCT topics.topicname) AS topic_names
         FROM courses
                JOIN courseinstructors ON courses.courseid = courseinstructors.courseid
                JOIN users ON courseinstructors.userid = users.userid
                LEFT JOIN studentgroups ON courses.studentgroupid = studentgroups.studentgroupid
                LEFT JOIN coursetopics ON courses.courseid = coursetopics.courseid
                LEFT JOIN topics ON coursetopics.topicid = topics.topicid
         GROUP BY courses.courseid`,
      );
      return rows;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  // Find a single course by ID
  async findByCourseId(id) {
    try {
      console.log('row 213, coursemodel.ts, fetching course by id');
      const [rows] = await query<RowDataPacket[]>(
        'SELECT * FROM courses WHERE courseid = ?',
        [id],
      );
      return (rows[0] as Course) || null;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  // Get courses taught by a specific instructor email
  async getCoursesByInstructorEmail(email) {
    try {
      console.log('row 233, coursemodel.ts, fetching courses by instructor email');
      const [rows] = await query<RowDataPacket[]>(
        `SELECT courses.*, studentgroups.group_name AS studentgroup_name,
                GROUP_CONCAT(topics.topicname) AS topic_names
         FROM courses
                JOIN courseinstructors ON courses.courseid = courseinstructors.courseid
                JOIN users ON courseinstructors.userid = users.userid
                LEFT JOIN studentgroups ON courses.studentgroupid = studentgroups.studentgroupid
                LEFT JOIN coursetopics ON courses.courseid = coursetopics.courseid
                LEFT JOIN topics ON coursetopics.topicid = topics.topicid
         WHERE users.email = ?
         GROUP BY courses.courseid`,
        [email],
      );
      return rows as Course[];
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  // Delete a course by ID (no return value)
  async deleteByCourseId(id) {
    try {
      console.log('row 262, coursemodel.ts, deleting course by id');
      await query('DELETE FROM courses WHERE courseid = ?', [id]);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  // Update base course fields
  async updateCourseDetails(id, name, start_date, end_date, code, studentgroupid) {
    try {
      console.log('row 291, coursemodel.ts, updating course details');
      await query(
        'UPDATE courses SET name = ?, start_date = ?, end_date = ?, code = ?, studentgroupid = ? WHERE courseid = ?',
        [name, start_date, end_date, code, studentgroupid, id],
      );
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  // Count all courses
  async countCourses() {
    try {
      console.log('row 310, coursemodel.ts, counting courses');
      const [rows] = await query<RowDataPacket[]>(
        'SELECT COUNT(*) as count FROM courses',
      );
      return (rows[0] as any).count as number;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  // Find a course by code (unique guard)
  async findByCode(code: string) {
    try {
      console.log('row 328, coursemodel.ts, fetching course by code');
      const [rows] = await query<RowDataPacket[]>(
        'SELECT * FROM courses WHERE code = ?',
        [code],
      );
      return rows[0] ? (rows[0] as Course) : null;
    } catch (error) {
      console.error(error);
      throw new Error('Database query failed');
    }
  },

  // Resolve courseid from code
  async findCourseIdUsingCourseCode(coursecode) {
    console.log('row 345, coursemodel.ts, finding course id using course code');
    const [courseResult] = await query<RowDataPacket[]>(
      'SELECT courseid FROM courses WHERE code = ?',
      [coursecode],
    );
    return courseResult;
  },

  // Get a single course with aggregates and instructor list by courseId
  async getCoursesByCourseId(courseId) {
    try {
      console.log('row 361, coursemodel.ts, fetching courses by course id');
      const [rows] = await query<RowDataPacket[]>(
        `SELECT courses.*, studentgroups.group_name AS studentgroup_name,
                GROUP_CONCAT(DISTINCT topics.topicname) AS topic_names,
                (SELECT COUNT(DISTINCT userid) FROM usercourses WHERE courseid = ?) AS user_count,
                GROUP_CONCAT(DISTINCT u2.email) AS instructor_name
         FROM courses
                JOIN studentgroups ON courses.studentgroupid = studentgroups.studentgroupid
                LEFT JOIN courseinstructors ci ON courses.courseid = ci.courseid
                LEFT JOIN users u2 ON ci.userid = u2.userid
                LEFT JOIN coursetopics ON courses.courseid = coursetopics.courseid
                LEFT JOIN topics ON coursetopics.topicid = topics.topicid
                LEFT JOIN usercourses ON courses.courseid = usercourses.courseid
         WHERE courses.courseid = ?
         GROUP BY courses.courseid;`,
        [courseId, courseId],
      );
      return rows as Course[];
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  // Insert a new course (returns ResultSetHeader with insertId)
  async insertCourse(name, startDateString, endDateString, code, studentGroupId) {
    console.log('row 401, coursemodel.ts, inserting course');
    const [courseResult] = await pool
      .promise()
      .query<ResultSetHeader>(
        'INSERT INTO courses (name, start_date, end_date, code, studentgroupid) VALUES (?, ?, ?, ?, ?)',
        [name, startDateString, endDateString, code, studentGroupId],
      );
    return courseResult;
  },

  // Get all courses for a student by their email (with selected topics and instructors)
  async getStudentsCourses(email: string) {
    try {
      console.log("row 419, coursemodel.ts, fetching student's courses");
      const [rows] = await query<RowDataPacket[]>(
        `SELECT
           u.email,
           c.courseid,
           c.name AS course_name,
           c.start_date AS startDate,
           c.end_date AS endDate,
           c.code AS code,
           sg.group_name AS student_group,
           uc.usercourseid,
           GROUP_CONCAT(DISTINCT t_selected.topicname) AS selected_topics,
           GROUP_CONCAT(DISTINCT t.topicname) AS topic_names,
           GROUP_CONCAT(DISTINCT u2.email) AS instructor_name
         FROM users u
                JOIN usercourses uc ON u.userid = uc.userid
                JOIN courses c ON uc.courseid = c.courseid
                LEFT JOIN studentgroups sg ON c.studentgroupid = sg.studentgroupid
                LEFT JOIN coursetopics ct ON c.courseid = ct.courseid
                LEFT JOIN topics t ON ct.topicid = t.topicid
                LEFT JOIN usercourse_topics ut ON uc.usercourseid = ut.usercourseid
                LEFT JOIN courseinstructors ci ON c.courseid = ci.courseid
                LEFT JOIN users u2 ON ci.userid = u2.userid
                LEFT JOIN topics t_selected ON ut.topicid = t_selected.topicid
         WHERE u.email = ?
         GROUP BY c.courseid;`,
        [email],
      );
      return rows as Course[];
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  // Delete a course and return a stringified boolean if deletion happened
  async deleteCourse(courseId: number) {
    try {
      console.log('row 473, coursemodel.ts, deleting course');
      const [result] = await query(
        'DELETE FROM courses WHERE courseid = ?',
        [courseId],
      );
      if ('affectedRows' in (result as unknown as ResultSetHeader)) {
        return ((result as unknown as ResultSetHeader).affectedRows > 0).toString();
      }
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  // Transactional update: topics, instructors, student group, and base course fields
  async updateCourseInfo(
    courseid,
    name,
    start_date,
    end_date,
    code,
    studentgroupname,
    instructors,
    topic_names,
  ) {
    let studentgroupid: string | undefined = '';
    const connection = await pool.promise().getConnection();
    await connection.beginTransaction();

    try {
      console.log('row 518, coursemodel.ts, updating course info');

      // Replace course topics
      if (topic_names.length > 0) {
        await connection.query(`DELETE FROM coursetopics WHERE courseid = ?`, [courseid]);

        console.log('row 527, coursemodel.ts, inserting new topics');
        for (const topic of topic_names) {
          const [rows] = await connection.query<RowDataPacket[]>(
            `SELECT * FROM topics WHERE topicname = ?`,
            [topic],
          );
          if (rows.length === 0) {
            console.log('row 534, coursemodel.ts, if rows.length === 0 insert topic');
            await connection.query(`INSERT INTO topics (topicname) VALUES (?)`, [topic]);
          }

          console.log('row 542, coursemodel.ts, getting topicid');
          const [rows2] = await connection.query<RowDataPacket[]>(
            `SELECT topicid FROM topics WHERE topicname = ?`,
            [topic],
          );
          const topicid = rows2[0].topicid;

          console.log('row 550, coursemodel.ts, inserting topic into course');
          await connection.query(
            `INSERT INTO coursetopics (courseid, topicid) VALUES (?, ?)`,
            [courseid, topicid],
          );
        }
      }

      // Replace course instructors
      if (instructors) {
        console.log('row 559, coursemodel.ts, if there is instructors, delete from courseinstructors');
        await connection.query(`DELETE FROM courseinstructors WHERE courseid = ?`, [courseid]);

        console.log('row 567, coursemodel.ts, inserting new instructors');
        for (const instructor of instructors) {
          const [rows] = await connection.query<RowDataPacket[]>(
            `SELECT userid FROM users WHERE email = ? AND staff = 1`,
            [instructor],
          );
          if (rows.length === 0) {
            throw new Error(`Teacher's email was not found or the user is not a member of staff`);
          }
          const userid = rows[0].userid;
          await connection.query(
            `INSERT INTO courseinstructors (userid, courseid) VALUES (?, ?)`,
            [userid, courseid],
          );
        }
      }

      // Resolve student group id (if name provided)
      if (studentgroupname) {
        console.log('row 587, coursemodel.ts, if there is studentgroupname, select studentgroupid');
        const [rows] = await connection.query<RowDataPacket[]>(
          `SELECT studentgroupid FROM studentgroups WHERE group_name = ?`,
          [studentgroupname],
        );
        if (rows.length === 0) {
          throw new Error(`No student group found with name ${studentgroupname}`);
        }
        studentgroupid = rows[0].studentgroupid;
      }

      // Update base course row
      console.log('row 602, coursemodel.ts, updating course info');
      const [rows] = await connection.query<RowDataPacket[]>(
        `UPDATE courses SET name = ?, start_date = ?, end_date = ?, code = ?, studentgroupid = ? WHERE courseid = ?`,
        [name, start_date, end_date, code, studentgroupid, courseid],
      );

      console.log('row 608, coursemodel.ts, committing transaction');
      await connection.commit();
      return rows;
    } catch (error) {
      await connection.rollback();
      console.error(error);
      return Promise.reject(error);
    } finally {
      connection.release();
    }
  },

  // Get a denormalized view of courses with topics and instructors
  async getCoursesWithDetails() {
    try {
      console.log('row 628, coursemodel.ts, fetching courses with details');
      const [rows] = await query<RowDataPacket[]>(
        `SELECT
           courses.courseid,
           courses.name,
           courses.start_date,
           courses.end_date,
           courses.code,
           studentgroups.group_name AS student_group,
           topics.topicname,
           instructors.email AS instructor_email
         FROM courses
                LEFT JOIN studentgroups ON courses.studentgroupid = studentgroups.studentgroupid
                LEFT JOIN coursetopics ON courses.courseid = coursetopics.courseid
                LEFT JOIN topics ON coursetopics.topicid = topics.topicid
                LEFT JOIN courseinstructors ON courses.courseid = courseinstructors.courseid
                LEFT JOIN users AS instructors ON courseinstructors.userid = instructors.userid;`,
      );

      // Reduce flat rows into aggregated CourseResults[]
      console.log('row 400, coursemodel.ts, pushing courses into array');
      const courses = rows.reduce((acc: CourseResults[], row: any) => {
        const courseIndex = acc.findIndex(
          (course) => course.courseid === row.courseid,
        );

        if (courseIndex === -1) {
          acc.push({
            courseid: row.courseid,
            name: row.name,
            start_date: row.start_date,
            end_date: row.end_date,
            code: row.code,
            student_group: row.student_group,
            topics: [row.topicname],
            instructors: [row.instructor_email],
          });
        } else {
          acc[courseIndex].topics.push(row.topicname);
          if (!acc[courseIndex].instructors.includes(row.instructor_email)) {
            acc[courseIndex].instructors.push(row.instructor_email);
          }
        }
        return acc;
      }, []);
      return courses;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  // All students enrolled in a specific course
  async getAllStudentsOnCourse(courseId: string) {
    try {
      console.log('row 697, coursemodel.ts, fetching all students on course');
      const [rows] = await query<RowDataPacket[]>(
        `SELECT
           users.email,
           users.first_name,
           users.last_name,
           users.studentnumber,
           users.activeStatus,
           usercourses.usercourseid,
           users.userid,
           users.created_at
         FROM users
                JOIN usercourses ON users.userid = usercourses.userid
                JOIN courses ON usercourses.courseid = courses.courseid
         WHERE courses.courseid = ?;`,
        [courseId],
      );
      return rows as RowDataPacket[];
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  // Enroll a student into a course (creates usercourses row)
  async updateStudentCourses(courseid: number, studentid: number) {
    try {
      console.log('row 734, coursemodel.ts, updating student courses');
      const [rows] = await query(
        'INSERT INTO usercourses (courseid, userid) VALUES (?, ?)',
        [courseid, studentid],
      );
      return rows as unknown as Course[];
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
};

export default course;
