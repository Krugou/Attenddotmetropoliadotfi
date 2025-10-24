import express, { Router, type Request, type Response, type NextFunction, type RequestHandler } from 'express';
import { param, body } from 'express-validator';
import workLogController from '../controllers/worklogcontroller.js';
import logger from '../utils/logger.js';
import checkUserRole from '../utils/checkRole.js';
import validate from '../utils/validate.js';
import work_log_courses from '../models/work_log_coursemodel.js';
import work_log_entries from '../models/work_log_entrymodel.js';

const router: Router = express.Router();

// Helpers
const asyncHandler =
  (fn: RequestHandler) =>
    (req: Request, res: Response, next: NextFunction) =>
      Promise.resolve(fn(req, res, next)).catch(next);

const send500 = (res: Response, msg = 'Internal server error') =>
  res.status(500).json({ error: msg });

const toNum = (v: string) => Number(v);

// Routes

// POST: Create worklog course
router.post(
  '/',
  asyncHandler(async (req, res) => {
    try {
      console.log('row 13, worklogroutes.ts, creating worklog course');
      const result = await workLogController.createWorkLogCourse(req.body);
      res.send(result);
    } catch (error) {
      logger.error('Error creating worklog course:', error);
      res.status(500).json({ error: 'Failed to create worklog course' });
    }
  })
);

// GET: Get worklog course details by course ID
router.get(
  '/:courseId',
  checkUserRole(['admin', 'counselor', 'teacher']),
  asyncHandler(async (req, res) => {
    try {
      console.log('row 27, worklogroutes.ts, getting worklog course by id');
      const courseId = toNum(req.params.courseId);
      const result = await workLogController.getWorkLogCourseDetails(courseId);
      res.send(result);
    } catch (error) {
      logger.error(error);
      send500(res);
    }
  })
);

// PUT: Update worklog course by ID
router.put(
  '/:worklogId',
  checkUserRole(['admin', 'counselor', 'teacher']),
  asyncHandler(async (req, res) => {
    try {
      console.log('row 42, worklogroutes.ts, updating worklog course by id');
      const worklogId = toNum(req.params.worklogId);
      const { modifiedData } = req.body;
      if (!modifiedData) {
        res.status(400).json({ error: 'No modified data provided' });
        return;
      }
      const result = await workLogController.updateWorkLogCourse(worklogId, modifiedData);
      res.send(result);
    } catch (error) {
      logger.error('Error updating worklog course:', error);
      send500(res, 'Failed to update worklog course');
    }
  })
);

// DELETE: Delete worklog course by ID
router.delete(
  '/:worklogId',
  checkUserRole(['admin', 'counselor', 'teacher']),
  asyncHandler(async (req, res) => {
    try {
      console.log('row 65, worklogroutes.ts, deleting worklog course by id');
      const worklogId = toNum(req.params.worklogId);
      const result = await workLogController.deleteWorkLog(worklogId);
      res.send({ success: true, message: 'Worklog deleted successfully', result });
    } catch (error) {
      logger.error('Error deleting worklog:', error);
      res.status(500).json({ error: 'Failed to delete worklog' });
    }
  })
);

// POST: Create worklog entry
router.post(
  '/entries',
  checkUserRole(['admin', 'counselor', 'teacher']),
  asyncHandler(async (req, res) => {
    try {
      console.log('row 87, worklogroutes.ts, creating worklog entry');
      const result = await workLogController.createWorkLogEntry(req.body);
      res.send(result);
    } catch (error) {
      logger.error(error);
      send500(res);
    }
  })
);

// GET: Get worklog entries by user ID
router.get(
  '/entries/user/:userId',
  checkUserRole(['admin', 'counselor', 'teacher']),
  asyncHandler(async (req, res) => {
    try {
      console.log('row 101, worklogroutes.ts, getting worklog entries by user id');
      const userId = toNum(req.params.userId);
      const entries = await workLogController.getWorkLogEntriesByUser(userId);
      res.send(entries);
    } catch (error) {
      logger.error(error);
      send500(res);
    }
  })
);

// PUT: Update worklog entry status
router.put(
  '/entries/:entryId/status',
  checkUserRole(['admin', 'counselor', 'teacher']),
  asyncHandler(async (req, res) => {
    try {
      console.log('row 116, worklogroutes.ts, updating worklog entry status');
      const entryId = toNum(req.params.entryId);
      const status = req.body.status as 0 | 1 | 2 | 3;
      const result = await workLogController.updateWorkLogEntryStatus(entryId, status);
      res.send(result);
    } catch (error) {
      logger.error(error);
      send500(res);
    }
  })
);

