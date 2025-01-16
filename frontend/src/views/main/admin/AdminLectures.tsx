import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

import CircularProgress from '@mui/material/CircularProgress';
import React, {useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import InputField from '../../../components/main/course/createcourse/coursedetails/InputField';
import {UserContext} from '../../../contexts/UserContext';
import apiHooks from '../../../hooks/ApiHooks';
import {useTranslation} from 'react-i18next';
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

const ITEMS_PER_PAGE = 50;

const AdminAllLectures: React.FC = () => {
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
    currentPage * ITEMS_PER_PAGE
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
    <div className="flex items-center justify-between my-4">
      <div className="text-sm text-gray-700">
        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredLectures.length)} of {filteredLectures.length} lectures
      </div>
      <div className="flex gap-2">
        {currentPage > 1 && (
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 text-white rounded bg-metropoliaMainOrange disabled:opacity-50"
        >
          Previous
        </button>
        )}  
        <span className="px-4 py-1">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-white rounded bg-metropoliaMainOrange disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <div className='relative w-full p-5 bg-white rounded-lg'>
      <div className='mt-4 mb-4 space-x-2'>
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className='px-2 py-1 font-bold text-white transition rounded bg-metropoliaMainOrange h-fit hover:hover:bg-metropoliaSecondaryOrange sm:py-2 sm:px-4 focus:outline-none focus:shadow-outline'>
          {filterOpen ? t('admin.lectures.alternative.showAllLectures') : t('admin.lectures.alternative.showOpenLecture')}
        </button>
        <button
          onClick={toggleSortOrder}
          className='px-2 py-1 font-bold text-white transition rounded bg-metropoliaMainOrange h-fit hover:hover:bg-metropoliaSecondaryOrange sm:py-2 sm:px-4 focus:outline-none focus:shadow-outline'>
          {sortOrder === 'asc' ? t('admin.lectures.alternative.sortByNewest') : t('admin.lectures.alternative.sortByOldest')}
        </button>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className='px-2 py-1 font-bold text-white transition rounded bg-metropoliaMainOrange h-fit hover:hover:bg-metropoliaSecondaryOrange sm:py-2 sm:px-4 focus:outline-none focus:shadow-outline'>
          {isExpanded ? t('admin.lectures.alternative.shrinkTable') : t('admin.lectures.alternative.expandTable')}
        </button>
        {!filterOpen && (
          <button
            onClick={() => setExtraStats(!extraStats)}
            className='px-2 py-1 font-bold text-white transition rounded bg-metropoliaMainOrange h-fit hover:hover:bg-metropoliaSecondaryOrange sm:py-2 sm:px-4 focus:outline-none focus:shadow-outline'>
            {extraStats ? t('admin.lectures.alternative.hideStats') : t('admin.lectures.alternative.showStats')}
          </button>
        )}
      </div>
      {extraStats && !filterOpen && (
        <div className='grid grid-cols-1 gap-4 p-4 md:grid-cols-2'>
          <div className='p-2 bg-blue-100 rounded col-span-full'>
            <h2 className='mb-2 text-lg'>
              {t('admin.lectures.stats.totalLectures')}: {totalLectures} | {t('admin.lectures.stats.attendanceRatio')}:{' '}
              {attendanceRatio.toFixed(2)}%
            </h2>
          </div>
          <div className='p-2 bg-green-100 rounded'>
            <h2 className='mb-2 text-lg'>
            {t('admin.lectures.stats.highestAttendance')}:
              {highestAttendedLectures.map((lecture) => (
                <p key={lecture.lectureid} className='m-1'>
                  {lecture.attended} (ID: {lecture.lectureid})
                </p>
              ))}
            </h2>
          </div>
          <div className='p-2 bg-red-100 rounded'>
            <h2 className='mb-2 text-lg'>
            {t('admin.lectures.stats.lowestAttendance')}:
              {lowestAttendedLectures.map((lecture) => (
                <p key={lecture.lectureid} className='m-1'>
                  {lecture.attended} (ID: {lecture.lectureid})
                </p>
              ))}
            </h2>
          </div>
          <div className='p-2 bg-yellow-100 rounded'>
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
          <div className='p-2 bg-purple-100 rounded'>
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
      <div className='lg:w-1/4 sm:w-[20em] w-1/2 mt-4 mb-4'>
        <InputField
          type='text'
          name='search'
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder='Search by any field..'
          label='Search'
        />
      </div>

      {/* <PaginationControls /> */}
      
      {filterOpen && filteredLectures.length > 0 && (
        <h2 className='mb-2 text-lg'>{`Open lectures: ${filteredLectures.length}`}</h2>
      )}

      <TableContainer
        className={`relative bg-gray-100 overflow-auto ${
          isExpanded ? 'h-screen' : 'h-[384px]'
        }`}>
        <Table className='table-auto'>
          <TableHead className='sticky top-0 z-10 bg-white border-t-2 border-black'>
            <TableRow>
              <TableCell>{t('admin.common.lectureId')}</TableCell>

              <TableCell>{t('admin.lectures.tableContent.teacherEmail')}</TableCell>
              <TableCell>{t('admin.lectures.tableContent.courseName')}</TableCell>
              <TableCell>{t('admin.lectures.tableContent.courseCode')}</TableCell>
              <TableCell>{t('admin.lectures.tableContent.topicName')}</TableCell>
              <TableCell>{t('admin.lectures.tableContent.date')}</TableCell>
              <TableCell>{t('admin.lectures.tableContent.dayTime')}</TableCell>
              <TableCell>{t('admin.lectures.tableContent.attendance')}</TableCell>
              <TableCell>{t('admin.lectures.tableContent.totalAttendance')}</TableCell>
              <TableCell>{t('admin.lectures.tableContent.currentTopicStudentCount')}</TableCell>
              <TableCell>{t('admin.lectures.tableContent.ratio')}</TableCell>
              <TableCell>{t('admin.lectures.tableContent.state')}</TableCell>
              <TableCell>{t('admin.lectures.tableContent.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedLectures.length > 0 ? (
              paginatedLectures.map((lecture) => (
                <TableRow
                  key={lecture.lectureid}
                  className={`hover:bg-gray-200 ${
                    lecture.attended === 0 ? 'bg-red-200' : ''
                  }`}>
                  <TableCell>{lecture.lectureid}</TableCell>

                  <TableCell>{lecture.teacheremail}</TableCell>
                  <TableCell>{lecture.coursename}</TableCell>
                  <TableCell>{lecture.coursecode}</TableCell>
                  <TableCell>{lecture.topicname}</TableCell>
                  <TableCell>
                    {new Date(lecture.start_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{lecture.timeofday}</TableCell>

                  <TableCell
                    title={`Total attendance gathered: ${
                      lecture.attended + lecture.notattended
                    }`}>
                    <span className='text-metropoliaTrendGreen'>
                      {lecture.attended}
                    </span>
                    /
                    <span className='text-metropoliaSupportRed'>
                      {lecture.notattended}
                    </span>
                  </TableCell>
                  <TableCell>
                    {lecture.attended + lecture.notattended}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        lecture.attended + lecture.notattended !==
                        lecture.actualStudentCount
                          ? 'text-red-500'
                          : ''
                      }>
                      {lecture.actualStudentCount}
                    </span>
                  </TableCell>
                  <TableCell>
                    {Math.round(
                      (lecture.attended /
                        (lecture.attended + lecture.notattended)) *
                        100,
                    )}{' '}
                    %
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        lecture.state === 'open' &&
                        new Date(lecture.start_date).getTime() <
                          Date.now() - 24 * 60 * 60 * 1000
                          ? 'text-metropoliaSupportRed'
                          : 'text-metropoliaTrendGreen'
                      }>
                      {lecture.state}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className='flex gap-1'>
                      <button
                        color='primary'
                        onClick={() =>
                          handleRowClick(
                            lecture.courseid,
                            lecture.lectureid.toString(),
                          )
                        }
                        className='px-2 py-1 font-bold text-white transition rounded bg-metropoliaMainOrange h-fit hover:hover:bg-metropoliaSecondaryOrange sm:py-2 sm:px-4 focus:outline-none focus:shadow-outline'>
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
                          className='px-2 py-1 font-bold text-white transition rounded bg-metropoliaTrendGreen h-fit hover:hover:bg-green-600 sm:py-2 sm:px-4 focus:outline-none focus:shadow-outline'>
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
                          className='px-2 py-1 font-bold text-white transition rounded bg-metropoliaSupportRed h-fit hover:hover:bg-red-600 sm:py-2 sm:px-4 focus:outline-none focus:shadow-outline'>
                          {t('admin.common.delete')}
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} align='center'>
                  {filterOpen
                    ? 'No data available in open state'
                    : 'No data available'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <PaginationControls />
      
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>{`Are you sure you want to ${action} the lecture?`}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('admin.lectures.dialog.dialogText')}.</DialogContentText>
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

export default AdminAllLectures;
