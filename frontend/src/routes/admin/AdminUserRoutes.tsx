import React from 'react';
import {Route, Routes} from 'react-router-dom';
import AdminMainView from '../../views/main/admin/AdminMainView';
import AdminUsers from '../../views/main/admin/users/AdminUsers.tsx';
import AdminUserModify from '../../views/main/admin/users/AdminUserModify';
/**
 * AdminUserRoutes component.
 * This component is responsible for defining the routes for the admin's user management section of the application.
 * It includes routes for the users view, user modification, and the main view.
 * Each route is associated with a specific component that will be rendered when the route is accessed.
 * The '*' route is a catch-all route that will render the AdminMainView component if no other routes match.
 *
 * @returns {JSX.Element} The rendered AdminUserRoutes component.
 */
const AdminUserRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path='/' element={<AdminUsers />} />
      <Route path='/:userid/modify' element={<AdminUserModify />} />
      <Route path='*' element={<AdminMainView />} />
    </Routes>
  );
};

export default AdminUserRoutes;
