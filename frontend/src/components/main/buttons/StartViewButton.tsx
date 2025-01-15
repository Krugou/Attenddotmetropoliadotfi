import React from 'react';
import {useNavigate} from 'react-router-dom';
/**
 * A button component that navigates to the login page when clicked.
 */
const StartViewButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <button
      className='px-4 py-2 m-4 text-sm font-bold text-white transition rounded-lg bg-metropoliaMainOrange dark:bg-metropoliaMainOrange-dark hover:bg-metropoliaSecondaryOrange dark:hover:bg-metropoliaSecondaryOrange-dark sm:py-3 md:py-4 lg:py-5 sm:px-6 md:px-8 lg:px-10 sm:text-base md:text-lg lg:text-xl'
      onClick={() => navigate('/login')}>
      Login
    </button>
  );
};

export default StartViewButton;
