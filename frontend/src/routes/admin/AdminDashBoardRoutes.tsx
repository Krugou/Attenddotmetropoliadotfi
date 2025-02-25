import React from 'react';
import {Route, Routes} from 'react-router-dom';
import AdminDashboard from '../../views/main/admin/AdminDashboard';
import AdminErrorLogs from '../../views/main/admin/Dashboard/AdminErrorLogs';
import AdminFeedback from '../../views/main/admin/AdminFeedback';
import AdminGuide from '../../views/main/admin/Dashboard/AdminGuide';
import AdminLogs from '../../views/main/admin/Dashboard/AdminLogs';
import AdminStats from '../../views/main/admin/Dashboard/AdminStats';
import AdminServerStatus from '../../views/main/admin/Dashboard/AdminServerStatus';

/**
 * AdminDashBoardRoutes component.
 * Handles routing for the admin dashboard section.
 * @returns {JSX.Element} The rendered AdminDashBoardRoutes component.
 */
const AdminDashBoardRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<AdminDashboard />}>
        <Route index element={<AdminGuide />} />
        <Route path='stats' element={<AdminStats />} />
        <Route path='logs' element={<AdminLogs />} />
        <Route path='user-feedback' element={<AdminFeedback />} />
        <Route path='errorlogs' element={<AdminErrorLogs />} />
        <Route path='server-status' element={<AdminServerStatus />} />{' '}
      </Route>
    </Routes>
  );
};

export default AdminDashBoardRoutes;
