import React from 'react';
import {useTranslation} from 'react-i18next';
import {format, parseISO} from 'date-fns';
import {CombinedStudentData} from './types';

interface MobileCardListProps {
  students: CombinedStudentData[];
  threshold?: number;
}

export const MobileCardList: React.FC<MobileCardListProps> = ({
  students,
  threshold,
}) => {
  const {t} = useTranslation();

  return (
    <div className='md:hidden space-y-4'>
      {students.map((student, index) => (
        <div
          key={`${student.userId}-${student.courseName}-${student.studentNumber}-${index}`}
          className='bg-white rounded-xl border border-gray-200 p-5 space-y-4 hover:border-metropolia-main-orange transition-colors duration-200'>
          <div className='flex justify-between items-start gap-4'>
            <h3 className='font-semibold text-lg text-gray-900'>
              {`${student.firstName} ${student.lastName}`}
            </h3>
            {threshold && typeof threshold === 'number' && (
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                  ${
                    student.attendance.percentage >= threshold
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  } transition-colors duration-200`}>
                {student.attendance.percentage >= threshold
                  ? t('common:passing')
                  : t('common:failing')}
              </span>
            )}
          </div>

          <div className='grid grid-cols-2 gap-4 text-sm'>
            <InfoField label={t('common:course')} value={student.courseName} />
            <InfoField label={t('common:courseCode')} value={student.code} />
            <InfoField label={t('common:group')} value={student.groupName} />
            <InfoField
              label={t('common:studentNumber')}
              value={student.studentNumber}
            />
          </div>

          <div className='border-t border-gray-100 pt-4 mt-4'>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <InfoField
                label={t('common:totalLectures')}
                value={student.attendance.total.toString()}
              />
              <InfoField
                label={t('common:attendedLectures')}
                value={student.attendance.attended.toString()}
              />
              <InfoField
                label={t('common:attendancePercentage')}
                value={`${student.attendance.percentage}%`}
              />
              <InfoField
                label={t('common:lastAttendance')}
                value={
                  student.attendance.lastAttendance
                    ? format(
                        parseISO(student.attendance.lastAttendance),
                        'dd.MM.yyyy HH:mm',
                      )
                    : t('common:never')
                }
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

interface InfoFieldProps {
  label: string;
  value: string;
}

const InfoField: React.FC<InfoFieldProps> = ({label, value}) => (
  <div className='space-y-1'>
    <span className='text-gray-500 block'>{label}</span>
    <p className='font-medium'>{value}</p>
  </div>
);
