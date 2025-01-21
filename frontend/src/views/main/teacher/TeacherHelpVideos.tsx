import React from 'react';
import {useTranslation} from 'react-i18next';
import CourseAttendance from '../../../assets/videos/CourseAttendance.mp4';
import CourseDetail from '../../../assets/videos/CourseDetails.mp4';
import CreateCourse from '../../../assets/videos/CreateCourse.mp4';
import CreateLecture from '../../../assets/videos/CreateLecture.mp4';
import RoleChange from '../../../assets/videos/RoleChange.mp4';
import StudentDetail from '../../../assets/videos/StudentDetail.mp4';
import StudentLecture from '../../../assets/videos/StudentLecture.mp4';
import TeacherAttendance from '../../../assets/videos/TeacherAttendance.mp4';
import VideoDropdown from '../../../components/main/dropdown/VideoDropdown'; // Import the VideoDropdown component

/**
 * TeacherHelpVideos component.
 * This component is responsible for rendering the help videos for teachers.
 * It uses the VideoDropdown component to display each video with a title.
 */
const TeacherHelpVideos: React.FC = () => {
  const {t} = useTranslation();

  return (
    <div className='w-full p-5'>
      <h1 className='p-3 m-auto mb-10 text-2xl font-heading text-center bg-white rounded-lg w-fit'>
        {t('teacher.helpVideos.title')}
      </h1>
      <div className='flex flex-col space-y-6'>
        <VideoDropdown
          title={t('teacher.helpVideos.videos.createCourse')}
          src={CreateCourse}
        />
        <VideoDropdown
          title={t('teacher.helpVideos.videos.createAttendance')}
          src={CreateLecture}
        />
        <VideoDropdown
          title={t('teacher.helpVideos.videos.accessAttendance')}
          src={CourseAttendance}
        />
        <VideoDropdown
          title={t('teacher.helpVideos.videos.accessStudentDetails')}
          src={StudentDetail}
        />
        <VideoDropdown
          title={t('teacher.helpVideos.videos.accessCourseDetails')}
          src={CourseDetail}
        />
        <VideoDropdown
          title={t('teacher.helpVideos.videos.accessStudentAttendance')}
          src={TeacherAttendance}
        />
        <VideoDropdown
          title={t('teacher.helpVideos.videos.changeRole')}
          src={RoleChange}
        />
        <VideoDropdown
          title={t('teacher.helpVideos.videos.studentJoin')}
          src={StudentLecture}
        />
      </div>
    </div>
  );
};

export default TeacherHelpVideos;
