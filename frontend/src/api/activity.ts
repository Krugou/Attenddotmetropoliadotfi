import { API_CONFIG } from '../config';
import { doFetch } from '../utils/doFetch';


export interface AttendanceData {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  studentNumber: string;
  groupName: string;
  code: string;
  attendance: {
    total: number;
    attended: number;
    percentage: number;
    lastAttendance: string;
  };
}

export interface CourseGroupData {
  courseName: string;
  courseId: number;
  students: AttendanceData[];
}

export interface ActivityResponse {
  success: boolean;
  data?: CourseGroupData[];
  error?: string;
}


export const getStudentAttendance = async (userid: number, token: string): Promise<ActivityResponse> => {
  try {
    if (!userid || isNaN(userid)) {
      throw new Error('Invalid user ID');
    }

    return await doFetch(
      `${API_CONFIG.baseUrl}activity/${userid}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      }
    );
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch attendance data'
    };
  }
};

export const getAllStudentsAttendance = async (token: string): Promise<ActivityResponse> => {
  try {
    const response = await doFetch(
      `${API_CONFIG.baseUrl}activity/all`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.error('Error fetching all students attendance:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch attendance data'
    };
  }
};

const activityApi = {
  getStudentAttendance,
  getAllStudentsAttendance,
};


export default activityApi;
