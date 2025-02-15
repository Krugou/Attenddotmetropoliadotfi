export interface CombinedStudentData {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  studentNumber: string;
  groupName: string;
  courseName: string;
  code: string;
  attendance: {
    total: number;
    attended: number;
    percentage: number;
    lastAttendance: string;
  };
}

export type SortField =
  | keyof CombinedStudentData
  | 'name'
  | 'attendance.percentage'
  | 'attendance.total'
  | 'attendance.attended'
  | 'attendance.lastAttendance';

export type SortOrder = 'asc' | 'desc';

export type FilterPeriod = 'all' | 'week' | 'month' | 'threshold' | 'custom';
