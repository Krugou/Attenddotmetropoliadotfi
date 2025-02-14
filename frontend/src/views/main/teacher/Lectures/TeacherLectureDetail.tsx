import React, {useEffect, useState, useContext} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {UserContext} from '../../../../contexts/UserContext';
import {toast} from 'react-toastify';
import apiHooks from '../../../../api';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import Loader from '../../../../utils/Loader';

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

const TeacherLectureDetail = () => {
  const {t} = useTranslation(['translation']);
  const {lectureid} = useParams();
  const navigate = useNavigate();
  const {user} = useContext(UserContext);
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [action, setAction] = useState<'close' | 'delete' | null>(null);

  const getLocalDate = (utcDate: string) => {
    const date = new Date(utcDate);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  };

  useEffect(() => {
    const fetchLecture = async () => {
      if (!user || !lectureid) return;

      const token = localStorage.getItem('userToken');
      if (!token) {
        toast.error('No token available');
        navigate('/teacher/lectures');
        return;
      }

      try {
        const result = await apiHooks.fetchTeacherOwnLectures(
          user.userid.toString(),
          token,
        );
        const lectureFetched = result.find(
          (l) => l.lectureid.toString() === lectureid,
        );
        if (!lectureFetched) {
          toast.error('Lecture not found');
          navigate('/teacher/lectures');
          return;
        }
        setLecture(lectureFetched);
      } catch (error) {
        toast.error('Failed to fetch lecture details');
        navigate('/teacher/lectures');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLecture();
  }, [lectureid, user, navigate]);

  const handleDialogOpen = (action: 'close' | 'delete') => {
    setAction(action);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setAction(null);
    setDialogOpen(false);
  };

  const handleConfirm = async () => {
    const token = localStorage.getItem('userToken');
    if (!token || !lecture) {
      toast.error('No token available');
      return;
    }

    try {
      if (action === 'close') {
        await apiHooks.closeLectureByLectureId(
          lecture.lectureid.toString(),
          token,
        );
        toast.success('Lecture closed successfully');
      } else if (action === 'delete') {
        await apiHooks.deleteLectureByLectureId(
          lecture.lectureid.toString(),
          token,
        );
        toast.success('Lecture deleted successfully');
        navigate('/teacher/lectures');
      }
    } catch (error) {
      toast.error('Failed to perform action: ' + (error as Error).message);
    }
    handleDialogClose();
  };

  const handleDelete = () => handleDialogOpen('delete');
  const handleClose = () => handleDialogOpen('close');

  if (isLoading) return <Loader />;
  if (!lecture) return null;

  return (
    <div className='max-w-2xl p-6 mx-auto bg-white shadow-lg rounded-xl'>
      <div className='flex items-center justify-between mb-6 '>
        <button
          onClick={() => navigate('/teacher/lectures')}
          className='px-4 py-2 text-sm font-medium cursor-pointer text-gray-600 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200'>
          {t('teacher:lectures.details.back')}
        </button>
        <div className='space-x-2'>
          <button
            onClick={() =>
              navigate(
                `/teacher/courses/attendances/${
                  lecture.courseid
                }/${getLocalDate(lecture.start_date)}`,
              )
            }
            className='px-4 py-2 text-sm cursor-pointer font-medium text-white transition-colors rounded-lg bg-metropolia-main-orange hover:bg-metropolia-main-orange-dark'>
            {t('teacher:lectures.details.editAttendances')}
          </button>
          {lecture?.state === 'open' && (
            <button
              onClick={handleClose}
              className='px-4 py-2 text-sm cursor-pointer font-medium text-white transition-colors rounded-lg bg-metropolia-trend-green hover:bg-green-700'>
              {t('teacher:lectures.details.closeLecture')}
            </button>
          )}
          <button
            onClick={handleDelete}
            className='px-4 py-2 text-sm cursor-pointer font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700'>
            {t('teacher:lectures.details.deleteLecture')}
          </button>
        </div>
      </div>

      <div className='p-6 '>
        {lecture.attended === 0 && (
          <div className='mb-4 text-sm text-metropolia-support-red font-heading'>
            {t('teacher:lectures.details.warning')}
          </div>
        )}

        <div className='pb-3 mb-4 border-b'>
          <h1 className='mb-1 text-2xl font-bold text-gray-900 font-heading'>
            {lecture.coursename}
          </h1>
          <div className='text-sm text-gray-600'>
            {lecture.coursecode} - {lecture.topicname}
          </div>
        </div>

        <div className='grid gap-6 mb-6'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <div className='mb-1 text-sm text-gray-600 font-heading'>
                {t('teacher:lectures.details.date')}
              </div>
              <div className='font-medium'>
                {new Date(lecture.start_date).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className='mb-1 text-sm text-gray-600 font-heading'>
                {t('teacher:lectures.details.time')}
              </div>
              <div className='font-medium'>{lecture.timeofday}</div>
            </div>
          </div>

          <div className='p-4 rounded-lg bg-gray-50'>
            <div className='flex items-center justify-between mb-4'>
              <span className='text-sm text-gray-600 font-heading'>
                {t('teacher:lectures.details.attendance')}
              </span>
              <div>
                <span className='font-bold text-metropolia-trend-green'>
                  {lecture.attended}
                </span>
                <span className='mx-1 text-gray-400'>/</span>
                <span className='font-bold text-metropolia-support-red'>
                  {lecture.notattended}
                </span>
              </div>
            </div>

            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600 font-heading'>
                {t('teacher:lectures.details.ratio')}
              </span>
              <span className='font-bold'>
                {Math.round(
                  (lecture.attended /
                    (lecture.attended + lecture.notattended)) *
                    100,
                )}
                %
              </span>
            </div>
          </div>

          <div className='flex items-center justify-between'>
            <div className='text-sm text-gray-600 font-heading'>
              {t('teacher:lectures.details.status')}
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                lecture.state === 'open' &&
                new Date(lecture.start_date).getTime() <
                  Date.now() - 24 * 60 * 60 * 1000
                  ? 'bg-red-100 text-metropolia-support-red'
                  : 'bg-green-100 text-metropolia-trend-green'
              }`}>
              {lecture.state}
            </span>
          </div>
        </div>
      </div>

      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        className='relative z-50'
        PaperProps={{
          className: 'rounded-xl shadow-xl max-w-md w-full mx-4 p-0 bg-white',
        }}>
        <div className='p-6'>
          <DialogTitle className='p-0 mb-4'>
            <h3
              className={`text-2xl font-bold font-heading ${
                action === 'delete'
                  ? 'text-metropolia-support-red'
                  : 'text-metropolia-main-grey'
              }`}>
              {action === 'delete'
                ? t('teacher:lectures.details.confirmDialog.title', {action})
                : t('teacher:lectures.details.confirmDialog.title', {action})}
            </h3>
          </DialogTitle>
          <DialogContent className='p-0'>
            <DialogContentText className='text-base text-metropolia-main-grey'>
              {action === 'delete' ? (
                <div className='space-y-4'>
                  <div className='p-4 bg-red-50 rounded-lg border border-red-100'>
                    <p className='text-metropolia-support-red'>
                      <span className='font-bold block mb-2'>
                        {t(
                          'teacher:lectures.details.confirmDialog.important.title',
                        )}
                      </span>
                      {t(
                        'teacher:lectures.details.confirmDialog.important.message',
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                t('teacher:lectures.details.confirmDialog.message')
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions className='p-0 mt-6 flex gap-3'>
            <button
              onClick={handleDialogClose}
              className='px-4 py-2 text-sm font-medium text-metropolia-main-grey bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'>
              {t('teacher:lectures.details.confirmDialog.cancel')}
            </button>
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                action === 'delete'
                  ? 'bg-metropolia-support-red hover:bg-metropolia-support-red-dark'
                  : 'bg-metropolia-main-orange hover:bg-metropolia-main-orange-dark'
              }`}
              autoFocus>
              {t('teacher:lectures.details.confirmDialog.confirm')}
            </button>
          </DialogActions>
        </div>
      </Dialog>
    </div>
  );
};

export default TeacherLectureDetail;
