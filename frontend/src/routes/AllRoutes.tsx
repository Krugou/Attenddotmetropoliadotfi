import React, {useContext, useEffect} from 'react';
import {Route, Routes, useLocation} from 'react-router-dom';
import BackgroundContainer from '../components/main/background/BackgroundContainer';
import {UserContext} from '../contexts/UserContext';
import Logout from '../views/Logout';
import Gdpr from '../views/main/Gdpr';
import Login from '../views/main/Login';
import StartView from '../views/main/StartView';

import AdminRoutes from './AdminRoutes';
import CounselorRoutes from './CounselorRoutes';
import StudentRoutes from './StudentRoutes';
import TeacherRoutes from './TeacherRoutes';
import QrSelectScannerTester from '../views/QrSelectScannerTester';

const AllRoutes = () => {
  const location = useLocation();
  const {user} = useContext(UserContext);

  // Update document title based on current path
  useEffect(() => {
    const title = user ? `JakSec - ${user.role} ` : `JakSec`;
    document.title = title;
  }, [user, location]);

  return (
    <BackgroundContainer>
      <Routes>
        <Route path='/' element={<StartView />} />
        <Route path='student/*' element={<StudentRoutes />} />
        <Route path='admin/*' element={<AdminRoutes />} />
        <Route path='counselor/*' element={<CounselorRoutes />} />
        <Route path='teacher/*' element={<TeacherRoutes />} />
        <Route path='logout' element={<Logout />} />
        <Route path='login' element={<Login />} />
        <Route path='gdpr' element={<Gdpr />} />
        <Route path='*' element={<StartView />} />
        <Route path='qrscantest' element={<QrSelectScannerTester />} />
      </Routes>
    </BackgroundContainer>
  );
};

export default AllRoutes;
