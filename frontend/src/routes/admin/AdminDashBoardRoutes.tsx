import React from 'react';
import {Route, Routes} from 'react-router-dom';
import AdminDashboard from '../../views/main/admin/dashboard/AdminDashboard.tsx';
import AdminFeedback from '../../views/main/admin/dashboard/AdminFeedback';
import AdminGuide from '../../views/main/admin/dashboard/AdminGuide';
import AdminLogs from '../../views/main/admin/dashboard/AdminLogs';
import AdminStats from '../../views/main/admin/dashboard/AdminStats';
import AdminServerStatus from '../../views/main/admin/dashboard/AdminServerStatus';

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
        <Route path='server-status' element={<AdminServerStatus />} />{' '}
      </Route>
    </Routes>
  );
};

export default AdminDashBoardRoutes;
