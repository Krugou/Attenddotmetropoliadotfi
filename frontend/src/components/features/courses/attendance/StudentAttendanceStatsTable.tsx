import React from 'react';
import {useTranslation} from 'react-i18next';
import {motion} from 'framer-motion';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';

interface AttendanceStudentData {
  attendance: {[key: string]: number};
  topics: string | string[];
}

interface StudentAttendanceStatsTableProps {
  attendanceStudentData: AttendanceStudentData;
  threshold: number | null;
  studentName?: string;
}

const StudentAttendanceStatsTable: React.FC<
  StudentAttendanceStatsTableProps
> = ({attendanceStudentData, threshold, studentName}) => {
  const {t} = useTranslation(['admin', 'common', 'student']);

  const getProgressColor = (percentage: number) => {
    if (percentage === 0) return 'text-metropolia-support-red';
    if (threshold !== null) {
      return percentage <= threshold
        ? 'text-metropolia-support-red'
        : 'text-metropolia-trend-green';
    }
    return percentage < 80
      ? 'text-metropolia-support-red'
      : 'text-metropolia-trend-green';
  };

  const getProgressBgColor = (percentage: number) => {
    if (percentage === 0) return 'bg-metropolia-support-red';
    if (threshold !== null) {
      return percentage <= threshold
        ? 'bg-metropolia-support-red'
        : 'bg-metropolia-trend-green';
    }
    return percentage < 80
      ? 'bg-metropolia-support-red'
      : 'bg-metropolia-trend-green';
  };

  const averageAttendance =
    Object.values(attendanceStudentData.attendance).reduce(
      (acc, val) => acc + val,
      0,
    ) / Object.values(attendanceStudentData.attendance).length;

  return (
    <div className='w-full'>
      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.5}}
        className='bg-white rounded-xl shadow-lg p-6 md:p-8'>
        <div className='text-center mb-8'>
          <h2 className='text-2xl md:text-3xl font-heading text-metropolia-main-grey mb-2'>
            {t('student:course.attendanceOverview')}
          </h2>
          {studentName && (
            <p className='text-lg text-metropolia-main-grey-dark'>
              {studentName}
            </p>
          )}
        </div>

        <div className='flex justify-center mb-12'>
          <div className='relative'>
            {/* Custom circular progress using SVG */}
            <svg className='w-32 h-32 transform -rotate-90'>
              <circle
                className='text-gray-200'
                strokeWidth='8'
                stroke='currentColor'
                fill='transparent'
                r='58'
                cx='64'
                cy='64'
              />
              <circle
                className={getProgressColor(averageAttendance)}
                strokeWidth='8'
                strokeDasharray={`${(averageAttendance / 100) * 364.4} 364.4`}
                strokeLinecap='round'
                stroke='currentColor'
                fill='transparent'
                r='58'
                cx='64'
                cy='64'
              />
            </svg>
            <div className='absolute inset-0 flex items-center justify-center'>
              <span className='text-3xl font-bold text-metropolia-main-grey'>
                {Math.round(averageAttendance)}%
              </span>
            </div>
          </div>
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {Object.entries(attendanceStudentData.attendance).map(
            ([topic, percentage], index) => (
              <motion.div
                key={topic}
                initial={{opacity: 0, x: -20}}
                animate={{opacity: 1, x: 0}}
                transition={{duration: 0.3, delay: index * 0.1}}
                className={`rounded-lg p-5 ${
                  percentage === 0
                    ? 'bg-red-50'
                    : percentage < (threshold ?? 80)
                    ? 'bg-yellow-50'
                    : 'bg-green-50'
                } border border-opacity-50 ${
                  percentage === 0
                    ? 'border-metropolia-support-red'
                    : percentage < (threshold ?? 80)
                    ? 'border-metropolia-support-yellow'
                    : 'border-metropolia-trend-green'
                }`}>
                <div className='flex justify-between items-center mb-4'>
                  <h3 className='font-medium text-metropolia-main-grey text-lg'>
                    {topic}
                  </h3>
                  <div className='flex items-center'>
                    {percentage < (threshold ?? 80) ? (
                      <div className='group relative'>
                        <WarningIcon className='text-metropolia-support-red' />
                        <div className='absolute z-10 invisible group-hover:visible bg-gray-900 text-white text-sm rounded p-2 -mt-2 -ml-24'>
                          {t('student:course.attendanceWarning')}
                        </div>
                      </div>
                    ) : (
                      <CheckCircleIcon className='text-metropolia-trend-green' />
                    )}
                  </div>
                </div>

                <div className='space-y-3'>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressBgColor(
                        percentage,
                      )}`}
                      style={{width: `${percentage}%`}}></div>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-1'>
                      {percentage >= (threshold ?? 80) ? (
                        <TrendingUpIcon className='text-metropolia-trend-green' />
                      ) : (
                        <TrendingDownIcon className='text-metropolia-support-red' />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          percentage >= (threshold ?? 80)
                            ? 'text-metropolia-trend-green'
                            : 'text-metropolia-support-red'
                        }`}>
                        {percentage >= (threshold ?? 80)
                          ? t('student:course.onTrack')
                          : t('student:course.needsImprovement')}
                      </span>
                    </div>
                    <span
                      className={`text-lg font-semibold ${getProgressColor(
                        percentage,
                      )}`}>
                      {Math.round(percentage)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            ),
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default StudentAttendanceStatsTable;
