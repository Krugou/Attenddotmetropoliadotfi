import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import React, {useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import CourseData from '../../../../components/features/courses/CourseData.tsx';
import {UserContext} from '../../../../contexts/UserContext';
import apihooks from '../../../../api';
import {useTranslation} from 'react-i18next';

interface Course {
  courseid: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  code: string;
  studentgroup_name: string;
  topic_names: string;
}

const TeacherCourses: React.FC = () => {
  const {t} = useTranslation('teacher'); // ✅ teacher namespace
  const {user, update, setUpdate} = useContext(UserContext);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showEndedCourses, setShowEndedCourses] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;

      const token = localStorage.getItem('userToken');
      if (!token) {
        console.error('No token available');
        return;
      }

      const fetched = await apihooks.getAllCoursesByInstructorEmail(
        user.email,
        token,
      );

      setCourses(fetched);
    };

    fetchCourses();
  }, [user, update]);

  const updateView = () => setUpdate(!update);

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[1250px] px-2 sm:px-4 lg:px-6">
        <section className="w-full bg-gray-100 rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
            <h1 className="text-2xl sm:text-3xl font-heading text-metropolia-main-grey">
              {t('courses.title')}
            </h1>

            <FormControlLabel
              control={
                <Switch
                  checked={showEndedCourses}
                  onChange={() => setShowEndedCourses(!showEndedCourses)}
                  color="primary"
                />
              }
              label={t('courses.toggles.showEndedCourses')}
            />
          </div>

          <div
            className="
              mt-4 sm:mt-6 w-full grid items-stretch justify-center
              gap-4 sm:gap-5 lg:gap-6
              grid-cols-[repeat(auto-fit,minmax(16rem,22rem))]
            "
          >
            {courses.length > 0 && (
              <CourseData
                courseData={courses}
                updateView={updateView}
                allCourses={true}
                showEndedCourses={showEndedCourses}
              />
            )}

            <div
              className="
                w-full max-w-[22rem]
                min-w-[14rem] sm:min-w-[22rem]
                mx-auto flex flex-col items-center justify-center
                rounded-2xl bg-gray-200 border border-dashed border-gray-400
                cursor-pointer transition-colors transition-transform
                duration-200 ease-out
                p-5 sm:p-6 min-h-[300px]
                hover:bg-gray-300 hover:-translate-y-0.5
              "
              onClick={() => navigate('/teacher/courses/create')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-8 h-8 mb-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>

              <span className="text-sm sm:text-base font-medium text-metropolia-main-grey">
                {t('courses.buttons.addNewCourse')}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TeacherCourses;

/*import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import React, {useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import GeneralLinkButton from '../../../../components/ui/buttons/GeneralLinkButton.tsx';
import CourseData from '../../../../components/features/courses/CourseData.tsx';
import {UserContext} from '../../../../contexts/UserContext';
import apihooks from '../../../../api';
import {useTranslation} from 'react-i18next';

/**
 * Course interface.
 * This interface defines the shape of a Course object.
 */
/*interface Course {
  courseid: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  code: string;
  studentgroup_name: string;
  topic_names: string;
  // Include other properties of course here
}
/**
 * TeacherCourses component.
 * This component is responsible for rendering the list of courses for a teacher.
 * It fetches the courses that the teacher is instructing and provides functionality for the teacher to navigate to the course creation view.
 */
/*const TeacherCourses: React.FC = () => {
  const {t} = useTranslation(['translation']);
  const {user} = useContext(UserContext);
  const [courses, setCourses] = useState<Course[]>([]); // Specify the type for courses
  const {update, setUpdate} = useContext(UserContext);
  const [showEndedCourses, setShowEndedCourses] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    const fetchCourses = async () => {
      if (user) {
        // Get token from local storage
        const token: string | null = localStorage.getItem('userToken');
        if (!token) {
          throw new Error('No token available');
        }
        // Fetch courses by instructor email
        const courses = await apihooks.getAllCoursesByInstructorEmail(
          user.email,
          token,
        );

        setCourses(courses);
      }
    };

    fetchCourses();
  }, [user, update]);

  const updateView = () => {
    setUpdate(!update);
  };
  return (
    <div className='w-full'>
      <h2 className='p-3 ml-auto mr-auto text-3xl text-center bg-white rounded-lg font-heading w-fit xl:text-4xl'>
        {t('teacher:courses.title')}
      </h2>
      <div className='w-full p-5 m-auto mt-5 bg-gray-100 rounded-lg 2xl:w-3/4'>
        <div className='flex flex-col justify-between gap-5 sm:gap-0 sm:flex-row'>
          <GeneralLinkButton
            path={
              user?.role === 'admin'
                ? '/counselor/mainview'
                : `/${user?.role}/mainview`
            }
            text={t('teacher:courses.buttons.backToMainview')}
          />
          <FormControlLabel
            control={
              <Switch
                checked={showEndedCourses}
                onChange={() => setShowEndedCourses(!showEndedCourses)}
                name='showEndedCourses'
                color='primary'
              />
            }
            label={t('teacher:courses.toggles.showEndedCourses')}
          />
        </div>
        <div className='grid max-h-[30em] mt-5 2xl:max-h-[50em] overflow-y-scroll w-full grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-4 m-auto'>
          {courses.length > 0 && (
            <CourseData
              courseData={courses}
              updateView={updateView}
              allCourses={true}
              showEndedCourses={showEndedCourses}
            />
          )}
          <div
            className='relative flex items-center justify-center p-5 mt-4 mb-4 bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300'
            onClick={() => navigate('/teacher/courses/create')}>
            <button className='flex flex-col items-center'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                className='w-8 h-8 mb-2'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                />
              </svg>
              {t('teacher:courses.buttons.addNewCourse')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherCourses;*/
