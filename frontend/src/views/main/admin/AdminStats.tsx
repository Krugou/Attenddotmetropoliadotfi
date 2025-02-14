import React, {useEffect, useState} from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
} from 'recharts';
import {toast} from 'react-toastify';
import LecturesByDayChart from '../../../components/main/admin/LecturesByDayChart';
import apiHooks from '../../../api';
import {useTranslation} from 'react-i18next';
import Loader from '../../../utils/Loader';

interface RoleCount {
  role_name: string;
  user_count: number;
}

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

interface CourseCount {
  regularCourses: {
    total: number;
    active: number;
  };
  worklogCourses: {
    total: number;
    active: number;
  };
}

const AdminStats = () => {
  const {t} = useTranslation(['admin']);
  const [userStatistics, setUserStatistics] = useState<Array<{
    name: string;
    count: number;
  }> | null>(null);
  const [attendanceStatistics, setAttendanceStatistics] = useState<
    number[] | null
  >(null);
  const [lectureStatistics, setLectureStatistics] = useState<Array<{
    name: string;
    count: number;
  }> | null>(null);
  const [courseStatistics, setCourseStatistics] = useState<Array<{
    name: string;
    count: number;
  }> | null>(null);
  const [worklogStatistics, setWorklogStatistics] = useState<Array<{
    name: string;
    count: number;
  }> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userStatisticsPercentage, setUserStatisticsPercentage] =
    useState<number>(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const fetchUserStatistics = async (token: string) => {
    const roleCounts: RoleCount[] = await apiHooks.getRoleCounts(token);
    const formattedData = roleCounts.map((row) => ({
      name: row.role_name,
      count: row.user_count,
    }));

    const studentCount =
      roleCounts.find((row) => row.role_name === 'student')?.user_count || 0;
    const studentsLoggedCount =
      roleCounts.find((row) => row.role_name === 'StudentsLogged')
        ?.user_count || 0;
    const studentsLoggedPercentage = (studentsLoggedCount / studentCount) * 100;
    setUserStatisticsPercentage(studentsLoggedPercentage);
    setUserStatistics(formattedData);
  };

  const [lectures, setLectures] = useState<Lecture[] | null>(null);

  const getLectures = async () => {
    const token: string | null = localStorage.getItem('userToken');
    if (!token) {
      toast.error('No token available');
      return false;
    }
    try {
      const result = await apiHooks.fetchAllLectures(token);
      if (!Array.isArray(result)) {
        toast.error('Expected an array from fetchAllLectures');
        return false;
      }

      setLectures(result);

      return true;
    } catch (error) {
      toast.error('Error fetching lectures');
      return false;
    }
  };

  useEffect(() => {
    getLectures();
  }, []);

  const fetchLectureStatistics = async (token: string) => {
    const lectureAttendanceCounts = await apiHooks.getLectureAndAttendanceCount(
      token,
    );
    const formattedData = Object.entries(lectureAttendanceCounts).map(
      ([key, value]) => ({
        name:
          key === 'notattended'
            ? 'Not Attended'
            : key.charAt(0).toUpperCase() + key.slice(1),
        count: value as number,
      }),
    );

    setAttendanceStatistics(Object.values(lectureAttendanceCounts) as number[]);
    setLectureStatistics(formattedData);
  };

  const fetchCourseStatistics = async (token: string) => {
    const courseCounts: CourseCount = await apiHooks.getCourseCounts(token);
    const formattedData = [
      {
        name: `${t('admin:adminStats.regularCourses')} (${t(
          'admin:adminStats.total',
        )})`,
        count: courseCounts.regularCourses.total,
      },
      {
        name: `${t('admin:adminStats.regularCourses')} (${t(
          'admin:adminStats.active',
        )})`,
        count: courseCounts.regularCourses.active,
      },
      {
        name: `${t('admin:adminStats.worklogCourses')} (${t(
          'admin:adminStats.total',
        )})`,
        count: courseCounts.worklogCourses.total,
      },
      {
        name: `${t('admin:adminStats.worklogCourses')} (${t(
          'admin:adminStats.active',
        )})`,
        count: courseCounts.worklogCourses.active,
      },
    ];
    setCourseStatistics(formattedData);
  };

  const fetchWorklogStatistics = async (token: string) => {
    const worklogCounts = await apiHooks.getWorklogCounts(token);
    console.log('🚀 ~ fetchWorklogStatistics ~ worklogCounts:', worklogCounts);
    const formattedData = [
      {
        name: t('admin:adminStats.pendingEntries'),
        count: worklogCounts.pending,
      },
      {
        name: t('admin:adminStats.approvedEntries'),
        count: worklogCounts.approved,
      },
      {
        name: t('admin:adminStats.delayedEntries'),
        count: worklogCounts.delayed,
      },
    ];
    setWorklogStatistics(formattedData);
  };

  useEffect(() => {
    const fetchData = async () => {
      const token: string | null = localStorage.getItem('userToken');
      if (!token) {
        setError('No token available');
        return;
      }

      try {
        await fetchUserStatistics(token);
        await fetchLectureStatistics(token);
        await fetchCourseStatistics(token);
        await fetchWorklogStatistics(token);
      } catch (error) {
        setError('Failed to fetch data');
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  if (!userStatistics || !lectureStatistics) {
    return <Loader />;
  }

  const chartConfig = {
    width: '100%',
    height: 400,
    margin: {top: 20, right: 30, left: 20, bottom: 5},
  };

  return (
    <div
      className='grid w-full grid-cols-1 gap-4 p-5 bg-white xl:grid-cols-2'
      key={windowWidth}>
      <h2 className='mb-4 text-2xl md:text-3xl col-span-full font-heading'>
        {t('admin:adminStats.administratorStatistics')}
      </h2>

      {/* User Statistics Chart */}
      <div className='justify-start w-full mx-4'>
        <h2 className='mb-4 text-xl md:text-2xl font-heading'>
          {t('admin:adminStats.userStatistics')}
        </h2>
        <p className='text-sm md:text-base font-body'>
          {`${t(
            'admin:adminStats.loggedInPercentage',
          )}: ${userStatisticsPercentage.toFixed(2)}%`}
        </p>
        <ResponsiveContainer {...chartConfig}>
          <BarChart data={userStatistics}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey='name'
              angle={-45}
              textAnchor='end'
              height={60}
              interval={0}
            />
            <YAxis>
              <Label
                value={t('admin:adminStats.userCount')}
                angle={-90}
                position='insideLeft'
              />
            </YAxis>
            <Tooltip />
            <Legend />
            <Bar
              dataKey='count'
              fill='#8884d8'
              name={t('admin:adminStats.userCounts')}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Attendance Statistics Chart */}
      <div className='justify-start w-full mx-4'>
        <h2 className='mb-4 text-xl md:text-2xl font-heading'>
          {t('admin:adminStats.attendanceStatistics')}
        </h2>
        {attendanceStatistics && (
          <p className='text-sm md:text-base font-body'>
            {`${t('admin:adminStats.totalLectures')}: ${
              attendanceStatistics[0]
            }. ${t('admin:adminStats.attendanceRatio')}: ${(
              (attendanceStatistics[2] /
                (attendanceStatistics[2] + attendanceStatistics[1])) *
              100
            ).toFixed(2)}%`}
          </p>
        )}
        <ResponsiveContainer {...chartConfig}>
          <BarChart data={lectureStatistics}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey='name'
              angle={-45}
              textAnchor='end'
              height={60}
              interval={0}
            />
            <YAxis>
              <Label
                value={t('admin:adminStats.attendanceCount')}
                angle={-90}
                position='insideLeft'
              />
            </YAxis>
            <Tooltip />
            <Legend />
            <Bar
              dataKey='count'
              fill='#FF1902'
              name={t('admin:adminStats.attendanceCounts')}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Course Statistics Chart */}
      <div className='justify-start w-full mx-4'>
        <h2 className='mb-4 text-xl md:text-2xl font-heading'>
          {t('admin:adminStats.courseStatistics')}
        </h2>
        {courseStatistics && (
          <p className='text-sm md:text-base font-body'>
            {`${t('admin:adminStats.totalCourses')}: ${
              courseStatistics[0].count + courseStatistics[2].count
            } (${t('admin:adminStats.active')}: ${
              courseStatistics[1].count + courseStatistics[3].count
            })`}
          </p>
        )}
        <ResponsiveContainer {...chartConfig}>
          {/* @ts-ignore */}
          <BarChart data={courseStatistics}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey='name'
              angle={-45}
              textAnchor='end'
              height={60}
              interval={0}
            />
            <YAxis>
              <Label
                value={t('admin:adminStats.courseCount')}
                angle={-90}
                position='insideLeft'
              />
            </YAxis>
            <Tooltip />
            <Legend />
            <Bar
              dataKey='count'
              fill='#82ca9d'
              name={t('admin:adminStats.courseCounts')}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Worklog Statistics Chart */}
      <div className='justify-start w-full mx-4'>
        <h2 className='mb-4 text-xl md:text-2xl font-heading'>
          {t('admin:adminStats.worklogStatistics')}
        </h2>
        {worklogStatistics && (
          <p className='text-sm md:text-base font-body'>
            {`${t('admin:adminStats.totalEntries')}: ${worklogStatistics.reduce(
              (sum, stat) => sum + stat.count,
              0,
            )}`}
          </p>
        )}
        <ResponsiveContainer {...chartConfig}>
          {/* @ts-ignore */}
          <BarChart data={worklogStatistics}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey='name'
              angle={-45}
              textAnchor='end'
              height={60}
              interval={0}
            />
            <YAxis>
              <Label
                value={t('admin:adminStats.entryCount')}
                angle={-90}
                position='insideLeft'
              />
            </YAxis>
            <Tooltip />
            <Legend />
            <Bar
              dataKey='count'
              fill='#ffa726'
              name={t('admin:adminStats.worklogEntries')}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Distribution Chart */}
      <div className='justify-start w-full mx-4 col-span-full'>
        <h2 className='mb-4 text-xl md:text-2xl font-heading'>
          {t('admin:adminStats.distribution')}
        </h2>
        <div className='w-full'>
          <LecturesByDayChart lectures={lectures} />
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
