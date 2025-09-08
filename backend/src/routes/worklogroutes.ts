import express, {Request, Response, Router} from 'express';
import workLogController from '../controllers/worklogcontroller.js';
import logger from '../utils/logger.js';
import checkUserRole from '../utils/checkRole.js';
const router: Router = express.Router();
import {param, body} from 'express-validator';
import validate from '../utils/validate.js';
import work_log_courses from '../models/work_log_coursemodel.js';
import work_log_entries from '../models/work_log_entrymodel.js';

router.post('/', async (req: Request, res: Response) => {
  try {
    console.log("row 13, worklogroutes.ts, creating worklog course");
    const result = await workLogController.createWorkLogCourse(req.body);
    res.send(result);
  } catch (error) {
    logger.error('Error creating worklog course:', error);
    res.status(500).json({error: 'Failed to create worklog course'});
  }
});

router.get(
  '/:courseId',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req: Request, res: Response) => {
    try {
      console.log("row 27, worklogroutes.ts, getting worklog course by id");
      const courseId = Number(req.params.courseId);
      const result = await workLogController.getWorkLogCourseDetails(courseId);
      res.send(result);
    } catch (error) {
      logger.error(error);
    }
  },
);

router.put(
  '/:worklogId',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("row 42, worklogroutes.ts, updating worklog course by id");
      const worklogId = Number(req.params.worklogId);
      const {modifiedData} = req.body;
      if (!modifiedData) {
        res.status(400).json({error: 'No modified data provided'});
        return;
      }
      const result = await workLogController.updateWorkLogCourse(
        worklogId,
        modifiedData,
      );
      res.send(result);
    } catch (error) {
      logger.error('Error updating worklog course:', error);
    }
  },
);

router.delete(
  '/:worklogId',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req: Request, res: Response) => {
    try {
      console.log("row 65, worklogroutes.ts, deleting worklog course by id");
      const worklogId = Number(req.params.worklogId);
      const result = await workLogController.deleteWorkLog(worklogId);

      res.send({
        success: true,
        message: 'Worklog deleted successfully',
        result,
      });
    } catch (error) {
      logger.error('Error deleting worklog:', error);
      res.status(500).json({error: 'Failed to delete worklog'});
    }
  },
);

// Update other routes to remove /worklog prefix
router.post(
  '/entries',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req: Request, res: Response) => {
    try {
      console.log("row 87, worklogroutes.ts, creating worklog entry");
      const result = await workLogController.createWorkLogEntry(req.body);
      res.send(result);
    } catch (error) {
      logger.error(error);
    }
  },
);

router.get(
  '/entries/user/:userId',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req: Request, res: Response) => {
    try {
      console.log("row 101, worklogroutes.ts, getting worklog entries by user id");
      const userId = Number(req.params.userId);
      const entries = await workLogController.getWorkLogEntriesByUser(userId);
      res.send(entries);
    } catch (error) {
      logger.error(error);
    }
  },
);

router.put(
  '/entries/:entryId/status',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req: Request, res: Response) => {
    try {
      console.log("row 116, worklogroutes.ts, updating worklog entry status");
      const entryId = Number(req.params.entryId);
      const status = req.body.status as 0 | 1 | 2 | 3;
      const result = await workLogController.updateWorkLogEntryStatus(
        entryId,
        status,
      );
      res.send(result);
    } catch (error) {
      logger.error(error);
    }
  },
);

// Group Management Routes
router.post(
  '/:courseId/groups',
  checkUserRole(['admin', 'counselor', 'teacher']),
  [
    param('courseId').isInt().withMessage('Invalid courseId'),
    body('name')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Group name is required'),
  ],
  validate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("row 145, worklogroutes.ts, creating worklog group");
      const courseId = Number(req.params.courseId);
      const {name} = req.body;

      // Additional validation
      if (!courseId || isNaN(courseId)) {
        res.status(400).json({error: 'Invalid course ID'});
        return;
      }

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({error: 'Valid group name is required'});
        return;
      }

      const result = await workLogController.createWorkLogGroup(
        courseId,
        name.trim(),
      );
      res.json({success: true, groupId: result});
    } catch (error) {
      logger.error('Error creating worklog group:', error);
      if (error instanceof Error) {
        res.status(400).json({error: error.message});
      } else {
        res.status(500).json({error: 'Failed to create worklog group'});
      }
    }
  },
);

