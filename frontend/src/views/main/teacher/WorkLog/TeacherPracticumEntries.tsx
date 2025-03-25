import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {worklogApi} from '../../../../api/worklog';
import GeneralLinkButton from '../../../../components/main/buttons/GeneralLinkButton';

interface PracticumEntry {
  entry_id: number;
  userid: number;
  work_log_practicum_id: number;
  start_time: string;
  end_time: string;
  description: string;
  first_name?: string;
  last_name?: string;
  status: 0 | 1 | 2 | 3;
}

const TeacherPracticumEntries: React.FC = () => {
  const {t} = useTranslation(['common', 'teacher']);
  const {practicumid} = useParams<{practicumid: string}>();
  const [entries, setEntries] = useState<PracticumEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPracticumEntries = async () => {
      const token: string | null = localStorage.getItem('userToken');
      if (!practicumid || !token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const Studententries = await worklogApi.getWorkLogEntriesByPracticum(
          Number(practicumid),
          token,
        );
        setEntries(Studententries);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    fetchPracticumEntries();
  }, [practicumid]);

  const formatTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    } catch (err) {
      return 'Invalid time';
    }
  };

  const totalHours = entries.reduce((total, entry) => {
    const start = new Date(entry.start_time);
    const end = new Date(entry.end_time);
    const diffInHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return total + diffInHours;
  }, 0);

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-xl font-body'>Loading...</div>
      </div>
    );
  }

  console.log(entries);

  return (
    <div className='container max-w-6xl px-4 py-8 mx-auto bg-gray-100 rounded-lg'>
      <div className='flex gap-4 mb-6'>
        <GeneralLinkButton
          path='/teacher/worklog'
          text={t('teacher:worklog.detail.backToWorklog')}
        />
      </div>

      <div className='p-6 mb-8 bg-white rounded-lg shadow-sm'>
        <h1 className='mb-4 text-3xl font-heading'>Practicum Entries</h1>
        <div className='flex flex-col md:flex-row gap-4 md:justify-between'>
          <div className='font-body md:flex-1'>
            <p className='text-gray-600'>Total Entries</p>
            <p className='font-medium'>{entries.length}</p>
          </div>
          <div className='font-body md:flex-1'>
            <p className='text-gray-600'>Total Hours Logged</p>
            <p className='font-medium'>{totalHours.toFixed(2)}h</p>
          </div>
          <div className='font-body md:flex-1'>
            <p className='text-gray-600'>Student's name</p>
            {entries.length > 0 && (
              <p className='font-medium'>
                {entries[0].first_name} {entries[0].last_name}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow p-4 mb-6'>
        <h2 className='text-2xl font-heading mb-4'>All Entries</h2>
        {entries.length === 0 ? (
          <div className='text-center p-8 bg-gray-50 rounded-lg'>
            <p className='text-lg text-gray-500'>
              No entries found for this practicum
            </p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full table-auto'>
              <thead>
                <tr className='text-gray-600 border-b font-body'>
                  <th className='p-3 text-left'>User ID</th>
                  <th className='p-3 text-left'>Date</th>
                  <th className='p-3 text-left'>Start Time</th>
                  <th className='p-3 text-left'>End Time</th>
                  <th className='p-3 text-left'>Hours</th>
                  <th className='p-3 text-left'>Description</th>
                  <th className='p-3 text-left'>Status</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const start = new Date(entry.start_time);
                  const end = new Date(entry.end_time);
                  const hours =
                    (end.getTime() - start.getTime()) / (1000 * 60 * 60);

                  return (
                    <tr
                      key={entry.entry_id}
                      className='border-b hover:bg-gray-50 font-body'>
                      <td className='p-3'>{entry.userid}</td>
                      <td className='p-3'>
                        {new Date(entry.start_time).toLocaleDateString()}
                      </td>
                      <td className='p-3'>{formatTime(entry.start_time)}</td>
                      <td className='p-3'>{formatTime(entry.end_time)}</td>
                      <td className='p-3'>{hours.toFixed(2)}h</td>
                      <td className='p-3 max-w-xs truncate'>
                        {entry.description}
                      </td>
                      <td className='p-3'>{entry.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherPracticumEntries;
