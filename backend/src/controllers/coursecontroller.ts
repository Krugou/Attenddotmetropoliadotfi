import { RowDataPacket } from 'mysql2';
import attendanceModel from '../models/attendancemodel.js';
import courseInstructorModel from '../models/courseinstructormodel.js';
import courseModel, { default as course } from '../models/coursemodel.js';
import courseTopicModel from '../models/coursetopicmodel.js';
import studentGroupModel from '../models/studentgroupmodel.js';
import topicGroupModel from '../models/topicgroupmodel.js';
import topicinGroupModel from '../models/topicingroupmodel.js';
import topicModel from '../models/topicmodel.js';
import usercourse_topicsModel from '../models/usercourse_topicsmodel.js';
import userCourseModel from '../models/usercoursemodel.js';
import userModel from '../models/usermodel.js';
import lectureModel from '../models/lecturemodel.js';
import attendanceController from './attendancecontroller.js';


// Types
export interface Student {
  email: string;
  first_name: string;
  name: string;
  last_name: string;
  studentnumber: string;
  'Arrival Group': string;
  'Admin Groups': string;
  Program: string;
  'Form of Education': string;
  Registration: string;
  Assessment: string;
}

export interface Instructor {
  email: string;
}

export interface UserMapResults {
  usercourseid: number;
  userid: number;
  first_name: string;
  last_name: string;
  email: string;
  studentnumber: string;
  group_name: string;
  topics: string;
}

export interface CourseController {
  insertIntoCourse: (
    name: string,
    start_date: Date,
    end_date: Date,
    code: string,
    group_name: string,
    students: Student[],
    instructors: Instructor[],
    topics?: string,
    topicgroup?: string,
  ) => Promise<number>;
  getDetailsByCourseId: (courseId: string) => Promise<any>;
  updateStudentCourses: (userid: number, courseid: number) => Promise<void>;
  removeStudentCourses: (usercourseid: number) => Promise<void>;
  getStudentAndSelectedTopicsByUsercourseId: (usercourseid: number) => Promise<any>;
  addLateEnrollingStudentToPreviousLectures: (studentnumber: string, courseid: number) => Promise<void>;
}

//Helpers

// Format Date to MySQL DATETIME (YYYY-MM-DD HH:mm:ss)
const toSqlDateTime = (d: Date) => new Date(d).toISOString().slice(0, 19).replace('T', ' ');

// Resolve instructor emails to their user IDs; fail if any email is not a staff user
async function collectInstructorIds(instructors: Instructor[]) {
  const instructorUserIds: number[] = [];
  for (const instructor of instructors) {
    const existingInstructor = await userModel.checkIfEmailMatchesStaff(instructor.email);
    if (!existingInstructor) {
      return Promise.reject(new Error('[coursecontroller.ts] Instructor email not found or the user is not a staff member'));
    }
    instructorUserIds.push(existingInstructor[0].userid);
  }
  console.log(`[coursecontroller.ts] Collected ${instructorUserIds.length} instructors`);
  return instructorUserIds;
}

// Ensure student group exists; create it if missing and return its ID
async function ensureStudentGroup(group_name: string) {
  const existingStudentGroup = await studentGroupModel.checkIfGroupNameExists(group_name);
  if (existingStudentGroup && existingStudentGroup.length > 0) {
    console.warn(`[coursecontroller.ts] Student group '${group_name}' already exists`);
    return existingStudentGroup[0].studentgroupid;
  }
  const newStudentGroup = await studentGroupModel.insertIntoStudentGroup(group_name);
  console.log(`[coursecontroller.ts] Created new student group '${group_name}'`);
  return newStudentGroup.insertId;
}

// Throw if course with given code already exists (guard against duplicates)
async function assertCourseNotExists(code: string) {
  const existingCourse = await courseModel.findByCode(code);
  if (existingCourse) {
    throw new Error(`[coursecontroller.ts] Course with code '${code}' already exists`);
  }
}

// Link instructors to course (many-to-many relation inserts)
async function attachInstructorsToCourse(instructorUserIds: number[], courseId: number) {
  for (const instructorUserId of instructorUserIds) {
    await courseInstructorModel.insertCourseInstructor(instructorUserId, courseId);
  }
  console.log(`[coursecontroller.ts] Attached ${instructorUserIds.length} instructors to course ${courseId}`);
}

