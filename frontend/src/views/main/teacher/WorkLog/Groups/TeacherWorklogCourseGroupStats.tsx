import React, {useEffect, useState, useCallback, memo} from 'react';
import {useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import {PieChart, Pie, Cell, ResponsiveContainer, Tooltip} from 'recharts';
import apiHooks from '../../../../../api';
import GeneralLinkButton from '../../../../../components/main/buttons/GeneralLinkButton';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface StudentStats {
  name: string;
  completedHours: number;
  remainingHours: number;
  percentageCompleted: number;
}

const SummaryPieChart = memo(({students}: {students: StudentStats[]}) => {
  return (
    <ResponsiveContainer width='100%' height={300}>
      <PieChart>
        <Pie
          data={students}
          dataKey='completedHours'
          nameKey='name'
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          isAnimationActive={true}>
          {students.map((_student, index) => (
            <Cell
              key={`cell-${index}`}
              fill={`hsl(${(360 / students.length) * index}, 70%, 50%)`}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [
            `${value.toFixed(1)}h`,
            name,
          ]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
});

const StudentPieChart = memo(
  ({
    completed,
    remaining,
  }: {
    completed: number;
    remaining: number;
    name: string;
  }) => {
    const data = [
      {name: 'Completed', value: completed, fill: '#00FF00'},
      {name: 'Remaining', value: remaining, fill: '#0088FE'},
    ];

    return (
      <div className='h-[200px]'>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              dataKey='value'>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value.toFixed(1)}h`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  },
);

const TeacherWorklogCourseGroupStats = () => {
  const {t} = useTranslation();
  const {courseid, groupid} = useParams<{courseid: string; groupid: string}>();
  const [students, setStudents] = useState<StudentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiredHours, setRequiredHours] = useState(0);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token || !courseid || !groupid) {
        throw new Error('Missing required parameters');
      }

      const groupDetails = await apiHooks.getWorkLogGroupDetails(
        Number(courseid),
        Number(groupid),
        token,
      );

      const studentStats = await Promise.all(
        groupDetails.students.map(async (student) => {
          const worklogStats = await apiHooks.getWorkLogStats(
            student.userid,
            token,
          );
          const courseStats = worklogStats.find(
            (stat) => stat.course_name === groupDetails.course.name,
          );

          const completedHours = courseStats
            ? courseStats.total_minutes / 60
            : 0;
          const remainingHours =
            groupDetails.course.required_hours - completedHours;
          const percentageCompleted =
            (completedHours / groupDetails.course.required_hours) * 100;

          return {
            name: `${student.first_name} ${student.last_name}`,
            completedHours: Number(completedHours.toFixed(1)),
            remainingHours: Number(Math.max(0, remainingHours).toFixed(1)),
            percentageCompleted: Number(percentageCompleted.toFixed(1)),
          };
        }),
      );

      setRequiredHours(groupDetails.course.required_hours);
      setStudents(studentStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  }, [courseid, groupid]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) return <div className='p-4 text-center'>Loading...</div>;
  if (error) return <div className='p-4 text-center text-red-500'>{error}</div>;
  if (!students.length)
    return <div className='p-4 text-center'>No students available</div>;

  const totalCompletedHours = students.reduce(
    (sum, student) => sum + student.completedHours,
    0,
  );

  return (
    <div className='container max-w-6xl px-4 py-8 mx-auto'>
      <div className='flex items-center justify-between mb-6'>
        <GeneralLinkButton
          path={`/teacher/worklog/group/${courseid}/${groupid}`}
          text={t('common.back')}
        />
        <h1 className='text-2xl font-heading'>
          {t('teacher.worklog.stats.studentProgress')}
        </h1>
        <div className='w-[100px]'></div>
      </div>

      {/* Here strats the groups stats summary  */}
      <div className='mb-8 bg-white rounded-lg shadow'>
        <Accordion >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls='summary-content'
            id='summary-header'>
            <h2 className='text-xl font-heading'>
              {t('teacher.worklog.stats.totalProgress')}
            </h2>
          </AccordionSummary>
          <AccordionDetails className='bg-white rounded-b-lg'>
            <div className='flex flex-col gap-6 lg:flex-row'>
              {/*this is for the where is the summary piechart */}
              <div className='w-full lg:w-1/2'>
                <SummaryPieChart students={students} />
              </div>

              {/*this shows the users stast in numbers, easier to read*/}
              <div className='flex flex-col justify-center w-full lg:w-1/2 font-body'>
                <table className='w-full mb-4'>
                  <thead>
                    <tr className='border-b'>
                      <th className='p-2 text-left'>Student</th>
                      <th className='p-2 text-right'>Hours</th>
                      <th className='p-2 text-right'>Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr key={index} className='border-b'>
                        <td className='p-2'>{student.name}</td>
                        <td className='p-2 text-right'>
                          {student.completedHours}h
                        </td>
                        <td className='p-2 text-right'>
                          {student.percentageCompleted}%
                        </td>
                      </tr>
                    ))}
                    <tr className='font-semibold bg-gray-50'>
                      <td className='p-2'>Total</td>
                      <td className='p-2 text-right'>
                        {totalCompletedHours.toFixed(1)}h
                      </td>
                      <td className='p-2 text-right'>
                        {(
                          (totalCompletedHours /
                            (requiredHours * students.length)) *
                          100
                        ).toFixed(1)}
                        %
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className='mt-4 text-center'>
                  <p>
                    {t('teacher.worklog.stats.required')}:{' '}
                    {requiredHours * students.length}h
                  </p>
                  <p>
                    {t('teacher.worklog.stats.totalCompleted')}:{' '}
                    {totalCompletedHours.toFixed(1)}h
                  </p>
                </div>
              </div>
            </div>
          </AccordionDetails>
        </Accordion>
      </div>

      {/* here is the users own hour stats in piechart and numbers */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {students.map((student, index) => (
          <div key={index} className='p-6 bg-white rounded-lg shadow'>
            <h3 className='mb-4 text-lg text-center font-heading'>
              {student.name}
            </h3>
            <StudentPieChart
              completed={student.completedHours}
              remaining={student.remainingHours}
              name={student.name}
            />
            <div className='mt-4 text-center font-body'>
              <div className='grid grid-cols-2 gap-2'>
                <div className='text-sm'>
                  <p>Required: {requiredHours}h</p>
                  <p>Completed: {student.completedHours}h</p>
                </div>
                <div className='text-sm'>
                  <p>Remaining: {student.remainingHours}h</p>
                  <p>Progress: {student.percentageCompleted}%</p>
                </div>
              </div>
              {/* Progress bar */}
              <div className='w-full h-2 mt-2 bg-gray-200 rounded-full'>
                <div
                  className='h-2 transition-all duration-300 bg-orange-500 rounded-full'
                  style={{width: `${student.percentageCompleted}%`}}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherWorklogCourseGroupStats;
