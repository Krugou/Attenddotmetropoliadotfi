import {Pool, RowDataPacket} from 'mysql2';

// server settings model
const serverSettingsModel = {
  /**
   * Fetches server settings.
   * @param pool - The MySQL connection pool.
   * @returns A promise that resolves to an array of server settings.
   */
  async getServerSettings(pool: Pool) {
    try {
      console.log("row 12, serversettingsmodel.ts, getServerSettings()");
      return await pool
        .promise()
        .query<RowDataPacket[]>('SELECT * FROM serversettings');
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
  /**
   * Updates server settings.
   * @param pool - The MySQL connection pool.
   * @param speedofhash - The speed of hash.
   * @param leewayspeed - The leeway speed.
   * @param timeouttime - The timeout time.
   * @param attendancethreshold - The attendance threshold.
   * @returns A promise that resolves to the result of the update.
   */
  async updateServerSettings(
    pool: Pool,
    speedofhash: number,
    leewayspeed: number,
    timeouttime: number,
    attendancethreshold: number,
  ) {
    try {
      console.log("row 38, serversettingsmodel.ts, updateServerSettings()");
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
  /**
   * Fetches the attendance threshold.
   * @param pool - The MySQL connection pool.
   * @returns A promise that resolves to the attendance threshold.
   */
  async getAttentanceThreshold(pool: Pool) {
    try {
      console.log("row 57, serversettingsmodel.ts, getAttentanceThreshold()");
      return await pool
        .promise()
        .query<RowDataPacket[]>(
          'SELECT attendancethreshold FROM serversettings',
        );
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  },
};

export default serverSettingsModel;
