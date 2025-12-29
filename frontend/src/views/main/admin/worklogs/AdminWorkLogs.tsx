import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import RefreshIcon from '@mui/icons-material/Refresh';

import GeneralLinkButton from '../../../../components/ui/buttons/GeneralLinkButton.tsx';
import SearchField from '../../../../components/ui/inputs/SearchField.tsx';
import Loader from '../../../../utils/Loader.tsx';
import useDebounce from '../../../../hooks/useDebounce.ts';
import { UserContext } from '../../../../contexts/UserContext.tsx';
import apiHooks from '../../../../api';

import { AdminWorkLogCourse } from '../../../../types/worklog.ts';
import WorkLogTable from '../../../../components/internal/admin/AdminWorkLogs/WorkLogTable.tsx';

const AdminWorkLogs: React.FC = () => {
  const { t } = useTranslation(['admin']);
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [workLogs, setWorkLogs] = useState<AdminWorkLogCourse[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState<keyof AdminWorkLogCourse | 'all'>('all');
  const [sortKey, setSortKey] = useState<keyof AdminWorkLogCourse>('created_at');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const sortWorkLogs = (key: keyof AdminWorkLogCourse) => {
    setSortKey(key);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchField('all');
  };

  const handleRowClick = (course: AdminWorkLogCourse) => {
    const path = course.type === 'practicum' ? 'practicum' : 'worklog';
    navigate(`/admin/${path}/${course.work_log_course_id}`);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const token = localStorage.getItem('userToken');
    if (token) {
      try {
        const [fetchedWorkLogs, fetchedPracticums] = await Promise.all([
          apiHooks.getWorkLogCourses(token),
          apiHooks.getAllPracticums(token),
        ]);

        const formattedPracticums = fetchedPracticums.map((p) => ({
          work_log_course_id: p.work_log_practicum_id,
          name: p.name,
          code: 'practicum',
          start_date: new Date(p.start_date),
          end_date: new Date(p.end_date),
          description: p.description,
          required_hours: p.required_hours,
          created_at: p.created_at,
          type: 'practicum' as const,
        }));

        const formattedWorkLogs = fetchedWorkLogs.map((w) => ({
          ...w,
          start_date: new Date(w.start_date),
          end_date: new Date(w.end_date),
          type: 'worklog' as const,
        }));

        setWorkLogs([...formattedWorkLogs, ...formattedPracticums]);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    }
    setIsRefreshing(false);
  };

  const filteredWorkLogs = workLogs
    .sort((a, b) => {
      const aValue = a[sortKey]?.toString() || '';
      const bValue = b[sortKey]?.toString() || '';
      return sortOrder === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    })
    .filter((course) => {
      if (!debouncedSearchTerm) return true;
      const searchTermLower = debouncedSearchTerm.toLowerCase().trim();

      if (searchField === 'all') {
        return Object.entries(course).some(([key, value]) => {
          if (key === 'work_log_course_id' || !value) return false;
          return value.toString().toLowerCase().includes(searchTermLower);
        });
      }

      const fieldValue = course[searchField];
      return fieldValue && fieldValue.toString().toLowerCase().includes(searchTermLower);
    });

  const searchFields = [
    { value: 'all', label: t('admin:ui.allFields') },
    { value: 'name', label: t('admin:worklog.name') },
    { value: 'code', label: t('admin:worklog.code') },
    { value: 'description', label: t('admin:worklog.description') },
  ];

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);

    const token = localStorage.getItem('userToken');
    if (!token) throw new Error('No token available');

    const fetchData = async () => {
      try {
        const [fetchedWorkLogs, fetchedPracticums] = await Promise.all([
          apiHooks.getWorkLogCourses(token),
          apiHooks.getAllPracticums(token),
        ]);

        const formattedPracticums = fetchedPracticums.map((p) => ({
          work_log_course_id: p.work_log_practicum_id,
          name: p.name,
          code: 'practicum',
          start_date: new Date(p.start_date),
          end_date: new Date(p.end_date),
          description: p.description,
          required_hours: p.required_hours,
          created_at: p.created_at,
          type: 'practicum' as const,
        }));

        const formattedWorkLogs = fetchedWorkLogs.map((w) => ({
          ...w,
          start_date: new Date(w.start_date),
          end_date: new Date(w.end_date),
          type: 'worklog' as const,
        }));

        setWorkLogs([...formattedWorkLogs, ...formattedPracticums]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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
      ) : workLogs.length === 0 ? (
        <div className='flex flex-col items-center justify-center h-64 gap-3 text-center'>
          <div className='w-16 h-16 mb-2 rounded-full bg-metropolia-trend-light-blue/20 flex items-center justify-center'>
            <svg xmlns='http://www.w3.org/2000/svg' className='w-8 h-8 text-metropolia-trend-light-blue' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
          </div>
          <p className='text-lg font-semibold text-metropolia-main-grey'>
            {t('admin:ui.noWorkLogsAvailable')}
          </p>
          <p className='text-sm text-metropolia-main-grey/70'>
            {t('admin:ui.createFirstWorkLog')}
          </p>
        </div>
      ) : (
        <>
          <GeneralLinkButton
            text={t('admin:worklog.createNewWorkLog')}
            path='/teacher/worklog/create'
            className='transition-transform hover:scale-105 bg-metropolia-main-orange hover:bg-metropolia-main-orange-dark'
          />

          <div className='flex justify-end mb-4'>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className='px-2 py-1 text-white transition rounded-sm font-heading bg-metropolia-main-orange h-fit hover:bg-metropolia-secondary-orange disabled:opacity-50 disabled:cursor-not-allowed sm:py-2 sm:px-4 focus:outline-hidden focus:shadow-outline'
              aria-label={t('admin:ui.refresh')}
              title={t('admin:ui.refresh')}
            >
              <RefreshIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
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
              placeholder={t('admin:ui.searchPlaceholder')}
              searchLabel={t('admin:ui.search')}
              searchInLabel={t('admin:ui.searchIn')}
              resultsCount={filteredWorkLogs.length}
              className='bg-white p-4 rounded-lg shadow-md'
            />
          </div>

          <WorkLogTable
            workLogs={filteredWorkLogs}
            sortKey={sortKey}
            sortOrder={sortOrder}
            sortWorkLogs={sortWorkLogs}
            onRowClick={handleRowClick}
            debouncedSearchTerm={debouncedSearchTerm}
            searchField={searchField}
          />
        </>
      )}
    </div>
  );
};

export default AdminWorkLogs;
