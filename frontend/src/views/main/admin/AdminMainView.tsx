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

/**
 * AdminMainView component.
 * This component is responsible for rendering the main view for an admin.
 * It displays a grid of cards, each of which represents a different admin task.
 * Each card includes a path to the task, a title, and a description.
 *
 * @returns {JSX.Element} The rendered AdminMainView component.
 */
const AdminMainView: React.FC = () => {
  const {t} = useTranslation();
  return (
    <>
      <MainViewTitle role={'Admin'} />

      <div className='grid grid-cols-1 gap-4 p-5 ml-auto mr-auto sm:grid-cols-2 lg:grid-cols-3 w-fit'>
        <Card
          path='/teacher/mainview'
          title={t('admin.mainView.teacherDashboard')}
          description={t('admin.mainView.teacherDashboardDesc')}
          icon={School}
        />
        <Card
          path='/counselor/mainview'
          title={t('admin.mainView.counselorDashboard')}
          description={t('admin.mainView.counselorDashboardDesc')}
          icon={SupervisorAccount}
        />
        <Card
          path='/admin/courses/'
          title={t('admin.mainView.courseManagement')}
          description={t('admin.mainView.courseManagementDesc')}
          icon={Event}
        />
        <Card
          path='/admin/users/'
          title={t('admin.mainView.userManagement')}
          description={t('admin.mainView.userManagementDesc')}
          icon={People}
        />
        <Card
          path='/admin/newuser/'
          title={t('admin.mainView.userRegistration')}
          description={t('admin.mainView.userRegistrationDesc')}
          icon={PersonAdd}
        />
        <Card
          path='/admin/lectures/'
          title={t('admin.mainView.lectureManagement')}
          description={t('admin.mainView.lectureManagementDesc')}
          icon={Event}
        />
        <Card
          path='/admin/settings/'
          title={t('admin.mainView.serverConfiguration')}
          description={t('admin.mainView.serverConfigurationDesc')}
          icon={Settings}
        />
        <Card
          path='/admin/dashboard/'
          title={t('admin.mainView.serverDashboard')}
          description={t('admin.mainView.serverDashboardDesc')}
          icon={Dashboard}
        />
        {import.meta.env.MODE === 'development' && (
          <>
            <Card
              path='/admin/worklog/'
              title={t('admin.mainView.workLog')}
              description={t('admin.mainView.workLogDesc')}
              icon={Event}
            />
            <Card
              path='/student/'
              title={t('admin.mainView.studentDashboard')}
              description={t('admin.mainView.studentDashboardDesc')}
              icon={People}
            />
          </>
        )}
        <FeedbackCard role='admin' />
      </div>
    </>
  );
};

export default AdminMainView;
