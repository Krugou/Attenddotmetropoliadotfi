import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import InputField from '../course/createcourse/coursedetails/InputField';

interface PracticumDetailsProps {
  name: string;
  setName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  requiredHours: number;
  setRequiredHours: (value: number) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  modify?: boolean;
}

const PracticumDetails: React.FC<PracticumDetailsProps> = ({
  name,
  setName,
  description,
  setDescription,
  requiredHours,
  setRequiredHours,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  modify = false,
}) => {
  const { t } = useTranslation(['teacher', 'common']);
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

  return (
    <fieldset>
      {!modify && (
        <legend className="mb-5 ml-1 text-xl font-heading">
          {t('teacher:practicum.details.title')}
        </legend>
      )}

      <div>
        <InputField
          label={t('teacher:practicum.details.name')}
          type="text"
          name="name"
          value={name}
          onChange={handleNameChange}
          maxLength={100}
        />
        <p className="mt-1 text-sm text-gray-500 text-right font-body">
          {nameCharCount}/100 {t('common:characters')}
        </p>
      </div>

      <div>
        <InputField
          label={t('teacher:practicum.details.description')}
          type="textarea"
          name="description"
          value={description}
          onChange={handleDescriptionChange}
          maxLength={500}
          rows={4}
          className="p-2 border rounded-lg w-full"
        />
        <p className="mt-1 text-sm text-gray-500 text-right font-body">
          {charCount}/500 {t('common:characters')}
        </p>
      </div>

      <InputField
        label={t('teacher:practicum.details.requiredHours')}
        type="number"
        name="requiredHours"
        value={requiredHours.toString()}
        onChange={(e) => setRequiredHours(Number(e.target.value))}
      />

      <InputField
        label={t('teacher:practicum.details.startDate')}
        type="date"
        name="startDate"
        value={startDate ? startDate.split('T')[0] : ''}
        onChange={(e) => setStartDate(e.target.value)}
      />

      <InputField
        label={t('teacher:practicum.details.endDate')}
        type="date"
        name="endDate"
        value={endDate ? endDate.split('T')[0] : ''}
        onChange={(e) => setEndDate(e.target.value)}
      />
    </fieldset>
  );
};

export default PracticumDetails;
