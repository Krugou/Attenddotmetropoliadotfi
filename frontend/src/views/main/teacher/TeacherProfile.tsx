import React, {useContext, useEffect, useState} from 'react';
import ProfileInfo from '../../../components/features/users/ProfileInfo.tsx';
import {UserContext} from '../../../contexts/UserContext';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom'; // Import useNavigate
import Loader from '../../../utils/Loader';
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
  const {t} = useTranslation(['teacher']);

  useEffect(() => {
    if (user) {
      setIsLoading(false);
    }
  }, [user]);

  if (isLoading) {
    return <Loader />;
  }

  if (!user) {
    return <div>{t('teacher:profile.noData')}</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl p-5 sm:p-10 font-body bg-white rounded-lg">
      <h2 className='mt-5 mb-8 text-l font-heading sm:text-3xl'>
        {t('teacher:profile.title')}
      </h2>
      <div className='mb-4 text-md sm:text-xl'>
        <ProfileInfo user={user} />
      </div>
      <button
        className='px-4 py-2 mt-4 text-white transition rounded-sm bg-metropolia-main-orange hover:bg-metropolia-secondary-orange'
        onClick={() => navigate('/teacher/courses')}>
        {t('teacher:profile.myCourses')}
      </button>
    </div>
  );
};

export default TeacherProfile;
