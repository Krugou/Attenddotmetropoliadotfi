import AutorenewIcon from '@mui/icons-material/Autorenew';
import GetAppIcon from '@mui/icons-material/GetApp';
import PrintIcon from '@mui/icons-material/Print';
import {FormControl, MenuItem, Select, Tooltip} from '@mui/material';
import React, {ChangeEvent, useContext, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import AttendanceTable from '../../../../components/main/course/attendance/AttendanceTable';
import {UserContext} from '../../../../contexts/UserContext';
import apiHooks from '../../../../hooks/ApiHooks';
import {exportToExcel, exportToPDF} from '../../../../utils/exportData';
import {useTranslation} from 'react-i18next';
/**
 * Attendance interface.
 * This interface defines the shape of an Attendance object.
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
 * StudentInfo interface.
 * This interface defines the shape of a StudentInfo object.
 */
interface StudentInfo {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  roleid: number;
  staff: number;
  studentnumber: string;
  userid: number;
  username: string;
  created_at: string;
  // Include other properties of student here
}
/**
 * TeacherStudentCourseAttendance component.
 * This component is responsible for rendering the attendance view for a single student in a course for a teacher.
 * It fetches the attendance data for the course and the student's information.
 * It also provides functionality for the teacher to sort the attendance data by topic and search by date.
 * Additionally, it provides functionality for the teacher to export the attendance data to PDF or Excel.
 */
const TeacherStudentCourseAttendance: React.FC = () => {
  const {t} = useTranslation();
  // Get the usercourseid from the url
  const {usercourseid} = useParams<{usercourseid}>();
  const {update, setUpdate} = useContext(UserContext);

  // State to keep track of the sort option
  const [sortOption, setSortOption] = useState('All Topics');
  // State to keep track of the attendance data
  const [attendanceData, setAttendanceData] = useState<Attendance[] | null>(
    null,
  );

  const [student, setStudent] = useState<StudentInfo | null>(null); // Define the student state variable as a Student object

  // State to keep track of the search term
  const [searchTerm, setSearchTerm] = useState('');

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
        setStudent(response[0]?.userinfo);

        console.log(response, 'RESPONSE');
        console.log(student, 'student');
        setAttendanceData(response);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, [usercourseid, update]);

  // If the attendance data is not available, return a loading message
  if (!attendanceData) {
    return <div>{t('teacher.studentAttendances.loading')}</div>;
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

  // Function to handle export to PDF
  const handleExportToPDF = () => {
    exportToPDF(filteredAttendanceData, student, sortOption);
  };

  // Function to handle export to Excel
  const handleExportToExcel = () => {
    exportToExcel(filteredAttendanceData, student, sortOption);
  };

  // Filter the attendance data based on the search term and the selected sort option
  const filteredAttendanceData = attendanceData.filter(
    (attendance) =>
      new Date(attendance.start_date)
        .toLocaleDateString()
        .includes(searchTerm) &&
      (sortOption === 'All Topics' || attendance.topicname === sortOption),
  );

  const updateView = () => {
    setUpdate(!update);
  };

  if (attendanceData.length > 0) {
    return (
      <div className='flex flex-col w-full p-5 bg-gray-100 rounded-lg lg:w-fit'>
        <h1 className='mt-2 mb-8 text-xl font-bold text-center sm:text-3xl'>
          {student?.first_name + ' ' + student?.last_name}'s attendance in
          course: {attendanceData[0].name}
        </h1>
        <div className='flex flex-col flex-wrap items-center justify-around gap-5 md:flex-row md:gap-0'>
          <input
            type='text'
            placeholder={t('teacher.studentAttendances.search.placeholder')}
            value={searchTerm}
            onChange={handleSearchChange}
            className='md:w-[10em] p-4 m-2 border border-black rounded'
          />
          <div className='flex gap-10 md:gap-2'>
            <Tooltip title={t('teacher.studentAttendances.buttons.printPdf')}>
              <button
                onClick={handleExportToPDF}
                className='p-2 text-white rounded bg-metropoliaMainOrange'>
                <PrintIcon fontSize='large' />
              </button>
            </Tooltip>
            <Tooltip title={t('teacher.studentAttendances.buttons.exportExcel')}>
              <button
                onClick={handleExportToExcel}
                className='p-2 text-white rounded bg-metropoliaMainOrange'>
                <GetAppIcon fontSize='large' />
              </button>
            </Tooltip>
          </div>
          <FormControl className='mt-2 md:w-1/4 md:mt-0'>
            <div className='flex items-center gap-3 md:flex-none md:items-none'>
              <label>{t('teacher.studentAttendances.sort.label')}</label>
              <Select
                className='favorite-selector'
                value={sortOption}
                onChange={handleChange}>
                <MenuItem value='All Topics'>
                  <div className='item-selector'>
                    <AutorenewIcon className='highest-star-selector-icon' />
                    <span className='selector-text'>
                      {t('teacher.studentAttendances.sort.allTopics')}
                    </span>
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
            </div>
          </FormControl>
        </div>
        <AttendanceTable
          filteredAttendanceData={filteredAttendanceData}
          student={student}
          updateView={updateView}
        />
      </div>
    );
  }

  return (
    <div className='p-3 m-10 text-3xl font-bold text-center bg-white rounded-lg'>
      {t('teacher.studentAttendances.noData')}
    </div>
  );
};

export default TeacherStudentCourseAttendance;
