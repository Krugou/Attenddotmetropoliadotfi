import { Pool, RowDataPacket } from 'mysql2';

// Model
const serverSettingsModel = {
  // Get all server settings (expects a single-row table)
  async getServerSettings(pool: Pool) {
    try {
      console.log('row 12, serversettingsmodel.ts, getServerSettings()');
      return await pool.promise().query<RowDataPacket[]>('SELECT * FROM serversettings');
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  // Update server settings (single-row UPDATE without WHERE by design)
  async updateServerSettings(
    pool: Pool,
    speedofhash: number,
    leewayspeed: number,
    timeouttime: number,
    attendancethreshold: number,
  ) {
    try {
      console.log('row 38, serversettingsmodel.ts, updateServerSettings()');
      return await pool
        .promise()
        .query(
          'UPDATE serversettings SET speedofhash = ?, leewayspeed = ?, timeouttime = ?, attendancethreshold = ?',
          [speedofhash, leewayspeed, timeouttime, attendancethreshold],
        );
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },

  // Get only the attendance threshold value
  // NOTE: Method name keeps original typo for backward compatibility
  async getAttentanceThreshold(pool: Pool) {
    try {
      console.log('row 57, serversettingsmodel.ts, getAttentanceThreshold()');
      return await pool
        .promise()
        .query<RowDataPacket[]>('SELECT attendancethreshold FROM serversettings');
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
};

export default serverSettingsModel;
