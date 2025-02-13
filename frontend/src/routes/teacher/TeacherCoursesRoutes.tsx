import React from 'react';
import {Route, Routes} from 'react-router-dom';
import TeacherCourseAttendances from '../../views/main/teacher/Courses/TeacherCourseAttendances.tsx';
import TeacherCourseDetail from '../../views/main/teacher/Courses/TeacherCourseDetail.tsx';
import TeacherCourseModify from '../../views/main/teacher/Courses/TeacherCourseModify.tsx';
import TeacherCourses from '../../views/main/teacher/Courses/TeacherCourses.tsx';
import TeacherCourseStats from '../../views/main/teacher/Courses/TeacherCourseStats.tsx';
import TeacherMainView from '../../views/main/teacher/TeacherMainView.tsx';
import TeacherCreateCourseRoutes from './create/TeacherCreateCourseRoutes.tsx';
import TeacherStudentCourseActivity from '../../views/main/teacher/Courses/TeacherStudentCourseActivity.tsx';
/**
 * TeacherCoursesRoutes component.
 * This component is responsible for defining the routes for the teacher's courses section of the application.
 * It includes routes for the courses view, course detail, course modify, course statistics, course attendances, course creation, and the main view.
 * Each route is associated with a specific component that will be rendered when the route is accessed.
 * The '*' route is a catch-all route that will render the TeacherMainView component if no other routes match.
 *
 * @returns {JSX.Element} The rendered TeacherCoursesRoutes component.
 */
const TeacherCoursesRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path='/' element={<TeacherCourses />} />
      <Route path='create/*' element={<TeacherCreateCourseRoutes />} />
      <Route path=':id/modify' element={<TeacherCourseModify />} />
      <Route path='stats/:courseid?' element={<TeacherCourseStats />} />
      <Route path='attendances/:id' element={<TeacherCourseAttendances />} />
      <Route path=':id' element={<TeacherCourseDetail />} />
      <Route path='/activity' element={<TeacherStudentCourseActivity />} />
      <Route path='*' element={<TeacherMainView />} />
    </Routes>
  );
};

export default TeacherCoursesRoutes;
