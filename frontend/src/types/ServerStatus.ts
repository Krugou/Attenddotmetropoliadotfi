export interface SystemStats {
  uptime: number;
  loadAverage: number[];
  totalMemory: number;
  freeMemory: number;
  cpuUsage: number;
}

export interface DatabaseStats {
  connectionCount: number;
  uptime: number;
  threadCount: number;
  queryCount: number;
  slowQueries: number;
}

export interface ServerStatusData {
  system: SystemStats;
  database: DatabaseStats;
}
