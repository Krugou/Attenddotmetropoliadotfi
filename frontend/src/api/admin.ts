import { API_CONFIG } from '../config';
import { doFetch } from '../utils/doFetch';
import { createOptions } from '../utils/apiHelper';

const baseUrl = API_CONFIG.baseUrl;

// --- Admin API Endpoints ---

export const addNewStudentUser = async (
  token: string,
  email: string,
  studentnumber: string,
  firstname: string,
  lastname: string,
  studentGroupId: number | undefined | null
) => {
  return doFetch(
    `${baseUrl}admin/insert-student-user/`,
    createOptions('POST', token, {
      email,
      first_name: firstname,
      last_name: lastname,
      studentnumber,
      studentGroupId,
    })
  );
};

export const addNewStaffUser = async (
  token: string,
  email: string,
  firstname: string,
  lastname: string,
  staff: number,
  roleid: number
) => {
  return doFetch(
    `${baseUrl}admin/insert-staff-user/`,
    createOptions('POST', token, {
      email,
      first_name: firstname,
      last_name: lastname,
      staff,
      roleid,
    })
  );
};

export const getWorklogCounts = async (token: string) =>
  doFetch(`${baseUrl}admin/worklogcounts`, createOptions('GET', token));

export const getWorkLogCourses = async (token: string) =>
  doFetch(`${baseUrl}admin/worklogcourses`, createOptions('GET', token));

export const getCourseCounts = async (token: string) =>
  doFetch(`${baseUrl}admin/coursecounts`, createOptions('GET', token));

export const deleteAttendanceByAttendanceId = async (
  token: string,
  attendanceid: number
) =>
  doFetch(
    `${baseUrl}admin/attendance/delete/${attendanceid}`,
    createOptions('DELETE', token)
  );

export const fetchLogs = async (token: string, lineLimit: number) =>
  doFetch(`${baseUrl}admin/logs/${lineLimit}`, createOptions('GET', token));

export const fetchErrorLogs = async (token: string, lineLimit: number) =>
  doFetch(`${baseUrl}admin/errorlogs/${lineLimit}`, createOptions('GET', token));

export const checkStudentNumberExists = async (
  studentnumber: string,
  token: string
) =>
  doFetch(
    `${baseUrl}admin/checkstudentnumber/${studentnumber}`,
    createOptions('GET', token)
  );

export const checkStudentEmailExists = async (email: string, token: string) =>
  doFetch(
    `${baseUrl}admin/checkstudentemail/${email}`,
    createOptions('GET', token)
  );

export const getCourses = async (token: string) =>
  doFetch(`${baseUrl}admin/getcourses`, createOptions('GET', token));

export const fetchUsersCourse = getCourses;

export const fetchAllRoles = async (token: string) =>
  doFetch(`${baseUrl}admin/roles`, createOptions('GET', token));

export const changeRoleId = async (
  email: string,
  roleId: string,
  token: string
) =>
  doFetch(
    `${baseUrl}admin/change-role`,
    createOptions('POST', token, { email, roleId })
  );

export const fetchAllRolesSpecial = async (token: string) =>
  doFetch(`${baseUrl}admin/rolesspecial`, createOptions('GET', token));

export const updateServerSettings = async (
  speedofhash: number,
  leewayspeed: number,
  timeouttime: number,
  attendancethreshold: number,
  token: string
) =>
  doFetch(
    `${baseUrl}admin`,
    createOptions('POST', token, {
      speedofhash,
      leewayspeed,
      timeouttime,
      attendancethreshold,
    })
  );

export const fetchServerSettings = async (token: string) =>
  doFetch(`${baseUrl}admin`, createOptions('GET', token));

export const getUserFeedback = async (token: string) =>
  doFetch(`${baseUrl}admin/feedback`, createOptions('GET', token));

export const deleteUserFeedback = async (
  feedbackId: number,
  token: string
) =>
  doFetch(
    `${baseUrl}admin/feedback/${feedbackId}`,
    createOptions('DELETE', token)
  );

