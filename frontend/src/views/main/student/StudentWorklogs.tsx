import React, {useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import {UserContext} from '../../../contexts/UserContext';
import apiHooks from '../../../hooks/ApiHooks';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import {CircularProgress, Select, MenuItem} from '@mui/material';
import {Edit, Delete} from '@mui/icons-material';
import EditWorklogModal from '../../../components/modals/EditWorklogModal';

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
  const [selectedEntry, setSelectedEntry] = useState<WorkLogEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleEdit = (entry: WorkLogEntry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const handleDelete = async (entryId: number) => {
    if (!window.confirm(t('worklog.delete.confirm'))) return;

    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No token found');

      await apiHooks.deleteWorkLogEntry(entryId, token);
      setEntries(entries.filter((entry) => entry.entry_id !== entryId));
      toast.success(t('worklog.delete.success'));
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error(t('worklog.delete.error'));
    }
  };

  const handleSaveEdit = async (updatedData: Partial<WorkLogEntry>) => {
    if (!selectedEntry) return;

    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No token found');

      await apiHooks.updateWorkLogEntry(
        selectedEntry.entry_id,
        updatedData,
        token,
      );

      setEntries(
        entries.map((entry) =>
          entry.entry_id === selectedEntry.entry_id
            ? {...entry, ...updatedData}
            : entry,
        ),
      );

      toast.success(t('worklog.edit.success'));
    } catch (error) {
      console.error('Error updating entry:', error);
      toast.error(t('worklog.edit.error'));
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
            className='relative overflow-hidden transition-shadow duration-300 bg-white rounded-lg shadow-lg hover:shadow-xl'>
            <div className='absolute space-x-2 top-2 right-2'>
              <button
                onClick={() => handleEdit(entry)}
                className='p-1 text-gray-600 rounded hover:bg-gray-100'>
                <Edit fontSize='small' />
              </button>
              <button
                onClick={() => handleDelete(entry.entry_id)}
                className='p-1 text-red-600 rounded hover:bg-gray-100'>
                <Delete fontSize='small' />
              </button>
            </div>

            <div className='p-4 pt-10'>
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
                  <span className={statusClass(entry.status)}>
                    {t(`worklog.status.${entry.status}`)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <EditWorklogModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEntry(null);
        }}
        entry={selectedEntry}
        onSave={handleSaveEdit}
      />

      <div className='mt-4 text-sm text-metropoliaMainGrey'>
        {t('worklog.entries.total')}: {entries.length}{' '}
        {t('worklog.entries.entries')}
      </div>
    </div>
  );
};

export default StudentWorklogs;
