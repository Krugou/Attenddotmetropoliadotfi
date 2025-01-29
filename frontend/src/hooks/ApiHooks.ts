('use strict');
// real backend
export const baseUrl =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:3002/'
    : 'https://attend.metropolia.fi/api/';

// for local testing
// export const baseUrl =
// 	import.meta.env.MODE === 'development'
// 		? 'http://localhost:3002/'
// 		: 'http://localhost:3002/';
console.log(`Current mode: ${import.meta.env.MODE}`);
const doFetch = async (url: string, options: RequestInit) => {
  const response = await fetch(url, options);
  const json = await response.json();

  if (!response.ok) {
    const message = json.error ? `${json.error}` : json.message;
    throw new Error(message || response.statusText);
  }
  return json;
};
interface LoginInputs {
  username: string;
  password: string;
}
const postLogin = async (inputs: LoginInputs) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: inputs.username,
      password: inputs.password,
    }),
  };

  return await doFetch(baseUrl + 'users', options);
};
interface CreateCourseInputs {
  courseName: string;
  courseCode: string;
  studentGroup: string;
  startDate: string;
  endDate: string;
  instructors: {email: string}[];
  studentList: string[];
  topicGroup: string; // Replace 'any' with the actual type if known
  topics: string; // Replace 'any' with the actual type if known
  instructorEmail: string;
}
interface CreateCourseFile {
  formDataFile: FormData;
}
const createCourse = async (courseData: CreateCourseInputs, token: string) => {
  const options: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify(courseData),
  };

  const url = `${baseUrl}courses/create`; // append the endpoint to the baseUrl
  return doFetch(url, options);
};
const excelInput = async (inputs: CreateCourseFile, token: string) => {
  const {formDataFile} = inputs;
  const options: RequestInit = {
    headers: {
      Authorization: 'Bearer ' + token,
    },
    method: 'POST',
    body: formDataFile,
  };

  const url = `${baseUrl}courses/excelinput`; // append the endpoint to the baseUrl
  return doFetch(url, options);
};
interface getCourseReservations {
  code: string;
}
interface checkIfCourseExists {
  codes: string;
  token: string;
}

const checkIfCourseExists = async (inputs: checkIfCourseExists) => {
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

const getAllCoursesByInstructorEmail = async (email: string, token: string) => {
  // Define your fetch options
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };

  // Use the email to make the API request
  return await doFetch(`${baseUrl}courses/instructor/${email}`, options);
};

const getAllTopicGroupsAndTopicsInsideThem = async (token: string) => {
  const response = await doFetch(baseUrl + 'courses/topics', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  });
  return response;
};
const getAllTopicGroupsAndTopicsInsideThemByUserid = async (
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
const getCourseDetailByCourseId = async (courseId: string, token: string) => {
  const response = await doFetch(baseUrl + 'courses/coursesbyid/' + courseId, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  });
  return response;
};
const postUserFeedback = async (
  inputs: {topic: string; text: string; userId: number},
  token: string,
) => {
  const response = await doFetch(baseUrl + 'users/feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(inputs),
  });
  return response;
};
const getUserFeedback = async (token: string) => {
  const response = await doFetch(baseUrl + 'admin/feedback', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  });
  return response;
};
const deleteUserFeedback = async (feedbackId: number, token: string) => {
  const response = await doFetch(baseUrl + 'admin/feedback/' + feedbackId, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  });
  return response;
};

const getCourseReservations = async (inputs: getCourseReservations, token) => {
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
const getOpenLecturesByTeacher = async (teacherId: number, token: string) => {
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
interface Course {
  code: string;
}

const CreateLecture = async (
  topicname: string,
  course: Course,
  start_date: Date,
  end_date: Date,
  timeofday: string,
  state: string,
  token: string,
) => {
  const inputDate = start_date;
  const formattedStart_date = new Date(inputDate)
    .toISOString()
    .replace('T', ' ')
    .replace('Z', '');
  const inputEndDate = end_date;
  const formattedEnd_date = new Date(inputEndDate)
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
const getUserInfoByToken = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  return doFetch(baseUrl + 'secure/', options);
};

const getAllCourseInfoByUserEmail = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };

  // Use the email to make the API request
  return await doFetch(`${baseUrl}courses/user/all`, options);
};

