import React, {useContext, useEffect, useState} from 'react';
import apihook from '../../../../api';
import {useTranslation} from 'react-i18next';
import {
  Alert,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  RadioGroup,
  Radio,
  FormControlLabel,
  TextField,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {UserContext} from '../../../../contexts/UserContext';
import {subDays, parseISO, isBefore, format} from 'date-fns';
import {useCourses} from '../../../../hooks/courseHooks';
import Loader from '../../../../utils/Loader';
import GeneralLinkButton from '../../../../components/main/buttons/GeneralLinkButton';
import SearchIcon from '@mui/icons-material/Search';
import NotesIcon from '@mui/icons-material/Notes';

interface CombinedStudentData {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  studentNumber: string;
  groupName: string;
  courseName: string;
  code: string;
  attendance: {
    total: number;
    attended: number;
    percentage: number;
    lastAttendance: string;
  };
}

type SortField = keyof CombinedStudentData | 'name' | 'attendance.percentage' | 'attendance.total' | 'attendance.attended' | 'attendance.lastAttendance';
type SortOrder = 'asc' | 'desc';

const TeacherStudentCourseActivity: React.FC = () => {
  const {t} = useTranslation();
  const {user} = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allStudents, setAllStudents] = useState<CombinedStudentData[]>([]);
  const [filterPeriod, setFilterPeriod] = useState<
    'all' | 'week' | 'month' | 'threshold' | 'custom'
  >('all');
  const [customDays, setCustomDays] = useState<number>(0);
  const {threshold} = useCourses();
  const [sortField, setSortField] = useState<SortField>('lastName');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchQuery, setSearchQuery] = useState('');

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

        const response = await apihook.getStudentAttendance(user.userid, token);



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
  }, [user?.userid]);

  if (loading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='200px'>
        <Loader />
      </Box>
    );
  }

  if (error) {
    return <Alert severity='error'>{error}</Alert>;
  }

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
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(query) ||
        String(student.studentNumber).toLowerCase().includes(query) ||
        student.groupName.toLowerCase().includes(query) ||
        student.courseName.toLowerCase().includes(query),
    );
  };

  const filterStudentsByAttendance = (students: CombinedStudentData[]) => {
    if (filterPeriod === 'all') {
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
      case 'custom':
        cutoffDate = subDays(now, customDays);
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

  const SortableHeader: React.FC<{
    field: SortField;
    label: string;
  }> = ({field, label}) => (
    <TableCell
      onClick={() => handleSort(field)}
      style={{cursor: 'pointer'}}
      className="select-none">
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <div className="flex items-center">
          {sortField === field ? (
            <IconButton size="small" className="ml-1">
              <NotesIcon
                fontSize="small"
                className={`text-metropolia-main-orange transform transition-transform ${
                  sortOrder === 'asc' ? 'rotate-0' : 'rotate-180'
                }`}
              />
            </IconButton>
          ) : (
            <IconButton size="small" className="ml-1 opacity-20 hover:opacity-100">
              <NotesIcon fontSize="small" />
            </IconButton>
          )}
        </div>
      </div>
    </TableCell>
  );

  return (
    <>
      <h1 className='p-3 mb-2 text-2xl text-center bg-white rounded-md font-heading'>
        {t('teacher.courseActivity.title')}
      </h1>
      <div className='w-full p-4 bg-white rounded-lg 2xl:w-3/4'>
      <GeneralLinkButton
      path='/teacher/mainView'
      text={t('teacher.courseActivity.back')}
    />


        <div className='flex justify-between sm:justify-around mb-4'>

          <div className='sm:w-[100em] flex justify-center items-center mr-3 ml-3 w-1/2'>
            <RadioGroup
              row
              value={filterPeriod}
              onChange={(e) =>
                setFilterPeriod(
                  e.target.value as
                    | 'all'
                    | 'week'
                    | 'month'
                    | 'threshold'
                    | 'custom',
                )
              }>
              <FormControlLabel
                value='all'
                control={<Radio />}
                label={t('common:allTime')}
              />
              <FormControlLabel
                value='week'
                control={<Radio />}
                label={t('common:lastWeek')}
              />
              <FormControlLabel
                value='month'
                control={<Radio />}
                label={t('common:lastMonth')}
              />
              {threshold && typeof threshold === 'number' && (
                <FormControlLabel
                  value='threshold'
                  control={<Radio />}
                  label={t('common.belowThreshold', {threshold})}
                />
              )}
            </RadioGroup>


            {filterPeriod === 'custom' && (
              <TextField
                type='number'
                label={t('common.numberOfDays')}
                value={customDays}
                onChange={(e) => setCustomDays(parseInt(e.target.value) || 0)}
                className='mt-2'
                size='small'
                fullWidth
              />
            )}
          </div>
          <div className="mb-4 w-full">
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </div>
        </div>

        <Paper className='p-4 mb-4 bg-gray-50'>
          <Typography variant='body1' className='font-body'>
            {t('teacher.courseActivity.studentsNotAttending', {
              count: filteredStudents.length,
              period:
                filterPeriod === 'all'
                  ? t('common.total')
                  : filterPeriod === 'week'
                  ? t('common.inLastWeek')
                  : filterPeriod === 'month'
                  ? t('common.inLastMonth')
                  : t('common.inLastNDays', {days: customDays}),
            })}
          </Typography>
        </Paper>

        <TableContainer component={Paper} className='shadow-md'>
          <Table>
            <TableHead className='bg-gray-50'>
              <TableRow>
                <SortableHeader field="name" label={t('common.name')} />
                <SortableHeader field="courseName" label={t('common.course')} />
                <SortableHeader field="code" label={t('common.courseCode')} />
                <SortableHeader field="email" label={t('common.email')} />
                <SortableHeader
                  field="studentNumber"
                  label={t('common.studentNumber')}
                />
                <SortableHeader field="groupName" label={t('common.group')} />
                <SortableHeader
                  field="attendance.total"
                  label={t('common.totalLectures')}
                />
                <SortableHeader
                  field="attendance.attended"
                  label={t('common.attendedLectures')}
                />
                <SortableHeader
                  field="attendance.percentage"
                  label={t('common.attendancePercentage')}
                />
                <SortableHeader
                  field="attendance.lastAttendance"
                  label={t('common.lastAttendance')}
                />
                <TableCell>{t('common.status')}</TableCell>

              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((student, index) => (
                <TableRow
                  key={`${student.userId}-${student.courseName}-${student.studentNumber}-${index}`}
                  className='hover:bg-gray-50'>
                  <TableCell>{`${student.firstName} ${student.lastName}`}</TableCell>
                  <TableCell>{student.courseName}</TableCell>
                  <TableCell>{student.code}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.studentNumber}</TableCell>
                  <TableCell>{student.groupName}</TableCell>
                  <TableCell>{student.attendance.total}</TableCell>
                  <TableCell>{student.attendance.attended}</TableCell>
                  <TableCell>{`${student.attendance.percentage}%`}</TableCell>
                  <TableCell>
                    {student.attendance.lastAttendance
                      ? format(
                          parseISO(student.attendance.lastAttendance),
                          'dd.MM.yyyy HH:mm',
                        )
                      : t('common.never')}
                  </TableCell>
                  <TableCell>
                    {threshold && typeof threshold === 'number' && (
                      <span
                        className={`px-2 py-1 rounded-full text-white ${
                          student.attendance.percentage >= threshold
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }`}>
                        {student.attendance.percentage >= threshold
                          ? t('common.passing')
                          : t('common.failing')}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  );
};

export default TeacherStudentCourseActivity;
