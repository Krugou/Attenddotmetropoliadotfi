import React from 'react';
import Card from './Card';
import {Support} from '@mui/icons-material';
import {useTranslation} from 'react-i18next';

interface FeedbackCardProps {
  role: string;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({role}) => {
  const {t} = useTranslation(['translation']);
  return (
    <Card
      path={'/' + role + '/feedback'}
      title={t('translation:admin.feedback.title')}
      icon={Support}
      description={t('translation:admin.feedback.description')}
    />
  );
};

export default FeedbackCard;