// POST: Create worklog group for a course
router.post(
  '/:courseId/groups',
  checkUserRole(['admin', 'counselor', 'teacher']),
  [
    param('courseId').isInt().withMessage('Invalid courseId'),
    body('name').isString().trim().notEmpty().withMessage('Group name is required'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    try {
      console.log('row 145, worklogroutes.ts, creating worklog group');
      const courseId = toNum(req.params.courseId);
      const { name } = req.body;

      if (!courseId || Number.isNaN(courseId)) {
        res.status(400).json({ error: 'Invalid course ID' });
        return;
      }
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({ error: 'Valid group name is required' });
        return;
      }

      const groupId = await workLogController.createWorkLogGroup(courseId, name.trim());
      res.json({ success: true, groupId });
    } catch (error) {
      logger.error('Error creating worklog group:', error);
      if (error instanceof Error) res.status(400).json({ error: error.message });
      else res.status(500).json({ error: 'Failed to create worklog group' });
    }
  })
);

// POST: Assign students to worklog group
router.post(
  '/group/:groupId/students',
  checkUserRole(['admin', 'counselor', 'teacher']),
  asyncHandler(async (req, res) => {
    try {
      console.log('row 181, worklogroutes.ts, assigning students to group');
      const groupId = toNum(req.params.groupId);
      const { studentIds } = req.body;

      if (!Array.isArray(studentIds)) {
        res.status(400).json({ error: 'studentIds must be an array' });
        return;
      }

      const results = await Promise.all(
        studentIds.map(async (studentId: number) => {
          try {
            return await workLogController.assignStudentToGroup(groupId, studentId);
          } catch (error) {
            logger.error(`Error assigning student ${studentId} to group ${groupId}:`, error);
            return { studentId, error: 'Failed to assign student to group' };
          }
        })
      );

      res.send({ success: true, results, message: 'Students assigned to group successfully' });
    } catch (error) {
      logger.error('Error in group student assignment:', error);
      res.status(500).json({ error: 'Failed to assign students to group' });
    }
  })
);

// GET: Get students in a worklog group
router.get(
  '/group/:groupId/students',
  checkUserRole(['admin', 'counselor', 'teacher']),
  asyncHandler(async (req, res) => {
    try {
      console.log('row 224, worklogroutes.ts, getting students in group');
      const groupId = toNum(req.params.groupId);
      const result = await workLogController.getWorkLogGroupStudents(groupId);
      res.send(result);
    } catch (error) {
      logger.error('Error getting worklog group students:', error);
      send500(res);
    }
  })
);

// POST: Assign user to a worklog course
router.post(
  '/courses/:courseId/users',
  checkUserRole(['admin', 'counselor', 'teacher']),
  asyncHandler(async (req, res) => {
    try {
      console.log('row 239, worklogroutes.ts, assigning users to course');
      const courseId = toNum(req.params.courseId);
      const { userId } = req.body;
      const result = await workLogController.assignUserToCourse(userId, courseId);
      res.send(result);
    } catch (error) {
      logger.error(error);
      send500(res);
    }
  })
);

// GET: Get worklog stats for user (optionally by course)
router.get(
  '/stats/:userId',
  checkUserRole(['admin', 'counselor', 'teacher']),
  asyncHandler(async (req, res) => {
    try {
      console.log('row 259, worklogroutes.ts, getting worklog stats');
      const userId = toNum(req.params.userId);
      const courseId = req.query.courseId ? toNum(String(req.query.courseId)) : undefined;
      const stats = await workLogController.getWorkLogStats(userId, courseId);
      res.send(stats);
    } catch (error) {
      logger.error(error);
      send500(res);
    }
  })
);

// GET: Check if a worklog code exists
router.get(
  '/checkcode/:code',
  checkUserRole(['admin', 'counselor', 'teacher']),
  asyncHandler(async (req, res) => {
    try {
      console.log('row 278, worklogroutes.ts, checking worklog code');
      const { code } = req.params;
      const exists = await workLogController.checkWorklogCodeExists(code);
      res.send({ exists });
    } catch (error) {
      logger.error('Error checking worklog code:', error);
      res.status(500).json({ error: 'Failed to check worklog code' });
    }
  })
);

