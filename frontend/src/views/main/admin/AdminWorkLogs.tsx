import SortIcon from '@mui/icons-material/Sort';
import React, {useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import GeneralLinkButton from '../../../components/main/buttons/GeneralLinkButton';
import InputField from '../../../components/main/course/createcourse/coursedetails/InputField';
import {UserContext} from '../../../contexts/UserContext';
import apiHooks from '../../../api';
import {useTranslation} from 'react-i18next';
import Loader from '../../../utils/Loader';

interface WorkLogCourse {
  work_log_course_id: number;
  name: string;
  start_date: string;
  end_date: string;
  code: string;
  description: string;
  required_hours: number;
  created_at: string;
}

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

const AdminWorkLogs: React.FC = () => {
  const {t} = useTranslation(['admin']);
  const navigate = useNavigate();
  const {user} = useContext(UserContext);
  const [workLogs, setWorkLogs] = useState<WorkLogCourse[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState<keyof WorkLogCourse | 'all'>(
    'all',
  );
  const [sortKey, setSortKey] = useState<keyof WorkLogCourse>('created_at');
  const [isLoading, setIsLoading] = useState(true);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const sortedWorkLogs = [...workLogs].sort((a, b) => {
    const aValue = a[sortKey]?.toString() || '';
    const bValue = b[sortKey]?.toString() || '';
    return sortOrder === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  const sortWorkLogs = (key: keyof WorkLogCourse) => {
    setSortKey(key);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const filteredWorkLogs = sortedWorkLogs.filter((course) => {
    if (!debouncedSearchTerm) return true;

    const searchTermLower = debouncedSearchTerm.toLowerCase().trim();

    if (searchField === 'all') {
      return Object.entries(course).some(([key, value]) => {
        if (key === 'work_log_course_id' || !value) return false;
        return value.toString().toLowerCase().includes(searchTermLower);
      });
    }

    const fieldValue = course[searchField];
    return (
      fieldValue &&
      fieldValue.toString().toLowerCase().includes(searchTermLower)
    );
  });

  // Function to highlight matched text
  const highlightMatch = (text: string, searchTerm: string) => {
    if (!searchTerm || (searchField !== 'all' && searchField !== 'name'))
      return text;

    const searchTermLower = searchTerm.toLowerCase();
    const textLower = text.toLowerCase();

    if (!textLower.includes(searchTermLower)) return text;

    const startIndex = textLower.indexOf(searchTermLower);
    const endIndex = startIndex + searchTermLower.length;

    const before = text.slice(0, startIndex);
    const match = text.slice(startIndex, endIndex);
    const after = text.slice(endIndex);

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

  const handleRowClick = (courseId: number) => {
    navigate(`/admin/worklog/${courseId}`);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchField('all');
  };

  // Search field options
  const searchFields = [
    {value: 'all', label: t('admin:common.allFields')},
    {value: 'name', label: t('admin:worklog.name')},
    {value: 'code', label: t('admin:worklog.code')},
    {value: 'description', label: t('admin:worklog.description')},
  ];

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token available');
      }

      const fetchWorkLogs = async () => {
        try {
          const fetchedWorkLogs = await apiHooks.getWorkLogCourses(token);
          setWorkLogs(fetchedWorkLogs);
        } catch (error) {
          console.error('Error fetching worklog courses:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchWorkLogs();
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
      ) : workLogs.length === 0 ? (
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
            {t('admin:common.noWorkLogsAvailable')}
          </p>
          <p className='text-sm text-metropolia-main-grey/70'>
            {t('admin:common.createFirstWorkLog')}
          </p>
        </div>
      ) : (
        <>
          <GeneralLinkButton
            text={t('admin:worklog.createNewWorkLog')}
            path='/teacher/worklog/create'
            className='transition-transform hover:scale-105 bg-metropolia-main-orange hover:bg-metropolia-main-orange-dark'
          />
          <div className='mt-6 mb-5'>
            <div className='flex flex-col lg:flex-row gap-4 items-start'>
              <div className='relative lg:w-1/3 w-full'>
                <div className='absolute left-3 top-9 text-metropolia-main-grey'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                    />
                  </svg>
                </div>
                <InputField
                  type='text'
                  name='search'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('admin:common.searchPlaceholder')}
                  label={t('admin:common.search')}
                  className='pl-10 focus-within:ring-2 focus-within:ring-metropolia-trend-light-blue transition-all duration-300'
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className='absolute top-9 right-3 text-metropolia-main-grey hover:text-metropolia-support-red transition-colors'
                    aria-label={t('admin:common.clearSearch')}>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-5 w-5'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M6 18L18 6M6 6l12 12'
                      />
                    </svg>
                  </button>
                )}
              </div>
              <div className='lg:w-1/4 w-full'>
                <label className='block text-metropolia-main-grey text-sm font-medium mb-1'>
                  {t('admin:common.searchIn')}
                </label>
                <select
                  value={searchField}
                  onChange={(e) =>
                    setSearchField(
                      e.target.value as keyof WorkLogCourse | 'all',
                    )
                  }
                  className='w-full rounded-md border-gray-300 shadow-sm focus:border-metropolia-trend-light-blue focus:ring focus:ring-metropolia-trend-light-blue focus:ring-opacity-50'>
                  {searchFields.map((field) => (
                    <option key={field.value} value={field.value}>
                      {field.label}
                    </option>
                  ))}
                </select>
              </div>
              {debouncedSearchTerm && (
                <div className='lg:ml-auto lg:mt-8 mt-2'>
                  <p className='text-sm text-metropolia-main-grey'>
                    {t('admin:common.resultsFound', {
                      count: filteredWorkLogs.length,
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className='relative bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg overflow-hidden shadow-inner border border-gray-200'>
            <div className='relative overflow-y-scroll max-h-96 h-96 scrollbar-thin scrollbar-thumb-metropolia-main-orange scrollbar-track-gray-100'>
              <table className='w-full table-auto'>
                <thead className='sticky top-0 z-10 bg-gradient-to-r from-metropolia-main-orange/90 to-metropolia-secondary-orange/90 text-white shadow-md'>
                  <tr>
                    {[
                      {key: 'name', label: 'name'},
                      {key: 'code', label: 'code'},
                      {key: 'start_date', label: 'startDate'},
                      {key: 'end_date', label: 'endDate'},
                      {key: 'required_hours', label: 'requiredHours'},
                      {key: 'description', label: 'description'},
                    ].map(({key, label}) => (
                      <th
                        key={key}
                        className='px-4 py-3 font-semibold text-left transition-colors'>
                        <span>{t(`admin:worklog.${label}`)}</span>
                        <button
                          aria-label={`Sort by ${label}`}
                          className='p-1 ml-2 text-sm rounded-full bg-white/20 hover:bg-white/40 transition-all duration-200
                          focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95'
                          onClick={() =>
                            sortWorkLogs(key as keyof WorkLogCourse)
                          }>
                          <SortIcon className='w-4 h-4' />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkLogs.map((course) => (
                    <tr
                      key={course.work_log_course_id}
                      className='hover:bg-gray-200 cursor-pointer transition-colors duration-200'
                      onClick={() => handleRowClick(course.work_log_course_id)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleRowClick(course.work_log_course_id);
                        }
                      }}
                      role='button'
                      aria-label={`View details for ${course.name}`}>
                      <td className='px-2 py-2 border'>
                        {highlightMatch(course.name, debouncedSearchTerm)}
                      </td>
                      <td className='px-2 py-2 border'>
                        {highlightMatch(course.code, debouncedSearchTerm)}
                      </td>
                      <td className='px-2 py-2 border'>
                        {new Date(course.start_date).toLocaleDateString()}
                      </td>
                      <td className='px-2 py-2 border'>
                        {new Date(course.end_date).toLocaleDateString()}
                      </td>
                      <td className='px-2 py-2 border'>
                        {course.required_hours}
                      </td>
                      <td className='px-2 py-2 border'>
                        {highlightMatch(
                          course.description,
                          debouncedSearchTerm,
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {filteredWorkLogs.length === 0 && debouncedSearchTerm && (
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

export default AdminWorkLogs;
