import React, { useEffect, useState, useCallback, memo } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import apiHooks from '../../../../../hooks/ApiHooks';
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

const StudentPieChart = memo(({ completed, remaining }: { completed: number; remaining: number; name: string }) => {
  const data = [
    { name: 'Completed', value: completed, fill: '#00FF00' },
    { name: 'Remaining', value: remaining, fill: '#0088FE' }
  ];

  return (
    <div className="h-[200px]">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            innerRadius={50}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value.toFixed(1)}h`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

const SummaryPieChart = memo(({ students }: { students: StudentStats[] }) => {
  const data = students.map(student => ({
    name: student.name,
    value: student.completedHours
  }));

  return (
    <div className="h-[200px]">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            innerRadius={50}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={`hsl(${(360 / data.length) * index}, 70%, 50%)`} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value.toFixed(1)}h`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});



const TeacherWorklogCourseGroupStats = () => {
  const { t } = useTranslation();
  const { courseid, groupid } = useParams<{ courseid: string; groupid: string }>();
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
        token
      );

      const studentStats = await Promise.all(
        groupDetails.students.map(async (student) => {
          const worklogStats = await apiHooks.getWorkLogStats(student.userid, token);
          const courseStats = worklogStats.find(stat =>
            stat.course_name === groupDetails.course.name
          );

          const completedHours = courseStats ? (courseStats.total_minutes / 60) : 0;
          const remainingHours = groupDetails.course.required_hours - completedHours;
          const percentageCompleted = (completedHours / groupDetails.course.required_hours) * 100;

          return {
            name: `${student.first_name} ${student.last_name}`,
            completedHours: Number(completedHours.toFixed(1)),
            remainingHours: Number(Math.max(0, remainingHours).toFixed(1)),
            percentageCompleted: Number(percentageCompleted.toFixed(1))
          };
        })
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

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;
  if (!students.length) return <div className="text-center p-4">No students available</div>;

  const totalCompletedHours = students.reduce((sum, student) => sum + student.completedHours, 0);

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <GeneralLinkButton
          path={`/teacher/worklog/group/${courseid}/${groupid}`}
          text={t('common.back')}
        />
        <h1 className="text-2xl font-heading">
          {t('teacher.worklog.stats.studentProgress')}
        </h1>
        <div className="w-[100px]"></div>
      </div>

      {/* here is the groups summary stats */}
      <div className="bg-white rounded-lg shadow mb-8">
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="summary-content"
            id="summary-header"
          >
            <h2 className="text-xl font-heading">
              {t('teacher.worklog.stats.totalProgress')}
            </h2>
          </AccordionSummary>
          <AccordionDetails className="bg-white rounded-b-lg">
            <div className="flex flex-col lg:flex-row gap-6">
              {/*this is for the piechart */}
              <div className="w-full lg:w-1/2">
                <SummaryPieChart students={students} />
              </div>

              {/*this is for the user stats  */}
              <div className="w-full lg:w-1/2 flex flex-col justify-center font-body">
                <table className="w-full mb-4">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Student</th>
                      <th className="text-right p-2">Hours</th>
                      <th className="text-right p-2">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{student.name}</td>
                        <td className="text-right p-2">{student.completedHours}h</td>
                        <td className="text-right p-2">{student.percentageCompleted}%</td>
                      </tr>
                    ))}
                    <tr className="font-semibold bg-gray-50">
                      <td className="p-2">Total</td>
                      <td className="text-right p-2">
                        {totalCompletedHours.toFixed(1)}h
                      </td>
                      <td className="text-right p-2">
                        {((totalCompletedHours / (requiredHours * students.length)) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="mt-4 text-center">
                  <p>{t('teacher.worklog.stats.required')}: {requiredHours * students.length}h</p>
                  <p>{t('teacher.worklog.stats.totalCompleted')}: {totalCompletedHours.toFixed(1)}h</p>
                </div>
              </div>
            </div>
          </AccordionDetails>
        </Accordion>
      </div>

      {/* here is the users own hour stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((student, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-heading mb-4 text-center">{student.name}</h3>
            <StudentPieChart
              completed={student.completedHours}
              remaining={student.remainingHours}
              name={student.name}
            />
            <div className="mt-4 text-center font-body">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm">
                  <p>Required: {requiredHours}h</p>
                  <p>Completed: {student.completedHours}h</p>
                </div>
                <div className="text-sm">
                  <p>Remaining: {student.remainingHours}h</p>
                  <p>Progress: {student.percentageCompleted}%</p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${student.percentageCompleted}%` }}
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
