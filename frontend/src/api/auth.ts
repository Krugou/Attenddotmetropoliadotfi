import { API_CONFIG } from '../config';
import { doFetch } from '../utils/doFetch';
import { createOptions } from '../utils/apiHelper';
import type { LoginInputs } from '../types/auth';

const baseUrl = API_CONFIG.baseUrl;

// ── Authentication API Endpoints ──

/**
 * Login with username and password.
 */
export const postLogin = async (inputs: LoginInputs) => {
  return doFetch(
    `${baseUrl}users`,
    createOptions('POST', null, {
      username: inputs.username,
      password: inputs.password,
    })
  );
};

/**
 * Start Microsoft login flow.
 */
export const initiateMicrosoftLogin = async () => {
  return doFetch(
    `${baseUrl}auth/microsoft/login`,
    createOptions('GET')
  );
};

/**
 * Complete Microsoft login with auth code.
 */
export const handleMicrosoftCallback = async (code: string) => {
  return doFetch(
    `${baseUrl}auth/microsoft/callback`,
    createOptions('POST', null, { code })
  );
};

/**
 * Fetch user data from secure endpoint using token.
 */
export const getUserInfoByToken = async (token: string) => {
  return doFetch(`${baseUrl}secure/`, createOptions('GET', token));
};

/**
 * Mark GDPR consent accepted for a user.
 */
export const updateGdprStatus = async (userid: number, token: string) => {
  return doFetch(
    `${baseUrl}secure/accept-gdpr/${userid}`,
    createOptions('PUT', token)
  );
};

/**
 * Fetch course-related user info by user ID.
 */
export const getUserInfoByUserid = async (token: string, id: string) => {
  return doFetch(`${baseUrl}courses/${id}`, createOptions('GET', token));
};

/**
 * Submit user feedback (accessible to all users).
 */
export const postUserFeedback = async (
  inputs: { topic: string; text: string; userId: number },
  token: string
) => {
  return doFetch(
    `${baseUrl}feedback`,
    createOptions('POST', token, inputs)
  );
};

/**
 * Fetch students for an instructor.
 * Optional `q` query filters by name/studentnumber on the backend when supported:
 * GET /courses/students/:userid?q=...
 *
 * This is an additive helper; it does not change existing API calls.
 */
export const getStudentsByInstructorId = async (
  userid: number,
  token: string,
  q?: string
) => {
  const qs = q && q.trim() ? `?q=${encodeURIComponent(q.trim())}` : '';
  return doFetch(
    `${baseUrl}courses/students/${userid}${qs}`,
    createOptions('GET', token)
  );
};

// ── Export as API object ──

export const authApi = {
  postLogin,
  getUserInfoByToken,
  updateGdprStatus,
  getUserInfoByUserid,
  postUserFeedback,
  initiateMicrosoftLogin,
  handleMicrosoftCallback,

  // Additive export (won't break existing imports)
  getStudentsByInstructorId,
};
