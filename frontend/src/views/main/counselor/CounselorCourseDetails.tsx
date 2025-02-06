import React from 'react';
import { useParams } from 'react-router-dom';
import TeacherCourseDetail from '../teacher/Courses/TeacherCourseDetail';


const CounselorCourseDetails: React.FC = () => {
  const { courseid } = useParams<{ courseid: string }>();

  return <TeacherCourseDetail key={courseid} />;
};

export default CounselorCourseDetails;
