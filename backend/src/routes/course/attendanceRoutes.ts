import express, {Request, Response, Router} from 'express';
import {body, param} from 'express-validator';
import attendanceController from '../../controllers/attendancecontroller.js';
import lectureController from '../../controllers/lecturecontroller.js';
import attendanceModel from '../../models/attendancemodel.js';
import lectureModel from '../../models/lecturemodel.js';
import checkUserRole from '../../utils/checkRole.js';
import logger from '../../utils/logger.js';
import validate from '../../utils/validate.js';
const router: Router = express.Router();
/**
 * Route that fetches all attendance records.
 *
 * @returns {Promise<Attendance[]>} A promise that resolves with all attendance records.
 */
router.get(
  '/',
  checkUserRole(['admin', 'teacher', 'counselor']),
  async (res: Response) => {
    try {
      const attendanceData = await attendanceModel.fetchAllAttendances();
      res.send(attendanceData);
    } catch (err) {
      logger.error(err);
      console.error(err);
      res.status(500).send('Server error');
    }
  },
);
/**
 * Route that fetches an attendance record by its ID.
 *
 * @param {number} id - The ID of the attendance record.
 * @returns {Promise<Attendance>} A promise that resolves with the attendance record, or a 404 status if not found.
 */
router.get(
  '/:id',
  checkUserRole(['admin', 'teacher', 'counselor']),
  [param('id').isNumeric().withMessage('ID must be a number')],
  validate,
  async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const attendanceData = await attendanceModel.findByAttendanceId(id);
      if (attendanceData) {
        res.send(attendanceData);
      } else {
        res.status(404).send('Attendance not found');
      }
    } catch (err) {
      logger.error(err);
      console.error(err);
      res.status(500).send('Server error');
    }
  },
);
/**
 * Route that fetches all attendance records for a user's course.
 *
 * @param {number} id - The ID of the user's course.
 * @returns {Promise<Attendance[]>} A promise that resolves with all attendance records for the user's course.
 */
router.get(
  '/usercourse/:id',
  [param('id').isNumeric().withMessage('ID must be a number')],
  validate,
  async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      let userid = Number(req.user?.userid);
      let userinfo;
      if (
        req.user?.role === 'teacher' ||
        req.user?.role === 'admin' ||
        req.user?.role === 'counselor'
      ) {
        userinfo = await attendanceModel.getUserInfoByUserCourseId(id);
        userid = userinfo?.userid;
      }
      const attendanceData =
        await attendanceModel.findAllAttendancesByUserCourseId(id, userid);
      attendanceData[0] && userinfo
        ? (attendanceData[0].userinfo = userinfo)
        : null;
      res.send(attendanceData);
    } catch (err) {
      logger.error(err);
      console.error(err);
      if (err instanceof Error) {
        res.status(500).send(`Server error: ${err.message}`);
      } else {
        res.status(500).send('Server error');
      }
    }
  },
);
/**
 * Route that creates a new attendance record.
 *
 * @param {string} status - The attendance status.
 * @param {string} date - The date of the attendance in ISO 8601 format.
 * @param {number} studentnumber - The student number.
 * @param {number} lectureid - The ID of the lecture.
 * @returns {Promise<Attendance>} A promise that resolves with the created attendance record.
 */

