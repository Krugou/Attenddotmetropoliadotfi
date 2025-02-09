import React, {useContext} from 'react';
import ProfileInfo from '../../../components/profiles/ProfileInfo';
import {UserContext} from '../../../contexts/UserContext';
import {useTranslation} from 'react-i18next';
/**
 * CounselorProfile component.
 * This component is responsible for rendering the profile of a counselor.
 * It fetches the user data from the UserContext and passes it to the ProfileInfo component.
 * If no user data is available, it renders an error message.
 *
 * @returns {JSX.Element} The rendered CounselorProfile component.
 */
const CounselorProfile: React.FC = () => {
  const {t} = useTranslation(['counselor']);
  /**
   * User context.
   *
   * @type {React.Context<UserContext>}
   */
  const {user} = useContext(UserContext);

  /**
   * Error handling.
   * If no user data is available, render an error message.
   */
  if (!user) {
    return <div>{t('counselor:profile.noDataAvailable')}</div>;
  }
  /**
   * Render the profile of the counselor.
   * This includes a title and the ProfileInfo component, which displays the user's information.
   *
   * @returns {JSX.Element} The rendered JSX element.
   */
  return (
    <div className='flex flex-col items-center justify-center p-5 font-body bg-white rounded-lg h-fit sm:p-10'>
      <h1 className='mt-5 mb-8 text-xl font-heading sm:text-4xl'>
        {t('counselor:profile.title')}
      </h1>
      <div className='mb-4 text-md sm:text-xl'>
        <ProfileInfo user={user} />
      </div>
    </div>
  );
};

export default CounselorProfile;
