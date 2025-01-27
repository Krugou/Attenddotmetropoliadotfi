import React from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';

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

interface MobileLecturesProps {
  lectures: Lecture[];
}

const MobileLectures: React.FC<MobileLecturesProps> = ({lectures}) => {
  const {t} = useTranslation();
  const navigate = useNavigate();

  const handleEditLecture = (lectureId: number) => {
    navigate(`/teacher/lectures/${lectureId}`);
  };

  return (
    <div className='space-y-6'>
      {lectures.length > 0 ? (
        lectures.map((lecture) => (
          <div
            key={lecture.lectureid}
            className={`p-6 border rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl
              ${
                lecture.attended === 0
                  ? 'bg-red-100'
                  : 'bg-white hover:bg-gray-50'
              }`}>
            {lecture.attended === 0 && (
              <div className="mb-4 text-sm text-metropoliaSupportRed font-heading">
                Warning: This lecture might have failed as it has 0 attendees
              </div>
            )}
            {/* Header Section */}
            <div className='pb-3 mb-4 border-b'>
              <div className='mb-1 text-lg font-bold text-gray-900 font-heading'>
                {lecture.coursename}
              </div>
              <div className='text-sm text-gray-600'>
                {lecture.coursecode} - {lecture.topicname}
              </div>
            </div>

            {/* Main Info Section */}
            <div className='grid grid-cols-2 gap-4 mb-4'>
              <div className='col-span-2 sm:col-span-1'>
                <div className='mb-1 text-sm text-gray-600 font-heading'>
                  {t('teacher.lectures.table.headers.date')}
                </div>
                <div className='font-medium'>
                  {new Date(lecture.start_date).toLocaleDateString()}
                </div>
              </div>
              <div className='col-span-2 sm:col-span-1'>
                <div className='mb-1 text-sm text-gray-600 font-heading'>
                  {t('teacher.lectures.table.headers.timeOfDay')}
                </div>
                <div className='font-medium'>{lecture.timeofday}</div>
              </div>
            </div>

            {/* Stats Section */}
            <div className='p-4 mb-4 rounded-lg bg-gray-50'>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-sm text-gray-600 font-heading'>
                  {t('teacher.lectures.table.headers.attendance')}
                </span>
                <div>
                  <span className='font-bold text-metropoliaTrendGreen'>
                    {lecture.attended}
                  </span>
                  <span className='mx-1 text-gray-400'>/</span>
                  <span className='font-bold text-metropoliaSupportRed'>
                    {lecture.notattended}
                  </span>
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-600 font-heading'>
                  {t('teacher.lectures.table.headers.ratio')}
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

            {/* Status Section */}
            <div className='flex items-center justify-between'>
              <div className='text-sm text-gray-600 font-heading'>
                {t('teacher.lectures.table.headers.state')}
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  lecture.state === 'open' &&
                  new Date(lecture.start_date).getTime() <
                    Date.now() - 24 * 60 * 60 * 1000
                    ? 'bg-red-100 text-metropoliaSupportRed'
                    : 'bg-green-100 text-metropoliaTrendGreen'
                }`}>
                {lecture.state}
              </span>
            </div>

            <div className='flex justify-end mt-4 pt-4 border-t'>
              <button
                onClick={() => handleEditLecture(lecture.lectureid)}
                className='px-4 py-2 text-sm font-medium text-blue-600 transition-colors bg-blue-100 rounded-lg hover:bg-blue-200'>
                Edit
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className='p-8 text-center text-gray-500 bg-gray-50 rounded-xl font-heading'>
          {t('teacher.lectures.table.noData')}
        </div>
      )}
    </div>
  );
};

export default MobileLectures;