router.post(
  '/group/:groupId/students',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("row 181, worklogroutes.ts, assigning students to group");
      const groupId = Number(req.params.groupId);
      const {studentIds} = req.body;

      if (!Array.isArray(studentIds)) {
        res.status(400).json({error: 'studentIds must be an array'});
        return;
      }

      const results = await Promise.all(
        studentIds.map(async (studentId) => {
          try {
            return await workLogController.assignStudentToGroup(
              groupId,
              studentId,
            );
          } catch (error) {
            logger.error(
              `Error assigning student ${studentId} to group ${groupId}:`,
              error,
            );
            return {studentId, error: 'Failed to assign student to group'};
          }
        }),
      );

      res.send({
        success: true,
        results,
        message: 'Students assigned to group successfully',
      });
    } catch (error) {
      logger.error('Error in group student assignment:', error);
      res.status(500).json({error: 'Failed to assign students to group'});
    }
  },
);

router.get(
  '/group/:groupId/students',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req: Request, res: Response) => {
    try {
      console.log("row 224, worklogroutes.ts, getting students in group");
      const groupId = Number(req.params.groupId);
      const result = await workLogController.getWorkLogGroupStudents(groupId);
      res.send(result);
    } catch (error) {
      logger.error('Error getting worklog group students:', error);
    }
  },
);

router.post(
  '/courses/:courseId/users',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req: Request, res: Response) => {
    try {
      console.log("row 239, worklogroutes.ts, assigning users to course");
      const courseId = Number(req.params.courseId);
      const {userId} = req.body;
      const result = await workLogController.assignUserToCourse(
        userId,
        courseId,
      );
      res.send(result);
    } catch (error) {
      logger.error(error);
    }
  },
);

// Statistics Route
router.get(
  '/stats/:userId',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req: Request, res: Response) => {
    try {
      console.log("row 259, worklogroutes.ts, getting worklog stats");
      const userId = Number(req.params.userId);
      // Get optional courseId from query params
      const courseId = req.query.courseId
        ? Number(req.query.courseId)
        : undefined;
      const stats = await workLogController.getWorkLogStats(userId, courseId);
      res.send(stats);
    } catch (error) {
      logger.error(error);
    }
  },
);

router.get(
  '/checkcode/:code',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req: Request, res: Response) => {
    try {
      console.log("row 278, worklogroutes.ts, checking worklog code");
      const code = req.params.code;
      const exists = await workLogController.checkWorklogCodeExists(code);
      res.send({exists});
    } catch (error) {
      logger.error('Error checking worklog code:', error);
      res.status(500).json({error: 'Failed to check worklog code'});
    }
  },
);

router.get(
  '/instructor/:email',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req: Request, res: Response) => {
    try {
      console.log("row 294, worklogroutes.ts, getting worklog instructor");
      const email = req.params.email;
      const courses = await workLogController.getWorkLogCoursesByInstructor(
        email,
      );
      res.send(courses);
    } catch (error) {
      logger.error('Error getting worklog courses by instructor:', error);
      res.status(500).json({error: 'Failed to get worklog courses'});
    }
  },
);

router.get(
  '/:courseId/students',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req: Request, res: Response) => {
    try {
      console.log("row 312, worklogroutes.ts, getting worklog students");
      const {courseId} = req.params;
      const result = await workLogController.getWorkLogStudentsByCourse(
        courseId,
      );
      res.send(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({error: error.message});
      } else {
        res.status(500).json({error: 'Internal server error'});
      }
    }
  },
);

router.get(
  '/:courseId/groups',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req: Request, res: Response) => {
    try {
      console.log("row 333, worklogroutes.ts, getting worklog groups");
      const {courseId} = req.params;
      const result = await workLogController.getWorkLogGroupsByCourse(courseId);
      res.send(result);
    } catch (error) {
      logger.error('Error getting worklog course groups:', error);
    }
  },
);

router.get(
  '/group/:courseId/:groupId',
  checkUserRole(['admin', 'counselor', 'teacher']),
  async (req: Request, res: Response) => {
    try {
      console.log("row 348, worklogroutes.ts, getting worklog group details");
      const courseId = Number(req.params.courseId);
      const groupId = Number(req.params.groupId);
      const result = await workLogController.getWorkLogGroupDetails(
        courseId,
        groupId,
      );
      res.send(result);
    } catch (error) {
      logger.error('Error getting worklog group details:', error);
      res.status(500).json({error: 'Failed to get worklog group details'});
    }
  },
);
router.get(
  '/student/active/:email',
  checkUserRole(['admin', 'teacher', 'student']),
  [param('email').isEmail()],
  validate,
  async (req: Request, res: Response) => {
    try {
      console.log("row 369, worklogroutes.ts, getting active courses by email");
      const {email} = req.params;
      const courses = await work_log_courses.getActiveCoursesByStudentEmail(
        email,
      );
      res.send(courses);
    } catch (error) {
      res.status(500).json({error: 'Failed to fetch active courses'});
    }
  },
);

