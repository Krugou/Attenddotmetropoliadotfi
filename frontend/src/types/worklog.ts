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
}
