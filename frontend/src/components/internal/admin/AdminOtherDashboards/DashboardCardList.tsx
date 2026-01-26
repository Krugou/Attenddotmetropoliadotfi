import React from 'react';
import NavigationCard from '../../../ui/cards/NavigationCard.tsx';
import { School, SupervisorAccount, People } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const DashboardCardList: React.FC = () => {
  const { t } = useTranslation(['admin']);

  return (
    <div className='grid grid-cols-1 gap-4 p-5 ml-auto mr-auto sm:grid-cols-2 lg:grid-cols-3 w-fit'>
      <NavigationCard
        path='/teacher/mainview'
        title={t('admin:mainView.teacherDashboard')}
        description={t('admin:mainView.teacherDashboardDesc')}
        icon={School}
      />
      <NavigationCard
        path='/counselor/mainview'
        title={t('admin:mainView.counselorDashboard')}
        description={t('admin:mainView.counselorDashboardDesc')}
        icon={SupervisorAccount}
      />
      {import.meta.env.MODE === 'development' && (
        <NavigationCard
          path='/student/'
          title={t('admin:mainView.studentDashboard')}
          description={t('admin:mainView.studentDashboardDesc')}
          icon={People}
        />
      )}
    </div>
  );
};

export default DashboardCardList;
