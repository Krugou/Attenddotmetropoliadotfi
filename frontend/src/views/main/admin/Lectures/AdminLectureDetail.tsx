import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, {useContext, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import {UserContext} from '../../../../contexts/UserContext';
import apiHooks from '../../../../api';
import {useTranslation} from 'react-i18next';

const AdminLectureDetail = () => {
  type DataType = {
    code: string;
    teacher: string;
    topicname: string;
    start_date: string;
    timeofday: string;
    attendanceid: number;
    usercourseid: number;
    first_name: string;
    last_name: string;
    status: number;
    // Add other properties as needed
  }[];
  const {t} = useTranslation(['translation']);
  const [data, setData] = useState<DataType | null>(null);
  const [loading, setLoading] = useState(true);
  const {user} = useContext(UserContext);
  const {courseId, lectureId} = useParams();
  const fetchData = async () => {
    try {
      const token: string | null = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token available');
      }
      if (!courseId || !lectureId) {
        toast.error('Course ID or Lecture ID is not available');
        throw new Error('Course ID or Lecture ID is not available');
      }
      const response = await apiHooks.fetchAttendances(
        token,
        courseId,
        lectureId,
      );
      console.log('🚀 ~ fetchData ~ response:', response);
      if (!response || response.length === 0) {
        toast.info(
          'No data found for this lecture, wait until students attend',
        );
      } else {
        setData(response);
      }
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching attendances');
      setLoading(false);
    }
  };
  const handleDelete = async (attendanceId: number) => {
    try {
      const token: string | null = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token available');
      }
      await apiHooks.deleteAttendanceByAttendanceId(token, attendanceId);
      toast.success('Attendance deleted successfully');
      // Refresh the data after deleting an attendance
      fetchData();
    } catch (error) {
      toast.error(t('admin.lectures.error.deleteAttendance'));
    }
  };
  const isDuplicate = (usercourseid: number) => {
    if (!data) return false;
    const count = data.filter(
      (item) => item.usercourseid === usercourseid,
    ).length;
    return count > 1;
  };
  useEffect(() => {
    fetchData();
  }, [courseId, lectureId, user]);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleOpenDialog = (id: number) => {
    setDeleteId(id);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deleteId !== null) {
      handleDelete(deleteId);
    }
    setOpen(false);
  };
  if (loading) {
    return <CircularProgress />;
  }

  return (
    <div className='p-4 m-4 bg-metropolia-support-white'>
      <Typography variant='h6' component='h2' gutterBottom>
        {t('translation:admin.common.lectureId')}: {lectureId} -{' '}
        {data && data[0].code} - {data && data[0].teacher} -{' '}
        {data && data[0].topicname} -{' '}
        {data && new Date(data[0].start_date).toLocaleDateString()} -{' '}
        {data && data[0].timeofday}
      </Typography>
      <TableContainer
        component={Paper}
        style={{maxHeight: '500px', overflow: 'auto'}}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                {t('translation:admin.common.attendanceId')}
              </TableCell>
              <TableCell>
                {t('translation:admin.common.userCourseId')}
              </TableCell>
              <TableCell>{t('translation:admin.common.name')}</TableCell>
              <TableCell>{t('translation:admin.common.status')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data &&
              data.map((item, index: number) => (
                <TableRow
                  key={index}
                  className={
                    item.status === 1
                      ? 'bg-metropolia-trend-green '
                      : 'bg-metropolia-support-red '
                  }>
                  <TableCell style={{color: 'white'}}>
                    {item.attendanceid}
                  </TableCell>
                  <TableCell style={{color: 'white'}}>
                    {item.usercourseid}{' '}
                    {isDuplicate(item.usercourseid) && '(this is duplicate)'}
                  </TableCell>
                  <TableCell style={{color: 'white'}}>
                    {item.first_name} {item.last_name}
                  </TableCell>
                  <TableCell style={{color: 'white'}}>
                    {item.status === 1 ? 'Present' : 'Not Present'}
                  </TableCell>
                  <TableCell style={{color: 'white'}}>
                    <button
                      className='px-2 py-1 text-white transition rounded-sm font-heading bg-metropolia-support-red h-fit hover:hover:bg-red-600 sm:py-2 sm:px-4 focus:outline-hidden focus:shadow-outline'
                      onClick={() => handleOpenDialog(item.attendanceid)}>
                      {t('translation:admin.common.delete')}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
          <Dialog
            open={open}
            onClose={handleCloseDialog}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'>
            <DialogTitle id='alert-dialog-title'>
              {'Confirm Delete'}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id='alert-dialog-description'>
                {t('translation:admin.lectures.delete.deleteAttendance')}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <button
                className='px-4 py-2 text-white bg-gray-500 rounded-sm font-heading hover:bg-gray-700'
                onClick={handleCloseDialog}>
                {t('translation:admin.common.cancel')}
              </button>
              <button
                className='px-4 py-2 ml-2 text-white rounded-sm font-heading bg-metropolia-support-red hover:bg-red-600'
                onClick={handleConfirmDelete}
                autoFocus>
                {t('translation:admin.common.confirm')}
              </button>
            </DialogActions>
          </Dialog>
        </Table>
      </TableContainer>
    </div>
  );
};

export default AdminLectureDetail;
