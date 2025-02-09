import React from 'react';
import Card from './Card';
import {Support} from '@mui/icons-material';
import {useTranslation} from 'react-i18next';

interface FeedbackCardProps {
  role: string;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({role}) => {
  const {t} = useTranslation(['admin']);
  return (
    <Card
      path={'/' + role + '/feedback'}
      title={t('admin:feedback.title')}
      icon={Support}
      description={t('admin:feedback.description')}
    />
  );
};

export default FeedbackCard;
