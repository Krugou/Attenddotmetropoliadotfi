import React from 'react';
import Card from '../../../components/main/cards/Card';
import FeedbackCard from '../../../components/main/cards/FeedbackCard';
import MainViewTitle from '../../../components/main/titles/MainViewTitle';
import {
  People,
  PersonAdd,
  Event,
  Settings,
  Dashboard,
} from '@mui/icons-material';
import {useTranslation} from 'react-i18next';
import WelcomeModal from '../../../components/main/modals/WelcomeModal';
import OpenDataTest from '../../../components/main/utils/OpenDataTest';

/**
 * AdminMainView component.
 * This component is responsible for rendering the main view for an admin.
 * It displays a grid of cards, each of which represents a different admin task.
 * Each card includes a path to the task, a title, and a description.
 *
 * @returns {JSX.Element} The rendered AdminMainView component.
 */
const AdminMainView: React.FC = () => {
  const {t} = useTranslation(['admin']);
  return (
    <>
      <MainViewTitle role={'Admin'} />
      <OpenDataTest token={localStorage.getItem('userToken') || ''} />

      <div className='grid grid-cols-1 gap-4 p-5 ml-auto mr-auto sm:grid-cols-2 lg:grid-cols-3 w-fit'>
        <Card
          path='/admin/other-dashboards/'
          title={t('admin:mainView.otherDashboards')}
          description={t('admin:mainView.otherDashboardsDesc')}
          icon={Dashboard}
        />

        <Card
          path='/admin/users/'
          title={t('admin:mainView.userManagement')}
          description={t('admin:mainView.userManagementDesc')}
          icon={People}
        />
        <Card
          path='/admin/newuser/'
          title={t('admin:mainView.userRegistration')}
          description={t('admin:mainView.userRegistrationDesc')}
          icon={PersonAdd}
        />
        <Card
          path='/admin/lectures/'
          title={t('admin:mainView.lectureManagement')}
          description={t('admin:mainView.lectureManagementDesc')}
          icon={Event}
        />
        <Card
          path='/admin/courses/'
          title={t('admin:mainView.courseManagement')}
          description={t('admin:mainView.courseManagementDesc')}
          icon={Event}
        />
        <Card
          path='/admin/worklog/'
          title={t('admin:mainView.workLog')}
          description={t('admin:mainView.workLogDesc')}
          icon={Event}
        />
        <Card
          path='/admin/settings/'
          title={t('admin:mainView.serverConfiguration')}
          description={t('admin:mainView.serverConfigurationDesc')}
          icon={Settings}
        />
        <Card
          path='/admin/dashboard/'
          title={t('admin:mainView.serverDashboard')}
          description={t('admin:mainView.serverDashboardDesc')}
          icon={Dashboard}
        />

        <FeedbackCard role='admin' />
      </div>
      <WelcomeModal storageKey='welcomeModal.v1' />
    </>
  );
};

export default AdminMainView;
