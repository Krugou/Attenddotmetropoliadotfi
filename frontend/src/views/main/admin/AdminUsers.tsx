import SortIcon from '@mui/icons-material/Sort';
import RefreshIcon from '@mui/icons-material/Refresh';
import React, {useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import GeneralLinkButton from '../../../components/main/buttons/GeneralLinkButton';
import InputField from '../../../components/main/course/createcourse/coursedetails/InputField';
import {UserContext} from '../../../contexts/UserContext';
import apiHooks from '../../../api';
import {useTranslation} from 'react-i18next';
import Loader from '../../../utils/Loader';
import SearchField from '../../../components/main/shared/SearchField';

// Add custom hook for debounced value
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * AdminUsers component.
 * This component is responsible for rendering a list of users for an admin.
 * It fetches the user data from the UserContext and the API, and allows the admin to sort and filter the users.
 * If no user data is available, it renders an error message.
 * If the data is loading, it renders a loading spinner.
 *
 * @returns {JSX.Element} The rendered AdminUsers component.
 */
const AdminUsers: React.FC = () => {
  const {t} = useTranslation(['admin']);
  const {user} = useContext(UserContext);
  const [users, setUsers] = useState<any[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState<string>('all');
  const [sortKey, setSortKey] = useState('last_name');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const sortedUsers = [...users].sort((a, b) => {
    if (a[sortKey] < b[sortKey]) return sortOrder === 'asc' ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const sortUsers = (key: string) => {
    setSortKey(key);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchField('all');
  };

  const searchFields = [
    {value: 'all', label: t('admin:common.allFields')},
    {value: 'last_name', label: t('admin:users.lastName')},
    {value: 'first_name', label: t('admin:users.firstName')},
    {value: 'email', label: t('admin:users.email')},
    {value: 'username', label: t('admin:users.username')},
    {value: 'role', label: t('admin:users.role')},
  ];

  const highlightMatch = (
    text: string | number | undefined,
    searchTerm: string,
  ) => {
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

    const before = textStr.slice(0, startIndex);
    const match = textStr.slice(startIndex, endIndex);
    const after = textStr.slice(endIndex);

    return (
      <>
        {before}
        <span className='bg-metropolia-support-yellow text-metropolia-main-grey font-medium px-1 rounded'>
          {match}
        </span>
        {after}
      </>
    );
  };

  const filteredUsers = sortedUsers.filter((user) =>
    Object.values(user).some(
      (value) =>
        typeof value === 'string' &&
        value.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
    ),
  );

  const navigate = useNavigate();

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
      // Get token from local storage
      const token: string | null = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token available');
      }

      // Create an async function inside the effect
      const fetchUsers = async () => {
        const fetchedUsers = await apiHooks.fetchUsers(token);
        // Filter out the current user
        const otherUsers = fetchedUsers.filter(
          (fetchedUser) => fetchedUser.userid !== user.userid,
        );
        setUsers(otherUsers);

        setIsLoading(false);
      };

      // Call the async function
      fetchUsers();
    }
  }, [user]);

  return (
    <div className='relative w-full p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 lg:w-fit transition-all duration-300 hover:shadow-xl'>
      {isLoading ? (
        <div className='flex flex-col items-center justify-center h-64 gap-4'>
          <Loader />
          <p className='text-metropolia-main-grey animate-pulse font-medium'>
            {t('admin:common.loading')}
          </p>
        </div>
      ) : users.length === 0 ? (
        <div className='flex flex-col items-center justify-center h-64 gap-3 text-center'>
          <div className='w-16 h-16 mb-2 rounded-full bg-metropolia-trend-light-blue/20 flex items-center justify-center'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='w-8 h-8 text-metropolia-trend-light-blue'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </div>
          <p className='text-lg font-semibold text-metropolia-main-grey'>
            {t('admin:common.noUsersAvailable')}
          </p>
          <p className='text-sm text-metropolia-main-grey/70'>
            {t('admin:common.createFirstUser')}
          </p>
        </div>
      ) : (
        <>
          <GeneralLinkButton
            text='Create New User'
            path='/admin/newuser/'
            buttonClassName='mb-8 transition-transform hover:scale-105 bg-metropolia-main-orange hover:bg-metropolia-main-orange-dark shadow-lg hover:shadow-xl'
          />
          <div className='flex justify-end mb-4'>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className='px-2 py-1 text-white transition rounded-sm font-heading bg-metropolia-main-orange h-fit hover:bg-metropolia-secondary-orange disabled:opacity-50 disabled:cursor-not-allowed sm:py-2 sm:px-4 focus:outline-hidden focus:shadow-outline'
              aria-label={t('admin:common.refresh')}
              title={t('admin:common.refresh')}>
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
              placeholder={t('admin:common.searchPlaceholder')}
              searchLabel={t('admin:common.search')}
              searchInLabel={t('admin:common.searchIn')}
              resultsCount={filteredUsers.length}
            />
          </div>
          <div className='relative bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg overflow-hidden shadow-inner border border-gray-200'>
            <div className='relative overflow-y-scroll max-h-96 h-96 scrollbar-thin scrollbar-thumb-metropolia-main-orange scrollbar-track-gray-100'>
              <table className='w-full table-auto'>
                <thead className='sticky top-0 z-10 bg-gradient-to-r from-metropolia-main-orange/90 to-metropolia-secondary-orange/90 text-white shadow-md'>
                  <tr>
                    {[
                      'last_name',
                      'email',
                      'username',
                      'first_name',
                      'role',
                      'studentnumber',
                      'created_at',
                      'activeStatus',
                    ].map((key, index) => (
                      <th
                        key={index}
                        className='px-4 py-3 font-semibold text-left transition-colors'>
                        {key}
                        <button
                          aria-label={`Sort by ${key}`}
                          className='p-1 ml-2 text-sm rounded-full bg-white/20 hover:bg-white/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95'
                          onClick={() => sortUsers(key)}>
                          <SortIcon className='w-4 h-4' />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(
                    (user: Record<string, string | number>, index: number) => (
                      <tr
                        key={index}
                        onClick={() =>
                          navigate(`/admin/users/${user.userid}/modify`)
                        }
                        className='hover:bg-gray-200 cursor-pointer transition-colors duration-200'>
                        {[
                          'last_name',
                          'email',
                          'username',
                          'first_name',
                          'role',
                          'studentnumber',
                          'created_at',
                          'activeStatus',
                        ].map((key, innerIndex) => (
                          <td key={innerIndex} className='px-2 py-2 border'>
                            {key === 'activeStatus'
                              ? user[key] === 1
                                ? 'Yes'
                                : 'No'
                              : highlightMatch(
                                  user[key]?.toString(),
                                  debouncedSearchTerm,
                                )}
                          </td>
                        ))}
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {filteredUsers.length === 0 && debouncedSearchTerm && (
            <div className='mt-4 text-center py-8 bg-gray-50 rounded-lg border border-gray-200'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-12 w-12 mx-auto text-metropolia-main-grey/50 mb-2'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              <p className='text-lg font-medium text-metropolia-main-grey'>
                {t('admin:common.noResultsFound')}
              </p>
              <p className='text-sm text-metropolia-main-grey/70 mt-1'>
                {t('admin:common.tryDifferentSearch')}
              </p>
              <button
                onClick={clearSearch}
                className='mt-4 px-4 py-2 bg-metropolia-trend-light-blue text-white rounded-md hover:bg-metropolia-trend-light-blue-dark transition-colors'>
                {t('admin:common.clearSearch')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminUsers;
