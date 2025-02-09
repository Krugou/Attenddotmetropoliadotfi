import React, {useCallback, useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import {
  LoginRounded as LoginIcon,
  LogoutRounded as LogoutIcon,
  EditRounded as EditIcon,
} from '@mui/icons-material';
import {useNavigate} from 'react-router-dom';
import apiHooks from '../../../api';
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

const StudentWorkLogLogger: React.FC = () => {
  const {t} = useTranslation(['common']);
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

        // If no courses are available, show message and redirect
        if (fetchedCourses.length === 0) {
          toast.info(t('common:worklog.noCourses'));
          setTimeout(() => navigate('/'), 3000); // Navigate to main view after 3 seconds
          return;
        }

        // Auto-select the first course if there are courses and no active entry
        if (fetchedCourses.length > 0 && !hasActiveEntry && !selectedCourse) {
          setSelectedCourse(fetchedCourses[0].work_log_course_id);
        }
      } catch (error) {
        toast.error('Failed to fetch courses');
      }
    };

    fetchCourses();
  }, [user, hasActiveEntry, selectedCourse, navigate, t]);

  const handleCourseChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourse(Number(event.target.value));
  };

  const handleOpenModal = useCallback(
    (type: 'in' | 'out') => {
      setActionType(type);
      setDescription(
        type === 'in' ? t('common:worklog.description') : '', // Using translation instead of hardcoded string
      );
      setIsModalOpen(true);
    },
    [t],
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleConfirmAction = useCallback(async () => {
    if (!selectedCourse) {
      toast.error(t('common:worklog.error.requiredFields'));
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
        toast.success(
          t('common:worklog.messages.clockedIn', {time, description}),
        );
      } else {
        await apiHooks.closeWorkLogEntry(
          activeCourse?.entry_id || 0,
          token,
          description,
        );
        toast.info(
          description
            ? t('common:worklog.messages.clockedOutWithReason', {
                time,
                description,
              })
            : t('common:worklog.messages.clockedOut', {time}),
        );
      }

      await checkActiveEntry();
    } catch (error) {
      toast.error(t('common:worklog.messages.failedToLog'));
    }

    setIsModalOpen(false);
  }, [
    actionType,
    description,
    user,
    selectedCourse,
    checkActiveEntry,
    activeCourse,
    t,
  ]);

  const handleEdit = useCallback(() => {
    const time = new Date().toLocaleTimeString();
    toast.info(t('common:worklog.messages.editClicked', {time}));
    navigate('/student/worklogs');
  }, [navigate, t]);

  const buttonBaseStyle = `
    flex items-center justify-center gap-3
    w-full px-6 py-3 rounded-lg
    font-body text-lg font-medium text-white
    transition-all duration-300 ease-in-out
    shadow-md hover:shadow-lg
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    transform hover:scale-[1.02]
  `;

  return (
    <div className='flex items-center justify-center min-h-[50vh] p-4 sm:p-6 md:p-8'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-6'>
        {/* Course Selection Section */}
        <div className='space-y-4'>
          <h2 className='text-2xl font-heading font-bold text-gray-800 mb-4'>
            {t('common:worklog.logger.title')}
          </h2>

          {courses.length === 0 ? (
            <div className='p-4 text-center'>
              <p className='text-lg font-body text-gray-600'>
                {t('common:worklog.noCourses')}
              </p>
              <p className='text-sm font-body text-gray-500 mt-2'>
                {t('common:worklog.redirecting')}
              </p>
            </div>
          ) : activeCourse ? (
            <div className='p-4 border-2 border-metropolia-main-orange rounded-lg bg-white/50 shadow-sm'>
              <h3 className='font-heading font-semibold text-lg text-gray-800'>
                {activeCourse.course.name}
              </h3>
              <p className='text-sm text-gray-600 mt-1 font-body'>
                {activeCourse.course.code}
              </p>
            </div>
          ) : (
            <select
              title={t('common:worklog.selectCourse')}
              value={selectedCourse || ''}
              onChange={handleCourseChange}
              className='w-full p-3 border-2 border-gray-200 rounded-lg font-body
                  focus:border-metropolia-main-orange focus:ring-2 focus:ring-metropolia-main-orange/20
                  bg-white text-gray-700'>
              <option value='' disabled>
                {t('common:worklog.selectCourse')}
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

        {/* Action Buttons */}
        {courses.length > 0 && (
          <div className='space-y-4'>
            <button
              onClick={() => handleOpenModal('in')}
              disabled={hasActiveEntry}
              className={`${buttonBaseStyle} ${
                hasActiveEntry
                  ? 'bg-gray-400'
                  : 'bg-metropolia-main-orange hover:bg-metropolia-secondary-orange'
              }`}
              aria-label={t('common:worklog.clockIn')}>
              <LoginIcon className='w-6 h-6' />
              <span>{t('common:worklog.actions.in')}</span>
            </button>

            <button
              onClick={() => handleOpenModal('out')}
              disabled={!hasActiveEntry}
              className={`${buttonBaseStyle} ${
                !hasActiveEntry
                  ? 'bg-gray-400'
                  : 'bg-metropolia-support-red hover:bg-metropolia-support-secondary-red'
              }`}
              aria-label={t('common:worklog.clockOut')}>
              <LogoutIcon className='w-6 h-6' />
              <span>{t('common:worklog.actions.out')}</span>
            </button>

            <button
              onClick={handleEdit}
              className={`${buttonBaseStyle}
                bg-metropolia-trend-green hover:bg-metropolia-trend-green/90`}
              aria-label={t('common:worklog.edit.title')}>
              <EditIcon className='w-6 h-6' />
              <span>{t('common:worklog.actions.edit')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm'>
          <div className='w-full max-w-md m-4 bg-white rounded-2xl shadow-2xl transform transition-all'>
            <div className='p-6 space-y-6'>
              <h3 className='text-xl font-heading font-bold text-gray-800'>
                {actionType === 'in'
                  ? t('common:worklog.clockIn')
                  : t('common:worklog.clockOut')}
              </h3>

              {actionType === 'in' && (
                <label className='block space-y-2'>
                  <span className='font-body font-medium text-gray-700'>
                    {t('common:worklog.description')} *
                  </span>
                  <input
                    type='text'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className='w-full p-3 border-2 rounded-lg font-body
                      focus:border-metropolia-main-orange focus:ring-2 focus:ring-metropolia-main-orange/20
                      transition-colors duration-200'
                    required
                    placeholder={t('common:worklog.requiredDescription')}
                  />
                </label>
              )}

              <div className='flex gap-4 pt-4'>
                <button
                  onClick={handleConfirmAction}
                  disabled={actionType === 'in' && !description.trim()}
                  className='flex-1 px-6 py-3 font-body  text-white rounded-lg
                    bg-metropolia-main-orange hover:bg-metropolia-secondary-orange
                    disabled:bg-gray-400 font-bold disabled:cursor-not-allowed
                    transition-colors duration-200'>
                  {t('common:confirm')}
                </button>
                <button
                  onClick={handleCloseModal}
                  className='flex-1 px-6 py-3 font-body font-medium text-gray-700 rounded-lg
                    bg-gray-100 hover:bg-gray-200
                    transition-colors duration-200'>
                  {t('common:cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentWorkLogLogger;
