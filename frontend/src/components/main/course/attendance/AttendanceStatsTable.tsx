import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import React, {useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {UserContext} from '../../../../contexts/UserContext';
import apiHooks from '../../../../api';

import InfoIcon from '@mui/icons-material/Info';
/**
 * Represents the attendance count for a specific topic.
 */
interface AttendanceCount {
  name: string; // The name of the student
  count: number; // The attendance count
  topicname: string; // The name of the topic
  userid: number; // The ID of the user
  percentage: number; // The attendance percentage
  selectedTopics: string | string[]; // The selected topics
}

/**
 * Represents the attendance statistics for a specific topic.
 */
interface AttendanceStats {
  topicname: string; // The name of the topic
  attendanceCounts: AttendanceCount[]; // The attendance counts for the topic
}

/**
 * Represents the attendance data for a specific student.
 */
interface AttendanceStudentData {
  attendance: {[key: string]: number}; // The attendance counts, keyed by topic name
  topics: string | string[]; // The topics
}

/**
 * Props for the AttendanceStatsTable component.
 */
interface AttendanceStatsTableProps {
  allAttendanceCounts?: AttendanceStats[]; // The attendance statistics for all topics
  threshold: number | null; // The attendance threshold
  attendanceStudentData?: AttendanceStudentData; // The attendance data for a specific student
  usercourseid?: number; // The ID of the user course
  currentCourseId?: string;
}

/**
 * Represents a fetched data item.
 */
interface FetchedDataItem {
  last_name: string; // The last name of the student
  first_name: string; // The first name of the student
  topics: string[]; // The topics
}
/**
 * A table component that displays attendance statistics for a course.
 * It can be used in both the teacher view (to display statistics for all students) and the student view (to display statistics for a single student).
 */
const AttendanceStatsTable: React.FC<AttendanceStatsTableProps> = ({
  allAttendanceCounts,
  threshold,
  attendanceStudentData,
  usercourseid,
  currentCourseId,
}) => {
  // State to keep track of the fetched data
  const [fetchedData, setFetchedData] = useState<FetchedDataItem | null>(null);

  const topics = allAttendanceCounts
    ? allAttendanceCounts.map((item) => item.topicname)
    : fetchedData?.topics || [];
  // Fetch the student data for the course if the usercourseid is available (i.e. if the component is used in the student view)
  useEffect(() => {
    /**
     * Fetches the student data for the course.
     */
    const fetchData = async () => {
      if (usercourseid) {
        try {
          const token = localStorage.getItem('userToken');
          if (!token) {
            throw new Error('No token available');
          }

          // Fetch the student data for the course
          const response = await apiHooks.getStudentAndTopicsByUsercourseid(
            token,
            usercourseid,
          );
          setFetchedData(response);

          return response;
        } catch (error) {
          console.error('Error:', error);
        }
      }
    };

    fetchData();
  }, [usercourseid]);
  const {user} = useContext(UserContext);
  const navigate = useNavigate();

  const handleStudentClick = (studentId: number) => {
    const targetPath =
      user?.role === 'admin'
        ? `/counselor/students/${studentId}`
        : `/${user?.role}/students/${studentId}`;

    navigate(targetPath, {
      state: {
        fromCourseId: currentCourseId,
        fromStats: true,
      },
    });
  };

  return (
    <TableContainer className='overflow-x-auto sm:max-h-[30em] h-fit overflow-y-scroll border-gray-300 border-x border-t mt-5 mb-5 rounded-lg shadow-sm'>
      <Table className='min-w-full divide-y divide-gray-200'>
        <TableHead className='sticky top-0 z-10 bg-gray-50'>
          <TableRow>
            <TableCell className='px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase'>
              Student
            </TableCell>
            <TableCell className='px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase'>
              Selected Topics
            </TableCell>
            {topics.map((topic, index) => (
              <TableCell
                key={index}
                className='px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase'>
                {topic}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody className='bg-white divide-y divide-gray-200'>
          {allAttendanceCounts &&
            allAttendanceCounts[0]?.attendanceCounts.map((student, i) => (
              <TableRow key={i} className='border-b hover:bg-gray-50'>
                <TableCell
                  className='px-6 py-4 cursor-pointer whitespace-nowrap hover:bg-gray-200'
                  onClick={() => handleStudentClick(student.userid)}>
                  {student.name}
                </TableCell>
                <TableCell className='px-6 py-4 whitespace-nowrap'>
                  {Array.isArray(student.selectedTopics)
                    ? student.selectedTopics.join(', ')
                    : student.selectedTopics}
                </TableCell>
                {allAttendanceCounts.map((item, index) => (
                  <TableCell key={index}>
                    {Array.isArray(student.selectedTopics) &&
                    !student.selectedTopics.includes(item.topicname) ? (
                      'N/A'
                    ) : item.attendanceCounts[i]?.percentage.toString() ===
                      'No lectures' ? (
                      <Tooltip title='No lectures available for this topic'>
                        <InfoIcon />
                      </Tooltip>
                    ) : (
                      <div className='w-[10em] h-4 rounded-sm bg-gray-200 relative'>
                        <div
                          className={`h-full rounded ${
                            item.attendanceCounts[i]?.percentage === 0
                              ? 'bg-metropolia-support-red'
                              : threshold !== null
                              ? Number(item.attendanceCounts[i]?.percentage) <=
                                threshold
                                ? 'bg-red-200'
                                : 'bg-metropolia-support-blue'
                              : Number(item.attendanceCounts[i]?.percentage) <
                                80
                              ? 'bg-red-200'
                              : 'bg-metropolia-support-blue'
                          }`}
                          style={{
                            width:
                              item.attendanceCounts[i]?.percentage === 0
                                ? '100%'
                                : `${item.attendanceCounts[i]?.percentage}%`,
                          }}></div>
                        <span className='absolute w-full text-xs text-center text-gray-800'>
                          {`${item.attendanceCounts[i]?.percentage}%`}
                        </span>
                      </div>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          {attendanceStudentData && (
            <TableRow className='border-b hover:bg-gray-50'>
              <TableCell className='px-6 py-4 whitespace-nowrap'>
                {fetchedData &&
                  `${fetchedData?.last_name} ${fetchedData?.first_name}`}
              </TableCell>
              <TableCell className='px-6 py-4 whitespace-nowrap'>
                {fetchedData && Array.isArray(fetchedData?.topics)
                  ? fetchedData?.topics.join(', ')
                  : fetchedData?.topics}
              </TableCell>
              {topics &&
                topics.map((topic, index) => (
                  <TableCell key={index}>
                    {attendanceStudentData.attendance &&
                    attendanceStudentData.attendance[topic] === undefined ? (
                      'N/A'
                    ) : (
                      <div className='w-[10em] h-4 rounded-sm bg-gray-200 relative'>
                        <div
                          className={`h-full rounded ${
                            attendanceStudentData.attendance[topic] === 0
                              ? 'bg-metropolia-support-red'
                              : threshold !== null
                              ? attendanceStudentData.attendance[topic] <=
                                threshold
                                ? 'bg-red-200'
                                : 'bg-metropolia-support-blue'
                              : attendanceStudentData.attendance[topic] < 80
                              ? 'bg-red-200'
                              : 'bg-metropolia-support-blue'
                          }`}
                          style={{
                            width:
                              attendanceStudentData.attendance[topic] === 0
                                ? '100%'
                                : `${attendanceStudentData.attendance[topic]}%`,
                          }}></div>
                        <span className='absolute w-full text-xs text-center text-gray-800'>
                          {`${attendanceStudentData.attendance[topic]}%`}
                        </span>
                      </div>
                    )}
                  </TableCell>
                ))}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AttendanceStatsTable;
