/**
 * TODO:
 * Siirrä API-parametrihommat (getCourseReservations, checkIfCourseExists) esim. src/api/course.ts
 * Siirrä CreateCourseFile, koska se sisältää selain-API:n (FormData)
 * Upload suoraan palvelufunktioon
 * Yhtenäistä courseid-tyyppi (nyt joissain string, joissain number)
 * Selkeytä päivämäärien käsittely: raw -> string, parsed -> Date
 */

export interface Course {
  courseid: string;
  name: string;
  code: string;
  start_date: string;
  end_date: string;
  student_group: string[];
  topics: string[];
  instructors: string[];
}

export interface CreateCourseInputs {
  courseName: string;
  courseCode: string;
  studentGroup: string;
  startDate: string;
  endDate: string;
  instructors: {email: string}[];
  studentList: string[];
  topicGroup: string;
  topics: string;
  instructorEmail: string;
}

export interface CourseDetail {
  courseid: number;
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  code: string;
  studentgroup_name: string;
  created_at: string;
  topic_names: string[];
  user_count: number;
  instructor_name: string;
}

export interface AdminCourse {
  courseid: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  code: string;
  studentgroup_name: string;
  topic_names: string;
  created_at: string;
  user_count: number;
  instructor_name: string;
}


export interface CreateCourseFile {
  formDataFile: FormData;
}

export interface getCourseReservations {
  code: string;
}

export interface checkIfCourseExists {
  codes: string;
  token: string;
}
