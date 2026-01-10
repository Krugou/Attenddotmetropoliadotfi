import React, {useEffect, useState, useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import apiHooks from '../../../api';
import {useTranslation} from 'react-i18next';
import {UserContext} from '../../../contexts/UserContext.tsx';
import LanguageSwitcher from '../../ui/LanguageSwitcher.tsx';
import EditRounded from '@mui/icons-material/EditRounded';

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
    studentnumber?: string;
    group_name?: string;
  };
}

interface Role {
  roleid: string;
  name: string;
}

const ProfileInfo: React.FC<ProfileInfoPros> = ({user}) => {
  const {t, i18n} = useTranslation(['common']);
  const {user: currentUser, setUser} = useContext(UserContext);
  const canChangeRole = currentUser?.role === 'admin';

  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState('');


  useEffect(() => {
    const fetchRoles = async () => {
      if (!canChangeRole) return;

      const token: string | null = localStorage.getItem('userToken');
      if (!token) throw new Error('No token available');

      try {
        const roles = await apiHooks.fetchAllRolesSpecial(token);
        setRoles(roles);
        setSelectedRole(roles[0]?.roleid || '');
      } catch (error) {
        console.error('Failed to fetch roles:', error);
        toast.error(t('profileInfo.errors.roleFetchFailed'));
      }
    };

    fetchRoles();
  }, [canChangeRole, t]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleRoleChange = async () => {
    const token: string | null = localStorage.getItem('userToken');
    if (!token) throw new Error('No token available');

    try {
      const response = await apiHooks.changeRoleId(user.email, selectedRole, token);
      if (!response.ok) {
        toast.error(response.error);
        return;
      }

      toast.success(response.message + ' please log in again');
      navigate('/logout');
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
      const response = await apiHooks.updateUserLanguage(user.email, newLanguage, token);

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

  // ---- UI helper “row” ----
  const Row = ({
                 label,
                 value,
                 right,
               }: {
    label: React.ReactNode;
    value?: React.ReactNode;
    right?: React.ReactNode;
  }) => (
    <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-1 sm:gap-4 py-3 border-b border-gray-100">
      <div className="text-sm text-gray-600 font-heading">{label}</div>
      <div className="min-w-0 flex items-center justify-between gap-3">
        <div className="min-w-0 text-sm text-gray-900 font-body break-words">{value}</div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
    </div>
  );

  return (
    <div>
      {/* Outer card */}
      <div className="w-full mx-auto px-3 sm:px-0 max-w-3xl min-w-80 lg:max-w-4xl bg-white rounded-2xl shadow-md border border-metropolia-main-orange/20 overflow-hidden">
        {/* Content */}
        <div className="px-4 py-5 sm:px-6 sm:py-8">
          {/* Personal */}
          <div>
            <h3 className="text-base font-heading text-gray-900">
              {t('profileInfo.sections.personal')}
            </h3>
            <div className="mt-2">
              <Row
                label={t('profileInfo.labels.name')}
                value={`${user.first_name} ${user.last_name}`}
              />
              <Row label={t('profileInfo.labels.username')} value={user.username} />
              <Row label={t('profileInfo.labels.email')} value={user.email} />
              {user.role === 'student' && user.studentnumber ? (
                <p className="flex items-center justify-between gap-2">
                  <Row label={t('profileInfo.labels.studentNumber')} value={user.studentnumber} />
                </p>
              ) : null}
              {user.role === 'student' && user.group_name ? (
                <p className="flex items-center justify-between gap-2">
                  <Row label={t('profileInfo.labels.studentGroup')} value={user.group_name} />
                </p>
              ) : null}
            </div>
          </div>

          {/* Account */}
          <div className="mt-7">
            <h3 className="text-base font-heading text-gray-900">
              {t('profileInfo.sections.account')}
            </h3>
            <div className="mt-2">
              <Row
                label={t('profileInfo.labels.accountCreated')}
                value={new Date(user.created_at).toLocaleDateString()}
              />
              <Row
                label={t('profileInfo.labels.role')}
                value={
                  <span className="inline-flex items-center gap-2">
                    <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-800 text-sm font-heading">
                      {user.role}
                    </span>
                  </span>
                }
                right={
                  canChangeRole ? (
                    <button
                      onClick={handleOpen}
                      type="button"
                      title={t('profileInfo.buttons.change')}
                      aria-label={t('profileInfo.buttons.change')}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-metropolia-main-orange hover:bg-metropolia-main-orange/10 transition">
                      <EditRounded fontSize="small" />
                    </button>
                  ) : null
                }
              />
            </div>
          </div>

          {/* Preferences */}
          <div className="mt-7">
            <h3 className="text-base font-heading text-gray-900">
              {t('profileInfo.sections.preferences')}
            </h3>
            <div className="mt-2">
              <Row
                label={t('profileInfo.labels.language')}
                value={
                  <LanguageSwitcher
                    currentLanguage={user.language}
                    onLanguageChange={handleLanguageChange}
                  />
                }
              />
              <Row
                label={t('profileInfo.labels.activeStatus')}
                value={
                  <span className="inline-flex items-center gap-2">
                    <span
                      className={[
                        'inline-flex items-center px-2 py-1 rounded-md text-sm font-heading',
                        user.activeStatus === 1
                          ? 'bg-green-50 text-metropolia-trend-green'
                          : 'bg-gray-100 text-gray-700',
                      ].join(' ')}
                    >
                      {user.activeStatus === 1 ? t('yes') : t('no')}
                    </span>
                  </span>
                }
              />
              <Row
                label={t('profileInfo.labels.darkMode')}
                value={
                  <span className="inline-flex items-center gap-2">
                    <span
                      className={[
                        'inline-flex items-center px-2 py-1 rounded-md text-sm font-heading',
                        user.darkMode === 1
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-700',
                      ].join(' ')}
                    >
                      {user.darkMode === 1 ? t('yes') : t('no')}
                    </span>
                  </span>
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Role change */}
      {open && canChangeRole ? (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
          {/* backdrop */}
          <button
            aria-label="Close"
            className="absolute inset-0 bg-black/30"
            onClick={handleClose}
          />

          {/* dialog */}
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-metropolia-main-orange/25 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg sm:text-xl font-heading text-gray-900">
                {t('profileInfo.roleChange.title')}
              </h2>
              <p className="mt-1 text-sm text-gray-600 font-body">
                {t('profileInfo.roleChange.selectTitle')}
              </p>
            </div>

            <div className="px-6 py-5">
              <select
                title={t('profileInfo.roleChange.selectTitle')}
                className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-white
                           text-gray-900 font-body
                           focus:outline-none focus:ring-2 focus:ring-metropolia-main-orange/40"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                {roles.map((role) => (
                  <option key={role.roleid} value={role.roleid}>
                    {role.name}
                  </option>
                ))}
              </select>

              <div className="mt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl text-sm font-heading
                             bg-gray-100 text-gray-800 hover:bg-gray-200 transition
                             focus:outline-none focus:ring-2 focus:ring-gray-300"
                  onClick={handleClose}
                >
                  {t('cancel')}
                </button>

                <button
                  type="button"
                  className="px-4 py-2 rounded-xl text-sm font-heading
                             bg-metropolia-main-orange text-white hover:brightness-95 transition
                             focus:outline-none focus:ring-2 focus:ring-metropolia-main-orange/40"
                  onClick={handleRoleChange}
                >
                  {t('profileInfo.buttons.changeRole')}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProfileInfo;
