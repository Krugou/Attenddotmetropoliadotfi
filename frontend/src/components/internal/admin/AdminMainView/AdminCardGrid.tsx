import React from 'react';
import { useTranslation } from 'react-i18next';
import NavigationCard from '../../../features/navigation/NavigationCard.tsx';
import FeedbackCard from '../../../features/feedback/FeedbackCard.tsx';
import { adminCardData } from './adminCardData.ts';

const AdminCardGrid: React.FC = () => {
  const { t } = useTranslation(['admin']);

  return (
    <div className='grid grid-cols-1 gap-4 p-5 ml-auto mr-auto sm:grid-cols-2 lg:grid-cols-3 w-fit'>
      {adminCardData.map(({ path, titleKey, descriptionKey, icon }) => (
        <NavigationCard
          key={path}
          path={path}
          title={t(titleKey)}
          description={t(descriptionKey)}
          icon={icon}
        />
      ))}
      <FeedbackCard role='admin' />
    </div>
  );
};

export default AdminCardGrid;
