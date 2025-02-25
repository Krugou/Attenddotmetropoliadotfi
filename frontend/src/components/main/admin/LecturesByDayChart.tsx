import React, {useMemo} from 'react';
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
import {useTranslation} from 'react-i18next';
import Loader from '../../../utils/Loader';
import {chartConfig} from '../../../views/main/admin/Dashboard/AdminStats';

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

interface LecturesByDayChartProps {
  lectures: Lecture[] | null;
}

/**
 * LecturesByDayChart component displays lecture distribution by day of week
 *
 * @param {LecturesByDayChartProps} props - Component props
 * @returns {JSX.Element} Rendered chart or loading state
 */
const LecturesByDayChart: React.FC<LecturesByDayChartProps> = ({lectures}) => {
  const {t} = useTranslation(['admin']);

  const chartData = useMemo(() => {
    if (!lectures) return [];

    // Initialize counters for each day
    const dayCount = new Array(7).fill(0);
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Count lectures per day
    lectures.forEach((lecture) => {
      const date = new Date(lecture.start_date);
      const dayOfWeek = date.getDay();
      dayCount[dayOfWeek]++;
    });

    // Format data for Recharts
    return dayCount.map((count, index) => ({
      day: daysOfWeek[index],
      lectures: count,
    }));
  }, [lectures]);

  if (!lectures) {
    return <Loader />;
  }

  return (
    <ResponsiveContainer {...chartConfig}>
      <BarChart data={chartData} margin={chartConfig.margin}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis
          dataKey='day'
          interval={0}
          angle={-45}
          textAnchor='end'
          height={120}
          tick={{fill: '#53565a', fontSize: 12}}
          dy={50}>
          <Label
            value={t('admin:lecturesByDay.dayOfWeek')}
            position='bottom'
            dy={50}
          />
        </XAxis>
        <YAxis tick={{fill: '#53565a'}} dx={-10}>
          <Label
            value={t('admin:lecturesByDay.lectureCount')}
            angle={-90}
            position='insideLeft'
            style={{fill: '#53565a'}}
          />
        </YAxis>
        <Tooltip />
        <Legend />
        <Bar
          dataKey='lectures'
          fill='#8884d8'
          name={t('admin:lecturesByDay.numberOfLectures')}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default LecturesByDayChart;
