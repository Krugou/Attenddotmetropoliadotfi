import { API_CONFIG } from '../config';
import { doFetch } from '../utils/doFetch';
import { createOptions } from '../utils/apiHelper';

const baseUrl = API_CONFIG.baseUrl;

// --- Admin API Endpoints ---

/**
 * Add a new student user.
 */
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

/**
 * Add a new staff user.
 */
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

/**
 * Fetch total worklog counts.
 */
export const getWorklogCounts = async (token: string) =>
  doFetch(`${baseUrl}admin/worklogcounts`, createOptions('GET', token));

/**
 * Fetch all worklog courses.
 */
export const getWorkLogCourses = async (token: string) =>
  doFetch(`${baseUrl}admin/worklogcourses`, createOptions('GET', token));

/**
 * Fetch total course counts.
 */
export const getCourseCounts = async (token: string) =>
  doFetch(`${baseUrl}admin/coursecounts`, createOptions('GET', token));

/**
 * Delete attendance record by ID.
 */
export const deleteAttendanceByAttendanceId = async (
  token: string,
  attendanceid: number
) =>
  doFetch(
    `${baseUrl}admin/attendance/delete/${attendanceid}`,
    createOptions('DELETE', token)
  );

/**
 * Fetch server logs.
 */
export const fetchLogs = async (token: string, lineLimit: number) =>
  doFetch(`${baseUrl}admin/logs/${lineLimit}`, createOptions('GET', token));

/**
 * Fetch error logs.
 */
export const fetchErrorLogs = async (token: string, lineLimit: number) =>
  doFetch(`${baseUrl}admin/errorlogs/${lineLimit}`, createOptions('GET', token));

/**
 * Check if a student number exists.
 */
export const checkStudentNumberExists = async (
  studentnumber: string,
  token: string
) =>
  doFetch(
    `${baseUrl}admin/checkstudentnumber/${studentnumber}`,
    createOptions('GET', token)
  );

/**
 * Check if a student email exists.
 */
export const checkStudentEmailExists = async (email: string, token: string) =>
  doFetch(
    `${baseUrl}admin/checkstudentemail/${email}`,
    createOptions('GET', token)
  );

/**
 * Fetch a list of courses.
 */
export const getCourses = async (token: string) =>
  doFetch(`${baseUrl}admin/getcourses`, createOptions('GET', token));

export const fetchUsersCourse = getCourses; // Alias if needed

/**
 * Fetch all user roles.
 */
export const fetchAllRoles = async (token: string) =>
  doFetch(`${baseUrl}admin/roles`, createOptions('GET', token));

/**
 * Change user role ID.
 */
export const changeRoleId = async (
  email: string,
  roleId: string,
  token: string
) =>
  doFetch(
    `${baseUrl}admin/change-role`,
    createOptions('POST', token, { email, roleId })
  );

/**
 * Fetch special user roles.
 */
export const fetchAllRolesSpecial = async (token: string) =>
  doFetch(`${baseUrl}admin/rolesspecial`, createOptions('GET', token));

/**
 * Update server settings.
 */
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

/**
 * Fetch server settings.
 */
export const fetchServerSettings = async (token: string) =>
  doFetch(`${baseUrl}admin`, createOptions('GET', token));

/**
 * Fetch user feedback.
 */
export const getUserFeedback = async (token: string) =>
  doFetch(`${baseUrl}admin/feedback`, createOptions('GET', token));

/**
 * Delete feedback entry.
 */
export const deleteUserFeedback = async (
  feedbackId: number,
  token: string
) =>
  doFetch(
    `${baseUrl}admin/feedback/${feedbackId}`,
    createOptions('DELETE', token)
  );

/**
 * Fetch user by ID.
 */
export const fetchUserById = async (userid: number, token: string) =>
  doFetch(`${baseUrl}admin/getuser/${userid}`, createOptions('GET', token));

/**
 * Fetch all users.
 */
export const fetchUsers = async (token: string) =>
  doFetch(`${baseUrl}admin/getusers`, createOptions('GET', token));

/**
 * Fetch all lectures.
 */
export const fetchAllLectures = async (token: string) =>
  doFetch(`${baseUrl}admin/alllectures/`, createOptions('GET', token));

/**
 * Get count of users by role.
 */
export const getRoleCounts = async (token: string) =>
  doFetch(`${baseUrl}admin/getrolecounts`, createOptions('GET', token));

/**
 * Fetch attendance by course and lecture ID.
 */
export const fetchAttendances = async (
  token: string,
  courseid: string,
  lectureid: string
) =>
  doFetch(
    `${baseUrl}admin/allattendancedatabycourse/${courseid}/${lectureid}`,
    createOptions('GET', token)
  );

/**
 * Update user data.
 */
export const updateUser = async (token: string, user: any) =>
  doFetch(
    `${baseUrl}admin/updateuser`,
    createOptions('PUT', token, { user })
  );

/**
 * Get total lectures and attendances.
 */
export const getLectureAndAttendanceCount = async (token: string) =>
  doFetch(`${baseUrl}admin/lectureandattendancecount/`, createOptions('GET', token));

/**
 * Get current server status.
 */
export const getServerStatus = async (token: string) =>
  doFetch(`${baseUrl}admin/server-status`, createOptions('GET', token));

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
};




// OLD CODE STARTS HERE
/*import {API_CONFIG} from '../config';
import {doFetch} from '../utils/doFetch';
const baseUrl = API_CONFIG.baseUrl;

export const addNewStudentUser = async (
  token: string,
  email: string,
  studentnumber: string,
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
      studentnumber,
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
  studentnumber: string,
  token: string,
) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  const url = `${baseUrl}admin/checkstudentnumber/${studentnumber}`;
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
