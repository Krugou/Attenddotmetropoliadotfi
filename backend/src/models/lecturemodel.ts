import {FieldPacket, ResultSetHeader, RowDataPacket} from 'mysql2';
import createPool from '../config/createPool.js';

const pool = createPool('ADMIN');
/**
 * Interface for Lecture.
 */
export interface Lecture {
  lectureid: number;
  start_date: Date;
  end_date: Date;
  topicid: number;
  courseid: number;
}

/**
 * Interface for LectureModel.
 */
export interface LectureModel {
  /**
   * Finds a lecture by its ID and gets all users in the linked course.
   * @param lectureid - The ID of the lecture.
   * @returns A promise that resolves to an array of RowDataPacket.
   */
  findByLectureIdAndGetAllUserInLinkedCourse(
    lectureid: number,
  ): Promise<RowDataPacket[]>;
  /**
   * Gets students by lecture ID.
   * @param lectureid - The ID of the lecture.
   * @returns A promise that resolves to an array of RowDataPacket.
   */
  getStudentsByLectureId(lectureid: number): Promise<RowDataPacket[]>;
  /**
   * Deletes a lecture by its ID.
   * @param id - The ID of the lecture.
   * @returns A promise that resolves when the deletion is complete.
   */
  deleteByLectureId(id: string): Promise<void>;
  /**
   * Counts all lectures.
   * @returns A promise that resolves to the number of lectures.
   */
  countAllLecturees(): Promise<number>;
  /**
   * Finds lectures by topic ID.
   * @param topicid - The ID of the topic.
   * @returns A promise that resolves to an array of lectures.
   */
  findByTopicId(topicid: number): Promise<Lecture[]>;
  /**
   * Gets the course ID by lecture ID.
   * @param lectureid - The ID of the lecture.
   * @returns A promise that resolves to the ID of the course linked to the lecture.
   */
  getCourseidByLectureid(lectureid: number): Promise<number>;
  /**
   * Inserts a lecture.
   * @param start_date - The start date of the lecture.
   * @param end_date - The end date of the lecture.
   * @param timeofday - The time of day of the lecture.
   * @param topicid - The ID of the topic.
   * @param courseid - The ID of the course.
   * @param state - The state of the lecture.
   * @param teacherid - The ID of the teacher.
   * @returns A promise that resolves when the insertion is complete.
   */
  insertIntoLecture(
    start_date: Date,
    end_date: Date,
    timeofday: string,
    topicid: number,
    courseid: number,
    state: string,
    teacherid: number | undefined,
  ): Promise<unknown>;
  /**
   * Gets a lecture with its course and topic.
   * @param lectureid - The ID of the lecture.
   * @returns A promise that resolves to the lecture with its course and topic, if found.
   */
  getLectureWithCourseAndTopic(
    lectureid: string,
  ): Promise<RowDataPacket | null>;
  /**
   * Updates the state of a lecture.
   * @param lectureid - The ID of the lecture.
   * @param state - The new state of the lecture.
   * @returns A promise that resolves when the update is complete.
   */
  updateLectureState(lectureid: string, state: string): Promise<unknown>;
  /**
   * Gets lectures by course ID.
   * @param courseid - The ID of the course.
   * @returns A promise that resolves to an array of lectures for the course, if found.
   */
  getLecturesByCourseId(courseid: number): Promise<RowDataPacket[] | null>;
  /**
   * Gets the course ID by lecture ID.
   * @param lectureid - The ID of the lecture.
   * @returns A promise that resolves to the ID of the course linked to the lecture.
   */
  getCourseIDByLectureID(lectureid: string): Promise<number | null>;
  /**
   * Fetches all lectures.
   * @returns A promise that resolves to an array of lectures.
   */

  fetchAllLectures(): Promise<
    RowDataPacket[] | [RowDataPacket[], FieldPacket[]]
  >;

