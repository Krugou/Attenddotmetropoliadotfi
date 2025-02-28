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
 * In development mode, it allows faking the VPN connection status for testing purposes.
 *
 * @returns {JSX.Element} The rendered ServerStatus component.
 */
const ServerStatus: React.FC = () => {
  const {t} = useTranslation(['common']);
  // Define the URL for the VPN test page
  const vpnTestUrl = 'https://ip.metropolia.fi/';
  const [isServerOnline, setIsServerOnline] = useState(false);
  const [newestVersion, setNewestVersion] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState(false);
  // State for fake VPN connection in development mode
  const [fakeVpnEnabled, setFakeVpnEnabled] = useState(false);

  /**
   * Fetch the VPN test URL and check if the IP address starts with "10."
   * which indicates a successful Metropolia VPN connection.
   * In development mode, allow faking the VPN connection.
   */
  useEffect(() => {
    // Check if we're in development mode and should use fake VPN status
    if (import.meta.env.MODE === 'development') {
      // Check if fake VPN status is stored in localStorage
      const storedFakeVpn = localStorage.getItem('fakeVpnStatus');
      if (storedFakeVpn === 'true') {
        console.log('Using fake VPN connection status: Connected');
        setFakeVpnEnabled(true);
        setConnectionStatus(true);
        return;
      }
    }

    // Real VPN check
    fetch(vpnTestUrl)
      .then((response) => response.text())
      .then((data) => {
        // Check if the response contains an IP that starts with "10."
        const ipMatch = data.match(/Your IP-address is: (10\.\d+\.\d+\.\d+)/);
        if (ipMatch && ipMatch[1]) {
          console.log('VPN test passed - IP starts with 10.');
          setConnectionStatus(true);
        } else {
          console.log('VPN test failed - IP does not start with 10.');
          setConnectionStatus(false);
        }
      })
      .catch((error) => {
        console.log('VPN test failed', error);
        setConnectionStatus(false);
      });
  }, []);

  /**
   * Toggle the fake VPN connection status for local development
   */
  const toggleFakeVpn = () => {
    const newStatus = !fakeVpnEnabled;
    setFakeVpnEnabled(newStatus);
    setConnectionStatus(newStatus);
    localStorage.setItem('fakeVpnStatus', newStatus.toString());
    console.log(`Fake VPN connection ${newStatus ? 'enabled' : 'disabled'}`);
  };

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
      <div className='p-2 m-2 bg-white rounded-xl'>
        <p>
          Server: {isServerOnline ? <DoneIcon /> : <DangerousIcon />}
          <br />
          VPN: {connectionStatus ? <DoneIcon /> : <DangerousIcon />}
        </p>
        <button
          onClick={toggleFakeVpn}
          className={`mt-2 p-1 text-xs rounded ${
            fakeVpnEnabled
              ? 'bg-metropolia-support-red text-white'
              : 'bg-metropolia-trend-green text-white'
          }`}>
          {fakeVpnEnabled ? 'Disable fake VPN' : 'Enable fake VPN'}
        </button>
      </div>
    );
  }

  // Production mode rendering
  return (
    <>
      <p className='text-xl font-medium animate-bounce '>
        {!connectionStatus && (
          <a
            href='https://wiki.metropolia.fi/display/itservices/VPN+Connection+via+GlobalProtect+Service'
            target='_blank'
            rel='noopener noreferrer'>
            {t('common:serverStatus.vpnNotConnected')}
          </a>
        )}
        {connectionStatus && !isServerOnline && (
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
        <p className='p-2 m-2'>
          {t('common:serverStatus.vpnConnection')}:{' '}
          {connectionStatus ? <DoneIcon /> : <DangerousIcon />}
        </p>
      </div>
      {!newestVersion && isServerOnline && (
        <p className='p-2 m-2 rounded-xl'>
          <strong>{t('common:serverStatus.reloadNeeded')}</strong>
        </p>
      )}
      {connectionStatus && (
        <p className='p-2 m-2 text-sm text-metropolia-support-blue'>
          {t(
            'common:serverStatus.vpnConnected',
            'Connected to Metropolia internal network',
          )}
        </p>
      )}
    </>
  );
};

export default ServerStatus;
