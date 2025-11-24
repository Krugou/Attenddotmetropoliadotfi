import { ResultSetHeader, RowDataPacket } from 'mysql2';
import createPool from '../config/createPool.js';

// DB pool (ADMIN connection)
const pool = createPool('ADMIN');

// Lecture entity
export interface Lecture {
  lectureid: number;
  start_date: Date;
  end_date: Date;
  topicid: number;
  courseid: number;
}

// Public API
export interface LectureModel {
  // Fetch all lectures
  fetchAllLectures(): Promise<RowDataPacket[]>;

  // Fetch a lecture and all users linked to its course
  findByLectureIdAndGetAllUserInLinkedCourse(lectureid: number): Promise<RowDataPacket[]>;

  // Fetch students by lecture id
  getStudentsByLectureId(lectureid: number): Promise<RowDataPacket[]>;

  // Delete a lecture by id
  deleteByLectureId(id: string): Promise<void>;

  // Count all lectures
  countAllLecturees(): Promise<number>;

  // Fetch lectures by topic id
  findByTopicId(topicid: number): Promise<Lecture[]>;

  // Fetch course id by lecture id
  getCourseidByLectureid(lectureid: number): Promise<number>;

  // Insert a new lecture
  insertIntoLecture(
    start_date: Date,
    end_date: Date,
    timeofday: 'am' | 'pm',
    topicid: number,
    courseid: number,
    state: 'open' | 'closed',
    teacherid: number | undefined,
  ): Promise<ResultSetHeader>;

  // Fetch lecture with its course and topic
  getLectureWithCourseAndTopic(lectureid: string): Promise<RowDataPacket | null>;

  // Update lecture state
  updateLectureState(lectureid: string, state: string): Promise<unknown>;

  // Fetch lectures by course id
  getLecturesByCourseId(courseid: number): Promise<RowDataPacket[] | null>;

  // Fetch course id by lecture id (nullable)
  getCourseIDByLectureID(lectureid: string): Promise<number | null>;

  // Fetch open lectures by course id
  findOpenLecturesBycourseid(courseid: number): Promise<RowDataPacket[] | null>;

  // Fetch open lectures by teacher id
  findOpenLecturesByTeacherid(teacherid: number): Promise<RowDataPacket[] | null>;

  // Fetch lecture by lecture id
  getLectureByLectureId(lectureid: number): Promise<RowDataPacket[] | null>;

  // Fetch lectures by teacher id with aggregates
  fetchLecturesByTeacherId(teacherId: number): Promise<RowDataPacket[]>;

  // Fetch past lectures by course id
  getPastLecturesByCourseId(courseid: number): Promise<RowDataPacket[]>;
}

// Helpers

// Generic query helper (returns typed rows / headers)
type QueryResult = RowDataPacket[] | RowDataPacket[][] | ResultSetHeader;
async function q<T extends QueryResult>(sql: string, params: any[] = []): Promise<T> {
  const [rows] = await pool.promise().query<T>(sql, params);
  return rows;
}

// Query helper for multiple rows
async function qRows<R extends RowDataPacket[]>(sql: string, params: any[] = []): Promise<R> {
  return q<R>(sql, params);
}

// Query helper for single row (or null)
async function qOne<R extends RowDataPacket>(sql: string, params: any[] = []): Promise<R | null> {
  const rows = await qRows<RowDataPacket[]>(sql, params);
  return (rows[0] as R) ?? null;
}

