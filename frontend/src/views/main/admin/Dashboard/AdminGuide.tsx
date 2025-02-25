import React from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import ListAltIcon from '@mui/icons-material/ListAlt';
import FeedbackIcon from '@mui/icons-material/Feedback';
import StorageIcon from '@mui/icons-material/Storage';

const AdminGuide = () => {
  const {t} = useTranslation(['admin']);

  const guideLinks = [
    {
      path: '/admin/dashboard/stats',
      icon: <QueryStatsIcon />,
      title: 'admin:guide.statistics',
      text: 'admin:guide.statisticsText',
    },
    {
      path: '/admin/dashboard/logs',
      icon: <ListAltIcon />,
      title: 'admin:guide.logs',
      text: 'admin:guide.logsText',
    },
    {
      path: '/admin/dashboard/user-feedback',
      icon: <FeedbackIcon />,
      title: 'admin:guide.userFeedback',
      text: 'admin:guide.userFeedbackText',
    },
    {
      path: '/admin/dashboard/server-status',
      icon: <StorageIcon />,
      title: 'admin:guide.serverStatus',
      text: 'admin:guide.serverStatusText',
    },
  ];

  return (
    <div className='p-4 bg-white rounded-lg shadow-md md:p-8 border border-metropolia-main-grey/10'>
      <h2 className='mb-6 text-2xl font-heading md:text-3xl text-metropolia-main-orange border-b border-metropolia-main-orange/20 pb-2'>
        {t('admin:guide.title')}
      </h2>
      <p className='mb-6 text-sm md:text-base text-metropolia-main-grey'>
        {t('admin:guide.guideText')}
      </p>
      <ul className='space-y-4 list-none'>
        {guideLinks.map((link) => (
          <li key={link.path}>
            <Link
              to={link.path}
              className='group block p-3 rounded-lg bg-metropolia-support-white hover:bg-metropolia-main-orange/5
                        transition-all duration-200 border border-metropolia-main-grey/10 hover:border-metropolia-main-orange/20'>
              <div className='flex items-center gap-2 mb-1'>
                <span className='text-metropolia-main-orange'>{link.icon}</span>
                <strong className='text-metropolia-main-orange group-hover:text-metropolia-main-orange-dark transition-colors'>
                  {t(link.title)}:
                </strong>
              </div>
              <span className='text-sm md:text-base text-metropolia-main-grey block pl-8'>
                {t(link.text)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminGuide;
