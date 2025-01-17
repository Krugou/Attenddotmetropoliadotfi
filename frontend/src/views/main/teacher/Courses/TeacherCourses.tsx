import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import React, {useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import GeneralLinkButton from '../../../../components/main/buttons/GeneralLinkButton';
import CourseData from '../../../../components/main/course/CourseData';
import {UserContext} from '../../../../contexts/UserContext';
import apihooks from '../../../../hooks/ApiHooks';
import {useTranslation} from 'react-i18next';

/**
 * Course interface.
 * This interface defines the shape of a Course object.
 */
interface Course {
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
const TeacherCourses: React.FC = () => {
  const {t} = useTranslation();
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
      <h2 className='p-3 ml-auto mr-auto text-3xl font-bold text-center bg-white rounded-lg w-fit xl:text-4xl'>
        {t('teacher.courses.title')}
      </h2>
      <div className='w-full p-5 m-auto mt-5 bg-gray-100 rounded-lg 2xl:w-3/4'>
        <div className='flex flex-col justify-between gap-5 sm:gap-0 sm:flex-row'>
          <GeneralLinkButton
            path={
              user?.role === 'admin'
                ? '/counselor/mainview'
                : `/${user?.role}/mainview`
            }
            text={t('teacher.courses.buttons.backToMainview')}
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
            label={t('teacher.courses.toggles.showEndedCourses')}
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
              {t('teacher.courses.buttons.addNewCourse')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherCourses;