const getLectureInfo = async (lectureid: string, token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  // Use the lectureid as a URL parameter
  return await doFetch(
    `${baseUrl}courses/attendance/lectureinfo/${lectureid}`,
    options,
  );
};
const getAttendanceInfoByUsercourseid = async (
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
  console.log(token);
  // Use the email to make the API request
  return await doFetch(
    `${baseUrl}courses/attendance/usercourse/${usercourseid}`,
    options,
  );
};
const fetchServerSettings = async (token: string) => {
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
const updateServerSettings = async (
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
const getStudentsByInstructorId = async (userid: number, token: string) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  const url = `${baseUrl}courses/students/${userid}`;
  return doFetch(url, options);
};

const updateGdprStatus = async (userid: number, token: string) => {
  console.log(userid);
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  const url = `${baseUrl}secure/accept-gdpr/${userid}`;
  return doFetch(url, options);
};

const deleteCourse = async (courseId: number, token: string) => {
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
const updateOwnedTopicgroupandtheirtopics = async (
  topicGroup,
  topics,
  email,
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
// Define the function to fetch all roles
const fetchAllRolesSpecial = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  return await doFetch(baseUrl + 'admin/rolesspecial', options);
};
const fetchAllRoles = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  return await doFetch(baseUrl + 'admin/roles', options);
};

// Define the function to change role ID
const changeRoleId = async (email: string, roleId: string, token: string) => {
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
const fetchUsers = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  return await doFetch(baseUrl + 'admin/getusers', options);
};

interface ModifiedData {
  courseId?: string;
  courseName?: string;
  startDate?: Date;
  endDate?: Date;
  courseCode?: string;
  studentGroup?: string;
  instructors?: string[];
  topic_names?: string[];
}

const modifyCourse = async (
  token: string | null,
  courseId: string | undefined,
  modifiedData: ModifiedData,
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
const fetchUserById = async (userid: number, token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  return await doFetch(baseUrl + 'admin/getuser/' + userid, options);
};
const fetchUserByIdEdit = async (userid: number, token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  return await doFetch(baseUrl + 'secure/getuser/' + userid, options);
};
const getCourses = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  return await doFetch(baseUrl + 'admin/getcourses', options);
};

const getUserInfoByUserid = async (token: string, id: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  return await doFetch(baseUrl + 'courses/' + id, options);
};
const checkCourseCode = async (code: string, token: string) => {
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
const checkStaffByEmail = async (email: string, token: string) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  return await doFetch(`${baseUrl}secure/check-staff/${email}`, options);
};

const fetchAllStudents = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  return await doFetch(`${baseUrl}secure/students`, options);
};
const updateUserCourseTopics = async (
  token: string,
  usercourseid,
  modifiedTopics,
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

const updateAttendanceStatus = async (
  attendanceid: number,
  status: number,
  token: string | null,
) => {
  console.log(attendanceid);
  console.log(token, ' TOKEN');
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({attendanceid, status}), // Include usercourseid in the request body
  };

  const url = `${baseUrl}courses/attendance/update`;

  return doFetch(url, options);
};
const fetchTeacherOwnLectures = async (teacherId: string, token: string) => {
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

const updateUser = async (token: string, user: any) => {
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
const updateUserEdit = async (token: string, user: any) => {
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
const getLecturesAndAttendances = async (
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
const fetchStudentGroups = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  return await doFetch(baseUrl + 'secure/studentgroups', options);
};
const checkStudentNumberExists = async (
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

const checkStudentEmailExists = async (email: string, token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  const url = `${baseUrl}admin/checkstudentemail/${email}`;
  return doFetch(url, options);
};

const getAllCourses = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  return await doFetch(baseUrl + 'courses/getallcourses', options);
};
const getDetailsByCourseId = async (courseId: string, token: string) => {
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
const getRoleCounts = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  return await doFetch(baseUrl + 'admin/getrolecounts', options);
};
const getAttendanceThreshold = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  return await doFetch(baseUrl + 'secure/getattendancethreshold', options);
};
const updateStudentCourses = async (
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
const deleteStudentFromCourse = async (
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
const getStudentAndTopicsByUsercourseid = async (
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
const checkIfTopicGroupWithEmailExists = async (
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

const getStudentsByCourseId = async (courseId: string, token: string) => {
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

const deleteTopicGroupAndTopicsByUserid = async (selectedGroup, token) => {
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
const deleteLectureByLectureId = async (lectureid: string, token: string) => {
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
const fetchAllLectures = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  return await doFetch(baseUrl + `admin/alllectures/`, options);
};
const fetchAttendances = async (
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
const getLectureAndAttendanceCount = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  return await doFetch(baseUrl + `admin/lectureandattendancecount/`, options);
};
const addNewStudentUser = async (
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

const addNewStaffUser = async (
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

const addNewStudentUserCourse = async (
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
const closeLectureByLectureId = async (lectureid: string, token: string) => {
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
const getOpenLecturesByCourseid = async (
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
const deleteAttendanceByAttendanceId = async (
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
const fetchLogs = async (token: string, lineLimit: number) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  return await doFetch(`${baseUrl}admin/logs/${lineLimit}`, options);
};

const fetchErrorLogs = async (token: string, lineLimit: number) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  return await doFetch(`${baseUrl}admin/errorlogs/${lineLimit}`, options);
};

const fetchPaginatedStudents = async (
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

const fetchStudentsPaginationByInstructorId = async (
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

interface WorkLogCourseFormData {
  name: string;
  code: string;
  description: string;
  requiredHours: number;
  startDate: string;
  endDate: string;
  instructors: {email: string}[];
  studentList: string[];
  instructorEmail: string;
}

const createWorkLogCourse = async (
  worklog: WorkLogCourseFormData,
  token: string,
) => {
  const options: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify(worklog),
  };
  return await doFetch(`${baseUrl}worklog`, options);
};

const updateUserLanguage = async (
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

const updateUserDarkMode = async (
  email: string,
  darkMode: number,
  token: string,
) => {
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({email, darkMode}),
  };
  return await doFetch(`${baseUrl}secure/update-darkmode`, options);
};

const getUserLanguage = async (email: string, token: string) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  return await doFetch(`${baseUrl}secure/user-language/${email}`, options);
};

const checkWorklogCode = async (code: string, token: string) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  return await doFetch(`${baseUrl}worklog/checkcode/${code}`, options);
};

const getWorkLogCoursesByInstructor = async (email: string, token: string) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  return await doFetch(`${baseUrl}worklog/instructor/${email}`, options);
};

const deleteWorklog = async (worklogId: number, token: string | null) => {
  const options = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  return await doFetch(`${baseUrl}worklog/${worklogId}`, options);
};

const getWorkLogDetail = async (courseId: string, token: string) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  return await doFetch(`${baseUrl}worklog/${courseId}`, options);
};

const getWorkLogCourseDetail = async (id: string, token: string) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  return await doFetch(`${baseUrl}worklog/${id}`, options);
};

interface ModifyWorkLogData {
  name: string;
  code: string;
  description: string;
  start_date: string;
  end_date: string;
  required_hours: number;
  instructors: string[];
}

const modifyWorkLog = async (
  token: string,
  worklogId: string | undefined,
  modifiedData: ModifyWorkLogData,
) => {
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({
      modifiedData,
    }),
  };
  return await doFetch(`${baseUrl}worklog/${worklogId}`, options);
};

const getWorkLogGroupsByCourse = async (courseId: string, token: string) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };

  const result = await doFetch(`${baseUrl}worklog/${courseId}/groups`, options);
  return result.groups;
};

const createWorkLogGroup = async (
  courseId: string,
  name: string,
  token: string,
) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({name}),
  };
  return await doFetch(`${baseUrl}worklog/${courseId}/groups`, options);
};

const getWorkLogStudentsByCourse = async (courseId: string, token: string) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };

  return await doFetch(`${baseUrl}worklog/${courseId}/students`, options);
};

const addStudentsToWorkLogGroup = async (
  groupId: number,
  studentIds: number[],
  token: string,
) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({studentIds}),
  };
  return await doFetch(`${baseUrl}worklog/group/${groupId}/students`, options);
};

