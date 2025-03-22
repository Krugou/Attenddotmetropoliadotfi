import {authApi} from './auth';
import {courseApi} from './course';
import {adminApi} from './admin';
import {secureApi} from './secure';
import {worklogApi} from './worklog';
import activityApi from './activity';
import {practicumApi} from './practicum';

export * from './auth';
export * from './course';
export * from '../types/auth';
// export * from '../types/course';

export const apiHooks = {
  ...authApi,
  ...courseApi,
  ...adminApi,
  ...secureApi,
  ...worklogApi,
  ...activityApi,
  ...practicumApi,
};

export default apiHooks;
