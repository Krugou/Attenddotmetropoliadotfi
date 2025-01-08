import React from 'react';
import Card from './Card'; // replace with the actual path to your Card component

interface FeedbackCardProps {
  role: string;
  icon?: React.ComponentType<any>;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({role, icon}) => {
  return (
    <Card
      path={'/' + role + '/feedback'}
      title='Feedback'
      icon={icon}
      description='Give feedback to the developers'
    />
  );
};

export default FeedbackCard;
