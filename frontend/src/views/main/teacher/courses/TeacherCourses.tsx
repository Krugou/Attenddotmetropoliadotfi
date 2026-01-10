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
