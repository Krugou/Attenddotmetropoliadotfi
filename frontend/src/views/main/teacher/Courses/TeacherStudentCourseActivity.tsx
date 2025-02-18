import React, {useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {UserContext} from '../../../../contexts/UserContext';
import {useCourses} from '../../../../hooks/courseHooks';
import apihook from '../../../../api';
import Loader from '../../../../utils/Loader';
import GeneralLinkButton from '../../../../components/main/buttons/GeneralLinkButton';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import {subDays, parseISO, isBefore} from 'date-fns';

// Import new components
import {useColumnConfig} from '../../../../components/main/teacher/courseActivity/ColumnConfig';
import {FilterButtons} from '../../../../components/main/teacher/courseActivity/FilterButtons';
import {SearchInput} from '../../../../components/main/teacher/courseActivity/SearchInput';
import {SortableHeader} from '../../../../components/main/teacher/courseActivity/SortableHeader';
import {TableBody} from '../../../../components/main/teacher/courseActivity/TableBody';
import {MobileCardList} from '../../../../components/main/teacher/courseActivity/MobileCardList';
import {ColumnVisibilityMenu} from '../../../../components/main/teacher/courseActivity/ColumnVisibilityMenu';
import {
  CombinedStudentData,
  FilterPeriod,
  SortField,
  SortOrder,
} from '../../../../components/main/teacher/courseActivity/types';

const TeacherStudentCourseActivity: React.FC = () => {
  const {t} = useTranslation();
  const {user} = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allStudents, setAllStudents] = useState<CombinedStudentData[]>([]);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all');
  const {threshold} = useCourses();
  const [sortField, setSortField] = useState<SortField>('lastName');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set());

  // Get column configuration
  const columns = useColumnConfig();

  useEffect(() => {
    const defaultVisible = new Set(
      columns.filter((col) => col.defaultVisible).map((col) => col.key),
    );
    setVisibleColumns(defaultVisible);
  }, []);

  const handleColumnToggle = (columnKey: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(columnKey)) {
        next.delete(columnKey);
      } else {
        next.add(columnKey);
      }
      return next;
    });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const loadAttendanceData = async () => {
      try {
        if (!user?.userid) {
          throw new Error('User ID or token not found');
        }
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('userToken');
        if (!token) {
          throw new Error('No token available');
        }
        let response;
        if (user.role === 'teacher') {
          response = await apihook.getStudentAttendance(user.userid, token);
        } else if (user.role === 'counselor' || user.role === 'admin') {
          response = await apihook.getAllStudentsAttendance(token);
        } else {
          console.log('Invalid role:', user.role);
          throw new Error('Invalid user role');
        }

        // Log the response
        console.log('API Response:', response);

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to load attendance data');
        }

        const combinedStudents = response.data.flatMap((course) =>
          course.students.map((student) => ({
            ...student,
            courseName: course.courseName,
          })),
        );

        setAllStudents(combinedStudents);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadAttendanceData();
  }, [user?.userid, user?.role]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortedValue = (student: CombinedStudentData, field: SortField) => {
    switch (field) {
      case 'name':
        return `${student.lastName} ${student.firstName}`;
      case 'attendance.percentage':
        return student.attendance.percentage;
      case 'attendance.total':
        return student.attendance.total;
      case 'attendance.attended':
        return student.attendance.attended;
      case 'attendance.lastAttendance':
        return student.attendance.lastAttendance || '0';
      default:
        return student[field as keyof CombinedStudentData];
    }
  };

  const sortStudents = (students: CombinedStudentData[]) => {
    return [...students].sort((a, b) => {
      const aValue = getSortedValue(a, sortField);
      const bValue = getSortedValue(b, sortField);

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const filterStudentsBySearch = (students: CombinedStudentData[]) => {
    if (!searchQuery) return students;

    const query = searchQuery.toLowerCase();
    return students.filter(
      (student) =>
        `${student.firstName} ${student.lastName}`
          .toLowerCase()
          .includes(query) ||
        String(student.studentNumber).toLowerCase().includes(query) ||
        student.groupName.toLowerCase().includes(query) ||
        student.courseName.toLowerCase().includes(query),
    );
  };

  const filterStudentsByAttendance = (students: CombinedStudentData[]) => {
    if (filterPeriod === 'all') {
      if (threshold && typeof threshold === 'number') {
        return students.filter((student) => student.attendance.percentage < 90);
      }
      return students;
    }

    if (filterPeriod === 'threshold') {
      if (!threshold || typeof threshold !== 'number') {
        console.error('Invalid threshold value:', threshold);
        return students;
      }
      return students.filter(
        (student) => student.attendance.percentage < threshold,
      );
    }

    const now = new Date();
    let cutoffDate = now;

    switch (filterPeriod) {
      case 'week':
        cutoffDate = subDays(now, 7);
        break;
      case 'month':
        cutoffDate = subDays(now, 30);
        break;
    }

    return students.filter((student) => {
      if (!student.attendance.lastAttendance) {
        console.log(`${student.firstName} has never attended`);
        return true;
      }

      const lastAttendanceDate = parseISO(student.attendance.lastAttendance);

      const hasNotAttendedSince = isBefore(lastAttendanceDate, cutoffDate);

      return hasNotAttendedSince;
    });
  };

  const filteredStudents = filterStudentsBySearch(
    sortStudents(filterStudentsByAttendance(allStudents)),
  );

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[200px]'>
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative'>
        {error}
      </div>
    );
  }

  return (
    <div className='max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-6'>
      <h1 className='text-2xl sm:text-3xl font-heading text-center bg-white rounded-xl shadow-sm p-4 mb-6'>
        {t('teacher:courseActivity.title')}
      </h1>

      <div className='bg-white rounded-xl shadow-lg p-4 sm:p-6'>
        <div className='mb-6'>
          <div className='flex justify-between items-center'>
            <GeneralLinkButton
              path={
                user?.role === 'teacher'
                  ? '/teacher/mainView'
                  : '/counselor/mainView'
              }
              text={t('teacher:courseActivity.back')}
            />
            <button
              onClick={handleMenuOpen}
              className='px-4 py-2 hidden md:block text-white rounded-lg bg-metropolia-main-orange hover:bg-metropolia-secondary-orange transition-colors duration-200'>
              <ViewColumnIcon className='w-5 h-5 mr-2' />
              {t('common:columns')}
            </button>
          </div>
        </div>

        <div className='flex flex-col lg:flex-row justify-between gap-6 mb-6'>
          <FilterButtons
            filterPeriod={filterPeriod}
            setFilterPeriod={setFilterPeriod}
            threshold={threshold ?? undefined}
          />
          <SearchInput
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>

        <div className='p-4 mb-6 bg-gray-50 rounded-lg border border-gray-100'>
          <p className='font-body text-gray-700'>
            {t('teacher:courseActivity.studentsNotAttending', {
              count: filteredStudents.length,
              period:
                filterPeriod === 'all'
                  ? t('common:total')
                  : filterPeriod === 'week'
                  ? t('common:inLastWeek')
                  : filterPeriod === 'month'
                  ? t('common:inLastMonth')
                  : t('common:belowThreshold', {threshold}),
            })}
          </p>
        </div>

        {/* Desktop Table View */}
        <div className='hidden md:block overflow-x-auto rounded-xl border border-gray-200'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                {columns
                  .filter((column) => visibleColumns.has(column.key))
                  .map(({key, label}) => (
                    <SortableHeader
                      key={key}
                      field={key as SortField}
                      label={label}
                      sortField={sortField}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                  ))}
                <th className='px-4 py-2'>{t('common:status')}</th>
              </tr>
            </thead>
            <TableBody
              students={filteredStudents}
              visibleColumns={visibleColumns}
              columns={columns}
              threshold={threshold ?? undefined}
            />
          </table>
        </div>

        {/* Mobile Card View */}
        <MobileCardList
          students={filteredStudents}
          threshold={threshold ?? undefined}
        />

        {/* Column Visibility Menu */}
        <ColumnVisibilityMenu
          anchorEl={anchorEl}
          columns={columns}
          visibleColumns={visibleColumns}
          onColumnToggle={handleColumnToggle}
          onClose={handleMenuClose}
        />
      </div>
    </div>
  );
};

export default TeacherStudentCourseActivity;