export const fetchUserById = async (userid: number, token: string) =>
  doFetch(`${baseUrl}admin/getuser/${userid}`, createOptions('GET', token));

export const fetchUsers = async (token: string) =>
  doFetch(`${baseUrl}admin/getusers`, createOptions('GET', token));

export const fetchAllLectures = async (token: string) =>
  doFetch(`${baseUrl}admin/alllectures/`, createOptions('GET', token));

export const getRoleCounts = async (token: string) =>
  doFetch(`${baseUrl}admin/getrolecounts`, createOptions('GET', token));

export const fetchAttendances = async (
  token: string,
  courseid: string,
  lectureid: string
) =>
  doFetch(
    `${baseUrl}admin/allattendancedatabycourse/${courseid}/${lectureid}`,
    createOptions('GET', token)
  );

export const updateUser = async (token: string, user: any) =>
  doFetch(
    `${baseUrl}admin/updateuser`,
    createOptions('PUT', token, { user })
  );

export const getLectureAndAttendanceCount = async (token: string) =>
  doFetch(`${baseUrl}admin/lectureandattendancecount/`, createOptions('GET', token));

export const getServerStatus = async (token: string) =>
  doFetch(`${baseUrl}admin/server-status`, createOptions('GET', token));

// New: fetch only students (admin + counselor), supports ?q=
export const fetchStudents = async (token: string, q?: string) => {
  const qs = q && q.trim() ? `?q=${encodeURIComponent(q.trim())}` : '';
  return doFetch(`${baseUrl}admin/getstudents${qs}`, createOptions('GET', token));
};

export const adminApi = {
  fetchAttendances,
  updateUser,
  getLectureAndAttendanceCount,
  fetchUsers,
  fetchStudents,
  getRoleCounts,
  fetchUserById,
  deleteUserFeedback,
  fetchAllLectures,
  getUserFeedback,
  addNewStudentUser,
  addNewStaffUser,
  getWorklogCounts,
  getWorkLogCourses,
  getCourseCounts,
  deleteAttendanceByAttendanceId,
  fetchLogs,
  fetchErrorLogs,
  checkStudentNumberExists,
  checkStudentEmailExists,
  getCourses,
  fetchUsersCourse,
  fetchAllRoles,
  changeRoleId,
  fetchAllRolesSpecial,
  updateServerSettings,
  fetchServerSettings,
  getServerStatus,
};





