'use strict';

import {API_CONFIG} from '../config';
import {doFetch} from '../utils/doFetch';
import type {LoginInputs} from '../types/auth';

const baseUrl = API_CONFIG.baseUrl;

// ── Authentication / User related endpoints ──

export const postLogin = async (inputs: LoginInputs) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: inputs.username,
      password: inputs.password,
    }),
  };

  return await doFetch(baseUrl + 'users', options);
};

export const getUserInfoByToken = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  return doFetch(baseUrl + 'secure/', options);
};

export const updateGdprStatus = async (userid: number, token: string) => {
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  const url = `${baseUrl}secure/accept-gdpr/${userid}`;
  return doFetch(url, options);
};

// Removed admin endpoints:
//   - fetchUserById
//   - updateUser
//   - fetchUsers
//   - getUserFeedback
//   - deleteUserFeedback
// These endpoints have been moved to /api/admin.ts

export const getUserInfoByUserid = async (token: string, id: string) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  return await doFetch(baseUrl + 'courses/' + id, options);
};

// ── User feedback endpoints (can be used by both regular and admin routes) ──

export const postUserFeedback = async (
  inputs: {topic: string; text: string; userId: number},
  token: string,
) => {
  const response = await doFetch(baseUrl + 'feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(inputs),
  });
  return response;
};

export const authApi = {
  postLogin,
  getUserInfoByToken,
  updateGdprStatus,
  getUserInfoByUserid,
  postUserFeedback,
};