// Format JS Date -> MySQL DATETIME (YYYY-MM-DD HH:mm:ss)
function toMySqlDateTime(d: Date) {
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

// Shared SQL fragments

// Base select including counts and joined metadata
const SELECT_WITH_COUNTS = `
  SELECT
    lecture.*,
    courses.name  AS coursename,
    courses.code  AS coursecode,
    users.email   AS teacheremail,
    topics.topicname,
    (SELECT COUNT(*) FROM attendance a0
     WHERE a0.lectureid = lecture.lectureid AND a0.status = 0) AS notattended,
    (SELECT COUNT(*) FROM attendance a1
     WHERE a1.lectureid = lecture.lectureid AND a1.status = 1) AS attended,
    (SELECT COUNT(*) FROM users u
                            JOIN usercourses uc ON u.userid = uc.userid
                            JOIN lecture l2 ON uc.courseid = l2.courseid
     WHERE l2.lectureid = lecture.lectureid AND u.roleid = 1) AS studentcount
  FROM lecture
         INNER JOIN courses ON lecture.courseid = courses.courseid
         INNER JOIN users   ON lecture.teacherid = users.userid
         INNER JOIN topics  ON lecture.topicid  = topics.topicid
`;

// Open lectures (lightweight select)
const OPEN_LECTURES_SELECT = `
  SELECT lecture.*, users.email AS teacher, courses.code, topics.topicname
  FROM lecture
         JOIN users   ON lecture.teacherid = users.userid
         JOIN courses ON lecture.courseid  = courses.courseid
         JOIN topics  ON lecture.topicid   = topics.topicid
`;

const lectureModel: LectureModel = {
  // List all lectures with counts and metadata
  async fetchAllLectures() {
    try {
      console.log('row 159, lectureModel.ts, fetchAllLectures');
      const rows = await qRows<RowDataPacket[]>(SELECT_WITH_COUNTS);
      return rows;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  // Get every user in the same course as the lecture
  async findByLectureIdAndGetAllUserInLinkedCourse(lectureid: number) {
    try {
      console.log('row 188, lectureModel.ts, findByLectureIdAndGetAllUserInLinkedCourse');

      // Resolve course id for the lecture
      console.log('row 196, lectureModel.ts, select courses where courseid');
      const courseRow = await qOne<RowDataPacket>(
        'SELECT courseid FROM lecture WHERE lectureid = ?',
        [lectureid],
      );
      if (!courseRow) throw new Error(`Lecture with lectureid ${lectureid} not found`);

      // Fetch all users enrolled in that course
      console.log('row 209, lectureModel.ts, select users where courseid');
      const users = await qRows<RowDataPacket[]>(
        `SELECT u.*
         FROM users u
                JOIN usercourses uc ON u.userid = uc.userid
         WHERE uc.courseid = ?`,
        [courseRow.courseid],
      );
      return users;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // Get distinct students for a lecture
  async getStudentsByLectureId(lectureid: number) {
    try {
      console.log('row 229, lectureModel.ts, getStudentsByLectureId');
      // DISTINCT ensures unique rows at the SQL level
      const rows = await qRows<RowDataPacket[]>(
        `SELECT DISTINCT u.*, c.topicid, uc.usercourseid
         FROM users u
                JOIN usercourses uc ON u.userid = uc.userid
                JOIN lecture c      ON uc.courseid = c.courseid
         WHERE c.lectureid = ? AND u.roleid = 1`,
        [lectureid],
      );
      console.log('row 237, lecturemodel.ts, unique user rows');
      return rows ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  // Delete a lecture by primary key
  async deleteByLectureId(id: string) {
    try {
      console.log('row 258, lectureModel.ts, deleteByLectureId');
      await q<ResultSetHeader>('DELETE FROM lecture WHERE lectureid = ?', [id]);
      // preserve: do not throw even if it fails
    } catch (error) {
      console.error(error);
    }
  },

  // Count total lectures
  async countAllLecturees() {
    try {
      console.log('row 272, lectureModel.ts, countAllLecturees');
      const row = await qOne<RowDataPacket>('SELECT COUNT(*) AS count FROM lecture');
      return (row?.count as number) ?? 0;
    } catch (error) {
      console.error(error);
      return 0;
    }
  },

  // List lectures by topic
  async findByTopicId(topicid: number) {
    try {
      console.log('row 289, lectureModel.ts, findByTopicId');
      const rows = await qRows<RowDataPacket[]>('SELECT * FROM lecture WHERE topicid = ?', [topicid]);
      return rows as unknown as Lecture[];
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  // Resolve course id for a given lecture
  async getCourseidByLectureid(lectureid: number) {
    try {
      console.log('row 308, lectureModel.ts, getCourseidByLectureid');
      const row = await qOne<RowDataPacket>('SELECT courseid FROM lecture WHERE lectureid = ?', [lectureid]);
      return (row!.courseid as number);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  // Insert a new lecture with validation
  async insertIntoLecture(
    start_date: Date,
    end_date: Date,
    timeofday: 'am' | 'pm',
    topicid: number,
    courseid: number,
    state: 'open' | 'closed',
    teacherid: number | undefined,
  ): Promise<ResultSetHeader> {
    console.log('row 343, lectureModel.ts, insertIntoLecture');
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

      // Validate enums
      if (timeofday !== 'am' && timeofday !== 'pm') {
        throw new Error('Invalid timeofday value. Expected "am" or "pm"');
      }
      if (state !== 'open' && state !== 'closed') {
        throw new Error('Invalid state value. Expected "open" or "closed"');
      }

      // Insert lecture row
      const result = await q<ResultSetHeader>(
        `INSERT INTO lecture (start_date, end_date, timeofday, topicid, courseid, state, teacherid)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          toMySqlDateTime(start_date),
          toMySqlDateTime(end_date),
          timeofday,
          topicid,
          courseid,
          state,
          teacherid ?? null,
        ],
      );
      console.log('row 390, lectureModel.ts, inserting start_date, end_date, timeofday, topicid, courseid, state, teacherid to database');
      return result;
    } catch (error) {
      console.error('Failed to insert lecture:', error);
      throw error instanceof Error
        ? error
        : new Error('An unknown error occurred while inserting lecture');
    }
  },

  // Get one lecture joined with its course and topic
  async getLectureWithCourseAndTopic(lectureid: string) {
    try {
      console.log('row 407, lectureModel.ts, getLectureWithCourseAndTopic');
      const row = await qOne<RowDataPacket>(
        `SELECT l.*, c.*, t.*
         FROM lecture l
                JOIN courses c ON l.courseid = c.courseid
                JOIN topics  t ON l.topicid  = t.topicid
         WHERE l.lectureid = ?`,
        [lectureid],
      );
      return row ?? null;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  // Update lecture state (open/closed)
  async updateLectureState(lectureid: string, state: string) {
    try {
      console.log('row 433, lectureModel.ts, updateLectureState');
      const result = await q<ResultSetHeader>(
        'UPDATE lecture SET state = ? WHERE lectureid = ?',
        [state, lectureid],
      );
      return result;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  // List all lectures for a course
  async getLecturesByCourseId(courseid: number) {
    try {
      console.log('row 455, lectureModel.ts, getLecturesByCourseId');
      const rows = await qRows<RowDataPacket[]>(
        `SELECT * FROM lecture
                         JOIN courses ON lecture.courseid = courses.courseid
         WHERE lecture.courseid = ?`,
        [courseid],
      );
      return rows ?? null;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  // Get course id for a lecture (nullable)
  async getCourseIDByLectureID(lectureid: string) {
    try {
      console.log('row 479, lectureModel.ts, getCourseIDByLectureID');
      const row = await qOne<RowDataPacket>('SELECT courseid FROM lecture WHERE lectureid = ?', [lectureid]);
      return (row?.courseid as number) ?? null;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  // List open lectures for a course
  async findOpenLecturesBycourseid(courseid: number) {
    try {
      console.log('row 501, lectureModel.ts, findOpenLecturesBycourseid');
      const rows = await qRows<RowDataPacket[]>(
        `${OPEN_LECTURES_SELECT} WHERE lecture.courseid = ? AND state = "open"`,
        [courseid],
      );
      return rows ?? null;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  // List open lectures by teacher
  async findOpenLecturesByTeacherid(teacherid: number) {
    try {
      console.log('row 523, lectureModel.ts, findOpenLecturesByTeacherid');
      const rows = await qRows<RowDataPacket[]>(
        `${OPEN_LECTURES_SELECT} WHERE lecture.teacherid = ? AND state = "open"`,
        [teacherid],
      );
      return rows ?? null;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  // Fetch a lecture row by id
  async getLectureByLectureId(lectureid: number) {
    try {
      console.log('row 545, lectureModel.ts, getLectureByLectureId');
      const rows = await qRows<RowDataPacket[]>('SELECT * FROM lecture WHERE lectureid = ?', [lectureid]);
      return rows ?? null;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  // List lectures taught by a specific teacher (with counts)
  async fetchLecturesByTeacherId(teacherId: number) {
    try {
      console.log('row 560, lectureModel.ts, fetchLecturesByTeacherId');
      const rows = await qRows<RowDataPacket[]>(
        `${SELECT_WITH_COUNTS} WHERE lecture.teacherid = ?`,
        [teacherId],
      );
      return rows;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  // Past lectures for a course (ended already)
  async getPastLecturesByCourseId(courseid: number) {
    try {
      console.log('row 589, lectureModel.ts, getPastLecturesByCourseId');
      const rows = await qRows<RowDataPacket[]>(
        'SELECT * FROM lecture WHERE courseid = ? AND end_date < NOW()',
        [courseid],
      );
      return rows;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
};

export default lectureModel;
