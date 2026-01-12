import React from 'react';
import {Route, Routes} from 'react-router-dom';
import CreateCourseCustom from '../../../components/features/courses/create/CreateCourseCustom.tsx';
import CreateCourseEasy from '../../../components/features/courses/create/CreateCourseEasy.tsx';
import TeacherCreateCourse from '../../../views/main/teacher/courses/TeacherCreateCourse.tsx';
import TeacherMainView from '../../../views/main/teacher/TeacherMainView.tsx';
import TeacherWorkLogCreate from '../../../views/main/teacher/WorkLog/TeacherWorklogCreate.tsx';
import CreateWorklogEasy from '../../../components/features/worklogs/CreateWorklogEasy.tsx';
import CreateWorklogCustom from '../../../components/features/worklogs/CreateWorklogCustom.tsx';
import CreatePracticum from '../../../components/features/practicum/Createpracticum.tsx';

const TeacherCreateCourseRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Valintasivu */}
      <Route path="/" element={<TeacherCreateCourse />} />

      {/* Alireitit */}
      <Route path="easy" element={<CreateCourseEasy />} />
      <Route path="custom" element={<CreateCourseCustom />} />
      <Route path="create" element={<TeacherWorkLogCreate />} />
      <Route path="worklog-easy" element={<CreateWorklogEasy />} />
      <Route path="worklog-custom" element={<CreateWorklogCustom />} />
      <Route path="practicum" element={<CreatePracticum />} />

      {/* Fallback */}
      <Route path="*" element={<TeacherMainView />} />
    </Routes>
  );
};

export default TeacherCreateCourseRoutes;

