import React from 'react';
import { useTranslation } from 'react-i18next';

const EmptyCoursesMessage: React.FC = () => {
  const { t } = useTranslation(['admin']);

  return (
    <div className='flex flex-col items-center justify-center h-64 gap-3 text-center'>
      <div className='w-16 h-16 mb-2 rounded-full bg-metropolia-trend-light-blue/20 flex items-center justify-center'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='w-8 h-8 text-metropolia-trend-light-blue'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
          />
        </svg>
      </div>
      <p className='text-lg font-semibold text-metropolia-main-grey'>
        {t('admin:ui.noCoursesAvailable')}
      </p>
      <p className='text-sm text-metropolia-main-grey/70'>
        {t('admin:ui.createFirstCourse')}
      </p>
    </div>
  );
};

export default EmptyCoursesMessage;
