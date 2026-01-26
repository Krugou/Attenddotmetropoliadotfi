import React, {useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {UserContext} from '../../../../contexts/UserContext';
import {useCourses} from '../../../../hooks/courseHooks';
import apihook from '../../../../api';
import Loader from '../../../../utils/Loader';
//import GeneralLinkButton from '../../../../components/ui/buttons/GeneralLinkButton';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import {subDays, parseISO, isBefore} from 'date-fns';


import {useColumnConfig} from '../../../../components/internal/teacher/courseActivity/ColumnConfig';
import {FilterButtons} from '../../../../components/internal/teacher/courseActivity/FilterButtons';
import {SearchInput} from '../../../../components/internal/teacher/courseActivity/SearchInput';
import {SortableHeader} from '../../../../components/internal/teacher/courseActivity/SortableHeader';
import {TableBody} from '../../../../components/internal/teacher/courseActivity/TableBody';
import {MobileCardList} from '../../../../components/internal/teacher/courseActivity/MobileCardList';
import {ColumnVisibilityMenu} from '../../../../components/internal/teacher/courseActivity/ColumnVisibilityMenu';
import {
  CombinedStudentData,
  FilterPeriod,
  SortField,
  SortOrder,
} from '../../../../components/internal/teacher/courseActivity/types';
import { Link } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

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
          throw new Error('Invalid user role');
        }

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to load attendance data');
        }

        const combinedStudents = response.data.flatMap((course) =>
          course.students.map((student) => ({
            ...student, //Takes all the properties of the student object
            courseName: course.courseName, //Adds the course name property
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
    <div className="w-full">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6">
        {/* Page card */}
        <section className="bg-gray-50/70 rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Tooltip title={t('teacher:courseActivity.back')} arrow>
                <Link
                  to={user?.role === 'teacher' ? '/teacher/mainView' : '/counselor/mainView'}
                  aria-label={t('teacher:courseActivity.back')}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full text-metropolia-main-orange hover:bg-metropolia-main-orange/10 transition-colors shrink-0"
                >
                  <ArrowBackRoundedIcon fontSize="medium" />
                </Link>
              </Tooltip>

              <h1 className="text-2xl sm:text-3xl font-heading truncate">
                {t('teacher:courseActivity.title')}
              </h1>
            </div>

            {/* Right side actions (desktop) */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <button
                onClick={handleMenuOpen}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-metropolia-main-orange bg-white px-4 text-sm font-body text-metropolia-main-orange shadow-sm hover:bg-orange-50 transition-colors"
              >
                <ViewColumnIcon className="w-5 h-5" />
                {t('columns')}
              </button>
            </div>
          </div>

          {/* Content card */}
          <div className="mt-5 rounded-2xl border border-gray-200 bg-white/70 shadow-sm">
            {/* Toolbar */}
            <div className="p-4 sm:p-5 border-b border-gray-200">
              <div className="flex flex-col gap-4">
                {/* Filters + Search row */}
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="min-w-0">
                    <FilterButtons
                      filterPeriod={filterPeriod}
                      setFilterPeriod={setFilterPeriod}
                      threshold={threshold ?? undefined}
                    />
                  </div>

                  <div className="w-full lg:w-[380px]">
                    <SearchInput
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                    />
                  </div>
                </div>

                {/* Mobile-only columns button */}
                <div className="flex md:hidden">
                  <button
                    onClick={handleMenuOpen}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-metropolia-main-orange bg-white px-4 text-sm font-body text-metropolia-main-orange shadow-sm hover:bg-orange-50 transition-colors"
                  >
                    <ViewColumnIcon className="w-5 h-5" />
                    {t('columns')}
                  </button>
                </div>

                {/* Info banner */}
                <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="font-body text-gray-700">
                  <span className="font-medium text-gray-900">
                    {t('teacher:courseActivity.studentsNotAttending')}
                  </span>
                    <span className="ml-2 inline-flex items-center rounded-full bg-white px-2 py-0.5 text-sm font-semibold text-gray-900 border border-gray-200">
                    {filteredStudents.length > 0 ? filteredStudents.length : 0}
                  </span>
                    <span className="ml-2 text-gray-600">
                    {filterPeriod === 'all'
                      ? t('total')
                      : filterPeriod === 'week'
                        ? t('inLastWeek')
                        : filterPeriod === 'month'
                          ? t('inLastMonth')
                          : t('belowThreshold', { threshold })}
                  </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                  <tr className="[&>th]:whitespace-nowrap">
                    {columns
                      .filter((column) => visibleColumns.has(column.key))
                      .map(({ key, label }) => (
                        <SortableHeader
                          key={key}
                          field={key as SortField}
                          label={label}
                          sortField={sortField}
                          sortOrder={sortOrder}
                          onSort={handleSort}
                        />
                      ))}
                    <th className="px-3 py-2 text-[11px] font-semibold tracking-wider text-gray-500 uppercase text-right">
                      {t('status')}
                    </th>
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

              {/* Mobile NavigationCard View */}
              <MobileCardList
                students={filteredStudents}
                threshold={threshold ?? undefined}
              />
            </div>

            {/* Column Visibility Menu */}
            <ColumnVisibilityMenu
              anchorEl={anchorEl}
              columns={columns}
              visibleColumns={visibleColumns}
              onColumnToggle={handleColumnToggle}
              onClose={handleMenuClose}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default TeacherStudentCourseActivity;
