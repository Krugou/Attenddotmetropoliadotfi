import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import React, {useContext, useEffect, useState} from 'react';
import {useParams, useLocation} from 'react-router-dom';
import {toast} from 'react-toastify';
import GeneralLinkButton from '../../../../components/main/buttons/GeneralLinkButton';
import StudentCourseGrid from '../../../../components/main/course/StudentCourseGrid';
import ProfileInfo from '../../../../components/profiles/ProfileInfo';
import {UserContext} from '../../../../contexts/UserContext';
import apiHooks from '../../../../api';

/**
 * StudentInfo interface.
 * This interface defines the shape of a StudentInfo object.
 */
interface StudentInfo {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  roleid: number;
  staff: number;
  studentnumber: string;
  userid: number;
  username: string;
  created_at: string;
  // Include other properties of student here
}
/**
 * Course interface.
 * This interface defines the shape of a Course object.
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
/**
 * Student interface.
 * This interface defines the shape of a Student object.
 */
interface Student {
  // Existing properties...

  user: StudentInfo; // Replace 'any' with the actual type of 'user'
  courses: Course[];
}
/**
 * TeacherStudentDetail component.
 * This component is responsible for rendering the detailed view of a single student for a teacher.
 * It fetches the student's information and the courses they are enrolled in.
 * It also provides functionality for the teacher to add or remove the student from a course.
 */
const TeacherStudentDetail: React.FC = () => {
  const {id} = useParams<{id: string}>();
  const [student, setStudent] = useState<StudentInfo | null>(null); // Define the student state variable as a Student object
  const [courses, setCourses] = useState<Course[]>([]); // Define the courses state variable as an array of Course objects
  const {user, update, setUpdate} = useContext(UserContext);
  const token = localStorage.getItem('userToken');
  const [showEndedCourses, setShowEndedCourses] = useState(false);
  const location = useLocation();
  const {fromCourseId, fromStats} = location.state || {};

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) {
          throw new Error('No token available');
        }
        const response: Student = await apiHooks.getUserInfoByUserid(
          token,
          id as string,
        );
        console.log(response);
        // Set the student and courses state variables
        setStudent(response.user);
        setCourses(response.courses);
      } catch (error) {
        console.log(error);
        toast.error('Error fetching student data');
      }
    };

    fetchData();
  }, [id, update]);

  const updateView = () => {
    setUpdate(!update);
  };
  const handleAddStudentToCourse = async (courseid: number | undefined) => {
    try {
      if (!token) {
        throw new Error('No token available');
      }
      if (!courseid) {
        throw new Error('No course selected');
      }
      const response = await apiHooks.updateStudentCourses(
        token,
        student?.userid,
        courseid,
      );
      console.log(response);
      // Add the student to the selected course'

      toast.success('Student added to course');

      updateView();
      // You'll need to implement this function yourself
    } catch (error) {
      console.log(error);
      error instanceof Error && toast.error(error.message);
    }
  };

  const handleRemoveStudentFromCourse = async (
    usercourseid: number | undefined,
  ) => {
    try {
      if (!token) {
        throw new Error('No token available');
      }
      if (!usercourseid) {
        throw new Error('No course selected');
      }
      const response = await apiHooks.deleteStudentFromCourse(
        token,
        usercourseid,
      );
      console.log(response);
      // Remove the student from the selected course
      toast.success('Student removed from course');
      updateView();
      // You'll need to implement this function yourself
    } catch (error) {
      console.log(error);
      error instanceof Error && toast.error(error.message);
    }
  };

  // If the student state variable is null, show a loading indicator
  if (!student) {
    return <div>Loading...</div>;
  }

  return (
    <div className='w-full sm:w-fit'>
      <div className='p-5 bg-white rounded-lg'>
        <div className='space-x-4'>
          <GeneralLinkButton
            path={
              user?.role === 'admin'
                ? '/counselor/students'
                : `/${user?.role}/students`
            }
            text='Back to students'
          />
          {user?.role === 'admin' && (
            <GeneralLinkButton
              path={`/admin/users/${id}/modify`}
              text={`Edit ${student.first_name} ${student.last_name} details`}
            />
          )}
          {user?.role === 'counselor' && (
            <GeneralLinkButton
              path={`/counselor/students/${id}/modify`}
              text={`Edit ${student.first_name} ${student.last_name} details`}
            />
          )}
          {/* Add back to course button only if we came from stats */}
          {fromStats && fromCourseId && (
            <GeneralLinkButton
              path={`/counselor/students/courses/${fromCourseId}`}
              text='Back to Course'
            />
          )}
        </div>
        <h2 className='mt-5 mb-5 text-2xl font-heading'>
          {student.first_name + ' ' + student.last_name}'s Info
        </h2>
        {/* @ts-ignore */}
        <ProfileInfo user={student} />

        <div className='w-full h-1 mt-5 rounded-md bg-metropolia-main-orange'></div>
        <h2 className='mt-5 mb-5 text-2xl font-heading'>
          {student.first_name + ' ' + student.last_name}'s Courses
        </h2>
        <div className='pt-1 pb-2 pl-2 pr-2 bg-gray-100'>
          <FormControlLabel
            control={
              <Switch
                checked={showEndedCourses}
                onChange={() => setShowEndedCourses(!showEndedCourses)}
                name='showEndedCourses'
                color='primary'
              />
            }
            label='Show ended courses'
          />
          <StudentCourseGrid
            courses={courses}
            showEndedCourses={showEndedCourses}
            updateView={updateView}
            handleAddStudentToCourse={handleAddStudentToCourse}
            handleRemoveStudentFromCourse={handleRemoveStudentFromCourse}
          />
        </div>
      </div>
    </div>
  );
};

export default TeacherStudentDetail;
