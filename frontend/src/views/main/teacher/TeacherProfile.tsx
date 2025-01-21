import React, {useContext, useEffect, useState} from 'react';
import ProfileInfo from '../../../components/profiles/ProfileInfo';
import {UserContext} from '../../../contexts/UserContext';
import {useTranslation} from 'react-i18next';
import {CircularProgress} from '@mui/material';
import {useNavigate} from 'react-router-dom'; // Import useNavigate
/**
 * TeacherProfile component.
 * This component is responsible for rendering the profile of a teacher.
 * It uses the UserContext to get the current user and displays a loading spinner until the user data is available.
 * It also provides a button to navigate to the teacher's courses.
 */
const TeacherProfile: React.FC = () => {
  const {user} = useContext(UserContext);
  const navigate = useNavigate(); // Initialize useNavigate
  const [isLoading, setIsLoading] = useState(true);
  const {t} = useTranslation();

  useEffect(() => {
    if (user) {
      setIsLoading(false);
    }
  }, [user]);

  if (isLoading) {
    return <CircularProgress />;
  }

  if (!user) {
    return <div>{t('teacher.profile.noData')}</div>;
  }

  return (
    <div className='flex flex-col items-center justify-center w-11/12 p-5 font-body bg-white rounded-lg sm:w-fit h-fit sm:p-10'>
      <h1 className='mt-5 mb-8 text-xl font-heading sm:text-4xl'>
        {t('teacher.profile.title')}
      </h1>
      <div className='mb-4 text-md sm:text-xl'>
        <ProfileInfo user={user} />
      </div>
      <button
        className='px-4 py-2 mt-4 text-white transition rounded bg-metropoliaMainOrange hover:bg-metropoliaSecondaryOrange'
        onClick={() => navigate('/teacher/courses')}>
        {t('teacher.profile.myCourses')}
      </button>
    </div>
  );
};

export default TeacherProfile;
