import createPool from '../config/createPool.js';
import ServerSettingsModel from '../models/serversettingsmodel.js';

const pool = createPool('ADMIN');
console.log("Row 5, admincontroller.ts - Created database pool with role 'ADMIN'");

// AdminController: fetch and update server settings
export interface AdminController {
  getServerSettings: () => Promise<any>;
  updateServerSettings: (
    speedofhash: any,
    leewayspeed: any,
    timeouttime: any,
    attendancethreshold: any,
  ) => Promise<any>;
}

const adminController: AdminController = {
  // Get server settings
  async getServerSettings() {
    console.log("Row 57, admincontroller.ts - getServerSettings() called");
    try {
      const serverSettings = await ServerSettingsModel.getServerSettings(pool);
      console.log("Row 60, admincontroller.ts - Successfully fetched server settings:", serverSettings);
      return serverSettings;
    } catch (error) {
      console.error("Row 63, admincontroller.ts - Error fetching server settings:", error);
      throw error;
    }
  },

  // Update server settings
  async updateServerSettings(speedofhash, leewayspeed, timeouttime, attendancethreshold) {
    console.log("Row 83, admincontroller.ts - updateServerSettings() called with parameters:", {
      speedofhash,
      leewayspeed,
      timeouttime,
      attendancethreshold,
    });
    try {
      await ServerSettingsModel.updateServerSettings(
        pool,
        speedofhash,
        leewayspeed,
        timeouttime,
        attendancethreshold,
      );
      console.log("Row 98, admincontroller.ts - Server settings updated successfully");
    } catch (error) {
      console.error("Row 100, admincontroller.ts - Error updating server settings:", error);
      throw error;
    }
  },
};

export default adminController;
