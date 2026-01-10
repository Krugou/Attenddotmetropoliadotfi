import React from 'react';
import MainViewTitle from '../../../components/ui/titles/MainViewTitle.tsx';
import WelcomeModal from '../../../components/ui/modals/WelcomeModal';
import OpenDataTest from '../../../components/features/system/OpenDataTest.tsx';
import AdminCardGrid from '../../../components/internal/admin/AdminMainView/AdminCardGrid';

/**
 * AdminMainView component.
 * Renders the admin home view with cards and utilities.
 */
const AdminMainView: React.FC = () => {
  return (
    <>
      <MainViewTitle />
      <OpenDataTest token={localStorage.getItem('userToken') || ''} />
      <AdminCardGrid />
      <WelcomeModal storageKey='welcomeModal.v1' />
    </>
  );
};

export default AdminMainView;

