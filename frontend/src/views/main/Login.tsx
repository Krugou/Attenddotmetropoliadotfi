import React, {useContext, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import ErrorAlert from '../../components/main/ErrorAlert.tsx';
import ServerStatus from '../../components/main/ServerStatus.tsx';
import {UserContext} from '../../contexts/UserContext.tsx';
import apiHooks from '../../hooks/ApiHooks.ts';
import {IconButton} from '@mui/material';
import {Visibility, VisibilityOff} from '@mui/icons-material';

/**
 * Login component.
 *
 * This component is responsible for rendering the login form and handling the login process.
 * It uses the UserContext to set the user after a successful login.
 *
 * @returns {JSX.Element} The rendered Login component.
 */
const Login: React.FC = () => {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [alert, setAlert] = useState<string | null>('');
  const {setUser} = useContext(UserContext);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  /**
   * Handles the form submission.
   * It sends a POST request to the login endpoint with the username and password,
   * and handles the response or any errors that occur.
   *
   * @param {React.FormEvent} event - The form event.
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const inputs = {
      username: usernameRef.current?.value || '',
      password: passwordRef.current?.value || '',
    };
    try {
      const response = await apiHooks.postLogin(inputs);
      console.log(
        '🚀 ~ file: Login.tsx:26 ~ handleSubmit ~ response:',
        response.user,
      );
      // this navigates to the mainview of the user type
      if (response) {
        localStorage.setItem('userToken', response.token);
        setUser(response.user); // set the user info into the context
        if (
          response.user.gdpr === 0 &&
          response.user.role.toLowerCase() === 'student'
        ) {
          navigate(`/gdpr`);
        } else {
          navigate(`/${response.user.role.toLowerCase()}/mainview`);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === '403') {
          setAlert('No Metropolia internal network connection');
        } else {
          setAlert(error.message);
        }
      } else {
        toast.error('Error logging in');
        console.log(error);
      }
    }
  };

  return (
    <div className='w-full'>
      <h2 className='mb-6 font-semibold text-center text-gray-800 text-md sm:text-2xl'>
        Sign in using your Metropolia Account
      </h2>
      {alert && <ErrorAlert onClose={() => setAlert(null)} alert={alert} />}
      <form
        onSubmit={handleSubmit}
        className='w-full px-8 pt-6 pb-8 mx-auto mb-4 bg-white shadow-md md:w-2/4 xl:w-1/4 sm:w-2/3 rounded-xl'>
        <div className='mb-4'>
          <label
            className='block mb-2 text-sm font-heading text-gray-700 sm:text-lg'
            htmlFor='username'>
            Username
          </label>
          <input
            className='w-full px-3 py-2 leading-tight text-gray-700 border shadow appearance-none rounded-3xl focus:outline-none focus:shadow-outline'
            id='username'
            type='text'
            ref={usernameRef}
            placeholder='Metropolia username'
            aria-label='Metropolia username'
            autoCapitalize='none'
          />
        </div>
        <div className='mb-6'>
          <label
            className='block mb-2 text-sm font-heading text-gray-700 sm:text-lg'
            htmlFor='password'>
            Password
          </label>
          <div className='flex items-center justify-between gap-1'>
            <input
              className='w-full px-3 py-2 mb-3 leading-tight text-gray-700 border shadow appearance-none rounded-3xl focus:outline-none focus:shadow-outline'
              id='password'
              type={showPassword ? 'text' : 'password'}
              ref={passwordRef}
              aria-label='Metropolia password'
              placeholder='Metropolia password'
            />
            <IconButton
              aria-label='toggle password visibility'
              title='Toggle password visibility'
              onClick={handleClickShowPassword}
              edge='end'
              className='flex items-center justify-center p-2 m-2'
              size='medium'>
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </div>
        </div>
        <div className='flex justify-center w-full'>
          <button
            className='w-1/2 px-4 py-2 font-heading text-white bg-metropoliaMainOrange hover:bg-metropoliaSecondaryOrange rounded-xl focus:outline-none focus:shadow-outline'
            onClick={handleSubmit}
            type='submit'
            aria-label='Sign In'>
            Sign In
          </button>
        </div>
        <div className='mt-10 text-center'>
          <a
            href='https://wiki.metropolia.fi/pages/viewpage.action?pageId=14693500'
            className='font-medium text-blue-600 underline dark:text-blue-500 hover:no-underline'>
            Forgot your password?
          </a>
        </div>
      </form>
      <div className='flex flex-col items-center justify-center'>
        <ServerStatus />
      </div>
    </div>
  );
};

export default Login;