router.post(
  '/',
  checkUserRole(['admin', 'teacher', 'counselor']),
  [
    body('status').notEmpty().withMessage('Status is required'),
    body('date').isISO8601().withMessage('Date must be in ISO 8601 format'),
    body('studentnumber')
      .isNumeric()
      .withMessage('Student number must be a number'),
    body('lectureid').isNumeric().withMessage('Lecture ID must be a number'),
  ],
  validate,
  async (req: Request, res: Response) => {
    const {status, date, studentnumber, lectureid} = req.body;
    try {
      const insertedData = await attendanceController.insertIntoAttendance(
        status,
        date,
        studentnumber,
        lectureid,
      );
      res.status(200).send(insertedData);
    } catch (err) {
      logger.error(err);
      console.error(err);
      if (err instanceof Error) {
        res.status(500).send(`Server error: ${err.message}`);
      } else {
        res.status(500).send('Server error');
      }
    }
  },
);
/**
 * Route that marks all students not present in a lecture as not present.
 *
 * @param {string} date - The date of the lecture in ISO 8601 format.
 * @param {number[]} studentnumbers - The student numbers.
 * @param {number} lectureid - The ID of the lecture.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
router.post(
  '/lecturefinished/',
  checkUserRole(['admin', 'teacher', 'counselor']),
  [
    body('date').isISO8601().withMessage('Date must be in ISO 8601 format'),
    body('studentnumbers.*')
      .isNumeric()
      .withMessage('All student numbers must be numbers'),
    body('lectureid').isNumeric().withMessage('Lecture ID must be a number'),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const {date, studentnumbers, lectureid} = req.body;

      await attendanceController.checkAndInsertStatusNotPresentAttendance(
        date,
        studentnumbers,
        lectureid,
      );
      await lectureModel.updateLectureState(lectureid, 'closed');
      res
        .status(201)
        .send('Attendance put as not present for rest of students not present');
    } catch (err) {
      logger.error(err);
      console.error(err);
      res.status(500).send('Server error');
    }
  },
);
/**
 * Route that fetches all students in a lecture.
 *
 * @param {number} lectureid - The ID of the lecture.
 * @returns {Promise<Student[]>} A promise that resolves with all students in the lecture.
 */
router.post(
  '/getallstudentsinlecture/',
  checkUserRole(['admin', 'teacher', 'counselor']),
  [body('lectureid').isNumeric()],
  async (req: Request, res: Response) => {
    try {
      const {lectureid} = req.body;
      const allStudentsInLecture = await lectureController.getStudentsInLecture(
        lectureid,
      );
      res.status(201).send(allStudentsInLecture);
    } catch (err) {
      logger.error(err);
      console.error(err);
      res.status(500).send('Server error');
    }
  },
);
/**
 * Route that deletes an attendance record.
 *
 * @param {number} studentnumber - The student number.
 * @param {number} lectureid - The ID of the lecture.
 * @returns {Promise<boolean>} A promise that resolves with true if the deletion was successful, or false otherwise.
 */
router.post(
  '/delete/',
  checkUserRole(['admin', 'teacher', 'counselor']),
  [body('studentnumber').isNumeric(), body('lectureid').isNumeric()],
  async (req: Request, res: Response) => {
    if (req.user) {
      console.log('admin/attendance delete ', req.user?.email);
      logger.info({useremail: req.user.email}, ' courses/attendance/delete ');
    }
    try {
      const {studentnumber} = req.body;
      const lectureid = req.body.lectureid;
      await attendanceController.deleteAttendance(studentnumber, lectureid);
      res.status(201).send(true);
    } catch (err) {
      logger.error(err);
      console.error(err);
      res.status(500).send(false);
    }
  },
);
/**
 * Route that deletes a lecture by its ID.
 *
 * @param {number} lectureid - The ID of the lecture.
 * @returns {Promise<void>} A promise that resolves when the deletion is complete.
 */
router.post(
  '/deletelecture/',
  checkUserRole(['admin', 'teacher', 'counselor']),
  [body('lectureid').isNumeric()],
  async (req: Request, res: Response) => {
    if (req.user) {
      logger.info(
        {useremail: req.user.email},
        ' courses/attendance/lecture delete ',
      );
    }
    try {
      const {lectureid} = req.body;
      await lectureModel.deleteByLectureId(lectureid);
      res.status(201).send({message: 'Lecture deleted'});
    } catch (err) {
      logger.error(err);
      console.error(err);
      res.status(500).send('Server error');
    }
  },
);
/**
 * Route that creates a new lecture.
 *
 * @param {string} topicname - The name of the topic.
 * @param {string} coursecode - The course code.
 * @param {string} start_date - The start date of the lecture in ISO 8601 format.
 * @param {string} end_date - The end date of the lecture in ISO 8601 format.
 * @param {string} timeofday - The time of day of the lecture.
 * @param {string} state - The state of the lecture.
 * @returns {Promise<{message: string, lectureInfo: number}>} A promise that resolves with a message and the ID of the created lecture.
 */
