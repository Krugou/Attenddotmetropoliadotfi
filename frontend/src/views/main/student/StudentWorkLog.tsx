import React, {useCallback, useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import {
  LoginRounded as LoginIcon,
  LogoutRounded as LogoutIcon,
  EditRounded as EditIcon,
} from '@mui/icons-material';
import {useNavigate} from 'react-router-dom';
import apiHooks from '../../../hooks/ApiHooks';
import {UserContext} from '../../../contexts/UserContext';

interface WorkLogCourse {
  work_log_course_id: number;
  name: string;
  code: string;
  description: string;
  start_date: Date;
  end_date: Date;
}

interface ActiveEntry {
  entry_id: number;
  userid: number;
  work_log_course_id: number;
  start_time: Date;
  end_time: Date;
  description: string;
  status: string;
  course: {
    work_log_course_id: number;
    name: string;
    code: string;
    description: string;
    start_date: Date;
    end_date: Date;
    required_hours: number;
  };
}

const StudentWorkLog: React.FC = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {user} = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [actionType, setActionType] = useState<'in' | 'out'>('in');
  const [courses, setCourses] = useState<WorkLogCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [hasActiveEntry, setHasActiveEntry] = useState<boolean>(false);
  const [activeCourse, setActiveCourse] = useState<ActiveEntry | null>(null);

  const checkActiveEntry = useCallback(async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token || !user?.userid) {
        throw new Error('No token or user found');
      }
      const activeEntries = await apiHooks.getActiveWorkLogEntries(
        user.userid,
        token,
      );
      console.log('🚀 ~ checkActiveEntry ~ activeEntries:', activeEntries);
      setHasActiveEntry(activeEntries.length > 0);
      if (activeEntries.length > 0) {
        setActiveCourse(activeEntries[0]);
        setSelectedCourse(activeEntries[0].work_log_course_id);
      } else {
        setActiveCourse(null);
      }
    } catch (error) {
      console.error('Failed to check active entries:', error);
      toast.error('Failed to check active work entries');
    }
  }, [user?.userid]);

  useEffect(() => {
    checkActiveEntry();
  }, [checkActiveEntry]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          throw new Error('No token found');
        }
        const fetchedCourses = await apiHooks.getActiveCoursesByStudentEmail(
          user?.email || '',
          token,
        );
        console.log('🚀 ~ fetchCourses ~ fetchedCourses:', fetchedCourses);

        setCourses(fetchedCourses);
      } catch (error) {
        toast.error('Failed to fetch courses');
      }
    };

    fetchCourses();
  }, [user]);

  const handleCourseChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourse(Number(event.target.value));
  };

  const handleOpenModal = useCallback((type: 'in' | 'out') => {
    setActionType(type);
    setDescription(
      type === 'in' ? 'Description for clocking in' : '', // Empty description for clock out by default
    );
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleConfirmAction = useCallback(async () => {
    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }

    const time = new Date().toLocaleTimeString();

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token found');
      }

      if (actionType === 'in') {
        const params = {
          userId: user?.userid || 0,
          courseId: selectedCourse,
          startTime: new Date(),
          endTime: new Date(),
          description,
          status: '1',
        };
        await apiHooks.createWorkLogEntry(params, token);
        toast.success(`Clocked in at ${time} with reason: ${description}`);
      } else {
        // Handle clock out
        await apiHooks.closeWorkLogEntry(
          activeCourse?.entry_id || 0,
          token,
          description,
        );
        toast.info(
          `Clocked out at ${time}${
            description ? ` with reason: ${description}` : ''
          }`,
        );
      }

      await checkActiveEntry(); // Refresh active entry status
    } catch (error) {
      toast.error('Failed to log work entry');
    }

    setIsModalOpen(false);
  }, [
    actionType,
    description,
    user,
    selectedCourse,
    checkActiveEntry,
    activeCourse,
  ]);

  const handleEdit = useCallback(() => {
    const time = new Date().toLocaleTimeString();
    toast.info(`Edit clicked at ${time}`);
    navigate('/student/worklogs');
  }, [navigate]);

  const buttonBaseStyle = `
    flex items-center justify-center gap-2
    px-6 py-2 rounded-lg text-lg m-3
    font-body font-medium text-white
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `;

  return (
    <div className='flex items-center justify-center min-h-[50vh] bg-white rounded-xl'>
      <div className='flex flex-col gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm'>
        <div className='flex flex-col gap-2'>
          {activeCourse ? (
            <div className='p-2 border rounded font-body'>
              <div className='font-medium'>{activeCourse.course.name}</div>
              <div className='text-sm text-gray-500'>
                {activeCourse.course.code}
              </div>
            </div>
          ) : (
            <select
              value={selectedCourse || ''}
              onChange={handleCourseChange}
              className='p-2 border rounded font-body'>
              <option value='' disabled>
                {t('worklog.selectCourse')}
              </option>
              {courses.map((course) => (
                <option
                  key={course.work_log_course_id}
                  value={course.work_log_course_id}>
                  {course.name} {course.code && `- ${course.code}`}
                </option>
              ))}
            </select>
          )}
        </div>
        <button
          onClick={() => handleOpenModal('in')}
          disabled={hasActiveEntry}
          className={`${buttonBaseStyle}
            ${
              hasActiveEntry
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-metropoliaMainOrange hover:bg-metropoliaSecondaryOrange'
            }
            focus:ring-metropoliaMainOrange`}
          aria-label={t('worklog.clockIn')}>
          <LoginIcon />
          <span>{t('worklog.actions.in')}</span>
        </button>

        <button
          onClick={() => handleOpenModal('out')}
          disabled={!hasActiveEntry}
          className={`${buttonBaseStyle}
            ${
              !hasActiveEntry
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-metropoliaSupportRed hover:bg-metropoliaSupportSecondaryRed'
            }
            focus:ring-metropoliaSupportRed`}
          aria-label={t('worklog.clockOut')}>
          <LogoutIcon />
          <span>{t('worklog.actions.out')}</span>
        </button>

        <button
          onClick={handleEdit}
          className={`${buttonBaseStyle}
            bg-metropoliaTrendGreen hover:bg-metropoliaTrendGreen/80
            focus:ring-metropoliaTrendGreen`}
          aria-label={t('worklog.edit')}>
          <EditIcon />
          <span>{t('worklog.actions.edit')}</span>
        </button>
      </div>

      {isModalOpen && (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='flex flex-col gap-4 p-4 bg-white rounded-lg shadow-lg'>
            <label className='font-medium font-body'>
              {actionType === 'in'
                ? t('worklog.description') + ' *'
                : t('worklog.optionalDescription')}
              <input
                type='text'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full p-2 mt-2 border rounded ${
                  actionType === 'in' ? 'bg-white' : 'bg-gray-50'
                }`}
                required={actionType === 'in'}
                placeholder={
                  actionType === 'in'
                    ? t('worklog.requiredDescription')
                    : t('worklog.optionalDescription')
                }
              />
            </label>
            <button
              onClick={handleConfirmAction}
              disabled={actionType === 'in' && !description.trim()}
              className={`px-4 py-2 text-white rounded ${
                actionType === 'in' && !description.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}>
              {t('common.confirm')}
            </button>
            <button
              onClick={handleCloseModal}
              className='px-4 py-2 bg-gray-300 rounded hover:bg-gray-400'>
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentWorkLog;
