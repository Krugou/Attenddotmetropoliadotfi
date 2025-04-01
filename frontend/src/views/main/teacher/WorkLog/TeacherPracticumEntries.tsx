import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {worklogApi} from '../../../../api/worklog';
import {practicumApi} from '../../../../api/practicum';
import GeneralLinkButton from '../../../../components/main/buttons/GeneralLinkButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import {toast} from 'react-toastify';

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

interface DetailedPracticumInfo {
  practicum?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    description: string;
    required_hours: number;
    createdAt: string;
    updatedAt: string;
  };
  entries?: PracticumEntry[];
}

const TeacherPracticumEntries: React.FC = () => {
  const {t} = useTranslation(['common', 'teacher']);
  const {practicumid} = useParams<{practicumid: string}>();
  const [entries, setEntries] = useState<PracticumEntry[]>([]);
  const [practicumDetails, setPracticumDetails] =
    useState<DetailedPracticumInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    entryId: number | null;
    entryDate: string;
  }>({
    open: false,
    entryId: null,
    entryDate: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      const token: string | null = localStorage.getItem('userToken');
      if (!practicumid || !token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [details, worklogEntries] = await Promise.all([
          practicumApi.getPracticumDetails(Number(practicumid), token),
          worklogApi.getWorkLogEntriesByPracticum(Number(practicumid), token),
        ]);

        setPracticumDetails(details);
        setEntries(worklogEntries);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, [practicumid]);

  const formatTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    } catch (err) {
      return 'Invalid time';
    }
  };

  const calculatePercentage = (total: number, required: number): number => {
    return Math.min((total / (required || 1)) * 100, 100);
  };

  const totalHours = entries.reduce((total, entry) => {
    const start = new Date(entry.start_time);
    const end = new Date(entry.end_time);
    const diffInHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return total + diffInHours;
  }, 0);

  const getClampedPercentage = (percentage: number): number =>
    Math.min(Math.max(percentage, 0), 100);

  const getProgressGradient = (percentage: number): string => {
    if (percentage >= 100) {
      return 'bg-gradient-to-r from-metropolia-trend-green to-metropolia-trend-green-dark';
    }
    if (percentage >= 70) {
      return 'bg-gradient-to-r from-metropolia-support-yellow-dark via-metropolia-support-yellow to-metropolia-trend-green';
    }
    if (percentage >= 40) {
      return 'bg-gradient-to-r from-metropolia-support-red via-metropolia-support-yellow-dark to-metropolia-support-yellow';
    }
    return 'bg-gradient-to-r from-metropolia-support-secondary-red via-metropolia-support-red to-metropolia-support-yellow-dark';
  };

  const handleDeleteEntry = (entryId: number, date: string) => {
    setDeleteDialog({
      open: true,
      entryId,
      entryDate: new Date(date).toLocaleDateString(),
    });
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token || !deleteDialog.entryId) {
        throw new Error('Missing required data');
      }

      await worklogApi.deleteWorkLogEntry(deleteDialog.entryId, token);
      toast.success(t('teacher:worklog.entries.deleted'));
      const fetchData = async () => {
        const token: string | null = localStorage.getItem('userToken');
        if (!practicumid || !token) {
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          const [details, worklogEntries] = await Promise.all([
            practicumApi.getPracticumDetails(Number(practicumid), token),
            worklogApi.getWorkLogEntriesByPracticum(Number(practicumid), token),
          ]);

          setPracticumDetails(details);
          setEntries(worklogEntries);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching data:', err);
          setLoading(false);
        }
      };
      await fetchData();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error(t('teacher:worklog.entries.errors.failedToDelete'));
    } finally {
      setDeleteDialog({ open: false, entryId: null, entryDate: '' });
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-xl font-body'>{t('common:loading')}</div>
      </div>
    );
  }

  return (
    <div className='container max-w-6xl px-4 py-8 mx-auto bg-gray-100 rounded-lg'>
      <div className='flex gap-4 mb-6'>
        <GeneralLinkButton
          path='/teacher/worklog'
          text={t('teacher:worklog.detail.backToWorklog')}
        />
      </div>

      <div className='p-6 mb-8 bg-white rounded-lg shadow-sm'>
        <h1 className='mb-4 text-3xl font-heading'>{t('teacher:practicum.entries.title')}</h1>
        <div className='flex flex-col md:flex-row gap-4 md:justify-between'>
          <div className='font-body md:flex-1'>
            <p className='text-gray-600'>{t('teacher:practicum.entries.totalEntries')}</p>
            <p className='font-medium'>{entries.length}</p>
          </div>
          <div className='font-body md:flex-1'>
            <p className='text-gray-600'>{t('teacher:practicum.entries.totalHours')}</p>
            <p className='font-medium'>{totalHours.toFixed(2)}h</p>
          </div>
          <div className='font-body md:flex-1'>
            <p className='text-gray-600'>{t('teacher:practicum.entries.studentName')}</p>
            {practicumDetails?.practicum?.first_name ? (
              <p className='font-medium'>
                {practicumDetails.practicum.first_name}{' '}
                {practicumDetails.practicum.last_name}
              </p>
            ) : (
              <p className='text-gray-500'>{t('teacher:practicum.entries.noStudent')}</p>
            )}
          </div>
        </div>
      </div>

      <div className='p-6 mb-8 bg-white rounded-lg shadow-sm'>
        <div className='flex justify-between mb-1'>
          <span className='text-sm text-gray-600 font-body'>{t('teacher:practicum.entries.progress')}</span>
          <div className='flex gap-2'>
            <span className='text-sm text-gray-600 font-body'>
              {Math.round(calculatePercentage(totalHours, practicumDetails?.practicum?.required_hours || 1))}%
            </span>
            <span className='text-sm text-gray-600 font-body'>
              ({practicumDetails?.practicum?.required_hours}h {t('teacher:practicum.entries.required')})
            </span>
          </div>
        </div>
        <div className='relative w-full h-2 bg-gray-200 rounded-full mt-4'>
          <div
            className={`relative h-2 transition-all duration-300 ${getProgressGradient(
              calculatePercentage(totalHours, practicumDetails?.practicum?.required_hours || 1)
            )} rounded-full`}
            style={{
              width: `${getClampedPercentage(
                calculatePercentage(totalHours, practicumDetails?.practicum?.required_hours || 1)
              )}%`,
            }}
          />
          <span
            className='absolute -bottom-6 text-sm font-medium text-gray-600 transform -translate-x-1/2'
            style={{
              left: `${calculatePercentage(totalHours, practicumDetails?.practicum?.required_hours || 1)}%`,
            }}
          >
            {totalHours.toFixed(1)}h
          </span>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow p-4 mb-6'>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls='entries-content'
            id='entries-header'
            className='bg-white rounded-t-lg'>
            <h2 className='text-2xl font-heading'>{t('teacher:practicum.entries.allEntries')}</h2>
          </AccordionSummary>
          <AccordionDetails className='bg-white rounded-b-lg'>
            {entries.length === 0 ? (
              <div className='text-center p-8 bg-gray-50 rounded-lg'>
                <p className='text-lg text-gray-500'>
                  {t('teacher:practicum.entries.noEntries')}
                </p>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='w-full table-auto'>
                  <thead>
                    <tr className='text-gray-600 border-b font-body'>
                      <th className='p-3 text-left'>{t('teacher:practicum.entries.date')}</th>
                      <th className='p-3 text-left'>{t('teacher:practicum.entries.startTime')}</th>
                      <th className='p-3 text-left'>{t('teacher:practicum.entries.endTime')}</th>
                      <th className='p-3 text-left'>{t('teacher:practicum.entries.hours')}</th>
                      <th className='p-3 text-left'>{t('teacher:practicum.entries.description')}</th>
                      <th className='p-3 text-left'>{t('teacher:practicum.entries.status')}</th>
                      <th className='p-3 text-left'>{t('teacher:practicum.entries.actions')}</th>
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
                          <td className='p-3'>
                            <button
                              onClick={() => handleDeleteEntry(entry.entry_id, entry.start_time)}
                              className='text-red-600 hover:text-red-800 transition-colors p-1'
                              title={t('common:delete')}>
                              <DeleteIcon fontSize="small" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </AccordionDetails>
        </Accordion>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, entryId: null, entryDate: '' })}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          {t('teacher:worklog.entries.confirmDelete')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            {t('teacher:worklog.entries.confirmDeleteMessage', { date: deleteDialog.entryDate })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, entryId: null, entryDate: '' })}
          >
            {t('common:cancel')}
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            {t('common:delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TeacherPracticumEntries;
