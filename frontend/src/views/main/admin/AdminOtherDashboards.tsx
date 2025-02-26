import React from 'react';
import Card from '../../../components/main/cards/Card';
import MainViewTitle from '../../../components/main/titles/MainViewTitle';
import {School, SupervisorAccount, People} from '@mui/icons-material';
import {useTranslation} from 'react-i18next';

/**
 * AdminOtherDashboards component.
 * This component displays cards for accessing different role-specific dashboards
 * that are available to administrators.
 *
 * @returns {JSX.Element} The rendered AdminOtherDashboards component.
 */
const AdminOtherDashboards: React.FC = () => {
  const {t} = useTranslation(['admin']);
  return (
    <>
      <MainViewTitle role={'Admin'} />
      <div className='grid grid-cols-1 gap-4 p-5 ml-auto mr-auto sm:grid-cols-2 lg:grid-cols-3 w-fit'>
        <Card
          path='/teacher/mainview'
          title={t('admin:mainView.teacherDashboard')}
          description={t('admin:mainView.teacherDashboardDesc')}
          icon={School}
        />
        <Card
          path='/counselor/mainview'
          title={t('admin:mainView.counselorDashboard')}
          description={t('admin:mainView.counselorDashboardDesc')}
          icon={SupervisorAccount}
        />
        {import.meta.env.MODE === 'development' && (
          <Card
            path='/student/'
            title={t('admin:mainView.studentDashboard')}
            description={t('admin:mainView.studentDashboardDesc')}
            icon={People}
          />
        )}
      </div>
    </>
  );
};

export default AdminOtherDashboards;
