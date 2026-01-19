import React, {useContext, useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import CourseData from '../../../../components/features/courses/CourseData.tsx';
import {UserContext} from '../../../../contexts/UserContext';
import apihooks from '../../../../api';
import {useTranslation} from 'react-i18next';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import Tooltip from '@mui/material/Tooltip';


/**
 * CourseDetail interface.
 * This interface defines the shape of a CourseDetail object.
 */
interface CourseDetail {
  courseid: string;
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  code: string;
  studentgroup_name: string;
  created_at: string;
  topic_names: string[];
  user_count: number;
  instructor_name: string;
}

/**
 * TeacherCourseDetail component.
 * This component is responsible for rendering the detailed view of a single course for a teacher.
 * It fetches the course details and provides functionality for the teacher to navigate back to the list of courses.
 */
const TeacherCourseDetail: React.FC = () => {
  const {id} = useParams<{id: string}>();
  const [courseData, setCourseData] = useState<CourseDetail | null>(null);
  const {user} = useContext(UserContext);
  const {t} = useTranslation(['translation']);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchCourses = async () => {
      if (id) {
        const token: string | null = localStorage.getItem('userToken');
        if (!token) {
          throw new Error('No token available');
        }
        const courseData = await apihooks.getCourseDetailByCourseId(id, token);
        setCourseData(courseData);
        console.log(courseData[0].name);
      }
    };

    fetchCourses();
  }, [id]);

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[900px] px-2 sm:px-4 lg:px-6">
        {/* Page container */}
        <section
          className="w-full bg-gray-100 rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm">
          {/* Header row */}
          <div className="relative flex items-center justify-center mb-6">
            {/* Takaisin */}
            <div className="absolute left-0">
              <Tooltip title={t('teacher:courseDetail.buttons.backToCourses')}>
                <button
                  onClick={() =>
                    navigate(
                      user?.role === 'admin'
                        ? '/counselor/courses'
                        : `/${user?.role}/courses`,
                    )
                  }
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full text-metropolia-main-orange hover:bg-metropolia-main-orange/10 transition-colors"
                  aria-label={t('teacher:courseDetail.buttons.backToCourses')}>
                  <ArrowBackRoundedIcon />
                </button>
              </Tooltip>
            </div>

            {/* Otsikko */}
            <h2
              className="text-2xl sm:text-3xl font-heading text-metropolia-main-grey">
              {t('teacher:courseDetail.title')}
            </h2>
          </div>

          {/* Single course card */}
          <div className="flex justify-center">
            <div className="w-full max-w-[520px]">
              {courseData &&
                <CourseData courseData={courseData} disableHover />}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TeacherCourseDetail;
