import React from 'react';
import {Route, Routes} from 'react-router-dom';
import CounselorMainView from '../../views/main/counselor/CounselorMainView';
import CounselorStudentAttendances from '../../views/main/counselor/students/CounselorStudentAttendances';
import CounselorStudentDetail from '../../views/main/counselor/students/CounselorStudentDetail';
import CounselorStudentModify from '../../views/main/counselor/students/CounselorStudentModify';
import CounselorStudentsView from '../../views/main/counselor/students/CounselorStudentsView';
import CounselorCourseDetails from '../../views/main/counselor/CounselorCourseDetails';
/**
 * CounselorStudentRoutes component.
 * This component is responsible for defining the routes for the counselor's students section of the application.
 * It includes routes for the students view, student detail, student attendances, and the main view.
 * Each route is associated with a specific component that will be rendered when the route is accessed.
 * The '*' route is a catch-all route that will render the CounselorMainView component if no other routes match.
 *
 * @returns {JSX.Element} The rendered CounselorStudentRoutes component.
 */
const CounselorStudentRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path='/' element={<CounselorStudentsView />} />
      <Route path=':id' element={<CounselorStudentDetail />} />
      <Route path='*' element={<CounselorMainView />} />
      <Route path='/:userid/modify' element={<CounselorStudentModify />} />
      <Route
        path='attendance/:usercourseid'
        element={<CounselorStudentAttendances />}
      />
      <Route path='courses/:id' element={<CounselorCourseDetails />} />
    </Routes>
  );
};

export default CounselorStudentRoutes;
