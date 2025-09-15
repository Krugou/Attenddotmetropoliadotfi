/**
 * @file ipActivityTracker.ts
 * @description Simple utility for tracking user actions by IP and lecture ID
 */

import logger from './logger.js';


const userActivities: Record<string, Record<string, string>> = {};

/**
 * Records an IP address performing an action for a lecture
 *
 * @param ip - The IP address of the user
 * @param lectureId - The lecture ID associated with the activity
 * @returns Whether this is the first activity for this IP and lecture today
 */
export function recordActivity(ip: string, lectureId: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  console.log("Row 20, ipActivityTracker.ts, recordActivity() called");
  if (!userActivities[lectureId]) {
    userActivities[lectureId] = {};
  }

  const isFirstToday = userActivities[lectureId][ip] !== today;


  userActivities[lectureId][ip] = today;
  logger.info(`Activity recorded for IP ${ip} in lecture ${lectureId}`);

  return isFirstToday;
}

/**
 * Checks if an IP has performed an action for a lecture today
 *
 * @param ip - The IP address to check
 * @param lectureId - The lecture ID to check
 * @returns True if the IP performed an action for this lecture today, false otherwise
 */
export function hasActivityToday(ip: string, lectureId: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  const hasActivity = userActivities[lectureId]?.[ip] === today;
  console.log("Row 44, ipActivityTracker.ts, hasActivityToday() called");

  if (hasActivity) {
    logger.info(`IP ${ip} has already performed an action for lecture ${lectureId} today`);
  } else {
    logger.info(`IP ${ip} has not yet performed an action for lecture ${lectureId} today`);
  }

  return hasActivity;
}

/**
 * Clear all activity records for a specific lecture
 *
 * @param lectureId - The lecture ID to clear activities for
 */
export function clearLectureActivity(lectureId: string): void {
  if (userActivities[lectureId]) {
    const ipAddresses = Object.keys(userActivities[lectureId]);
    const ipCount = ipAddresses.length;
    console.log("Row 64, ipActivityTracker.ts, clearLectureActivity() called");

    if (ipCount > 0) {
      logger.info(`Clearing activity for the following IPs in lecture ${lectureId}: ${ipAddresses.join(', ')}`);
    }

    delete userActivities[lectureId];
    logger.info(`Cleared activity records for ${ipCount} IPs in lecture ${lectureId}`);
  }
}

/**
 * List all IPs that have activity for a specific lecture
 *
 * @param lectureId - The lecture ID to get IPs for
 * @returns Array of IP addresses with activity for the lecture
 */
export function getActiveIPs(lectureId: string): string[] {
  console.log("Row 82, ipActivityTracker.ts, getActiveIPs() called");
  if (!userActivities[lectureId]) {
    return [];
  }
  return Object.keys(userActivities[lectureId]);
}