// Create/find topic group and topics, link topics <-> group and course <-> topics
async function handleTopicGroupAndTopics(
  topicgroup: string | undefined,
  topics: string | undefined,
  instructorUserId: number,
  courseId: number,
) {
  if (!topicgroup) return;

  try {
    let topicGroupId: number;
    const ExistingTopicGroup = await topicGroupModel.checkIfTopicGroupExists(topicgroup, instructorUserId);

    if (ExistingTopicGroup.length > 0) {
      console.warn(`[coursecontroller.ts] Topic group '${topicgroup}' already exists`);
      topicGroupId = ExistingTopicGroup[0].topicgroupid;
    } else {
      const newTopicGroup = await topicGroupModel.insertTopicGroup(topicgroup, instructorUserId);
      topicGroupId = newTopicGroup.insertId;
      console.log(`[coursecontroller.ts] Created new topic group '${topicgroup}'`);
    }

    if (topics) {
      const topicslist = JSON.parse(topics);
      console.log(`[coursecontroller.ts] Processing ${topicslist.length} topics for course ${courseId}`);
      for (const topic of topicslist) {
        let topicId: number;

        // Upsert topic
        const ExistingTopic = await topicModel.checkIfTopicExists(topic);
        if (ExistingTopic && ExistingTopic.length > 0) {
          topicId = ExistingTopic[0].topicid;
        } else {
          const newTopic = await topicModel.insertTopic(topic);
          topicId = newTopic.insertId;
          console.log(`[coursecontroller.ts] Created new topic '${topic}'`);
        }

        // Ensure topic <-> topicGroup link exists
        const topicGroupTopicRelationExists = await topicinGroupModel.checkIfTopicInGroupExists(topicGroupId, topicId);
        if (topicGroupTopicRelationExists.length === 0) {
          await topicinGroupModel.insertTopicInGroup(topicGroupId, topicId);
        }

        // Ensure course <-> topic link exists
        const relationExists = await courseTopicModel.checkIfCourseTopicRelationExists(courseId, topicId);
        if (relationExists.length === 0) {
          await courseTopicModel.insertCourseTopic(courseId, topicId);
        }
      }
    }
  } catch (error) {
    console.error('[coursecontroller.ts]', error);
  }
}

// Upsert student (by studentnumber/email), enroll to course, and backfill past lecture attendance
async function upsertAndEnrollStudent(student: Student, studentGroupId: number, courseId: number) {
  try {
    let userId: number;
    const existingUserByNumber = await userModel.checkIfUserExistsByStudentNumber(student.studentnumber);

    // Prefer student number match; otherwise try by email, or create new
    if (existingUserByNumber.length > 0) {
      userId = existingUserByNumber[0].userid;
    } else {
      const existingUserByEmail = await userModel.checkIfUserExistsByEmail(student.email);
      if (existingUserByEmail.length > 0) {
        await userModel.updateUserStudentNumber(student.studentnumber, student.email);
        userId = existingUserByEmail[0].userid;
      } else {
        const userResult = await userModel.insertStudentUser(
          student.email,
          student.first_name,
          student.last_name,
          student.studentnumber,
          studentGroupId,
        );
        userId = userResult.insertId;
        console.log(`[coursecontroller.ts] Created new user for student ${student.studentnumber}`);
      }
    }

    // Enroll to course if not already enrolled
    const existingUserCourse = await userCourseModel.checkIfUserCourseExists(userId, courseId);
    if (existingUserCourse.length === 0) {
      await userCourseModel.insertUserCourse(userId, courseId);
      console.log(`[coursecontroller.ts] Enrolled student ${student.studentnumber} to course ${courseId}`);
    }

    // Mark past TeacherLectures as "not present" for late-enrolled student
    await courseController.addLateEnrollingStudentToPreviousLectures(student.studentnumber, courseId);
  } catch (error) {
    console.error('[coursecontroller.ts]', error);
  }
}

//Controller implementation

