import React, { useContext, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import Feedback from '../views/main/Feedback.tsx';
import Team from '../views/main/Team.tsx';
import CounselorCourseStats from '../views/main/counselor/CounselorCourseStats.tsx';
import CounselorHelpVideos from '../views/main/counselor/CounselorHelpVideos.tsx';
import CounselorMainView from '../views/main/counselor/CounselorMainView.tsx';
import CounselorProfile from '../views/main/counselor/CounselorProfile.tsx';
import CounselorLateEnrollment from '../views/main/counselor/students/CounselorLateEnrollment.tsx';
import CounselorStudentRoutes from './counselor/CounselorStudentRoutes.tsx';
import StudentCourseActivity from '../views/main/student/courses/StudentCourseActivity.tsx';

/**
 * CounselorRoutes component.
 * Implements role-based access control and navigation.
 * Redirects students to /studentroute for security.
 * It includes routes for the main view, profile, help videos, course statistics, and student routes.
 * Each route is associated with a specific component that will be rendered when the route is accessed.
 * The '*' route is a catch-all route that will render the CounselorMainView component if no other routes match.
 *
 * @returns {JSX.Element} The rendered CounselorRoutes component.
 */
const CounselorRoutes = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      if (user?.role === 'student') {
        navigate('/student', { replace: true });
      } else if (user?.role === 'teacher') {
        navigate('/teacher', { replace: true });
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }, [user, navigate]);

  // Guard clause for student and teacher role
  if (user?.role === 'student' || user?.role === 'teacher') {
    return null; // Prevent rendering of counselor routes for students
  }

  return (
    <Routes>
      <Route path='mainview' element={<CounselorMainView />} />
      <Route path='*' element={<CounselorMainView />} />
      <Route path='profile' element={<CounselorProfile />} />
      <Route path='helpvideos' element={<CounselorHelpVideos />} />
      <Route
        path='courses/stats/:courseid?'
        element={<CounselorCourseStats />}
      />
      <Route path='students/*' element={<CounselorStudentRoutes />} />
      <Route path='feedback' element={<Feedback />} />
      <Route path='lateenrollment' element={<CounselorLateEnrollment />} />
      <Route path='team' element={<Team />} />
      <Route path='activity' element={<StudentCourseActivity />} />
    </Routes>
  );
};

export default CounselorRoutes;
