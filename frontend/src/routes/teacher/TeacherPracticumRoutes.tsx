import React from 'react';
import {Route, Routes} from 'react-router-dom';
import TeacherWorkLogs from '../../views/main/teacher/WorkLog/TeacherWorkLogs';
import TeacherMainView from '../../views/main/teacher/TeacherMainView';
import TeacherPracticumDetail from '../../views/main/teacher/WorkLog/TeacherPracticumDetail';
import TeacherPracticumModify from '../../views/main/teacher/WorkLog/TeacherPracticumModify';
import TeacherPracticumEntries from '../../views/main/teacher/WorkLog/TeacherPracticumEntries';


/**
 * TeacherWorkLogRoutes component.
 * This component handles routing for the teacher's work log section of the application.
 * It includes routes for viewing work logs, creating new work logs, and managing work log related features.
 *
 * Routes:
 * - / : Shows the list of work logs
 * - /create: Shows the work log creation mode selection
 * - Any unmatched route redirects to TeacherMainView
 *
 * @returns {JSX.Element} The rendered TeacherWorkLogRoutes component
 */
const TeacherPracticumRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path='/' element={<TeacherWorkLogs />} />
      <Route path=':practicumid' element={<TeacherPracticumDetail />} />
      <Route path=':practicumid/modify' element={<TeacherPracticumModify />} />
      <Route path=':practicumid/entries' element={< TeacherPracticumEntries/>} />

      {/* Add more work log related routes here as needed */}
      <Route path='*' element={<TeacherMainView />} />
    </Routes>
  );
};

export default TeacherPracticumRoutes;