const getWorkLogGroupStudents = async (groupId: number, token: string) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };

  const result = await doFetch(
    `${baseUrl}worklog/group/${groupId}/students`,
    options,
  );
  return result.students;
};

const getWorkLogGroupDetails = async (
  courseId: number,
  groupId: number,
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
    `${baseUrl}worklog/group/${courseId}/${groupId}`,
    options,
  );
};
interface CreateWorkLogEntryParams {
  userId: number;
  courseId: number;
  startTime: Date;
  endTime: Date;
  description: string;
  status?: number; // Add status as an optional parameter
}

const createWorkLogEntry = async (
  params: CreateWorkLogEntryParams,
  token: string,
) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify(params),
  };
  return await doFetch(`${baseUrl}worklog/entries/create`, options);
};

const getActiveCoursesByStudentEmail = async (email: string, token: string) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };

  return await doFetch(`${baseUrl}worklog/student/active/${email}`, options);
};
const getActiveWorkLogEntries = async (userid: string, token: string) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };

  return await doFetch(`${baseUrl}worklog/active/${userid}`, options);
};
const closeWorkLogEntry = async (
  worklogId: number,
  token: string,
  description?: string,
) => {
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify(description ? {description} : {}),
  };
  return await doFetch(`${baseUrl}worklog/entries/close/${worklogId}`, options);
};

