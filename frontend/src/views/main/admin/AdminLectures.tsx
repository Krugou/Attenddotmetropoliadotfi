import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Menu,
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import React, {useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import InputField from '../../../components/main/course/createcourse/coursedetails/InputField';
import {UserContext} from '../../../contexts/UserContext';
import apiHooks from '../../../api';
import {useTranslation} from 'react-i18next';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import SortIcon from '@mui/icons-material/Sort';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

interface Lecture {
  lectureid: number;
  start_date: string;
  attended: number;
  notattended: number;
  teacheremail: string;
  timeofday: string;
  coursename: string;
  state: string;
  topicname: string;
  coursecode: string;
  courseid: string;
  actualStudentCount: number;
}

interface ColumnConfig {
  key: keyof Lecture;
  label: string;
  align: string;
  defaultVisible: boolean;
}

const ITEMS_PER_PAGE = 50;

const AdminLectures: React.FC = () => {
  const {t} = useTranslation();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<string | null>(null);
  const [action, setAction] = useState<'close' | 'delete' | null>(null);
  const {user} = useContext(UserContext);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [extraStats, setExtraStats] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof Lecture>('lectureid');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set());

  // Column configurations
  const columns: ColumnConfig[] = [
    {
      key: 'lectureid',
      label: t('admin.common.lectureId'),
      align: 'text-center',
      defaultVisible: true,
    },
    {
      key: 'teacheremail',
      label: t('admin.lectures.tableContent.teacherEmail'),
      align: 'text-left',
      defaultVisible: true,
    },
    {
      key: 'coursename',
      label: t('admin.lectures.tableContent.courseName'),
      align: 'text-left',
      defaultVisible: true,
    },
    {
      key: 'coursecode',
      label: t('admin.lectures.tableContent.courseCode'),
      align: 'text-left',
      defaultVisible: false,
    },
    {
      key: 'topicname',
      label: t('admin.lectures.tableContent.topicName'),
      align: 'text-left',
      defaultVisible: true,
    },
    {
      key: 'start_date',
      label: t('admin.lectures.tableContent.date'),
      align: 'center',
      defaultVisible: true,
    },
    {
      key: 'timeofday',
      label: t('admin.lectures.tableContent.dayTime'),
      align: 'center',
      defaultVisible: false,
    },
    {
      key: 'attended',
      label: t('admin.lectures.tableContent.attendance'),
      align: 'center',
      defaultVisible: true,
    },
    {
      key: 'actualStudentCount',
      label: t('admin.lectures.tableContent.currentTopicStudentCount'),
      align: 'center',
      defaultVisible: false,
    },
    {
      key: 'state',
      label: t('admin.lectures.tableContent.state'),
      align: 'center',
      defaultVisible: true,
    },
  ];

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

  const getLectures = async () => {
    const token: string | null = localStorage.getItem('userToken');
    if (!token) {
      toast.error('No token available');
      setIsLoading(false);
      return false;
    }
    try {
      const result = await apiHooks.fetchAllLectures(token);
      if (!Array.isArray(result)) {
        toast.error('Expected an array from fetchAllLectures');
        setIsLoading(false);
        return false;
      }
      const sortedLectures = result.sort((a, b) => {
        return sortOrder === 'asc'
          ? a.lectureid - b.lectureid
          : b.lectureid - a.lectureid;
      });
      setLectures(sortedLectures);
      setIsLoading(false);
      return true;
    } catch (error) {
      toast.error('Error fetching lectures');
      setIsLoading(false);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      getLectures();

      const intervalId = setInterval(() => {
        getLectures();
      }, 120000); // calls getLectures every 120 seconds

      // clear interval on component unmount
      return () => clearInterval(intervalId);
    }
    return () => {};
  }, [user, sortOrder]);

  if (isLoading) {
    return <CircularProgress />;
  }

  const filteredLectures = lectures.filter(
    (lecture) =>
      (filterOpen ? lecture.state === 'open' : true) &&
      Object.values(lecture).some(
        (value) =>
          typeof value === 'string' &&
          value.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  const paginatedLectures = filteredLectures.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const totalPages = Math.ceil(filteredLectures.length / ITEMS_PER_PAGE);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleDialogOpen = (lectureid: string, action: 'close' | 'delete') => {
    setSelectedLecture(lectureid);
    setAction(action);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setSelectedLecture(null);
    setAction(null);
    setDialogOpen(false);
  };

  const handleConfirm = async () => {
    const token: string | null = localStorage.getItem('userToken');
    if (!token) {
      toast.error('No token available');
      return;
    }
    if (selectedLecture) {
      try {
        if (action === 'close') {
          await apiHooks.closeLectureByLectureId(selectedLecture, token);
          toast.success('Lecture closed successfully ' + selectedLecture);
        } else if (action === 'delete') {
          await apiHooks.deleteLectureByLectureId(selectedLecture, token);
          toast.success('Lecture deleted successfully ' + selectedLecture);
        }
        const result = await apiHooks.fetchAllLectures(token);
        const sortedLectures = result.sort((a, b) => {
          return sortOrder === 'asc'
            ? a.lectureid - b.lectureid
            : b.lectureid - a.lectureid;
        });
        setLectures(sortedLectures);
      } catch (error) {
        toast.error('Failed to perform action: ' + (error as Error).message);
      }
    }
    handleDialogClose();
  };
  const toggleSortOrder = () => {
    setSortOrder((prevSortOrder) => (prevSortOrder === 'asc' ? 'desc' : 'asc'));
  };
  const handleRowClick = (courseId: string, lectureId: string) => {
    navigate(`./${courseId}/${lectureId}`);
  };
  // Calculate total lectures count
  const totalLectures = lectures.length;

  // Calculate ratio of lectures attendance
  const totalAttended = lectures.reduce(
    (sum, lecture) => sum + lecture.attended,
    0,
  );
  const totalNotAttended = lectures.reduce(
    (sum, lecture) => sum + lecture.notattended,
    0,
  );
  const attendanceRatio =
    totalLectures > 0
      ? (totalAttended / (totalAttended + totalNotAttended)) * 100
      : 0;
  // Find lectures with highest attendance
  const maxAttended = Math.max(...lectures.map((lecture) => lecture.attended));
  const highestAttendedLectures = lectures.filter(
    (lecture) => lecture.attended === maxAttended,
  );

  // Find lectures with highest not attended
  const maxNotAttended = Math.max(
    ...lectures.map((lecture) => lecture.notattended),
  );
  const highestNotAttendedLectures = lectures.filter(
    (lecture) => lecture.notattended === maxNotAttended,
  );

  // Find lectures with lowest attendance
  const minAttended = Math.min(...lectures.map((lecture) => lecture.attended));
  const lowestAttendedLectures = lectures.filter(
    (lecture) => lecture.attended === minAttended,
  );

  // Find lectures with lowest not attended
  const minNotAttended = Math.min(
    ...lectures.map((lecture) => lecture.notattended),
  );
  const lowestNotAttendedLectures = lectures.filter(
    (lecture) => lecture.notattended === minNotAttended,
  );

  const PaginationControls = () => (
    <div className='flex items-center justify-between my-4'>
      <div className='text-sm text-gray-700'>
        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
        {Math.min(currentPage * ITEMS_PER_PAGE, filteredLectures.length)} of{' '}
        {filteredLectures.length} lectures
      </div>
      <div className='flex gap-2'>
        {currentPage > 1 && (
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className='px-3 py-1 text-white rounded-sm bg-metropolia-main-orange disabled:opacity-50'>
            Previous
          </button>
        )}
        <span className='px-4 py-1'>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className='px-3 py-1 text-white rounded-sm bg-metropolia-main-orange disabled:opacity-50'>
          Next
        </button>
      </div>
    </div>
  );

  const sortLectures = (key: keyof Lecture) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const openLectures = lectures.filter((lecture) => lecture.state === 'open');

  return (
    <div className='relative w-full p-5 bg-white rounded-lg'>
      {/* Render control buttons */}
      <div className='flex justify-between mt-4 mb-4 space-x-2'>
        {/* Only show toggle button if not filtering with no open lectures */}
        <div className='flex justify-between gap-3'>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className='px-2 py-1 text-white transition rounded-sm font-heading bg-metropolia-main-orange h-fit hover:hover:bg-metropolia-secondary-orange sm:py-2 sm:px-4 focus:outline-hidden focus:shadow-outline'>
            {filterOpen
              ? t('admin.lectures.alternative.showAllLectures')
              : t('admin.lectures.alternative.showOpenLecture')}
          </button>
          {!(filterOpen && openLectures.length === 0) && (
            <button
              onClick={handleMenuOpen}
              className='px-2 py-1 text-white transition rounded-sm font-heading bg-metropolia-main-orange h-fit hover:bg-metropolia-secondary-orange sm:py-2 sm:px-4 focus:outline-hidden focus:shadow-outline'>
              <ViewColumnIcon className='w-5 h-5 mr-1' />
              {t('admin.lectures.alternative.columns')}
            </button>
          )}

          {!filterOpen && (
            <button
              onClick={() => setExtraStats(!extraStats)}
              className='px-2 py-1 text-white transition rounded-sm font-heading bg-metropolia-main-orange h-fit hover:bg-metropolia-secondary-orange sm:py-2 sm:px-4 focus:outline-hidden focus:shadow-outline'>
              {extraStats
                ? t('admin.lectures.alternative.hideStats')
                : t('admin.lectures.alternative.showStats')}
            </button>
          )}
        </div>
        {!(filterOpen && openLectures.length === 0) && (
          <div className='flex gap-2 group'>
            <button
              onClick={toggleSortOrder}
              className='px-2 py-1 text-white transition rounded-sm font-heading bg-metropolia-main-orange h-fit hover:hover:bg-metropolia-secondary-orange sm:py-2 sm:px-4 focus:outline-hidden focus:shadow-outline'
              aria-label={
                sortOrder === 'asc'
                  ? t('admin.lectures.alternative.sortByNewest')
                  : t('admin.lectures.alternative.sortByOldest')
              }
              title={
                sortOrder === 'asc'
                  ? t('admin.lectures.alternative.sortByNewest')
                  : t('admin.lectures.alternative.sortByOldest')
              }>
              <SortIcon className='w-5 h-5' />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className='p-2 text-white transition-colors rounded-sm bg-metropolia-main-orange hover:bg-metropolia-main-orange/90'
              aria-label={
                isExpanded
                  ? t('admin.lectures.alternative.shrinkTable')
                  : t('admin.lectures.alternative.expandTable')
              }
              title={
                isExpanded
                  ? t('admin.lectures.alternative.shrinkTable')
                  : t('admin.lectures.alternative.expandTable')
              }>
              {isExpanded ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
            </button>
          </div>
        )}
      </div>

      {/* Render stats */}
      {lectures.length > 0 && extraStats && !filterOpen && (
        <div className='grid grid-cols-1 gap-4 p-4 md:grid-cols-2'>
          <div className='p-2 bg-blue-100 rounded-sm col-span-full'>
            <h2 className='mb-2 text-lg'>
              {t('admin.lectures.stats.totalLectures')}: {totalLectures} |{' '}
              {t('admin.lectures.stats.attendanceRatio')}:{' '}
              {attendanceRatio.toFixed(2)}%
            </h2>
          </div>
          <div className='p-2 bg-green-100 rounded-sm'>
            <h2 className='mb-2 text-lg'>
              {t('admin.lectures.stats.highestAttendance')}:
              {highestAttendedLectures.map((lecture) => (
                <p key={lecture.lectureid} className='m-1'>
                  {lecture.attended} (ID: {lecture.lectureid})
                </p>
              ))}
            </h2>
          </div>
          <div className='p-2 bg-red-100 rounded-sm'>
            <h2 className='mb-2 text-lg'>
              {t('admin.lectures.stats.lowestAttendance')}:
              {lowestAttendedLectures.map((lecture) => (
                <p key={lecture.lectureid} className='m-1'>
                  {lecture.attended} (ID: {lecture.lectureid})
                </p>
              ))}
            </h2>
          </div>
          <div className='p-2 bg-yellow-100 rounded-sm'>
            <h2 className='mb-2 text-lg'>
              {' '}
              {t('admin.lectures.stats.highestNotAttended')}
              {highestNotAttendedLectures.map((lecture) => (
                <p key={lecture.lectureid} className='m-1'>
                  {lecture.notattended} (ID: {lecture.lectureid})
                </p>
              ))}
            </h2>
          </div>
          <div className='p-2 bg-purple-100 rounded-sm'>
            <h2 className='mb-2 text-lg'>
              {t('admin.lectures.stats.lowestNotAttended')}:
              {lowestNotAttendedLectures.map((lecture) => (
                <p key={lecture.lectureid} className='m-1'>
                  {lecture.notattended} (ID: {lecture.lectureid})
                </p>
              ))}
            </h2>
          </div>
        </div>
      )}

      {/* Render search input only when not filtering open lectures with none available */}
      {lectures.length > 0 && !(filterOpen && openLectures.length === 0) && (
        <div className='lg:w-1/4 sm:w-[20em] w-1/2 mt-4 mb-4'>
          <InputField
            type='text'
            name='search'
            value={searchTerm}
            /* @ts-ignore */
            onChange={handleSearchChange}
            placeholder='Search by any field..'
            label='Search'
          />
        </div>
      )}

      {/* Only show open lectures count if there are filtered lectures */}
      {filterOpen && filteredLectures.length > 0 && (
        <h2 className='mb-2 text-lg'>{`Open lectures: ${filteredLectures.length}`}</h2>
      )}

      <div className='relative'>
        <div
          className={`relative bg-gray-100 overflow-auto ${
            isExpanded ? 'h-screen' : 'h-[384px]'
          }`}>
          {paginatedLectures.length > 0 ? (
            <table className='w-full text-sm bg-white border-collapse table-auto'>
              <thead className='sticky top-0 z-10 bg-white border-t-2 border-black'>
                <tr>
                  {columns
                    .filter((column) => visibleColumns.has(column.key))
                    .map(({key, label, align}) => (
                      <th
                        key={key}
                        className={`p-3 border-b border-gray-200 bg-gray-50 ${align} whitespace-nowrap font-heading`}>
                        <div className='flex items-center justify-center gap-2'>
                          {label}
                          <button
                            onClick={() => sortLectures(key as keyof Lecture)}
                            className='p-1.5 text-white rounded-xl bg-metropolia-secondary-orange hover:bg-metropolia-main-orange'>
                            <SortIcon className='w-4 h-4' />
                          </button>
                        </div>
                      </th>
                    ))}
                  <th className='p-3 text-center border-b border-gray-200 bg-gray-50 whitespace-nowrap font-heading'>
                    {t('admin.lectures.tableContent.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedLectures.map((lecture) => (
                  <tr
                    key={lecture.lectureid}
                    className={`hover:bg-gray-100 transition-colors ${
                      lecture.attended === 0 ? 'bg-red-100' : ''
                    }`}>
                    {columns
                      .filter((column) => visibleColumns.has(column.key))
                      .map(({key, align}) => (
                        <td
                          key={key}
                          className={`p-3 ${align} border-b border-gray-200`}>
                          {lecture[key]}
                        </td>
                      ))}
                    <td className='p-3 text-center border-b border-gray-200 whitespace-nowrap'>
                      <div className='flex gap-1'>
                        <button
                          color='primary'
                          onClick={() =>
                            handleRowClick(
                              lecture.courseid,
                              lecture.lectureid.toString(),
                            )
                          }
                          className='px-2 py-1 text-white transition rounded-sm font-heading bg-metropolia-main-orange h-fit hover:hover:bg-metropolia-secondary-orange sm:py-2 sm:px-4 focus:outline-hidden focus:shadow-outline'>
                          {t('admin.common.details')}
                        </button>
                        {lecture.state === 'open' && (
                          <button
                            color='success'
                            onClick={() =>
                              handleDialogOpen(
                                lecture.lectureid.toString(),
                                'close',
                              )
                            }
                            className='px-2 py-1 text-white transition rounded-sm font-heading bg-metropolia-trend-green h-fit hover:hover:bg-green-600 sm:py-2 sm:px-4 focus:outline-hidden focus:shadow-outline'>
                            {t('admin.common.close')}
                          </button>
                        )}
                        {(lecture.state === 'open' ||
                          lecture.state === 'closed') && (
                          <button
                            color='error'
                            onClick={() =>
                              handleDialogOpen(
                                lecture.lectureid.toString(),
                                'delete',
                              )
                            }
                            className='px-2 py-1 text-white transition rounded-sm font-heading bg-metropolia-support-red h-fit hover:hover:bg-red-600 sm:py-2 sm:px-4 focus:outline-hidden focus:shadow-outline'>
                            {t('admin.common.delete')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className='flex items-center justify-center h-full'>
              <div className='p-8 text-center bg-white rounded-lg shadow-xs'>
                <h3 className='mb-2 text-xl font-semibold text-gray-700 font-heading'>
                  {filterOpen
                    ? t('admin.lectures.noData.noOpenLectures')
                    : t('admin.lectures.noData.noLecturesFound')}
                </h3>
                <p className='text-gray-500 font-body'>
                  {filterOpen
                    ? t('admin.lectures.noData.tryShowingAll')
                    : t('admin.lectures.noData.tryDifferentSearch')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Render pagination controls only when not filtering open lectures with none available */}
      {!(filterOpen && openLectures.length === 0) && <PaginationControls />}

      {/* Add Menu component for column visibility */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
        transformOrigin={{vertical: 'top', horizontal: 'right'}}>
        {columns.map((column) => (
          <MenuItem key={column.key} onClick={(e) => e.stopPropagation()}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={visibleColumns.has(column.key)}
                  onChange={() => handleColumnToggle(column.key)}
                  color='primary'
                />
              }
              label={column.label}
            />
          </MenuItem>
        ))}
      </Menu>

      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>{`Are you sure you want to ${action} the lecture?`}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('admin.lectures.dialog.dialogText')}.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color='primary'>
            {t('admin.common.cancel')}
          </Button>
          <Button onClick={handleConfirm} color='primary' autoFocus>
            {t('admin.common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminLectures;
