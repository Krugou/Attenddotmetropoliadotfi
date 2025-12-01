import {API_CONFIG} from '../config';
import {doFetch} from '../utils/doFetch';
import type {
  CreateCourseInputs,
  CreateCourseFile,
  getCourseReservations as GetCourseReservations,
  checkIfCourseExists as CheckIfCourseExists,
} from '../types/course';
import { createOptions } from '../utils/apiHelper';

const baseUrl = API_CONFIG.baseUrl;

// siirretty utilssiin, poista sit kun on testattu toimivaks
/*  method: string,
  token: string,
  body?: any,
  contentType: string = 'application/json'
): RequestInit => {
  const headers: Record<string, string> = {
    Authorization: 'Bearer ' + token,
  };

  if (contentType) headers['Content-Type'] = contentType;

  return {
    method,
    headers,
    ...(body
      ? {
        body: contentType === 'application/json' && typeof body !== 'string'
          ? JSON.stringify(body)
          : body,
      }
      : {}),
  };
};*/

const endpoint = (path: string) => `${baseUrl}courses/${path}`;

// ── Course Creation ──

/** Create a new course */
export const createCourse = async (
  courseData: CreateCourseInputs,
  token: string,
) => doFetch(endpoint('create'), createOptions('POST', token, courseData));

/** Upload course from an Excel file */
export const excelInput = async (inputs: CreateCourseFile, token: string) =>
  doFetch(endpoint('excelinput'), createOptions('POST', token, inputs.formDataFile, ''));

/** Check if a course with given course code(s) exists */
export const checkIfCourseExists = async (inputs: CheckIfCourseExists) =>
  doFetch(endpoint('check'), createOptions('POST', inputs.token, { codes: inputs.codes }));

/** Get all courses */
export const getAllCourses = async (token: string) =>
  doFetch(endpoint('getallcourses'), createOptions('GET', token));

/** Get all courses by instructor email */
export const getAllCoursesByInstructorEmail = async (
  email: string,
  token: string,
) => doFetch(endpoint(`instructor/${email}`), createOptions('GET', token));

/** Get all topic groups and topics */
export const getAllTopicGroupsAndTopicsInsideThem = async (token: string) =>
  doFetch(endpoint('topics'), createOptions('GET', token));

/** Get all topic groups and topics by user email */
export const getAllTopicGroupsAndTopicsInsideThemByUserid = async (
  email: string,
  token: string,
) => doFetch(endpoint('topics'), createOptions('POST', token, { email }));

/** Get course detail by course ID */
export const getCourseDetailByCourseId = async (
  courseId: string,
  token: string,
) => doFetch(endpoint(`coursesbyid/${courseId}`), createOptions('GET', token));

/** Get course reservations */
export const getCourseReservations = async (
  inputs: GetCourseReservations,
  token: string,
) => doFetch(endpoint('checkreservations/'), createOptions('POST', token, { code: inputs.code }));

/** Get open lectures by teacher ID */
export const getOpenLecturesByTeacher = async (
  teacherId: number,
  token: string,
) => doFetch(endpoint('attendance/lecture/teacheropen/'), createOptions('POST', token, { teacherid: teacherId }));

/** Create a new lecture */
export const CreateLecture = async (
  topicname: string,
  course: { code: string },
  start_date: Date,
  end_date: Date,
  timeofday: string,
  state: string,
  token: string,
) => {
  const formatDate = (date: Date) => date.toISOString().slice(0, 19).replace('T', ' ');
  return doFetch(endpoint('attendance/lecture/'), createOptions('POST', token, {
    topicname,
    coursecode: course.code,
    start_date: formatDate(start_date),
    end_date: formatDate(end_date),
    timeofday,
    state,
  }));
};

/** Get all course info by user email */
export const getAllCourseInfoByUserEmail = async (token: string) =>
  doFetch(endpoint('user/all'), createOptions('GET', token));

/** Get attendance info by user course ID */
export const getAttendanceInfoByUsercourseid = async (
  usercourseid: number,
  token: string,
) => doFetch(endpoint(`attendance/usercourse/${usercourseid}`), createOptions('GET', token));

/** Delete a course */
export const deleteCourse = async (courseId: number, token: string) =>
  doFetch(endpoint(`delete/${courseId}`), createOptions('DELETE', token));

/** Update owned topic group and their topics */
export const updateOwnedTopicgroupandtheirtopics = async (
  topicGroup: any,
  topics: any,
  email: string,
  token: string,
) => doFetch(endpoint('topics/update'), createOptions('POST', token, { topicGroup, topics, email }));

/** Modify a course */
export const modifyCourse = async (
  token: string | null,
  courseId: string | undefined,
  modifiedData: { [key: string]: any },
) => doFetch(endpoint(`update/${courseId}`), createOptions('PUT', token!, { modifiedData }));

/** Check course code existence */
export const checkCourseCode = async (code: string, token: string) =>
  doFetch(endpoint(`checkcode/${code}`), createOptions('POST', token));

