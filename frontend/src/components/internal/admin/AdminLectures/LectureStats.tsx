import React from 'react';
import {Lecture} from '../../../../types/lecture.ts';
import {TFunction} from 'i18next';

interface LectureStatsProps {
  lectures: Lecture[];
  extraStats: boolean;
  filterOpen: boolean;
  t: TFunction;
}

const LectureStats: React.FC<LectureStatsProps> = ({
                                                     lectures,
                                                     extraStats,
                                                     filterOpen,
                                                     t,
                                                   }) => {
  if (!lectures.length || !extraStats || filterOpen) return null;

  const totalLectures = lectures.length;
  const totalAttended = lectures.reduce((sum, l) => sum + l.attended, 0);
  const totalNotAttended = lectures.reduce((sum, l) => sum + l.notattended, 0);
  const attendanceRatio =
    totalAttended + totalNotAttended > 0
      ? (totalAttended / (totalAttended + totalNotAttended)) * 100
      : 0;

  const maxAttended = Math.max(...lectures.map((l) => l.attended));
  const maxNotAttended = Math.max(...lectures.map((l) => l.notattended));
  const minAttended = Math.min(...lectures.map((l) => l.attended));
  const minNotAttended = Math.min(...lectures.map((l) => l.notattended));

  const highestAttendedLectures = lectures.filter((l) => l.attended === maxAttended);
  const lowestAttendedLectures = lectures.filter((l) => l.attended === minAttended);
  const highestNotAttendedLectures = lectures.filter((l) => l.notattended === maxNotAttended);
  const lowestNotAttendedLectures = lectures.filter((l) => l.notattended === minNotAttended);

  return (
    <div className='grid grid-cols-1 gap-4 p-4 md:grid-cols-2'>
      <div className='p-2 bg-blue-100 rounded-sm col-span-full'>
        <h2 className='mb-2 text-lg'>
          {t('admin:TeacherLectures.stats.totalLectures')}: {totalLectures} |{' '}
          {t('admin:TeacherLectures.stats.attendanceRatio')}: {attendanceRatio.toFixed(2)}%
        </h2>
      </div>

      <div className='p-2 bg-green-100 rounded-sm'>
        <h2 className='mb-2 text-lg'>
          {t('admin:TeacherLectures.stats.highestAttendance')}:
        </h2>
        {highestAttendedLectures.map((l) => (
          <p key={l.lectureid} className='m-1'>
            {l.attended} (ID: {l.lectureid})
          </p>
        ))}
      </div>

      <div className='p-2 bg-red-100 rounded-sm'>
        <h2 className='mb-2 text-lg'>
          {t('admin:TeacherLectures.stats.lowestAttendance')}:
        </h2>
        {lowestAttendedLectures.map((l) => (
          <p key={l.lectureid} className='m-1'>
            {l.attended} (ID: {l.lectureid})
          </p>
        ))}
      </div>

      <div className='p-2 bg-yellow-100 rounded-sm'>
        <h2 className='mb-2 text-lg'>
          {t('admin:TeacherLectures.stats.highestNotAttended')}:
        </h2>
        {highestNotAttendedLectures.map((l) => (
          <p key={l.lectureid} className='m-1'>
            {l.notattended} (ID: {l.lectureid})
          </p>
        ))}
      </div>

      <div className='p-2 bg-purple-100 rounded-sm'>
        <h2 className='mb-2 text-lg'>
          {t('admin:TeacherLectures.stats.lowestNotAttended')}:
        </h2>
        {lowestNotAttendedLectures.map((l) => (
          <p key={l.lectureid} className='m-1'>
            {l.notattended} (ID: {l.lectureid})
          </p>
        ))}
      </div>
    </div>
  );
};

export default LectureStats;
