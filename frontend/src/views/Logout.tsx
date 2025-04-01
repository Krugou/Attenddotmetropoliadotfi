import React, {useContext, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import {UserContext} from '../contexts/UserContext';
import Loader from '../utils/Loader';
import {useTranslation} from 'react-i18next';

/**
 * Logout component.
 * This component is responsible for logging out the user.
 * It removes the user token from local storage, sets the user context to null,
 * and then navigates back to the home page.
 *
 * @returns {JSX.Element} The rendered Logout component.
 */
const Logout = () => {
  /**
   * Hook to translate text.
   */
  const {t} = useTranslation();

  /**
   * Hook to navigate programmatically.
   *
   * @type {NavigateFunction}
   */
  const navigate = useNavigate();

  /**
   * User context.
   *
   * @type {React.Context<UserContext>}
   */
  const {setUser} = useContext(UserContext);

  /**
   * Effect hook to perform the logout operation.
   *
   * This effect runs once when the component mounts. It removes the user token from local storage,
   * sets the user context to null, and then navigates back to the home page after a delay of 1.2 seconds.
   */
  useEffect(() => {
    // Remove the user token from local storage
    localStorage.removeItem('userToken');

    // Set the user context to null
    setUser(null);

    // Delay the navigation by 1 second
    const timeoutId = setTimeout(() => {
      // Display a success toast message with translated text
      toast.success(t('common:logout.success', 'Logged out successfully!'));

      // Navigate back to the home page
      navigate('/');
    }, 1200);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
    };
  }, [setUser, navigate, t]);

  /**
   * Render a circular progress indicator while the logout operation is in progress.
   *
   * @returns {JSX.Element} The rendered JSX element.
   */
  return (
    <div className='flex items-center justify-center h-full'>
      <Loader />
    </div>
  );
};

export default Logout;
