import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import React, {useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import StudentCourseGrid from '../../../components/main/course/StudentCourseGrid';
import {UserContext} from '../../../contexts/UserContext';
import apiHooks from '../../../hooks/ApiHooks';

/**
 * StudentCourses component.
 *
 * This component is responsible for rendering the courses for a student. It performs the following operations:
 *
 * 1. Fetches the user data from the UserContext.
 * 2. Fetches the course data for the user from the API.
 * 3. Renders the courses using the StudentCourseGrid component.
 * 4. Provides an option to show or hide ended courses.
 *
 * If an error occurs while fetching the course data, it renders an error message.
 *
 * @returns A JSX element representing the student courses component.
 */
const StudentCourses: React.FC = () => {
  const {t} = useTranslation();
  /**
   * Interface for the course data.
   *
   * This interface represents the structure of a course object in the application. It includes the following properties:
   *
   * @property {number} courseid - The unique identifier for the course.
   * @property {string} course_name - The name of the course.
   * @property {string} startDate - The start date of the course, represented as a string.
   * @property {string} endDate - The end date of the course, represented as a string.
   * @property {string} code - The code of the course.
   * @property {number | null} student_group - The student group associated with the course. If no student group is associated, this property is null.
   * @property {string} topic_names - The names of the topics covered in the course, represented as a string.
   * @property {string} selected_topics - The topics selected for the course, represented as a string.
   * @property {string} instructor_name - The name of the instructor for the course.
   * @property {number} usercourseid - The unique identifier for the user-course relationship.
   */
  interface Course {
    courseid: number;
    course_name: string;
    startDate: string;
    endDate: string;
    code: string;
    student_group: number | null;
    topic_names: string;
    selected_topics: string;
    instructor_name: string;
    usercourseid: number;
  }

  // State to keep track of the error
  const [error, setError] = useState<string | null>(null);

  // State to keep track of the courses
  const {user} = useContext(UserContext);

  // State to keep track of the courses
  const [courses, setCourses] = useState<Course[]>([]);

  // State to keep track of the show ended courses option
  const [showEndedCourses, setShowEndedCourses] = useState(false);

  // Fetch courses for the user
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token: string | null = localStorage.getItem('userToken');
        if (user && token !== null) {
          const data = await apiHooks.getAllCourseInfoByUserEmail(token);
          console.log(data, 'DATA');
          setCourses(data);
        }
      } catch (error) {
        setError('No Data Available');
      }
    };
    fetchCourses();
  }, [user]);

  if (error) {
    return <div>Error: {error}</div>;
  }
  return (
    <div className='flex flex-col items-center justify-center p-5 bg-gray-100 rounded-lg h-fit'>
      <h1 className='mb-8 text-2xl font-heading text-center sm:text-4xl'>
        {t('student.course.yourCourses')}
      </h1>
      <FormControlLabel
        control={
          <Switch
            checked={showEndedCourses}
            onChange={() => setShowEndedCourses(!showEndedCourses)}
            name='showEndedCourses'
            color='primary'
          />
        }
        label={t('student.course.showEndedCourses')}
      />
      <StudentCourseGrid
        courses={courses}
        showEndedCourses={showEndedCourses}
      />
    </div>
  );
};

export default StudentCourses;
