import React, {useContext, useEffect} from 'react';
import {Route, Routes, useNavigate} from 'react-router-dom';
import {UserContext} from '../contexts/UserContext';
import Feedback from '../views/main/Feedback.tsx';
import Team from '../views/main/Team.tsx';
import AdminDashboard from '../views/main/admin/AdminDashboard.tsx';
import AdminMainView from '../views/main/admin/AdminMainView.tsx';
import AdminNewUser from '../views/main/admin/AdminNewUser.tsx';
import AdminProfile from '../views/main/admin/AdminProfile.tsx';
import AdminCoursesRoutes from './admin/AdminCourseRoutes';
import AdminDashBoardRoutes from './admin/AdminDashBoardRoutes';
import AdminLecturesRoutes from './admin/AdminLectureRoutes.tsx';
import AdminSettingsRoutes from './admin/AdminSettingsRoutes.tsx';
import AdminUserRoutes from './admin/AdminUserRoutes';
import AdminWorkLogRoutes from './admin/AdminWorkLogRoutes.tsx';
/**
 * AdminRoutes component.
 * This component is responsible for defining the routes for the admin section of the application.
 * It includes routes for the main view, courses, users, profile, help videos, settings, and statistics.
 * Each route is associated with a specific component that will be rendered when the route is accessed.
 * The '*' route is a catch-all route that will render the AdminMainView component if no other routes match.
 *
 * @returns {JSX.Element} The rendered AdminRoutes component.
 */
const AdminRoutes = () => {
  const {user} = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      if (user?.role === 'student') {
        navigate('/student', {replace: true});
      } else if (user?.role === 'teacher') {
        navigate('/teacher', {replace: true});
      } else if (user?.role === 'counselor') {
        navigate('/counselor', {replace: true});
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }, [user, navigate]);

  // Guard clause for student role
  if (
    user?.role === 'student' ||
    user?.role === 'teacher' ||
    user?.role === 'counselor'
  ) {
    return null; // Prevent rendering of admin routes for students
  }

  return (
    <Routes>
      <Route path='mainview' element={<AdminMainView />} />
      <Route path='courses/*' element={<AdminCoursesRoutes />} />
      <Route path='worklog/*' element={<AdminWorkLogRoutes />} />
      <Route path='users/*' element={<AdminUserRoutes />} />
      <Route path='profile' element={<AdminProfile />} />
      <Route path='settings/*' element={<AdminSettingsRoutes />} />
      <Route path='*' element={<AdminMainView />} />
      <Route path='dashboard/*' element={<AdminDashBoardRoutes />} />
      <Route path='team' element={<Team />} />
      <Route path='lectures/*' element={<AdminLecturesRoutes />} />
      <Route path='newuser' element={<AdminNewUser />} />
      <Route path='feedback' element={<Feedback />} />
    </Routes>
  );
};

export default AdminRoutes;
