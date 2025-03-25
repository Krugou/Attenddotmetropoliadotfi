import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';

interface PracticumDataProps {
  name: string;
  setName: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  requiredHours: number;
  setRequiredHours: (value: number) => void;
}

const PracticumData: React.FC<PracticumDataProps> = ({
  name,
  setName,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  description,
  setDescription,
  requiredHours,
  setRequiredHours,
}) => {
  const {t} = useTranslation(['teacher']);
  const [charCount, setCharCount] = useState(description.length);
  const [nameCharCount, setNameCharCount] = useState(name.length);
  const [endDateError, setEndDateError] = useState<string>('');

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    if (!e || !e.target) return;
    setDescription(e.target.value);
    setCharCount(e.target.value.length);
  };

  const handleNameChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (!e || !e.target) return;
    setName(e.target.value);
    setNameCharCount(e.target.value.length);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;

    if (startDate && new Date(newEndDate) < new Date(startDate)) {
      setEndDateError(t('teacher:practicum.form.endDateError'));
    } else {
      setEndDateError('');
    }

    setEndDate(newEndDate);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        <label
          htmlFor="name"
          className="mb-2 text-sm font-medium text-gray-700">
          {t('teacher:practicum.form.name')} *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={handleNameChange}
          maxLength={100}
          className="p-2 border rounded-lg"
          required
        />
        <p className="mt-1 text-sm text-gray-500 text-right font-body">
          {nameCharCount}/100 characters
        </p>
      </div>

      <div className="flex flex-col">
        <label
          htmlFor="description"
          className="mb-2 text-sm font-medium text-gray-700">
          {t('teacher:practicum.form.description')} *
        </label>
        <textarea
          id="description"
          value={description}
          onChange={handleDescriptionChange}
          maxLength={500}
          className="p-2 border rounded-lg"
          rows={4}
        />
        <p className="mt-1 text-sm text-gray-500 text-right font-body">
          {charCount}/500 characters
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col">
          <label
            htmlFor="startDate"
            className="mb-2 text-sm font-medium text-gray-700">
            {t('teacher:practicum.form.startDate')} *
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate ? startDate.split('T')[0] : ''}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 border rounded-lg"
            required
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="endDate"
            className="mb-2 text-sm font-medium text-gray-700">
            {t('teacher:practicum.form.endDate')} *
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate ? endDate.split('T')[0] : ''}
            onChange={handleEndDateChange}
            required
            className={`p-2 border rounded-lg ${
              endDateError ? 'border-metropolia-support-red' : ''
            }`}
          />
          {endDateError && (
            <p className="mt-1 text-sm text-metropolia-support-red">
              {endDateError}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col">
        <label
          htmlFor="requiredHours"
          className="mb-2 text-sm font-medium text-gray-700">
          {t('teacher:practicum.form.requiredHours')} *
        </label>
        <input
          type="number"
          id="requiredHours"
          value={requiredHours}
          onChange={(e) => setRequiredHours(Number(e.target.value))}
          className="p-2 border rounded-lg"
          min="0"
          required
        />
      </div>
    </div>
  );
};

export default PracticumData;