// GET: Get worklog courses by instructor email
router.get(
  '/instructor/:email',
  checkUserRole(['admin', 'counselor', 'teacher']),
  asyncHandler(async (req, res) => {
    try {
      console.log('row 294, worklogroutes.ts, getting worklog instructor');
      const { email } = req.params;
      const courses = await workLogController.getWorkLogCoursesByInstructor(email);
      res.send(courses);
    } catch (error) {
      logger.error('Error getting worklog courses by instructor:', error);
      res.status(500).json({ error: 'Failed to get worklog courses' });
    }
  })
);

// GET: Get worklog students for a course
router.get(
  '/:courseId/students',
  checkUserRole(['admin', 'counselor', 'teacher']),
  asyncHandler(async (req, res) => {
    try {
      console.log('row 312, worklogroutes.ts, getting worklog students');
      const { courseId } = req.params;
      const result = await workLogController.getWorkLogStudentsByCourse(courseId);
      res.send(result);
    } catch (error) {
      if (error instanceof Error) res.status(400).json({ error: error.message });
      else send500(res);
    }
  })
);

// GET: Get worklog groups for a course
router.get(
  '/:courseId/groups',
  checkUserRole(['admin', 'counselor', 'teacher']),
  asyncHandler(async (req, res) => {
    try {
      console.log('row 333, worklogroutes.ts, getting worklog groups');
      const { courseId } = req.params;
      const result = await workLogController.getWorkLogGroupsByCourse(courseId);
      res.send(result);
    } catch (error) {
      logger.error('Error getting worklog course groups:', error);
      send500(res);
    }
  })
);

// GET: Get worklog group details by course & group IDs
router.get(
  '/group/:courseId/:groupId',
  checkUserRole(['admin', 'counselor', 'teacher']),
  asyncHandler(async (req, res) => {
    try {
      console.log('row 348, worklogroutes.ts, getting worklog group details');
      const courseId = toNum(req.params.courseId);
      const groupId = toNum(req.params.groupId);
      const result = await workLogController.getWorkLogGroupDetails(courseId, groupId);
      res.send(result);
    } catch (error) {
      logger.error('Error getting worklog group details:', error);
      res.status(500).json({ error: 'Failed to get worklog group details' });
    }
  })
);

// GET: Get active worklog courses by student email
router.get(
  '/student/active/:email',
  checkUserRole(['admin', 'teacher', 'student']),
  [param('email').isEmail()],
  validate,
  asyncHandler(async (req, res) => {
    try {
      console.log('row 369, worklogroutes.ts, getting active courses by email');
      const { email } = req.params;
      const courses = await work_log_courses.getActiveCoursesByStudentEmail(email);
      res.send(courses);
    } catch {
      res.status(500).json({ error: 'Failed to fetch active courses' });
    }
  })
);

// GET: Get active worklog entries by user ID (with details)
router.get(
  '/active/:userId',
  checkUserRole(['admin', 'teacher', 'student']),
  [param('userId').isInt()],
  validate,
  asyncHandler(async (req, res) => {
    try {
      console.log('row 388, worklogroutes.ts, getting active courses by user');
      const userId = toNum(req.params.userId);
      const activeEntries = await work_log_entries.getActiveEntriesByUserId(userId);

      if (activeEntries.length === 0) {
        res.send([]);
        return;
      }

      const entriesWithDetails = await Promise.all(
        activeEntries.map(async (entry) => {
          if (entry.work_log_course_id) {
            console.log(
              'row 405, worklogroutes.ts, if entry has work_log_course_id, get course details'
            );
            const courseDetails = await work_log_courses.getWorkLogCourseById(entry.work_log_course_id);
            return { ...entry, course: courseDetails[0], entryType: 'course' as const };
          } else if (entry.work_log_practicum_id) {
            console.log(
              'row 419, worklogroutes.ts, if entry has work_log_practicum_id, get practicum details'
            );
            const practicum = (await import('../models/practicummodels.js')).default;
            const practicumDetails = await practicum.getPracticumById(entry.work_log_practicum_id);
            return { ...entry, course: practicumDetails[0], entryType: 'practicum' as const };
          }
          return { ...entry, entryType: 'unknown' as const };
        })
      );

      res.send(entriesWithDetails);
    } catch (error) {
      logger.error('Error fetching active entries with details:', error);
      res.status(500).json({ error: 'Failed to fetch active entries' });
    }
  })
);