  findByLectureIdAndGetAllUserInLinkedCourse(
    lectureid: number,
  ): Promise<RowDataPacket[]>;
  /**
   * Finds open lectures by course ID.
   * @param courseid - The ID of the course.
   * @returns A promise that resolves to an array of open lectures for the course, if found.
   */
  findOpenLecturesBycourseid(courseid: number): Promise<RowDataPacket[] | null>;
  /**
   * Gets a lecture by its ID.
   * @param lectureid - The ID of the lecture.
   * @returns A promise that resolves to the lecture, if found.
   */
  getLectureByLectureId(lectureid: number): Promise<RowDataPacket[] | null>;
  /**
   * Finds open lectures by teacher ID.
   * @param teacherid - The ID of the teacher.
   * @returns A promise that resolves to an array of open lectures for the teacher, if found.
   */
  findOpenLecturesByTeacherid(
    teacherid: number,
  ): Promise<RowDataPacket[] | null>;
  /**
   * Fetches all lectures by teacher ID.
   * @returns A promise that resolves to an array of lectures.
   */
  fetchLecturesByTeacherId(teacherId: number): Promise<RowDataPacket[]>;
  /**
   * Gets past lectures by course ID.
   * @param courseid - The ID of the course.
   * @returns A promise that resolves to an array of past lectures for the course, if found.
   */
  getPastLecturesByCourseId(courseid: number): Promise<RowDataPacket[]>;
}

/**
 * Represents a lecture model.
 */
