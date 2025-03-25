export type Student = {
  userid?: number;
  email: string;
  exists?: boolean;
  first_name?: string;
  last_name?: string;
  studentnumber?: string | number;
};

export interface PracticumCreate {
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  requiredHours: number;
  instructors: {
    email: string;
    exists?: boolean;
  }[];
  students: Student[];
}


export interface PracticumDetails extends PracticumCreate {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssignStudentRequest {
  userId: number;
}

export interface PracticumStudent {
  userId: number;
  practicumId: number;
  assignedAt: string;
}