router.post(
  '/lecture/',
  checkUserRole(['admin', 'teacher', 'counselor']),
  [
    body('topicname').notEmpty(),
    body('coursecode').notEmpty(),
    body('start_date').isISO8601(),
    body('end_date').isISO8601(),
    body('timeofday').notEmpty(),
    body('state').notEmpty(),
  ],
  async (req: Request, res: Response) => {
    if (req.user) {
      console.log('lecture created ', req.user?.email);
      logger.info(
        {useremail: req.user?.email},
        ' courses/attendance/lecture created ',
      );
    }
    try {
      const {topicname, coursecode, start_date, end_date, timeofday, state} =
        req.body;
      // console.log(req.body);
      const teacherid = req.user?.userid;
      const lectureid = await lectureController.insertIntoLecture(
        topicname,
        coursecode,
        start_date,
        end_date,
        timeofday,
        state,
        teacherid,
      );
      res
        .status(201)
        .send({message: 'lecture created', lectureInfo: lectureid});
    } catch (err) {
      logger.error(err);
      console.error(err);
      res.status(500).send('Server error');
    }
  },
);
/**
 * Route that fetches a lecture by its ID with its course and topic.
 *
 * @param {number} lectureid - The ID of the lecture.
 * @returns {Promise<Lecture>} A promise that resolves with the lecture, or a 404 status if not found.
 */
router.get(
  '/lectureinfo/:lectureid',
  checkUserRole(['admin', 'teacher', 'counselor']),
  [param('lectureid').isNumeric().withMessage('Lecture ID must be a number')],
  validate,
  async (req: Request, res: Response) => {
    try {
      const {lectureid} = req.params;

      const lectureInfo = await lectureModel.getLectureWithCourseAndTopic(
        lectureid,
      );

      res.status(200).send(lectureInfo);
    } catch (err) {
      logger.error(err);
      console.error(err);
      res.status(500).send('Server error');
    }
  },
);

// router.get('/studentsattendance', async (req: Request, res: Response) => {
// 	try {
// 		const id = Number(req.params.id);
// 		const attendanceData = await attendanceModel.findAllAttendancesByUserCourseId(
// 			id,
// 		);
// 		res.send(attendanceData);
// 	} catch (err) {
// 		console.error(err);
// 		res.status(500).send('Server error');
// 	}
// });
/**
 * Route that updates the status of an attendance record.
 *
 * @param {number} attendanceid - The ID of the attendance record.
 * @param {string} status - The new status.
 * @returns {Promise<{message: string}>} A promise that resolves with a message indicating the update was successful.
 */
router.put(
  '/update',
  checkUserRole(['admin', 'teacher', 'counselor']),
  async (req: Request, res: Response) => {
    if (req.user) {
      logger.info({useremail: req.user.email}, ' courses/attendance/update ');
      console.log('attendance update ', req.user?.email);
    }
    const {attendanceid, status} = req.body;

    try {
      // console.log('Received attendanceid:', attendanceid);
      // console.log('Received status:', status);

      await attendanceController.updateAttendanceStatus(attendanceid, status);

      res.status(200).send({message: 'Attendance status updated successfully'});
    } catch (error) {
      logger.error(error);
      console.error(error);
      res.status(500).send('Server error');
    }
  },
);
/**
 * Route that fetches all lectures and attendance records for a course.
 *
 * @param {number} courseid - The ID of the course.
 * @returns {Promise<Lecture[]>} A promise that resolves with all lectures and attendance records for the course.
 */
router.get(
  '/course/:courseid',
  checkUserRole(['admin', 'counselor', 'teacher']),
  [param('courseid').isNumeric().withMessage('Course ID must be a number')],
  validate,
  async (req: Request, res: Response) => {
    try {
      const courseid = req.params.courseid;

      const lecturesAndAttendancesData =
        await attendanceController.getLecturesAndAttendancesByCourseId(
          courseid,
        );

      res.send(lecturesAndAttendancesData);
    } catch (err) {
      logger.error(err);
      console.error(err);
      res.status(500).send('Server error');
    }
  },
);
/**
 * Route that deletes a lecture by its ID.
 *
 * @param {number} lectureid - The ID of the lecture.
 * @returns {Promise<{message: string}>} A promise that resolves with a message indicating the deletion was successful.
 */
