import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {motion} from 'framer-motion';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

interface Attendance {
  date: string;
  name: string;
  start_date: string;
  timeofday: string;
  topicname: string;
  teacher: string;
  status: number;
}

interface StudentAttendanceTableProps {
  attendanceData: Attendance[];
}

const StudentAttendanceTable: React.FC<StudentAttendanceTableProps> = ({
  attendanceData,
}) => {
  const {t} = useTranslation(['admin', 'common']);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Attendance;
    direction: 'asc' | 'desc';
  } | null>(null);

  const sortData = (key: keyof Attendance) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({key, direction});
  };

  const getSortedData = () => {
    if (!sortConfig) return attendanceData;

    return [...attendanceData].sort((a, b) => {
      if (sortConfig.key === 'start_date') {
        const dateA = new Date(a[sortConfig.key]).getTime();
        const dateB = new Date(b[sortConfig.key]).getTime();
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }

      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const getSortIcon = (key: keyof Attendance) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? (
        <ArrowUpwardIcon className='h-4 w-4' />
      ) : (
        <ArrowDownwardIcon className='h-4 w-4' />
      );
    }
    return null;
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 0:
        return <EventBusyIcon className='text-metropolia-support-red' />;
      case 1:
        return <EventAvailableIcon className='text-metropolia-trend-green' />;
      case 2:
        return <HourglassTopIcon className='text-metropolia-support-yellow' />;
      default:
        return null;
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return t('common:attendance.status.absent');
      case 1:
        return t('common:attendance.status.present');
      case 2:
        return t('common:attendance.status.acceptedAbsence');
      default:
        return '';
    }
  };

  const getStatusClass = (status: number) => {
    switch (status) {
      case 0:
        return 'bg-red-50';
      case 1:
        return 'bg-green-50';
      case 2:
        return 'bg-yellow-50';
      default:
        return 'bg-white';
    }
  };

  const SortableHeader = ({
    label,
    field,
  }: {
    label: string;
    field: keyof Attendance;
  }) => (
    <th
      className='px-6 py-3 text-left text-xs font-medium text-metropolia-main-grey uppercase tracking-wider cursor-pointer hover:bg-gray-100 group'
      onClick={() => sortData(field)}>
      <div className='flex items-center space-x-2 relative'>
        <span>{label}</span>
        <div className='flex flex-col opacity-50 group-hover:opacity-100 transition-opacity'>
          {getSortIcon(field) || (
            <ArrowUpwardIcon className='h-3 w-3 text-gray-400' />
          )}
        </div>
        {sortConfig?.key === field && (
          <div className='absolute -left-2 top-0 h-full w-1 bg-metropolia-main-orange rounded' />
        )}
      </div>
    </th>
  );

  return (
    <div className='w-full'>
      {/* Desktop Table View */}
      <div className='hidden md:block'>
        <div className='min-w-full overflow-hidden rounded-lg shadow-sm'>
          <p className='text-sm text-gray-500 mb-2 italic flex items-center gap-2'>
            {t('common:sorting.clickToSort')}
            {sortConfig && (
              <span>
                {t('common:sorting.currentSort')}
                <strong>{sortConfig.key}</strong> (
                {t(`common:sorting.${sortConfig.direction}`)})
              </span>
            )}
          </p>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <SortableHeader
                  label={t('common:lectures.table.headers.topic')}
                  field='topicname'
                />
                <SortableHeader
                  label={t('common:lectures.table.headers.date')}
                  field='start_date'
                />
                <SortableHeader
                  label={t('common:instructors')}
                  field='teacher'
                />
                <SortableHeader
                  label={t('common:lectures.table.headers.timeOfDay')}
                  field='timeofday'
                />
                <SortableHeader
                  label={t('common:attendance.status.title')}
                  field='status'
                />
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {getSortedData().map((attendance, index) => (
                <motion.tr
                  key={index}
                  initial={{opacity: 0}}
                  animate={{opacity: 1}}
                  transition={{duration: 0.3, delay: index * 0.05}}
                  className={`${getStatusClass(
                    attendance.status,
                  )} hover:bg-gray-50 transition-colors duration-150`}>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-metropolia-main-grey'>
                    {attendance.topicname}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                    {new Date(attendance.start_date).toLocaleDateString()}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                    {attendance.teacher}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                    {attendance.timeofday}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center space-x-2'>
                      {getStatusIcon(attendance.status)}
                      <span className='text-sm text-gray-600'>
                        {getStatusText(attendance.status)}
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className='grid grid-cols-1 gap-4 md:hidden '>
        <div className='flex items-center justify-between mb-4 bg-metropolia-support-white p-2 rounded transition-shadow duration-300  shadow-lg hover:shadow-xl'>
          <p className='text-sm text-gray-500 italic'>
            {sortConfig
              ? `${t('common:sorting.currentSort')} ${sortConfig.key} (${t(
                  `common:sorting.${sortConfig.direction}`,
                )})`
              : t('common:sorting.none')}
          </p>
          <select
            aria-label={t('common:sorting.sortBy')}
            className='form-select text-sm border-gray-300 rounded-md'
            value={sortConfig?.key || ''}
            onChange={(e) => sortData(e.target.value as keyof Attendance)}>
            <option value=''>{t('common:sorting.sortBy')}</option>
            <option value='topicname'>
              {t('common:lectures.table.headers.topic')}
            </option>
            <option value='start_date'>
              {t('common:lectures.table.headers.date')}
            </option>
            <option value='teacher'>{t('common:instructors')}</option>
            <option value='timeofday'>
              {t('common:lectures.table.headers.timeOfDay')}
            </option>
            <option value='status'>
              {t('common:attendance.status.title')}
            </option>
          </select>
        </div>
        {getSortedData().map((attendance, index) => (
          <motion.div
            key={index}
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.3, delay: index * 0.1}}
            className={`${getStatusClass(
              attendance.status,
            )}   p-4 border border-gray-100  rounded transition-shadow  duration-300  shadow-lg hover:shadow-xl`}>
            <div className='flex justify-between items-start mb-3'>
              <h3 className='text-lg font-medium text-metropolia-main-grey'>
                {attendance.topicname}
              </h3>
              <div className='flex flex-col items-end'>
                {getStatusIcon(attendance.status)}
                <span className='text-xs mt-1 text-gray-600'>
                  {getStatusText(attendance.status)}
                </span>
              </div>
            </div>
            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-500'>
                  {t('common:lectures.table.headers.date')}:
                </span>
                <span className='text-gray-700'>
                  {new Date(attendance.start_date).toLocaleDateString()}
                </span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-500'>
                  {t('common:instructors')}:
                </span>
                <span className='text-gray-700'>{attendance.teacher}</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-500'>
                  {t('common:lectures.table.headers.timeOfDay')}:
                </span>
                <span className='text-gray-700'>{attendance.timeofday}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StudentAttendanceTable;
