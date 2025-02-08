import React from 'react';
import Card from '../../../components/main/cards/Card';
import FeedbackCard from '../../../components/main/cards/FeedbackCard';
import MainViewTitle from '../../../components/main/titles/MainViewTitle';
import {People, Help, Assessment, PersonAdd} from '@mui/icons-material';
import {useTranslation} from 'react-i18next';
import WelcomeModal from '../../../components/main/modals/WelcomeModal';

/**
 * CounselorMainView component.
 * This component is responsible for rendering the main view for counselors.
 * It renders a MainViewTitle component and a grid of Card components.
 * Each Card component represents a different functionality available to counselors.
 *
 * @returns {JSX.Element} The rendered CounselorMainView component.
 */
const CounselorMainView: React.FC = () => {
  const {t} = useTranslation();
  return (
    <>
      <MainViewTitle role={'Counselor'} />
      <div className='grid grid-cols-1 gap-4 p-5 ml-auto mr-auto sm:grid-cols-2 lg:grid-cols-3 w-fit'>
        <Card
          path='/counselor/students'
          title={t('counselor.mainView.students')}
          description={t('counselor.mainView.studentsDesc')}
          icon={People}
        />

        <Card
          path='/counselor/helpvideos'
          title={t('counselor.mainView.instructions')}
          description={t('counselor.mainView.instructionsDesc')}
          icon={Help}
        />
        <Card
          path='/counselor/courses/stats'
          title={t('counselor.mainView.attendanceStatistics')}
          description={t('counselor.mainView.attendanceStatisticsDesc')}
          icon={Assessment}
        />
        <Card
          path='/counselor/lateenrollment'
          title={t('counselor.mainView.lateEnrollment')}
          description={t('counselor.mainView.lateEnrollmentDesc')}
          icon={PersonAdd}
        />
        <FeedbackCard role='counselor' />
      </div>
      <WelcomeModal storageKey='welcomeModal.v1' />
    </>
  );
};

export default CounselorMainView;
