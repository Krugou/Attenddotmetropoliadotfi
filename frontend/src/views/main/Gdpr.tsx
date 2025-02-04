import {CircularProgress} from '@mui/material';
import React, {useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import {UserContext} from '../../contexts/UserContext.tsx';
import apiHooks from '../../api';
/**
 * Gdpr component.
 * This component is responsible for rendering the GDPR acceptance form and handling the user's response.
 * It uses the UserContext to get and set the user.
 */
const Gdpr = () => {
  const {user, setUser} = useContext(UserContext);

  const navigate = useNavigate();
  /**
   * Handles the acceptance of the GDPR terms.
   * If the user is logged in and has a valid token, it sends a request to update the GDPR status.
   * If the request is successful, it navigates to the main view for the user's role.
   * If the request fails, it shows an error message.
   */
  const handleAccept = async () => {
    if (user) {
      // Get token from local storage
      const token: string | null = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token available');
      }
      const response = await apiHooks.updateGdprStatus(user.userid, token);
      // console.log(response);
      if (response.success) {
        toast.success('GDPR accepted thank you!');
        navigate(`/${user.role.toLowerCase()}/mainview`);
      } else {
        toast.error('There was error with your GDPR acceptance');
      }
    }
  };
  /**
   * Handles the decline of the GDPR terms.
   * It removes the user token from local storage, sets the user to null, and navigates to the home page.
   */
  const handleDecline = () => {
    toast.success('GDPR declined bye!');
    localStorage.removeItem('userToken');
    setUser(null);
    navigate('/');
  };

  return (
    <div>
      <div className='flex flex-col items-center justify-center w-full'>
        {user?.gdpr === 0 ? (
          <div className='p-6 m-4 bg-white rounded max-h-[30em] overflow-y-scroll shadow-md w-full flex flex-col gap-5 sm:w-3/4 md:w-1/2 2xl:w-1/4 xl:w-1/3'>
            <h2 className='mb-5 text-xl font-semibold'>
              Metropolia Attendance App - GDPR Privacy Policy
            </h2>
            <h3 className='text-lg font-semibold'>1. Introduction</h3>
            <p>
              Thank you for using the Metropolia Attendance App ("the App").
              This Privacy Policy outlines how we collect, use, disclose, and
              manage your personal data in accordance with the General Data
              Protection Regulation (GDPR) and other relevant data protection
              laws.
            </p>
            <h3 className='text-lg font-semibold'>2. Data Controller </h3>
            <p>
              The data controller for the processing of your personal data is
              [Your Company Name], registered at [Your Address]. If you have any
              questions or concerns regarding your data, you can contact us at
              [Your Contact Information].
            </p>
            <h3 className='text-lg font-semibold'>
              3. Types of Data Collected
            </h3>
            <p>
              The Metropolia Attendance App collects the following types of
              personal data:
            </p>
            <ul className='flex flex-col gap-2'>
              <li>
                <label className='font-semibold'>
                  User Account Information:
                </label>{' '}
                Name, email address, student ID, and other relevant
                identification information.
              </li>
              <li>
                <label className='font-semibold'> Attendance Data: </label>
                Information related to student attendance, including date, time,
                and location.
              </li>
            </ul>
            <h3 className='text-lg font-semibold'>
              4. Purpose of Data Processing
            </h3>
            <p>We process your personal data for the following purposes:</p>
            <ul className='flex flex-col gap-2'>
              <li>
                <label className='font-semibold'>Attendance Tracking: </label>To
                record and manage student attendance efficiently.
              </li>
              <li>
                <label className='font-semibold'>User Authentication: </label>To
                ensure secure access to the App.
              </li>
              <li>
                <label className='font-semibold'>Communication: </label>To send
                important updates, notifications, and announcements.
              </li>
            </ul>
            <h3 className='text-lg font-semibold'>
              5. Legal Basis for Processing
            </h3>
            <p>
              The processing of your personal data is based on the necessity for
              the performance of a contract (attendance tracking) and the
              legitimate interest of the data controller.
            </p>
            <h3 className='text-lg font-semibold'>6. Data Sharing</h3>
            <p>We may share your personal data with:</p>
            <ul className='flex flex-col gap-2'>
              <li>
                <label className='font-semibold'>
                  Educational Institutions:{' '}
                </label>
                To facilitate attendance tracking and reporting.
              </li>
              <li>
                <label className='font-semibold'>Service Providers: </label>For
                technical and operational support.
              </li>
            </ul>
            <p>
              We will not sell or lease your personal data to third parties.
            </p>
            <h3 className='text-lg font-semibold'>7. Data Security</h3>
            <p>
              We implement appropriate technical and organizational measures to
              protect your personal data from unauthorized access, disclosure,
              alteration, and destruction.
            </p>
            <h3 className='text-lg font-semibold'>8. Data Retention</h3>
            <p>
              We will retain your personal data for as long as necessary to
              fulfill the purposes outlined in this Privacy Policy or as
              required by law.
            </p>
            <h3 className='text-lg font-semibold'>9. Your Rights</h3>
            <p>You have the right to:</p>
            <ul className='flex flex-col gap-2'>
              <li className='font-semibold'>Access your personal data.</li>
              <li className='font-semibold'>
                Rectify inaccuracies in your personal data.
              </li>
              <li className='font-semibold'>Erase your personal data.</li>
              <li className='font-semibold'>
                Restrict the processing of your personal data.
              </li>
              <li className='font-semibold'>
                Object to the processing of your personal data.
              </li>
            </ul>
            <p>
              To exercise these rights, please contact us at [Your Contact
              Information].
            </p>
            <h3 className='text-lg font-semibold'>
              10. Changes to the Privacy Policy
            </h3>
            <p>
              We may update this Privacy Policy from time to time. Any changes
              will be communicated to you through the App or other appropriate
              channels.
            </p>
            <p>
              By using the Metropolia Attendance App, you consent to the terms
              of this Privacy Policy.
            </p>
            <p className='mb-4 text-lg font-semibold'>
              Do you accept the GDPR terms for your account?
            </p>
            <div className='flex justify-between'>
              <button
                onClick={handleDecline}
                type='button'
                className='px-4 py-2 text-white bg-red-500 rounded hover:bg-red-700'>
                Decline
              </button>
              <button
                type='button'
                onClick={handleAccept}
                className='px-4 py-2 text-white rounded bg-metropoliaTrendGreen hover:bg-green-700'>
                Accept
              </button>
            </div>
          </div>
        ) : (
          <CircularProgress />
        )}
      </div>
    </div>
  );
};

export default Gdpr;
