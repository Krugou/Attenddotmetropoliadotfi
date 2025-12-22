import React, {useContext, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {QrCode} from '@mui/icons-material';

import NavigationCard from '../../../components/features/navigation/NavigationCard.tsx';
import WelcomeModal from '../../../components/ui/modals/WelcomeModal';
import MainViewTitle from '../../../components/ui/titles/MainViewTitle.tsx';
import {UserContext} from '../../../contexts/UserContext';
import OpenDataTest from '../../../components/features/system/OpenDataTest.tsx';

import TeacherTopNav from '../../../components/internal/teacher/TeacherTopNav';
import CheckOpenLectures from '../../../components/features/courses/attendance/CheckOpenLectures.tsx';

/**
 * Teacher MainView
 * - Yläpalkissa ryhmitelty valikko (Luennot, Kurssit, Tilastot, Opiskelijat, Ohjeet)
 * - "Luennot" -> tämä etusivu
 * - Näytetään opettajan nimi ja tämänhetkinen päivämäärä
 * - Jos avoimia luentoja: näytetään vilkkuva kortti/kortit
 * - Aina: iso "Luo uusi luento" -kortti keskellä
 */
const MainView: React.FC = () => {
  const {user} = useContext(UserContext);
  console.log('USER FROM CONTEXT:', user);

  // Käytetään globaalia t-funktiota ja annetaan namespace avaimessa (teacher:...)
  const {t, i18n} = useTranslation();

  console.log('LANG:', i18n.language);
  console.log('TEST greeting:', t('teacher:toasts.mainView.greeting'));
  console.log('TEST topNav.TeacherLectures:', t('teacher:topNav.TeacherLectures'));

  try {
    console.log(
      'teacher bundle object:',
      i18n.getResourceBundle(i18n.language || 'fi', 'teacher'),
    );
  } catch (e) {
    console.error('getResourceBundle error', e);
  }

  const displayName =
    (user as any)?.first_name ||
    user?.email ||
    '';

  const todayText = useMemo(() => {
    const today = new Date();
    const lang = i18n.language || 'fi-FI';

    const weekday = today.toLocaleDateString(lang, {
      weekday: 'long',
    });

    const date = today.toLocaleDateString(lang, {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });

    return `${weekday} ${date}`;
  }, [i18n.language]);


  return (
    <>
      <MainViewTitle />

      {/* Tekniset testit */}
      {user && (
        <div className="px-4 pt-2">
          <OpenDataTest token={localStorage.getItem('userToken') || ''} />
        </div>
      )}

      <div className="flex flex-col items-center w-full px-4 pb-10">
        {/* Yläpalkin valikko */}
        <TeacherTopNav t={t} />

        {/* Keskitetty greeting + avoimet luennot + luo uusi luento */}
        <div className="mt-6 w-full max-w-3xl mx-auto flex flex-col items-center">
          {/* Tervehdys + päivämäärä */}
          <div className="text-center">
            <h2 className="text-2xl font-bold">
              {displayName
                ? t('teacher:toasts.mainView.greetingWithName', {name: displayName})
                : t('teacher:toasts.mainView.greeting')}
            </h2>
            <p className="mt-1 text-gray-700">
              {t('teacher:toasts.mainView.todayIs', {date: todayText})}
            </p>
          </div>

          {/* Avoimet luennot + "Luo uusi luento" */}
          <div className="mt-8 w-full flex flex-col items-center">
            {/* Responsiivinen korttirivi:
                - mobile: päällekkäin
                - sm+: vierekkäin keskellä
                Jos CheckOpenLectures ei renderöi mitään, vasen flex-item on 0 leveä,
                jolloin "Luo uusi luento" pysyy keskellä. */}
            <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto sm:flex-row sm:justify-center sm:items-stretch">
              {/* Avoimet luennot (voi olla 0, 1 tai useampi kortti) */}
              <div className="flex flex-col gap-4">
                <CheckOpenLectures />
              </div>

              {/* Iso nappi "Luo uusi luento" */}
              <div className="flex justify-center">
                <div className="w-full max-w-md">
                  <NavigationCard
                    path="/teacher/attendance/createlecture"
                    title={t('teacher:mainView.cards.createLecture.title')}
                    description={t(
                      'teacher:mainView.cards.createLecture.description',
                    )}
                    icon={QrCode}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <WelcomeModal storageKey="welcomeModal.v1" />
    </>
  );
};

export default MainView;

/*import React, {useContext, useEffect, useState} from 'react';
import NavigationCard from '../../../components/features/navigation/NavigationCard.tsx';
import FeedbackCard from '../../../components/features/feedback/FeedbackCard.tsx';
import CheckOpenLectures from '../../../components/features/courses/attendance/CheckOpenLectures.tsx';
import WelcomeModal from '../../../components/ui/modals/WelcomeModal';
import MainViewTitle from '../../../components/ui/titles/MainViewTitle.tsx';
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
import OpenDataTest from '../../../components/features/system/OpenDataTest.tsx';
import Loader from '../../../utils/Loader';

/**
 * MainView component.
 * This component is responsible for rendering the main view for a teacher.
 * It uses the UserContext to get the current user and displays a loading spinner until the user data is available.
 * It also fetches the courses taught by the teacher and displays them in cards.
 */
/*const MainView: React.FC = () => {
  const {user} = useContext(UserContext);
  const {t} = useTranslation(['teacher']);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    /**
     * Fetches the courses taught by the teacher.
     * It sends a GET request to the courses endpoint with the teacher's email,
     * and updates the state with the fetched courses.
     */
   /* const fetchCourses = async () => {
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
          <Loader />
        </div>
      ) : (
        <>
          {user && (
            <OpenDataTest token={localStorage.getItem('userToken') || ''} />
          )}
          <div
            className={`${
              courses.length === 0
                ? 'flex flex-col md:flex-row flex-wrap'
                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            } p-5 justify-center items-center gap-4`}>
            {courses.length === 0 && (
              <div>
                <div className='flex flex-col items-center gap-1 p-2 rounded-md animate-bounce bg-metropolia-main-orange md:flex-row'>
                  <p className='text-lg text-center text-white'>
                    {t('teacher:mainView.startHere')}
                  </p>
                  <div className='w-4 h-4 transform border-t-2 border-r-2 border-white md:rotate-45 rotate-135'></div>
                </div>
              </div>
            )}
            <NavigationCard
              path='/teacher/courses/create'
              title={t('teacher:mainView.cards.createCourse.title')}
              description={t('teacher:mainView.cards.createCourse.description')}
              icon={Add}
            />

            {courses.length >= 0 && (
              <NavigationCard
                path='/teacher/helpvideos'
                title={t('teacher:mainView.cards.instructions.title')}
                description={t(
                  'teacher:mainView.cards.instructions.description',
                )}
                icon={Help}
              />
            )}

            {courses.length > 0 && (
              <>
                <NavigationCard
                  path='/teacher/students'
                  title={t('teacher:mainView.cards.manageStudents.title')}
                  description={t(
                    'teacher:mainView.cards.manageStudents.description',
                  )}
                  icon={People}
                />

                <NavigationCard
                  path='/teacher/courses/'
                  title={t('teacher:mainView.cards.yourCourses.title')}
                  description={t(
                    'teacher:mainView.cards.yourCourses.description',
                  )}
                  icon={School}
                />
                <CheckOpenLectures />

                <NavigationCard
                  path='/teacher/attendance/createlecture'
                  title={t('teacher:mainView.cards.createLecture.title')}
                  description={t(
                    'teacher:mainView.cards.createLecture.description',
                  )}
                  icon={QrCode}
                />
                <NavigationCard
                  path='/teacher/courses/stats'
                  title={t('teacher:mainView.cards.attendanceStats.title')}
                  description={t(
                    'teacher:mainView.cards.attendanceStats.description',
                  )}
                  icon={Assessment}
                />
                <NavigationCard
                  path='/teacher/lateenrollment'
                  title={t('teacher:mainView.cards.lateEnrollment.title')}
                  description={t(
                    'teacher:mainView.cards.lateEnrollment.description',
                  )}
                  icon={PersonAdd}
                />
              </>
            )}
            <NavigationCard
              path='/teacher/TeacherLectures'
              title={t('teacher:mainView.cards.lectureStats.title')}
              description={t('teacher:mainView.cards.lectureStats.description')}
              icon={Timeline}
            />
            <NavigationCard
              path='/teacher/courses/activity'
              title={t('teacher:mainView.cards.studentActivity.title')}
              description={t(
                'teacher:mainView.cards.studentActivity.description',
              )}
              icon={People}
            />

            <NavigationCard
              path='/teacher/worklog/create'
              title={t('teacher:mainView.cards.createWorkLogCourse.title')}
              description={t(
                'teacher:mainView.cards.createWorkLogCourse.description',
              )}
              icon={Add}
            />
            <NavigationCard
              path='/teacher/worklog'
              title={t('teacher:mainView.cards.yourWorkLogCourses.title')}
              description={t(
                'teacher:mainView.cards.yourWorkLogCourses.description',
              )}
              icon={School}
            />

            <FeedbackCard role='teacher' />
          </div>
          <WelcomeModal storageKey='welcomeModal.v1' />
        </>
      )}
    </>
  );
};

export default MainView;*/
