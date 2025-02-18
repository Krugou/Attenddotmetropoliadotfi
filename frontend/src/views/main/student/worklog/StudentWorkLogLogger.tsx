import React, {useCallback, useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import {useNavigate} from 'react-router-dom';
import apiHooks from '../../../../api';
import {UserContext} from '../../../../contexts/UserContext';
import WorkLogCourseSelector from '../../../../components/worklog/WorkLogCourseSelector';
import WorkLogActionButtons from '../../../../components/worklog/WorkLogActionButtons';
import WorkLogModal from '../../../../components/worklog/WorkLogModal';
import type {WorkLogCourse, ActiveEntry} from '../../../../types/worklog';

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

        setCourses(fetchedCourses);

        if (fetchedCourses.length === 0) {
          toast.info(t('common:worklog.noCourses'));
          setTimeout(() => navigate('/'), 3000);
          return;
        }

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
      setDescription('');
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
      } else {
        await apiHooks.closeWorkLogEntry(
          activeCourse?.entry_id || 0,
          token,
          description,
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
    navigate('/student/worklogs');
  }, [navigate]);

  return (
    <div className='flex items-center justify-center min-h-[50vh] p-4 sm:p-6 md:p-8'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-6'>
        <div className='space-y-4'>
          <h2 className='text-2xl font-heading font-bold text-gray-800 mb-4'>
            {t('common:worklog.logger.title')}
          </h2>

          <WorkLogCourseSelector
            courses={courses}
            activeCourse={activeCourse}
            selectedCourse={selectedCourse}
            onCourseChange={handleCourseChange}
          />
        </div>

        <WorkLogActionButtons
          hasActiveEntry={hasActiveEntry}
          onOpenModal={handleOpenModal}
          onEdit={handleEdit}
          showButtons={courses.length > 0}
        />
      </div>

      <WorkLogModal
        isOpen={isModalOpen}
        actionType={actionType}
        description={description}
        onDescriptionChange={setDescription}
        onConfirm={handleConfirmAction}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default StudentWorkLogLogger;
