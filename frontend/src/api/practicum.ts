import {API_CONFIG} from '../config';
import {doFetch} from '../utils/doFetch';
import type {PracticumCreate, PracticumUpdate} from '../types/practicum';

const baseUrl = API_CONFIG.baseUrl;

export const createPracticumCourse = async (practicumData: PracticumCreate, token: string) => {
  const options: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify(practicumData),
  };
  return await doFetch(`${baseUrl}practicum`, options);
};

export const getPracticumDetails = async (practicumId: number, token: string) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  return await doFetch(`${baseUrl}practicum/${practicumId}`, options);
};

export const updatePracticum = async (
  practicumId: number,
  updateData: PracticumUpdate,
  token: string,
) => {
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify(updateData),
  };
  return await doFetch(`${baseUrl}practicum/${practicumId}`, options);
};

export const deletePracticum = async (practicumId: number, token: string) => {
  const options = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  return await doFetch(`${baseUrl}practicum/${practicumId}`, options);
};

export const getPracticumsByInstructor = async (userId: number, token: string) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };
  return await doFetch(`${baseUrl}practicum/instructor/${userId}`, options);
};

export const assignStudentToPracticum = async (
  practicumId: number,
  userId: number,
  token: string,
) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({ userId }),
  };
  return await doFetch(`${baseUrl}practicum/${practicumId}/assign-student`, options);
};

export const practicumApi = {
  createPracticumCourse,
  getPracticumDetails,
  updatePracticum,
  deletePracticum,
  getPracticumsByInstructor,
  assignStudentToPracticum,
};



