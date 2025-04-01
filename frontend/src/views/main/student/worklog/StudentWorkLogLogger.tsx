import React, {useCallback, useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import {useNavigate} from 'react-router-dom';
import apiHooks from '../../../../api';
import {UserContext} from '../../../../contexts/UserContext';
import WorkLogCourseSelector, {
  UnifiedCourse,
} from '../../../../components/worklog/WorkLogCourseSelector';
import WorkLogActionButtons from '../../../../components/worklog/WorkLogActionButtons';
import WorkLogModal from '../../../../components/worklog/WorkLogModal';
import type {ActiveEntry, WorkLogEntry} from '../../../../types/worklog';
import dayjs from 'dayjs';
import {
  CalendarToday as CalendarIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

// Additional confirmation dialog component
const ConfirmationDialog: React.FC<{
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
}> = ({isOpen, onConfirm, onCancel, message}) => {
  const {t} = useTranslation(['common']);
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
        <p className='text-metropolia-main-grey mb-4'>{message}</p>
        <div className='flex justify-end space-x-3'>
          <button
            onClick={onCancel}
            className='px-4 py-2 text-metropolia-main-grey bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors'>
            {t('common:worklog.actions.cancel', 'Cancel')}
          </button>
          <button
            onClick={onConfirm}
            className='px-4 py-2 text-white bg-metropolia-main-orange hover:bg-metropolia-secondary-orange rounded-lg transition-colors'>
            {t('common:worklog.actions.confirm', 'Still Add Entry')}
          </button>
        </div>
      </div>
    </div>
  );
};

const StudentWorkLogLogger: React.FC = () => {
  const {t} = useTranslation(['common']);
  const navigate = useNavigate();
  const {user} = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [actionType, setActionType] = useState<'in' | 'out'>('in');
  const [courses, setCourses] = useState<UnifiedCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [hasActiveEntry, setHasActiveEntry] = useState<boolean>(false);
  const [activeCourse, setActiveCourse] = useState<ActiveEntry | null>(null);

  // Mass entry state
  const [showMassEntry, setShowMassEntry] = useState(false);
  const [massDescription, setMassDescription] = useState('');
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    getWeekStart(new Date()),
  );
  const [selectedDays, setSelectedDays] = useState<{
    [key: string]: {selected: boolean; hours: number};
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Track days with existing entries
  const [daysWithEntries, setDaysWithEntries] = useState<Set<string>>(
    new Set(),
  );

  // Confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    (() => Promise<void>) | null
  >(null);

  // Helper function to get the start of the week (Monday)
  function getWeekStart(date: Date): Date {
    const day = date.getDay();
    // If Sunday (0), set to previous Monday (-6)
    // Otherwise subtract (day-1) to get to Monday
    const diff = day === 0 ? -6 : -(day - 1);
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  // Helper function to format date to YYYY-MM-DD for comparison
  const formatDateToString = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Get today's date as YYYY-MM-DD for comparison
  const todayString = formatDateToString(new Date());

  // Generate days of the current week
  const getDaysOfWeek = useCallback(() => {
    const days: Date[] = [];
    const startDate = new Date(currentWeekStart);

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      days.push(currentDate);
    }

    return days;
  }, [currentWeekStart]);

  // Check if a date is today
  const isToday = useCallback(
    (date: Date): boolean => {
      return formatDateToString(date) === todayString;
    },
    [todayString],
  );

  // Check if a date is past (before today)
  const isPastDate = useCallback(
    (date: Date): boolean => {
      return formatDateToString(date) < todayString;
    },
    [todayString],
  );

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  // Navigate to next week
  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  // Toggle day selection
  const toggleDaySelection = (dateString: string) => {
    setSelectedDays((prev) => {
      const current = prev[dateString] || {selected: false, hours: 8};
      return {
        ...prev,
        [dateString]: {
          ...current,
          selected: !current.selected,
        },
      };
    });
  };

  // Update hours for a selected day
  const updateHours = (dateString: string, hours: number) => {
    setSelectedDays((prev) => ({
      ...prev,
      [dateString]: {
        ...(prev[dateString] || {selected: true}),
        hours: hours,
      },
    }));
  };

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
        if (activeEntries[0].work_log_practicum_id) {
          setSelectedCourse(activeEntries[0].work_log_practicum_id);
        } else {
          setSelectedCourse(activeEntries[0].work_log_course_id);
        }
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

        // Fetch both worklog courses and practicum courses
        const [worklogCourses, practicumCourses] = await Promise.all([
          apiHooks.getActiveCoursesByStudentEmail(user?.email || '', token),
          apiHooks.getStudentPracticum(user?.email || '', token),
        ]);
        console.log('🚀 ~ fetchCourses ~ practicumCourses:', practicumCourses);

        // Map worklog courses to unified format
        const unifiedWorklogCourses: UnifiedCourse[] = worklogCourses.map(
          (course) => ({
            ...course,
            type: 'worklog',
          }),
        );

        // Map practicum courses to unified format
        const unifiedPracticumCourses: UnifiedCourse[] = practicumCourses.map(
          (practicum) => ({
            work_log_course_id: practicum.work_log_practicum_id, // Use practicum ID as the course ID
            work_log_practicum_id: practicum.work_log_practicum_id,
            name: practicum.name,
            code: practicum.name.substring(0, 10) + '...', // Create a simple code if none exists
            description: practicum.description,
            start_date: new Date(practicum.start_date),
            end_date: new Date(practicum.end_date),
            type: 'practicum',
          }),
        );

        // Combine both types of courses
        const allCourses = [
          ...unifiedWorklogCourses,
          ...unifiedPracticumCourses,
        ];
        setCourses(allCourses);

        if (allCourses.length === 0) {
          toast.info(t('common:worklog.noCourses'));
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        if (allCourses.length > 0 && !hasActiveEntry && !selectedCourse) {
          setSelectedCourse(allCourses[0].work_log_course_id);
        }
      } catch (error) {
        toast.error('Failed to fetch courses');
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, [user?.email, hasActiveEntry, selectedCourse, navigate, t]);

  useEffect(() => {
    const fetchDaysWithEntries = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token || !selectedCourse || !user?.userid) {
          return;
        }

        const response = await apiHooks.getAllWorkLogEntries(
          user.userid,
          token,
        );

        if (response.entries) {
          // Filter entries by the selected course
          const courseEntries = response.entries.filter(
            (entry: WorkLogEntry) =>
              entry.work_log_course_id === selectedCourse ||
              entry.work_log_practicum_id === selectedCourse,
          );

          // Create a Set of dates that already have entries for this course
          const entryDates = new Set(
            courseEntries.map(
              (entry: WorkLogEntry) =>
                new Date(entry.start_time).toISOString().split('T')[0],
            ),
          ) as Set<string>;

          setDaysWithEntries(entryDates);
        }
      } catch (error) {
        console.error('Failed to fetch days with entries:', error);
      }
    };

    fetchDaysWithEntries();
  }, [selectedCourse, user?.userid]);

  const handleCourseChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourse(Number(event.target.value));
  };

  const handleOpenModal = useCallback((type: 'in' | 'out') => {
    setActionType(type);
    setDescription('');
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const checkForExistingEntryToday = useCallback(async () => {
    if (!selectedCourse || !user?.userid) return false;

    try {
      const token = localStorage.getItem('userToken');
      if (!token) return false;

      const response = await apiHooks.getAllWorkLogEntries(user.userid, token);

      if (response.entries) {
        const today = dayjs().format('YYYY-MM-DD');

        const hasTodayEntry = response.entries.some((entry: WorkLogEntry) => {
          const entryDate = dayjs(entry.start_time).format('YYYY-MM-DD');
          return (
            entryDate === today &&
            (entry.work_log_course_id === selectedCourse ||
              entry.work_log_practicum_id === selectedCourse)
          );
        });

        return hasTodayEntry;
      }
    } catch (error) {
      console.error('Error checking for existing entries:', error);
    }

    return false;
  }, [selectedCourse, user?.userid]);

  const handleConfirmAction = useCallback(async () => {
    if (!selectedCourse) {
      toast.error(t('common:worklog.error.requiredFields'));
      return;
    }

    // For 'in' action, check if there's already an entry for today
    if (actionType === 'in') {
      const hasExistingEntry = await checkForExistingEntryToday();

      if (hasExistingEntry) {
        // Store the action to execute later if confirmed
        const executeAction = async () => {
          try {
            const token = localStorage.getItem('userToken');
            if (!token) {
              throw new Error('No token found');
            }

            const selectedCourseData = courses.find(
              (course) =>
                course.work_log_course_id === selectedCourse ||
                course.work_log_practicum_id === selectedCourse,
            );
            if (!selectedCourseData) {
              throw new Error('Selected course not found');
            }

            const params = {
              userId: user?.userid || 0,
              courseId: selectedCourse,
              startTime: new Date(),
              endTime: new Date(),
              description,
              status: '1',
            };

            // Handle differently based on course type
            if (selectedCourseData.type === 'practicum') {
              await apiHooks.createWorkLogEntryPracticum(params, token);
            } else {
              await apiHooks.createWorkLogEntry(params, token);
            }

            toast.success(t('common:worklog.messages.entryAdded'));
            await checkActiveEntry();
          } catch (error) {
            toast.error(t('common:worklog.messages.failedToLog'));
          }

          setIsModalOpen(false);
          setShowConfirmation(false);
        };

        setPendingAction(() => executeAction);
        setShowConfirmation(true);
        return;
      }
    }

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token found');
      }

      const selectedCourseData = courses.find(
        (course) =>
          course.work_log_course_id === selectedCourse ||
          course.work_log_practicum_id === selectedCourse,
      );
      if (!selectedCourseData) {
        throw new Error('Selected course not found');
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

        // Handle differently based on course type
        if (selectedCourseData.type === 'practicum') {
          // For practicum courses, we need to use a different endpoint or parameter
          await apiHooks.createWorkLogEntryPracticum(params, token);
        } else {
          // Regular worklog entry
          await apiHooks.createWorkLogEntry(params, token);
        }

        toast.success(t('common:worklog.messages.entryAdded'));
      } else {
        await apiHooks.closeWorkLogEntry(
          activeCourse?.entry_id || 0,
          token,
          description,
        );

        toast.success(t('common:worklog.messages.entryClosed'));
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
    courses,
    checkForExistingEntryToday,
  ]);

  const handleEdit = useCallback(() => {
    navigate('/student/worklogs');
  }, [navigate]);

  // Submit mass entries
  const handleMassEntrySubmit = async () => {
    if (!selectedCourse) {
      toast.error(t('common:worklog.error.requiredFields'));
      return;
    }

    if (!massDescription.trim()) {
      toast.error(t('common:worklog.error.descriptionRequired'));
      return;
    }

    const selectedEntries = Object.entries(selectedDays)
      .filter(([_, value]) => value.selected)
      .map(([dateStr, value]) => ({
        date: new Date(dateStr),
        hours: value.hours,
      }));

    if (selectedEntries.length === 0) {
      toast.error(t('common:worklog.error.noDaysSelected'));
      return;
    }

    // Check if any selected date is today and already has an entry
    const todayEntry = selectedEntries.find(
      (entry) => formatDateToString(entry.date) === todayString,
    );

    if (todayEntry && (await checkForExistingEntryToday())) {
      // Show confirmation dialog for duplicate entry
      const executeAction = async () => {
        await processMassEntries(selectedEntries);
      };

      setPendingAction(() => executeAction);
      setShowConfirmation(true);
      return;
    }

    await processMassEntries(selectedEntries);
  };

  // Process the mass entries after validation
  const processMassEntries = async (
    selectedEntries: {date: Date; hours: number}[],
  ) => {
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token found');
      }

      const selectedCourseData = courses.find(
        (course) =>
          course.work_log_course_id === selectedCourse ||
          course.work_log_practicum_id === selectedCourse,
      );
      if (!selectedCourseData) {
        throw new Error('Selected course not found');
      }

      for (const entry of selectedEntries) {
        const startTime = new Date(entry.date);
        startTime.setHours(9, 0, 0, 0); // Default start at 9 AM

        const endTime = new Date(entry.date);
        endTime.setHours(9 + entry.hours, 0, 0, 0); // Add hours to start time

        const params = {
          userId: user?.userid || 0,
          courseId: selectedCourse,
          startTime: startTime,
          endTime: endTime,
          description: massDescription,
          status: '2',
        };

        // Use the appropriate API call based on course type
        if (selectedCourseData.type === 'practicum') {
          // @ts-expect-error
          await apiHooks.createWorkLogEntryPracticum(params, token);
        } else {
          // @ts-expect-error
          await apiHooks.createWorkLogEntry(params, token);
        }
      }

      toast.success(
        t('common:worklog.messages.massEntriesAdded', {
          count: selectedEntries.length,
        }),
      );
      setSelectedDays({});
      setMassDescription('');
      setShowConfirmation(false);

      await checkActiveEntry();
    } catch (error) {
      toast.error(t('common:worklog.messages.failedToAddEntries'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-[50vh] p-4 sm:p-6 md:p-8'>
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
            hasActiveEntry={hasActiveEntry}
          />
          {/* if activeentries dont show */}
          {hasActiveEntry ? null : (
            <div className='flex justify-end'>
              <button
                onClick={() => setShowMassEntry(!showMassEntry)}
                className='flex items-center gap-2 px-4 py-2 bg-metropolia-support-blue text-white rounded-lg transition-all hover:bg-metropolia-support-blue-dark text-sm'>
                <CalendarIcon fontSize='small' />
                {showMassEntry
                  ? t('common:worklog.actions.hideMassEntry')
                  : t('common:worklog.actions.showMassEntry')}
              </button>
            </div>
          )}
        </div>

        {showMassEntry ? (
          <div className='space-y-6 border-t pt-4 mt-4'>
            <h3 className='text-xl font-heading font-semibold text-metropolia-main-grey'>
              {t('common:worklog.massEntry.title')}
            </h3>

            <div>
              <label className='block mb-2 text-sm font-medium text-metropolia-main-grey'>
                {t('common:worklog.description')} *
              </label>
              <textarea
                value={massDescription}
                onChange={(e) => setMassDescription(e.target.value)}
                placeholder={t(
                  'common:worklog.massEntry.descriptionPlaceholder',
                )}
                className='w-full p-3 border-2 rounded-lg font-body focus:border-metropolia-main-orange focus:ring-2 focus:ring-metropolia-main-orange/20 transition-colors duration-200'
                rows={3}
                required
              />
            </div>

            <div>
              <div className='flex items-center justify-between mb-2'>
                <h4 className='font-medium text-metropolia-main-grey'>
                  {t('common:worklog.massEntry.selectDays')}
                </h4>
                <div className='flex items-center'>
                  <button
                    onClick={goToPreviousWeek}
                    aria-label={t('common:worklog.massEntry.previousWeek')}
                    title={t('common:worklog.massEntry.previousWeek')}
                    className='p-1 text-metropolia-main-grey hover:text-metropolia-main-orange'>
                    <ChevronLeftIcon />
                  </button>
                  <span className='mx-2 text-sm'>
                    {dayjs(currentWeekStart).format('MMM D')} -{' '}
                    {dayjs(currentWeekStart)
                      .add(6, 'day')
                      .format('MMM D, YYYY')}
                  </span>
                  <button
                    onClick={goToNextWeek}
                    aria-label={t('common:worklog.massEntry.nextWeek')}
                    title={t('common:worklog.massEntry.nextWeek')}
                    className='p-1 text-metropolia-main-grey hover:text-metropolia-main-orange'>
                    <ChevronRightIcon />
                  </button>
                </div>
              </div>

              <div className='grid grid-cols-7 gap-1 mb-4'>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
                  (day) => (
                    <div
                      key={day}
                      className='text-center text-xs font-medium text-metropolia-main-grey'>
                      {day}
                    </div>
                  ),
                )}
              </div>

              <div className='grid grid-cols-7 gap-1'>
                {getDaysOfWeek().map((day) => {
                  const dateString = formatDateToString(day);
                  const isSelected =
                    selectedDays[dateString]?.selected || false;
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  const isPast = isPastDate(day);
                  const isTodayDate = isToday(day);
                  const hasEntry = daysWithEntries.has(dateString);

                  return (
                    <div key={dateString} className='mb-4'>
                      <button
                        onClick={() => toggleDaySelection(dateString)}
                        disabled={isPast || hasEntry}
                        className={`w-full aspect-square flex flex-col items-center justify-center rounded-md text-sm
                        ${
                          isSelected
                            ? 'bg-metropolia-main-orange text-white'
                            : isTodayDate
                            ? 'bg-metropolia-main-orange bg-opacity-20 border-2 border-metropolia-main-orange text-metropolia-main-grey'
                            : isWeekend
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-white border text-metropolia-main-grey'
                        }
                        ${
                          isPast || hasEntry
                            ? 'opacity-40 cursor-not-allowed'
                            : 'hover:bg-metropolia-main-orange/20'
                        }`}>
                        <span>{day.getDate()}</span>
                        {hasEntry && (
                          <InfoIcon
                            fontSize='small'
                            className='text-metropolia-main-orange'
                          />
                        )}
                      </button>

                      {isSelected && (
                        <div className='mt-1'>
                          <input
                            type='number'
                            min='0.5'
                            max='24'
                            step='0.5'
                            value={selectedDays[dateString]?.hours || 8}
                            onChange={(e) =>
                              updateHours(
                                dateString,
                                parseFloat(e.target.value) || 8,
                              )
                            }
                            className='w-full text-center text-xs p-1 border rounded'
                            title={t('common:worklog.massEntry.hoursTooltip')}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleMassEntrySubmit}
              disabled={
                isSubmitting ||
                Object.entries(selectedDays).filter(([_, v]) => v.selected)
                  .length === 0 ||
                !massDescription.trim()
              }
              className='w-full py-3 flex items-center justify-center gap-2 font-body text-white rounded-lg
                bg-metropolia-main-orange hover:bg-metropolia-secondary-orange
                disabled:bg-gray-400 font-bold disabled:cursor-not-allowed
                transition-colors duration-200'>
              <AddIcon />
              {isSubmitting
                ? t('common:worklog.massEntry.submitting')
                : t('common:worklog.massEntry.submit')}
            </button>
          </div>
        ) : (
          <WorkLogActionButtons
            hasActiveEntry={hasActiveEntry}
            onOpenModal={handleOpenModal}
            onEdit={handleEdit}
            showButtons={courses.length > 0}
          />
        )}
      </div>

      <WorkLogModal
        isOpen={isModalOpen}
        actionType={actionType}
        description={description}
        onDescriptionChange={setDescription}
        onConfirm={handleConfirmAction}
        onClose={handleCloseModal}
      />

      <ConfirmationDialog
        isOpen={showConfirmation}
        message={t('common:worklog.confirmation.duplicateEntryWarning')}
        onConfirm={() => {
          if (pendingAction) pendingAction();
        }}
        onCancel={() => {
          setShowConfirmation(false);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default StudentWorkLogLogger;
