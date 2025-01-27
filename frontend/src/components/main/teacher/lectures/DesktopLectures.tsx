import React, {useState} from 'react';
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

interface DesktopLecturesProps {
  lectures: Lecture[];
}

const DesktopLectures: React.FC<DesktopLecturesProps> = ({lectures}) => {
  const {t} = useTranslation();
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  return (
    <div className='space-y-4'>
      <div className='flex justify-end'>
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className='px-4 py-2 text-sm font-medium text-gray-600 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300'>
          {showTechnicalDetails ? 'Hide' : 'Show'} Technical Details
        </button>
      </div>

      <div className='relative overflow-auto bg-white shadow-lg rounded-xl'>
        <table className='w-full'>
          <thead className='sticky top-0 z-10 bg-white border-b'>
            <tr className='bg-gray-50'>
              {showTechnicalDetails && (
                <>
                  <th className='p-4 text-left font-heading'>
                    {t('teacher.lectures.table.headers.lectureId')}
                  </th>
                  <th className='p-4 text-left font-heading'>
                    {t('teacher.lectures.table.headers.courseCode')}
                  </th>
                </>
              )}
              <th className='p-4 text-left font-heading'>
                {t('teacher.lectures.table.headers.courseName')}
              </th>
              <th className='p-4 text-left font-heading'>
                {t('teacher.lectures.table.headers.topicName')}
              </th>
              <th className='p-4 text-left font-heading'>
                {t('teacher.lectures.table.headers.date')}
              </th>
              <th className='p-4 text-left font-heading'>
                {t('teacher.lectures.table.headers.timeOfDay')}
              </th>
              <th className='p-4 text-left font-heading'>
                {t('teacher.lectures.table.headers.attendance')}
              </th>
              {showTechnicalDetails && (
                <>
                  <th className='p-4 text-left font-heading'>
                    {t('teacher.lectures.table.headers.ratio')}
                  </th>
                </>
              )}
              <th className='p-4 text-left font-heading'>
                {t('teacher.lectures.table.headers.state')}
              </th>
            </tr>
          </thead>
          <tbody>
            {lectures.length > 0 ? (
              lectures.map((lecture) => (
                <tr
                  key={lecture.lectureid}
                  className={`transition-all duration-200 hover:bg-gray-50
                    ${lecture.attended === 0 ? 'bg-red-100' : ''}`}>
                  {showTechnicalDetails && (
                    <>
                      <td className='p-4 font-medium text-gray-500'>
                        {lecture.lectureid}
                      </td>
                      <td className='p-4 text-gray-500'>
                        {lecture.coursecode}
                      </td>
                    </>
                  )}
                  <td className='p-4'>
                    <div className='font-bold text-gray-900 font-heading'>
                      {lecture.coursename}
                    </div>
                  </td>
                  <td className='p-4 text-gray-600'>{lecture.topicname}</td>
                  <td className='p-4 font-medium'>
                    {new Date(lecture.start_date).toLocaleDateString()}
                  </td>
                  <td className='p-4 font-medium'>{lecture.timeofday}</td>
                  <td className='p-4'>
                    <div className='inline-flex px-4 py-2 rounded-lg bg-gray-50'>
                      <span className='font-bold text-metropoliaTrendGreen'>
                        {lecture.attended}
                      </span>
                      <span className='mx-1 text-gray-400'>/</span>
                      <span className='font-bold text-metropoliaSupportRed'>
                        {lecture.notattended}
                      </span>
                    </div>
                  </td>
                  {showTechnicalDetails && (
                    <>
                      <td className='p-4 font-bold'>
                        {Math.round(
                          (lecture.attended /
                            (lecture.attended + lecture.notattended)) *
                            100,
                        )}
                        %
                      </td>
                    </>
                  )}
                  <td className='p-4'>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        lecture.state === 'open' &&
                        new Date(lecture.start_date).getTime() <
                          Date.now() - 24 * 60 * 60 * 1000
                          ? 'bg-red-100 text-metropoliaSupportRed'
                          : 'bg-green-100 text-metropoliaTrendGreen'
                      }`}>
                      {lecture.state}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={showTechnicalDetails ? 11 : 9}
                  className='p-8 text-center text-gray-500 bg-gray-50 font-heading'>
                  {t('teacher.lectures.table.noData')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DesktopLectures;
