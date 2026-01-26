import React, {useCallback, useEffect, useState, memo} from 'react';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import {PieChart, Pie, Cell, ResponsiveContainer, Tooltip} from 'recharts';

import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import apiHooks from '../../../api';

interface StudentStats {
  firstName: string;
  lastName: string;
  name: string;
  completedHours: number;
  remainingHours: number;
  percentageCompleted: number;
}


const SummaryPieChart = memo(({students}: {students: StudentStats[]}) => {
  const {t} = useTranslation(['teacher', 'common']);

  const totalCompleted = students.reduce((sum, s) => sum + (s.completedHours ?? 0), 0);
  const totalRemaining = students.reduce((sum, s) => sum + (s.remainingHours ?? 0), 0);
  const hasAnyHours = totalCompleted > 0;

  const data = [
    {name: t('teacher:worklog.stats.totalCompleted'), value: totalCompleted},
    {name: t('teacher:worklog.stats.remaining'), value: totalRemaining},
  ];

  return (
    <div className="relative h-[300px]">
      <div className={hasAnyHours ? 'h-full' : 'h-full opacity-40 grayscale'}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              isAnimationActive={hasAnyHours}
            >
              {/* Completed */}
              <Cell fill="#16a34a" />
              {/* Remaining */}
              <Cell fill="#d1d5db" />
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [`${value.toFixed(1)}h`, name]} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {!hasAnyHours && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="rounded-xl bg-white/80 px-4 py-2 text-sm font-body text-gray-700 border border-gray-200 shadow-sm">
            {t('teacher:worklog.stats.noHoursCompleted')}
          </div>
        </div>
      )}
    </div>
  );
});

const StudentPieChart = memo(({completed, remaining}: {
  completed: number;
  remaining: number
}) => {
  const hasAnyHours = completed > 0;

  const data = [
    {name: 'Completed', value: completed},
    {name: 'Remaining', value: remaining},
  ];

  return (
    <div className="relative h-[200px]">
      <div className={hasAnyHours ? 'h-full' : 'h-full opacity-40 grayscale'}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} innerRadius={30} outerRadius={50} paddingAngle={5}
                 dataKey="value" isAnimationActive={hasAnyHours}>
              <Cell fill="#16a34a" />
              <Cell fill="#d1d5db" />
            </Pie>
            <Tooltip formatter={(value: number) => `${value.toFixed(1)}h`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {!hasAnyHours && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="rounded-lg bg-white/80 px-2 py-1 text-xs font-body text-gray-700">
            0h
          </div>
        </div>
      )}
    </div>
  );
});

type Props = {
  courseId: number;
  groupId: number;
  showStats: boolean;
  onShowGroup: () => void;
  onShowStats: () => void;
};

