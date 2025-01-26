import React, {useContext, useEffect} from 'react';
import {Route, Routes, useLocation, useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
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
import NoUserHelp from '../views/main/NoUserHelp';

const LanguageWrapper = ({children}: {children: React.ReactNode}) => {
  const {i18n} = useTranslation();
  const {lang} = useParams();

  useEffect(() => {
    if (lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  return <>{children}</>;
};

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
        <Route path='/student/*' element={<StudentRoutes />} />
        <Route path='/admin/*' element={<AdminRoutes />} />
        <Route path='/counselor/*' element={<CounselorRoutes />} />
        <Route path='/teacher/*' element={<TeacherRoutes />} />
        <Route path='/logout' element={<Logout />} />
        <Route path='/login' element={<Login />} />
        <Route
          path='/:lang/login'
          element={
            <LanguageWrapper>
              <Login />
            </LanguageWrapper>
          }
        />
        <Route path='/gdpr' element={<Gdpr />} />
        <Route path='/help' element={<NoUserHelp />} />
        <Route
          path='/:lang/help'
          element={
            <LanguageWrapper>
              <NoUserHelp />
            </LanguageWrapper>
          }
        />
        <Route path='/qrscantest' element={<QrSelectScannerTester />} />
        <Route path='*' element={<StartView />} />
      </Routes>
    </BackgroundContainer>
  );
};

export default AllRoutes;
