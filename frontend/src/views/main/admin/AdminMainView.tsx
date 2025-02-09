import React from 'react';
import Card from '../../../components/main/cards/Card';
import FeedbackCard from '../../../components/main/cards/FeedbackCard';
import MainViewTitle from '../../../components/main/titles/MainViewTitle';
import {
  School,
  SupervisorAccount,
  People,
  PersonAdd,
  Event,
  Settings,
  Dashboard,
} from '@mui/icons-material';
import {useTranslation} from 'react-i18next';
import WelcomeModal from '../../../components/main/modals/WelcomeModal';

/**
 * AdminMainView component.
 * This component is responsible for rendering the main view for an admin.
 * It displays a grid of cards, each of which represents a different admin task.
 * Each card includes a path to the task, a title, and a description.
 *
 * @returns {JSX.Element} The rendered AdminMainView component.
 */
const AdminMainView: React.FC = () => {
  const {t} = useTranslation(['translation']);
  return (
    <>
      <MainViewTitle role={'Admin'} />

      <div className='grid grid-cols-1 gap-4 p-5 ml-auto mr-auto sm:grid-cols-2 lg:grid-cols-3 w-fit'>
        <Card
          path='/teacher/mainview'
          title={t('translation:admin.mainView.teacherDashboard')}
          description={t('translation:admin.mainView.teacherDashboardDesc')}
          icon={School}
        />
        <Card
          path='/counselor/mainview'
          title={t('translation:admin.mainView.counselorDashboard')}
          description={t('translation:admin.mainView.counselorDashboardDesc')}
          icon={SupervisorAccount}
        />
        <Card
          path='/admin/courses/'
          title={t('translation:admin.mainView.courseManagement')}
          description={t('translation:admin.mainView.courseManagementDesc')}
          icon={Event}
        />
        <Card
          path='/admin/users/'
          title={t('translation:admin.mainView.userManagement')}
          description={t('translation:admin.mainView.userManagementDesc')}
          icon={People}
        />
        <Card
          path='/admin/newuser/'
          title={t('translation:admin.mainView.userRegistration')}
          description={t('translation:admin.mainView.userRegistrationDesc')}
          icon={PersonAdd}
        />
        <Card
          path='/admin/lectures/'
          title={t('translation:admin.mainView.lectureManagement')}
          description={t('translation:admin.mainView.lectureManagementDesc')}
          icon={Event}
        />
        <Card
          path='/admin/settings/'
          title={t('translation:admin.mainView.serverConfiguration')}
          description={t('translation:admin.mainView.serverConfigurationDesc')}
          icon={Settings}
        />
        <Card
          path='/admin/dashboard/'
          title={t('translation:admin.mainView.serverDashboard')}
          description={t('translation:admin.mainView.serverDashboardDesc')}
          icon={Dashboard}
        />
        <Card
          path='/admin/worklog/'
          title={t('translation:admin.mainView.workLog')}
          description={t('translation:admin.mainView.workLogDesc')}
          icon={Event}
        />
        {import.meta.env.MODE === 'development' && (
          <Card
            path='/student/'
            title={t('translation:admin.mainView.studentDashboard')}
            description={t('translation:admin.mainView.studentDashboardDesc')}
            icon={People}
          />
        )}
        <FeedbackCard role='admin' />
      </div>
      <WelcomeModal storageKey='welcomeModal.v1' />
    </>
  );
};

export default AdminMainView;