const WorklogGroupStatsPanel: React.FC<Props> = ({
                                                   courseId,
                                                   groupId,
                                                   showStats,
                                                   onShowGroup,
                                                   onShowStats,
                                                 }) => {
  const {t} = useTranslation(['teacher', 'common']);

  const [students, setStudents] = useState<StudentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiredHours, setRequiredHours] = useState(0);

  const getClampedPercentage = (percentage: number) => Math.min(100, Math.max(0, percentage));

  const formatStudentName = (firstName: string, lastName: string) =>
    `${firstName} ${lastName.charAt(0)}.`;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-emerald-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('Missing token');

      const groupDetails = await apiHooks.getWorkLogGroupDetails(
        Number(courseId),
        Number(groupId),
        token,
      );

      const studentStats = await Promise.all(
        groupDetails.students.map(async (student: any) => {
          const worklogStats = await apiHooks.getWorkLogStats(
            student.userid,
            token,
            Number(courseId),
          );

          const courseStats = worklogStats[0];
          const completedHours = courseStats ? courseStats.total_minutes / 60 : 0;

          const remainingHours = groupDetails.course.required_hours - completedHours;
          const percentageCompleted = (completedHours / groupDetails.course.required_hours) * 100;

          return {
            firstName: student.first_name,
            lastName: student.last_name,
            name: `${student.first_name} ${student.last_name}`,
            completedHours: Number(completedHours.toFixed(1)),
            remainingHours: Number(Math.max(0, remainingHours).toFixed(1)),
            percentageCompleted: Number(percentageCompleted.toFixed(1)),
          };
        }),
      );

      setRequiredHours(groupDetails.course.required_hours);
      setStudents(studentStats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error(t('teacher:toasts.error.loadStatsFailed'));
    } finally {
      setLoading(false);
    }
  }, [courseId, groupId, t]);

  useEffect(() => {
    setLoading(true);
    setStudents([]);
    fetchStats();
  }, [fetchStats]);

  if (loading) return <div
    className="p-4 text-center font-body">{t('loading')}</div>;
  if (error) return <div
    className="p-4 text-center text-red-500 font-body">{error}</div>;
  if (!students.length) return <div className="p-4 text-center font-body">No
    students available</div>;

  const totalCompletedHours = students.reduce((sum, student) => sum + student.completedHours, 0);

  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
      <div className="m-3 flex items-center justify-between mb-4 gap-3">
        <h4 className="text-2xl font-heading">
          {t('teacher:worklog.stats.title')}
        </h4>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onShowGroup}
            className={[
              'px-4 py-2 rounded-lg border text-m font-body transition-colors whitespace-nowrap',
              !showStats
                ? 'border-metropolia-main-orange text-metropolia-main-orange bg-orange-50'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50',
            ].join(' ')}
          >
            {t('teacher:worklog.groups.viewGroup')}
          </button>

          <button
            type="button"
            onClick={onShowStats}
            className={[
              'px-4 py-2 rounded-lg border text-m font-body transition-colors whitespace-nowrap',
              showStats
                ? 'border-metropolia-main-orange text-metropolia-main-orange bg-orange-50'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50',
            ].join(' ')}
          >
            {t('teacher:worklog.groups.stats')}
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 bg-white rounded-2xl border border-gray-200">
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}
                            aria-controls="summary-content" id="summary-header">
            <h5 className="text-xl font-heading">
              {t('teacher:worklog.stats.totalProgress')}
            </h5>
          </AccordionSummary>

          <AccordionDetails className="bg-white rounded-b-lg">
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="w-full lg:w-1/2">
                <SummaryPieChart students={students} />
              </div>

              <div
                className="flex flex-col justify-center w-full lg:w-1/2 font-body">
                <div className="w-full overflow-x-auto mb-4">
                  <div className="space-y-2 mb-4">
                    {/* Header (desktop only) */}
                    <div className="hidden sm:grid grid-cols-[1fr_80px_90px] gap-3 px-3 py-2 text-sm font-heading text-gray-700 border-b">
                      <div>{t('worklog.stats.labels.student')}</div>
                      <div className="text-right">{t('worklog.stats.labels.hours')}</div>
                      <div className="text-right">{t('worklog.stats.labels.progress')}</div>
                    </div>

                    {/* Rows */}
                    {students.map((student, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-gray-200 bg-white px-3 py-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="min-w-0">
                              <div className="font-body text-sm text-gray-900 whitespace-nowrap">
                                {formatStudentName(student.firstName, student.lastName)}
                              </div>

                              {/* mobiilissa tunnit + prosentti alle */}
                              <div className="sm:hidden mt-1 text-xs text-gray-600 font-body">
                                {student.completedHours}h · {student.percentageCompleted}%
                              </div>
                            </div>
                          </div>

                          {/* desktop numerot oikealle */}
                          <div className="hidden sm:flex items-center gap-6 font-body text-sm">
                            <div className="w-[80px] text-right">{student.completedHours}h</div>
                            <div className="w-[90px] text-right">{student.percentageCompleted}%</div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Total */}
                    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 font-body">
                      <div className="flex items-center justify-between">
                        <div className="font-heading">Total</div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="w-[80px] text-right font-semibold">
                            {totalCompletedHours.toFixed(1)}h
                          </div>
                          <div className="w-[90px] text-right font-semibold">
                            {((totalCompletedHours / (requiredHours * students.length)) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-center">
                  <p>
                    {t('teacher:worklog.stats.required')}: {requiredHours * students.length}h
                  </p>
                  <p>
                    {t('teacher:worklog.stats.totalCompleted')}: {totalCompletedHours.toFixed(1)}h
                  </p>
                </div>
              </div>
            </div>
          </AccordionDetails>
        </Accordion>
      </div>

      {/* Per student cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {students.map((student, index) => (
          <div key={index}
               className="p-6 bg-white rounded-2xl border border-gray-200">
            <h5 className="mb-4 text-lg text-center font-heading leading-tight">
              <span className="block">{student.firstName}</span>
              <span className="block">{student.lastName}</span>
            </h5>

            <StudentPieChart completed={student.completedHours}
                             remaining={student.remainingHours} />

            <div className="mt-4 text-center font-body">
              <table className="w-full text-sm">
                <tbody>
                <tr className="border-b">
                  <td
                    className="text-left p-1">{t('worklog.stats.labels.required')}:
                  </td>
                  <td className="text-right p-1">{requiredHours}h</td>
                </tr>
                <tr className="border-b">
                  <td
                    className="text-left p-1">{t('worklog.stats.labels.completed')}:
                  </td>
                  <td className="text-right p-1">{student.completedHours}h</td>
                </tr>
                <tr className="border-b">
                  <td
                    className="text-left p-1">{t('worklog.stats.labels.remaining')}:
                  </td>
                  <td className="text-right p-1">{student.remainingHours}h</td>
                </tr>
                <tr className="border-b">
                  <td
                    className="text-left p-1">{t('worklog.stats.labels.progress')}:
                  </td>
                  <td
                    className="text-right p-1">{getClampedPercentage(student.percentageCompleted)}%
                  </td>
                </tr>
                </tbody>
              </table>

              <div className="w-full h-2 mt-2 bg-gray-200 rounded-full">
                <div
                  className={`h-2 transition-all duration-300 ${getProgressColor(student.percentageCompleted)} rounded-full`}
                  style={{width: `${getClampedPercentage(student.percentageCompleted)}%`}}
                  title={`${student.percentageCompleted.toFixed(1)}% complete`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorklogGroupStatsPanel;
