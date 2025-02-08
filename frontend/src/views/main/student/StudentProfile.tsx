import React, {useContext} from 'react';
import ProfileInfo from '../../../components/profiles/ProfileInfo';
import {UserContext} from '../../../contexts/UserContext';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom'; // Import useNavigate
/**
 * StudentProfile component.
 *
 * This component is responsible for rendering the profile of a student. It performs the following operations:
 *
 * 1. Fetches the user data from the UserContext.
 * 2. Renders the user's profile information using the ProfileInfo component.
 * 3. Renders the user's student group.
 * 4. Provides a button to navigate to the student's courses.
 *
 * If no user data is available, it renders a message indicating that no user data is available.
 *
 * @returns A JSX element representing the student profile component.
 */
const StudentProfile: React.FC = () => {
  const {t} = useTranslation();
  const {user} = useContext(UserContext);
  const navigate = useNavigate(); // Initialize useNavigate

  // Error handling
  if (!user) {
    return <div>{t('student.profile.noData')}</div>;
  }

  return (
    <div className='flex flex-col items-center justify-center p-10 font-body bg-white rounded-lg h-fit'>
      <h1 className='mt-5 mb-8 text-xl font-heading sm:text-4xl'>
        {t('student.profile.title')}
      </h1>
      <div className='mb-4 text-md sm:text-xl'>
        <ProfileInfo user={user} />
        <p className='mt-5 mb-5'>
          <strong>{t('student.profile.studentGroup')}:</strong>{' '}
          <span className='profileStat'>{user.group_name}</span>
        </p>
      </div>
      <button
        className='px-4 py-2 mt-4 text-white transition rounded-sm bg-metropolia-main-orange hover:bg-metropolia-secondary-orange'
        onClick={() => navigate('/student/courses')}>
        {t('student.profile.myCourses')}
      </button>
    </div>
  );
};

export default StudentProfile;
