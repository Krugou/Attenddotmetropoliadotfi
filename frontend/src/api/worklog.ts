import {API_CONFIG} from '../config';
import {doFetch} from '../utils/doFetch';
const baseUrl = API_CONFIG.baseUrl;
export const checkStudentExistingGroup = async (
  userId: number,
  courseId: number,
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
    `${baseUrl}worklog/student/group/${userId}/${courseId}`,
    options,
  ).then((response) => response.existingGroup);
};
export const insertStudentToGroup = async (
  userId: number,
  groupId: number,
  token: string,
) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({userId, groupId}),
  };
  return await doFetch(`${baseUrl}worklog/group/${groupId}/students`, options);
};
export const createWorkLogCourse = async (
  worklog: {
    name: string;
    code: string;
    description: string;
    requiredHours: number;
    startDate: string;
    endDate: string;
    instructors: {email: string}[];
    studentList: string[];
    instructorEmail: string;
  },
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

export const checkWorklogCode = async (code: string, token: string) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  return await doFetch(`${baseUrl}worklog/checkcode/${code}`, options);
};

export const getWorkLogCoursesByInstructor = async (
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
  return await doFetch(`${baseUrl}worklog/instructor/${email}`, options);
};

export const deleteWorklog = async (
  worklogId: number,
  token: string | null,
) => {
  const options = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  return await doFetch(`${baseUrl}worklog/${worklogId}`, options);
};

export const getWorkLogDetail = async (courseId: string, token: string) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  return await doFetch(`${baseUrl}worklog/${courseId}`, options);
};

export const getWorkLogCourseDetail = async (id: string, token: string) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  return await doFetch(`${baseUrl}worklog/${id}`, options);
};

export const modifyWorkLog = async (
  token: string,
  worklogId: string | undefined,
  modifiedData: {
    name: string;
    code: string;
    description: string;
    start_date: string;
    end_date: string;
    required_hours: number;
    instructors: string[];
  },
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

export const getWorkLogGroupsByCourse = async (
  courseId: string,
  token: string,
) => {
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

export const createWorkLogGroup = async (
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

export const getWorkLogStudentsByCourse = async (
  courseId: string,
  token: string,
) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };

  return await doFetch(`${baseUrl}worklog/${courseId}/students`, options);
};

export const addStudentsToWorkLogGroup = async (
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

export const getWorkLogGroupStudents = async (
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

  const result = await doFetch(
    `${baseUrl}worklog/group/${groupId}/students`,
    options,
  );
  return result.students;
};

export const getWorkLogGroupDetails = async (
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

export const createWorkLogEntry = async (
  params: {
    userId: number | string;
    courseId: number;
    startTime: Date;
    endTime: Date;
    description: string;
    status?: number | string;
  },
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

export const getActiveCoursesByStudentEmail = async (
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

  return await doFetch(`${baseUrl}worklog/student/active/${email}`, options);
};

export const getActiveWorkLogEntries = async (
  userid: string | number,
  token: string,
) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };

  return await doFetch(`${baseUrl}worklog/active/${userid}`, options);
};

export const closeWorkLogEntry = async (
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

export const getAllWorkLogEntries = async (userId: number, token: string) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  return await doFetch(`${baseUrl}worklog/entries/all/${userId}`, options);
};

export const deleteWorkLogEntry = async (entryId: number, token: string) => {
  const options = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  return await doFetch(`${baseUrl}worklog/entries/${entryId}`, options);
};

export const updateWorkLogEntry = async (
  entryId: number,
  updatedData: Partial<{
    description: string;
    startTime: Date;
    endTime: Date;
    status: number;
  }>,
  token: string,
) => {
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify(updatedData),
  };
  return await doFetch(`${baseUrl}worklog/entries/${entryId}`, options);
};

export const getWorkLogStats = async (userId: number, token: string ,courseId?: number) => {
  try {
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
    };

    // Add courseId to query params if provided
    const url = courseId
      ? `${baseUrl}worklog/stats/${userId}?courseId=${courseId}`
      : `${baseUrl}worklog/stats/${userId}`;

    return await doFetch(url, options);
  } catch (error) {
    console.error('Error fetching worklog stats:', error);
    return [];
  }
};

export const addNewStudentToWorklog = async (
  token: string,
  courseId: string,
  studentData: {
    email: string;
    first_name: string;
    last_name: string;
    studentnumber: string;
    studentGroupId: number | null;
  }
) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify(studentData),
  };

  return await doFetch(`${baseUrl}worklog/${courseId}/students/new`, options);
};

export const removeStudentFromGroup = async (
  groupId: number,
  studentId: number,
  token: string,
) => {
  const options = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  return await doFetch(`${baseUrl}worklog/group/${groupId}/student/${studentId}`, options);
};

export const worklogApi = {
  checkStudentExistingGroup,
  insertStudentToGroup,
  createWorkLogCourse,
  checkWorklogCode,
  getWorkLogCoursesByInstructor,
  deleteWorklog,
  getWorkLogDetail,
  getWorkLogCourseDetail,
  modifyWorkLog,
  getWorkLogGroupsByCourse,
  createWorkLogGroup,
  getWorkLogStudentsByCourse,
  addStudentsToWorkLogGroup,
  getWorkLogGroupStudents,
  getWorkLogGroupDetails,
  createWorkLogEntry,
  getActiveCoursesByStudentEmail,
  getActiveWorkLogEntries,
  closeWorkLogEntry,
  getAllWorkLogEntries,
  deleteWorkLogEntry,
  updateWorkLogEntry,
  getWorkLogStats,
  addNewStudentToWorklog,
  removeStudentFromGroup,
};
