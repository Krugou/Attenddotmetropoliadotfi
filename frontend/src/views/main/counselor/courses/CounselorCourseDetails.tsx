import React from 'react';
import { useParams } from 'react-router-dom';
import TeacherCourseDetail from '../../teacher/courses/TeacherCourseDetail.tsx';


const CounselorCourseDetails: React.FC = () => {
  const { courseid } = useParams<{ courseid: string }>();

  return <TeacherCourseDetail key={courseid} />;
};

export default CounselorCourseDetails;
