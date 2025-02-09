import React, {useContext, useState} from 'react';
import {useTranslation} from 'react-i18next';
import apiHooks from '../../../../api';
import {UserContext} from '../../../../contexts/UserContext';

interface WorkLogCourseFormData {
  name: string;
  startDate: Date | null;
  endDate: Date | null;
  code: string;
  title: string;
  description: string;
  requiredHours: number;
  instructors: {email: string}[];
  studentList: string[];
  instructorEmail: string;
}

const WorkLogCreate = () => {
  const {t} = useTranslation(['common', 'teacher']);
  const {user} = useContext(UserContext);

  const [formData, setFormData] = useState<WorkLogCourseFormData>({
    name: '',
    startDate: null,
    endDate: null,
    code: '',
    title: '',
    description: '',
    requiredHours: 0,
    instructors: [],
    studentList: [],
    instructorEmail: user?.email || '',
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const {name, value} = e.target;
    setFormData((prev) => ({...prev, [name]: value}));
  };

  const handleDateChange = (
    date: Date | null,
    field: 'startDate' | 'endDate',
  ) => {
    setFormData((prev) => ({...prev, [field]: date}));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form data
    if (
      !formData.name ||
      !formData.code ||
      !formData.startDate ||
      !formData.endDate
    ) {
      setError(t('common:errors.fillRequiredFields'));
      return;
    }

    try {
      // Call your API here using apiHooks
      const token: string | null = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token available');
      }

      // Transform the data to match API requirements
      const apiData = {
        ...formData,
        startDate: formData.startDate?.toISOString().split('T')[0] || '',
        endDate: formData.endDate?.toISOString().split('T')[0] || '',
        instructors: [{email: formData.instructorEmail}],
        studentList: [], // Empty array for initial creation
      };

      const result = await apiHooks.createWorkLogCourse(apiData, token);
      setSuccess(t('teacher:worklog.success.courseCreated'));
      // Reset form
      setFormData({
        name: '',
        startDate: null,
        endDate: null,
        code: '',
        title: '',
        description: '',
        requiredHours: 0,
        instructors: [],
        studentList: [],
        instructorEmail: user?.email || '',
      });
      if (result) {
        setSuccess(t('teacher:worklog.success.courseCreated'));
        setTimeout(() => {
          setSuccess('');
        }, 5000);
      } else {
        setError(t('teacher:worklog.errors.createFailed'));
        setTimeout(() => {
          setError('');
        }, 5000);
      }
    } catch (err) {
      setError(t('teacher:worklog.errors.createFailed'));
      setTimeout(() => {
        setError('');
      }, 5000);
    }
  };

  return (
    <div className='flex flex-col max-w-2xl p-6 mx-auto bg-white'>
      <h1 className='mb-6 text-2xl text-gray-800 font-heading'>
        {t('teacher:worklog.create.title')}
      </h1>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {error && (
          <div className='p-4 mb-4 text-red-700 bg-red-100 rounded-lg'>
            {error}
          </div>
        )}
        {success && (
          <div className='p-4 mb-4 text-green-700 bg-green-100 rounded-lg'>
            {success}
          </div>
        )}

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
              name='name'
              required
              value={formData.name}
              onChange={handleInputChange}
              className='p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
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
              name='code'
              required
              value={formData.code}
              onChange={handleInputChange}
              className='p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            />
          </div>

          <div className='flex flex-col'>
            <label
              htmlFor='description'
              className='mb-2 text-sm font-medium text-gray-700'>
              {t('teacher:worklog.form.description')}
            </label>
            <textarea
              id='description'
              name='description'
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className='p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
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
                name='startDate'
                required
                value={
                  formData.startDate
                    ? formData.startDate.toISOString().split('T')[0]
                    : ''
                }
                onChange={(e) =>
                  handleDateChange(new Date(e.target.value), 'startDate')
                }
                className='p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
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
                name='endDate'
                required
                value={
                  formData.endDate
                    ? formData.endDate.toISOString().split('T')[0]
                    : ''
                }
                onChange={(e) =>
                  handleDateChange(new Date(e.target.value), 'endDate')
                }
                className='p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
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
              name='requiredHours'
              required
              min='0'
              value={formData.requiredHours}
              onChange={handleInputChange}
              className='p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            />
          </div>
        </div>

        <div className='flex justify-end space-x-4'>
          <button
            type='button'
            onClick={() =>
              setFormData({
                name: '',
                startDate: null,
                endDate: null,
                code: '',
                title: '',
                description: '',
                requiredHours: 0,
                instructors: [],
                studentList: [],
                instructorEmail: user?.email || '',
              })
            }
            className='px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300'>
            {t('common:reset')}
          </button>
          <button
            type='submit'
            className='px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700'>
            {t('teacher:worklog.form.submit')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkLogCreate;
