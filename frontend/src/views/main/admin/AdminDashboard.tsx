import React from 'react';
import {Link, Route, Routes, useLocation} from 'react-router-dom';
import AdminErrorLogs from './AdminErrorLogs';
import AdminFeedback from './AdminFeedback';
import AdminGuide from './AdminGuide';
import AdminLogs from './AdminLogs';
import AdminStats from './AdminStats';
import HelpIcon from '@mui/icons-material/Help';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ErrorIcon from '@mui/icons-material/Error';
import FeedbackIcon from '@mui/icons-material/Feedback';
import {useTranslation} from 'react-i18next';

const AdminDashboard = () => {
  const {t} = useTranslation();
  const location = useLocation();

  const isActivePath = (path: string) => {
    return location.pathname === `/admin/dashboard/${path}`;
  };

  const navItems = [
    {path: '/admin/dashboard/', label: 'Guide', icon: <HelpIcon />},
    {
      path: '/admin/dashboard/stats',
      label: 'Statistics',
      icon: <QueryStatsIcon />,
    },
    {path: '/admin/dashboard/logs', label: 'Logs', icon: <ListAltIcon />},
    {
      path: '/admin/dashboard/errorlogs',
      label: 'Error Logs',
      icon: <ErrorIcon />,
    },
    {
      path: '/admin/dashboard/user-feedback',
      label: 'User Feedback',
      icon: <FeedbackIcon />,
    },
  ];

  return (
    <div className='flex flex-col w-full p-4 transition-all duration-300 ease-in-out shadow-lg rounded-xl bg-slate-50'>
      <h2 className='p-3 mb-6 text-3xl font-bold text-center border-b text-metropolia border-metropolia/20'>
        {t('admin.dashboard.title')}
      </h2>
      <div className='flex flex-col gap-4 md:flex-row'>
        <nav className='w-full p-4 bg-white border shadow-md md:w-60 rounded-xl border-metropoliaMainGrey/10'>
          <ul className='space-y-2'>
            {navItems.map((item) => (
              <li key={item.path} className='overflow-hidden rounded-lg'>
                <Link
                  to={item.path}
                  className={` py-3 px-6 transition-all duration-200 ease-in-out flex items-center gap-3
                    ${
                      isActivePath(item.path)
                        ? 'bg-metropoliaMainGrey text-white shadow-md transform scale-102'
                        : 'text-metropoliaMainGrey hover:bg-metropoliaMainGrey/10'
                    }
                    hover:shadow-md hover:translate-x-1
                  `}>
                  <span className='w-6 h-6'>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <main className='flex-grow p-6 transition-all duration-300 ease-in-out bg-white shadow-md rounded-xl hover:shadow-lg'>
          <Routes>
            <Route index element={<AdminGuide />} />
            <Route path='stats' element={<AdminStats />} />
            <Route path='logs' element={<AdminLogs />} />
            <Route path='user-feedback' element={<AdminFeedback />} />
            <Route path='errorlogs' element={<AdminErrorLogs />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
