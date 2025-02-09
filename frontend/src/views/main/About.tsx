import React from 'react';
import {useTranslation} from 'react-i18next';

/**
 * About component displays detailed information about the Metropolia Attendance system
 */
const About: React.FC = () => {
  const {t} = useTranslation(['translation']);

  return (
    <div className='container max-w-3xl px-4 py-8 mx-auto bg-white shadow-lg rounded-xl'>
      <h1 className='mb-8 text-3xl font-bold font-heading text-metropolia-main-orange'>
        {t('translation:about.title')}
      </h1>

      <div className='space-y-6 text-gray-800 font-body'>
        <p className='text-lg'>{t('translation:about.description')}</p>
        <p>{t('translation:about.modernization')}</p>
        <p>{t('translation:about.benefits')}</p>
      </div>
    </div>
  );
};

export default About;