// OLD CODE STARTS HERE
/*import {API_CONFIG} from '../config';
import {doFetch} from '../utils/doFetch';
const baseUrl = API_CONFIG.baseUrl;

export const addNewStudentUser = async (
  token: string,
  email: string,
  student_number: string,
  firstname: string,
  lastname: string,
  studentGroupId: number | undefined | null,
) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({
      email,
      first_name: firstname,
      last_name: lastname,
      student_number,
      studentGroupId,
    }),
  };
  const url = `${baseUrl}admin/insert-student-user/`;
  return doFetch(url, options);
};
export const addNewStaffUser = async (
  token: string,
  email: string,
  firstname: string,
  lastname: string,
  staff: number,
  roleid: number,
) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({
      email,
      first_name: firstname,
      last_name: lastname,
      staff,
      roleid,
    }),
  };
  const url = `${baseUrl}admin/insert-staff-user/`;
  return doFetch(url, options);
};
export const getWorklogCounts = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  return await doFetch(baseUrl + 'admin/worklogcounts', options);
};

export const getWorkLogCourses = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  return await doFetch(`${baseUrl}admin/worklogcourses`, options);
};
export const getCourseCounts = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  return await doFetch(baseUrl + 'admin/coursecounts', options);
};
export const deleteAttendanceByAttendanceId = async (
  token: string,
  attendanceid: number,
) => {
  const options = {
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  return await doFetch(
    baseUrl + `admin/attendance/delete/${attendanceid}`,
    options,
  );
};

export const fetchLogs = async (token: string, lineLimit: number) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  return await doFetch(`${baseUrl}admin/logs/${lineLimit}`, options);
};

export const fetchErrorLogs = async (token: string, lineLimit: number) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  return await doFetch(`${baseUrl}admin/errorlogs/${lineLimit}`, options);
};
export const checkStudentNumberExists = async (
  student_number: string,
  token: string,
) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  const url = `${baseUrl}admin/checkstudentnumber/${student_number}`;
  return doFetch(url, options);
};
export const checkStudentEmailExists = async (email: string, token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  const url = `${baseUrl}admin/checkstudentemail/${email}`;
  return doFetch(url, options);
};
export const getCourses = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  return await doFetch(baseUrl + 'admin/getcourses', options);
};
export const fetchUsersCourse = async (token: string) => {
  // (If needed, you can also have a course‐related version of fetching users)
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  return await doFetch(baseUrl + 'admin/getcourses', options);
};
export const fetchAllRoles = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  return await doFetch(baseUrl + 'admin/roles', options);
};

export const changeRoleId = async (
  email: string,
  roleId: string,
  token: string,
) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({email, roleId}),
  };
  return await doFetch(baseUrl + 'admin/change-role', options);
};
export const fetchAllRolesSpecial = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  return await doFetch(baseUrl + 'admin/rolesspecial', options);
};
export const updateServerSettings = async (
  speedofhash: number,
  leewayspeed: number,
  timeouttime: number,
  attendancethreshold: number,
  token: string,
) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({
      speedofhash,
      leewayspeed,
      timeouttime,
      attendancethreshold,
    }),
  };
  const url = `${baseUrl}admin`;
  return doFetch(url, options);
};
export const fetchServerSettings = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  const url = `${baseUrl}admin`;
  return doFetch(url, options);
};
export const getUserFeedback = async (token: string) => {
  const response = await doFetch(baseUrl + 'admin/feedback', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  });
  return response;
};
export const fetchAllLectures = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  return await doFetch(baseUrl + `admin/alllectures/`, options);
};
export const deleteUserFeedback = async (feedbackId: number, token: string) => {
  const response = await doFetch(baseUrl + 'admin/feedback/' + feedbackId, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  });
  return response;
};
export const fetchUserById = async (userid: number, token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  return await doFetch(baseUrl + 'admin/getuser/' + userid, options);
};
export const getRoleCounts = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  return await doFetch(baseUrl + 'admin/getrolecounts', options);
};
export const fetchUsers = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  return await doFetch(baseUrl + 'admin/getusers', options);
};
export const getLectureAndAttendanceCount = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  return await doFetch(baseUrl + `admin/lectureandattendancecount/`, options);
};
export const updateUser = async (token: string, user: any) => {
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({user}),
  };
  const url = `${baseUrl}admin/updateuser`;
  return doFetch(url, options);
};
export const fetchAttendances = async (
  token: string,
  courseid: string,
  lectureid: string,
) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  return await doFetch(
    baseUrl + `admin/allattendancedatabycourse/${courseid}/${lectureid}`,
    options,
  );
};

export const getServerStatus = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  return await doFetch(baseUrl + 'admin/server-status', options);
};

export const adminApi = {
  fetchAttendances,
  updateUser,
  getLectureAndAttendanceCount,
  fetchUsers,
  getRoleCounts,
  fetchUserById,
  deleteUserFeedback,
  fetchAllLectures,
  getUserFeedback,
  addNewStudentUser,
  addNewStaffUser,
  getWorklogCounts,
  getWorkLogCourses,
  getCourseCounts,
  deleteAttendanceByAttendanceId,
  fetchLogs,
  fetchErrorLogs,
  checkStudentNumberExists,
  checkStudentEmailExists,
  getCourses,
  fetchUsersCourse,
  fetchAllRoles,
  changeRoleId,
  fetchAllRolesSpecial,
  updateServerSettings,
  fetchServerSettings,
  getServerStatus,
};*/
