import React from 'react';
import {useTranslation} from 'react-i18next';

const AdminGuide = () => {
  const {t} = useTranslation(['translation']);
  return (
    <div className='p-4 bg-white rounded-lg shadow-md md:p-8'>
      <h2 className='mb-4 text-2xl font-heading md:text-3xl'>
        {t('translation:admin.guide.title')}
      </h2>
      <p className='mb-4 text-sm md:text-base'>
        {t('translation:admin.guide.guideText')}
      </p>
      <ul className='space-y-2 list-disc list-inside'>
        <li className='text-sm md:text-base'>
          <strong>{t('translation:admin.guide.statistics')}: </strong>{' '}
          {t('translation:admin.guide.statisticsText')}
        </li>
        <li className='text-sm md:text-base'>
          <strong>{t('translation:admin.guide.logs')}: </strong>{' '}
          {t('translation:admin.guide.logsText')}
        </li>
        <li className='text-sm md:text-base'>
          <strong>{t('translation:admin.guide.errorLogs')}: </strong>{' '}
          {t('translation:admin.guide.errorLogsText')}
        </li>
        <li className='text-sm md:text-base'>
          <strong>{t('translation:admin.guide.userFeedback')}: </strong>{' '}
          {t('translation:admin.guide.userFeedbackText')}
        </li>
      </ul>
    </div>
  );
};

export default AdminGuide;
