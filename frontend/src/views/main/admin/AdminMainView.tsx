import React from 'react';
import MainViewTitle from '../../../components/ui/titles/MainViewTitle.tsx';
import WelcomeModal from '../../../components/ui/modals/WelcomeModal';
import OpenDataTest from '../../../components/features/system/OpenDataTest.tsx';
import AdminCardGrid from '../../../components/internal/admin/AdminMainView/AdminCardGrid';

/**
 * AdminMainView component.
 * Renders the admin home view with cards and utilities.
 */
const AdminMainView: React.FC = () => {
  return (
    <>
      <MainViewTitle />
      <OpenDataTest token={localStorage.getItem('userToken') || ''} />
      <AdminCardGrid />
      <WelcomeModal storageKey='welcomeModal.v1' />
    </>
  );
};

export default AdminMainView;

/* OLD CODE STARTS HERE import React from 'react';
import NavigationCard from '../../../components/main/cards/NavigationCard';
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
 * Each cards includes a path to the task, a title, and a description.
 *
 * @returns {JSX.Element} The rendered AdminMainView component.
 */
/*const AdminMainView: React.FC = () => {
  const {t} = useTranslation(['admin']);
  return (
    <>
      <MainViewTitle role={'Admin'} />
      <OpenDataTest token={localStorage.getItem('userToken') || ''} />

      <div className='grid grid-cols-1 gap-4 p-5 ml-auto mr-auto sm:grid-cols-2 lg:grid-cols-3 w-fit'>
        <NavigationCard
          path='/admin/other-dashboards/'
          title={t('admin:mainView.otherDashboards')}
          description={t('admin:mainView.otherDashboardsDesc')}
          icon={Dashboard}
        />

        <NavigationCard
          path='/admin/users/'
          title={t('admin:mainView.userManagement')}
          description={t('admin:mainView.userManagementDesc')}
          icon={People}
        />
        <NavigationCard
          path='/admin/newuser/'
          title={t('admin:mainView.userRegistration')}
          description={t('admin:mainView.userRegistrationDesc')}
          icon={PersonAdd}
        />
        <NavigationCard
          path='/admin/TeacherLectures/'
          title={t('admin:mainView.lectureManagement')}
          description={t('admin:mainView.lectureManagementDesc')}
          icon={Event}
        />
        <NavigationCard
          path='/admin/courses/'
          title={t('admin:mainView.courseManagement')}
          description={t('admin:mainView.courseManagementDesc')}
          icon={Event}
        />
        <NavigationCard
          path='/admin/worklog/'
          title={t('admin:mainView.workLog')}
          description={t('admin:mainView.workLogDesc')}
          icon={Event}
        />
        <NavigationCard
          path='/admin/settings/'
          title={t('admin:mainView.serverConfiguration')}
          description={t('admin:mainView.serverConfigurationDesc')}
          icon={Settings}
        />
        <NavigationCard
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

export default AdminMainView;*/
