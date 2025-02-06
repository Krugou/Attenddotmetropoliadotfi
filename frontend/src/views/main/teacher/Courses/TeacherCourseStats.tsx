import GetAppIcon from '@mui/icons-material/GetApp';
import PrintIcon from '@mui/icons-material/Print';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import React, {useContext, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import AttendanceStatsTable from '../../../../components/main/course/attendance/AttendanceStatsTable';
import {UserContext} from '../../../../contexts/UserContext';
import apiHooks from '../../../../api';
import {useCourses} from '../../../../hooks/courseHooks';
import {
  exportStatsTableToExcel,
  exportStatsTableToPdf,
} from '../../../../utils/exportData';
import {useTranslation} from 'react-i18next';
/**
 * Course interface.
 * This interface defines the shape of a Course object.
 */
interface Course {
  name: string;
  code: string;
  courseid: number;

  // Include other properties of course here
}
/**
 * AttendanceCount interface.
 * This interface defines the shape of an AttendanceCount object.
 */
interface AttendanceCount {
  name: string;
  selectedTopics: string | string[];
  percentage: number;
  count: number;
  topicname: string;
  userid: number;
}
/**
 * TopicAttendance interface.
 * This interface defines the shape of a TopicAttendance object.
 */
interface TopicAttendance {
  topicname: string;
  attendanceCounts: AttendanceCount[];
}
/**
 * TeacherCourseStats component.
 * This component is responsible for rendering the attendance statistics for a course for a teacher.
 * It fetches the attendance data for the course and provides functionality for the teacher to sort the attendance data by topic and search by date.
 * Additionally, it provides functionality for the teacher to export the attendance data to PDF or Excel.
 */
const TeacherCourseStats = () => {
  const {t} = useTranslation();
  const [showTable, setShowTable] = useState(false);
  const {courseid} = useParams<{courseid: string}>();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const {threshold} = useCourses();

  const {courses} = useCourses();

  const navigate = useNavigate();
  const {user} = useContext(UserContext);
  const [allAttendanceCounts, setAllAttendanceCounts] = useState<
    TopicAttendance[]
  >([]);

  console.log(courses, 'courses');

  // This function calculates the attendance for a single user on a single topic
  const sumUserAttendanceOnTopic = (users, userid, topicname) => {
    return users.filter(
      (user) =>
        user.userid === userid &&
        (user.status === 1 || user.status === 2) &&
        (user.selectedParts && user.selectedParts.length > 0
          ? user.selectedParts.some(
              (part) =>
                part.topicname === topicname && user.topicname === topicname,
            )
          : (!user.selectedParts || user.selectedParts.length === 0) &&
            user.topicname === topicname),
    ).length;
  };

  // This function calculates the attendance for all users on a single topic
  const calculateAttendanceForAllUsers = (
    users,
    allUsers,
    lectures,
    topicname,
  ) => {
    const uniqueUserIds = [...new Set(allUsers.map((user) => user.userid))];
    const lecture = lectures.find((lecture) => lecture.topicname === topicname);
    const lecture_count = lecture ? lecture.lecture_count : 0;

    // Calculate the attendance for each user
    const attendanceCounts = uniqueUserIds.map((userid) => {
      const count = sumUserAttendanceOnTopic(users, userid, topicname);
      let user = users.find((user) => user.userid === userid);
      if (!user) {
        user = allUsers.find((user) => user.userid === userid);
      }
      const name = user
        ? `${user.last_name} ${user.first_name}`
        : 'Unknown User';
      // Get the selected topics for the user
      const selectedTopics =
        user && user.selectedParts && user.selectedParts.length > 0
          ? user.selectedParts.map((part) => part.topicname)
          : 'all';
      const percentage =
        lecture_count > 0
          ? parseFloat(((count / lecture_count) * 100).toFixed(1))
          : 'No lectures'; // Calculate the percentage of attendance for the user on the topic if there are lectures
      return {
        name,
        count,
        topicname,
        percentage,
        selectedTopics,
        userid,
      };
    });
    return attendanceCounts;
  };
  // This function calculates the attendance for all users on all topics
  const calculateAttendanceForAllTopics = (users, allUsers, lectures) => {
    return lectures.map((lecture) => {
      const attendanceCounts = calculateAttendanceForAllUsers(
        users,
        allUsers,
        lectures,
        lecture.topicname,
      );
      return {
        topicname: lecture.topicname,
        attendanceCounts,
      };
    });
  };

  // This function is called when a course is selected
  const handleCourseSelect = async (value: string | null) => {
    if (!value) {
      return;
    }
    // Find the selected course from the courses array

    const selected: Course | undefined = courses.find(
      (course: Course) => `${course.name} ${course.code}` === value,
    );
    // If the selected course is found, fetch the course details
    if (selected) {
      const course = selected as Course;
      try {
        if (user?.role === 'teacher') {
          navigate(`/teacher/courses/stats/${course?.courseid}`);
        }
        if (user?.role === 'counselor') {
          navigate(`/counselor/courses/stats/${course?.courseid}`);
        }
        if (user?.role === 'admin') {
          navigate(`/counselor/courses/stats/${course?.courseid}`);
        }

        setSelectedCourse(course); // Add this line

        const token: string | null = localStorage.getItem('userToken');
        if (!token) {
          throw new Error('No token available');
        }
        const courseDetails = await apiHooks.getDetailsByCourseId(
          course.courseid.toString(),
          token,
        );

        console.log(courseDetails);

        // Calculate the attendance for all users on all topics for the selected course
        const allAttendanceCounts = calculateAttendanceForAllTopics(
          courseDetails.users,
          courseDetails.allUsers,
          courseDetails.lectures,
        );

        setAllAttendanceCounts(allAttendanceCounts);

        setShowTable(true);
        console.log(allAttendanceCounts, 'all attendancescounts');
      } catch (error) {
        toast.error('Error fetching course details');
        console.log(error);
      }
    }
  };

  // This function is called when the courseid changes in the url (when a course is selected)
  useEffect(() => {
    if (courseid) {
      const selectedCourse: Course | undefined = courses.find(
        (course: Course) => course.courseid?.toString() === courseid,
      );
      if (selectedCourse) {
        const course = selectedCourse as Course;
        handleCourseSelect(`${course.name} ${course.code}`);
      }
    }
  }, [courseid, courses]);

  const handlePdfExport = () => {
    if (!selectedCourse) {
      toast.error('No course selected');
      return;
    }
    exportStatsTableToPdf(allAttendanceCounts, selectedCourse);
  };
  const handleExcelExport = () => {
    exportStatsTableToExcel(allAttendanceCounts, selectedCourse);
  };
  return (
    <>
      <h1 className='p-3 mb-2 text-2xl text-center bg-white rounded-md font-heading'>
        {t('teacher.courseStats.title')}
      </h1>
      <div className='w-full p-4 bg-white rounded-lg 2xl:w-3/4'>
        <div className='flex justify-between sm:justify-around'>
          <Tooltip title={t('teacher.courseStats.buttons.printPdf')}>
            <button
              onClick={handlePdfExport}
              className='p-2 text-white rounded bg-metropoliaMainOrange'>
              <PrintIcon fontSize='large' />
            </button>
          </Tooltip>
          <Autocomplete
            className='sm:w-[30em] mr-3 ml-3 w-1/2'
            freeSolo
            options={courses.map(
              (course: Course) => `${course.name} ${course.code}`,
            )}
            onChange={(_, value) => handleCourseSelect(value)}
            value={
              selectedCourse
                ? `${selectedCourse.name} ${selectedCourse.code}`
                : null
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('teacher.courseStats.search.label')}
                margin='normal'
                variant='outlined'
              />
            )}
          />
          <Tooltip title={t('teacher.courseStats.buttons.exportExcel')}>
            <button
              onClick={handleExcelExport}
              className='p-2 text-white rounded bg-metropoliaMainOrange'>
              <GetAppIcon fontSize='large' />
            </button>
          </Tooltip>
        </div>
        {showTable && (
          <AttendanceStatsTable
            allAttendanceCounts={allAttendanceCounts}
            threshold={threshold}
            currentCourseId={courseid}
          />
        )}
      </div>
    </>
  );
};

export default TeacherCourseStats;