router.get(
  '/active/:userId',
  checkUserRole(['admin', 'teacher', 'student']),
  [param('userId').isInt()],
  validate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("row 388, worklogroutes.ts, getting active courses by user");
      const userId = Number(req.params.userId);

      // Get both regular worklog entries and practicum entries
      const activeEntries = await work_log_entries.getActiveEntriesByUserId(
        userId,
      );

      if (activeEntries.length === 0) {
        res.send([]);
        return;
      }

      // Get course or practicum details for each active entry
      const entriesWithDetails = await Promise.all(
        activeEntries.map(async (entry) => {
          // If entry has work_log_course_id, get course details
          if (entry.work_log_course_id) {
            console.log("row 405, worklogroutes.ts, if entry has work_log_course_id, get course details");
            const courseDetails = await work_log_courses.getWorkLogCourseById(
              entry.work_log_course_id,
            );

            return {
              ...entry,
              course: courseDetails[0],
              entryType: 'course',
            };
          }
          // If entry has work_log_practicum_id, get practicum details
          else if (entry.work_log_practicum_id) {
            console.log("row 419, worklogroutes.ts, if entry has work_log_practicum_id, get practicum details");
            // Import practicum model if not already imported
            const practicum = (await import('../models/practicummodels.js'))
              .default;
            const practicumDetails = await practicum.getPracticumById(
              entry.work_log_practicum_id,
            );

            return {
              ...entry,
              course: practicumDetails[0],
              entryType: 'practicum',
            };
          }
          // If neither, just return the entry as is
          return {
            ...entry,
            entryType: 'unknown',
          };
        }),
      );

      res.send(entriesWithDetails);
    } catch (error) {
      logger.error('Error fetching active entries with details:', error);
      res.status(500).json({error: 'Failed to fetch active entries'});
    }
  },
);

router.post(
  '/entries/create',
  [
    body('userId').isInt({gt: 0}).withMessage('Invalid userId'),
    body('courseId').isInt({gt: 0}).withMessage('Invalid courseId'),
    body('startTime').isISO8601().toDate().withMessage('Invalid startTime'),
    body('endTime').isISO8601().toDate().withMessage('Invalid endTime'),
    body('description')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Invalid description'),
    body('status').optional().isIn([0, 1, 2, 3]).withMessage('Invalid status'),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      console.log("row 466, worklogroutes.ts, creating worklog entry");
      const result = await workLogController.createWorkLogEntry(req.body);
      res.send(result);
    } catch (error) {
      logger.error('Error creating worklog entry:', error);
      res.status(500).json({error: 'Failed to create worklog entry'});
    }
  },
);
// route to update status to 2 and add update end dane /entries/close
router.put(
  '/entries/close/:entryId',
  checkUserRole(['admin', 'teacher', 'student']),
  async (req: Request, res: Response) => {
    try {
      console.log("row 481, worklogroutes.ts, closing worklog entry");
      const entryId = Number(req.params.entryId);
      const result = await workLogController.closeWorkLogEntry(entryId);
      res.send(result);
    } catch (error) {
      logger.error('Error closing worklog entry:', error);
      res.status(500).json({error: 'Failed to close worklog entry'});
    }
  },
);

router.get(
  '/entries/all/:userId',
  checkUserRole(['admin', 'teacher', 'student']),
  [param('userId').isInt().withMessage('Invalid userId')],
  validate,
  async (req: Request, res: Response) => {
    try {
      console.log("row 499, worklogroutes.ts, getting all worklog entries");
      const userId = Number(req.params.userId);
      const entries = await workLogController.getWorkLogEntriesByStudentUser(
        userId,
      );
      res.send(entries);
    } catch (error) {
      logger.error('Error fetching all worklog entries:', error);
      res.status(500).json({error: 'Failed to fetch worklog entries'});
    }
  },
);

router.delete(
  '/entries/:entryId',
  checkUserRole(['admin', 'teacher', 'student']),
  [param('entryId').isInt().withMessage('Invalid entryId')],
  validate,
  async (req: Request, res: Response) => {
    try {
      console.log("row 519, worklogroutes.ts, deleting worklog entry");
      const entryId = Number(req.params.entryId);
      const result = await workLogController.deleteWorkLogEntry(entryId);
      res.send({
        success: true,
        message: 'Entry deleted successfully',
        result,
      });
    } catch (error) {
      logger.error('Error deleting worklog entry:', error);
      res.status(500).json({error: 'Failed to delete worklog entry'});
    }
  },
);

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
  async (req: Request, res: Response) => {
    try {
      console.log("row 547, worklogroutes.ts, updating worklog entry");
      const entryId = Number(req.params.entryId);
      const updatedData = req.body;
      const result = await workLogController.updateWorkLogEntry(
        entryId,
        updatedData,
      );
      res.send({
        success: true,
        message: 'Entry updated successfully',
        result,
      });
    } catch (error) {
      logger.error('Error updating worklog entry:', error);
      res.status(500).json({error: 'Failed to update worklog entry'});
    }
  },
);

