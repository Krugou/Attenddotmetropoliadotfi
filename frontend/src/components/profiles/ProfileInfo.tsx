import React, {useEffect, useState, useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import apiHooks from '../../api';
import {useTranslation} from 'react-i18next';
import {UserContext} from '../../contexts/UserContext';
import LanguageSwitcher from '../common/LanguageSwitcher';

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
  const {t, i18n} = useTranslation(['common']);
  const {setUser} = useContext(UserContext);
  // Define navigate
  const Navigate = useNavigate();
  // Define state variables for the modal
  const [open, setOpen] = useState(false);
  // Define state variables for the roles
  const [roles, setRoles] = useState<Role[]>([]);
  // Define state variable for the selected role
  const [selectedRole, setSelectedRole] = useState('');

  // Fetch the roles when the component is mounted, but only if user is counselor or teacher
  useEffect(() => {
    const fetchRoles = async () => {
      if (!['counselor', 'teacher'].includes(user.role)) {
        return;
      }

      const token: string | null = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token available');
      }

      try {
        const roles = await apiHooks.fetchAllRolesSpecial(token);
        setRoles(roles);
        setSelectedRole(roles[0]?.roleid || '');
      } catch (error) {
        console.error('Failed to fetch roles:', error);
        toast.error(t('common:profileInfo.errors.roleFetchFailed'));
      }
    };

    fetchRoles();
  }, [user.role, t]); // Add user.role as dependency

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
      toast.error(t('common:languages.errors.noToken'));
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
        toast.success(t('common:languages.success.changed'));
      } else {
        toast.error(t('common:languages.errors.changeFailed'));
      }
    } catch (error) {
      console.error('Language update error:', error);
      toast.error(t('common:languages.errors.changeFailed'));
    }
  };

  return (
    <div className='space-y-5'>
      {/* Personal Information Section */}
      <div className='p-4 space-y-4 border-b-2 border-metropolia-main-orange'>
        <h3 className='mb-3 text-lg font-heading'>
          {t('common:profileInfo.sections.personal')}:
        </h3>
        <p className='flex items-center justify-between gap-2'>
          <strong>{t('common:profileInfo.labels.name')}:</strong>{' '}
          <span className='profileStat'>
            {user.first_name + ' ' + user.last_name}
          </span>
        </p>
        <p className='flex items-center justify-between gap-2'>
          <strong>{t('common:profileInfo.labels.username')}:</strong>{' '}
          <span className='profileStat'>{user.username}</span>
        </p>
        <p className='flex flex-wrap items-center justify-between gap-1 items-base'>
          <strong>{t('common:profileInfo.labels.email')}:</strong>{' '}
          <span className='profileStat w-fit'>{user.email}</span>
        </p>
      </div>

      {/* Account Information Section */}
      <div className='p-4 space-y-4 border-b-2 border-metropolia-main-orange'>
        <h3 className='mb-3 text-lg font-heading'>
          {t('common:profileInfo.sections.account')}:
        </h3>
        <p className='flex items-center justify-between gap-2'>
          <strong>{t('common:profileInfo.labels.accountCreated')}:</strong>{' '}
          <span className='profileStat'>
            {new Date(user.created_at).toLocaleDateString()}
          </span>
        </p>
        <p className='flex items-center justify-between gap-2'>
          <strong>{t('common:profileInfo.labels.role')}:</strong>{' '}
          <div className='flex items-center gap-2'>
            <span className='profileStat'>{user.role}</span>
            {['counselor', 'teacher'].includes(user.role) && (
              <button
                className='px-2 py-1 text-white transition rounded-sm font-heading bg-metropolia-main-grey hover:bg-metropolia-trend-light-blue focus:outline-hidden focus:shadow-outline'
                onClick={handleOpen}>
                {t('common:profileInfo.buttons.change')}
              </button>
            )}
          </div>
        </p>
      </div>

      {/* Preferences Section */}
      <div className='p-4 space-y-4'>
        <h3 className='mb-3 text-lg font-heading'>
          {t('common:profileInfo.sections.preferences')}:
        </h3>
        <div className='flex items-center justify-between gap-2'>
          <strong>{t('common:profileInfo.labels.language')}:</strong>{' '}
          <LanguageSwitcher
            currentLanguage={user.language}
            onLanguageChange={handleLanguageChange}
          />
        </div>
        <p className='flex items-center justify-between gap-2'>
          <strong>{t('common:profileInfo.labels.activeStatus')}:</strong>{' '}
          <span className='profileStat'>
            {user.activeStatus === 1 ? t('common:yes') : t('common:no')}
          </span>
        </p>
        <p className='flex items-center justify-between gap-2'>
          <strong>{t('common:profileInfo.labels.darkMode')}:</strong>{' '}
          <span className='profileStat'>
            {user.darkMode === 1 ? t('common:yes') : t('common:no')}
          </span>
        </p>
      </div>

      {/* Role Change Modal */}
      {open && ['counselor', 'teacher'].includes(user.role) && (
        <div className='pb-10 mt-5 border-y-4 border-metropolia-main-orange pt-7'>
          <h2 className='mb-3 text-lg font-heading sm:text-2xl'>
            {t('common:profileInfo.roleChange.title')}
          </h2>
          <select
            title={t('common:profileInfo.roleChange.selectTitle')}
            className='block w-full px-4 py-3 pr-8 leading-tight text-gray-700 bg-white border border-gray-200 rounded-sm appearance-none cursor-pointer focus:outline-hidden focus:bg-white focus:border-gray-500'
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
              className='px-2 py-1 text-sm text-white transition bg-red-500 rounded-sm font-heading hover:bg-red-700 sm:text-lg sm:py-2 sm:px-4'
              onClick={handleClose}>
              {t('common:cancel')}
            </button>
            <button
              type='button'
              className='px-2 py-1 text-sm text-white transition bg-green-500 rounded-sm font-heading hover:bg-green-700 sm:text-lg sm:py-2 sm:px-4'
              onClick={handleRoleChange}>
              {t('common:profileInfo.buttons.changeRole')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileInfo;
