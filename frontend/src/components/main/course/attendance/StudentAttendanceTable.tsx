import React from 'react';
import {useTranslation} from 'react-i18next';
import {motion} from 'framer-motion';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';

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

  return (
    <div className='w-full'>
      {/* Desktop Table View */}
      <div className='hidden md:block'>
        <div className='min-w-full overflow-hidden rounded-lg shadow-sm'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-metropolia-main-grey uppercase tracking-wider'>
                  {t('common:lectures.table.headers.topic')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-metropolia-main-grey uppercase tracking-wider'>
                  {t('common:lectures.table.headers.date')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-metropolia-main-grey uppercase tracking-wider'>
                  {t('common:instructors')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-metropolia-main-grey uppercase tracking-wider'>
                  {t('common:lectures.table.headers.timeOfDay')}
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-metropolia-main-grey uppercase tracking-wider'>
                  {t('common:attendance.status.title')}
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {attendanceData.map((attendance, index) => (
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
      <div className='grid grid-cols-1 gap-4 md:hidden'>
        {attendanceData.map((attendance, index) => (
          <motion.div
            key={index}
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.3, delay: index * 0.1}}
            className={`${getStatusClass(
              attendance.status,
            )} rounded-lg shadow-sm p-4 border border-gray-100`}>
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
