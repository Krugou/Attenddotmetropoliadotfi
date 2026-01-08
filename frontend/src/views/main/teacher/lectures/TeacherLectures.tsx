import {useTranslation} from 'react-i18next';
import React, {useContext, useEffect, useState} from 'react';
import {toast} from 'react-toastify';
import {UserContext} from '../../../../contexts/UserContext';
import apiHooks from '../../../../api';
import useMediaQuery from '@mui/material/useMediaQuery';
import MobileLectures from '../../../../components/internal/teacher/TeacherLectures/MobileLectures';
import DesktopLectures from '../../../../components/internal/teacher/TeacherLectures/DesktopLectures';
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

const TeacherLectures: React.FC = () => {
  const {t} = useTranslation('teacher'); // ✅ teacher namespace
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const {user} = useContext(UserContext);
  const [sortOrder] = useState<'asc' | 'desc'>('desc');
  const isMobile = useMediaQuery('(max-width: 768px)');

  const getLectures = async () => {
    const token: string | null = localStorage.getItem('userToken');
    if (!token) {
      toast.error(t('errors.noToken'));
      setIsLoading(false);
      return;
    }

    if (!user) return;

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
    } catch (error) {
      const message = (error as Error).message;
      toast.error(t('lectures.errors.fetchFailed', {message}));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      getLectures();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const totalLectures = lectures.length;
  const totalAttended = lectures.reduce((sum, lecture) => sum + lecture.attended, 0);
  const totalNotAttended = lectures.reduce((sum, lecture) => sum + lecture.notattended, 0);

  const attendanceRatio =
    totalLectures > 0 ? (totalAttended / (totalAttended + totalNotAttended)) * 100 : 0;

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[1250px] px-2 sm:px-4 lg:px-6">
        <section className="w-full bg-gray-100 rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
            <h1 className="text-2xl sm:text-3xl font-heading text-metropolia-main-grey">
              {t('lectures.title')}
            </h1>

            <div className="text-sm sm:text-base text-metropolia-main-grey">
              {t('lectures.stats.totalLectures')}: {totalLectures}
              {'  '}|{'  '}
              {t('lectures.stats.attendanceRatio')}: {attendanceRatio.toFixed(2)}%
            </div>
          </div>

          <div className="p-2 sm:p-3">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[45vh]">
                <Loader />
              </div>
            ) : (
              <>
                {isMobile ? (
                  <MobileLectures lectures={lectures} />
                ) : (
                  <DesktopLectures lectures={lectures} />
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default TeacherLectures;
