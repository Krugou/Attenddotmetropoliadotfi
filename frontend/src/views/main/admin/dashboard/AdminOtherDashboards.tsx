import React from 'react';
import MainViewTitle from '../../../../components/ui/titles/MainViewTitle.tsx';
import DashboardCardList from '../../../../components/internal/admin/AdminOtherDashboards/DashboardCardList.tsx';

/**
 * AdminOtherDashboards component.
 * This component displays cards for accessing different role-specific dashboards
 * that are available to administrators.
 * Uses DashboardCardList component for rendering cards.
 *
 * @returns {JSX.Element} The rendered AdminOtherDashboards component.
 */
const AdminOtherDashboards: React.FC = () => {
  return (
    <>
      <MainViewTitle role="Admin" />
      <DashboardCardList />
    </>
  );
};

export default AdminOtherDashboards;
