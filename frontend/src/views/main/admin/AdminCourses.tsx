import SortIcon from '@mui/icons-material/Sort';
import RefreshIcon from '@mui/icons-material/Refresh';
import React, {useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import GeneralLinkButton from '../../../components/main/buttons/GeneralLinkButton';
import {UserContext} from '../../../contexts/UserContext';
import apiHooks from '../../../api';
import {useTranslation} from 'react-i18next';
import Loader from '../../../utils/Loader';
import SearchField from '../../../components/main/shared/SearchField';

/**
 * Course interface.
 * This interface defines the structure of a course object.
 *
 * @interface
 * @property {string} courseid - The ID of the course.
 * @property {string} name - The name of the course.
 * @property {string} code - The code of the course.
 * @property {string} start_date - The start date of the course.
 * @property {string} end_date - The end date of the course.
 * @property {string[]} student_group - The student groups of the course.
 * @property {string[]} topics - The topics of the course.
 * @property {string[]} instructors - The instructors of the course.
 */
interface Course {
  courseid: string;
  name: string;
  code: string;
  start_date: string;
  end_date: string;
  student_group: string[];
  topics: string[];
  instructors: string[];
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

/**
 * AdminCourses component.
 * This component is responsible for rendering a list of courses for an admin.
 * It fetches the courses from the API, and allows the admin to sort and filter them.
 * If the data is loading, it renders a loading spinner.
 * If no courses are available, it renders an error message.
 *
 * @returns {JSX.Element} The rendered AdminCourses component.
 */
const AdminCourses: React.FC = () => {
  const {t} = useTranslation(['admin']);
  const navigate = useNavigate();
  const {user} = useContext(UserContext);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState<keyof Course | 'all'>('all');
  const [sortKey, setSortKey] = useState<keyof Course>('name');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const sortedCourses = [...courses].sort((a, b) => {
    if (a[sortKey] < b[sortKey]) return sortOrder === 'asc' ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const navigateToCourse = (courseId: string) => {
    navigate(`./${courseId}`);
  };

  const sortCourses = (key: string) => {
    setSortKey(key as keyof Course);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const highlightMatch = (text: string, searchTerm: string) => {
    if (!searchTerm || (searchField !== 'all' && searchField !== 'name'))
      return text;

    const searchTermLower = searchTerm.toLowerCase();
    const textLower = text.toString().toLowerCase();

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

  const clearSearch = () => {
    setSearchTerm('');
    setSearchField('all');
  };

  // Search field options
  const searchFields = [
    {value: 'all', label: t('admin:common.allFields')},
    {value: 'name', label: t('admin:course.name')},
    {value: 'code', label: t('admin:course.code')},
    {value: 'student_group', label: t('admin:course.studentGroup')},
    {value: 'topics', label: t('admin:course.topics')},
  ];

  const filteredCourses = sortedCourses.filter((course) =>
    Object.values(course).some(
      (value) =>
        typeof value === 'string' &&
        value.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
    ),
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const token: string | null = localStorage.getItem('userToken');
    if (token) {
      const fetchedCourses = await apiHooks.getCourses(token);
      const coursesWithUniqueTopics = fetchedCourses.map((course) => ({
        ...course,
        topics: [...new Set(course.topics)],
      }));
      setCourses(coursesWithUniqueTopics);
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

      const fetchCourses = async () => {
        const fetchedCourses = await apiHooks.getCourses(token);
        const coursesWithUniqueTopics = fetchedCourses.map((course) => ({
          ...course,
          topics: [...new Set(course.topics)],
        }));

        setCourses(coursesWithUniqueTopics);
        setIsLoading(false);
      };

      fetchCourses();
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
      ) : courses.length === 0 ? (
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
            {t('admin:common.noCoursesAvailable')}
          </p>
          <p className='text-sm text-metropolia-main-grey/70'>
            {t('admin:common.createFirstCourse')}
          </p>
        </div>
      ) : (
        <>
          <GeneralLinkButton
            text='Create New Course'
            path='/teacher/courses/create'
            className='transition-transform hover:scale-105 bg-metropolia-main-orange hover:bg-metropolia-main-orange-dark'
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
          <div className='mt-6 mb-5'>
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
              resultsCount={filteredCourses.length}
              className='bg-white p-4 rounded-lg shadow-md'
            />
          </div>
          <div className='relative bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg overflow-hidden shadow-inner border border-gray-200'>
            <div className='relative overflow-y-scroll max-h-96 h-96 scrollbar-thin scrollbar-thumb-metropolia-main-orange scrollbar-track-gray-100'>
              <table className='w-full table-auto'>
                <thead className='sticky top-0 z-10 bg-gradient-to-r from-metropolia-main-orange/90 to-metropolia-secondary-orange/90 text-white shadow-md'>
                  <tr>
                    {[
                      'name',
                      'code',
                      'start_date',
                      'end_date',
                      'student_group',
                      'topics',
                      'instructors',
                    ].map((key, index) => (
                      <th
                        key={index}
                        className='px-4 py-3 font-semibold text-left transition-colors'>
                        {key}
                        <button
                          aria-label={`Sort by ${key}`}
                          className='p-1 ml-2 text-sm rounded-full bg-white/20 hover:bg-white/40 transition-all duration-200
                          focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95'
                          onClick={() => sortCourses(key)}>
                          <SortIcon className='w-4 h-4' />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course, index) => (
                    <tr
                      key={index}
                      className='hover:bg-gray-200 cursor-pointer transition-colors duration-200'
                      onClick={() => navigateToCourse(course.courseid)}>
                      {[
                        'name',
                        'code',
                        'start_date',
                        'end_date',
                        'student_group',
                        'topics',
                        'instructors',
                      ].map((key, innerIndex) => (
                        <td key={innerIndex} className='px-2 py-2 border'>
                          {key === 'start_date' || key === 'end_date'
                            ? new Date(course[key]).toLocaleDateString()
                            : Array.isArray(course[key])
                            ? course[key].join(', ')
                            : highlightMatch(
                                course[key].toString(),
                                debouncedSearchTerm,
                              )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {filteredCourses.length === 0 && debouncedSearchTerm && (
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

export default AdminCourses;
