import React from 'react';
import {Route, Routes} from 'react-router-dom';
import AdminMainView from '../../views/main/admin/AdminMainView';
import AdminWorkLogs from '../../views/main/admin/AdminWorkLogs';

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
      <Route path='*' element={<AdminMainView />} />
    </Routes>
  );
};

export default AdminWorkLogRoutes;
