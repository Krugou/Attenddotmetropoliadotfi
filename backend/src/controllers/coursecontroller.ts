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
        console.log("row 122, coursecontroller.ts, looping through instructors");
        const existingInstructor = await userModel.checkIfEmailMatchesStaff(
          instructor.email,
        );
        if (!existingInstructor) {
          console.log("row 127, coursecontroller.ts, no existing instructor");
          return Promise.reject(
            new Error(
              'Instructor email not found or the user is not a staff member',
            ),
          );
        }
        const instructorUserId = existingInstructor[0].userid;

        console.log("row 136, coursecontroller.ts, pushing instructorUserId to instructorUserIds array");
        instructorUserIds.push(instructorUserId);
      }
      const existingCourse = await courseModel.findByCode(code);

      if (existingCourse) {
        console.log("row 142, coursecontroller.ts, existing course");
        return Promise.reject(
          new Error('Course with this code already exists'),
        );
      }
      try {
        const existingStudentGroup =
          await studentGroupModel.checkIfGroupNameExists(group_name);

        let studentGroupId = 0;
        if (existingStudentGroup && existingStudentGroup.length > 0) {
          console.log("row 153, coursecontroller.ts, existing student group");
          console.error('Group already exists');
          studentGroupId = existingStudentGroup[0].studentgroupid;
        } else {
          console.log("row 157, coursecontroller.ts, creating new student group");
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

        console.log("row 172, coursecontroller.ts, inserting course");
        const courseResult = await courseModel.insertCourse(
          name,
          startDateString,
          endDateString,
          code,
          studentGroupId,
        );
        courseId = courseResult.insertId;
        for (const instructorUserId of instructorUserIds) {
          console.log("row 182, coursecontroller.ts, looping through instructorUserIds");
          const instructorInserted =
            await courseInstructorModel.insertCourseInstructor(
              instructorUserId,
              courseId,
            );

          if (!instructorInserted) {
            console.log("row 190, coursecontroller.ts, instructor not inserted");
            return Promise.reject(
              new Error('Instructor could not be inserted into the course'),
            );
          }
        }
        let topicGroupId = 0;
        let topicId = 0;
        if (topicgroup) {
          console.log("row 199, coursecontroller.ts, topicgroup exists");
          try {
            console.log("row 201, coursecontroller.ts, checking if topicgroup exists");
            const ExistingTopicGroup =
              await topicGroupModel.checkIfTopicGroupExists(
                topicgroup,
                instructorUserIds[0],
              );

            if (ExistingTopicGroup.length > 0) {
              console.log("row 208, coursecontroller.ts, already existing topic group");
              console.error('Topic group already exists');
              topicGroupId = ExistingTopicGroup[0].topicgroupid;
            } else {
              console.log("row 212, coursecontroller.ts, creating new topic group");
              const newTopicGroup = await topicGroupModel.insertTopicGroup(
                topicgroup,
                instructorUserIds[0],
              );

              topicGroupId = newTopicGroup.insertId;
            }

            if (topics) {
              console.log("row 222, coursecontroller.ts, if there are topics");
              const topicslist = JSON.parse(topics);
              for (const topic of topicslist) {
                console.log("row 225, coursecontroller.ts, looping through topics");
                const ExistingTopic = await topicModel.checkIfTopicExists(
                  topic,
                );
                if (ExistingTopic) {
                  console.log("row 230, coursecontroller.ts, if topic exists");
                  if (ExistingTopic.length > 0) {
                    console.log("row 232, coursecontroller.ts, topic already exists");
                    console.error('Topic already exists');
                    topicId = ExistingTopic[0].topicid;
                  } else {
                    console.log("row 236, coursecontroller.ts, if topic does not exist");
                    console.log("row 237, coursecontroller.ts, creating new topic");
                    const newTopic = await topicModel.insertTopic(topic);
                    topicId = newTopic.insertId;
                  }
                }
                console.log("row 242, coursecontroller.ts, check if topic is already in group");
                const topicGroupTopicRelationExists =
                  await topicinGroupModel.checkIfTopicInGroupExists(
                    topicGroupId,
                    topicId,
                  );

                if (topicGroupTopicRelationExists.length > 0) {
                  console.log("row 250, coursecontroller.ts, if topic group topic relation exists");
                  console.error('Topic group relation exists');
                } else {
                  console.log("row 253, coursecontroller.ts, if topic group topic relation does not exist");
                  console.log("row 254, coursecontroller.ts, inserting topic in group");
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
                  console.log("row 269, coursecontroller.ts, if course topic relation exists");
                  console.error('Course topic group relation exists');
                } else {
                  console.log("row 272, coursecontroller.ts, Inserts a new course-topic relation.");
                  await courseTopicModel.insertCourseTopic(courseId, topicId);
                }
              }
            }
          } catch (error) {
            console.log("row 278, coursecontroller.ts, error in topicgroup");
            console.error(error);
          }
        }

        for (const student of students) {
          console.log("row 281, coursecontroller.ts, looping through students");
          try {
            console.log("row 286, coursecontroller.ts, checking if student exists");
            const existingUserByNumber =
              await userModel.checkIfUserExistsByStudentNumber(
                student.studentnumber,
              );

            let userId: number = 0;
            // let usercourseid: number = 0;
            if (existingUserByNumber.length > 0) {
              console.log("row 295, coursecontroller.ts, student number already exists");
              console.error('User with this student number already exists');
              // If the user already exists, insert them into the course
              userId = existingUserByNumber[0].userid;
              await userCourseModel.insertUserCourse(userId, courseId);

              // usercourseid = result.insertId;
            } else {
              console.log("row 303, coursecontroller.ts, student number does not exist");
              console.log("row 304, coursecontroller.ts, checking if user exists by email");
              const existingUserByEmail =
                await userModel.checkIfUserExistsByEmail(student.email);

              if (existingUserByEmail.length > 0) {
                console.log("row 309, coursecontroller.ts, user with email already exists");
                // If the user exists with a different student number, update their student number and insert them into the course
                console.log("row 311, coursecontroller.ts, updating student number");
                await userModel.updateUserStudentNumber(
                  student.studentnumber,
                  student.email,
                );
                userId = existingUserByEmail[0].userid;
                console.log("row 317, coursecontroller.ts, inserting user into course");
                await userCourseModel.insertUserCourse(userId, courseId);

                // usercourseid = (result as ResultSetHeader).insertId;
              } else {
                console.log("row 322, coursecontroller.ts, user with email does not exist");
                // Insert the user if they don't exist
                console.log("row 324, coursecontroller.ts, inserting user");
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

            console.log("row 338, coursecontroller.ts, inserting user into course");
            const existingUserCourse =
              await userCourseModel.checkIfUserCourseExists(userId, courseId);

            if (existingUserCourse.length === 0) {
              console.log("row 343, coursecontroller.ts, user not in course");
              // Insert the user into the course
              console.log("row 345, coursecontroller.ts, inserting user into course");
              await userCourseModel.insertUserCourse(userId, courseId);
            } else {
              console.log("row 348, coursecontroller.ts, user already in course");
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
            console.log("row 363, coursecontroller.ts, adding late enrolling student to previous lectures");
            await courseController.addLateEnrollingStudentToPreviousLectures(
              student.studentnumber,
              courseId,
            );
          } catch (error) {
            console.log("row 369, coursecontroller.ts, error in student");
            console.error(error);
          }
        }
      } catch (error) {
        console.log("row 374, coursecontroller.ts, error in course");
        console.error(error);
        return Promise.reject(error);
      }
    } catch (error) {
      console.log("row 379, coursecontroller.ts, error in catch");
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
      console.log("row 394, coursecontroller.ts, getDetailsByCourseId");
      console.log("row 395, coursecontroller.ts, get all users on course");
      let allUsersOnCourse = await course.getAllStudentsOnCourse(courseId);

      let usersAttendance = await attendanceModel.getAttendaceByCourseId(
        courseId,
      );

      // Assuming usersAttendance is an array of objects
      const distinctUserCourseIds = [
        ...new Set(allUsersOnCourse.map((user) => user.usercourseid)),
      ];

      for (const usercourseid of distinctUserCourseIds) {
        console.log("row 408, coursecontroller.ts, looping through usercourseids");
        const selectedParts =
          await usercourse_topicsModel.findUserCourseTopicByUserCourseId(
            usercourseid,
          );

        // Add userCourseTopic to each usersAttendance object with the same usercourseid
        allUsersOnCourse = allUsersOnCourse.map((user) => {
          if (user.usercourseid === usercourseid) {
            console.log("row 417, coursecontroller.ts, checks if user.usercourseid is equal to usercourseid");
            return {...user, selectedParts};
          } else {
            console.log("row 420, coursecontroller.ts, was not equal to usercourseid");
            return user;
          }
        });
        usersAttendance = usersAttendance.map((user: UserMapResults) => {
          if (user.usercourseid === usercourseid) {
            console.log("row 426, coursecontroller.ts, checks if user.usercourseid is equal to usercourseid");
            return {...user, selectedParts};
          } else {
            console.log("row 429, coursecontroller.ts, was not equal to usercourseid");
            return user;
          }
        });
      }

      console.log("row 435, coursecontroller.ts, get lecture count by topic");
      const lectureCount = await attendanceModel.getLectureCountByTopic(
        courseId,
      );
      return {
        users: [...usersAttendance],
        lectures: [...lectureCount],
        allUsers: [...allUsersOnCourse],
      };
    } catch (error) {
      console.log("row 445, coursecontroller.ts, error in getDetailsByCourseId");
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
      console.log("row 459, coursecontroller.ts, updateStudentCourses");
      const existingUserCourse = await userCourseModel.checkIfUserCourseExists(
        userid,
        courseid,
      );
      if (existingUserCourse.length === 0) {
        console.log("row 465, coursecontroller.ts, user is not in course, inserting user into course");
        // Insert the user into the course
        await userCourseModel.insertUserCourse(userid, courseid);
      } else {
        console.log("row 469, coursecontroller.ts, user already in course");
        throw new Error('User is already enrolled on this course');
      }
    } catch (error) {
      console.log("row 473, coursecontroller.ts, error in updateStudentCourses");
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
      console.log("row 486, coursecontroller.ts, removeStudentCourses");

      console.log("row 488, coursecontroller.ts, getting existing user course");
      const existingUserCourse =
        (await userCourseModel.getUserCourseByUsercourseid(
          usercourseid,
        )) as RowDataPacket[];

      if (existingUserCourse.length > 0) {
        console.log("row 495, coursecontroller.ts, user is in course, deleting user from course");
        // Insert the user into the course
        await userCourseModel.deleteUserCourseByUsercourseid(usercourseid);
      } else {
        console.log("row 499, coursecontroller.ts, user is not in course");
        throw new Error('User is not enrolled on this course');
      }
    } catch (error) {
      console.log("row 503, coursecontroller.ts, error in removeStudentCourses");
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
      console.log("row 515, coursecontroller.ts, getStudentAndSelectedTopicsByUsercourseId");
      let topicNames;
      console.log("row 517, coursecontroller.ts, find user course topic by user course id");
      const selectedParts =
        await usercourse_topicsModel.findUserCourseTopicByUserCourseId(
          usercourseid,
        );
      console.log("row 521, coursecontroller.ts, get student info by user course id");
      const studentInfo = await userCourseModel.getStudentInfoByUsercourseid(
        usercourseid,
      );
      const studentInfoObject = studentInfo[0];
      if (!studentInfoObject) {
        console.log("row 528, coursecontroller.ts, student not found");
        throw new Error('Student not found');
      }

      if (selectedParts && selectedParts.length > 0) {
        console.log("row 533, coursecontroller.ts, selected parts found");
        topicNames = selectedParts.map((part) => part.topicname);
      }

      if (!topicNames) {
        console.log("row 538, coursecontroller.ts, no topic names found");
        console.log("row 539, coursecontroller.ts, getting topic names by user course id");
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
      console.log("row 552, coursecontroller.ts, error in getStudentAndSelectedTopicsByUsercourseId");
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
      console.log("row 568, coursecontroller.ts, addLateEnrollingStudentToPreviousLectures");
      console.log("row 569, coursecontroller.ts, getting past lectures by course id");
      const pastLectures = await lectureModel.getPastLecturesByCourseId(
        courseid,
      );
      for (const lecture of pastLectures) {
        console.log("row 574, coursecontroller.ts, looping through past lectures");
        await attendanceController.markStudentAsNotPresentInPastLectures(
          studentnumber,
          lecture.lectureid,
        );
      }
    } catch (error) {
      console.log("row 581, coursecontroller.ts, error in addLateEnrollingStudentToPreviousLectures");
      console.error(error);
      throw error;
    }
  },
};

export default courseController;
