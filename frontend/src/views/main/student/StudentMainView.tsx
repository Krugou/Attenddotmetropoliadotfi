import React, {useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import Card from '../../../components/main/cards/Card';
import FeedbackCard from '../../../components/main/cards/FeedbackCard';
import MainViewTitle from '../../../components/main/titles/MainViewTitle';
import {
  QrCode,
  Person,
  School,
  Help,
  PhotoCamera,
  Work,
  Add,
} from '@mui/icons-material';
import {UserContext} from '../../../contexts/UserContext';
import apiHooks from '../../../api';
import WelcomeModal from '../../../components/main/modals/WelcomeModal';

/**
 * MainView component.
 *
 * This component is responsible for rendering the main view for a student. It performs the following operations:
 *
 * 1. Renders a title for the main view using the MainViewTitle component.
 * 2. Renders a grid of cards using the Card component. Each card represents a different feature available to the student:
 *    - Attendance QR Scanner: Allows the student to scan a QR code to mark attendance.
 *    - Your Profile: Allows the student to view their own profile.
 *    - Your Courses: Allows the student to view their own courses.
 *
 * Each card includes a path to the corresponding feature, a title, and a description.
 *
 * @returns A JSX element representing the main view component.
 */
const MainView: React.FC = () => {
  const {t} = useTranslation(['translation']);
  const {user} = useContext(UserContext);
  const [hasWorkLogCourses, setHasWorkLogCourses] = useState<boolean>(false);

  useEffect(() => {
    const checkWorkLogCourses = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token || !user?.email) return;

        const courses = await apiHooks.getActiveCoursesByStudentEmail(
          user.email,
          token,
        );
        setHasWorkLogCourses(courses.length > 0);
      } catch (error) {
        console.error('Error checking worklog courses:', error);
        setHasWorkLogCourses(false);
      }
    };

    checkWorkLogCourses();
  }, [user?.email]);

  return (
    <div className='w-full'>
      <MainViewTitle role={t('translation:student.mainView.title')} />
      <div className='grid items-center justify-center grid-cols-1 gap-4 p-5 m-auto sm:grid-cols-2 lg:grid-cols-3 w-fit'>
        <Card
          path='/student/qr'
          title={t('translation:student.mainView.qrScanner.title')}
          description={t('translation:student.mainView.qrScanner.description')}
          icon={QrCode}
        />
        <Card
          path='/student/profile'
          title={t('translation:student.mainView.profile.title')}
          description={t('translation:student.mainView.profile.description')}
          icon={Person}
        />
        <Card
          path='/student/courses'
          title={t('translation:student.mainView.courses.title')}
          description={t('translation:student.mainView.courses.description')}
          icon={School}
        />
        <Card
          path='/student/helpvideos'
          title={t('translation:student.mainView.instructions.title')}
          description={t(
            'translation:student.mainView.instructions.description',
          )}
          icon={Help}
        />
        <Card
          path='/student/aqr'
          title={t('translation:student.mainView.qrScannerCamera.title')}
          description={t(
            'translation:student.mainView.qrScannerCamera.description',
          )}
          icon={PhotoCamera}
        />
        {(import.meta.env.MODE === 'development' || hasWorkLogCourses) && (
          <>
            <Card
              path='/student/worklog'
              title={t('translation:student.mainView.workLog.title')}
              description={t(
                'translation:student.mainView.workLog.description',
              )}
              icon={Add}
            />
            <Card
              path='/student/worklogs'
              title={t('translation:student.mainView.workLogs.title')}
              description={t(
                'translation:student.mainView.workLogs.description',
              )}
              icon={Work}
            />
          </>
        )}
        <FeedbackCard role='student' />
      </div>
      <WelcomeModal storageKey='welcomeModal.v1' />
    </div>
  );
};

export default MainView;
