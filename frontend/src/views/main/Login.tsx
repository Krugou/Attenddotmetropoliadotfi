import React, {useContext, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import ErrorAlert from '../../components/main/ErrorAlert.tsx';
import ServerStatus from '../../components/main/ServerStatus.tsx';
import {UserContext} from '../../contexts/UserContext.tsx';
import apiHooks from '../../hooks/ApiHooks.ts';
import {IconButton} from '@mui/material';
import {Visibility, VisibilityOff} from '@mui/icons-material';
import {z} from 'zod';
import {useTranslation} from 'react-i18next';

// Define Zod schema for login validation
const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .max(21, 'Username is too long'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Login component.
 *
 * This component is responsible for rendering the login form and handling the login process.
 * It uses the UserContext to set the user after a successful login.
 *
 * @returns {JSX.Element} The rendered Login component.
 */
const Login: React.FC = () => {
  const {t} = useTranslation();
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [alert, setAlert] = useState<string | null>('');
  const {setUser} = useContext(UserContext);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
  >({});

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
    setValidationErrors({});

    const inputs: LoginFormData = {
      username: usernameRef.current?.value || '',
      password: passwordRef.current?.value || '',
    };

    try {
      // Validate inputs
      const validatedInputs = loginSchema.parse(inputs);

      const response = await apiHooks.postLogin(validatedInputs);

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
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof LoginFormData, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as keyof LoginFormData] = err.message;
          }
        });
        setValidationErrors(errors);
        return;
      }
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
    <div className='w-full' role='main'>
      <h1 className='mb-6 font-semibold text-center text-gray-800 text-md sm:text-2xl'>
        {t('login.title', 'Sign in using your Metropolia Account')}
      </h1>
      {alert && <ErrorAlert onClose={() => setAlert(null)} alert={alert} />}
      <form
        onSubmit={handleSubmit}
        className='w-full px-8 pt-6 pb-8 mx-auto mb-4 bg-white shadow-md md:w-2/4 xl:w-1/4 sm:w-2/3 rounded-xl'
        noValidate>
        <div className='mb-4'>
          <label
            className='block mb-2 text-sm text-gray-700 font-heading sm:text-lg'
            htmlFor='username'>
            {t('login.username')} <span aria-hidden='true'>*</span>
            <span className='sr-only'>({t('common.required')})</span>
          </label>
          <input
            className={`w-full px-3 py-2 leading-tight text-gray-700 border shadow appearance-none rounded-3xl focus:outline-none focus:shadow-outline ${
              validationErrors.username ? 'border-red-500' : ''
            }`}
            id='username'
            type='text'
            ref={usernameRef}
            placeholder={t(
              'login.usernamePlaceholder',
              'Enter your Metropolia username',
            )}
            aria-label='Metropolia username'
            aria-required='true'
            aria-invalid={!!validationErrors.username}
            aria-describedby={
              validationErrors.username ? 'username-error' : undefined
            }
            autoCapitalize='none'
          />
          {validationErrors.username && (
            <p
              className='mt-1 text-sm text-red-500'
              id='username-error'
              role='alert'>
              {validationErrors.username}
            </p>
          )}
        </div>
        <div className='mb-6'>
          <label
            className='block mb-2 text-sm text-gray-700 font-heading sm:text-lg'
            htmlFor='password'>
            {t('login.password')} <span aria-hidden='true'>*</span>
            <span className='sr-only'>({t('common.required')})</span>
          </label>
          <div
            className='relative flex items-center justify-between gap-1'
            role='group'
            aria-labelledby='password-label'>
            <input
              className={`w-full px-3 py-2 mb-3 leading-tight text-gray-700 border shadow appearance-none rounded-3xl focus:outline-none focus:shadow-outline ${
                validationErrors.password ? 'border-red-500' : ''
              }`}
              id='password'
              type={showPassword ? 'text' : 'password'}
              ref={passwordRef}
              aria-label='Metropolia password'
              aria-required='true'
              aria-invalid={!!validationErrors.password}
              aria-describedby={
                validationErrors.password ? 'password-error' : undefined
              }
              placeholder={t(
                'login.passwordPlaceholder',
                'Enter your Metropolia password',
              )}
            />
            <IconButton
              aria-label={t(
                'login.togglePassword',
                `${showPassword ? 'Hide' : 'Show'} password`,
              )}
              onClick={handleClickShowPassword}
              edge='end'
              className='flex items-center justify-center p-2 m-2'
              size='medium'>
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </div>
          {validationErrors.password && (
            <p
              className='mt-1 text-sm text-red-500'
              id='password-error'
              role='alert'>
              {validationErrors.password}
            </p>
          )}
        </div>
        <div className='flex justify-center w-full'>
          <button
            className='w-1/2 px-4 py-2 text-white font-heading bg-metropoliaMainOrange hover:bg-metropoliaSecondaryOrange focus:ring-2 focus:ring-offset-2 focus:ring-metropoliaMainOrange rounded-xl focus:outline-none'
            type='submit'
            aria-label={t('login.signIn', 'Sign In')}>
            {t('login.signIn', 'Sign In')}
          </button>
        </div>
        <div className='mt-10 text-center'>
          <a
            href='https://wiki.metropolia.fi/pages/viewpage.action?pageId=14693500'
            className='font-medium text-blue-600 underline dark:text-blue-500 hover:no-underline focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            target='_blank'
            rel='noopener noreferrer'
            aria-label={t(
              'login.forgotPassword',
              'Reset your password (opens in new tab)',
            )}>
            {t('login.forgotPasswordLink', 'Forgot your password?')}
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