const getAllWorkLogEntries = async (userId: number, token: string) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  return await doFetch(`${baseUrl}worklog/entries/all/${userId}`, options);
};

const apiHooks = {
  closeWorkLogEntry,
  getActiveWorkLogEntries,
  createWorkLogEntry,
  modifyWorkLog,
  getWorkLogCourseDetail,
  getWorkLogDetail,
  deleteWorklog,
  getWorkLogCoursesByInstructor,
  createWorkLogCourse,
  fetchErrorLogs,
  fetchLogs,
  deleteAttendanceByAttendanceId,
  addNewStudentUserCourse,
  postUserFeedback,
  getUserFeedback,
  fetchAttendances,
  getLectureAndAttendanceCount,
  addNewStudentUser,
  fetchAllLectures,
  checkIfTopicGroupWithEmailExists,
  getRoleCounts,
  checkStudentNumberExists,
  fetchStudentGroups,
  updateUser,
  checkStaffByEmail,
  checkCourseCode,
  getCourses,
  fetchUserById,
  fetchUsers,
  updateOwnedTopicgroupandtheirtopics,
  fetchAllRoles,
  fetchAllRolesSpecial,
  changeRoleId,
  fetchServerSettings,
  postLogin,
  createCourse,
  checkIfCourseExists,
  getAllTopicGroupsAndTopicsInsideThem,
  getAllCoursesByInstructorEmail,
  getCourseDetailByCourseId,
  getCourseReservations,
  CreateLecture,
  getUserInfoByToken,
  getAllCourseInfoByUserEmail,
  getAttendanceInfoByUsercourseid,
  excelInput,
  updateServerSettings,
  deleteCourse,
  getLectureInfo,
  getStudentsByInstructorId,
  getAllTopicGroupsAndTopicsInsideThemByUserid,
  modifyCourse,
  updateGdprStatus,
  getUserInfoByUserid,
  fetchAllStudents,
  updateUserCourseTopics,
  updateAttendanceStatus,
  getLecturesAndAttendances,
  fetchTeacherOwnLectures,
  getAllCourses,
  getDetailsByCourseId,
  getAttendanceThreshold,
  updateStudentCourses,
  deleteStudentFromCourse,
  getStudentAndTopicsByUsercourseid,
  getStudentsByCourseId,
  deleteTopicGroupAndTopicsByUserid,
  deleteLectureByLectureId,
  closeLectureByLectureId,
  getOpenLecturesByCourseid,
  deleteUserFeedback,
  getOpenLecturesByTeacher,
  fetchUserByIdEdit,
  updateUserEdit,
  checkStudentEmailExists,
  addNewStaffUser,
  fetchPaginatedStudents,
  fetchStudentsPaginationByInstructorId,
  updateUserLanguage,
  updateUserDarkMode,
  getUserLanguage,
  checkWorklogCode,
  getWorkLogGroupsByCourse,
  createWorkLogGroup,
  getWorkLogStudentsByCourse,
  addStudentsToWorkLogGroup,
  getWorkLogGroupStudents,
  getWorkLogGroupDetails,
  getActiveCoursesByStudentEmail,
  getAllWorkLogEntries,
};
export default apiHooks;
