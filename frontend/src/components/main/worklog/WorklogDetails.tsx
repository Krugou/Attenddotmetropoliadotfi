import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import InputField from '../course/createcourse/coursedetails/InputField';
import apiHooks from '../../../api';

interface WorklogDetailsProps {
  name: string;
  setName: (value: string) => void;
  code: string;
  setCode: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  requiredHours: number;
  setRequiredHours: (value: number) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  modify?: boolean;
  codeExists?: boolean;
  setCourseExists: (value: boolean) => void;
}

const WorklogDetails: React.FC<WorklogDetailsProps> = ({
  name,
  setName,
  code,
  setCode,
  description,
  setDescription,
  requiredHours,
  setRequiredHours,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  modify = false,
  codeExists = false,
  setCourseExists,
}) => {
  const {t} = useTranslation(['teacher', 'common']);
  const [firstCode] = useState(code);
  const [codeChanged, setCodeChanged] = useState(false);
  const [charCount, setCharCount] = useState(description.length);
  const [nameCharCount, setNameCharCount] = useState(name.length);

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    if (!e || !e.target) {
      return;
    }
    setDescription(e.target.value);
    setCharCount(e.target.value.length);
  };

  const handleNameChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (!e || !e.target) {
      return;
    }

    setName(e.target.value);
    setNameCharCount(e.target.value.length);
  };

  useEffect(() => {
    const token: string | null = localStorage.getItem('userToken');
    if (!token) {
      throw new Error('No token available');
    }
    const delay = 250;

    const validateWorklogCode = async () => {
      const response = await apiHooks.checkWorklogCode(code, token);
      setCourseExists(response.exists);
    };

    if (!modify) {
      if (code) {
        setTimeout(validateWorklogCode, delay);
      }
    } else {
      if (code !== firstCode && firstCode !== '') {
        setTimeout(validateWorklogCode, delay);
      }
    }
  }, [code, firstCode, modify, setCourseExists]);

  useEffect(() => {
    if (code && code !== firstCode) {
      setCodeChanged(true);
    }
  }, [code, firstCode]);

  return (
    <fieldset>
      {!modify && (
        <legend className='mb-5 ml-1 text-xl font-heading'>
          {t('teacher:worklog.details.title')}
        </legend>
      )}

      <div>
        <InputField
          label={t('teacher:worklog.details.name')}
          type='text'
          name='name'
          value={name}
          onChange={handleNameChange}
          maxLength={100}
        />
        <p className='mt-1 text-sm text-gray-500 text-right font-body'>
          {nameCharCount}/100 {t('common:characters')}
        </p>
      </div>

      <InputField
        label={t('teacher:worklog.details.code')}
        type='text'
        name='code'
        value={code}
        onChange={(e) => {
          setCode(e.target.value);
          setCodeChanged(e.target.value !== firstCode);
        }}
      />
      {!modify && codeExists && (
        <p className='text-red-400'>{t('teacher:worklog.error.codeExists')}</p>
      )}
      {modify && codeExists && code !== firstCode && (
        <p className='text-red-400'>{t('teacher:worklog.error.codeExists')}</p>
      )}
      {modify && code === firstCode && codeChanged && (
        <p className='text-green-400'>
          {t('teacher:worklog.success.codeRestored')}
        </p>
      )}

      <div>
        <InputField
          label={t('teacher:worklog.details.description')}
          type='textarea'
          name='description'
          value={description}
          onChange={handleDescriptionChange}
          maxLength={500}
          rows={4}
          className='p-2 border rounded-lg w-full'
        />
        <p className='mt-1 text-sm text-gray-500 text-right font-body'>
          {charCount}/500 {t('common:characters')}
        </p>
      </div>

      <InputField
        label={t('teacher:worklog.details.requiredHours')}
        type='number'
        name='requiredHours'
        value={requiredHours.toString()}
        onChange={(e) => setRequiredHours(Number(e.target.value))}
      />

      <InputField
        label={t('teacher:worklog.details.startDate')}
        type='date'
        name='startDate'
        value={startDate ? startDate.split('T')[0] : ''}
        onChange={(e) => setStartDate(e.target.value)}
      />

      <InputField
        label={t('teacher:worklog.details.endDate')}
        type='date'
        name='endDate'
        value={endDate ? endDate.split('T')[0] : ''}
        onChange={(e) => setEndDate(e.target.value)}
      />
    </fieldset>
  );
};

export default WorklogDetails;
