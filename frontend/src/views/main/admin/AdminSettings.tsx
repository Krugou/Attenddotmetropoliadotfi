import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import apiHooks from '../../../api';

import Spinner from '../../../components/ui/Spinner.tsx';
import SettingsCard from '../../../components/ui/cards/SettingsCard.tsx';
import ErrorBox from '../../../components/ui/ErrorBox.tsx';
import NumberInputField from '../../../components/ui/inputs/NumberInputField.tsx';

const ServerSettingsSchema = z.object({
  speedofhash: z.number().min(1),
  leewayspeed: z.number().min(1),
  timeouttime: z.number().min(60000),
  attendancethreshold: z.number().min(1).max(100),
});

const AdminSettings: React.FC = () => {
  const { t } = useTranslation(['translation', 'admin']);
  const [speedofhash, setSpeedofhash] = useState(0);
  const [leewayspeed, setLeewayspeed] = useState(0);
  const [timeouttime, setTimeouttime] = useState(0);
  const [attendancethreshold, setAttendancethreshold] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) throw new Error('No token');
        setIsLoading(true);
        const settings = await apiHooks.fetchServerSettings(token);
        setSpeedofhash(settings.speedofhash);
        setLeewayspeed(settings.leewayspeed);
        setTimeouttime(settings.timeouttime);
        setAttendancethreshold(settings.attendancethreshold);
      } catch (err) {
        toast.error('Failed to fetch settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const validate = (): boolean => {
    try {
      ServerSettingsSchema.parse({
        speedofhash,
        leewayspeed,
        timeouttime,
        attendancethreshold,
      });
      setValidationErrors([]);
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const messages = err.errors.map((e) => e.message);
        setValidationErrors(messages);
        messages.forEach((msg) => toast.error(msg));
      }
      return false;
    }
  };

  const handleUpdate = async () => {
    if (!validate()) return;

    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No token');
      setIsLoading(true);
      await apiHooks.updateServerSettings(
        speedofhash,
        leewayspeed,
        timeouttime,
        attendancethreshold,
        token,
      );
      toast.success('Settings updated successfully');
    } catch {
      toast.error('Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Spinner text='Loading settings...' />;

  return (
    <div className='container max-w-4xl p-5 mx-auto my-8 bg-white rounded-xl shadow-lg'>
      <h1 className='text-3xl font-heading text-metropolia-main-orange mb-3 flex items-center'>
        {t('admin:settings.serverSettings')}
      </h1>

      <p className='text-lg text-metropolia-main-grey font-body mb-6'>
        {t('admin:settings.serverSettingsDesc')}
      </p>

      <ErrorBox errors={validationErrors} />

      <div className='grid md:grid-cols-2 gap-4 mb-10'>
        <SettingsCard
          title={t('admin:settings.speedOfHash')}
          value={(speedofhash / 1000).toFixed(2)}
          suffix='seconds'
        />
        <SettingsCard
          title={t('admin:settings.hashSpeedMultiplier')}
          value={leewayspeed.toString()}
        />
        <SettingsCard
          title={t('admin:settings.leeway')}
          value={
            `${Math.floor((speedofhash * leewayspeed) / 60000)}m ` +
            `${(((speedofhash * leewayspeed) % 60000) / 1000).toFixed(2)}s`
          }
        />
        <SettingsCard
          title={t('admin:settings.timeOut')}
          value={
            `${Math.floor(timeouttime / 60000)}m ` +
            `${((timeouttime % 60000) / 1000).toFixed(2)}s`
          }
        />
        <SettingsCard
          title={t('admin:settings.attendanceThreshold')}
          value={`${attendancethreshold}%`}
        />
      </div>

      <div className='bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200'>
        <h2 className='text-xl font-heading text-metropolia-main-grey mb-6'>
          {t('admin:settings.updateSettings')}
        </h2>

        <div className='grid md:grid-cols-2 gap-6'>
          <NumberInputField
            id='speedofhash'
            label={t('admin:settings.speedOfHash')}
            value={speedofhash}
            onChange={setSpeedofhash}
            step={100}
            unit='ms'
            hint={`Current: ${speedofhash} ms (${(speedofhash / 1000).toFixed(2)}s)`}
          />

          <NumberInputField
            id='leewayspeed'
            label={t('admin:settings.hashSpeedMultiplier')}
            value={leewayspeed}
            onChange={setLeewayspeed}
            hint={`Total leeway: ${((speedofhash * leewayspeed) / 1000).toFixed(2)}s`}
          />

          <NumberInputField
            id='timeouttime'
            label={t('admin:settings.timeOut')}
            value={timeouttime}
            onChange={setTimeouttime}
            step={60000}
            unit='ms'
            hint={`Current: ${Math.floor(timeouttime / 60000)} minutes`}
          />

          <NumberInputField
            id='attendancethreshold'
            label={t('admin:settings.attendanceThreshold')}
            value={attendancethreshold}
            onChange={setAttendancethreshold}
            min={1}
            max={100}
            unit='%'
            hint='Required attendance percentage'
          />
        </div>

        <input
          type='range'
          min='1'
          max='100'
          value={attendancethreshold}
          onChange={(e) => setAttendancethreshold(Number(e.target.value))}
          className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-6'
        />

        <button
          onClick={handleUpdate}
          disabled={validationErrors.length > 0 || isLoading}
          className={`w-full px-6 py-4 mt-8 text-white font-heading text-lg rounded-lg transition-all ${
            validationErrors.length > 0 || isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-metropolia-main-orange hover:bg-metropolia-main-orange-dark'
          }`}>
          {isLoading ? 'Processing...' : t('admin:settings.updateSettings')}
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
