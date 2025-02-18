import React from 'react';
import {useTranslation} from 'react-i18next';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RestoreIcon from '@mui/icons-material/Restore';
import Calendar from 'react-calendar';
import dayjs from 'dayjs';

interface WorklogFiltersProps {
  selectedCourse: string;
  setSelectedCourse: (course: string) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  showCalendar: boolean;
  setShowCalendar: (show: boolean) => void;
  uniqueCourses: Array<{code: string; name: string}>;
  worklogDates: string[];
}

const WorklogFilters: React.FC<WorklogFiltersProps> = ({
  selectedCourse,
  setSelectedCourse,
  selectedDate,
  setSelectedDate,
  showCalendar,
  setShowCalendar,
  uniqueCourses,
  worklogDates,
}) => {
  const {t} = useTranslation(['common']);

  const handleDateChange = (value: Date) => {
    console.log('Selected date in calendar:', value);
    setSelectedDate(value);
    setShowCalendar(false); // Close calendar after selection
  };

  // Debug logging for worklog dates
  console.log('Available worklog dates:', worklogDates);

  return (
    <div className='flex flex-col  md:items-center gap-4 w-full md:w-auto'>
      <div className='flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto'>
        <div className='w-full md:w-auto'>
          <select
            title={t('common:worklog.filter.course')}
            id='courseFilter'
            className='w-full md:w-auto p-2 border rounded-md bg-white text-metropolia-main-grey'
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}>
            <option value='all'>{t('common:worklog.filter.allCourses')}</option>
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
                  ? 'common:worklog.filter.hideCalendar'
                  : 'common:worklog.filter.showCalendar',
              )}>
              <CalendarTodayIcon />
            </button>
            {selectedDate && (
              <button
                title={t('common:worklog.filter.clearDate')}
                onClick={() => {
                  setSelectedDate(null);
                  setShowCalendar(false);
                }}
                className='text-sm text-metropolia-main-orange hover:text-metropolia-secondary-orange'>
                <RestoreIcon />
              </button>
            )}
          </div>
        </div>
      </div>
      {showCalendar && (
        <div className='relative z-50'>
          {' '}
          {/* Ensure calendar appears above other elements */}
          <Calendar
            //@ts-expect-error - React-Calendar types are incorrect
            onChange={handleDateChange}
            value={selectedDate}
            className='bg-white border rounded-md shadow-sm'
            tileClassName={({date}) => {
              const dateStr = dayjs(date).format('YYYY-MM-DD');
              return worklogDates.includes(dateStr) ? 'has-worklog' : '';
            }}
            tileContent={({date}) => {
              const dateStr = dayjs(date).format('YYYY-MM-DD');
              const hasWorklog = worklogDates.includes(dateStr);
              console.log(
                'Checking date:',
                dateStr,
                'Has worklog:',
                hasWorklog,
              );
              return hasWorklog ? (
                <div className='w-2 h-2 bg-metropolia-main-orange rounded-full mx-auto mt-1'></div>
              ) : null;
            }}
          />
        </div>
      )}
    </div>
  );
};

export default WorklogFilters;
