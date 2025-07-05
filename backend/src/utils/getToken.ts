import {config} from 'dotenv';
import doFetch from './doFetch.js';
import logger from './logger.js';
config();
const getToken = async () => {
  try {
    console.log("row 7, getToken.ts, admin login to get token use dev account from .env file")
    // admin login to get token use dev account from .env file
    const response = await doFetch('http://localhost:3002/users/', {
      method: 'post',
      // or 'GET'
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: process.env.devaccount,
        password: process.env.devpass,
      }),
    });

    // console.log('getToken request success' + ' ' + new Date().toISOString());
    return response.token;
  } catch (error) {
    logger.error(error);
  }
};

export default getToken;
