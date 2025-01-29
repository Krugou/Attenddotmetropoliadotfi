import React, {useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import {UserContext} from '../../../contexts/UserContext';
import apiHooks from '../../../hooks/ApiHooks';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import {CircularProgress} from '@mui/material';

dayjs.extend(duration);

interface WorkLogEntry {
  entry_id: number;
  start_time: string;
  end_time: string;
  description: string;
  course: {
    name: string;
    code: string;
  };
  status: number;
}

const StudentWorklogs: React.FC = () => {
  const {t} = useTranslation();
  const {user} = useContext(UserContext);
  const [entries, setEntries] = useState<WorkLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token || !user?.userid) {
          throw new Error('No token or user found');
        }

        const response = await apiHooks.getAllWorkLogEntries(
          user.userid,
          token,
        );
        console.log('🚀 ~ fetchEntries ~ response:', response);

        if (response.entries) {
          setEntries(response.entries);
        }
      } catch (error) {
        console.error('Error fetching worklog entries:', error);
        toast.error(t('worklog.errors.fetchFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [user?.userid, t]);

  const calculateDuration = (start: string, end: string) => {
    const startTime = dayjs(start);
    const endTime = dayjs(end);
    const diff = endTime.diff(startTime);
    const duration = dayjs.duration(diff);
    return `${Math.floor(duration.asHours())}h ${duration.minutes()}min`;
  };

  const tableHeaderClass = `
    px-4 py-2 text-left text-sm font-semibold
    text-metropoliaMainGrey bg-metropoliaSupportWhite
    border-b border-metropoliaMainGrey/20
  `;

  const tableCellClass = `
    px-4 py-2 text-sm text-metropoliaMainGrey
    border-b border-metropoliaMainGrey/10
  `;

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className='container px-4 py-8 mx-auto'>
      <h1 className='mb-6 text-2xl font-heading text-metropoliaMainOrange'>
        {t('worklog.entries.title')}
      </h1>

      <div className='overflow-hidden bg-white rounded-lg shadow-lg'>
        <div className='overflow-x-auto'>
          <table className='min-w-full'>
            <thead>
              <tr>
                <th className={tableHeaderClass}>
                  {t('worklog.entries.date')}
                </th>
                <th className={tableHeaderClass}>
                  {t('worklog.entries.startTime')}
                </th>
                <th className={tableHeaderClass}>
                  {t('worklog.entries.endTime')}
                </th>
                <th className={tableHeaderClass}>
                  {t('worklog.entries.duration')}
                </th>
                <th className={tableHeaderClass}>
                  {t('worklog.entries.course')}
                </th>
                <th className={tableHeaderClass}>
                  {t('worklog.entries.description')}
                </th>
                <th className={tableHeaderClass}>
                  {t('worklog.entries.status')}
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.entry_id}
                  className='transition-colors hover:bg-metropoliaMainGrey/5'>
                  <td className={tableCellClass}>
                    {dayjs(entry.start_time).format('YYYY-MM-DD')}
                  </td>
                  <td className={tableCellClass}>
                    {dayjs(entry.start_time).format('HH:mm')}
                  </td>
                  <td className={tableCellClass}>
                    {dayjs(entry.end_time).format('HH:mm')}
                  </td>
                  <td className={tableCellClass}>
                    {calculateDuration(entry.start_time, entry.end_time)}
                  </td>
                  <td className={tableCellClass}>{entry.course?.name}</td>
                  <td className={tableCellClass}>{entry.description}</td>
                  <td className={tableCellClass}>
                    {t(`worklog.status.${entry.status}`)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='p-4 border-t border-metropoliaMainGrey/10'>
          <p className='text-sm text-metropoliaMainGrey'>
            {t('worklog.entries.total')}: {entries.length}{' '}
            {t('worklog.entries.entries')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentWorklogs;