// POST: Create worklog entry (course)
router.post(
  '/entries/create',
  [
    body('userId').isInt({ gt: 0 }).withMessage('Invalid userId'),
    body('courseId').isInt({ gt: 0 }).withMessage('Invalid courseId'),
    body('startTime').isISO8601().toDate().withMessage('Invalid startTime'),
    body('endTime').isISO8601().toDate().withMessage('Invalid endTime'),
    body('description').isString().trim().notEmpty().withMessage('Invalid description'),
    body('status').optional().isIn([0, 1, 2, 3]).withMessage('Invalid status'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    try {
      console.log('row 466, worklogroutes.ts, creating worklog entry');
      const result = await workLogController.createWorkLogEntry(req.body);
      res.send(result);
    } catch (error) {
      logger.error('Error creating worklog entry:', error);
      res.status(500).json({ error: 'Failed to create worklog entry' });
    }
  })
);

// PUT: Close worklog entry
router.put(
  '/entries/close/:entryId',
  checkUserRole(['admin', 'teacher', 'student']),
  asyncHandler(async (req, res) => {
    try {
      console.log('row 481, worklogroutes.ts, closing worklog entry');
      const entryId = toNum(req.params.entryId);
      const result = await workLogController.closeWorkLogEntry(entryId);
      res.send(result);
    } catch (error) {
      logger.error('Error closing worklog entry:', error);
      res.status(500).json({ error: 'Failed to close worklog entry' });
    }
  })
);

// GET: Get all worklog entries for a student user
router.get(
  '/entries/all/:userId',
  checkUserRole(['admin', 'teacher', 'student']),
  [param('userId').isInt().withMessage('Invalid userId')],
  validate,
  asyncHandler(async (req, res) => {
    try {
      console.log('row 499, worklogroutes.ts, getting all worklog entries');
      const userId = toNum(req.params.userId);
      const entries = await workLogController.getWorkLogEntriesByStudentUser(userId);
      res.send(entries);
    } catch (error) {
      logger.error('Error fetching all worklog entries:', error);
      res.status(500).json({ error: 'Failed to fetch worklog entries' });
    }
  })
);

// DELETE: Delete worklog entry by ID
router.delete(
  '/entries/:entryId',
  checkUserRole(['admin', 'teacher', 'student']),
  [param('entryId').isInt().withMessage('Invalid entryId')],
  validate,
  asyncHandler(async (req, res) => {
    try {
      console.log('row 519, worklogroutes.ts, deleting worklog entry');
      const entryId = toNum(req.params.entryId);
      const result = await workLogController.deleteWorkLogEntry(entryId);
      res.send({ success: true, message: 'Entry deleted successfully', result });
    } catch (error) {
      logger.error('Error deleting worklog entry:', error);
      res.status(500).json({ error: 'Failed to delete worklog entry' });
    }
  })
);

// PUT: Update worklog entry by ID
router.put(
  '/entries/:entryId',
  checkUserRole(['admin', 'teacher', 'student']),
  [
    param('entryId').isInt().withMessage('Invalid entryId'),
    body('description').optional().isString().trim(),
    body('startTime').optional().isISO8601().toDate(),
    body('endTime').optional().isISO8601().toDate(),
    body('status').optional().isIn([0, 1, 2, 3]),
  ],
  validate,
  asyncHandler(async (req, res) => {
    try {
      console.log('row 547, worklogroutes.ts, updating worklog entry');
      const entryId = toNum(req.params.entryId);
      const updatedData = req.body;
      const result = await workLogController.updateWorkLogEntry(entryId, updatedData);
      res.send({ success: true, message: 'Entry updated successfully', result });
    } catch (error) {
      logger.error('Error updating worklog entry:', error);
      res.status(500).json({ error: 'Failed to update worklog entry' });
    }
  })
);

// GET: Check if a student already has a group in a course
router.get(
  '/student/group/:userId/:courseId',
  checkUserRole(['admin', 'counselor', 'teacher']),
  [param('userId').isInt().withMessage('Invalid userId'), param('courseId').isInt().withMessage('Invalid courseId')],
  validate,
  asyncHandler(async (req, res) => {
    try {
      console.log('row 576, worklogroutes.ts, getting student group by group id');
      const userId = toNum(req.params.userId);
      const courseId = toNum(req.params.courseId);
      const existingGroup = await workLogController.checkStudentExistingGroup(userId, courseId);
      res.send({ existingGroup });
    } catch (error) {
      logger.error('Error checking student group:', error);
      res.status(500).json({ error: 'Failed to check student group' });
    }
  })
);

