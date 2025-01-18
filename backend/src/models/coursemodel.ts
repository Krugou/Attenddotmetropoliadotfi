import {FieldPacket, ResultSetHeader, RowDataPacket} from 'mysql2';
import createPool from '../config/createPool.js';

const pool = createPool('ADMIN');
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
  /**
   * Fetches the course ID using the course code.
   *
   * @param {string} coursecode - The code of the course.
   * @returns {Promise<RowDataPacket[]>} A promise that resolves with the course ID.
   */
  findCourseIdUsingCourseCode(coursecode: string): Promise<RowDataPacket[]>;
  getStudentsCourses(email: string): unknown;
  /**
   * Fetches all courses.
   *
   * @returns {Promise<RowDataPacket[]>} A promise that resolves with all courses.
   */
  fetchAllCourses: () => Promise<RowDataPacket[]>;
  /**
   * Fetches a course by its ID.
   *
   * @param {number} id - The ID of the course.
   * @returns {Promise<Course | null>} A promise that resolves with the course or null if not found.
   */
  findByCourseId: (id: number) => Promise<Course | null>;
  /**
   * Deletes a course by its ID.
   *
   * @param {number} id - The ID of the course.
   * @returns {Promise<void>} A promise that resolves when the deletion is complete.
   */
  deleteByCourseId: (id: number) => Promise<void>;
  /**
   * Updates the details of a course.
   *
   * @param {number} id - The ID of the course.
   * @param {string} name - The new name of the course.
   * @param {Date} start_date - The new start date of the course.
   * @param {Date} end_date - The new end date of the course.
   * @param {string} code - The new code of the course.
   * @param {number} studentgroupid - The new student group ID of the course.
   * @returns {Promise<void>} A promise that resolves when the update is complete.
   */
  updateCourseDetails: (
    id: number,
    name: string,
    start_date: Date,
    end_date: Date,
    code: string,
    studentgroupid: number,
  ) => Promise<void>;
  /**
   * Fetches a course by its code.
   *
   * @param {string} code - The code of the course.
   * @returns {Promise<Course | null>} A promise that resolves with the course or null if not found.
   */
  findByCode: (code: string) => Promise<Course | null>;
  /**
   * Fetches all courses by the instructor's email.
   *
   * @param {string} email - The email of the instructor.
   * @returns {Promise<Course[]>} A promise that resolves with all courses taught by the instructor.
   */
  getCoursesByInstructorEmail(email: string): Promise<Course[]>;
  /**
   * Counts all courses.
   *
   * @returns {Promise<number>} A promise that resolves with the number of courses.
   */
  countCourses(): Promise<number>;
  /**
   * Fetches the courses by course ID.
   *
   * @param {number} courseId - The ID of the course.
   * @returns {Promise<Course[]>} A promise that resolves with the courses.
   */
  getCoursesByCourseId(courseId: number): Promise<Course[]>;
  /**
   * Inserts a new course.
   *
   * @param {string} name - The name of the course.
   * @param {string} startDateString - The start date of the course.
   * @param {string} endDateString - The end date of the course.
   * @param {string} code - The code of the course.
   * @param {number} studentGroupId - The ID of the student group.
   * @returns {Promise<ResultSetHeader>} A promise that resolves with the result of the insertion.
   */
  insertCourse(
    name: string,
    startDateString: string,
    endDateString: string,
    code: string,
    studentGroupId: number,
  ): Promise<ResultSetHeader>;
  /**
   * Fetches the courses of a student.
   *
   * @param {string} email - The email of the student.
   * @returns {Promise<Course[]>} A promise that resolves with the courses of the student.
   */
  getStudentsCourses(email: string): Promise<Course[]>;
  /**
   * Deletes a course.
   *
   * @param {number} courseId - The ID of the course.
   * @returns {Promise<string | undefined>} A promise that resolves with a success message or undefined.
   */
  deleteCourse(courseId: number): Promise<string | undefined>;
  /**
   * Updates the information of a course.
   *
   * @param {number} courseid - The ID of the course.
   * @param {string} name - The new name of the course.
   * @param {Date} start_date - The new start date of the course.
   * @param {Date} end_date - The new end date of the course.
   * @param {string} code - The new code of the course.
   * @param {string} studentgroupname - The new name of the student group.
   * @param {string[]} instructors - The new instructors of the course.
   * @param {string[]} topic_names - The new topics of the course.
   * @returns {Promise<RowDataPacket[]>} A promise that resolves when the update is complete.
   */
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
  /**
   * Fetches all courses with their details.
   *
   * @returns {Promise<CourseResults[]>} A promise that resolves with all courses and their details.
   */
  getCoursesWithDetails(): Promise<CourseResults[]>;
  /**
   * Fetches all students enrolled in a specific course.
   *
   * @param {string} courseId - The ID of the course.
   * @returns {Promise<RowDataPacket[]>} A promise that resolves with all students in the course.
   */
  getAllStudentsOnCourse(courseId: string): Promise<RowDataPacket[]>;
  /**
   * Updates the courses for a student.
   *
   * @param {number} courseid - The ID of the course.
   * @param {number} studentid - The ID of the student.
   * @returns {Promise<Course[]>} A promise that resolves when the update is complete.
   */
  updateStudentCourses: (
    courseid: number,
    studentid: number,
  ) => Promise<Course[]>;
}
const course: CourseModel = {
  /**
   * Fetches all courses.
   *
   * @returns {Promise<RowDataPacket[]>} A promise that resolves with all courses.
   */
  async fetchAllCourses() {
    try {
      const [rows] = await pool.promise().query<
        RowDataPacket[]
      >(`SELECT courses.*, studentgroups.group_name AS studentgroup_name,
				GROUP_CONCAT(topics.topicname) AS topic_names
		FROM courses
		JOIN courseinstructors ON courses.courseid = courseinstructors.courseid
		JOIN users ON courseinstructors.userid = users.userid
		LEFT JOIN studentgroups ON courses.studentgroupid = studentgroups.studentgroupid
		LEFT JOIN coursetopics ON courses.courseid = coursetopics.courseid
		LEFT JOIN topics ON coursetopics.topicid = topics.topicid
		GROUP BY courses.courseid`);
      return rows;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Fetches a course by its ID.
   *
   * @param {number} id - The ID of the course.
   * @returns {Promise<Course | null>} A promise that resolves with the course or null if not found.
   */
  async findByCourseId(id) {
    try {
      const [rows] = await pool
        .promise()
        .query<RowDataPacket[]>('SELECT * FROM courses WHERE courseid = ?', [
          id,
        ]);
      return (rows[0] as Course) || null;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Fetches all courses by the instructor's email.
   *
   * @param {string} email - The email of the instructor.
   * @returns {Promise<Course[]>} A promise that resolves with all courses taught by the instructor.
   */
  async getCoursesByInstructorEmail(email) {
    try {
      const [rows] = await pool.promise().query<RowDataPacket[]>(
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
  /**
   * Deletes a course by its ID.
   *
   * @param {number} id - The ID of the course.
   * @returns {Promise<void>} A promise that resolves when the deletion is complete.
   */
  async deleteByCourseId(id) {
    try {
      await pool
        .promise()
        .query('DELETE FROM courses WHERE courseid = ?', [id]);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Updates the details of a course.
   *
   * @param {number} id - The ID of the course.
   * @param {string} name - The new name of the course.
   * @param {Date} start_date - The new start date of the course.
   * @param {Date} end_date - The new end date of the course.
   * @param {string} code - The new code of the course.
   * @param {number} studentgroupid - The new student group ID of the course.
   * @returns {Promise<void>} A promise that resolves when the update is complete.
   */
  async updateCourseDetails(
    id,
    name,
    start_date,
    end_date,
    code,
    studentgroupid,
  ) {
    try {
      await pool
        .promise()
        .query(
          'UPDATE courses SET name = ?, start_date = ?, end_date = ?, code = ?, studentgroupid = ? WHERE courseid = ?',
          [name, start_date, end_date, code, studentgroupid, id],
        );
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Counts all courses.
   *
   * @returns {Promise<number>} A promise that resolves with the number of courses.
   */
  async countCourses() {
    try {
      const [rows] = await pool
        .promise()
        .query<RowDataPacket[]>('SELECT COUNT(*) as count FROM courses');
      return rows[0].count;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Fetches a course by its code.
   *
   * @param {string} code - The code of the course.
   * @returns {Promise<Course | null>} A promise that resolves with the course or null if not found.
   */
  async findByCode(code: string): Promise<Course | null> {
    try {
      const [rows] = await pool
        .promise()
        .query<RowDataPacket[]>('SELECT * FROM courses WHERE code = ?', [code]);
      return rows[0] ? (rows[0] as Course) : null;
    } catch (error) {
      console.error(error);
      throw new Error('Database query failed');
    }
  },
  /**
   * Fetches the course ID using the course code.
   *
   * @param {string} coursecode - The code of the course.
   * @returns {Promise<RowDataPacket[]>} A promise that resolves with the course ID.
   */
  async findCourseIdUsingCourseCode(coursecode) {
    const [courseResult] = await pool
      .promise()
      .query<RowDataPacket[]>('SELECT courseid FROM courses WHERE code = ?', [
        coursecode,
      ]);
    return courseResult;
  },
  /**
   * Fetches the courses by course ID.
   *
   * @param {number} courseId - The ID of the course.
   * @returns {Promise<Course[]>} A promise that resolves with the courses.
   */
  async getCoursesByCourseId(courseId) {
    try {
      const [rows] = await pool.promise().query<RowDataPacket[]>(
        `SELECT courses.*, studentgroups.group_name AS studentgroup_name,
            GROUP_CONCAT(DISTINCT topics.topicname) AS topic_names,
            (SELECT COUNT(DISTINCT userid) FROM usercourses WHERE courseid = ?) AS user_count,
            GROUP_CONCAT(DISTINCT u2.email) AS instructor_name FROM courses
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
  /**
   * Inserts a new course.
   *
   * @param {string} name - The name of the course.
   * @param {string} startDateString - The start date of the course.
   * @param {string} endDateString - The end date of the course.
   * @param {string} code - The code of the course.
   * @param {number} studentGroupId - The ID of the student group.
   * @returns {Promise<ResultSetHeader>} A promise that resolves with the result of the insertion.
   */
  async insertCourse(
    name: string,
    startDateString: string,
    endDateString: string,
    code: string,
    studentGroupId: number,
  ) {
    const [courseResult] = await pool
      .promise()
      .query<ResultSetHeader>(
        'INSERT INTO courses (name, start_date, end_date, code, studentgroupid) VALUES (?, ?, ?, ?, ?)',
        [name, startDateString, endDateString, code, studentGroupId],
      );

    return courseResult;
  },
  /**
   * Fetches the courses of a student.
   *
   * @param {string} email - The email of the student.
   * @returns {Promise<Course[]>} A promise that resolves with the courses of the student.
   */
  async getStudentsCourses(email: string) {
    try {
      const [rows] = await pool.promise().query<RowDataPacket[]>(
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
		FROM
				users u
		JOIN
				usercourses uc ON u.userid = uc.userid
		JOIN
				courses c ON uc.courseid = c.courseid
		LEFT JOIN
				studentgroups sg ON c.studentgroupid = sg.studentgroupid
		LEFT JOIN
				coursetopics ct ON c.courseid = ct.courseid
		LEFT JOIN
				topics t ON ct.topicid = t.topicid
		LEFT JOIN
				usercourse_topics ut ON uc.usercourseid = ut.usercourseid
		LEFT JOIN
				courseinstructors ci ON c.courseid = ci.courseid
		LEFT JOIN
				users u2 ON ci.userid = u2.userid
		LEFT JOIN
				topics t_selected ON ut.topicid = t_selected.topicid
		WHERE
				u.email = ?
		GROUP BY
				c.courseid;`,
        [email],
      );
      return rows as Course[];
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Deletes a course.
   *
   * @param {number} courseId - The ID of the course.
   * @returns {Promise<string | undefined>} A promise that resolves with a success message or undefined.
   */
  async deleteCourse(courseId: number): Promise<string | undefined> {
    try {
      // Disable foreign key checks
      // Delete the course
      const [result] = await pool
        .promise()
        .query('DELETE FROM courses WHERE courseid = ?', [courseId]);

      if ('affectedRows' in result) {
        // Return a success message
        return (result.affectedRows > 0).toString();
      }
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  /**
   * Updates the information of a course.
   *
   * @param {number} courseid - The ID of the course.
   * @param {string} name - The new name of the course.
   * @param {Date} start_date - The new start date of the course.
   * @param {Date} end_date - The new end date of the course.
   * @param {string} code - The new code of the course.
   * @param {string} studentgroupname - The new name of the student group.
   * @param {string[]} instructors - The new instructors of the course.
   * @param {string[]} topic_names - The new topics of the course.
   * @returns {Promise<RowDataPacket[]>} A promise that resolves when the update is complete.
   */
  async updateCourseInfo(
    courseid: number,
    name: string,
    start_date: Date,
    end_date: Date,
    code: string,
    studentgroupname: string,
    instructors: string[],
    topic_names: string[],
  ): Promise<RowDataPacket[]> {
    let studentgroupid: string | undefined = '';
    const connection = await pool.promise().getConnection();
    await connection.beginTransaction();

    try {
      // Get the topic group id if the topic group name is provided
      if (topic_names.length > 0) {
        // Delete all topics from the course
        await connection.query(`DELETE FROM coursetopics WHERE courseid = ?`, [
          courseid,
        ]);

        // Insert the new topics into database if they don't exist
        for (const topic of topic_names) {
          const [rows] = await connection.query<RowDataPacket[]>(
            `SELECT * FROM topics WHERE topicname = ?`,
            [topic],
          );
          if (rows.length === 0) {
            await connection.query(
              `INSERT INTO topics (topicname) VALUES (?)`,
              [topic],
            );
          }

          // Select the topicid for each topic name
          const [rows2] = await connection.query<RowDataPacket[]>(
            `SELECT topicid FROM topics WHERE topicname = ?`,
            [topic],
          );
          const topicid = rows2[0].topicid;

          // Insert the new topics into the course
          await connection.query(
            `INSERT INTO coursetopics (courseid, topicid) VALUES (?, ?)`,
            [courseid, topicid],
          );
        }
      }

      if (instructors) {
        // Delete all instructors from the course
        await connection.query(
          `DELETE FROM courseinstructors WHERE courseid = ?`,
          [courseid],
        );

        // Insert the new instructors into the course
        for (const instructor of instructors) {
          const [rows] = await connection.query<RowDataPacket[]>(
            `SELECT userid FROM users WHERE email = ? AND staff = 1`,
            [instructor],
          );
          if (rows.length === 0) {
            throw new Error(
              `Teacher's email was not found or the user is not a member of staff`,
            );
          }
          const userid = rows[0].userid;
          await connection.query(
            `INSERT INTO courseinstructors (userid, courseid) VALUES (?, ?)`,
            [userid, courseid],
          );
        }
      }

      // Get the student group id if the student group name is provided
      if (studentgroupname) {
        const [rows] = await connection.query<RowDataPacket[]>(
          `SELECT studentgroupid FROM studentgroups WHERE group_name = ?`,
          [studentgroupname],
        );
        if (rows.length === 0) {
          throw new Error(
            `No student group found with name ${studentgroupname}`,
          );
        }
        studentgroupid = rows[0].studentgroupid;
      }

      // Update the course info
      const [rows] = await connection.query<RowDataPacket[]>(
        `UPDATE courses SET name = ?, start_date = ?, end_date = ?, code = ?, studentgroupid = ? WHERE courseid = ?`,
        [name, start_date, end_date, code, studentgroupid, courseid],
      );

      await connection.commit();

      // q: if i return here, does the finally block still run?
      return rows;
    } catch (error) {
      await connection.rollback();
      console.error(error);
      return Promise.reject(error);
    } finally {
      connection.release();
    }
  },
  /**
   * Fetches all courses with their details.
   *
   * @returns {Promise<CourseResults[]>} A promise that resolves with all courses and their details.
   */
  async getCoursesWithDetails(): Promise<CourseResults[]> {
    try {
      const [rows]: [RowDataPacket[], FieldPacket[]] = await pool.promise()
        .query<RowDataPacket[]>(`
        SELECT
            courses.courseid,
            courses.name,
            courses.start_date,
            courses.end_date,
            courses.code,
            studentgroups.group_name AS student_group,
            topics.topicname,
            instructors.email AS instructor_email
        FROM
            courses
        LEFT JOIN
            studentgroups ON courses.studentgroupid = studentgroups.studentgroupid
        LEFT JOIN
            coursetopics ON courses.courseid = coursetopics.courseid
        LEFT JOIN
            topics ON coursetopics.topicid = topics.topicid
        LEFT JOIN
            courseinstructors ON courses.courseid = courseinstructors.courseid
        LEFT JOIN
            users AS instructors ON courseinstructors.userid = instructors.userid;
    `);

      // Transform the flat data structure into a nested one
      const courses = rows.reduce((acc: CourseResults[], row) => {
        const courseIndex = acc.findIndex(
          (course: CourseResults) => course.courseid === row.courseid,
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
  /**
   * Fetches all students enrolled in a specific course.
   *
   * @param {string} courseId - The ID of the course.
   * @returns {Promise<RowDataPacket[]>} A promise that resolves with all students in the course.
   */
  async getAllStudentsOnCourse(courseId: string): Promise<RowDataPacket[]> {
    try {
      const [rows] = await pool.promise().query(
        `SELECT
								users.email,
								users.first_name,
								users.last_name,
								users.studentnumber,
                users.activeStatus,
								usercourses.usercourseid,
								users.userid,
								users.created_at
						FROM
								users
						JOIN
								usercourses ON users.userid = usercourses.userid
						JOIN
								courses ON usercourses.courseid = courses.courseid
						WHERE
								courses.courseid = ?;`,
        [courseId],
      );

      return rows as RowDataPacket[];
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Updates the courses for a student.
   *
   * @param {number} courseid - The ID of the course.
   * @param {number} studentid - The ID of the student.
   * @returns {Promise<Course[]>} A promise that resolves when the update is complete.
   */
  async updateStudentCourses(courseid: number, studentid: number) {
    try {
      const [rows] = await pool
        .promise()
        .query('INSERT INTO usercourses (courseid, userid) VALUES (?, ?)', [
          courseid,
          studentid,
        ]);
      return rows as Course[];
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
};

export default course;