const courseController: CourseController = {
  // Create a course with instructors, topics, and enroll all students
  async insertIntoCourse(name, start_date, end_date, code, group_name, students, instructors, topics?, topicgroup?) {
    let courseId = 0;
    try {
      const instructorUserIds = await collectInstructorIds(instructors);
      await assertCourseNotExists(code);

      const studentGroupId = await ensureStudentGroup(group_name);
      const startDateString = toSqlDateTime(start_date);
      const endDateString = toSqlDateTime(end_date);

      const courseResult = await courseModel.insertCourse(name, startDateString, endDateString, code, studentGroupId);
      courseId = courseResult.insertId;
      console.log(`[coursecontroller.ts] Created course '${name}' with ID ${courseId}`);

      await attachInstructorsToCourse(instructorUserIds, courseId);
      await handleTopicGroupAndTopics(topicgroup, topics, instructorUserIds[0], courseId);

      // Upsert + enroll each student; also backfill past lecture attendance
      for (const student of students) {
        await upsertAndEnrollStudent(student, studentGroupId, courseId);
      }
    } catch (error) {
      console.error('[coursecontroller.ts]', error);
      return Promise.reject(error);
    }
    return courseId;
  },

  // Aggregate course details: users + their selected topics + attendance + lecture counts
  getDetailsByCourseId: async (courseId: string) => {
    try {
      type DbUser = RowDataPacket & UserMapResults;
      type SelectedPart = { topicname: string };

      const allUsersOnCourse = (await course.getAllStudentsOnCourse(courseId)) as DbUser[];
      const usersAttendance = (await attendanceModel.getAttendaceByCourseId(courseId)) as DbUser[];

      // Fetch selected topics per usercourse once and memoize in a Map
      const distinctUserCourseIds = [...new Set(allUsersOnCourse.map((u) => u.usercourseid))];
      const selectedPartsByUsercourseId = new Map<number, SelectedPart[]>();

      for (const usercourseid of distinctUserCourseIds) {
        const partsRows = await usercourse_topicsModel.findUserCourseTopicByUserCourseId(usercourseid);
        const selectedParts: SelectedPart[] = (partsRows as RowDataPacket[]).map((r) => ({
          topicname: (r as any).topicname as string,
        }));
        selectedPartsByUsercourseId.set(usercourseid, selectedParts);
      }

      // Combine user info with selected topics
      type UserWithParts = UserMapResults & { selectedParts: SelectedPart[] };

      const allUsersWithParts: UserWithParts[] = allUsersOnCourse.map((u) => ({
        ...u,
        selectedParts: selectedPartsByUsercourseId.get(u.usercourseid) ?? [],
      }));

      const usersAttendanceWithParts: UserWithParts[] = usersAttendance.map((u) => ({
        ...u,
        selectedParts: selectedPartsByUsercourseId.get(u.usercourseid) ?? [],
      }));

      // Lecture counts (e.g., by topic)
      const lectureCount = await attendanceModel.getLectureCountByTopic(courseId);
      console.log(`[coursecontroller.ts] Fetched course details for course ${courseId}`);

      return {
        users: usersAttendanceWithParts, // users with attendance + topics
        lectures: [...lectureCount],     // array spread to detach driver references
        allUsers: allUsersWithParts,     // all enrolled users + topics
      };
    } catch (error) {
      console.error('[coursecontroller.ts]', error);
      throw error;
    }
  },

  // Enroll an existing user to a course (no-op if already enrolled)
  updateStudentCourses: async (userid: number, courseid: number) => {
    try {
      const existingUserCourse = await userCourseModel.checkIfUserCourseExists(userid, courseid);
      if (existingUserCourse.length === 0) {
        await userCourseModel.insertUserCourse(userid, courseid);
        console.log(`[coursecontroller.ts] Added user ${userid} to course ${courseid}`);
      } else {
        throw new Error('User is already enrolled on this course');
      }
    } catch (error) {
      console.error('[coursecontroller.ts]', error);
      throw error;
    }
  },

  // Remove a user's enrollment by usercourseid
  removeStudentCourses: async (usercourseid: number) => {
    try {
      const existingUserCourse = (await userCourseModel.getUserCourseByUsercourseid(usercourseid)) as RowDataPacket[];
      if (existingUserCourse.length > 0) {
        await userCourseModel.deleteUserCourseByUsercourseid(usercourseid);
        console.log(`[coursecontroller.ts] Removed usercourse ${usercourseid}`);
      } else {
        throw new Error('User is not enrolled on this course');
      }
    } catch (error) {
      console.error('[coursecontroller.ts]', error);
      throw error;
    }
  },

  // Get a student's info + selected topics for a specific usercourse
  getStudentAndSelectedTopicsByUsercourseId: async (usercourseid: number) => {
    try {
      let topicNames: string[] | undefined;
      const selectedParts = await usercourse_topicsModel.findUserCourseTopicByUserCourseId(usercourseid);
      const studentInfo = await userCourseModel.getStudentInfoByUsercourseid(usercourseid);
      const studentInfoObject = studentInfo[0];
      if (!studentInfoObject) {
        throw new Error('Student not found');
      }

      // Prefer explicit usercourse-topic mapping
      if (selectedParts && selectedParts.length > 0) {
        topicNames = selectedParts.map((part: any) => part.topicname);
      }

      // Fallback to topic names by usercourseid if explicit mapping missing
      if (!topicNames) {
        const selectedPartsFallback = await topicModel.getTopicNamesByUsercourseid(usercourseid);
        topicNames = selectedPartsFallback.map((part: any) => part.topicname);
      }

      console.log(`[coursecontroller.ts] Fetched student with topics`);
      return { ...studentInfoObject, ...{ topics: topicNames } };
    } catch (error) {
      console.error('[coursecontroller.ts]', error);
      throw error;
    }
  },

  // For late-enrolled students: mark them "not present" for each past lecture
  async addLateEnrollingStudentToPreviousLectures(studentnumber: string, courseid: number) {
    try {
      const pastLectures = await lectureModel.getPastLecturesByCourseId(courseid);
      for (const lecture of pastLectures) {
        await attendanceController.markStudentAsNotPresentInPastLectures(studentnumber, lecture.lectureid);
      }
      console.log(`[coursecontroller.ts] Marked late-enrolled student ${studentnumber} absent in past lectures for course ${courseid}`);
    } catch (error) {
      console.error('[coursecontroller.ts]', error);
      throw error;
    }
  },
};

export default courseController;
