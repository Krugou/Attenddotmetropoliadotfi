import DangerousIcon from '@mui/icons-material/Dangerous';
import DoneIcon from '@mui/icons-material/Done';
import React, {useEffect, useState} from 'react';
import {API_CONFIG} from '../../config';

const baseUrl = API_CONFIG.baseUrl;
import {useTranslation} from 'react-i18next';
import Loader from '../../utils/Loader';

interface ServerResponse {
  builddate: string;
}
/**
 * ServerStatus component.
 *
 * This component fetches the server status and version information and displays it.
 *
 * @returns {JSX.Element} The rendered ServerStatus component.
 */
const ServerStatus: React.FC = () => {
  const {t} = useTranslation(['common']);
  // Define the URL for the VPN test page
  // const vpnTestUrl =
  // 	import.meta.env.MODE === 'development'
  // 		? 'http://localhost:3002'
  // 		: 'https://thweb.metropolia.fi/';
  const [isServerOnline, setIsServerOnline] = useState(false);
  const [newestVersion, setNewestVersion] = useState(false);
  const [loading, setLoading] = useState(true);
  // const [connectionStatus, setConnectionStatus] = useState(false);
  /**
   * Fetch the VPN test URL and set the connection status based on the response.
   */
  // useEffect(() => {
  // 	fetch(vpnTestUrl, {method: 'HEAD', mode: 'no-cors'})
  // 		.then(() => {
  // 			console.log('VPN test passed');
  // 			setConnectionStatus(true);
  // 		})
  // 		.catch(error => {
  // 			console.log('VPN test failed', error);
  // 			setConnectionStatus(false);
  // 		});
  // }, []);
  /**
   * Fetch the server status and version information and set the state variables based on the response.
   */
  useEffect(() => {
    fetch(baseUrl + 'metrostation/')
      .then((response) => response.json() as Promise<ServerResponse>)
      .then((data) => {
        const builddate = data.builddate;
        if (builddate === import.meta.env.VITE_REACT_APP_BUILD_DATE) {
          setNewestVersion(true);
        }
        setIsServerOnline(true);
      })
      .catch(() => {
        setIsServerOnline(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  if (loading) {
    return <Loader />;
  }

  if (import.meta.env.MODE === 'development') {
    return (
      <>
        <p className='p-2 m-2 bg-white rounded-xl'>
          {isServerOnline ? <DoneIcon /> : <DangerousIcon />}
        </p>
      </>
    );
  }

  return (
    <>
      <p className='text-xl font-medium animate-bounce '>
        {/* {connectionStatus
					? ''
					: 'You are not connected to Metropolia internal network'} */}
        {isServerOnline ? (
          ''
        ) : (
          <a
            href='https://wiki.metropolia.fi/display/itservices/VPN+Connection+via+GlobalProtect+Service'
            target='_blank'
            rel='noopener noreferrer'>
            {t('common:serverStatus.vpnNotConnected')}
          </a>
        )}
      </p>

      <div className='p-2 m-2 rounded-xl'>
        {isServerOnline && (
          <p className='p-2 m-2'>
            {t('common:serverStatus.version')}:{' '}
            {newestVersion ? <DoneIcon /> : <DangerousIcon />}
          </p>
        )}
        <p className='p-2 m-2'>
          {t('common:serverStatus.connection')}:{' '}
          {isServerOnline ? <DoneIcon /> : <DangerousIcon />}
        </p>
      </div>
      {!newestVersion && isServerOnline && (
        <div
          className='p-3 m-2 rounded-xl bg-gradient-to-r from-[#ff5000] to-[#e54b00] text-white shadow-lg transform hover:scale-105 transition-all'
          role='alert'
          aria-live='polite'>
          <div className='flex flex-col items-center justify-center'>
            <div className='animate-pulse mb-2'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-8 w-8'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                />
              </svg>
            </div>
            <strong className='text-lg font-heading'>
              {t('common:serverStatus.reloadNeeded')}
            </strong>
            <button
              onClick={() => window.location.reload()}
              className='mt-2 px-4 py-1 bg-white text-[#ff5000] rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-colors font-body'
              aria-label={t('common:serverStatus.refreshNow')}>
              {t('common:serverStatus.refreshNow')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ServerStatus;
