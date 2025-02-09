import {useTranslation} from 'react-i18next';
import CircularProgress from '@mui/material/CircularProgress';
import React, {useContext, useEffect, useState} from 'react';
import {toast} from 'react-toastify';
import {UserContext} from '../../../../contexts/UserContext';
import apiHooks from '../../../../api';
import useMediaQuery from '@mui/material/useMediaQuery';
import MobileLectures from '../../../../components/main/teacher/lectures/MobileLectures';
import DesktopLectures from '../../../../components/main/teacher/lectures/DesktopLectures';

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

const TeacherLectures: React.FC = () => {
  const {t} = useTranslation(['translation']);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const {user} = useContext(UserContext);
  const [sortOrder] = useState<'asc' | 'desc'>('desc');
  const isMobile = useMediaQuery('(max-width: 768px)');

  const getLectures = async () => {
    const token: string | null = localStorage.getItem('userToken');
    if (!token) {
      toast.error('No token available');
      setIsLoading(false);
      return;
    }
    if (user) {
      try {
        const result = await apiHooks.fetchTeacherOwnLectures(
          user.userid.toString(),
          token,
        );
        const sortedLectures = result.sort((a, b) => {
          return sortOrder === 'asc'
            ? a.lectureid - b.lectureid
            : b.lectureid - a.lectureid;
        });
        setLectures(sortedLectures);
        setIsLoading(false);
      } catch (error) {
        const message = (error as Error).message;
        toast.error('Failed to fetch lectures: ' + message);
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      getLectures();
    }
  }, [user]);

  if (isLoading) {
    return <CircularProgress />;
  }

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

  return (
    <div className='relative w-full p-5 bg-white rounded-lg xl:w-fit'>
      <div className='flex flex-col justify-between md:flex-row'>
        <h1 className='mb-4 text-2xl font-heading'>
          {t('translation:teacher.lectures.title')}
        </h1>
        <h2 className='mb-2 text-xl'>
          {t('translation:teacher.lectures.stats.totalLectures')}:{' '}
          {totalLectures} |{' '}
          {t('translation:teacher.lectures.stats.attendanceRatio')}:{' '}
          {attendanceRatio.toFixed(2)}%
        </h2>
      </div>
      {isMobile ? (
        <MobileLectures lectures={lectures} />
      ) : (
        <DesktopLectures lectures={lectures} />
      )}
    </div>
  );
};

export default TeacherLectures;
