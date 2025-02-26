import {
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
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import apiHooks from '../../../../api';
import {useTranslation} from 'react-i18next';
import Loader from '../../../../utils/Loader';

// Define specific interfaces for better type safety
interface AttendanceData {
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
}

interface ApiError extends Error {
  statusCode?: number;
  details?: string;
}

const AdminLectureDetail: React.FC = () => {
  const {t} = useTranslation(['admin']);
  const [data, setData] = useState<AttendanceData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);
  const {courseId, lectureId} = useParams<{
    courseId: string;
    lectureId: string;
  }>();
  const [open, setOpen] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Memoized function to check for duplicate entries
  const duplicateUserCourseIds = useMemo(() => {
    if (!data) return new Set<number>();

    const counts = new Map<number, number>();
    data.forEach((item) => {
      const count = counts.get(item.usercourseid) || 0;
      counts.set(item.usercourseid, count + 1);
    });

    return new Set(
      Array.from(counts.entries())
        .filter(([_, count]) => count > 1)
        .map(([id]) => id),
    );
  }, [data]);

  // Convert to useCallback for better performance
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token: string | null = localStorage.getItem('userToken');
      if (!token) {
        const err = new Error('No token available') as ApiError;
        err.statusCode = 401;
        throw err;
      }

      if (!courseId || !lectureId) {
        toast.error(t('admin:lectures.error.missingIds'));
        const err = new Error(
          'Course ID or Lecture ID is not available',
        ) as ApiError;
        err.statusCode = 400;
        throw err;
      }

      const response = await apiHooks.fetchAttendances(
        token,
        courseId,
        lectureId,
      );

      if (!response || response.length === 0) {
        toast.info(t('admin:lectures.info.noData'));
      } else {
        setData(response);
      }
    } catch (err) {
      const error = err as ApiError;
      setError(error);
      toast.error(
        error.details ||
          error.message ||
          t('admin:lectures.error.fetchAttendances'),
      );
    } finally {
      setLoading(false);
    }
  }, [courseId, lectureId, t]);

  const handleDelete = async (attendanceId: number) => {
    setIsDeleting(true);
    try {
      const token: string | null = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token available');
      }

      await apiHooks.deleteAttendanceByAttendanceId(token, attendanceId);
      toast.success(t('admin:lectures.success.deleteAttendance'));

      // Refresh the data after deleting an attendance
      fetchData();
    } catch (error) {
      toast.error(t('admin:lectures.error.deleteAttendance'));
    } finally {
      setIsDeleting(false);
    }
  };

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

  useEffect(() => {
    fetchData();

    // Cleanup function
    return () => {
      setData(null);
    };
  }, [fetchData]);

  if (loading) {
    return (
      <div className='flex items-center justify-center w-full h-64'>
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6 m-4 text-center rounded-lg bg-metropolia-support-red-dark/10'>
        <Typography
          variant='h6'
          className='font-heading text-metropolia-support-red'>
          {t('admin:common.error')}
        </Typography>
        <p className='mt-2 text-metropolia-main-grey'>
          {error.message || t('admin:lectures.error.unknown')}
        </p>
        <button
          onClick={fetchData}
          className='px-4 py-2 mt-4 text-white transition rounded-md bg-metropolia-main-orange hover:bg-metropolia-secondary-orange'>
          {t('admin:common.retry')}
        </button>
      </div>
    );
  }

  // Get lecture info for header
  const lectureInfo = data && data.length > 0 ? data[0] : null;

  return (
    <div className='p-6 m-4 overflow-hidden rounded-lg shadow-md bg-metropolia-support-white'>
      {/* Header section */}
      <div className='mb-6 border-b border-gray-200 pb-4'>
        <Typography
          variant='h5'
          component='h1'
          className='mb-2 font-heading text-metropolia-main-grey'>
          {t('admin:lectures.detail.title')}
        </Typography>

        {lectureInfo && (
          <div className='grid gap-2 mt-3 md:grid-cols-3 text-metropolia-main-grey'>
            <div className='p-2 rounded bg-gray-50'>
              <span className='text-xs font-medium uppercase text-metropolia-main-orange'>
                {t('admin:common.lectureId')}
              </span>
              <p className='font-heading'>{lectureId}</p>
            </div>
            <div className='p-2 rounded bg-gray-50'>
              <span className='text-xs font-medium uppercase text-metropolia-main-orange'>
                {t('admin:common.course')}
              </span>
              <p className='font-heading'>
                {lectureInfo.code} - {lectureInfo.topicname}
              </p>
            </div>
            <div className='p-2 rounded bg-gray-50'>
              <span className='text-xs font-medium uppercase text-metropolia-main-orange'>
                {t('admin:common.date')}
              </span>
              <p className='font-heading'>
                {new Date(lectureInfo.start_date).toLocaleDateString()} •{' '}
                {lectureInfo.timeofday}
              </p>
            </div>
          </div>
        )}

        <div className='flex justify-between mt-4'>
          <span className='text-sm text-metropolia-main-grey'>
            {data
              ? t('admin:lectures.detail.totalAttendances', {
                  count: data.length,
                })
              : t('admin:lectures.detail.noData')}
          </span>
          <button
            onClick={fetchData}
            className='flex items-center px-3 py-1 text-sm transition rounded bg-metropolia-main-orange/10 text-metropolia-main-orange hover:bg-metropolia-main-orange/20'>
            {t('admin:common.refresh')}
          </button>
        </div>
      </div>

      {/* Table section */}
      <TableContainer
        component={Paper}
        className='overflow-auto border border-gray-200 rounded-lg shadow-inner'
        style={{maxHeight: '500px'}}>
        <Table stickyHeader>
          <TableHead>
            <TableRow className='bg-gradient-to-r from-metropolia-main-orange to-metropolia-secondary-orange'>
              <TableCell className='font-heading text-metropolia-support-white'>
                {t('admin:common.attendanceId')}
              </TableCell>
              <TableCell className='font-heading text-metropolia-support-white'>
                {t('admin:common.userCourseId')}
              </TableCell>
              <TableCell className='font-heading text-metropolia-support-white'>
                {t('admin:common.name')}
              </TableCell>
              <TableCell className='font-heading text-metropolia-support-white'>
                {t('admin:common.status')}
              </TableCell>
              <TableCell className='font-heading text-metropolia-support-white'>
                {t('admin:common.actions')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data && data.length > 0 ? (
              data.map((item, index) => (
                <TableRow
                  key={`${item.attendanceid}-${index}`}
                  className={`transition-colors hover:bg-gray-50 ${
                    duplicateUserCourseIds.has(item.usercourseid)
                      ? 'bg-metropolia-support-yellow/10'
                      : item.status === 1
                      ? 'bg-metropolia-trend-green/10'
                      : 'bg-metropolia-support-red/10'
                  }`}>
                  <TableCell>{item.attendanceid}</TableCell>
                  <TableCell>
                    <div className='flex items-center'>
                      <span>{item.usercourseid}</span>
                      {duplicateUserCourseIds.has(item.usercourseid) && (
                        <span className='px-2 py-0.5 ml-2 text-xs rounded bg-metropolia-support-yellow/20 text-metropolia-main-grey'>
                          {t('admin:lectures.detail.duplicate')}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.first_name} {item.last_name}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        item.status === 1
                          ? 'bg-metropolia-trend-green/20 text-metropolia-trend-green-dark'
                          : 'bg-metropolia-support-red/20 text-metropolia-support-red-dark'
                      }`}>
                      {item.status === 1
                        ? t('admin:common.present')
                        : t('admin:common.absent')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <button
                      className='px-3 py-1.5 text-white transition rounded text-sm font-heading bg-metropolia-support-red hover:bg-metropolia-support-red-dark focus:outline-none focus:ring-2 focus:ring-metropolia-support-red/50 disabled:opacity-50'
                      onClick={() => handleOpenDialog(item.attendanceid)}
                      disabled={isDeleting}>
                      {t('admin:common.delete')}
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className='p-8 text-center text-metropolia-main-grey'>
                  {t('admin:lectures.detail.noAttendanceData')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirmation Dialog */}
      <Dialog
        open={open}
        onClose={handleCloseDialog}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        PaperProps={{
          className: 'rounded-md',
        }}>
        <DialogTitle id='alert-dialog-title' className='font-heading'>
          {t('admin:lectures.delete.title')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            {t('admin:lectures.delete.deleteAttendanceConfirm')}
          </DialogContentText>
        </DialogContent>
        <DialogActions className='p-4'>
          <button
            className='px-4 py-2 text-metropolia-main-grey bg-gray-100 rounded-md font-heading hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300'
            onClick={handleCloseDialog}>
            {t('admin:common.cancel')}
          </button>
          <button
            className='px-4 py-2 ml-2 text-white rounded-md font-heading bg-metropolia-support-red hover:bg-metropolia-support-red-dark transition-colors focus:outline-none focus:ring-2 focus:ring-metropolia-support-red/50'
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            autoFocus>
            {isDeleting
              ? t('admin:common.deleting')
              : t('admin:common.confirm')}
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminLectureDetail;
