import React from 'react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';

/**
 * A button component that navigates to the login page when clicked.
 */
const StartViewButton: React.FC = () => {
  const navigate = useNavigate();
  const {t} = useTranslation();

  return (
    <button
      className='px-4 py-2 m-4 text-sm text-white transition rounded-lg font-heading bg-metropolia-main-orange dark:bg-metropolia-main-orange-dark hover:bg-metropolia-secondary-orange dark:hover:bg-metropolia-secondary-orange-dark sm:py-3 md:py-4 lg:py-5 sm:px-6 md:px-8 lg:px-10 sm:text-base md:text-lg lg:text-xl'
      onClick={() => navigate('/login')}>
      {t('common.login')}
    </button>
  );
};

export default StartViewButton;
