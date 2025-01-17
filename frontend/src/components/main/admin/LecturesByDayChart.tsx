import {ChartDataset} from 'chart.js';
import React, {useEffect, useState} from 'react';
import {Bar} from 'react-chartjs-2';
import {useTranslation} from 'react-i18next';

const getDayOfWeek = (date: string, t: (key: string) => string) => {
  const dayNames = [
    t('admin.lectureChart.days.sunday'),
    t('admin.lectureChart.days.monday'),
    t('admin.lectureChart.days.tuesday'),
    t('admin.lectureChart.days.wednesday'),
    t('admin.lectureChart.days.thursday'),
    t('admin.lectureChart.days.friday'),
    t('admin.lectureChart.days.saturday'),
  ];
  return dayNames[new Date(date).getDay()];
};

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

const LecturesByDayChart = ({lectures}: {lectures: Lecture[] | null}) => {
  const {t} = useTranslation();
  const [chartData, setChartData] = useState<ChartDataset<
    'bar',
    number[]
  > | null>(null);

  useEffect(() => {
    const dayCounts: {[key: string]: number} = {
      [t('admin.lectureChart.days.monday')]: 0,
      [t('admin.lectureChart.days.tuesday')]: 0,
      [t('admin.lectureChart.days.wednesday')]: 0,
      [t('admin.lectureChart.days.thursday')]: 0,
      [t('admin.lectureChart.days.friday')]: 0,
    };

    if (!lectures) {
      return;
    }

    lectures.forEach((lecture) => {
      const day = getDayOfWeek(lecture.start_date, t);
      if (day in dayCounts) {
        dayCounts[day]++;
      }
    });

    setChartData({
      label: t('admin.lectureChart.label'),
      data: Object.values(dayCounts),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    });
  }, [lectures, t]);

  if (!chartData) {
    return null;
  }

  return (
    <Bar
      data={{
        labels: [
          t('admin.lectureChart.days.monday'),
          t('admin.lectureChart.days.tuesday'),
          t('admin.lectureChart.days.wednesday'),
          t('admin.lectureChart.days.thursday'),
          t('admin.lectureChart.days.friday'),
        ],
        datasets: [chartData],
      }}
      options={{
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
        },
      }}
    />
  );
};

export default LecturesByDayChart;