router.delete(
  '/lecture/:lectureid',
  checkUserRole(['admin', 'counselor', 'teacher']),
  [param('lectureid').isNumeric().withMessage('Lecture ID must be a number')],
  validate,
  async (req: Request, res: Response) => {
    if (req.user) {
      logger.info(
        {useremail: req.user.email},
        ' courses/attendance/lecture delete ',
      );
      console.log('delete lecture ', req.user?.email);
    }
    try {
      const lectureid = req.params.lectureid;

      await lectureModel.deleteByLectureId(lectureid);
      // console.log('Lecture deleted successfully');
      res.status(200).send({message: 'Lecture deleted successfully'});
    } catch (error) {
      logger.error(error);
      console.error(error);
      res.status(500).send('Server error');
    }
  },
);
/**
 * Route that closes a lecture by its ID.
 *
 * @param {number} lectureid - The ID of the lecture.
 * @returns {Promise<{message: string}>} A promise that resolves with a message indicating the lecture was closed successfully.
 */
router.put(
  '/lecture/close/:lectureid',
  checkUserRole(['admin', 'counselor', 'teacher']),
  [param('lectureid').isNumeric().withMessage('Lecture ID must be a number')],
  validate,
  async (req: Request, res: Response) => {
    if (req.user) {
      logger.info(
        {useremail: req.user.email},
        ' courses/attendance/lecture close ',
      );
    }
    try {
      const lectureid = req.params.lectureid;

      await lectureController.closeLecture(lectureid);
      // console.log('Lecture closed successfully');
      res.status(200).send({message: 'Lecture closed successfully'});
    } catch (error) {
      logger.error(error);
      console.error(error);
      res.status(500).send('Server error');
    }
  },
);
/**
 * Route that fetches all open lectures for a course.
 *
 * @param {number} courseid - The ID of the course.
 * @returns {Promise<Lecture[]>} A promise that resolves with all open lectures for the course.
 */
router.get(
  '/lecture/open/:courseid',
  checkUserRole(['admin', 'counselor', 'teacher']),
  [param('courseid').isNumeric().withMessage('course ID must be a number')],
  validate,
  async (req: Request, res: Response) => {
    try {
      const courseid = req.params.courseid;

      const openLectures = await lectureModel.findOpenLecturesBycourseid(
        Number(courseid),
      );

      res.status(200).send(openLectures);
    } catch (error) {
      logger.error(error);
      console.error(error);
      res.status(500).send('Server error');
    }
  },
);
router.post(
  '/lecture/teacheropen/',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req: Request, res: Response) => {
    try {
      const {teacherid} = req.body;
      const openLectures = await lectureModel.findOpenLecturesByTeacherid(
        Number(teacherid),
      );
      res.status(200).send(openLectures);
    } catch (error) {
      logger.error(error);
      console.error(error);
      res.status(500).send('Server error');
    }
  },
);
router.get(
  '/lecture/teacher/:teacherId',
  checkUserRole(['admin', 'teacher', 'counselor']),
  async (req: Request, res: Response) => {
    if (req.user) {
      logger.info(
        {useremail: req.user.email},
        ' courses/attendance/ own lectures view ',
      );
    }
    try {
      const teacherId = Number(req.params.teacherId);
      const lectures = await lectureModel.fetchLecturesByTeacherId(teacherId);

      for (const lecture of lectures) {
        const students = await lectureController.getStudentsInLecture(
          lecture.lectureid,
        );
        if (students) lecture.actualStudentCount = students.length;
      }
      res.send(lectures);
    } catch (err) {
      logger.error(err);
      console.error(err);
      res.status(500).send('Server error');
    }
  },
);

/**
 * Route that adds a late enrolling student to previous lectures as not present.
 *
 * @param {string} studentnumber - The student number.
 * @param {number} courseid - The ID of the course.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
router.post(
  '/addLateEnrollingStudentToPreviousLectures',
  checkUserRole(['admin', 'teacher', 'counselor']),
  [
    body('studentnumber')
      .isString()
      .withMessage('Student number must be a string'),
    body('courseid').isNumeric().withMessage('Course ID must be a number'),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const {studentnumber, courseid} = req.body;
      await attendanceController.markStudentAsNotPresentInPastLectures(
        studentnumber,
        courseid,
      );
      res.status(200).send('Student added to previous lectures as not present');
    } catch (err) {
      logger.error(err);
      console.error(err);
      res.status(500).send('Server error');
    }
  },
);

export default router;
