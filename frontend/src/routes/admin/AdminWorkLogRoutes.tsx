import React from 'react';
import {Route, Routes} from 'react-router-dom';
import AdminMainView from '../../views/main/admin/AdminMainView';
import AdminWorkLogs from '../../views/main/admin/AdminWorkLogs';
import TeacherWorklogCourseModify from '../../views/main/teacher/WorkLog/TeacherWorklogCourseModify';
import TeacherWorklogCourseStats from '../../views/main/teacher/WorkLog/TeacherWorklogCourseStats';
import TeacherWorklogCourseDetail from '../../views/main/teacher/WorkLog/TeacherWorklogCourseDetail';
import TeacherWorklogCourseGroups from '../../views/main/teacher/WorkLog/Groups/TeacherWorklogCourseGroups';
import TeacherWorklogCourseEntries from '../../views/main/teacher/WorkLog/TeacherWorklogCourseEntries';
import TeacherWorklogCourseGroup from '../../views/main/teacher/WorkLog/Groups/TeacherWorklogCourseGroup';
import TeacherWorklogCourseGroupStats from '../../views/main/teacher/WorkLog/Groups/TeacherWorklogCourseGroupStats';
import TeacherWorklogCourseGroupEntries from '../../views/main/teacher/WorkLog/Groups/TeacherWorklogCourseGroupEntries';

/**
 * AdminWorkLogRoutes component.
 * This component is responsible for defining the routes for the admin's worklog section of the application.
 * It includes routes for the worklog view and the main view.
 * Each route is associated with a specific component that will be rendered when the route is accessed.
 * The '*' route is a catch-all route that will render the AdminMainView component if no other routes match.
 *
 * @returns {JSX.Element} The rendered AdminWorkLogRoutes component.
 */
const AdminWorkLogRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path='/' element={<AdminWorkLogs />} />
      <Route path=':courseid/modify' element={<TeacherWorklogCourseModify />} />
      <Route path='stats/:courseid?' element={<TeacherWorklogCourseStats />} />
      <Route path=':courseid' element={<TeacherWorklogCourseDetail />} />
      <Route
        path=':courseid/entries'
        element={<TeacherWorklogCourseEntries />}
      />
      <Route path='group/:courseid' element={<TeacherWorklogCourseGroups />} />
      <Route
        path='group/:courseid/:groupid'
        element={<TeacherWorklogCourseGroup />}
      />
      <Route
        path='group/:courseid/:groupid/stats'
        element={<TeacherWorklogCourseGroupStats />}
      />
      <Route
        path='group/:groupid/entries'
        element={<TeacherWorklogCourseGroupEntries />}
      />
      <Route path='*' element={<AdminMainView />} />
    </Routes>
  );
};

export default AdminWorkLogRoutes;
