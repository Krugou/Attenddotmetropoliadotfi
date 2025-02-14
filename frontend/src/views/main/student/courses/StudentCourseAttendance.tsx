import ShowChartIcon from '@mui/icons-material/ShowChart';
import React, {ChangeEvent, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import StudentAttendanceTable from '../../../../components/main/course/attendance/StudentAttendanceTable';
import StudentAttendanceStatsTable from '../../../../components/main/course/attendance/StudentAttendanceStatsTable';
import apiHooks from '../../../../api';
import {useCourses} from '../../../../hooks/courseHooks';
import {useTranslation} from 'react-i18next';
import {motion} from 'framer-motion';
/**
 * Interface for the attendance data.
 *
 * This interface represents the structure of an attendance object in the application. It includes the following properties:
 *
 * @property {string} date - The date of the attendance record.
 * @property {string} name - The name of the course.
 * @property {string} start_date - The start date of the course.
 * @property {string} timeofday - The time of day of the attendance record.
 * @property {string} topicname - The name of the topic for the attendance record.
 * @property {string} teacher - The name of the teacher for the course.
 * @property {number} status - The attendance status (0 = absent, 1 = present, 2 = late).
 */
interface Attendance {
  date: string;
  name: string;
  start_date: string;
  timeofday: string;
  topicname: string;
  teacher: string;
  status: number;
}
/**
 * StudentCourseAttendance component.
 *
 * This component is responsible for rendering the attendance records for a student in a specific course. It performs the following operations:
 *
 * 1. Fetches the usercourseid from the URL.
 * 2. Fetches the attendance data for the course from the API.
 * 3. Renders the attendance records in a table using the AttendanceTable component.
 * 4. Provides an option to view attendance statistics using the AttendanceStatsTable component.
 * 5. Provides an option to filter the attendance records by date and topic.
 *
 * If an error occurs while fetching the attendance data, it renders an error message.
 *
 * @returns A JSX element representing the student course attendance component.
 */
const StudentCourseAttendance: React.FC = () => {
  const {t} = useTranslation(['admin', 'student']);
  const {usercourseid} = useParams<{usercourseid}>();
  const [sortOption, setSortOption] = useState('All');
  const [attendanceData, setAttendanceData] = useState<Attendance[] | null>(
    null,
  );
  const [showTable, setShowTable] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const {threshold} = useCourses();

  // Function to handle search term change
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token: string | null = localStorage.getItem('userToken');
        if (!token) {
          throw new Error('No token available');
        }
        const response = await apiHooks.getAttendanceInfoByUsercourseid(
          usercourseid,
          token,
        );
        setAttendanceData(response);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, [usercourseid]);

  if (!attendanceData) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-xl text-metropolia-main-grey animate-pulse'>
          {t('admin:common.loading')}
        </div>
      </div>
    );
  }

  const handleChange = (event) => {
    setSortOption(event.target.value);
  };

  // Create an array of unique topics from the attendance data
  const uniqueTopics: string[] = Array.from(
    new Set(
      attendanceData.reduce((unique: string[], attendance) => {
        // If the topic name is already in the unique array, return the array as is
        // Otherwise, add the topic name to the unique array
        return unique.includes(attendance.topicname)
          ? unique
          : [...unique, attendance.topicname];
      }, [] as string[]),
    ),
  );

  // Step 1: Create an object to hold the attendance counts for each topic
  const topicAttendanceCounts = {};

  // Step 2: Iterate over `attendanceData`
  attendanceData.forEach((item) => {
    // If the `topicname` is not already a key in the object, add it
    if (!topicAttendanceCounts[item.topicname]) {
      topicAttendanceCounts[item.topicname] = {total: 0, attended: 0};
    }

    // Increment the `total` count for the topic
    topicAttendanceCounts[item.topicname].total += 1;

    // If the `status` is 1, increment the `attended` count for the topic
    if (item.status === 1 || item.status === 2) {
      topicAttendanceCounts[item.topicname].attended += 1;
    }
  });

  // Step 5: Calculate the attendance percentage for each topic
  const topicAttendancePercentages = {};
  for (const topic in topicAttendanceCounts) {
    const counts = topicAttendanceCounts[topic];
    topicAttendancePercentages[topic] = (counts.attended / counts.total) * 100;
  }

  const attendanceStudentData = {
    topics: uniqueTopics,
    attendance: topicAttendancePercentages,
  };

  // Filter the attendance data based on the search term and the selected sort option
  const filteredAttendanceData = attendanceData.filter(
    (attendance) =>
      new Date(attendance.start_date)
        .toLocaleDateString()
        .includes(searchTerm) &&
      (sortOption === 'All' || attendance.topicname === sortOption),
  );

  if (attendanceData.length > 0) {
    return (
      <motion.div
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{duration: 0.5}}
        className='w-full p-4 md:p-6 lg:p-8 space-y-6'>
        <h1 className='text-2xl md:text-4xl text-center font-heading  text-metropolia-main-grey mb-8'>
          {t('student:course.attendaceOfCourse')} {attendanceData[0].name}
        </h1>

        <div className='flex flex-col items-center space-y-4 w-full'>
          <div className='flex flex-row items-center justify-between  w-full space-x-4'>
            <div className='w-full max-w-md '>
              <label className='block mb-2 text-sm font-medium text-metropolia-main-grey'>
                {t('admin:common.searchByDate')}:
              </label>
              <input
                type='text'
                placeholder={new Date().toLocaleDateString()}
                value={searchTerm}
                onChange={handleSearchChange}
                className='w-full p-3 border border-metropolia-main-grey rounded-lg bg-metropolia-support-white focus:outline-none focus:ring-2 focus:ring-metropolia-main-orange transition-all placeholder-gray-400'
              />
            </div>

            <div className='w-full max-w-md'>
              <label className='block mb-2 text-sm font-medium text-metropolia-main-grey'>
                {t('student:course.sortTopics')}:
              </label>
              <select
                value={sortOption}
                onChange={handleChange}
                className='w-full p-3 border border-metropolia-main-grey rounded-lg focus:outline-none focus:ring-2 focus:ring-metropolia-main-orange transition-all bg-white'>
                <option value='All' className='py-2'>
                  {t('student:course.all')}
                </option>
                {uniqueTopics.map((topic, index) => (
                  <option key={index} value={topic} className='py-2'>
                    {topic}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={() => setShowTable(!showTable)}
            className='inline-flex items-center px-6 py-3 bg-metropolia-main-orange text-white rounded-lg hover:bg-metropolia-main-orange-dark transition-colors duration-200 font-medium space-x-2'>
            <ShowChartIcon className='w-5 h-5' />
            <span>
              {showTable
                ? t('student:course.showAttendanceStats')
                : t('student:course.showAttendanceTable')}
            </span>
          </button>
        </div>

        <div className='mt-8'>
          {showTable ? (
            <StudentAttendanceTable attendanceData={filteredAttendanceData} />
          ) : (
            <StudentAttendanceStatsTable
              attendanceStudentData={attendanceStudentData}
              threshold={threshold}
            />
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className='p-6 m-10 text-3xl text-center bg-white rounded-lg font-heading text-metropolia-main-grey'>
      {t('admin:common.noDataAvailable')}
    </div>
  );
};

export default StudentCourseAttendance;
