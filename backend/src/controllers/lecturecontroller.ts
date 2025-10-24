import course from '../models/coursemodel.js';
import lectureModel from '../models/lecturemodel.js';
import topicModel from '../models/topicmodel.js';
import usercourse_topicsModel from '../models/usercourse_topicsmodel.js';
import attendanceController from './attendancecontroller.js';

// Parse and validate date strings into Date objects
function parseAndValidateDates(start: string, end: string) {
  const parsedStart = new Date(start);
  const parsedEnd = new Date(end);

  if (Number.isNaN(parsedStart.getTime())) {
    console.log('lecturecontroller.ts invalid start date format');
    throw new Error('Invalid start date format');
  }
  if (Number.isNaN(parsedEnd.getTime())) {
    console.log('lecturecontroller.ts invalid end date format');
    throw new Error('Invalid end date format');
  }
  if (parsedStart >= parsedEnd) {
    console.log('lecturecontroller.ts start date must be before end date');
    throw new Error('Start date must be before end date');
  }
  return { parsedStart, parsedEnd };
}

// Filter students so that only those whose modified topics include the lecture topic remain
async function filterStudentsByTopics(students: any[]) {
  const filtered = await Promise.all(
    students.map(async (s) => {
      const usercourseid = s.usercourseid;
      const rows = await usercourse_topicsModel.findUserCourseTopicByUserCourseId(usercourseid);
      if (rows.length === 0) return s; // no modified topics → keep
      const topicIds = rows.map((r: any) => r.topicid);
      return topicIds.includes(s.topicid) ? s : null;
    })
  );
  return filtered.filter(Boolean);
}

const lectureController = {
  // Insert a new lecture
  async insertIntoLecture(
    topicname: string,
    coursecode: string,
    start_date: string,
    end_date: string,
    timeofday: 'am' | 'pm',
    state: 'open' | 'closed',
    teacherid: number | undefined,
  ): Promise<{ lectureid: number } | undefined> {
    try {
      console.log('lecturecontroller.ts inserting into lecture');

      const topicIdRows = await topicModel.findTopicIdUsingTopicName(topicname);
      const courseRows = await course.findCourseIdUsingCourseCode(coursecode);
      if (!topicIdRows?.length || !courseRows?.length) {
        console.log('lecturecontroller.ts topic or course does not exist');
        console.error('lecturecontroller.ts Topic or course does not exist');
        return;
      }

      const { parsedStart, parsedEnd } = parseAndValidateDates(start_date, end_date);

      const result = await lectureModel.insertIntoLecture(
        parsedStart,
        parsedEnd,
        timeofday,
        topicIdRows[0].topicid,
        courseRows[0].courseid,
        state,
        teacherid,
      );

      if (!result) {
        console.log('lecturecontroller.ts failed to insert into lecture');
        console.error('lecturecontroller.ts Failed to insert into lecture');
        return;
      }

      return { lectureid: (result as { insertId: number }).insertId };
    } catch (error) {
      console.error('lecturecontroller.ts Error in insertIntoLecture:', error);
      throw error;
    }
  },

  // Get students in a lecture (respecting modified topics)
  async getStudentsInLecture(lectureid: number) {
    try {
      console.log('lecturecontroller.ts getting students in lecture by ID');
      const allStudents = await lectureModel.getStudentsByLectureId(lectureid);
      const finalStudents = await filterStudentsByTopics(allStudents);
      console.log('lecturecontroller.ts return updated list of students');
      return finalStudents;
    } catch (error) {
      console.log('lecturecontroller.ts error in getStudentsInLecture');
      console.error('lecturecontroller.ts', error);
    }
  },

  // Close a lecture and insert absent attendance for all relevant students
  async closeLecture(lectureid: string) {
    try {
      const students = await this.getStudentsInLecture(Number(lectureid));
      console.log('lecturecontroller.ts getting students in lecture by ID');

      const lecture = await lectureModel.getLectureByLectureId(Number(lectureid));
      console.log('lecturecontroller.ts getting lecture by ID');
      const lectureDate = lecture?.[0].start_date;

      // Ensure all attendance inserts finish before state change
      await Promise.all(
        (students ?? []).map(async (student: any) => {
          try {
            await attendanceController.insertIntoAttendance(
              '0',
              lectureDate,
              student?.studentnumber,
              lectureid,
            );
          } catch (error) {
            console.error('lecturecontroller.ts', error);
          }
        })
      );
      console.log('lecturecontroller.ts attendance inserted');

      const result = await lectureModel.updateLectureState(lectureid, 'closed');
      console.log('lecturecontroller.ts updating lecture state to closed');
      return result;
    } catch (error) {
      console.log('lecturecontroller.ts error in closeLecture');
      console.error('lecturecontroller.ts', error);
      return Promise.reject(error);
    }
  },
};

export default lectureController;
