import React, {useEffect, useState} from 'react';
import {toast} from 'react-toastify';
import {z} from 'zod';
import apiHooks from '../../../api';
import {useTranslation} from 'react-i18next';

// Zod schema for server settings validation
const ServerSettingsSchema = z.object({
  speedofhash: z.number().min(1, 'Speed of hash must be greater than 0'),
  leewayspeed: z.number().min(1, 'Leeway speed must be greater than 0'),
  timeouttime: z.number().min(60000, 'Timeout must be at least 1 minute'),
  attendancethreshold: z
    .number()
    .min(1, 'Threshold must be greater than 0')
    .max(100, 'Threshold cannot exceed 100%'),
});

/**
 * AdminSettings component.
 * This component is responsible for rendering and managing server settings for an admin.
 * It fetches the server settings from the API, and allows the admin to update them.
 */
const AdminSettings = () => {
  const {t} = useTranslation(['translation']);
  const [settings, setSettings] = useState(null);
  const [speedofhash, setSpeedofhash] = useState(0);
  const [leewayspeed, setLeewayspeed] = useState(0);
  const [timeouttime, setTimeouttime] = useState(0);
  const [attendancethreshold, setAttendancethreshold] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const token: string | null = localStorage.getItem('userToken');
        if (!token) {
          throw new Error('No token available');
        }
        const serverSettings = await apiHooks.fetchServerSettings(token);
        setSpeedofhash(serverSettings.speedofhash);
        setLeewayspeed(serverSettings.leewayspeed);
        setTimeouttime(serverSettings.timeouttime);
        setAttendancethreshold(serverSettings.attendancethreshold);
        setSettings(serverSettings);
      } catch (error) {
        toast.error('Failed to fetch server settings');
        console.error('Error fetching settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const validateSettings = (): boolean => {
    try {
      ServerSettingsSchema.parse({
        speedofhash,
        leewayspeed,
        timeouttime,
        attendancethreshold,
      });
      setValidationErrors([]);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((e) => e.message);
        setValidationErrors(errors);
        errors.forEach((err) => toast.error(err));
      }
      return false;
    }
  };

  const handleUpdate = async () => {
    if (!validateSettings()) {
      return;
    }

    try {
      const token: string | null = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token available');
      }
      setIsLoading(true);
      await apiHooks.updateServerSettings(
        speedofhash,
        leewayspeed,
        timeouttime,
        attendancethreshold,
        token,
      );
      toast.success('Server settings updated successfully');
    } catch (error) {
      toast.error('Failed to update server settings');
      console.error('Error updating settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !settings) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh]'>
        <div className='w-16 h-16 border-4 border-t-4 rounded-full border-metropolia-main-orange border-t-metropolia-main-orange-dark animate-spin'></div>
        <p className='mt-4 text-lg font-body text-metropolia-main-grey'>
          Loading settings...
        </p>
      </div>
    );
  }

  return (
    <div className='container max-w-4xl p-5 mx-auto my-8 bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl'>
      <div className='grid gap-8'>
        <div className='border-b border-gray-200 pb-6'>
          <h1 className='text-3xl font-heading text-metropolia-main-orange mb-3 flex items-center'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-8 w-8 mr-2'
              viewBox='0 0 20 20'
              fill='currentColor'>
              <path
                fillRule='evenodd'
                d='M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z'
                clipRule='evenodd'
              />
            </svg>
            {t('admin:settings.serverSettings')}
          </h1>
          <p className='text-lg text-metropolia-main-grey font-body'>
            {t('admin:settings.serverSettingsDesc')}
          </p>
        </div>

        {validationErrors.length > 0 && (
          <div className='p-5 mb-6 bg-metropolia-support-red/10 border-l-4 border-metropolia-support-red rounded-r-lg animate-pulse'>
            <h3 className='text-lg font-heading text-metropolia-support-red mb-2'>
              Validation Errors
            </h3>
            <ul className='list-disc list-inside text-metropolia-support-red-dark font-body'>
              {validationErrors.map((error, index) => (
                <li key={index} className='mb-1'>
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className='bg-gray-50 p-6 rounded-lg shadow-sm'>
          <h2 className='text-xl font-heading text-metropolia-main-grey mb-4 flex items-center'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6 mr-2'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            {t('admin:settings.currentSettings')}
          </h2>
          <div className='grid md:grid-cols-2 gap-4 text-gray-700 font-body'>
            <div className='bg-white p-4 rounded-md shadow-sm border border-gray-100 transition-all hover:shadow-md'>
              <p className='text-sm uppercase text-metropolia-main-grey-dark mb-1'>
                {t('admin:settings.speedOfHash')}
              </p>
              <p className='font-heading text-lg'>
                {(speedofhash / 1000).toFixed(2)}{' '}
                <span className='text-sm text-metropolia-main-grey'>
                  seconds
                </span>
              </p>
            </div>

            <div className='bg-white p-4 rounded-md shadow-sm border border-gray-100 transition-all hover:shadow-md'>
              <p className='text-sm uppercase text-metropolia-main-grey-dark mb-1'>
                {t('admin:settings.hashSpeedMultiplier')}
              </p>
              <p className='font-heading text-lg'>{leewayspeed}</p>
            </div>

            <div className='bg-white p-4 rounded-md shadow-sm border border-gray-100 transition-all hover:shadow-md'>
              <p className='text-sm uppercase text-metropolia-main-grey-dark mb-1'>
                {t('admin:settings.leeway')}
              </p>
              <p className='font-heading text-lg'>
                {Math.floor((speedofhash * leewayspeed) / 3600000) > 0 &&
                  `${Math.floor((speedofhash * leewayspeed) / 3600000)}h `}
                {Math.floor(((speedofhash * leewayspeed) % 3600000) / 60000) >
                  0 &&
                  `${Math.floor(
                    ((speedofhash * leewayspeed) % 3600000) / 60000,
                  )}m `}
                {Number(
                  (((speedofhash * leewayspeed) % 60000) / 1000).toFixed(2),
                ) > 0 &&
                  `${(((speedofhash * leewayspeed) % 60000) / 1000).toFixed(
                    2,
                  )}s`}
              </p>
            </div>

            <div className='bg-white p-4 rounded-md shadow-sm border border-gray-100 transition-all hover:shadow-md'>
              <p className='text-sm uppercase text-metropolia-main-grey-dark mb-1'>
                {t('admin:settings.timeOut')}
              </p>
              <p className='font-heading text-lg'>
                {Math.floor(timeouttime / 3600000) > 0 &&
                  `${Math.floor(timeouttime / 3600000)}h `}
                {Math.floor((timeouttime % 3600000) / 60000) > 0 &&
                  `${Math.floor((timeouttime % 3600000) / 60000)}m `}
                {Number(((timeouttime % 60000) / 1000).toFixed(2)) > 0 &&
                  `${((timeouttime % 60000) / 1000).toFixed(2)}s`}
              </p>
            </div>

            <div className='bg-white p-4 rounded-md shadow-sm border border-gray-100 transition-all hover:shadow-md md:col-span-2'>
              <p className='text-sm uppercase text-metropolia-main-grey-dark mb-1'>
                {t('admin:settings.attendanceThreshold')}
              </p>
              <div className='flex items-center'>
                <div className='w-full bg-gray-200 rounded-full h-4 mr-3'>
                  <div
                    className='bg-metropolia-main-orange h-4 rounded-full'
                    style={{width: `${attendancethreshold}%`}}></div>
                </div>
                <span className='font-heading text-lg'>
                  {attendancethreshold}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <h2 className='text-xl font-heading text-metropolia-main-grey mb-6 flex items-center'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6 mr-2'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
              />
            </svg>
            Update Settings
          </h2>

          <div className='grid md:grid-cols-2 gap-6'>
            <div>
              <label
                className='block mb-2 text-metropolia-main-grey font-heading text-sm'
                htmlFor='speedofhash'>
                Speed of Hash (ms)
                <span className='ml-1 text-xs text-metropolia-support-blue'>
                  (Higher = slower hash generation)
                </span>
              </label>
              <div className='relative'>
                <input
                  id='speedofhash'
                  type='number'
                  value={speedofhash}
                  onChange={(e) => setSpeedofhash(Number(e.target.value))}
                  step='100'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-metropolia-main-orange focus:border-transparent transition-all duration-200'
                />
                <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-sm text-gray-500'>
                  ms
                </div>
              </div>
              <p className='mt-1 text-xs text-gray-500'>
                Current value: {speedofhash} ms (
                {(speedofhash / 1000).toFixed(2)}s)
              </p>
            </div>

            <div>
              <label
                className='block mb-2 text-metropolia-main-grey font-heading text-sm'
                htmlFor='leewayspeed'>
                Hash Speed Multiplier
                <span className='ml-1 text-xs text-metropolia-support-blue'>
                  (Defines code validity period)
                </span>
              </label>
              <input
                id='leewayspeed'
                type='number'
                value={leewayspeed}
                onChange={(e) => setLeewayspeed(Number(e.target.value))}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-metropolia-main-orange focus:border-transparent transition-all duration-200'
              />
              <p className='mt-1 text-xs text-gray-500'>
                Total leeway time:{' '}
                {((speedofhash * leewayspeed) / 1000).toFixed(2)}s
              </p>
            </div>

            <div>
              <label
                className='block mb-2 text-metropolia-main-grey font-heading text-sm'
                htmlFor='timeouttime'>
                Timeout Time (ms)
                <span className='ml-1 text-xs text-metropolia-support-blue'>
                  (Session timeout)
                </span>
              </label>
              <div className='relative'>
                <input
                  id='timeouttime'
                  type='number'
                  value={timeouttime}
                  onChange={(e) => setTimeouttime(Number(e.target.value))}
                  step='60000'
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-metropolia-main-orange focus:border-transparent transition-all duration-200'
                />
                <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-sm text-gray-500'>
                  ms
                </div>
              </div>
              <p className='mt-1 text-xs text-gray-500'>
                Current value: {timeouttime} ms (
                {Math.floor(timeouttime / 60000)} minutes)
              </p>
            </div>

            <div>
              <label
                className='block mb-2 text-metropolia-main-grey font-heading text-sm'
                htmlFor='attendancethreshold'>
                Attendance Threshold (%)
                <span className='ml-1 text-xs text-metropolia-support-blue'>
                  (Required attendance percentage)
                </span>
              </label>
              <div className='relative'>
                <input
                  id='attendancethreshold'
                  type='number'
                  value={attendancethreshold}
                  min='1'
                  max='100'
                  onChange={(e) =>
                    setAttendancethreshold(Number(e.target.value))
                  }
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-metropolia-main-orange focus:border-transparent transition-all duration-200'
                />
                <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-sm text-gray-500'>
                  %
                </div>
              </div>
              <input
                type='range'
                min='1'
                max='100'
                value={attendancethreshold}
                onChange={(e) => setAttendancethreshold(Number(e.target.value))}
                className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2'
              />
            </div>
          </div>

          <button
            onClick={handleUpdate}
            disabled={validationErrors.length > 0 || isLoading}
            className={`w-full px-6 py-4 mt-8 text-white font-heading text-lg transition-all duration-300 rounded-lg flex items-center justify-center
              ${
                validationErrors.length > 0 || isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-metropolia-main-orange hover:bg-metropolia-main-orange-dark focus:outline-none focus:ring-2 focus:ring-metropolia-main-orange focus:ring-offset-2'
              }`}>
            {isLoading ? (
              <>
                <svg
                  className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'>
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 mr-2'
                  viewBox='0 0 20 20'
                  fill='currentColor'>
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                    clipRule='evenodd'
                  />
                </svg>
                {t('admin:settings.updateSettings')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