const lectureModel: LectureModel = {
  /**
   * Fetches all lectures.
   * @returns A promise that resolves to an array of lectures.
   */
  async fetchAllLectures() {
    try {
      const [rows] = await pool.promise().query<RowDataPacket[]>(
        `SELECT lecture.*, courses.name AS coursename, courses.code AS coursecode, users.email AS teacheremail, topics.topicname,
      (SELECT COUNT(*) FROM attendance WHERE lecture.lectureid = attendance.lectureid AND attendance.status = 0) AS notattended,
      (SELECT COUNT(*) FROM attendance WHERE lecture.lectureid = attendance.lectureid AND attendance.status = 1) AS attended,
      (SELECT COUNT(*) FROM users u
        JOIN usercourses uc ON u.userid = uc.userid
        JOIN lecture c ON uc.courseid = c.courseid
        WHERE c.lectureid = lecture.lectureid AND u.roleid = 1) AS studentcount
      FROM lecture
      INNER JOIN courses ON lecture.courseid = courses.courseid
      INNER JOIN users ON lecture.teacherid = users.userid
      INNER JOIN topics ON lecture.topicid = topics.topicid`,
      );
      return rows;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Finds a lecture by its ID and gets all users in the linked course.
   * @param lectureid - The ID of the lecture.
   * @returns A promise that resolves to an array of users in the linked course.
   */
  async findByLectureIdAndGetAllUserInLinkedCourse(
    lectureid: number,
  ): Promise<RowDataPacket[]> {
    try {
      const [lectureRows] = await pool
        .promise()
        .query('SELECT * FROM lecture WHERE lectureid = ?', [lectureid]);
      const lectureData = (lectureRows as RowDataPacket[])[0];
      if (!lectureData) {
        throw new Error(`Lecture with lectureid ${lectureid} not found`);
      }

      const [courseRows] = await pool
        .promise()
        .query('SELECT * FROM courses WHERE courseid = ?', [
          lectureData.courseid,
        ]);
      const courseData = (courseRows as RowDataPacket[])[0];
      if (!courseData) {
        throw new Error(
          `Course with courseid ${lectureData.courseid} not found`,
        );
      }

      const [userRows] = await pool
        .promise()
        .query(
          'SELECT u.* FROM users u JOIN usercourses uc ON u.userid = uc.userid WHERE uc.courseid = ?',
          [courseData.courseid],
        );
      return userRows as RowDataPacket[];
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  /**
   * Gets students by lecture ID.
   * @param lectureid - The ID of the lecture.
   * @returns A promise that resolves to an array of students in the lecture.
   */
  async getStudentsByLectureId(lectureid: number) {
    try {
      const [userRows] = await pool.promise().query<RowDataPacket[]>(
        `SELECT u.*, c.topicid, uc.usercourseid FROM users u
            JOIN usercourses uc ON u.userid = uc.userid
            JOIN lecture c ON uc.courseid = c.courseid
            WHERE c.lectureid = ? AND u.roleid = 1;`, // Assuming roleid 1 is for students
        [lectureid],
      );
      const uniqueUserRows = userRows.reduce<RowDataPacket[]>((unique, o) => {
        if (!unique.some((obj) => obj.userid === o.userid)) {
          unique.push(o);
        }
        return unique;
      }, []);

      return uniqueUserRows ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  },
  /**
   * Deletes a lecture by its ID.
   * @param id - The ID of the lecture.
   * @returns A promise that resolves when the deletion is complete.
   */
  async deleteByLectureId(id: string): Promise<void> {
    try {
      await pool
        .promise()
        .query('DELETE FROM lecture WHERE lectureid = ?', [id]);
    } catch (error) {
      console.error(error);
    }
  },
  /**
   * Counts all lectures.
   * @returns A promise that resolves to the number of lectures.
   */
  async countAllLecturees(): Promise<number> {
    try {
      const [rows] = await pool
        .promise()
        .query<RowDataPacket[]>('SELECT COUNT(*) as count FROM lecture');
      return rows[0].count;
    } catch (error) {
      console.error(error);
      return 0;
    }
  },
  /**
   * Finds a lecture by its topic ID.
   * @param topicid - The ID of the topic.
   * @returns A promise that resolves to the lectures with the given topic ID.
   */
  async findByTopicId(topicid) {
    try {
      const [rows] = await pool
        .promise()
        .query<RowDataPacket[]>('SELECT * FROM lecture WHERE topicid = ?', [
          topicid,
        ]);
      return rows as Lecture[];
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Gets the course ID by lecture ID.
   * @param lectureid - The ID of the lecture.
   * @returns A promise that resolves to the ID of the course linked to the lecture.
   */
  async getCourseidByLectureid(lectureid) {
    try {
      const [rows] = await pool
        .promise()
        .query<RowDataPacket[]>(
          'SELECT courseid FROM lecture WHERE lectureid = ?',
          [lectureid],
        );

      return rows[0].courseid;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Inserts a new lecture.
   * @param start_date - The start date of the lecture.
   * @param end_date - The end date of the lecture.
   * @param timeofday - The time of day of the lecture.
   * @param topicid - The ID of the topic.
   * @param courseid - The ID of the course.
   * @param state - The state of the lecture.
   * @param teacherid - The ID of the teacher.
   * @returns A promise that resolves to the result of the insertion.
   * @throws Error if date validation fails or insertion fails
   */
  async insertIntoLecture(
    start_date: Date,
    end_date: Date,
    timeofday: string,
    topicid: number,
    courseid: number,
    state: string,
    teacherid: number | undefined,
  ): Promise<ResultSetHeader> {
    console.log('🚀 ~ start_date:', start_date);
    console.log('🚀 ~ end_date:', end_date);
    try {
      // Validate dates
      if (!(start_date instanceof Date) || isNaN(start_date.getTime())) {
        throw new Error('Invalid start date format');
      }
      if (!(end_date instanceof Date) || isNaN(end_date.getTime())) {
        throw new Error('Invalid end date format');
      }
      if (start_date >= end_date) {
        throw new Error('Start date must be before end date');
      }

      // Format dates for MySQL (YYYY-MM-DD HH:MM:SS)
      const formattedStartDate = start_date
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');
      const formattedEndDate = end_date
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');

      // Validate timeofday
      if (timeofday !== 'am' && timeofday !== 'pm') {
        throw new Error('Invalid timeofday value. Expected "am" or "pm"');
      }

      // Validate state
      if (state !== 'open' && state !== 'closed') {
        throw new Error('Invalid state value. Expected "open" or "closed"');
      }

      const [result] = await pool
        .promise()
        .query<ResultSetHeader>(
          'INSERT INTO lecture (start_date, end_date, timeofday, topicid, courseid, state, teacherid) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            formattedStartDate,
            formattedEndDate,
            timeofday,
            topicid,
            courseid,
            state,
            teacherid,
          ],
        );
      return result;
    } catch (error) {
      console.error('Failed to insert lecture:', error);
      throw error instanceof Error
        ? error
        : new Error('An unknown error occurred while inserting lecture');
    }
  },
  /**
   * Gets a lecture with its course and topic.
   * @param lectureid - The ID of the lecture.
   * @returns A promise that resolves to the lecture with its course and topic, if found.
   * If an error occurs, the promise is rejected.
   */
  async getLectureWithCourseAndTopic(lectureid: string) {
    try {
      const [rows] = await pool
        .promise()
        .query<RowDataPacket[]>(
          'SELECT l.*, c.*, t.* FROM lecture l ' +
            'JOIN courses c ON l.courseid = c.courseid ' +
            'JOIN topics t ON l.topicid = t.topicid ' +
            'WHERE l.lectureid = ?',
          [lectureid],
        );

      return rows[0] ?? null;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Updates the state of a lecture.
   * @param lectureid - The ID of the lecture.
   * @param state - The new state of the lecture.
   * @returns A promise that resolves when the update is complete.
   * If an error occurs, the promise is rejected.
   */
  async updateLectureState(lectureid: string, state: string) {
    try {
      const [result] = await pool
        .promise()
        .query('UPDATE lecture SET state = ? WHERE lectureid = ?', [
          state,
          lectureid,
        ]);

      return result;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Gets lectures by course ID.
   * @param courseid - The ID of the course.
   * @returns A promise that resolves to an array of lectures for the course, if found.
   * If an error occurs, the promise is rejected.
   */
  async getLecturesByCourseId(courseid: number) {
    try {
      const [rows] = await pool
        .promise()
        .query<RowDataPacket[]>(
          'SELECT * FROM lecture ' +
            'JOIN courses ON lecture.courseid = courses.courseid ' +
            'WHERE lecture.courseid = ?',
          [courseid],
        );

      return rows ?? null;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Gets the course ID by lecture ID.
   * @param lectureid - The ID of the lecture.
   * @returns A promise that resolves to the ID of the course linked to the lecture.
   * If an error occurs, the promise is rejected.
   */
  async getCourseIDByLectureID(lectureid: string) {
    try {
      const [rows] = await pool
        .promise()
        .query<RowDataPacket[]>(
          'SELECT courseid FROM lecture WHERE lectureid = ?',
          [lectureid],
        );

      return rows[0].courseid ?? null;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Finds open lectures by course ID.
   * @param courseid - The ID of the course.
   * @returns A promise that resolves to an array of open lectures for the course, if found.
   * If an error occurs, the promise is rejected.
   */
  async findOpenLecturesBycourseid(courseid: number) {
    try {
      const [rows] = await pool
        .promise()
        .query<RowDataPacket[]>(
          'SELECT lecture.*, users.email as teacher, courses.code, topics.topicname FROM lecture JOIN users ON lecture.teacherid = users.userid JOIN courses ON lecture.courseid = courses.courseid JOIN topics ON lecture.topicid = topics.topicid WHERE lecture.courseid = ? AND state = "open"',
          [courseid],
        );

      return rows ?? null;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Finds open lectures by teacher ID.
   * @param teacherid - The ID of the teacher.
   * @returns A promise that resolves to an array of open lectures for the teacher, if found.
   * If an error occurs, the promise is rejected.
   */
  async findOpenLecturesByTeacherid(teacherid: number) {
    try {
      const [rows] = await pool
        .promise()
        .query<RowDataPacket[]>(
          'SELECT lecture.*, users.email as teacher, courses.code, topics.topicname FROM lecture JOIN users ON lecture.teacherid = users.userid JOIN courses ON lecture.courseid = courses.courseid JOIN topics ON lecture.topicid = topics.topicid WHERE lecture.teacherid = ? AND state = "open"',
          [teacherid],
        );

      return rows ?? null;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Gets a lecture by its ID.
   * @param lectureid - The ID of the lecture.
   * @returns A promise that resolves to the lecture, if found.
   * If an error occurs, the promise is rejected.
   */
  async getLectureByLectureId(lectureid: number) {
    try {
      const [rows] = await pool
        .promise()
        .query<RowDataPacket[]>('SELECT * FROM lecture WHERE lectureid = ?', [
          lectureid,
        ]);

      return rows ?? null;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  async fetchLecturesByTeacherId(teacherId: number) {
    try {
      const [rows] = await pool.promise().query<RowDataPacket[]>(
        `SELECT lecture.*, courses.name AS coursename, courses.code AS coursecode, users.email AS teacheremail, topics.topicname,
      (SELECT COUNT(*) FROM attendance WHERE lecture.lectureid = attendance.lectureid AND attendance.status = 0) AS notattended,
      (SELECT COUNT(*) FROM attendance WHERE lecture.lectureid = attendance.lectureid AND attendance.status = 1) AS attended,
      (SELECT COUNT(*) FROM users u
        JOIN usercourses uc ON u.userid = uc.userid
        JOIN lecture c ON uc.courseid = c.courseid
        WHERE c.lectureid = lecture.lectureid AND u.roleid = 1) AS studentcount
      FROM lecture
      INNER JOIN courses ON lecture.courseid = courses.courseid
      INNER JOIN users ON lecture.teacherid = users.userid
      INNER JOIN topics ON lecture.topicid = topics.topicid
      WHERE lecture.teacherid = ?`,
        [teacherId],
      );
      return rows;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Gets past lectures by course ID.
   * @param courseid - The ID of the course.
   * @returns A promise that resolves to an array of past lectures for the course, if found.
   */
  async getPastLecturesByCourseId(courseid: number) {
    try {
      const [rows] = await pool
        .promise()
        .query<RowDataPacket[]>(
          'SELECT * FROM lecture WHERE courseid = ? AND end_date < NOW()',
          [courseid],
        );

      return rows;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  // other methods...
};

export default lectureModel;
