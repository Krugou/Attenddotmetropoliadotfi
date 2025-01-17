import AutorenewIcon from '@mui/icons-material/Autorenew';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import {Button, FormControl, MenuItem, Select} from '@mui/material';
import React, {ChangeEvent, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import AttendanceStatsTable from '../../../components/main/course/attendance/AttendanceStatsTable';
import AttendanceTable from '../../../components/main/course/attendance/AttendanceTable';
import apiHooks from '../../../hooks/ApiHooks';
import {useCourses} from '../../../hooks/courseHooks';
import {useTranslation} from 'react-i18next';
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
  const {t} = useTranslation();
  // Get the usercourseid from the url
  const {usercourseid} = useParams<{usercourseid}>();

  // State to keep track of the sort option
  const [sortOption, setSortOption] = useState('All');

  // State to keep track of the attendance data
  const [attendanceData, setAttendanceData] = useState<Attendance[] | null>(
    null,
  );

  const [showTable, setShowTable] = useState(true);

  // State to keep track of the search term
  const [searchTerm, setSearchTerm] = useState('');

  const {threshold} = useCourses();

  // Function to handle search term change
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  // Fetch attendance data for the course
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
        console.log(response, 'RESPONSE');
        setAttendanceData(response);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, [usercourseid]);

  // If the attendance data is not available, return a loading message
  if (!attendanceData) {
    return <div>{t('admin.common.loading')}</div>;
  }

  // Function to handle sort option change
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
  console.log(filteredAttendanceData, 'filteredAttendanceData');
  if (attendanceData.length > 0) {
    return (
      <div className='flex flex-col w-full p-5 overflow-x-auto bg-gray-100 border-t rounded-lg 2xl:w-3/4 border-x'>
        <h1 className='mt-2 mb-8 text-xl font-bold text-center sm:text-4xl'>
          {t('student.course.attendaceOfCourse')} {attendanceData[0].name}
        </h1>
        <div className='flex flex-col flex-wrap items-center justify-around gap-5 mb-5 sm:flex-row'>
          <input
            type='text'
            placeholder={t('admin.common.searchByDate')}
            value={searchTerm}
            onChange={handleSearchChange}
            className='w-10/12 sm:w-[20em] mt-10 p-4 m-2 border border-black rounded'
          />
          <FormControl className='mt-2 md:w-1/4 md:mt-0'>
            <label>{t('student.course.sortTopics')}:</label>
            <Select
              className='favorite-selector'
              value={sortOption}
              onChange={handleChange}>
              <MenuItem value='All'>
                <div className='item-selector'>
                  <AutorenewIcon className='highest-star-selector-icon' />
                  <span className='selector-text'>{t('student.course.all')}</span>
                </div>
              </MenuItem>
              {uniqueTopics.map((topic, index) => (
                <MenuItem key={index} value={topic}>
                  <div className='item-selector'>
                    <AutorenewIcon className='highest-star-selector-icon' />
                    <span className='selector-text'>{topic}</span>
                  </div>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className='text-center'>
          <Button
            variant='contained'
            color='primary'
            startIcon={<ShowChartIcon />}
            className='w-fit '
            onClick={() => setShowTable(!showTable)}>
            {showTable
              ? t('student.course.showAttendanceStats')
              : t('student.course.showAttendanceTable')}
          </Button>
        </div>
        {showTable && (
          <AttendanceTable filteredAttendanceData={filteredAttendanceData} />
        )}
        {!showTable && (
          <AttendanceStatsTable
            attendanceStudentData={attendanceStudentData}
            threshold={threshold}
            usercourseid={usercourseid}
          />
        )}
      </div>
    );
  } else {
    return (
      <div className='p-3 m-10 text-3xl font-bold text-center bg-white rounded-lg'>
        {t('admin.common.noDataAvailable')}
      </div>
    );
  }
};

export default StudentCourseAttendance;
