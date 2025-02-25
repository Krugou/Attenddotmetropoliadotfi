import React from 'react';
import {useTranslation} from 'react-i18next';

const AdminGuide = () => {
  const {t} = useTranslation(['admin']);
  return (
    <div className='p-4 bg-white rounded-lg shadow-md md:p-8'>
      <h2 className='mb-4 text-2xl font-heading md:text-3xl'>
        {t('admin:guide.title')}
      </h2>
      <p className='mb-4 text-sm md:text-base'>{t('admin:guide.guideText')}</p>
      <ul className='space-y-2 list-disc list-inside'>
        <li className='text-sm md:text-base'>
          <strong>{t('admin:guide.statistics')}: </strong>{' '}
          {t('admin:guide.statisticsText')}
        </li>
        <li className='text-sm md:text-base'>
          <strong>{t('admin:guide.logs')}: </strong> {t('admin:guide.logsText')}
        </li>

        <li className='text-sm md:text-base'>
          <strong>{t('admin:guide.userFeedback')}: </strong>{' '}
          {t('admin:guide.userFeedbackText')}
        </li>
        <li className='text-sm md:text-base'>
          <strong>{t('admin:guide.serverStatus')}: </strong>{' '}
          {t('admin:guide.serverStatusText')}
        </li>
      </ul>
    </div>
  );
};

export default AdminGuide;
