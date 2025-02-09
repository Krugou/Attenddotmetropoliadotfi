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
  const {t} = useTranslation(['translation']);
  return (
    <>
      <MainViewTitle role={'Counselor'} />
      <div className='grid grid-cols-1 gap-4 p-5 ml-auto mr-auto sm:grid-cols-2 lg:grid-cols-3 w-fit'>
        <Card
          path='/counselor/students'
          title={t('translation:counselor.mainView.students')}
          description={t('translation:counselor.mainView.studentsDesc')}
          icon={People}
        />

        <Card
          path='/counselor/helpvideos'
          title={t('translation:counselor.mainView.instructions')}
          description={t('translation:counselor.mainView.instructionsDesc')}
          icon={Help}
        />
        <Card
          path='/counselor/courses/stats'
          title={t('translation:counselor.mainView.attendanceStatistics')}
          description={t(
            'translation:counselor.mainView.attendanceStatisticsDesc',
          )}
          icon={Assessment}
        />
        <Card
          path='/counselor/lateenrollment'
          title={t('translation:counselor.mainView.lateEnrollment')}
          description={t('translation:counselor.mainView.lateEnrollmentDesc')}
          icon={PersonAdd}
        />
        <FeedbackCard role='counselor' />
      </div>
      <WelcomeModal storageKey='welcomeModal.v1' />
    </>
  );
};

export default CounselorMainView;