router.get(
  '/student/group/:userId/:courseId',
  checkUserRole(['admin', 'counselor', 'teacher']),
  [
    param('userId').isInt().withMessage('Invalid userId'),
    param('courseId').isInt().withMessage('Invalid courseId'),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      console.log("row 576, worklogroutes.ts, getting student group by group id");
      const userId = Number(req.params.userId);
      const courseId = Number(req.params.courseId);
      const existingGroup = await workLogController.checkStudentExistingGroup(
        userId,
        courseId,
      );
      res.send({existingGroup});
    } catch (error) {
      logger.error('Error checking student group:', error);
      res.status(500).json({error: 'Failed to check student group'});
    }
  },
);

router.post(
  '/:courseId/students/new',
  checkUserRole(['admin', 'counselor', 'teacher']),
  [
    param('courseId').isInt().withMessage('Invalid courseId'),
    body('email').isEmail().withMessage('Invalid email'),
    body('first_name').isString().notEmpty().withMessage('Invalid first name'),
    body('last_name').isString().notEmpty().withMessage('Invalid last name'),
    body('studentnumber')
      .isString()
      .notEmpty()
      .withMessage('Invalid student number'),
    body('studentGroupId')
      .optional()
      .isInt()
      .withMessage('Invalid student group ID'),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      console.log("row 611, worklogroutes.ts, adding new student to course");
      const courseId = Number(req.params.courseId);
      const result = await workLogController.addNewStudentToWorklog(
        courseId,
        req.body,
      );
      res.json(result);
    } catch (error) {
      logger.error('Error adding student to worklog course:', error);
      res.status(500).json({error: 'Failed to add student to worklog course'});
    }
  },
);

router.delete(
  '/group/:groupId/student/:studentId',
  checkUserRole(['admin', 'counselor', 'teacher']),
  [
    param('groupId').isInt().withMessage('Invalid groupId'),
    param('studentId').isInt().withMessage('Invalid studentId'),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      console.log("row 635, worklogroutes.ts, removing student from group");
      const groupId = Number(req.params.groupId);
      const studentId = Number(req.params.studentId);

      await workLogController.removeStudentFromGroup(groupId, studentId);

      res.json({
        success: true,
        message: 'Student removed from group successfully',
      });
    } catch (error) {
      logger.error('Error removing student from group:', error);
      res.status(500).json({error: 'Failed to remove student from group'});
    }
  },
);

router.get(
  '/practicum/entries/:practicumId',
  checkUserRole(['admin', 'counselor', 'teacher', 'student']),
  [param('practicumId').isInt().withMessage('Invalid practicumId')],
  validate,
  async (req: Request, res: Response) => {
    try {
      console.log("row 659, worklogroutes.ts, getting practicum entries");
      const practicumId = Number(req.params.practicumId);
      const entries = await work_log_entries.getWorkLogEntriesByPracticum(
        practicumId,
      );
      res.json(entries);
    } catch (error) {
      logger.error('Error getting practicum entries:', error);
      res.status(500).json({error: 'Failed to get practicum entries'});
    }
  },
);

router.post(
  '/practicum/entries/create',
  [
    body('userId').isInt({gt: 0}).withMessage('Invalid userId'),
    body('courseId').isInt({gt: 0}).withMessage('Invalid practicum ID'), // This will be the practicum ID
    body('startTime').isISO8601().toDate().withMessage('Invalid startTime'),
    body('endTime').isISO8601().toDate().withMessage('Invalid endTime'),
    body('description')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Invalid description'),
    body('status').optional().isIn([0, 1, 2, 3]).withMessage('Invalid status'),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      console.log("row 689, worklogroutes.ts, creating practicum entry");
      // Transform request to use work_log_practicum_id instead of courseId
      const params = {
        ...req.body,
        work_log_practicum_id: req.body.courseId,
        work_log_course_id: null, // Ensure course ID is null for practicum entries
      };
      delete params.courseId; // Remove the courseId parameter

      const result = await workLogController.createWorkLogEntryPracticum(
        params,
      );
      res.send(result);
    } catch (error) {
      logger.error('Error creating practicum entry:', error);
      res.status(500).json({error: 'Failed to create practicum entry'});
    }
  },
);

router.put(
  '/practicum/entries/close/:entryId',
  checkUserRole(['admin', 'teacher', 'student']),
  async (req: Request, res: Response) => {
    try {
      console.log("row 714, worklogroutes.ts, closing practicum entry");
      const entryId = Number(req.params.entryId);
      const result = await workLogController.closeWorkLogEntry(entryId);
      res.send(result);
    } catch (error) {
      logger.error('Error closing practicum entry:', error);
      res.status(500).json({error: 'Failed to close practicum entry'});
    }
  },
);

export default router;