/** Update user course topics */
export const updateUserCourseTopics = async (
  token: string,
  usercourseid: number,
  modifiedTopics: any,
) => doFetch(endpoint(`topics/update/${usercourseid}`), createOptions('POST', token, { modifiedTopics }));

/** Update attendance status */
export const updateAttendanceStatus = async (
  attendanceid: number,
  status: number,
  token: string | null,
) => doFetch(endpoint('attendance/update'), createOptions('PUT', token!, { attendanceid, status }));

/** Fetch teacher's own lectures */
export const fetchTeacherOwnLectures = async (teacherId: string, token: string) =>
  doFetch(endpoint(`attendance/lecture/teacher/${teacherId}`), createOptions('GET', token));

/** Get lecture info */
export const getLectureInfo = async (lectureid: string, token: string) =>
  doFetch(endpoint(`attendance/lectureinfo/${lectureid}`), createOptions('GET', token));

/** Get lectures and attendances */
export const getLecturesAndAttendances = async (
  courseId: string | undefined,
  token: string,
) => doFetch(endpoint(`attendance/course/${courseId}`), createOptions('GET', token));

/** Update student course links */
export const updateStudentCourses = async (
  token: string,
  userid: number | undefined,
  courseid: number | undefined,
) => doFetch(endpoint(`updateusercourses/${userid}/${courseid}`), createOptions('POST', token));

/** Delete student from course */
export const deleteStudentFromCourse = async (
  token: string,
  usercourseid: number | undefined,
) => doFetch(endpoint(`deleteusercourse/${usercourseid}`), createOptions('DELETE', token));

/** Get student and topics by user course ID */
export const getStudentAndTopicsByUsercourseid = async (
  token: string,
  usercourseid: number,
) => doFetch(endpoint(`studentandtopics/${usercourseid}`), createOptions('GET', token));

/** Check if topic group with email exists */
export const checkIfTopicGroupWithEmailExists = async (
  token: string,
  email: string,
  topicGroup: string,
) => doFetch(endpoint('topics/topicgroupcheck/'), createOptions('POST', token, { topicGroup, email }));

/** Get students by course ID */
export const getStudentsByCourseId = async (
  courseId: string,
  token: string,
) => doFetch(endpoint(`studentsbycourse/${courseId}`), createOptions('GET', token));

/** Delete topic group and their topics by group ID */
export const deleteTopicGroupAndTopicsByUserid = async (
  selectedGroup: any,
  token: string,
) => doFetch(endpoint(`topics/delete/${selectedGroup}`), createOptions('DELETE', token));

/** Delete lecture by ID */
export const deleteLectureByLectureId = async (
  lectureid: string,
  token: string,
) => doFetch(endpoint(`attendance/lecture/${lectureid}`), createOptions('DELETE', token));

/** Close lecture by ID */
export const closeLectureByLectureId = async (
  lectureid: string,
  token: string,
) => doFetch(endpoint(`attendance/lecture/close/${lectureid}`), createOptions('PUT', token));

/** Get open lectures by course ID */
export const getOpenLecturesByCourseid = async (
  courseid: string | (() => string) | undefined,
  token: string,
) => doFetch(endpoint(`attendance/lecture/open/${courseid}`), createOptions('GET', token));

/** Fetch paginated students by instructor ID */
export const fetchStudentsPaginationByInstructorId = async (
  userId: number,
  token: string,
  limit: number = 10,
  page: number = 1,
) => doFetch(endpoint(`students/pagination/${userId}?limit=${limit}&page=${page}`), createOptions('GET', token));

/** Get course details by course ID */
export const getDetailsByCourseId = async (courseId: string, token: string) =>
  doFetch(endpoint(`getdetailsbycourseid/${courseId}`), createOptions('GET', token));

/** Get students by instructor ID */
export const getStudentsByInstructorId = async (
  instructorId: number,
  token: string,
) => doFetch(endpoint(`students/${instructorId}`), createOptions('GET', token));

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
  getStudentsByInstructorId,
};


/* OLD FILE STARTS HERE export const createCourse = async (
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
  // Validate dates before formatting
  if (!(start_date instanceof Date) || isNaN(start_date.getTime())) {
    throw new Error('Invalid start date format');
  }
  if (!(end_date instanceof Date) || isNaN(end_date.getTime())) {
    throw new Error('Invalid end date format');
  }
  if (start_date >= end_date) {
    throw new Error('Start date must be before end date');
  }

  // Format dates for MySQL (YYYY-MM-DD HH:MM:SS)
  const formattedStart_date = start_date
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');
  const formattedEnd_date = end_date
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');

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

export const getStudentsByInstructorId = async (
  instructorId: number,
  token: string,
) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };

  return await doFetch(`${baseUrl}courses/students/${instructorId}`, options);
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
  getStudentsByInstructorId,
};*/
