import React from 'react';
import {Route, Routes} from 'react-router-dom';
import TeacherAttendanceRoom from '../../views/main/teacher/attendance/TeacherAttendanceRoom.tsx';
import TeacherAttendanceRoomReload from '../../views/main/teacher/attendance/TeacherAttendanceRoomReload.tsx';
import TeacherCreateLecture from '../../views/main/teacher/attendance/TeacherCreateLecture.tsx';
import TeacherMainView from '../../views/main/teacher/TeacherMainView.tsx';
/**
 * TeacherAttendanceRoutes component.
 * This component is responsible for defining the routes for the teacher's attendance section of the application.
 * It includes routes for creating a lecture, attendance room, and the main view.
 * Each route is associated with a specific component that will be rendered when the route is accessed.
 * The '*' route is a catch-all route that will render the TeacherMainView component if no other routes match.
 *
 * @returns {JSX.Element} The rendered TeacherAttendanceRoutes component.
 */
const TeacherAttendanceRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path='createlecture' element={<TeacherCreateLecture />} />
      <Route path=':lectureid' element={<TeacherAttendanceRoom />} />
      <Route path='*' element={<TeacherMainView />} />
      <Route
        path='/reload/:lectureid'
        element={<TeacherAttendanceRoomReload />}
      />
    </Routes>
  );
};

export default TeacherAttendanceRoutes;
