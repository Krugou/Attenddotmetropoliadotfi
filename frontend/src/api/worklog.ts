import {API_CONFIG} from '../config';
import {doFetch} from '../utils/doFetch';
import { createOptions } from '../utils/apiHelper';
const baseUrl = API_CONFIG.baseUrl;

/*// Helper to construct fetch options
const createOptions = (
  method: string,
  token: string,
  body?: any,
  contentType = 'application/json'
): RequestInit => {
  const headers: Record<string, string> = {
    Authorization: 'Bearer ' + token,
  };
  if (contentType) headers['Content-Type'] = contentType;
  return {
    method,
    headers,
    ...(body ? { body: contentType === 'application/json' ? JSON.stringify(body) : body } : {}),
  };
};*/

const endpoint = (path: string) => `${baseUrl}worklog/${path}`;

/** Check if a student is already in a group */
export const checkStudentExistingGroup = async (userId: number, courseId: number, token: string) => {
  const response = await doFetch(endpoint(`student/group/${userId}/${courseId}`), createOptions('GET', token));
  return response.existingGroup;
};

/** Insert student into a group */
export const insertStudentToGroup = async (userId: number, groupId: number, token: string) =>
  doFetch(endpoint(`group/${groupId}/students`), createOptions('POST', token, { userId, groupId }));

/** Create new worklog course */
export const createWorkLogCourse = async (worklog: any, token: string) =>
  doFetch(endpoint(''), createOptions('POST', token, worklog));

/** Check if a worklog code exists */
export const checkWorklogCode = async (code: string, token: string) =>
  doFetch(endpoint(`checkcode/${code}`), createOptions('GET', token));

/** Get all worklog courses by instructor */
export const getWorkLogCoursesByInstructor = async (email: string, token: string) =>
  doFetch(endpoint(`instructor/${email}`), createOptions('GET', token));

/** Delete a worklog course */
export const deleteWorklog = async (worklogId: number, token: string | null) =>
  doFetch(endpoint(`${worklogId}`), createOptions('DELETE', token!));

/** Get worklog course detail */
export const getWorkLogDetail = async (courseId: string, token: string) =>
  doFetch(endpoint(`${courseId}`), createOptions('GET', token));

export const getWorkLogCourseDetail = getWorkLogDetail;

/** Modify worklog course */
export const modifyWorkLog = async (token: string, worklogId: string | undefined, modifiedData: any) =>
  doFetch(endpoint(`${worklogId}`), createOptions('PUT', token, { modifiedData }));

/** Get all groups for a worklog course */
export const getWorkLogGroupsByCourse = async (courseId: string, token: string) => {
  const result = await doFetch(endpoint(`${courseId}/groups`), createOptions('GET', token));
  return result.groups;
};

/** Create a new group for a worklog course */
export const createWorkLogGroup = async (courseId: string, name: string, token: string) =>
  doFetch(endpoint(`${courseId}/groups`), createOptions('POST', token, { name }));

/** Get students in a worklog course */
export const getWorkLogStudentsByCourse = async (courseId: string, token: string) =>
  doFetch(endpoint(`${courseId}/students`), createOptions('GET', token));

/** Add students to a group */
export const addStudentsToWorkLogGroup = async (groupId: number, studentIds: number[], token: string) =>
  doFetch(endpoint(`group/${groupId}/students`), createOptions('POST', token, { studentIds }));

/** Get students in a group */
export const getWorkLogGroupStudents = async (groupId: number, token: string) => {
  const result = await doFetch(endpoint(`group/${groupId}/students`), createOptions('GET', token));
  return result.students;
};

/** Get group details */
export const getWorkLogGroupDetails = async (courseId: number, groupId: number, token: string) =>
  doFetch(endpoint(`group/${courseId}/${groupId}`), createOptions('GET', token));

/** Create a worklog entry */
export const createWorkLogEntry = async (params: any, token: string) =>
  doFetch(endpoint('entries/create'), createOptions('POST', token, params));

