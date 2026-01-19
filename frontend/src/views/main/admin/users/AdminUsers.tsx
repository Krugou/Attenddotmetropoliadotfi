import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import Loader from '../../../../utils/Loader.tsx';
import apiHooks from '../../../../api';
import useDebounce from '../../../../hooks/useDebounce.ts';
import { UserContext } from '../../../../contexts/UserContext.tsx';
import SearchField from '../../../../components/ui/inputs/SearchField.tsx';
import GeneralLinkButton from '../../../../components/ui/buttons/GeneralLinkButton.tsx';
import UserTable from '../../../../components/internal/admin/AdminUsers/UserTable.tsx';
import { useSearchFields } from '../../../../hooks/useSearchFields.ts';
import { highlightMatch } from '../../../../utils/highlightMatch.tsx';


/**
 * AdminUsers view.
 * Provides admin functionalities to view, search, filter, and sort users.
 */
const AdminUsers: React.FC = () => {
  const { t } = useTranslation(['admin']);
  const { user } = useContext(UserContext);

  const [users, setUsers] = useState<any[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortKey, setSortKey] = useState('last_name');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const sortUsers = (key: string) => {
    setSortKey(key);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchField('all');
  };

  const searchFields = useSearchFields();

  const toggleInactiveUsers = () => {
    setShowInactive(!showInactive);
  };

  /*const searchFields = [
    { value: 'all', label: t('admin:ui.allFields') },
    { value: 'last_name', label: t('admin:users.lastName') },
    { value: 'first_name', label: t('admin:users.firstName') },
    { value: 'email', label: t('admin:users.email') },
    { value: 'username', label: t('admin:users.username') },
    { value: 'role', label: t('admin:users.role') },
  ];

  const highlightMatch = (text: string | number | undefined, searchTerm: string) => {
    if (
      !text ||
      !searchTerm ||
      (searchField !== 'all' && searchField !== sortKey)
    ) {
      return text?.toString() || '';
    }

    const textStr = text.toString();
    const searchTermLower = searchTerm.toLowerCase();
    const textLower = textStr.toLowerCase();

    if (!textLower.includes(searchTermLower)) {
      return textStr;
    }

    const startIndex = textLower.indexOf(searchTermLower);
    const endIndex = startIndex + searchTermLower.length;

    return (
      <>
        {textStr.slice(0, startIndex)}
        <span className='bg-metropolia-support-yellow text-metropolia-main-grey font-medium px-1 rounded'>
          {textStr.slice(startIndex, endIndex)}
        </span>
        {textStr.slice(endIndex)}
      </>
    );
  };*/

  const sortedUsers = [...users].sort((a, b) => {
    if (a[sortKey] < b[sortKey]) return sortOrder === 'asc' ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredUsers = sortedUsers
    .filter((user) => showInactive || user.activeStatus === 1)
    .filter((user) =>
      Object.values(user).some(
        (value) =>
          typeof value === 'string' &&
          value.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
      ),
    );

  const inactiveUsersCount = users.filter((user) => user.activeStatus === 0).length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const token = localStorage.getItem('userToken');
    if (token && user) {
      const fetchedUsers = await apiHooks.fetchUsers(token);
      const otherUsers = fetchedUsers.filter(
        (fetchedUser) => fetchedUser.userid !== user.userid,
      );
      setUsers(otherUsers);
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No token available');

      const fetchUsers = async () => {
        const fetchedUsers = await apiHooks.fetchUsers(token);
        const otherUsers = fetchedUsers.filter(
          (fetchedUser) => fetchedUser.userid !== user.userid,
        );
        setUsers(otherUsers);
        setIsLoading(false);
      };

      fetchUsers();
    }
  }, [user]);

  return (
    <div className='relative w-full p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 lg:w-fit'>
      {isLoading ? (
        <div className='flex flex-col items-center justify-center h-64 gap-4'>
          <Loader />
          <p className='text-metropolia-main-grey animate-pulse font-medium'>
            {t('ui.loading')}
          </p>
        </div>
      ) : users.length === 0 ? (
        <div className='flex flex-col items-center justify-center h-64 gap-3 text-center'>
          <p className='text-lg font-semibold text-metropolia-main-grey'>
            {t('ui.noUsersAvailable')}
          </p>
          <p className='text-sm text-metropolia-main-grey/70'>
            {t('ui.createFirstUser')}
          </p>
        </div>
      ) : (
        <>
          <div className='flex justify-between items-center mb-8'>
            <GeneralLinkButton
              text={t('users.createNewUser')}
              path='/admin/newuser/'
              className='transition-transform hover:scale-105 bg-metropolia-main-orange hover:bg-metropolia-main-orange-dark shadow-lg hover:shadow-xl'
            />

            {inactiveUsersCount > 0 && (
              <button
                onClick={toggleInactiveUsers}
                className={`flex items-center gap-2 px-4 py-2 ml-4 text-white rounded-md transition-colors ${
                  showInactive
                    ? 'bg-metropolia-support-blue hover:bg-metropolia-support-blue-dark'
                    : 'bg-metropolia-support-secondary-red hover:bg-metropolia-support-secondary-red-dark'
                } shadow-md hover:shadow-lg`}>
                {showInactive ? (
                  <VisibilityIcon className='w-5 h-5' />
                ) : (
                  <VisibilityOffIcon className='w-5 h-5' />
                )}
                <span className='hidden sm:inline'>
                  {showInactive
                    ? t('users.hideInactive')
                    : t('users.showInactive')}
                </span>
                <span className='ml-1 inline-flex items-center justify-center w-6 h-6 bg-white text-metropolia-main-grey text-xs font-medium rounded-full'>
                  {inactiveUsersCount}
                </span>
              </button>
            )}
          </div>

          <div className='flex justify-end mb-4'>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className='px-2 py-1 text-white transition rounded-sm font-heading bg-metropolia-main-orange h-fit hover:bg-metropolia-secondary-orange disabled:opacity-50 disabled:cursor-not-allowed sm:py-2 sm:px-4'>
              <RefreshIcon
                className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </button>
          </div>

          <div className='mb-8 p-6 bg-white rounded-lg shadow-md border border-gray-100'>
            <SearchField
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              searchField={searchField}
              onSearchFieldChange={setSearchField}
              onClearSearch={clearSearch}
              searchFields={searchFields}
              placeholder={t('ui.searchPlaceholder')}
              searchLabel={t('ui.search')}
              searchInLabel={t('ui.searchIn')}
              resultsCount={filteredUsers.length}
            />
          </div>

          <UserTable
            filteredUsers={filteredUsers}
            sortUsers={sortUsers}
            highlightMatch={(text) =>
              highlightMatch(text, debouncedSearchTerm, searchField, sortKey)
            }
            debouncedSearchTerm={debouncedSearchTerm}
          />
        </>
      )}
    </div>
  );
};

export default AdminUsers;
