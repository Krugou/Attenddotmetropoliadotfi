export interface WorkLogEntry {
  entry_id: number;
  start_time: string;
  end_time: string;
  description: string;
  course: {
    name: string;
    code: string;
  };
  status: number;
  work_log_course_id?: number;
  work_log_practicum_id?: number;
}

export interface WorkLogCourse {
  work_log_course_id: number;
  name: string;
  code: string;
  description: string;
  start_date: Date;
  end_date: Date;
}

export interface ActiveEntry {
  entry_id: number;
  userid: number;
  work_log_course_id: number;
  start_time: Date;
  end_time: Date;
  description: string;
  status: string;
  course: {
    work_log_course_id: number;
    name: string;
    code: string;
    description: string;
    start_date: Date;
    end_date: Date;
    required_hours: number;
  };
}
