import {ENV} from './environment';

interface ApiConfig {
  baseUrl: string;
  timeout: number;
}

const developmentConfig: ApiConfig = {
  baseUrl: 'http://localhost:3001/api',
  timeout: 5000,
};

const productionConfig: ApiConfig = {
  baseUrl: 'https://attend.metropolia.fi/api/',
  timeout: 10000,
};

const testConfig: ApiConfig = {
  baseUrl: 'http://localhost:3001/api',
  timeout: 1000,
};

export const API_CONFIG: ApiConfig = ENV.production
  ? productionConfig
  : ENV.test
  ? testConfig
  : developmentConfig;
