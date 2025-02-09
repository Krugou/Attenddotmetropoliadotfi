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

  useEffect(() => {
    const fetchSettings = async () => {
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
    }
  };

  if (!settings) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='w-12 h-12 border-4 border-t-4 rounded-full border-metropolia-main-orange animate-spin'></div>
      </div>
    );
  }

  return (
    <div className='container max-w-4xl p-4 mx-auto my-8 bg-white rounded-lg shadow-lg md:p-8'>
      <div className='grid gap-6'>
        <div>
          <h1 className='mb-4 text-2xl font-heading text-metropolia-main-orange md:text-3xl'>
            {t('translation:admin.settings.serverSettings')}
          </h1>
          <p className='mb-6 text-gray-600 font-body'>
            {t('translation:admin.settings.serverSettingsDesc')}
          </p>
        </div>

        {validationErrors.length > 0 && (
          <div className='p-4 mb-4 text-red-700 bg-red-100 border-l-4 border-red-500 rounded-r-lg'>
            <ul className='list-disc list-inside'>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h2 className='mb-4 text-xl font-heading text-metropolia-main-grey'>
            {t('translation:admin.settings.currentSettings')}:
          </h2>
          <div className='space-y-3 text-gray-700 font-body'>
            <p>
              {t('translation:admin.settings.speedOfHash')}:{' '}
              {(speedofhash / 1000).toFixed(2)} seconds
            </p>
            <p>
              {t('translation:admin.settings.hashSpeedMultiplier')}:{' '}
              {leewayspeed}
            </p>
            <p>
              {t('translation:admin.settings.leeway')}:
              {Math.floor((speedofhash * leewayspeed) / 3600000) > 0 &&
                `${Math.floor((speedofhash * leewayspeed) / 3600000)} hours `}
              {Math.floor(((speedofhash * leewayspeed) % 3600000) / 60000) >
                0 &&
                `${Math.floor(
                  ((speedofhash * leewayspeed) % 3600000) / 60000,
                )} minutes `}
              {Number(
                (((speedofhash * leewayspeed) % 60000) / 1000).toFixed(2),
              ) > 0 &&
                `${(((speedofhash * leewayspeed) % 60000) / 1000).toFixed(
                  2,
                )} seconds`}
            </p>
            <p>
              {t('translation:admin.settings.timeOut')}:
              {Math.floor(timeouttime / 3600000) > 0 &&
                `${Math.floor(timeouttime / 3600000)} hours `}
              {Math.floor((timeouttime % 3600000) / 60000) > 0 &&
                `${Math.floor((timeouttime % 3600000) / 60000)} minutes `}
              {Number(((timeouttime % 60000) / 1000).toFixed(2)) > 0 &&
                `${((timeouttime % 60000) / 1000).toFixed(2)} seconds`}
            </p>
            <p>
              {t('translation:admin.settings.attendanceThreshold')}:{' '}
              {attendancethreshold}%
            </p>
          </div>
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          <div>
            <label className='block mb-2 text-gray-700 font-heading'>
              Speed of Hash
            </label>
            <input
              type='number'
              value={speedofhash}
              onChange={(e) => setSpeedofhash(Number(e.target.value))}
              step='100'
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-metropolia-main-orange focus:border-transparent'
            />
          </div>

          <div>
            <label className='block mb-2 text-gray-700 font-heading'>
              Hash speed multiplier
            </label>
            <input
              type='number'
              value={leewayspeed}
              onChange={(e) => setLeewayspeed(Number(e.target.value))}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-metropolia-main-orange focus:border-transparent'
            />
          </div>

          <div>
            <label className='block mb-2 text-gray-700 font-heading'>
              Timeout Time (ms)
            </label>
            <input
              type='number'
              value={timeouttime}
              onChange={(e) => setTimeouttime(Number(e.target.value))}
              step='60000'
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-metropolia-main-orange focus:border-transparent'
            />
          </div>

          <div>
            <label className='block mb-2 text-gray-700 font-heading'>
              Attendance Threshold %
            </label>
            <input
              type='number'
              value={attendancethreshold}
              onChange={(e) => setAttendancethreshold(Number(e.target.value))}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-metropolia-main-orange focus:border-transparent'
            />
          </div>
        </div>

        <button
          onClick={handleUpdate}
          disabled={validationErrors.length > 0}
          className={`w-full px-6 py-3 mt-4 text-white transition-colors duration-200 rounded-lg
            ${
              validationErrors.length > 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-metropolia-main-orange hover:bg-metropolia-main-orange/90 focus:outline-hidden focus:ring-2 focus:ring-metropolia-main-orange focus:ring-offset-2'
            }`}>
          {t('translation:admin.settings.updateSettings')}
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
