'use strict';

import {API_CONFIG} from '../config';
import {doFetch} from '../utils/doFetch';
import type {
  CreateCourseInputs,
  CreateCourseFile,
  getCourseReservations as GetCourseReservations,
  checkIfCourseExists as CheckIfCourseExists,
} from '../types/course';

const baseUrl = API_CONFIG.baseUrl;

// ── Course Creation, Updates, and General Course Endpoints ──

export const createCourse = async (
  courseData: CreateCourseInputs,
  token: string,
) => {
  const options: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify(courseData),
  };

  const url = `${baseUrl}courses/create`;
  return doFetch(url, options);
};

export const excelInput = async (inputs: CreateCourseFile, token: string) => {
  const {formDataFile} = inputs;
  const options: RequestInit = {
    headers: {
      Authorization: 'Bearer ' + token,
    },
    method: 'POST',
    body: formDataFile,
  };

  const url = `${baseUrl}courses/excelinput`;
  return doFetch(url, options);
};

export const checkIfCourseExists = async (inputs: CheckIfCourseExists) => {
  const {codes, token} = inputs;

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({
      codes: codes,
    }),
  };
  const url = `${baseUrl}courses/check`;
  return await doFetch(url, options);
};

export const getAllCoursesByInstructorEmail = async (
  email: string,
  token: string,
) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };

  return await doFetch(`${baseUrl}courses/instructor/${email}`, options);
};

export const getAllTopicGroupsAndTopicsInsideThem = async (token: string) => {
  const response = await doFetch(baseUrl + 'courses/topics', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  });
  return response;
};

export const getAllTopicGroupsAndTopicsInsideThemByUserid = async (
  email: string,
  token: string,
) => {
  const response = await doFetch(baseUrl + 'courses/topics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({
      email: email,
    }),
  });
  return response;
};

export const getCourseDetailByCourseId = async (
  courseId: string,
  token: string,
) => {
  const response = await doFetch(baseUrl + 'courses/coursesbyid/' + courseId, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  });
  return response;
};

export const getCourseReservations = async (
  inputs: GetCourseReservations,
  token: string,
) => {
  const {code} = inputs;
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({
      code: code,
    }),
  };
  const url = `${baseUrl}courses/checkreservations/`;
  return await doFetch(url, options);
};

export const getOpenLecturesByTeacher = async (
  teacherId: number,
  token: string,
) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({
      teacherid: teacherId,
    }),
  };
  const url = `${baseUrl}courses/attendance/lecture/teacheropen/`;
  return await doFetch(url, options);
};

export const CreateLecture = async (
  topicname: string,
  course: {code: string},
  start_date: Date,
  end_date: Date,
  timeofday: string,
  state: string,
  token: string,
) => {
  const formattedStart_date = new Date(start_date)
    .toISOString()
    .replace('T', ' ')
    .replace('Z', '');
  const formattedEnd_date = new Date(end_date)
    .toISOString()
    .replace('T', ' ')
    .replace('Z', '');
  const coursecode = course.code;
  const options: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({
      topicname,
      coursecode,
      start_date: formattedStart_date,
      end_date: formattedEnd_date,
      timeofday,
      state,
    }),
  };
  const url = `${baseUrl}courses/attendance/lecture/`;
  return doFetch(url, options);
};

export const getAllCourseInfoByUserEmail = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  return await doFetch(`${baseUrl}courses/user/all`, options);
};

export const getAttendanceInfoByUsercourseid = async (
  usercourseid: number,
  token: string,
) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  return await doFetch(
    `${baseUrl}courses/attendance/usercourse/${usercourseid}`,
    options,
  );
};

export const deleteCourse = async (courseId: number, token: string) => {
  const options = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  const url = `${baseUrl}courses/delete/${courseId}`;
  return doFetch(url, options);
};

export const updateOwnedTopicgroupandtheirtopics = async (
  topicGroup: any,
  topics: any,
  email: string,
  token: string,
) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({
      topicGroup,
      topics,
      email,
    }),
  };
  const url = `${baseUrl}courses/topics/update`;
  return doFetch(url, options);
};

export const modifyCourse = async (
  token: string | null,
  courseId: string | undefined,
  modifiedData: {[key: string]: any},
) => {
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({modifiedData}),
  };
  const url = `${baseUrl}courses/update/${courseId}`;
  return doFetch(url, options);
};

export const checkCourseCode = async (code: string, token: string) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  const url = `${baseUrl}courses/checkcode/${code}`;
  return doFetch(url, options);
};

export const updateUserCourseTopics = async (
  token: string,
  usercourseid: number,
  modifiedTopics: any,
) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({modifiedTopics}),
  };
  return await doFetch(
    `${baseUrl}courses/topics/update/${usercourseid}`,
    options,
  );
};

