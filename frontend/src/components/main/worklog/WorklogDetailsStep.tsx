import React, {useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import apiHooks from '../../../api';

interface WorklogDetailsStepProps {
  name: string;
  setName: (value: string) => void;
  code: string;
  setCode: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  requiredHours: number;
  setRequiredHours: (value: number) => void;
  courseExists?: boolean;
  setCourseExists?: (exists: boolean) => void;
}

const WorklogDetailsStep: React.FC<WorklogDetailsStepProps> = ({
  name,
  setName,
  code,
  setCode,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  description,
  setDescription,
  requiredHours,
  setRequiredHours,
  courseExists,
  setCourseExists,
}) => {
  const {t} = useTranslation(['teacher']);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [firstCode] = useState(code);
  const [codeChanged, setCodeChanged] = useState(false);

  useEffect(() => {
    const token: string | null = localStorage.getItem('userToken');
    if (!token) {
      return;
    }
    const delay = 250;

    const checkCode = async () => {
      setIsCheckingCode(true);
      try {
        const response = await apiHooks.checkWorklogCode(code, token);
        setCourseExists?.(response.exists);
      } catch (error) {
        console.error('Error checking worklog code:', error);
        setCourseExists?.(false);
      } finally {
        setIsCheckingCode(false);
      }
    };

    if (code) {
      const timeoutId = setTimeout(checkCode, delay);
      return () => clearTimeout(timeoutId);
    } else {
      setCourseExists?.(false);
    }

    return () => {
      setIsCheckingCode(false);
    };
  }, [code, setCourseExists]);

  return (
    <div className='space-y-4'>
      <div className='flex flex-col'>
        <label
          htmlFor='name'
          className='mb-2 text-sm font-medium text-gray-700'>
          {t('teacher:worklog.form.name')} *
        </label>
        <input
          type='text'
          id='name'
          value={name}
          onChange={(e) => setName(e.target.value)}
          className='p-2 border rounded-lg'
          required
        />
      </div>

      <div className='flex flex-col'>
        <label
          htmlFor='code'
          className='mb-2 text-sm font-medium text-gray-700'>
          {t('teacher:worklog.form.code')} *
        </label>
        <input
          type='text'
          id='code'
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setCourseExists?.(false);
            if (e.target.value !== firstCode) {
              setCodeChanged(true);
            }
          }}
          className={`p-2 border rounded-lg ${
            courseExists ? 'border-red-500' : ''
          }`}
          required
        />
        {isCheckingCode && (
          <span className='mt-1 text-sm text-gray-500'>
            {t('teacher:worklog.form.checking')}...
          </span>
        )}
        {courseExists && (
          <p className='text-red-400'>
            {t('teacher:worklog.form.errors.codeExists')}
          </p>
        )}
        {code === firstCode && codeChanged && (
          <p className='text-green-400'>
            {t('teacher:worklog.form.success.codeRestored')}
          </p>
        )}
      </div>

      <div className='flex flex-col'>
        <label
          htmlFor='description'
          className='mb-2 text-sm font-medium text-gray-700'>
          {t('teacher:worklog.form.description')} *
        </label>
        <textarea
          id='description'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className='p-2 border rounded-lg'
          rows={4}
        />
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='flex flex-col'>
          <label
            htmlFor='startDate'
            className='mb-2 text-sm font-medium text-gray-700'>
            {t('teacher:worklog.form.startDate')} *
          </label>
          <input
            type='date'
            id='startDate'
            value={startDate ? startDate.split('T')[0] : ''}
            onChange={(e) => setStartDate(e.target.value)}
            className='p-2 border rounded-lg'
            required
          />
        </div>
        <div className='flex flex-col'>
          <label
            htmlFor='endDate'
            className='mb-2 text-sm font-medium text-gray-700'>
            {t('teacher:worklog.form.endDate')} *
          </label>
          <input
            type='date'
            id='endDate'
            value={endDate ? endDate.split('T')[0] : ''}
            onChange={(e) => setEndDate(e.target.value)}
            className='p-2 border rounded-lg'
            required
          />
        </div>
      </div>

      <div className='flex flex-col'>
        <label
          htmlFor='requiredHours'
          className='mb-2 text-sm font-medium text-gray-700'>
          {t('teacher:worklog.form.requiredHours')} *
        </label>
        <input
          type='number'
          id='requiredHours'
          value={requiredHours}
          onChange={(e) => setRequiredHours(Number(e.target.value))}
          className='p-2 border rounded-lg'
          min='0'
          required
        />
      </div>
    </div>
  );
};

export default WorklogDetailsStep;
