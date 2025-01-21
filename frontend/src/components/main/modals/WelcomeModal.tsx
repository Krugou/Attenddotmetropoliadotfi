import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';

/**
 * WelcomeModal component.
 * This component is responsible for displaying a welcome modal for first-time visitors.
 * It uses the useState and useEffect hooks from React to manage state and side effects.
 * The component checks if the user has visited the site before by checking the 'firstVisit' item in localStorage.
 * If the 'firstVisit' item does not exist, the component assumes that the user is a first-time visitor and displays the welcome modal.
 * The welcome modal contains a welcome message and a close button.
 * When the close button is clicked, the modal is hidden.
 *
 * @returns {JSX.Element} The rendered WelcomeModal component.
 */
const WelcomeModal = () => {
  const [showModal, setShowModal] = useState(false);
  const {t} = useTranslation();

  useEffect(() => {
    const firstVisit = localStorage.getItem('firstVisit');
    if (!firstVisit) {
      setShowModal(true);
      localStorage.setItem('firstVisit', 'no');
    }
  }, []);

  return (
    showModal && (
      <div className='fixed bottom-0 right-0 z-50 max-w-xs p-6 m-6 bg-white rounded-lg shadow-lg sm:max-w-md md:max-w-lg lg:max-w-xl'>
        <div>
          <h2 className='mb-2 text-2xl font-heading'>{t('welcome.title')}</h2>
          <p className='mb-4'>{t('welcome.description')}</p>
          <button
            className='px-4 py-2 text-white bg-blue-500 rounded'
            onClick={() => setShowModal(false)}>
            {t('common.close')}
          </button>
        </div>
      </div>
    )
  );
};

export default WelcomeModal;