export const updateAttendanceStatus = async (
  attendanceid: number,
  status: number,
  token: string | null,
) => {
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({attendanceid, status}),
  };

  const url = `${baseUrl}courses/attendance/update`;
  return doFetch(url, options);
};

export const fetchTeacherOwnLectures = async (
  teacherId: string,
  token: string,
) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  return await doFetch(
    baseUrl + `courses/attendance/lecture/teacher/${teacherId}`,
    options,
  );
};

export const getLectureInfo = async (lectureid: string, token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  return await doFetch(
    `${baseUrl}courses/attendance/lectureinfo/${lectureid}`,
    options,
  );
};

export const getLecturesAndAttendances = async (
  courseId: string | undefined,
  token: string,
) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  const url = `${baseUrl}courses/attendance/course/${courseId}`;
  return doFetch(url, options);
};

export const updateStudentCourses = async (
  token: string,
  userid: number | undefined,
  courseid: number | undefined,
) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  const url = `${baseUrl}courses/updateusercourses/${userid}/${courseid}`;
  return doFetch(url, options);
};

export const deleteStudentFromCourse = async (
  token: string,
  usercourseid: number | undefined,
) => {
  const options = {
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  const url = `${baseUrl}courses/deleteusercourse/${usercourseid}`;
  return doFetch(url, options);
};

export const getStudentAndTopicsByUsercourseid = async (
  token: string,
  usercourseid: number,
) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  return await doFetch(
    baseUrl + `courses/studentandtopics/${usercourseid}`,
    options,
  );
};

export const checkIfTopicGroupWithEmailExists = async (
  token: string,
  email: string,
  topicGroup: string,
) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({topicGroup, email}),
  };

  return await doFetch(baseUrl + 'courses/topics/topicgroupcheck/', options);
};

export const getStudentsByCourseId = async (
  courseId: string,
  token: string,
) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  return await doFetch(
    baseUrl + `courses/studentsbycourse/${courseId}`,
    options,
  );
};

export const deleteTopicGroupAndTopicsByUserid = async (
  selectedGroup: any,
  token: string,
) => {
  const options = {
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  return await doFetch(
    baseUrl + `courses/topics/delete/${selectedGroup}`,
    options,
  );
};

export const deleteLectureByLectureId = async (
  lectureid: string,
  token: string,
) => {
  const options = {
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  return await doFetch(
    baseUrl + `courses/attendance/lecture/${lectureid}`,
    options,
  );
};

export const closeLectureByLectureId = async (
  lectureid: string,
  token: string,
) => {
  const options = {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  return await doFetch(
    baseUrl + `courses/attendance/lecture/close/${lectureid}`,
    options,
  );
};

export const getOpenLecturesByCourseid = async (
  courseid: string | (() => string) | undefined,
  token: string,
) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  return await doFetch(
    baseUrl + `courses/attendance/lecture/open/${courseid}`,
    options,
  );
};

export const fetchStudentsPaginationByInstructorId = async (
  userId: number,
  token: string,
  limit: number = 10,
  page: number = 1,
) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  return await doFetch(
    `${baseUrl}courses/students/pagination/${userId}?limit=${limit}&page=${page}`,
    options,
  );
};
export const getAllCourses = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  return await doFetch(baseUrl + 'courses/getallcourses', options);
};
export const getDetailsByCourseId = async (courseId: string, token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  return await doFetch(
    baseUrl + 'courses/getdetailsbycourseid/' + courseId,
    options,
  );
};
export const courseApi = {
  getDetailsByCourseId,
  getAllCourses,
  createCourse,
  excelInput,
  checkIfCourseExists,
  getAllCoursesByInstructorEmail,
  getAllTopicGroupsAndTopicsInsideThem,
  getAllTopicGroupsAndTopicsInsideThemByUserid,
  getCourseDetailByCourseId,
  getCourseReservations,
  getOpenLecturesByTeacher,
  CreateLecture,
  getAllCourseInfoByUserEmail,
  getAttendanceInfoByUsercourseid,
  deleteCourse,
  updateOwnedTopicgroupandtheirtopics,
  modifyCourse,
  checkCourseCode,
  updateUserCourseTopics,
  updateAttendanceStatus,
  fetchTeacherOwnLectures,
  getLectureInfo,
  getLecturesAndAttendances,
  fetchStudentsPaginationByInstructorId,
  closeLectureByLectureId,
  getOpenLecturesByCourseid,
  deleteStudentFromCourse,
  getStudentAndTopicsByUsercourseid,
  checkIfTopicGroupWithEmailExists,
  getStudentsByCourseId,
  deleteTopicGroupAndTopicsByUserid,
  deleteLectureByLectureId,
  updateStudentCourses,
};
