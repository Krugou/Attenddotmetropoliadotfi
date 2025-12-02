import React from 'react';
import {Route, Routes} from 'react-router-dom';
import AdminLectures from '../../views/main/admin/lectures/AdminLectures.tsx';
import AdminMainView from '../../views/main/admin/AdminMainView';
import AdminLectureDetail from '../../views/main/admin/lectures/AdminLectureDetail';

const AdminLecturesRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path='/' element={<AdminLectures />} />
      <Route path='/:courseId/:lectureId' element={<AdminLectureDetail />} />
      <Route path='*' element={<AdminMainView />} />
    </Routes>
  );
};

export default AdminLecturesRoutes;
