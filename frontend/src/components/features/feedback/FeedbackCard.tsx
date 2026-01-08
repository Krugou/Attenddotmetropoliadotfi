import React from 'react';
import NavigationCard from '../../ui/cards/NavigationCard.tsx';
import {Support} from '@mui/icons-material';
import {useTranslation} from 'react-i18next';

interface FeedbackCardProps {
  role: string;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({role}) => {
  const {t} = useTranslation(['admin']);
  return (
    <NavigationCard
      path={'/' + role + '/feedback'}
      title={t('admin:feedback.title')}
      icon={Support}
      description={t('admin:feedback.description')}
    />
  );
};

export default FeedbackCard;


/*import React from 'react';
import NavigationCard from '../../../components/features/navigation/NavigationCard';
import { Support } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

type Role = 'admin' | 'teacher' | 'student';

interface FeedbackCardProps {
  role: Role;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({ role }) => {
  const { t } = useTranslation(['admin']);

  const pathByRole: Record<Role, string> = {
    admin: '/admin/feedbacks',     // tänne listaus
    teacher: '/teacher/feedback', // jos tarvitaan
    student: '/student/feedback',  // kirjoituslomake
  };

  return (
    <NavigationCard
      path={pathByRole[role]}
      title={t('admin:feedback.title')}
      description={t('admin:feedback.description')}
      icon={Support}
    />
  );
};

export default FeedbackCard;*/
