import React, {useEffect, useState, useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import apiHooks from '../../hooks/ApiHooks'; // Replace with the correct path to your ApiHooks file
import {useTranslation} from 'react-i18next';
import {UserContext} from '../../contexts/UserContext';
import {FI, GB, SE} from 'country-flag-icons/react/3x2';

/**
 * ProfileInfoPros interface represents the structure of the ProfileInfo props.
 * It includes a property for the user's information.
 */
interface ProfileInfoPros {
  user: {
    username: string;
    email: string;
    role: string;
    created_at: string;
    first_name: string;
    last_name: string;
    activeStatus: number;
    darkMode: number;
    language: string;
  };
}

/**
 * Role interface represents the structure of a role object.
 * It includes properties for the role's ID and name.
 */
interface Role {
  roleid: string;
  name: string;
}
/**
 * ProfileInfo component.
 * This component is responsible for displaying the user's profile information and allowing the user to change their role.
 * It uses the useState and useEffect hooks from React to manage state and side effects.
 * The user's information is passed in as a prop.
 * The component fetches the roles from the API when it is mounted and stores them in a state variable.
 * The user can open a modal to change their role, and the component will call the API to make the change.
 *
 * @param {ProfileInfoPros} props The props that define the user's information.
 * @returns {JSX.Element} The rendered ProfileInfo component.
 */
const ProfileInfo: React.FC<ProfileInfoPros> = ({user}) => {
  const {t, i18n} = useTranslation();
  const {setUser} = useContext(UserContext);
  // Define navigate
  const Navigate = useNavigate();
  // Define state variables for the modal
  const [open, setOpen] = useState(false);
  // Define state variables for the roles
  const [roles, setRoles] = useState<Role[]>([]);
  // Define state variable for the selected role
  const [selectedRole, setSelectedRole] = useState('');

  // Fetch the roles when the component is mounted
  useEffect(() => {
    const token: string | null = localStorage.getItem('userToken');
    if (!token) {
      throw new Error('No token available');
    }
    const fetchRoles = async () => {
      const roles = await apiHooks.fetchAllRolesSpecial(token);
      setRoles(roles);
      setSelectedRole(roles[0]?.roleid || '');
    };
    fetchRoles();
  }, []);

  const handleOpen = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Handle the role change
  const handleRoleChange = async () => {
    const token: string | null = localStorage.getItem('userToken');
    if (!token) {
      throw new Error('No token available');
    }
    try {
      // Call the API to change the role
      const response = await apiHooks.changeRoleId(
        user.email,
        selectedRole,
        token,
      );
      if (!response.ok) {
        toast.error(response.error);
      }

      toast.success(response.message + ' please log in again');
      Navigate('/logout');
      handleClose();
    } catch (error) {
      toast.error((error as Error).toString());
      console.error('Failed to change role:', error);
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      toast.error(t('languages.errors.noToken'));
      return;
    }

    try {
      const response = await apiHooks.updateUserLanguage(
        user.email,
        newLanguage,
        token,
      );

      if (response.ok) {
        await i18n.changeLanguage(newLanguage);
        setUser((prev) => (prev ? {...prev, language: newLanguage} : null));
        toast.success(t('languages.success.changed'));
      } else {
        toast.error(t('languages.errors.changeFailed'));
      }
    } catch (error) {
      console.error('Language update error:', error);
      toast.error(t('languages.errors.changeFailed'));
    }
  };

  return (
    <div className='space-y-5'>
      {/* Personal Information Section */}
      <div className='p-4 space-y-4 border-b-2 border-metropoliaMainOrange'>
        <h3 className='mb-3 text-lg font-heading'>{t('profileInfo.sections.personal')}</h3>
        <p className='flex items-center justify-between gap-2'>
          <strong>{t('profileInfo.labels.name')}:</strong>{' '}
          <span className='profileStat'>
            {user.first_name + ' ' + user.last_name}
          </span>
        </p>
        <p className='flex items-center justify-between gap-2'>
          <strong>{t('profileInfo.labels.username')}:</strong>{' '}
          <span className='profileStat'>{user.username}</span>
        </p>
        <p className='flex flex-wrap items-center justify-between gap-1 items-base'>
          <strong>{t('profileInfo.labels.email')}:</strong>{' '}
          <span className='profileStat w-fit'>{user.email}</span>
        </p>
      </div>

      {/* Account Information Section */}
      <div className='p-4 space-y-4 border-b-2 border-metropoliaMainOrange'>
        <h3 className='mb-3 text-lg font-heading'>{t('profileInfo.sections.account')}</h3>
        <p className='flex items-center justify-between gap-2'>
          <strong>{t('profileInfo.labels.accountCreated')}:</strong>{' '}
          <span className='profileStat'>
            {new Date(user.created_at).toLocaleDateString()}
          </span>
        </p>
        <p className='flex items-center justify-between gap-2'>
          <strong>{t('profileInfo.labels.role')}:</strong>{' '}
          <div className='flex items-center gap-2'>
            <span className='profileStat'>{user.role}</span>
            {['counselor', 'teacher'].includes(user.role) && (
              <button
                className='px-2 py-1 text-white transition rounded font-heading bg-metropoliaMainGrey hover:bg-metropoliaTrendLightBlue focus:outline-none focus:shadow-outline'
                onClick={handleOpen}>
                {t('profileInfo.buttons.change')}
              </button>
            )}
          </div>
        </p>
      </div>

      {/* Preferences Section */}
      <div className='p-4 space-y-4'>
        <h3 className='mb-3 text-lg font-heading'>{t('profileInfo.sections.preferences')}</h3>
        <div className='flex items-center justify-between gap-2'>
          <strong>{t('profileInfo.labels.language')}:</strong>{' '}
          <div className='flex gap-2'>
            <button
              onClick={() => handleLanguageChange('en')}
              className={`p-1 rounded ${
                user.language === 'en'
                  ? 'bg-metropoliaMainOrange'
                  : 'bg-metropoliaMainGrey'
              }`}
              title={t('languages.flags.en')}
              aria-label={t('languages.flags.en')}>
              <GB className='w-6 h-4' aria-hidden='true' />
            </button>
            <button
              onClick={() => handleLanguageChange('fi')}
              className={`p-1 rounded ${
                user.language === 'fi'
                  ? 'bg-metropoliaMainOrange'
                  : 'bg-metropoliaMainGrey'
              }`}
              title={t('languages.flags.fi')}
              aria-label={t('languages.flags.fi')}>
              <FI className='w-6 h-4' aria-hidden='true' />
            </button>
            <button
              onClick={() => handleLanguageChange('sv')}
              className={`p-1 rounded ${
                user.language === 'sv'
                  ? 'bg-metropoliaMainOrange'
                  : 'bg-metropoliaMainGrey'
              }`}
              title={t('languages.flags.sv')}
              aria-label={t('languages.flags.sv')}>
              <SE className='w-6 h-4' aria-hidden='true' />
            </button>
          </div>
        </div>
        <p className='flex items-center justify-between gap-2'>
          <strong>{t('profileInfo.labels.activeStatus')}:</strong>{' '}
          <span className='profileStat'>
            {user.activeStatus === 1 ? t('common.yes') : t('common.no')}
          </span>
        </p>
        <p className='flex items-center justify-between gap-2'>
          <strong>{t('profileInfo.labels.darkMode')}:</strong>{' '}
          <span className='profileStat'>
            {user.darkMode === 1 ? t('common.yes') : t('common.no')}
          </span>
        </p>
      </div>

      {/* Role Change Modal */}
      {open && ['counselor', 'teacher'].includes(user.role) && (
        <div className='pb-10 mt-5 border-y-4 border-metropoliaMainOrange pt-7'>
          <h2 className='mb-3 text-lg font-heading sm:text-2xl'>
            {t('profileInfo.roleChange.title')}
          </h2>
          <select
            title={t('profileInfo.roleChange.selectTitle')}
            className='block w-full px-4 py-3 pr-8 leading-tight text-gray-700 bg-white border border-gray-200 rounded appearance-none cursor-pointer focus:outline-none focus:bg-white focus:border-gray-500'
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}>
            {roles.map((role) => (
              <option key={role.roleid} value={role.roleid}>
                {role.name}
              </option>
            ))}
          </select>
          <div className='flex justify-between gap-10 mt-5'>
            <button
              type='button'
              className='px-2 py-1 text-sm text-white transition bg-red-500 rounded font-heading hover:bg-red-700 sm:text-lg sm:py-2 sm:px-4'
              onClick={handleClose}>
              {t('common.cancel')}
            </button>
            <button
              type='button'
              className='px-2 py-1 text-sm text-white transition bg-green-500 rounded font-heading hover:bg-green-700 sm:text-lg sm:py-2 sm:px-4'
              onClick={handleRoleChange}>
              {t('profileInfo.buttons.changeRole')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileInfo;
