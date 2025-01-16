import CircularProgress from '@mui/material/CircularProgress';
import {
  BarElement,
  CategoryScale,
  ChartDataset,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import React, {useEffect, useState} from 'react';
import {Bar} from 'react-chartjs-2';
import {toast} from 'react-toastify';
import LecturesByDayChart from '../../../components/main/admin/LecturesByDayChart';
import apiHooks from '../../../hooks/ApiHooks';
import {useTranslation} from 'react-i18next';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
};

interface RoleCount {
  role_name: string;
  user_count: number;
}

interface LectureAttendanceCount {
  [key: string]: number;
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
const AdminStats = () => {
  const {t} = useTranslation();
  const [userStatistics, setUserStatistics] = useState<{
    labels: string[];
    datasets: ChartDataset<'bar', number[]>[];
  } | null>(null);
  const [attendanceStatistics, setAttendanceStatistics] = useState<
    number[] | null
  >(null);
  const [lectureStatistics, setLectureStatistics] = useState<{
    labels: string[];
    datasets: ChartDataset<'bar', number[]>[];
  } | null>(null);
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
    console.log('🚀 ~ fetchUserStatistics ~ roleCounts:', roleCounts);
    const roleNames = roleCounts.map((row) => row.role_name);
    const userCounts = roleCounts.map((row) => row.user_count);
    const studentCount =
      roleCounts.find((row) => row.role_name === 'student')?.user_count || 0;
    const studentsLoggedCount =
      roleCounts.find((row) => row.role_name === 'StudentsLogged')
        ?.user_count || 0;
    const studentsLoggedPercentage = (studentsLoggedCount / studentCount) * 100;
    setUserStatisticsPercentage(studentsLoggedPercentage);
    setUserStatistics({
      labels: roleNames,
      datasets: [
        {
          label: 'User Counts',
          data: userCounts,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          hidden: false,
        },
      ],
    });
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
    const lectureAttendanceCounts: LectureAttendanceCount =
      await apiHooks.getLectureAndAttendanceCount(token);
    const labels = Object.keys(lectureAttendanceCounts).map((label) => {
      if (label === 'notattended') {
        return 'Not Attended';
      }
      return label.charAt(0).toUpperCase() + label.slice(1);
    });
    const data = Object.values(lectureAttendanceCounts) as number[];
    setAttendanceStatistics(data);
    setLectureStatistics({
      labels: labels,
      datasets: [
        {
          label: 'Attendance Counts',
          data: data,
          backgroundColor: 'rgba(255, 25, 2, 0.6)',
          hidden: false,
        },
      ],
    });
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
    return <CircularProgress />;
  }

  return (
    <div
      className='grid w-full grid-cols-1 gap-4 p-5 bg-white xl:grid-cols-2'
      key={windowWidth}>
      <h2 className='mb-4 text-2xl md:text-3xl col-span-full'>
        {t('admin.adminStats.administratorStatistics')}
      </h2>
      <div className='justify-start w-full mx-4'>
        <h2 className='mb-4 text-xl md:text-2xl'>{t('admin.adminStats.userStatistics')}</h2>
        <p className='text-sm md:text-base'>{`Percentage of students who have logged in at least once: ${userStatisticsPercentage.toFixed(
          2,
        )}%`}</p>
        <div className='w-full'>
          <Bar options={options} data={userStatistics} />
        </div>
      </div>
      <div className='justify-start w-full mx-4'>
        <h2 className='mb-4 text-xl md:text-2xl'>{t('admin.adminStats.attendanceStatistics')}</h2>
        {attendanceStatistics && (
          <p className='text-sm md:text-base'>
            {`Total lectures: ${attendanceStatistics[0]}. Attendance ratio: ${(
              (attendanceStatistics[2] /
                (attendanceStatistics[2] + attendanceStatistics[1])) *
              100
            ).toFixed(2)}%`}
          </p>
        )}
        <div className='w-full'>
          <Bar options={options} data={lectureStatistics} />
        </div>
      </div>
      <div className='justify-start w-full mx-4'>
        <h2 className='mb-4 text-xl md:text-2xl'>
        {t('admin.adminStats.distributtion')}
        </h2>
        <div className='w-full'>
          <LecturesByDayChart lectures={lectures} />
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