/** Create a worklog practicum entry */
export const createWorkLogEntryPracticum = async (params: any, token: string) =>
  doFetch(endpoint('practicum/entries/create'), createOptions('POST', token, params));

/** Get student's active worklog courses */
export const getActiveCoursesByStudentEmail = async (email: string, token: string) =>
  doFetch(endpoint(`student/active/${email}`), createOptions('GET', token));

/** Get active worklog entries */
export const getActiveWorkLogEntries = async (userid: string | number, token: string) =>
  doFetch(endpoint(`active/${userid}`), createOptions('GET', token));

/** Close a worklog entry */
export const closeWorkLogEntry = async (worklogId: number, token: string, description?: string) =>
  doFetch(endpoint(`entries/close/${worklogId}`), createOptions('PUT', token, description ? { description } : {}));

/** Get all worklog entries */
export const getAllWorkLogEntries = async (userId: number, token: string) =>
  doFetch(endpoint(`entries/all/${userId}`), createOptions('GET', token));

/** Delete a worklog entry */
export const deleteWorkLogEntry = async (entryId: number, token: string) =>
  doFetch(endpoint(`entries/${entryId}`), createOptions('DELETE', token));

/** Update a worklog entry */
export const updateWorkLogEntry = async (entryId: number, updatedData: any, token: string) =>
  doFetch(endpoint(`entries/${entryId}`), createOptions('PUT', token, updatedData));

/** Get worklog statistics */
export const getWorkLogStats = async (userId: number, token: string, courseId?: number) => {
  const query = courseId ? `?courseId=${courseId}` : '';
  return doFetch(endpoint(`stats/${userId}${query}`), createOptions('GET', token));
};

/** Add a new student to worklog */
export const addNewStudentToWorklog = async (token: string, courseId: string, studentData: any) =>
  doFetch(endpoint(`${courseId}/students/new`), createOptions('POST', token, studentData));

/** Remove student from group */
export const removeStudentFromGroup = async (groupId: number, studentId: number, token: string) =>
  doFetch(endpoint(`group/${groupId}/student/${studentId}`), createOptions('DELETE', token));

/** Get practicum entries */
export const getWorkLogEntriesByPracticum = async (practicumId: number, token: string) =>
  doFetch(endpoint(`practicum/entries/${practicumId}`), createOptions('GET', token));

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
  createWorkLogEntryPracticum,
  getActiveCoursesByStudentEmail,
  getActiveWorkLogEntries,
  closeWorkLogEntry,
  getAllWorkLogEntries,
  deleteWorkLogEntry,
  updateWorkLogEntry,
  getWorkLogStats,
  addNewStudentToWorklog,
  removeStudentFromGroup,
  getWorkLogEntriesByPracticum,
};

/*export const checkStudentExistingGroup = async (
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

export const createWorkLogEntryPracticum = async (
  params: {
    userId: number | string;
    courseId: number; // This will be the practicum ID
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
  return await doFetch(`${baseUrl}worklog/practicum/entries/create`, options);
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

export const getWorkLogStats = async (
  userId: number,
  token: string,
  courseId?: number,
) => {
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
  },
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
  return await doFetch(
    `${baseUrl}worklog/group/${groupId}/student/${studentId}`,
    options,
  );
};

export const getWorkLogEntriesByPracticum = async (
  practicumId: number,
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
    `${baseUrl}worklog/practicum/entries/${practicumId}`,
    options,
  );
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
  createWorkLogEntryPracticum,
  getActiveCoursesByStudentEmail,
  getActiveWorkLogEntries,
  closeWorkLogEntry,
  getAllWorkLogEntries,
  deleteWorkLogEntry,
  updateWorkLogEntry,
  getWorkLogStats,
  addNewStudentToWorklog,
  removeStudentFromGroup,
  getWorkLogEntriesByPracticum,
};*/
