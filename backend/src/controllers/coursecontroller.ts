import {RowDataPacket} from 'mysql2';
import attendanceModel from '../models/attendancemodel.js';
import courseInstructorModel from '../models/courseinstructormodel.js';
import {
  default as course,
  default as courseModel,
} from '../models/coursemodel.js';
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

/**
 * Interface for Student
 */
export interface Student {
  'email': string;
  'first_name': string;
  'name': string;
  'last_name': string;
  'studentnumber': string;
  'Arrival Group': string;
  'Admin Groups': string;
  'Program': string;
  'Form of Education': string;
  'Registration': string;
  'Assessment': string;
}
/**
 * Interface for Instructor
 */
export interface Instructor {
  email: string;
}
/**
 * Interface for UserMapResults
 */
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
/**
 * CourseController interface represents the structure of the course controller.
 *
 * This interface provides the following methods:
 *
 * @method getCoursesByUserId - Fetches the courses for a specific user.
 * @method getCourseById - Fetches a specific course by its ID.
 * @method insertIntoCourses - Inserts a new course.
 */
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
  getStudentAndSelectedTopicsByUsercourseId: (
    usercourseid: number,
  ) => Promise<any>;
  addLateEnrollingStudentToPreviousLectures: (
    studentnumber: string,
    courseid: number,
  ) => Promise<void>;
}
/**
 * `courseController` is an object that implements the CourseController interface.
 * It provides methods to manage courses.
 *
 * @type {CourseController}
 */
