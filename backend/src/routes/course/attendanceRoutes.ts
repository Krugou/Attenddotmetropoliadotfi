import express, {Router, type Request, type Response, type NextFunction, type RequestHandler,} from 'express';
import { body, param } from 'express-validator';
import attendanceController from '../../controllers/attendancecontroller.js';
import lectureController from '../../controllers/lecturecontroller.js';
import attendanceModel from '../../models/attendancemodel.js';
import lectureModel from '../../models/lecturemodel.js';
import checkUserRole from '../../utils/checkRole.js';
import logger from '../../utils/logger.js';
import validate from '../../utils/validate.js';

const router: Router = express.Router();

// Helpers
const asyncHandler =
  (fn: RequestHandler) =>
    (req: Request, res: Response, next: NextFunction) =>
      Promise.resolve(fn(req, res, next)).catch(next);

const send500 = (res: Response, msg: string = 'Server error') =>
  res.status(500).json(msg);

const toNum = (v: string | number) => Number(v);

// Routes

// GET: All attendance records
router.get(
  '/',
  checkUserRole(['admin', 'teacher', 'counselor']),
  asyncHandler(async (_req, res) => {
    try {
      console.log('row 21, attendanceRoutes.ts, Get all attendance records');
      const attendanceData = await attendanceModel.fetchAllAttendances();
      res.send(attendanceData);
    } catch (err) {
      logger.error(err);
      console.error(err);
      send500(res);
    }
  }),
);

// GET: Attendance by ID
router.get(
  '/:id',
  checkUserRole(['admin', 'teacher', 'counselor']),
  [param('id').isNumeric().withMessage('ID must be a number')],
  validate,
  asyncHandler(async (req, res) => {
    try {
      console.log('row 44, attendanceRoutes.ts, Get attendance record by ID');
      const id = toNum(req.params.id);
      const attendanceData = await attendanceModel.findByAttendanceId(id);
      if (attendanceData) res.send(attendanceData);
      else res.status(404).json('Attendance not found');
    } catch (err) {
      logger.error(err);
      console.error(err);
      send500(res);
    }
  }),
);

// GET: All attendances by user's course ID
router.get(
  '/usercourse/:id',
  [param('id').isNumeric().withMessage('ID must be a number')],
  validate,
  asyncHandler(async (req, res) => {
    try {
      console.log("row 71, attendanceRoutes.ts, Get all attendance records for user's course");
      const id = toNum(req.params.id);
      let userid = toNum(req.user?.userid ?? NaN);
      let userinfo: any;

      if (['teacher', 'admin', 'counselor'].includes(req.user?.role ?? '')) {
        userinfo = await attendanceModel.getUserInfoByUserCourseId(id);
        userid = userinfo?.userid;
      }

      const attendanceData = await attendanceModel.findAllAttendancesByUserCourseId(id, userid);
      if (attendanceData[0] && userinfo) attendanceData[0].userinfo = userinfo;

      res.send(attendanceData);
    } catch (err) {
      logger.error(err);
      console.error(err);
      res.status(500).json(err instanceof Error ? `Server error: ${err.message}` : 'Server error');
    }
  }),
);

// POST: Create new attendance record
router.post(
  '/',
  checkUserRole(['admin', 'teacher', 'counselor']),
  [
    body('status').notEmpty().withMessage('Status is required'),
    body('date').isISO8601().withMessage('Date must be in ISO 8601 format'),
    body('studentnumber').isNumeric().withMessage('Student number must be a number'),
    body('lectureid').isNumeric().withMessage('Lecture ID must be a number'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { status, date, studentnumber, lectureid } = req.body;
    try {
      console.log('row 125, attendanceRoutes.ts, Create new attendance record');
      const insertedData = await attendanceController.insertIntoAttendance(
        status,
        date,
        studentnumber,
        lectureid,
      );
      res.status(200).json(insertedData);
    } catch (err) {
      logger.error(err);
      console.error(err);
      res.status(500).json(err instanceof Error ? `Server error: ${err.message}` : 'Server error');
    }
  }),
);

// POST: Mark lecture as finished
router.post(
  '/lecturefinished/',
  checkUserRole(['admin', 'teacher', 'counselor']),
  [
    body('date').isISO8601().withMessage('Date must be in ISO 8601 format'),
    body('studentnumbers.*').isNumeric().withMessage('All student numbers must be numbers'),
    body('lectureid').isNumeric().withMessage('Lecture ID must be a number'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    try {
      console.log(
        'row 165, attendanceRoutes.ts, Mark all students not present in a lecture as not present',
      );
      const { date, studentnumbers, lectureid } = req.body;

      await attendanceController.checkAndInsertStatusNotPresentAttendance(date, studentnumbers, lectureid);
      await lectureModel.updateLectureState(lectureid, 'closed');

      res.status(201).send('Attendance put as not present for rest of students not present');
    } catch (err) {
      logger.error(err);
      console.error(err);
      send500(res);
    }
  }),
);

