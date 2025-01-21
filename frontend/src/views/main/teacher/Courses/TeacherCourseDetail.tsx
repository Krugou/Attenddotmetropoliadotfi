import React, {useContext, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import GeneralLinkButton from '../../../../components/main/buttons/GeneralLinkButton';
import CourseData from '../../../../components/main/course/CourseData';
import {UserContext} from '../../../../contexts/UserContext';
import apihooks from '../../../../hooks/ApiHooks';
import {useTranslation} from 'react-i18next';
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
  const {t} = useTranslation();
  useEffect(() => {
    console.log(id);
    const fetchCourses = async () => {
      if (id) {
        const token: string | null = localStorage.getItem('userToken');
        if (!token) {
          throw new Error('No token available');
        }
        const courseData = await apihooks.getCourseDetailByCourseId(id, token);
        console.log(
          '🚀 ~ file: TeacherCourses.tsx:14 ~ fetchCourses ~ courses:',
          courseData,
        );
        setCourseData(courseData);
        console.log(courseData[0].name);
      }
    };

    fetchCourses();
  }, [id]);

  return (
    <div className='w-full'>
      <h2 className='p-3 ml-auto mr-auto text-2xl font-heading text-center bg-white rounded-lg w-fit'>
        {courseData && courseData[0].name} - {courseData && courseData[0].code}
      </h2>
      <div className='w-full mx-auto mt-4 bg-white rounded-lg shadow-lg sm:w-3/4 md:w-2/4 lg:w-2/5 2xl:w-1/5'>
        <div className='pt-5 pl-5'>
          <GeneralLinkButton
            path={
              user?.role === 'admin'
                ? '/counselor/courses'
                : `/${user?.role}/courses`
            }
            text={t('teacher.courseDetail.buttons.backToCourses')}
          />
        </div>
        {courseData && <CourseData courseData={courseData} />}
      </div>
    </div>
  );
};

export default TeacherCourseDetail;
