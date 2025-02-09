import React, {useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import {UserContext} from '../../../contexts/UserContext';
import apiHooks from '../../../api';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import {CircularProgress} from '@mui/material';
import EditWorklogModal from '../../../components/modals/EditWorklogModal';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RestoreIcon from '@mui/icons-material/Restore';
dayjs.extend(duration);

interface WorkLogEntry {
  entry_id: number;
  start_time: string;
  end_time: string;
  description: string;
  course: {
    name: string;
    code: string;
  };
  status: number;
}

const StudentWorklogs: React.FC = () => {
  const {t} = useTranslation();
  const {user} = useContext(UserContext);
  const [entries, setEntries] = useState<WorkLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<WorkLogEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [uniqueCourses, setUniqueCourses] = useState<
    Array<{code: string; name: string}>
  >([]);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token || !user?.userid) {
          throw new Error('No token or user found');
        }

        const response = await apiHooks.getAllWorkLogEntries(
          user.userid,
          token,
        );
        console.log('🚀 ~ fetchEntries ~ response:', response);

        if (response.entries) {
          setEntries(response.entries);
          // Extract unique courses
          const courses = new Map();
          response.entries.forEach((entry: WorkLogEntry) => {
            if (entry.course?.code && !courses.has(entry.course.code)) {
              courses.set(entry.course.code, {
                code: entry.course.code,
                name: entry.course.name,
              });
            }
          });
          setUniqueCourses(Array.from(courses.values()));
        }
      } catch (error) {
        console.error('Error fetching worklog entries:', error);
        toast.error(t('worklog.error.fetchFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [user?.userid, t]);

  const handleSaveEdit = async (updatedData: Partial<WorkLogEntry>) => {
    if (!selectedEntry) return;

    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No token found');

      await apiHooks.updateWorkLogEntry(
        selectedEntry.entry_id,
        updatedData,
        token,
      );

      setEntries(
        entries.map((entry) =>
          entry.entry_id === selectedEntry.entry_id
            ? {...entry, ...updatedData}
            : entry,
        ),
      );

      toast.success(t('worklog.edit.success'));
    } catch (error) {
      console.error('Error updating entry:', error);
      toast.error(t('worklog.edit.error'));
    }
  };

  const calculateDuration = (start: string, end: string) => {
    const startTime = dayjs(start);
    const endTime = dayjs(end);
    const diff = endTime.diff(startTime);
    const duration = dayjs.duration(diff);
    return `${Math.floor(duration.asHours())}h ${duration.minutes()}min`;
  };

  const statusClass = (status: number) => {
    return `inline-flex px-2 py-1 text-xs font-medium rounded-full ${
      status === 1
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-green-100 text-green-800'
    }`;
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesCourse =
      selectedCourse === 'all' || entry.course?.code === selectedCourse;
    const matchesDate =
      !selectedDate ||
      dayjs(entry.start_time).format('YYYY-MM-DD') ===
        dayjs(selectedDate).format('YYYY-MM-DD');
    return matchesCourse && matchesDate;
  });

  const worklogDates = entries.map((entry) =>
    dayjs(entry.start_time).format('YYYY-MM-DD'),
  );

  const handleDateChange = (value: Date | [Date, Date] | null) => {
    setSelectedDate(value instanceof Date ? value : null);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className='container px-4 py-8 bg-metropolia-support-white rounded-xl mx-auto'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4'>
        <h1 className='text-2xl font-heading text-metropolia-main-orange'>
          {t('worklog.entries.title')}
        </h1>
        <div className='flex flex-col '>
          <div className='flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto'>
            <div className='w-full md:w-auto'>
              <select
                id='courseFilter'
                className='w-full md:w-auto p-2 border rounded-md bg-white text-metropolia-main-grey'
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}>
                <option value='all'>{t('worklog.filter.allCourses')}</option>
                {uniqueCourses.map((course) => (
                  <option key={course.code} value={course.code}>
                    {course.name} - {course.code}
                  </option>
                ))}
              </select>
            </div>
            <div className='w-full md:w-auto'>
              <div className='flex items-center gap-2 mb-2'>
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className='p-2 text-metropolia-main-orange hover:text-metropolia-secondary-orange rounded-full transition-colors duration-200 hover:bg-gray-100'
                  title={t(
                    showCalendar
                      ? 'worklog.filter.hideCalendar'
                      : 'worklog.filter.showCalendar',
                  )}>
                  <CalendarTodayIcon />
                </button>
                {selectedDate && (
                  <button
                    onClick={() => {
                      setSelectedDate(null);
                      setShowCalendar(!showCalendar);
                    }}
                    className='text-sm text-metropolia-main-orange hover:text-metropolia-secondary-orange'>
                    <RestoreIcon />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showCalendar && (
        <Calendar
          // @ts-ignore
          onChange={handleDateChange}
          value={selectedDate}
          className='bg-white border rounded-md shadow-sm'
          tileContent={({date}) => {
            const dateStr = dayjs(date).format('YYYY-MM-DD');
            const hasWorklog = worklogDates.includes(dateStr);
            return hasWorklog ? (
              <div className='w-2 h-2 bg-metropolia-main-orange rounded-full mx-auto mt-1'></div>
            ) : null;
          }}
        />
      )}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {filteredEntries.map((entry) => (
          <div
            key={entry.entry_id}
            className='relative overflow-hidden transition-shadow duration-300 bg-metropolia-support-white rounded-lg shadow-lg hover:shadow-xl'>
            <div className='p-4 pt-10 '>
              <div className='flex items-center justify-between mb-4'>
                <div className='text-lg font-semibold text-metropolia-main-grey'>
                  {entry.course?.name} - {entry.course?.code}
                </div>
                <div className='text-sm text-metropolia-main-grey'>
                  {dayjs(entry.start_time).format('YYYY-MM-DD')}
                </div>
              </div>

              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-sm text-metropolia-main-grey'>
                    {t('worklog.entries.time')}:
                  </span>
                  <span className='text-sm font-medium'>
                    {dayjs(entry.start_time).format('HH:mm')} -{' '}
                    {dayjs(entry.end_time).format('HH:mm')}
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-sm text-metropolia-main-grey'>
                    {t('worklog.entries.duration')}:
                  </span>
                  <span className='text-sm font-medium'>
                    {calculateDuration(entry.start_time, entry.end_time)}
                  </span>
                </div>

                <div className='pt-2 mt-2 border-t'>
                  <p className='text-sm text-metropolia-main-grey line-clamp-2'>
                    {entry.description}
                  </p>
                </div>
                <div className='flex items-center justify-between pt-2 mt-2 border-t'>
                  <span className={statusClass(entry.status)}>
                    {t(`teacher.worklog.status.${entry.status}`)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <EditWorklogModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEntry(null);
        }}
        entry={selectedEntry}
        onSave={handleSaveEdit}
      />

      <div className='mt-4 text-sm text-metropolia-main-grey'>
        {t('worklog.entries.total')}: {filteredEntries.length}{' '}
        {t('worklog.entries.entries')}
      </div>
    </div>
  );
};

export default StudentWorklogs;
