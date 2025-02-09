import DangerousIcon from '@mui/icons-material/Dangerous';
import DoneIcon from '@mui/icons-material/Done';
import CircularProgress from '@mui/material/CircularProgress';
import React, {useEffect, useState} from 'react';
import {API_CONFIG} from '../../config';

const baseUrl = API_CONFIG.baseUrl;
import {useTranslation} from 'react-i18next';

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
    return <CircularProgress />;
  }

  if (import.meta.env.MODE === 'development') {
    return (
      <p className='p-2 m-2 bg-white rounded-xl'>
        {isServerOnline ? <DoneIcon /> : <DangerousIcon />}
      </p>
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
        <p className='p-2 m-2 rounded-xl'>
          <strong>{t('common:serverStatus.reloadNeeded')}</strong>
        </p>
      )}
    </>
  );
};

export default ServerStatus;
