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
