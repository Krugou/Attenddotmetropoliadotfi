// routes/TeacherStudentsRoutes.tsx
import React from 'react';
import {Route, Routes} from 'react-router-dom';
import TeacherStudentAttendances from '../../views/main/teacher/students/TeacherStudentAttendances';
import TeacherStudentDetail from '../../views/main/teacher/students/TeacherStudentDetail.tsx';
import TeacherStudentModify from '../../views/main/teacher/students/TeacherStudentModify.tsx';
import TeacherStudentsView from '../../views/main/teacher/students/TeacherStudentsView.tsx';
import TeacherMainView from '../../views/main/teacher/TeacherMainView.tsx';
/**
 * TeacherStudentsRoutes component.
 * This component is responsible for defining the routes for the teacher's students section of the application.
 * It includes routes for the students view, student detail, student modify, student attendances, and the main view.
 * Each route is associated with a specific component that will be rendered when the route is accessed.
 * The '*' route is a catch-all route that will render the TeacherMainView component if no other routes match.
 *
 * @returns {JSX.Element} The rendered TeacherStudentsRoutes component.
 */
const TeacherStudentsRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path='/' element={<TeacherStudentsView />} />
      <Route path=':id' element={<TeacherStudentDetail />} />
      <Route path=':id/modify' element={<TeacherStudentModify />} />
      <Route
        path='attendance/:usercourseid'
        element={<TeacherStudentAttendances />}
      />
      <Route path='*' element={<TeacherMainView />} />
    </Routes>
  );
};

export default TeacherStudentsRoutes;
