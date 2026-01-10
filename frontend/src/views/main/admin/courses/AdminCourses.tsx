import RefreshIcon from '@mui/icons-material/Refresh';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GeneralLinkButton from '../../../../components/ui/buttons/GeneralLinkButton.tsx';
import { UserContext } from '../../../../contexts/UserContext.tsx';
import apiHooks from '../../../../api';
import { useTranslation } from 'react-i18next';
import Loader from '../../../../utils/Loader.tsx';
import SearchField from '../../../../components/ui/inputs/SearchField.tsx';
import CourseTable from '../../../../components/internal/admin/AdminCourses/CourseTable.tsx';
import OlderCoursesNotice from '../../../../components/internal/admin/AdminCourses/OlderCoursesNotice.tsx';
import EmptyCoursesMessage from '../../../../components/internal/admin/AdminCourses/EmptyCoursesMessage.tsx';
import ToggleOlderCoursesButton from '../../../../components/internal/admin/AdminCourses/ToggleOlderCoursesButton.tsx';
import useDebounce from '../../../../hooks/useDebounce.ts';
import { Course } from '../../../../types/course.ts'

/**
 * AdminCourses View
 *
 * Displays a searchable and sortable list of courses for admin users.
 * Includes support for showing/hiding older courses, refreshing data, and navigating to course detail views.
 * Leverages reusable UI components like CourseTable, SearchField, and toggle buttons.
 *
 * @returns JSX.Element
 */

const AdminCourses: React.FC = () => {
  const { t } = useTranslation(['admin']);
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortKey, setSortKey] = useState<keyof Course>('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState<keyof Course | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showOlderCourses, setShowOlderCourses] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);


  // TODO: Siirto omaksi tiedostoksi, esim. utils/isOlderCourse.ts
  const isOlderCourse = (course: Course): boolean => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return new Date(course.end_date) < oneYearAgo;
  };

  const olderCoursesCount = courses.filter(isOlderCourse).length;

  const toggleOlderCourses = () => setShowOlderCourses(!showOlderCourses);

  const clearSearch = () => {
    setSearchTerm('');
    setSearchField('all');
  };

  const navigateToCourse = (courseId: string) => {
    navigate(`./${courseId}`);
  };

  const searchFields = [
    { value: 'all', label: t('admin:ui.allFields') },
    { value: 'name', label: t('admin:course.name') },
    { value: 'code', label: t('admin:course.code') },
    { value: 'student_group', label: t('admin:course.studentGroup') },
    { value: 'topics', label: t('admin:course.topics') },
  ];

  // TODO: Tämä logiikka omaan hookkiin, esim. useFilteredCourses(...)
  const filteredCourses = courses
    .filter((course) => showOlderCourses || !isOlderCourse(course))
    .filter((course) =>
      Object.entries(course).some(([key, value]) => {
        if (searchField !== 'all' && key !== searchField) return false;
        return (
          typeof value === 'string' &&
          value.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
      })
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
      const token = localStorage.getItem('userToken');
      if (!token) return;

      const fetchCourses = async () => {
        const fetched = await apiHooks.getCourses(token);
        const deduped = fetched.map((course) => ({
          ...course,
          topics: [...new Set(course.topics)],
        }));
        setCourses(deduped);
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
            {t('admin:ui.loading')}
          </p>
        </div>
      ) : courses.length === 0 ? (
        <EmptyCoursesMessage />
      ) : (
        <>
          <div className='flex justify-between items-center mb-8'>
            <GeneralLinkButton
              text='Create New Course'
              path='/teacher/courses/create'
              className='transition-transform hover:scale-105 bg-metropolia-main-orange hover:bg-metropolia-main-orange-dark shadow-lg hover:shadow-xl'
            />
            {olderCoursesCount > 0 && (
              <ToggleOlderCoursesButton
                showOlderCourses={showOlderCourses}
                toggleOlderCourses={toggleOlderCourses}
                olderCoursesCount={olderCoursesCount}
              />
            )}
          </div>

          {courses.length > 0 && !showOlderCourses && olderCoursesCount > 0 && (
            <OlderCoursesNotice
              olderCoursesCount={olderCoursesCount}
              toggleOlderCourses={toggleOlderCourses}
            />
          )}

          <div className='mt-6 mb-5'>
            <SearchField
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              searchField={searchField}
              onSearchFieldChange={setSearchField}
              onClearSearch={clearSearch}
              searchFields={searchFields}
              placeholder={t('admin:ui.searchPlaceholder')}
              searchLabel={t('admin:ui.search')}
              searchInLabel={t('admin:ui.searchIn')}
              resultsCount={filteredCourses.length}
              className='bg-white p-4 rounded-lg shadow-md'
            />
          </div>

          <div className='flex justify-end mb-4'>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className='px-2 py-1 text-white transition rounded-sm font-heading bg-metropolia-main-orange h-fit hover:bg-metropolia-secondary-orange disabled:opacity-50 disabled:cursor-not-allowed sm:py-2 sm:px-4 focus:outline-hidden focus:shadow-outline'
              aria-label={t('admin:ui.refresh')}
              title={t('admin:ui.refresh')}>
              <RefreshIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <CourseTable
            courses={filteredCourses}
            sortKey={sortKey}
            sortOrder={sortOrder}
            sortCourses={(key: keyof Course) => {
              setSortKey(key);
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            }}
            navigateToCourse={navigateToCourse}
            isOlderCourse={isOlderCourse}
            debouncedSearchTerm={debouncedSearchTerm}
          />
        </>
      )}
    </div>
  );
};

export default AdminCourses;
