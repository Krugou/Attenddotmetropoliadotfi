import React from 'react';
import NavigationCard from '../../../components/ui/cards/NavigationCard.tsx';
import FeedbackCard from '../../../components/features/feedback/FeedbackCard.tsx';
import MainViewTitle from '../../../components/ui/titles/MainViewTitle.tsx';
import {People, Help, Assessment, PersonAdd} from '@mui/icons-material';
import {useTranslation} from 'react-i18next';
import WelcomeModal from '../../../components/ui/modals/WelcomeModal';
import OpenDataTest from '../../../components/features/system/OpenDataTest.tsx';

/**
 * CounselorMainView component.
 * This component is responsible for rendering the main view for counselors.
 * It renders a MainViewTitle component and a grid of NavigationCard components.
 * Each NavigationCard component represents a different functionality available to counselors.
 *
 * @returns {JSX.Element} The rendered CounselorMainView component.
 */
const CounselorMainView: React.FC = () => {
  const {t} = useTranslation(['counselor']);
  return (
    <>
      <MainViewTitle />
      <OpenDataTest token={localStorage.getItem('userToken') || ''} />
      <div className='grid grid-cols-1 gap-4 p-5 ml-auto mr-auto sm:grid-cols-2 lg:grid-cols-3 w-fit'>
        <NavigationCard
          path='/counselor/students'
          title={t('counselor:mainView.students')}
          description={t('counselor:mainView.studentsDesc')}
          icon={People}
        />

        <NavigationCard
          path='/counselor/helpvideos'
          title={t('counselor:mainView.instructions')}
          description={t('counselor:mainView.instructionsDesc')}
          icon={Help}
        />
        <NavigationCard
          path='/counselor/courses/stats'
          title={t('counselor:mainView.attendanceStatistics')}
          description={t('counselor:mainView.attendanceStatisticsDesc')}
          icon={Assessment}
        />
        <NavigationCard
          path='/counselor/lateenrollment'
          title={t('counselor:mainView.lateEnrollment')}
          description={t('counselor:mainView.lateEnrollmentDesc')}
          icon={PersonAdd}
        />
        <NavigationCard
          path='/counselor/activity'
          title={t('counselor:mainView.activity')}
          description={t('counselor:mainView.activityDesc')}
          icon={Assessment}
        />
        <FeedbackCard role='counselor' />
      </div>
      <WelcomeModal storageKey='welcomeModal.v1' />
    </>
  );
};

export default CounselorMainView;