const courseController: CourseController = {
  /**
   * Insert a new course
   * @param name - The name of the course
   * @param start_date - The start date of the course
   * @param end_date - The end date of the course
   * @param code - The code of the course
   * @param group_name - The group name of the course
   * @param students - The students of the course
   * @param instructors - The instructors of the course
   * @param topics - The topics of the course
   * @param topicgroup - The topic group of the course
   */
  async insertIntoCourse(
    name: string,
    start_date: Date,
    end_date: Date,
    code: string,
    group_name: string,
    students: Student[],
    instructors: Instructor[],
    topics?: string,
    topicgroup?: string,
  ) {
    // console.log('🚀 ~ file: coursecontroller.ts:37 ~ topics:', topics);
    // console.log('🚀 ~ file: coursecontroller.ts:37 ~ topicgroup:', topicgroup);
    let courseId = 0;
    try {
      const instructorUserIds: number[] = [];
      for (const instructor of instructors) {
        const existingInstructor = await userModel.checkIfEmailMatchesStaff(
          instructor.email,
        );
        if (!existingInstructor) {
          return Promise.reject(
            new Error(
              'Instructor email not found or the user is not a staff member',
            ),
          );
        }
        const instructorUserId = existingInstructor[0].userid;
        instructorUserIds.push(instructorUserId);
      }
      const existingCourse = await courseModel.findByCode(code);

      if (existingCourse) {
        return Promise.reject(
          new Error('Course with this code already exists'),
        );
      }
      try {
        const existingStudentGroup =
          await studentGroupModel.checkIfGroupNameExists(group_name);

        let studentGroupId = 0;
        if (existingStudentGroup && existingStudentGroup.length > 0) {
          console.error('Group already exists');
          studentGroupId = existingStudentGroup[0].studentgroupid;
        } else {
          const newStudentGroup =
            await studentGroupModel.insertIntoStudentGroup(group_name);

          studentGroupId = newStudentGroup.insertId;
        }
        const startDateString = new Date(start_date)
          .toISOString()
          .slice(0, 19)
          .replace('T', ' ');
        const endDateString = new Date(end_date)
          .toISOString()
          .slice(0, 19)
          .replace('T', ' ');

        const courseResult = await courseModel.insertCourse(
          name,
          startDateString,
          endDateString,
          code,
          studentGroupId,
        );
        courseId = courseResult.insertId;
        for (const instructorUserId of instructorUserIds) {
          const instructorInserted =
            await courseInstructorModel.insertCourseInstructor(
              instructorUserId,
              courseId,
            );

          if (!instructorInserted) {
            return Promise.reject(
              new Error('Instructor could not be inserted into the course'),
            );
          }
        }
        let topicGroupId = 0;
        let topicId = 0;
        if (topicgroup) {
          try {
            const ExistingTopicGroup =
              await topicGroupModel.checkIfTopicGroupExists(
                topicgroup,
                instructorUserIds[0],
              );

            if (ExistingTopicGroup.length > 0) {
              console.error('Topic group already exists');
              topicGroupId = ExistingTopicGroup[0].topicgroupid;
            } else {
              const newTopicGroup = await topicGroupModel.insertTopicGroup(
                topicgroup,
                instructorUserIds[0],
              );

              topicGroupId = newTopicGroup.insertId;
            }

            if (topics) {
              const topicslist = JSON.parse(topics);
              for (const topic of topicslist) {
                const ExistingTopic = await topicModel.checkIfTopicExists(
                  topic,
                );
                if (ExistingTopic) {
                  if (ExistingTopic.length > 0) {
                    console.error('Topic already exists');
                    topicId = ExistingTopic[0].topicid;
                  } else {
                    const newTopic = await topicModel.insertTopic(topic);
                    topicId = newTopic.insertId;
                  }
                }

                const topicGroupTopicRelationExists =
                  await topicinGroupModel.checkIfTopicInGroupExists(
                    topicGroupId,
                    topicId,
                  );

                if (topicGroupTopicRelationExists.length > 0) {
                  console.error('Topic group relation exists');
                } else {
                  await topicinGroupModel.insertTopicInGroup(
                    topicGroupId,
                    topicId,
                  );
                }

                const relationExists =
                  await courseTopicModel.checkIfCourseTopicRelationExists(
                    courseId,
                    topicId,
                  );

                if (relationExists.length < 0) {
                  console.error('Course topic group relation exists');
                } else {
                  await courseTopicModel.insertCourseTopic(courseId, topicId);
                }
              }
            }
          } catch (error) {
            console.error(error);
          }
        }

        for (const student of students) {
          try {
            const existingUserByNumber =
              await userModel.checkIfUserExistsByStudentNumber(
                student.studentnumber,
              );

            let userId: number = 0;
            // let usercourseid: number = 0;
            if (existingUserByNumber.length > 0) {
              console.error('User with this student number already exists');
              // If the user already exists, insert them into the course
              userId = existingUserByNumber[0].userid;
              await userCourseModel.insertUserCourse(userId, courseId);

              // usercourseid = result.insertId;
            } else {
              const existingUserByEmail =
                await userModel.checkIfUserExistsByEmail(student.email);

              if (existingUserByEmail.length > 0) {
                // If the user exists with a different student number, update their student number and insert them into the course
                await userModel.updateUserStudentNumber(
                  student.studentnumber,
                  student.email,
                );
                userId = existingUserByEmail[0].userid;
                await userCourseModel.insertUserCourse(userId, courseId);

                // usercourseid = (result as ResultSetHeader).insertId;
              } else {
                // Insert the user if they don't exist
                const userResult = await userModel.insertStudentUser(
                  student.email,
                  student.first_name,
                  student.last_name,
                  student.studentnumber,
                  studentGroupId,
                );

                userId = userResult.insertId;
              }
            }
            // Insert the user into the course

            const existingUserCourse =
              await userCourseModel.checkIfUserCourseExists(userId, courseId);

            if (existingUserCourse.length === 0) {
              // Insert the user into the course
              await userCourseModel.insertUserCourse(userId, courseId);
            } else {
              console.error('User is already enrolled in this course');
            }
            /*
						try {
							await usercourse_topicsModel.insertUserCourseTopic(
								usercourseid,
								topicId,
							);

							console.log('Data inserted successfully', userId);
						} catch (error) {
							console.error(error);
						}
						*/
            await courseController.addLateEnrollingStudentToPreviousLectures(
              student.studentnumber,
              courseId,
            );
          } catch (error) {
            console.error(error);
          }
        }
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
    return courseId;
  },
  /**
   * Gets the details of a course by its ID.
   *
   * @param {string} courseId - The ID of the course.
   * @returns {Promise<any>} The details of the course.
   * @throws {Error} If there is an error fetching the course details.
   */
  getDetailsByCourseId: async (courseId: string) => {
    try {
      let allUsersOnCourse = await course.getAllStudentsOnCourse(courseId);

      let usersAttendance = await attendanceModel.getAttendaceByCourseId(
        courseId,
      );

      // Assuming usersAttendance is an array of objects
      const distinctUserCourseIds = [
        ...new Set(allUsersOnCourse.map((user) => user.usercourseid)),
      ];

      for (const usercourseid of distinctUserCourseIds) {
        const selectedParts =
          await usercourse_topicsModel.findUserCourseTopicByUserCourseId(
            usercourseid,
          );

        // Add userCourseTopic to each usersAttendance object with the same usercourseid
        allUsersOnCourse = allUsersOnCourse.map((user) => {
          if (user.usercourseid === usercourseid) {
            return {...user, selectedParts};
          } else {
            return user;
          }
        });
        usersAttendance = usersAttendance.map((user: UserMapResults) => {
          if (user.usercourseid === usercourseid) {
            return {...user, selectedParts};
          } else {
            return user;
          }
        });
      }

      const lectureCount = await attendanceModel.getLectureCountByTopic(
        courseId,
      );
      return {
        users: [...usersAttendance],
        lectures: [...lectureCount],
        allUsers: [...allUsersOnCourse],
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  /**
   * Updates the courses for a student.
   *
   * @param {number} userid - The ID of the user.
   * @param {number} courseid - The ID of the course.
   * @throws {Error} If the user is already enrolled in the course.
   */
  updateStudentCourses: async (userid: number, courseid: number) => {
    try {
      const existingUserCourse = await userCourseModel.checkIfUserCourseExists(
        userid,
        courseid,
      );
      if (existingUserCourse.length === 0) {
        // Insert the user into the course
        await userCourseModel.insertUserCourse(userid, courseid);
      } else {
        throw new Error('User is already enrolled on this course');
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  /**
   * Removes a student from a course.
   *
   * @param {number} usercourseid - The ID of the user course.
   * @throws {Error} If the user is not enrolled in the course.
   */
  removeStudentCourses: async (usercourseid: number) => {
    try {
      const existingUserCourse =
        (await userCourseModel.getUserCourseByUsercourseid(
          usercourseid,
        )) as RowDataPacket[];

      if (existingUserCourse.length > 0) {
        // Insert the user into the course
        await userCourseModel.deleteUserCourseByUsercourseid(usercourseid);
      } else {
        throw new Error('User is not enrolled on this course');
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  /**
   * Gets a student and their selected topics by the user course ID.
   *
   * @param {number} usercourseid - The ID of the user course.
   */
  getStudentAndSelectedTopicsByUsercourseId: async (usercourseid: number) => {
    try {
      let topicNames;
      const selectedParts =
        await usercourse_topicsModel.findUserCourseTopicByUserCourseId(
          usercourseid,
        );
      const studentInfo = await userCourseModel.getStudentInfoByUsercourseid(
        usercourseid,
      );
      const studentInfoObject = studentInfo[0];
      if (!studentInfoObject) {
        throw new Error('Student not found');
      }

      if (selectedParts && selectedParts.length > 0) {
        topicNames = selectedParts.map((part) => part.topicname);
      }

      if (!topicNames) {
        const selectedParts = await topicModel.getTopicNamesByUsercourseid(
          usercourseid,
        );
        topicNames = selectedParts.map((part) => part.topicname);
      }

      const studentAndSelectedParts = {
        ...studentInfoObject,
        ...{topics: topicNames},
      };
      return studentAndSelectedParts;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  /**
   * Adds a late enrolling student to previous lectures as not present.
   *
   * @param {string} studentnumber - The student number.
   * @param {number} courseid - The ID of the course.
   */
  async addLateEnrollingStudentToPreviousLectures(
    studentnumber: string,
    courseid: number,
  ) {
    try {
      const pastLectures = await lectureModel.getPastLecturesByCourseId(
        courseid,
      );
      for (const lecture of pastLectures) {
        await attendanceController.markStudentAsNotPresentInPastLectures(
          studentnumber,
          lecture.lectureid,
        );
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};

export default courseController;
