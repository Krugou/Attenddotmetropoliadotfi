import {API_CONFIG} from '../config';
import {doFetch} from '../utils/doFetch';
const baseUrl = API_CONFIG.baseUrl;
export const addNewStudentUserCourse = async (
  token: string,
  email: string,
  studentnumber: string,
  firstname: string,
  lastname: string,
  studentGroupId: number | undefined | null,
  courseId: number | undefined | null,
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
      courseId,
    }),
  };
  const url = `${baseUrl}secure/insert-student-user-course/`;
  return doFetch(url, options);
};
export const fetchPaginatedStudents = async (
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
    `${baseUrl}secure/students/paginated?limit=${limit}&page=${page}`,
    options,
  );
};
export const fetchStudentGroups = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  return await doFetch(baseUrl + 'secure/studentgroups', options);
};
export const fetchAllStudents = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  return await doFetch(`${baseUrl}secure/students`, options);
};
export const checkStaffByEmail = async (email: string, token: string) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  return await doFetch(`${baseUrl}secure/check-staff/${email}`, options);
};
export const getAttendanceThreshold = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  return await doFetch(baseUrl + 'secure/getattendancethreshold', options);
};
export const updateUserLanguage = async (
  email: string,
  language: string,
  token: string,
) => {
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({email, language}),
  };
  return await doFetch(`${baseUrl}secure/update-language`, options);
};
export const fetchUserByIdEdit = async (userid: number, token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  return await doFetch(baseUrl + 'secure/getuser/' + userid, options);
};
export const updateUserEdit = async (token: string, user: any) => {
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({user}),
  };
  const url = `${baseUrl}secure/updateuser`;
  return doFetch(url, options);
};

export const testOpenDataConnection = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  return await doFetch(`${baseUrl}secure/test-opendata`, options);
};

export const secureApi = {
  updateUserEdit,
  fetchUserByIdEdit,
  getAttendanceThreshold,
  updateUserLanguage,
  addNewStudentUserCourse,
  fetchPaginatedStudents,
  fetchStudentGroups,
  fetchAllStudents,
  checkStaffByEmail,
  testOpenDataConnection,
};
