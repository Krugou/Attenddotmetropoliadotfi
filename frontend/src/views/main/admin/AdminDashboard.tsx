import React from 'react';
import {Link, Outlet, useLocation} from 'react-router-dom';
import HelpIcon from '@mui/icons-material/Help';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import ListAltIcon from '@mui/icons-material/ListAlt';
import FeedbackIcon from '@mui/icons-material/Feedback';
import StorageIcon from '@mui/icons-material/Storage';
import {useTranslation} from 'react-i18next';

/**
 * AdminDashboard component.
 * Provides navigation and layout for admin dashboard functionality.
 * @returns {JSX.Element} The rendered AdminDashboard component.
 */
const AdminDashboard = () => {
  const {t} = useTranslation(['admin']);
  const location = useLocation();

  const isActivePath = (path: string) => {
    return (
      location.pathname === path ||
      (path === '/admin/dashboard/' && location.pathname === '/admin/dashboard')
    );
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
      path: '/admin/dashboard/user-feedback',
      label: 'User Feedback',
      icon: <FeedbackIcon />,
    },
    {
      path: '/admin/dashboard/server-status',
      label: 'Server Status',
      icon: <StorageIcon />,
    },
  ];

  return (
    <div className='flex flex-col w-full p-4 transition-all duration-300 ease-in-out shadow-lg rounded-xl bg-slate-50'>
      <h2 className='p-3 mb-6 text-3xl font-heading text-center border-b text-metropolia border-metropolia/20'>
        {t('admin:dashboard.title')}
      </h2>
      <div className='flex flex-col gap-4'>
        <nav className='w-full p-4 bg-white border shadow-md rounded-xl border-metropolia-main-grey/10'>
          <ul className='flex flex-wrap gap-2 justify-center'>
            {navItems.map((item) => (
              <li key={item.path} className='overflow-hidden rounded-lg'>
                <Link
                  to={item.path}
                  className={` py-3 px-6 transition-all duration-200 ease-in-out flex items-center gap-3
                    ${
                      isActivePath(item.path)
                        ? 'bg-metropolia-main-grey text-white shadow-md transform scale-102'
                        : 'text-metropolia-main-grey hover:bg-metropolia-main-grey/10'
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
        <main className='grow p-6 transition-all duration-300 ease-in-out bg-white shadow-md rounded-xl hover:shadow-lg'>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
