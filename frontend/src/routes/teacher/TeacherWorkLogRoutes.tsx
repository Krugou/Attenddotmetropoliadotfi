import React from 'react';
import {Route, Routes} from 'react-router-dom';
import TeacherWorkLogs from '../../views/main/teacher/WorkLog/TeacherWorkLogs';
import TeacherModeSelection from '../../views/main/teacher/WorkLog/TeacherModeSelection';
import TeacherMainView from '../../views/main/teacher/TeacherMainView';
import TeacherWorklogCourseModify from '../../views/main/teacher/WorkLog/TeacherWorklogCourseModify';
import TeacherWorklogCourseStats from '../../views/main/teacher/WorkLog/TeacherWorklogCourseStats';
import TeacherWorklogCourseDetail from '../../views/main/teacher/WorkLog/TeacherWorklogCourseDetail';
import TeacherWorklogCourseGroup from '../../views/main/teacher/WorkLog/Groups/TeacherWorklogCourseGroup';
import TeacherWorklogCourseGroups from '../../views/main/teacher/WorkLog/Groups/TeacherWorklogCourseGroups';
import TeacherWorklogCourseGroupStats from '../../views/main/teacher/WorkLog/Groups/TeacherWorklogCourseGroupStats';
import TeacherWorklogCourseEntries from '../../views/main/teacher/WorkLog/TeacherWorklogCourseEntries';
import TeacherWorklogCourseGroupEntries from '../../views/main/teacher/WorkLog/Groups/TeacherWorklogCourseGroupEntries';

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
const TeacherWorkLogRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path='/' element={<TeacherWorkLogs />} />
      <Route path='create' element={<TeacherModeSelection />} />
      <Route path=':courseid/modify' element={<TeacherWorklogCourseModify />} />
      <Route path='stats/:courseid?' element={<TeacherWorklogCourseStats />} />
      <Route path=':courseid' element={<TeacherWorklogCourseDetail />} />
      <Route
        path=':courseid/entries'
        element={<TeacherWorklogCourseEntries />}
      />
      <Route path='group/' element={<TeacherWorklogCourseGroups />} />
      <Route path='group/:groupid' element={<TeacherWorklogCourseGroup />} />
      <Route
        path='group/:groupid/stats'
        element={<TeacherWorklogCourseGroupStats />}
      />
      <Route
        path='group/:groupid/entries'
        element={<TeacherWorklogCourseGroupEntries />}
      />

      {/* Add more work log related routes here as needed */}
      <Route path='*' element={<TeacherMainView />} />
    </Routes>
  );
};

export default TeacherWorkLogRoutes;
