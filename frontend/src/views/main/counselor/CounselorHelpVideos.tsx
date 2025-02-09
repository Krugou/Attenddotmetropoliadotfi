import React from 'react';
import CounselorStatistics from '../../../assets/videos/CounselorStatistics.mp4';
import CounselorStudentAttendance from '../../../assets/videos/CounselorStudentAttendance.mp4';
import CounselorStudentDetails from '../../../assets/videos/CounselorStudentDetails.mp4';
import RoleChange from '../../../assets/videos/RoleChange.mp4';
import VideoDropdown from '../../../components/main/dropdown/VideoDropdown';
import {useTranslation} from 'react-i18next';

/**
 * CounselorHelpVideos component.
 * This component is responsible for displaying help videos for counselors.
 * It renders a list of VideoDropdown components, each of which represents a help video.
 *
 * @returns {JSX.Element} The rendered CounselorHelpVideos component.
 */
const CounselorHelpVideos: React.FC = () => {
  const {t} = useTranslation(['translation']);
  return (
    <div className='w-full p-5'>
      <h1 className='p-3 mb-10 ml-auto mr-auto text-2xl font-heading text-center bg-white rounded-lg w-fit'>
        {t('translation:counselor.helpVideos.counselorHelpVideos')}
      </h1>
      <div className='flex flex-col space-y-6'>
        <VideoDropdown
          /**
           * The title of the video.
           *
           * @type {string}
           */
          title='How do I access students details?'
          /**
           * The source URL of the video.
           *
           * @type {string}
           */
          src={CounselorStudentDetails}
        />
        <VideoDropdown
          /**
           * The title of the video.
           *
           * @type {string}
           */
          title='How do I access students attendance details?'
          /**
           * The source URL of the video.
           *
           * @type {string}
           */
          src={CounselorStudentAttendance}
        />
        <VideoDropdown
          /**
           * The title of the video.
           *
           * @type {string}
           */
          title='How can I see attendance statistics?'
          /**
           * The source URL of the video.
           *
           * @type {string}
           */
          src={CounselorStatistics}
        />
        <VideoDropdown
          /**
           * The title of the video.
           *
           * @type {string}
           */
          title='How can I change my role?'
          /**
           * The source URL of the video.
           *
           * @type {string}
           */
          src={RoleChange}
        />
      </div>
    </div>
  );
};

export default CounselorHelpVideos;
