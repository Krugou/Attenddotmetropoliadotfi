import {
  Dashboard,
  People,
  PersonAdd,
  Event,
  Settings
} from '@mui/icons-material';

export const adminCardData = [
  {
    path: '/admin/other-dashboards/',
    titleKey: 'admin:mainView.otherDashboards',
    descriptionKey: 'admin:mainView.otherDashboardsDesc',
    icon: Dashboard
  },
  {
    path: '/admin/users/',
    titleKey: 'admin:mainView.userManagement',
    descriptionKey: 'admin:mainView.userManagementDesc',
    icon: People
  },
  {
    path: '/admin/newuser/',
    titleKey: 'admin:mainView.userRegistration',
    descriptionKey: 'admin:mainView.userRegistrationDesc',
    icon: PersonAdd
  },
  {
    path: '/admin/TeacherLectures/',
    titleKey: 'admin:mainView.lectureManagement',
    descriptionKey: 'admin:mainView.lectureManagementDesc',
    icon: Event
  },
  {
    path: '/admin/courses/',
    titleKey: 'admin:mainView.courseManagement',
    descriptionKey: 'admin:mainView.courseManagementDesc',
    icon: Event
  },
  {
    path: '/admin/worklog/',
    titleKey: 'admin:mainView.workLog',
    descriptionKey: 'admin:mainView.workLogDesc',
    icon: Event
  },
  {
    path: '/admin/settings/',
    titleKey: 'admin:mainView.serverConfiguration',
    descriptionKey: 'admin:mainView.serverConfigurationDesc',
    icon: Settings
  },
  {
    path: '/admin/dashboard/',
    titleKey: 'admin:mainView.serverDashboard',
    descriptionKey: 'admin:mainView.serverDashboardDesc',
    icon: Dashboard
  }
];
