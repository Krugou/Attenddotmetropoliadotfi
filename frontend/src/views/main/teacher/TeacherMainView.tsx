import CircularProgress from '@mui/material/CircularProgress';
import React, {useContext, useEffect, useState} from 'react';
import Card from '../../../components/main/cards/Card';
import FeedbackCard from '../../../components/main/cards/FeedbackCard';
import CheckOpenLectures from '../../../components/main/course/attendance/CheckOpenLectures';
import WelcomeModal from '../../../components/main/modals/WelcomeModal';
import MainViewTitle from '../../../components/main/titles/MainViewTitle';
import {UserContext} from '../../../contexts/UserContext';
import apihooks from '../../../api';
import {
  Add,
  Help,
  People,
  School,
  Assessment,
  QrCode,
  Timeline,
  PersonAdd,
} from '@mui/icons-material';
import {useTranslation} from 'react-i18next';

/**
 * MainView component.
 * This component is responsible for rendering the main view for a teacher.
 * It uses the UserContext to get the current user and displays a loading spinner until the user data is available.
 * It also fetches the courses taught by the teacher and displays them in cards.
 */
const MainView: React.FC = () => {
  const {user} = useContext(UserContext);
  const {t} = useTranslation();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    /**
     * Fetches the courses taught by the teacher.
     * It sends a GET request to the courses endpoint with the teacher's email,
     * and updates the state with the fetched courses.
     */
    const fetchCourses = async () => {
      if (user) {
        // Get token from local storage
        const token: string | null = localStorage.getItem('userToken');
        if (!token) {
          throw new Error('No token available');
        }
        // Fetch courses by instructor email
        const fetchedCourses = await apihooks.getAllCoursesByInstructorEmail(
          user.email,
          token,
        );
        setCourses(fetchedCourses);
      }
      setIsLoading(false);
    };
    fetchCourses();
  }, [user]);

  return (
    <>
      <MainViewTitle role={'Teacher'} />
      {isLoading ? (
        <div className='flex items-center justify-center'>
          <CircularProgress />
        </div>
      ) : (
        <>
          <div
            className={`${
              courses.length === 0
                ? 'flex flex-col md:flex-row flex-wrap'
                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            } p-5 justify-center items-center gap-4`}>
            {courses.length === 0 && (
              <div>
                <div className='flex flex-col items-center gap-1 p-2 rounded-md animate-bounce bg-metropoliaMainOrange md:flex-row'>
                  <p className='text-lg text-center text-white'>
                    {t('teacher.mainView.startHere')}
                  </p>
                  <div className='w-4 h-4 transform border-t-2 border-r-2 border-white md:rotate-45 rotate-135'></div>
                </div>
              </div>
            )}
            <Card
              path='/teacher/courses/create'
              title={t('teacher.mainView.cards.createCourse.title')}
              description={t('teacher.mainView.cards.createCourse.description')}
              icon={Add}
            />

            {courses.length >= 0 && (
              <Card
                path='/teacher/helpvideos'
                title={t('teacher.mainView.cards.instructions.title')}
                description={t(
                  'teacher.mainView.cards.instructions.description',
                )}
                icon={Help}
              />
            )}

            {courses.length > 0 && (
              <>
                <Card
                  path='/teacher/students'
                  title={t('teacher.mainView.cards.manageStudents.title')}
                  description={t(
                    'teacher.mainView.cards.manageStudents.description',
                  )}
                  icon={People}
                />

                <Card
                  path='/teacher/courses/'
                  title={t('teacher.mainView.cards.yourCourses.title')}
                  description={t(
                    'teacher.mainView.cards.yourCourses.description',
                  )}
                  icon={School}
                />
                <CheckOpenLectures />

                <Card
                  path='/teacher/attendance/createlecture'
                  title={t('teacher.mainView.cards.createLecture.title')}
                  description={t(
                    'teacher.mainView.cards.createLecture.description',
                  )}
                  icon={QrCode}
                />
                <Card
                  path='/teacher/courses/stats'
                  title={t('teacher.mainView.cards.attendanceStats.title')}
                  description={t(
                    'teacher.mainView.cards.attendanceStats.description',
                  )}
                  icon={Assessment}
                />
                <Card
                  path='/teacher/lateenrollment'
                  title={t('teacher.mainView.cards.lateEnrollment.title')}
                  description={t(
                    'teacher.mainView.cards.lateEnrollment.description',
                  )}
                  icon={PersonAdd}
                />
              </>
            )}
            <Card
              path='/teacher/lectures'
              title={t('teacher.mainView.cards.lectureStats.title')}
              description={t('teacher.mainView.cards.lectureStats.description')}
              icon={Timeline}
            />
            {import.meta.env.MODE === 'development' && (
              <>
                <Card
                  path='/teacher/worklog/create'
                  title={t('teacher.mainView.cards.createWorkLogCourse.title')}
                  description={t(
                    'teacher.mainView.cards.createWorkLogCourse.description',
                  )}
                  icon={Add}
                />
                <Card
                  path='/teacher/worklog'
                  title={t('teacher.mainView.cards.yourWorkLogCourses.title')}
                  description={t(
                    'teacher.mainView.cards.yourWorkLogCourses.description',
                  )}
                  icon={School}
                />
              </>
            )}

            <FeedbackCard role='teacher' />
          </div>
          <WelcomeModal />
        </>
      )}
    </>
  );
};

export default MainView;
