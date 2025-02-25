import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ServerStatusData} from '../../../../types/ServerStatus';
import {adminApi} from '../../../../api/admin';
import Loader from '../../../../utils/Loader';

const AdminServerStatus: React.FC = () => {
  const {t} = useTranslation(['admin']);
  const [status, setStatus] = useState<ServerStatusData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServerStatus = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) throw new Error('No token available');
        const data = await adminApi.getServerStatus(token);
        setStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    fetchServerStatus();
    const interval = setInterval(fetchServerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className='p-4 bg-metropolia-support-red/10 text-metropolia-support-red rounded-lg'>
        {error}
      </div>
    );
  }

  if (!status) {
    return <Loader />;
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatMemory = (bytes: number) => {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      <div className='bg-white p-6 rounded-xl shadow-md'>
        <h3 className='text-xl font-heading mb-4 text-metropolia-main-grey'>
          {t('admin:serverStatus.system')}
        </h3>
        <div className='space-y-3'>
          <p>
            <span className='font-medium'>
              {t('admin:serverStatus.uptime')}:
            </span>{' '}
            {formatUptime(status.system.uptime)}
          </p>
          <p>
            <span className='font-medium'>
              CPU {t('admin:serverStatus.usage')}:
            </span>{' '}
            {(status.system.cpuUsage * 100).toFixed(1)}%
          </p>
          <p>
            <span className='font-medium'>
              {t('admin:serverStatus.loadAverage')}:
            </span>{' '}
            {status.system.loadAverage.join(', ')}
          </p>
          <p>
            <span className='font-medium'>
              {t('admin:serverStatus.totalMemory')}:
            </span>{' '}
            {formatMemory(status.system.totalMemory)}
          </p>
          <p>
            <span className='font-medium'>
              {t('admin:serverStatus.freeMemory')}:
            </span>{' '}
            {formatMemory(status.system.freeMemory)}
          </p>
        </div>
      </div>

      <div className='bg-white p-6 rounded-xl shadow-md'>
        <h3 className='text-xl font-heading mb-4 text-metropolia-main-grey'>
          {t('admin:serverStatus.database')}
        </h3>
        <div className='space-y-3'>
          <p>
            <span className='font-medium'>
              {t('admin:serverStatus.uptime')}:
            </span>{' '}
            {formatUptime(status.database.uptime)}
          </p>
          <p>
            <span className='font-medium'>
              {t('admin:serverStatus.connections')}:
            </span>{' '}
            {status.database.connectionCount}
          </p>
          <p>
            <span className='font-medium'>
              {t('admin:serverStatus.threads')}:
            </span>{' '}
            {status.database.threadCount}
          </p>
          <p>
            <span className='font-medium'>
              {t('admin:serverStatus.queries')}:
            </span>{' '}
            {status.database.queryCount.toLocaleString()}
          </p>
          <p>
            <span className='font-medium'>
              {t('admin:serverStatus.slowQueries')}:
            </span>{' '}
            {status.database.slowQueries}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminServerStatus;
