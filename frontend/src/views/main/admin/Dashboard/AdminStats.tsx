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
import LecturesByDayChart from '../../../../components/main/admin/LecturesByDayChart';
import apiHooks from '../../../../api';
import {useTranslation} from 'react-i18next';
import Loader from '../../../../utils/Loader';

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

// Move chartConfig outside of AdminStats component
export const chartConfig = {
  width: '100%',
  height: 450,
  margin: {top: 20, right: 30, left: 60, bottom: 140},
};

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

  const chartColors = {
    users: '#4046a8', // metropolia-support-blue
    attendance: '#cb2228', // metropolia-support-red
    courses: '#3ba88f', // metropolia-trend-green
    worklog: '#ff5000', // metropolia-main-orange
  };

  const tooltipStyle = {
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    padding: '12px',
    minWidth: '100px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  return (
    <div
      className='grid w-full grid-cols-1 gap-8 p-8 bg-metropolia-support-white rounded-lg shadow-lg xl:grid-cols-2'
      key={windowWidth}>
      <h2 className='mb-8 text-3xl md:text-4xl col-span-full font-heading text-metropolia-main-grey'>
        {t('admin:adminStats.administratorStatistics')}
      </h2>

      {/* User Statistics Chart */}
      <div className='justify-start w-full p-6 bg-white rounded-lg shadow-md'>
        <h2 className='mb-4 text-2xl md:text-3xl font-heading text-metropolia-main-grey'>
          {t('admin:adminStats.userStatistics')}
        </h2>
        <p className='mb-6 text-sm md:text-base font-body text-metropolia-main-grey'>
          {`${t('admin:adminStats.loggedInPercentage')}: `}
          <span className='font-semibold text-metropolia-support-blue'>
            {userStatisticsPercentage.toFixed(2)}%
          </span>
        </p>
        <ResponsiveContainer {...chartConfig}>
          <BarChart data={userStatistics}>
            <CartesianGrid strokeDasharray='3 3' stroke='#e0e0e0' />
            <XAxis
              dataKey='name'
              angle={-45}
              textAnchor='end'
              height={100} // Increased height
              interval={0}
              tick={{fill: '#53565a'}}
              dy={20} // Added vertical offset
            />
            <YAxis tick={{fill: '#53565a'}}>
              <Label
                value={t('admin:adminStats.userCount')}
                angle={-90}
                position='insideLeft'
                style={{fill: '#53565a'}}
              />
            </YAxis>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Bar
              dataKey='count'
              fill={chartColors.users}
              name={t('admin:adminStats.userCounts')}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Attendance Statistics Chart */}
      <div className='justify-start w-full p-6 bg-white rounded-lg shadow-md'>
        <h2 className='mb-4 text-2xl md:text-3xl font-heading text-metropolia-main-grey'>
          {t('admin:adminStats.attendanceStatistics')}
        </h2>
        {attendanceStatistics && (
          <p className='mb-6 text-sm md:text-base font-body text-metropolia-main-grey'>
            {`${t('admin:adminStats.totalLectures')}: `}
            <span className='font-semibold text-metropolia-support-red'>
              {attendanceStatistics[0]}
            </span>
            {`. ${t('admin:adminStats.attendanceRatio')}: `}
            <span className='font-semibold text-metropolia-support-red'>
              {(
                (attendanceStatistics[2] /
                  (attendanceStatistics[2] + attendanceStatistics[1])) *
                100
              ).toFixed(2)}
              %
            </span>
          </p>
        )}
        <ResponsiveContainer {...chartConfig}>
          <BarChart data={lectureStatistics}>
            <CartesianGrid strokeDasharray='3 3' stroke='#e0e0e0' />
            <XAxis
              dataKey='name'
              angle={-45}
              textAnchor='end'
              height={120}
              interval={0}
              tick={{fill: '#53565a', fontSize: 12}}
              dy={50}
            />
            <YAxis tick={{fill: '#53565a'}}>
              <Label
                value={t('admin:adminStats.attendanceCount')}
                angle={-90}
                position='insideLeft'
                style={{fill: '#53565a'}}
              />
            </YAxis>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Bar
              dataKey='count'
              fill={chartColors.attendance}
              name={t('admin:adminStats.attendanceCounts')}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Course Statistics Chart */}
      <div className='justify-start w-full p-6 bg-white rounded-lg shadow-md'>
        <h2 className='mb-4 text-2xl md:text-3xl font-heading text-metropolia-main-grey'>
          {t('admin:adminStats.courseStatistics')}
        </h2>
        {courseStatistics && (
          <>
            <p className='mb-6 text-sm md:text-base font-body text-metropolia-main-grey'>
              {`${t('admin:adminStats.totalCourses')}: `}
              <span className='font-semibold text-metropolia-trend-green'>
                {courseStatistics[0].count}
              </span>
              {` (${t('admin:adminStats.coursesActive')}: `}
              <span className='font-semibold text-metropolia-trend-green'>
                {courseStatistics[1].count}
              </span>
              {')'}
            </p>
            <p className='mb-6 text-sm md:text-base font-body text-metropolia-main-grey'>
              {`${t('admin:adminStats.totalWorklogCourses')}: `}
              <span className='font-semibold text-metropolia-trend-green'>
                {courseStatistics[2].count}
              </span>
              {` (${t('admin:adminStats.worklogCoursesActive')}: `}
              <span className='font-semibold text-metropolia-trend-green'>
                {courseStatistics[3].count}
              </span>
              {')'}
            </p>
          </>
        )}
        <ResponsiveContainer {...chartConfig}>
          <BarChart
            data={courseStatistics}
            margin={chartConfig.margin} // Explicitly set margin on BarChart
          >
            <CartesianGrid strokeDasharray='3 3' stroke='#e0e0e0' />
            <XAxis
              dataKey='name'
              angle={-45}
              textAnchor='end'
              height={180} // Increased height further
              interval={0}
              tick={{fill: '#53565a'}}
              dy={35} // Increased vertical offset
            />
            <YAxis
              tick={{fill: '#53565a'}}
              dx={-10} // Added horizontal offset
            >
              <Label
                value={t('admin:adminStats.courseCount')}
                angle={-90}
                position='insideLeft'
                style={{fill: '#53565a'}}
              />
            </YAxis>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Bar
              dataKey='count'
              fill={chartColors.courses}
              name={t('admin:adminStats.courseCounts')}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Worklog Statistics Chart */}
      <div className='justify-start w-full p-6 bg-white rounded-lg shadow-md'>
        <h2 className='mb-4 text-2xl md:text-3xl font-heading text-metropolia-main-grey'>
          {t('admin:adminStats.worklogStatistics')}
        </h2>
        {worklogStatistics && (
          <p className='mb-6 text-sm md:text-base font-body text-metropolia-main-grey'>
            {`${t('admin:adminStats.totalEntries')}: `}
            <span className='font-semibold text-metropolia-main-orange'>
              {worklogStatistics.reduce((sum, stat) => sum + stat.count, 0)}
            </span>
          </p>
        )}
        <ResponsiveContainer {...chartConfig}>
          <BarChart data={worklogStatistics}>
            <CartesianGrid strokeDasharray='3 3' stroke='#e0e0e0' />
            <XAxis
              dataKey='name'
              angle={-45}
              textAnchor='end'
              height={160} // Increased height
              interval={0}
              tick={{fill: '#53565a'}}
              dy={20} // Added vertical offset
            />
            <YAxis tick={{fill: '#53565a'}}>
              <Label
                value={t('admin:adminStats.entryCount')}
                angle={-90}
                position='insideLeft'
                style={{fill: '#53565a'}}
              />
            </YAxis>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Bar
              dataKey='count'
              fill={chartColors.worklog}
              name={t('admin:adminStats.worklogEntries')}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Distribution Chart */}
      <div className='justify-start w-full p-6 bg-white rounded-lg shadow-md col-span-full'>
        <h2 className='mb-4 text-2xl md:text-3xl font-heading text-metropolia-main-grey'>
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
