import React from 'react';
import {useTranslation} from 'react-i18next';
import StudentAttendance from '../../../assets/videos/StudentCourseAndAttendance.mp4';
import StudentLecture from '../../../assets/videos/StudentLecture.mp4';
import VideoDropdown from '../../../components/main/dropdown/VideoDropdown'; // Import the VideoDropdown component
/**
 * StudentHelpVideos component.
 * This component is responsible for rendering the help videos for students.
 * It uses the VideoDropdown component to display each video with a title.
 */
const StudentHelpVideos: React.FC = () => {
  const {t} = useTranslation(['student']);

  return (
    <div className='w-full p-5'>
      <h1 className='p-3 m-auto mb-10 text-2xl font-heading text-center bg-white rounded-lg w-fit'>
        {t('student:helpVideos.title')}
      </h1>
      <div className='flex flex-col space-y-6'>
        <VideoDropdown
          title={t('student:helpVideos.courseAccess')}
          src={StudentAttendance}
        />
        <VideoDropdown
          title={t('student:helpVideos.joinLecture')}
          src={StudentLecture}
        />
      </div>
    </div>
  );
};

export default StudentHelpVideos;