// POST: Get all students in a lecture
router.post(
  '/getallstudentsinlecture/',
  checkUserRole(['admin', 'teacher', 'counselor']),
  [body('lectureid').isNumeric()],
  validate,
  asyncHandler(async (req, res) => {
    try {
      console.log('row 196, attendanceRoutes.ts, Get all students in a lecture');
      const { lectureid } = req.body;
      const allStudentsInLecture = await lectureController.getStudentsInLecture(lectureid);
      res.status(201).json(allStudentsInLecture);
    } catch (err) {
      logger.error(err);
      console.error(err);
      send500(res);
    }
  }),
);

// POST: Delete attendance record
router.post(
  '/delete/',
  checkUserRole(['admin', 'teacher', 'counselor']),
  [body('studentnumber').isNumeric(), body('lectureid').isNumeric()],
  validate,
  asyncHandler(async (req, res) => {
    if (req.user) logger.info({ useremail: req.user.email }, ' courses/attendance/delete ');
    try {
      console.log('row 226, attendanceRoutes.ts, Delete an attendance record');
      const { studentnumber, lectureid } = req.body;
      await attendanceController.deleteAttendance(studentnumber, lectureid);
      res.status(201).json(true);
    } catch (err) {
      logger.error(err);
      console.error(err);
      res.status(500).json(false);
    }
  }),
);

// POST: Delete lecture
router.post(
  '/deletelecture/',
  checkUserRole(['admin', 'teacher', 'counselor']),
  [body('lectureid').isNumeric()],
  validate,
  asyncHandler(async (req, res) => {
    if (req.user) logger.info({ useremail: req.user.email }, ' courses/attendance/lecture delete ');
    try {
      console.log('row 256, attendanceRoutes.ts, Delete a lecture by its ID');
      const { lectureid } = req.body;
      await lectureModel.deleteByLectureId(lectureid);
      res.status(201).json({ message: 'Lecture deleted' });
    } catch (err) {
      logger.error(err);
      console.error(err);
      send500(res);
    }
  }),
);

// POST: Create lecture
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
  validate,
  asyncHandler(async (req, res) => {
    if (req.user) logger.info({ useremail: req.user?.email }, ' courses/attendance/lecture created ');
    try {
      console.log('row 298, attendanceRoutes.ts, Create new lecture');
      const { topicname, coursecode, start_date, end_date, timeofday, state } = req.body;
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
      res.status(201).send({ message: 'lecture created', lectureInfo: lectureid });
    } catch (err) {
      logger.error(err);
      console.error(err);
      send500(res);
    }
  }),
);

// GET: Lecture info by ID
router.get(
  '/lectureinfo/:lectureid',
  checkUserRole(['admin', 'teacher', 'counselor']),
  [param('lectureid').isNumeric().withMessage('Lecture ID must be a number')],
  validate,
  asyncHandler(async (req, res) => {
    try {
      console.log('row 335, attendanceRoutes.ts, Get lecture by ID');
      const { lectureid } = req.params;
      const lectureInfo = await lectureModel.getLectureWithCourseAndTopic(lectureid);
      res.status(200).json(lectureInfo);
    } catch (err) {
      logger.error(err);
      console.error(err);
      send500(res);
    }
  }),
);

// PUT: Update attendance status
router.put(
  '/update',
  checkUserRole(['admin', 'teacher', 'counselor']),
  asyncHandler(async (req, res) => {
    if (req.user) logger.info({ useremail: req.user.email }, ' courses/attendance/update ');
    const { attendanceid, status } = req.body;
    try {
      console.log('row 369, attendanceRoutes.ts, Update attendance status');
      await attendanceController.updateAttendanceStatus(attendanceid, status);
      res.status(200).json({ message: 'Attendance status updated successfully' });
    } catch (error) {
      logger.error(error);
      console.error(error);
      send500(res);
    }
  }),
);

// GET: Lectures & attendances by course ID
router.get(
  '/course/:courseid',
  checkUserRole(['admin', 'counselor', 'teacher']),
  [param('courseid').isNumeric().withMessage('Course ID must be a number')],
  validate,
  asyncHandler(async (req, res) => {
    try {
      console.log(
        'row 394, attendanceRoutes.ts, Get lectures and attendance records for a course',
      );
      const { courseid } = req.params;
      const data = await attendanceController.getLecturesAndAttendancesByCourseId(courseid);
      res.send(data);
    } catch (err) {
      logger.error(err);
      console.error(err);
      send500(res);
    }
  }),
);

