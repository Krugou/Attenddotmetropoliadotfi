import React from 'react';
import {Route, Routes} from 'react-router-dom';
import Feedback from '../views/main/Feedback.tsx';
import Team from '../views/main/Team.tsx';
import StudentCourseAttendance from '../views/main/student/StudentCourseAttendance.tsx';
import StudentCourses from '../views/main/student/StudentCourses.tsx';
import StudentHelpVideos from '../views/main/student/StudentHelpVideos.tsx';
import StudentMainView from '../views/main/student/StudentMainView.tsx';
import StudentProfile from '../views/main/student/StudentProfile.tsx';
import StudentQrScanner from '../views/main/student/StudentQrScanner.tsx';
import StudentQrSelectScanner from '../views/main/student/StudentQrSelectScanner.tsx';
import StudentWorkLog from '../views/main/student/StudentWorkLog.tsx';
import StudentWorklogs from '../views/main/student/StudentWorklogs.tsx';

/**
 * StudentRoutes component.
 * This component is responsible for defining the routes for the student section of the application.
 * It includes routes for the main view, courses, profile, attendance, QR scanner, and course attendance.
 * Each route is associated with a specific component that will be rendered when the route is accessed.
 * The '*' route is a catch-all route that will render the StudentMainView component if no other routes match.
 *
 * @returns {JSX.Element} The rendered StudentRoutes component.
 */
const StudentRoutes = () => {
  return (
    <Routes>
      <Route path='mainview' element={<StudentMainView />} />
      <Route path='courses' element={<StudentCourses />} />
      <Route path='profile' element={<StudentProfile />} />
      <Route path='helpvideos' element={<StudentHelpVideos />} />
      <Route path='qr' element={<StudentQrScanner />} />
      <Route path='aqr' element={<StudentQrSelectScanner />} />
      <Route
        path='courses/attendance/:usercourseid'
        element={<StudentCourseAttendance />}
      />
      <Route path='team' element={<Team />} />
      <Route path='worklog' element={<StudentWorkLog />} />
      <Route path='worklogs' element={<StudentWorklogs />} />
      <Route path='feedback' element={<Feedback />} />
      <Route path='*' element={<StudentMainView />} />
    </Routes>
  );
};

export default StudentRoutes;
