/*export interface User {
  userid: number;
  last_name: string;
  first_name: string;
  email: string;
  username: string;
  role: string;
  student_number: string;
  created_at: string;
  activeStatus: number;
}*/

export interface User {
  role: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  group_name?: string;
  created_at: string;
  userid: number;
  student_number?: number;
  gdpr?: number;
  activeStatus: number;
  language: string;
  darkMode: number;
}