// DELETE: Delete lecture by ID
router.delete(
  '/lecture/:lectureid',
  checkUserRole(['admin', 'counselor', 'teacher']),
  [param('lectureid').isNumeric().withMessage('Lecture ID must be a number')],
  validate,
  asyncHandler(async (req, res) => {
    if (req.user) logger.info({ useremail: req.user.email }, ' courses/attendance/lecture delete ');
    try {
      console.log('row 430, attendanceRoutes.ts, Delete a lecture by its ID');
      const { lectureid } = req.params;
      await lectureModel.deleteByLectureId(lectureid);
      res.status(200).json({ message: 'Lecture deleted successfully' });
    } catch (error) {
      logger.error(error);
      console.error(error);
      send500(res);
    }
  }),
);

// PUT: Close lecture by ID
router.put(
  '/lecture/close/:lectureid',
  checkUserRole(['admin', 'counselor', 'teacher']),
  [param('lectureid').isNumeric().withMessage('Lecture ID must be a number')],
  validate,
  asyncHandler(async (req, res) => {
    if (req.user) logger.info({ useremail: req.user.email }, ' courses/attendance/lecture close ');
    try {
      console.log('row 462, attendanceRoutes.ts, Close a lecture by its ID');
      const { lectureid } = req.params;
      await lectureController.closeLecture(lectureid);
      res.status(200).json({ message: 'Lecture closed successfully' });
    } catch (error) {
      logger.error(error);
      console.error(error);
      send500(res);
    }
  }),
);

// GET: Open lectures by course ID
router.get(
  '/lecture/open/:courseid',
  checkUserRole(['admin', 'counselor', 'teacher']),
  [param('courseid').isNumeric().withMessage('course ID must be a number')],
  validate,
  asyncHandler(async (req, res) => {
    try {
      console.log('row 488, attendanceRoutes.ts, Get all open lectures for a course');
      const { courseid } = req.params;
      const openLectures = await lectureModel.findOpenLecturesBycourseid(toNum(courseid));
      res.status(200).json(openLectures);
    } catch (error) {
      logger.error(error);
      console.error(error);
      send500(res);
    }
  }),
);

// POST: Open lectures by teacher ID
router.post(
  '/lecture/teacheropen/',
  checkUserRole(['admin', 'counselor', 'teacher']),
  asyncHandler(async (req, res) => {
    try {
      console.log('row 508, attendanceRoutes.ts, Get all open lectures for a teacher');
      const { teacherid } = req.body;
      const openLectures = await lectureModel.findOpenLecturesByTeacherid(toNum(teacherid));
      res.status(200).json(openLectures);
    } catch (error) {
      logger.error(error);
      console.error(error);
      send500(res);
    }
  }),
);

// GET: Lectures by teacher ID
router.get(
  '/lecture/teacher/:teacherId',
  checkUserRole(['admin', 'teacher', 'counselor']),
  asyncHandler(async (req, res) => {
    if (req.user) logger.info({ useremail: req.user.email }, ' courses/attendance/ own lectures view ');
    try {
      console.log('row 532, attendanceRoutes.ts, Get all lectures for a teacher');
      const teacherId = toNum(req.params.teacherId);
      const lectures: any[] = await lectureModel.fetchLecturesByTeacherId(teacherId);

      for (const lecture of lectures) {
        const students = await lectureController.getStudentsInLecture(lecture.lectureid);
        if (students) lecture.actualStudentCount = students.length;
      }
      res.send(lectures);
    } catch (err) {
      logger.error(err);
      console.error(err);
      send500(res);
    }
  }),
);

// POST: Add late enrolling student to previous lectures
router.post(
  '/addLateEnrollingStudentToPreviousLectures',
  checkUserRole(['admin', 'teacher', 'counselor']),
  [
    body('studentnumber').isString().withMessage('Student number must be a string'),
    body('courseid').isNumeric().withMessage('Course ID must be a number'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    try {
      console.log(
        'row 570, attendanceRoutes.ts, Add late enrolling student to previous lectures as not present',
      );
      const { studentnumber, courseid } = req.body;
      await attendanceController.markStudentAsNotPresentInPastLectures(studentnumber, courseid);
      res.status(200).json('Student added to previous lectures as not present');
    } catch (err) {
      logger.error(err);
      console.error(err);
      send500(res);
    }
  }),
);

// Error handler
router.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err);
  res.status(500).json('Server error');
});

export default router;
