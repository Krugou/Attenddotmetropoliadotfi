import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import {testOpenDataConnection} from '../../../utils/openDataTest.ts';

interface OpenDataTestProps {
  token: string;
}

const OpenDataTest: React.FC<OpenDataTestProps> = ({token}) => {
  const {t} = useTranslation(['common']);

  useEffect(() => {
    const checkOpenData = async () => {
      const isConnected = await testOpenDataConnection(token);
      if (!isConnected) {
        toast.error(t('errors.openDataConnectionFailed'), {
          toastId: 'opendata-error',
        });
      }
    };

    checkOpenData();
  }, [t, token]);

  return null; // This component doesn't render anything
};

export default OpenDataTest;
