import {API_CONFIG} from '../config';
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
};
