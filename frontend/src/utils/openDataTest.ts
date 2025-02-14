import {secureApi} from '../api/secure';

export const testOpenDataConnection = async (token: string) => {
  try {
    const response = await secureApi.testOpenDataConnection(token);
    if (response.connected) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};
