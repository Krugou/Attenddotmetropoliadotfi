import React from 'react';
import {Route, Routes} from 'react-router-dom';
import AdminCourses from '../../views/main/admin/courses/AdminCourses.tsx';
import AdminMainView from '../../views/main/admin/AdminMainView';
import AdminCourseDetail from '../../views/main/admin/courses/AdminCourseDetail';
import AdminCourseModify from '../../views/main/admin/courses/AdminCourseModify';
/**
 * AdminCoursesRoutes component.
 * This component is responsible for defining the routes for the admin's courses section of the application.
 * It includes routes for the courses view, course detail, course modification, and the main view.
 * Each route is associated with a specific component that will be rendered when the route is accessed.
 * The '*' route is a catch-all route that will render the AdminMainView component if no other routes match.
 *
 * @returns {JSX.Element} The rendered AdminCoursesRoutes component.
 */
const AdminCoursesRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path='/' element={<AdminCourses />} />
      <Route path=':id' element={<AdminCourseDetail />} />
      <Route path=':id/modify' element={<AdminCourseModify />} />
      <Route path='*' element={<AdminMainView />} />
    </Routes>
  );
};

export default AdminCoursesRoutes;
