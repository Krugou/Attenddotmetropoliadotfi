import {config} from 'dotenv';
import doFetch from './doFetch.js';
config();

 // Check reservations from open data.

const CheckOpenDataReservations = async (
  code?: string,
  studentGroup?: string,
) => {
  const url = 'https://opendata.metropolia.fi/r1/reservation/search';
  const body = JSON.stringify({
    ...(code ? {realization: [code]} : {}),
    ...(studentGroup ? {studentGroup: [studentGroup]} : {}),
  });

  console.log("row 21, opendata.ts, CheckOpenDataReservations() called");

  const options = {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(process.env.APIKEYMETROPOLIA || ''),
      'Content-Type': 'application/json',
    },
    body: body,
  };

  return await doFetch(url, options as any);
};

 //Check realization from open data.

const checkOpenDataRealization = async (code: string) => {
  const url = 'https://opendata.metropolia.fi/r1/realization/search';
  const options = {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(process.env.APIKEYMETROPOLIA || ''),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({codes: [code]}),
  };
  console.log("row 50, opendata.ts, checkOpenDataRealization() called");

  return await doFetch(url, options as any);
};

 // Open data functions.

const openData = {
  CheckOpenDataReservations,
  checkOpenDataRealization,
};
export default openData;
