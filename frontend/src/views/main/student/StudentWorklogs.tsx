import React, {useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import {UserContext} from '../../../contexts/UserContext';
import apiHooks from '../../../hooks/ApiHooks';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import {CircularProgress, Select, MenuItem} from '@mui/material';

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
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

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

  const handleStatusChange = async (entryId: number, newStatus: number) => {
    try {
      setUpdatingStatus(entryId);
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token found');
      }

      await apiHooks.updateWorkLogStatus(entryId, newStatus, token);

      // Update local state
      setEntries(
        entries.map((entry) =>
          entry.entry_id === entryId ? {...entry, status: newStatus} : entry,
        ),
      );

      toast.success(t('worklog.status.updateSuccess'));
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(t('worklog.status.updateError'));
    } finally {
      setUpdatingStatus(null);
    }
  };

  const calculateDuration = (start: string, end: string) => {
    const startTime = dayjs(start);
    const endTime = dayjs(end);
    const diff = endTime.diff(startTime);
    const duration = dayjs.duration(diff);
    return `${Math.floor(duration.asHours())}h ${duration.minutes()}min`;
  };

  const statusClass = (status: number) => {
    return `inline-flex px-2 py-1 text-xs font-medium rounded-full ${
      status === 1
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-green-100 text-green-800'
    }`;
  };

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

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {entries.map((entry) => (
          <div
            key={entry.entry_id}
            className='overflow-hidden transition-shadow duration-300 bg-white rounded-lg shadow-lg hover:shadow-xl'>
            <div className='p-4'>
              <div className='flex items-center justify-between mb-4'>
                <div className='text-lg font-semibold text-metropoliaMainGrey'>
                  {entry.course?.name}
                </div>
                <div className='text-sm text-metropoliaMainGrey'>
                  {dayjs(entry.start_time).format('YYYY-MM-DD')}
                </div>
              </div>

              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-sm text-metropoliaMainGrey'>Time:</span>
                  <span className='text-sm font-medium'>
                    {dayjs(entry.start_time).format('HH:mm')} -{' '}
                    {dayjs(entry.end_time).format('HH:mm')}
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-sm text-metropoliaMainGrey'>
                    Duration:
                  </span>
                  <span className='text-sm font-medium'>
                    {calculateDuration(entry.start_time, entry.end_time)}
                  </span>
                </div>

                <div className='pt-2 mt-2 border-t'>
                  <p className='text-sm text-metropoliaMainGrey line-clamp-2'>
                    {entry.description}
                  </p>
                </div>

                <div className='flex items-center justify-between pt-2 mt-2 border-t'>
                  <span className='text-sm text-metropoliaMainGrey'>
                    Status:
                  </span>
                  {updatingStatus === entry.entry_id ? (
                    <CircularProgress size={20} />
                  ) : (
                    <Select
                      value={entry.status}
                      onChange={(e) =>
                        handleStatusChange(
                          entry.entry_id,
                          Number(e.target.value),
                        )
                      }
                      size='small'
                      className='min-w-[120px]'>
                      <MenuItem value={1}>{t('worklog.status.1')}</MenuItem>
                      <MenuItem value={2}>{t('worklog.status.2')}</MenuItem>
                    </Select>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='mt-4 text-sm text-metropoliaMainGrey'>
        {t('worklog.entries.total')}: {entries.length}{' '}
        {t('worklog.entries.entries')}
      </div>
    </div>
  );
};

export default StudentWorklogs;
