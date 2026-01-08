import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import React, { useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../../../contexts/UserContext';
import apiHooks from '../../../../api';

import InfoIcon from '@mui/icons-material/Info';
import { useTranslation } from 'react-i18next';

/**
 * Attendance percentage voi olla numero tai backendiltä tuleva “ei luentoja” -merkki.
 * Joissain vanhoissa kohdissa on voinut tulla "No TeacherLectures" ja joissain "No lectures",
 * joten tuetaan molempia rikkomatta mitään.
 */
type Percentage = number | 'No lectures' | 'No TeacherLectures';

interface AttendanceCount {
  name: string;
  count: number;
  topicname: string;
  userid: number;
  percentage: Percentage;
  selectedTopics: string | string[];
}

interface AttendanceStats {
  topicname: string;
  attendanceCounts: AttendanceCount[];
}

interface AttendanceStudentData {
  attendance: { [key: string]: number };
  topics: string | string[];
}

interface AttendanceStatsTableProps {
  allAttendanceCounts?: AttendanceStats[];
  threshold: number | null;
  attendanceStudentData?: AttendanceStudentData;
  usercourseid?: number;
  currentCourseId?: string;
}

interface FetchedDataItem {
  last_name: string;
  first_name: string;
  topics: string[];
}

/** Type guards & helpers */
const isNoLectures = (
  v: Percentage | undefined,
): v is 'No lectures' | 'No TeacherLectures' =>
  v === 'No lectures' || v === 'No TeacherLectures';

const toArray = (v: string | string[] | undefined): string[] => {
  if (!v) return [];
  return Array.isArray(v) ? v : v.split(',').map(s => s.trim()).filter(Boolean);
};

const AttendanceStatsTable: React.FC<AttendanceStatsTableProps> = ({
                                                                     allAttendanceCounts,
                                                                     threshold,
                                                                     attendanceStudentData,
                                                                     usercourseid,
                                                                     currentCourseId,
                                                                   }) => {
  const { t } = useTranslation('common');
  const [fetchedData, setFetchedData] = useState<FetchedDataItem | null>(null);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const topics = useMemo<string[]>(
    () =>
      allAttendanceCounts
        ? allAttendanceCounts.map((item) => item.topicname)
        : (fetchedData?.topics ?? []),
    [allAttendanceCounts, fetchedData],
  );

  useEffect(() => {
    if (!usercourseid) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) throw new Error('No token available');

        const response = await apiHooks.getStudentAndTopicsByUsercourseid(
          token,
          usercourseid,
        );
        setFetchedData(response);
        return response;
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, [usercourseid]);

  const handleStudentClick = useCallback(
    (studentId: number) => {
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
    },
    [navigate, user?.role, currentCourseId],
  );

  return (
    <TableContainer className="overflow-x-auto sm:max-h-[30em] h-fit overflow-y-scroll border-gray-300 border-x border-t mt-5 mb-5 rounded-lg shadow-sm">
      <Table className="min-w-full divide-y divide-gray-200">
        <TableHead className="sticky top-0 z-10 bg-gray-50">
          <TableRow>
            <TableCell className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              {t('attendanceTable.headers.student')}
            </TableCell>
            <TableCell className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              {t('attendanceTable.headers.selectedTopics')}
            </TableCell>

            {topics.map((topic) => (
              <TableCell
                key={topic}
                className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
              >
                {topic}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody className="bg-white divide-y divide-gray-200">
          {allAttendanceCounts &&
            allAttendanceCounts[0]?.attendanceCounts.map((student, i) => {
              const selectedTopicsArr = toArray(student.selectedTopics);

              return (
                <TableRow key={student.userid} className="border-b hover:bg-gray-50">
                  <TableCell
                    className="px-6 py-4 cursor-pointer whitespace-nowrap hover:bg-gray-200"
                    onClick={() => handleStudentClick(student.userid)}
                  >
                    {student.name}
                  </TableCell>

                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    {Array.isArray(student.selectedTopics) ? (
                      student.selectedTopics.join(', ')
                    ) : student.selectedTopics === 'all' ? (
                      t('attendanceTable.values.all')
                    ) : (
                      student.selectedTopics
                    )}
                  </TableCell>

                  {allAttendanceCounts.map((item, index) => {
                    const pct = item.attendanceCounts[i]?.percentage;

                    const notSelected =
                      selectedTopicsArr.length > 0 &&
                      !selectedTopicsArr.includes(item.topicname);

                    return (
                      <TableCell key={`${item.topicname}-${student.userid}-${index}`}>
                        {notSelected ? (
                          t('attendanceTable.values.na')
                        ) : isNoLectures(pct) ? (
                          <Tooltip title={t('attendanceTable.tooltips.noLectures')}>
                            <span className="inline-flex">
                              <InfoIcon fontSize="small" />
                            </span>
                          </Tooltip>
                        ) : (
                          <div className="w-[10em] h-4 rounded-sm bg-gray-200 relative">
                            <div
                              className={`h-full rounded ${
                                (pct ?? 0) === 0
                                  ? 'bg-metropolia-support-red'
                                  : threshold !== null
                                    ? Number(pct) <= threshold
                                      ? 'bg-red-200'
                                      : 'bg-metropolia-support-blue'
                                    : Number(pct) < 80
                                      ? 'bg-red-200'
                                      : 'bg-metropolia-support-blue'
                              }`}
                              style={{
                                width: (pct ?? 0) === 0 ? '100%' : `${Number(pct)}%`,
                              }}
                            />
                            <span className="absolute w-full text-xs text-center text-gray-800">
                              {`${Number(pct)}%`}
                            </span>
                          </div>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}

          {attendanceStudentData && (
            <TableRow className="border-b hover:bg-gray-50">
              <TableCell className="px-6 py-4 whitespace-nowrap">
                {fetchedData &&
                  `${fetchedData.last_name} ${fetchedData.first_name}`}
              </TableCell>

              <TableCell className="px-6 py-4 whitespace-nowrap">
                {fetchedData && Array.isArray(fetchedData.topics)
                  ? fetchedData.topics.join(', ')
                  : fetchedData?.topics}
              </TableCell>

              {topics.map((topic) => {
                const val = attendanceStudentData.attendance?.[topic];

                return (
                  <TableCell key={`student-${topic}`}>
                    {val === undefined ? (
                      t('attendanceTable.values.na')
                    ) : (
                      <div className="w-[10em] h-4 rounded-sm bg-gray-200 relative">
                        <div
                          className={`h-full rounded ${
                            val === 0
                              ? 'bg-metropolia-support-red'
                              : threshold !== null
                                ? val <= threshold
                                  ? 'bg-red-200'
                                  : 'bg-metropolia-support-blue'
                                : val < 80
                                  ? 'bg-red-200'
                                  : 'bg-metropolia-support-blue'
                          }`}
                          style={{
                            width: val === 0 ? '100%' : `${val}%`,
                          }}
                        />
                        <span className="absolute w-full text-xs text-center text-gray-800">
                          {`${val}%`}
                        </span>
                      </div>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AttendanceStatsTable;


/* VANHA KOODI import {
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
import {UserContext} from '../../../../contexts/UserContext.tsx';
import apiHooks from '../../../../api';

import InfoIcon from '@mui/icons-material/Info';
/**
 * Represents the attendance count for a specific topic.

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

interface AttendanceStats {
  topicname: string; // The name of the topic
  attendanceCounts: AttendanceCount[]; // The attendance counts for the topic
}

/**
 * Represents the attendance data for a specific student.

interface AttendanceStudentData {
  attendance: {[key: string]: number}; // The attendance counts, keyed by topic name
  topics: string | string[]; // The topics
}

/**
 * Props for the AttendanceStatsTable component.

interface AttendanceStatsTableProps {
  allAttendanceCounts?: AttendanceStats[]; // The attendance statistics for all topics
  threshold: number | null; // The attendance threshold
  attendanceStudentData?: AttendanceStudentData; // The attendance data for a specific student
  usercourseid?: number; // The ID of the user course
  currentCourseId?: string;
}

/**
 * Represents a fetched data item.

interface FetchedDataItem {
  last_name: string; // The last name of the student
  first_name: string; // The first name of the student
  topics: string[]; // The topics
}
/**
 * A table component that displays attendance statistics for a course.
 * It can be used in both the teacher view (to display statistics for all students) and the student view (to display statistics for a single student).

const AttendanceStatsTable: React.FC<AttendanceStatsTableProps> = ({
  allAttendanceCounts,
  threshold,
  attendanceStudentData,
  usercourseid,
  currentCourseId,
}) => {
  // State to keep track of the fetched data
  const [fetchedData, setFetchedData] = useState<FetchedDataItem | null>(null);
  const {user} = useContext(UserContext);
  const navigate = useNavigate();
  const topics = allAttendanceCounts
    ? allAttendanceCounts.map((item) => item.topicname)
    : fetchedData?.topics || [];
  // Fetch the student data for the course if the usercourseid is available (i.e. if the component is used in the student view)
  useEffect(() => {
    /**
     * Fetches the student data for the course.

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
                      'No TeacherLectures' ? (
                      <Tooltip title='No TeacherLectures available for this topic'>
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

export default AttendanceStatsTable;*/
