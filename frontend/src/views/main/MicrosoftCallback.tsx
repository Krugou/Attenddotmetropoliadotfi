import React, {useContext, useEffect, useState} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import {toast} from 'react-toastify';
import {UserContext} from '../../contexts/UserContext';
import {authApi} from '../../api/auth';
import Loader from '../../utils/Loader';
import ErrorAlert from '../../components/main/ErrorAlert.tsx';

/**
 * MicrosoftCallback component.
 *
 * This component handles the OAuth callback from Microsoft Entra ID.
 * It extracts the authorization code from the URL, exchanges it for a token,
 * and then redirects the user to the appropriate page based on their role.
 *
 * @returns {JSX.Element} The rendered MicrosoftCallback component.
 */
const MicrosoftCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {setUser} = useContext(UserContext);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(true);

  useEffect(() => {
    // Extract the authorization code from the URL query parameters
    const params = new URLSearchParams(location.search);
    const code = params.get('code');

    if (!code) {
      setError('No authorization code received from Microsoft');
      setIsProcessing(false);
      return;
    }

    // Exchange the code for an access token
    const handleCallback = async () => {
      try {
        const response = await authApi.handleMicrosoftCallback(code);

        // Store the token and user info
        if (response && response.token) {
          localStorage.setItem('userToken', response.token);
          setUser(response.user);

          // Redirect based on user role and GDPR status
          if (
            response.user.gdpr === 0 &&
            response.user.role.toLowerCase() === 'student'
          ) {
            navigate('/gdpr');
          } else {
            navigate(`/${response.user.role.toLowerCase()}/mainview`);
          }
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (err) {
        console.error('Microsoft authentication error:', err);
        setError('Failed to authenticate with Microsoft. Please try again.');
        toast.error('Authentication failed');
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [location.search, navigate, setUser]);

  if (isProcessing) {
    return (
      <div className='w-full flex flex-col items-center justify-center min-h-[50vh]'>
        <h1 className='mb-6 text-center text-gray-800 text-2xl font-semibold'>
          Processing your login...
        </h1>
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className='w-full flex flex-col items-center justify-center min-h-[50vh]'>
        <h1 className='mb-6 text-center text-gray-800 text-2xl font-semibold'>
          Login Failed
        </h1>
        <ErrorAlert alert={error} onClose={() => setError(null)} />
        <button
          onClick={() => navigate('/login')}
          className='mt-4 px-4 py-2 bg-metropolia-main-orange text-white rounded-xl hover:bg-metropolia-secondary-orange'>
          Return to Login
        </button>
      </div>
    );
  }

  return null;
};

export default MicrosoftCallback;
