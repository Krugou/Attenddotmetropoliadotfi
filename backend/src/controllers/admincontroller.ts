import createPool from '../config/createPool.js';
import ServerSettingsModel from '../models/serversettingsmodel.js';

const pool = createPool('ADMIN');
console.log("Row 5, admincontroller.ts - Created database pool with role 'ADMIN'");

/**
 * AdminController interface represents the structure of the admin controller.
 *
 * This interface provides the following methods:
 *
 * @method getServerSettings - Fetches the server settings from the database.
 * @method updateServerSettings - Updates the server settings in the database.
 */
export interface AdminController {
  /**
   * Gets the server settings.
   *
   * This method fetches the server settings from the database using the ServerSettingsModel.
   *
   * @returns {Promise<any>} A promise that resolves to the server settings.
   */
  getServerSettings: () => Promise<any>;

  /**
   * Updates the server settings.
   *
   * This method updates the server settings in the database using the ServerSettingsModel.
   *
   * @param {any} speedofhash - The speed of hash.
   * @param {any} leewayspeed - The leeway speed.
   * @param {any} timeouttime - The timeout time.
   * @param {any} attendancethreshold - The attendance threshold.
   * @returns {Promise<any>} A promise that resolves when the server settings have been updated.
   */
  updateServerSettings: (
    speedofhash: any,
    leewayspeed: any,
    timeouttime: any,
    attendancethreshold: any,
  ) => Promise<any>;
}

/**
 * `adminController` is an object that implements the AdminController interface.
 * It provides methods to get and update the server settings.
 *
 * @type {AdminController}
 */
const adminController: AdminController = {
  /**
   * Gets the server settings.
   *
   * @returns {Promise<any>} A promise that resolves to the server settings.
   */
  async getServerSettings() {
    console.log("Row 57, admincontroller.ts - getServerSettings() called");
    try {
      const serverSettings = await ServerSettingsModel.getServerSettings(pool);
      console.log("Row 60, admincontroller.ts - Successfully fetched server settings:", serverSettings);
      return serverSettings; // use the serverSettings variable
    } catch (error) {
      console.error("Row 63, admincontroller.ts - Error fetching server settings:", error);
      throw error;
    }
  },

  /**
   * Updates the server settings.
   *
   * @param {any} speedofhash - The speed of hash.
   * @param {any} leewayspeed - The leeway speed.
   * @param {any} timeouttime - The timeout time.
   * @param {any} attendancethreshold - The attendance threshold.
   * @returns {Promise<any>} A promise that resolves when the server settings have been updated.
   */
  async updateServerSettings(
    speedofhash,
    leewayspeed,
    timeouttime,
    attendancethreshold,
  ) {
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
