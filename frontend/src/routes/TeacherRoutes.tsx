import React, {useContext, useEffect} from 'react';
import {Route, Routes, useNavigate} from 'react-router-dom';
import {UserContext} from '../contexts/UserContext';
import Feedback from '../views/main/Feedback.tsx';
import Team from '../views/main/Team.tsx';
import TeacherLectures from '../views/main/teacher/Lectures/TeacherLectures.tsx';
import TeacherLateEnrollment from '../views/main/teacher/Students/TeacherLateEnrollment.tsx';
import TeacherHelpVideos from '../views/main/teacher/TeacherHelpVideos';
import TeacherMainView from '../views/main/teacher/TeacherMainView.tsx';
import TeacherProfile from '../views/main/teacher/TeacherProfile.tsx';
import TeacherAttendanceRoutes from './teacher/TeacherAttendanceRoutes';
import TeacherCoursesRoutes from './teacher/TeacherCoursesRoutes';
import TeacherStudentsRoutes from './teacher/TeacherStudentsRoutes';
import TeacherWorkLogRoutes from './teacher/TeacherWorkLogRoutes.tsx';
import TeacherLectureDetail from '../views/main/teacher/Lectures/TeacherLectureDetail.tsx';

/**
 * TeacherRoutes component.
 * This component is responsible for defining the routes for the teacher section of the application.
 * It includes routes for the main view, help videos, courses, students, attendance, and profile.
 * Each route is associated with a specific component that will be rendered when the route is accessed.
 * The '*' route is a catch-all route that will render the TeacherMainView component if no other routes match.
 *
 * @returns {JSX.Element} The rendered TeacherRoutes component.
 */
const TeacherRoutes = () => {
  const {user} = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      if (user?.role === 'student') {
        navigate('/student', {replace: true});
      } else if (user?.role === 'counselor') {
        navigate('/counselor', {replace: true});
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }, [user, navigate]);

  // Guard clause for student and counselor role
  if (user?.role === 'student' || user?.role === 'counselor') {
    return null; // Prevent rendering of teacher routes for students
  }

  return (
    <Routes>
      <Route path='mainview' element={<TeacherMainView />} />
      <Route path='helpvideos' element={<TeacherHelpVideos />} />
      <Route path='courses/*' element={<TeacherCoursesRoutes />} />
      <Route path='students/*' element={<TeacherStudentsRoutes />} />
      <Route path='attendance/*' element={<TeacherAttendanceRoutes />} />
      <Route path='lectures' element={<TeacherLectures />} />
      <Route path='lectures/:lectureid' element={<TeacherLectureDetail />} />
      <Route path='profile' element={<TeacherProfile />} />
      <Route path='feedback' element={<Feedback />} />
      <Route path='team' element={<Team />} />
      <Route path='worklog/*' element={<TeacherWorkLogRoutes />} />
      <Route path='lateenrollment' element={<TeacherLateEnrollment />} />

      <Route path='*' element={<TeacherMainView />} />
    </Routes>
  );
};

export default TeacherRoutes;