// POST: Add a new student to a worklog course
router.post(
  '/:courseId/students/new',
  checkUserRole(['admin', 'counselor', 'teacher']),
  [
    param('courseId').isInt().withMessage('Invalid courseId'),
    body('email').isEmail().withMessage('Invalid email'),
    body('first_name').isString().notEmpty().withMessage('Invalid first name'),
    body('last_name').isString().notEmpty().withMessage('Invalid last name'),
    body('studentnumber').isString().notEmpty().withMessage('Invalid student number'),
    body('studentGroupId').optional().isInt().withMessage('Invalid student group ID'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    try {
      console.log('row 611, worklogroutes.ts, adding new student to course');
      const courseId = toNum(req.params.courseId);
      const result = await workLogController.addNewStudentToWorklog(courseId, req.body);
      res.json(result);
    } catch (error) {
      logger.error('Error adding student to worklog course:', error);
      res.status(500).json({ error: 'Failed to add student to worklog course' });
    }
  })
);

// DELETE: Remove a student from a worklog group
router.delete(
  '/group/:groupId/student/:studentId',
  checkUserRole(['admin', 'counselor', 'teacher']),
  [param('groupId').isInt().withMessage('Invalid groupId'), param('studentId').isInt().withMessage('Invalid studentId')],
  validate,
  asyncHandler(async (req, res) => {
    try {
      console.log('row 635, worklogroutes.ts, removing student from group');
      const groupId = toNum(req.params.groupId);
      const studentId = toNum(req.params.studentId);
      await workLogController.removeStudentFromGroup(groupId, studentId);
      res.json({ success: true, message: 'Student removed from group successfully' });
    } catch (error) {
      logger.error('Error removing student from group:', error);
      res.status(500).json({ error: 'Failed to remove student from group' });
    }
  })
);

// GET: Get practicum entries by practicum ID
router.get(
  '/practicum/entries/:practicumId',
  checkUserRole(['admin', 'counselor', 'teacher', 'student']),
  [param('practicumId').isInt().withMessage('Invalid practicumId')],
  validate,
  asyncHandler(async (req, res) => {
    try {
      console.log('row 659, worklogroutes.ts, getting practicum entries');
      const practicumId = toNum(req.params.practicumId);
      const entries = await work_log_entries.getWorkLogEntriesByPracticum(practicumId);
      res.json(entries);
    } catch (error) {
      logger.error('Error getting practicum entries:', error);
      res.status(500).json({ error: 'Failed to get practicum entries' });
    }
  })
);

// POST: Create practicum entry
router.post(
  '/practicum/entries/create',
  [
    body('userId').isInt({ gt: 0 }).withMessage('Invalid userId'),
    body('courseId').isInt({ gt: 0 }).withMessage('Invalid practicum ID'),
    body('startTime').isISO8601().toDate().withMessage('Invalid startTime'),
    body('endTime').isISO8601().toDate().withMessage('Invalid endTime'),
    body('description').isString().trim().notEmpty().withMessage('Invalid description'),
    body('status').optional().isIn([0, 1, 2, 3]).withMessage('Invalid status'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    try {
      console.log('row 689, worklogroutes.ts, creating practicum entry');
      const params = {
        ...req.body,
        work_log_practicum_id: req.body.courseId,
        work_log_course_id: null,
      };
      delete (params as any).courseId;

      const result = await workLogController.createWorkLogEntryPracticum(params);
      res.send(result);
    } catch (error) {
      logger.error('Error creating practicum entry:', error);
      res.status(500).json({ error: 'Failed to create practicum entry' });
    }
  })
);

// PUT: Close practicum entry
router.put(
  '/practicum/entries/close/:entryId',
  checkUserRole(['admin', 'teacher', 'student']),
  asyncHandler(async (req, res) => {
    try {
      console.log('row 714, worklogroutes.ts, closing practicum entry');
      const entryId = toNum(req.params.entryId);
      const result = await workLogController.closeWorkLogEntry(entryId);
      res.send(result);
    } catch (error) {
      logger.error('Error closing practicum entry:', error);
      res.status(500).json({ error: 'Failed to close practicum entry' });
    }
  })
);

// Error handler
router.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

export default router;
