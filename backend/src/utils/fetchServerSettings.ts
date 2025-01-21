import doFetch from './doFetch.js';
import getToken from './getToken.js';
import logger from './logger.js';

interface ServerSettings {
  speedOfHashChange: number;
  leewaytimes: number;
  timeout: number;
}

const fetchServerSettings = async (): Promise<ServerSettings> => {
  try {
    const token = await getToken();
    const response = await doFetch('http://localhost:3002/admin/ ', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
    });
    logger.info('Settings update Success' + ' ' + new Date().toISOString());

    return {
      speedOfHashChange: response.speedofhash,
      leewaytimes: response.leewayspeed,
      timeout: response.timeouttime,
    };
  } catch (error) {
    logger.error(error);
    // Return default values in case of error
    return {
      speedOfHashChange: 6000,
      leewaytimes: 5,
      timeout: 3600000,
    };
  }
};

export default fetchServerSettings;
