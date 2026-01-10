import React, {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import {toast} from 'react-toastify';
import apiHooks from '../../../api';

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

type Variant = 'embedded' | 'page';

interface PracticumEntriesSectionProps {
  practicumId: number;
  variant?: Variant;
  className?: string;
}

const PracticumEntriesSection: React.FC<PracticumEntriesSectionProps> = ({
                                                                           practicumId,
                                                                           variant = 'embedded',
                                                                           className = '',
                                                                         }) => {
  const {t} = useTranslation(['common', 'teacher']);

  const [entries, setEntries] = useState<PracticumEntry[]>([]);
  const [practicumDetails, setPracticumDetails] =
    useState<DetailedPracticumInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    entryId: number | null;
    entryDate: string;
  }>({open: false, entryId: null, entryDate: ''});

  // ✅ Auki oletuksena jos ei ole merkintöjä
  const [entriesExpanded, setEntriesExpanded] = useState<boolean>(false);

  const fetchData = async () => {
    const token: string | null = localStorage.getItem('userToken');
    if (!token || !practicumId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [details, worklogEntries] = await Promise.all([
        apiHooks.getPracticumDetails(practicumId, token),
        apiHooks.getWorkLogEntriesByPracticum(practicumId, token),
      ]);

      setPracticumDetails(details);
      setEntries(worklogEntries);

      // ✅ jos 0 merkintää, auki suoraan
      setEntriesExpanded(worklogEntries.length === 0);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practicumId]);

  const formatTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    } catch {
      return '—';
    }
  };

  const totalHours = useMemo(() => {
    return entries.reduce((total, entry) => {
      const start = new Date(entry.start_time);
      const end = new Date(entry.end_time);
      const diffInHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + diffInHours;
    }, 0);
  }, [entries]);

  const requiredHours = practicumDetails?.practicum?.required_hours || 1;

  const calculatePercentage = (total: number, required: number): number =>
    Math.min((total / (required || 1)) * 100, 100);

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

  const percent = calculatePercentage(totalHours, requiredHours);
  const clamped = getClampedPercentage(percent);

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

      await apiHooks.deleteWorkLogEntry(deleteDialog.entryId, token);
      toast.success(t('teacher:worklog.entries.deleted'));

      await fetchData();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error(t('teacher:worklog.entries.errors.failedToDelete'));
    } finally {
      setDeleteDialog({open: false, entryId: null, entryDate: ''});
    }
  };

  if (loading) {
    return (
      <div className={variant === 'embedded' ? 'py-2' : 'flex items-center justify-center min-h-screen'}>
        <div className="text-xl font-body">{t('loading')}</div>
      </div>
    );
  }

  const wrapperClass =
    variant === 'embedded'
      ? 'w-full'
      : 'container max-w-6xl px-4 py-8 mx-auto bg-gray-100 rounded-lg';

  return (
    <div className={`${wrapperClass} ${className}`}>
      {/* Yksi yhteinen “kortti” oikealle puolelle */}
      <div className="p-1 bg-white rounded-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">

            <p className="text-l sm:text-xl font-heading text-gray-800">
              {t('teacher:practicum.entries.title')}
            </p>
            <p className="mt-1 text-sm text-gray-500 font-body">
            </p>

        </div>

        {/* Summary grid */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="font-body">
            <p className="text-gray-600">{t('teacher:practicum.entries.totalEntries')}</p>
            <p className="font-medium">{entries.length}</p>
          </div>

          <div className="font-body">
            <p className="text-gray-600">{t('teacher:practicum.entries.totalHours')}</p>
            <p className="font-medium">{totalHours.toFixed(2)}h</p>
          </div>

          <div className="font-body">
            <p className="text-gray-600">{t('teacher:practicum.entries.studentName')}</p>
            {practicumDetails?.practicum?.first_name ? (
              <p className="font-medium">
                {practicumDetails.practicum.first_name} {practicumDetails.practicum.last_name}
              </p>
            ) : (
              <p className="text-gray-500">{t('teacher:practicum.entries.noStudent')}</p>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mt-5">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600 font-body">
              {t('teacher:practicum.entries.progress')}
            </span>
            <div className="flex gap-2">
              <span className="text-sm text-gray-600 font-body">{Math.round(clamped)}%</span>
              <span className="text-sm text-gray-600 font-body">
                ({requiredHours}h {t('teacher:practicum.entries.required')})
              </span>
            </div>
          </div>

          <div className="relative w-full h-2 bg-gray-200 rounded-full">
            <div
              className={`relative h-2 transition-all duration-300 ${getProgressGradient(clamped)} rounded-full`}
              style={{width: `${clamped}%`}}
            />
            <span
              className="absolute -bottom-6 text-sm font-medium text-gray-600"
              style={{
                left: `clamp(16px, ${clamped}%, calc(100% - 24px))`,
                transform: 'translateX(-50%)',
              }}
            > {totalHours.toFixed(1)}h
            </span>
          </div>
        </div>

        {/* Kaikki merkinnät samassa kortissa */}
        <div className="mt-10">
          <Accordion
            className="!shadow-none !bg-transparent"
            expanded={entriesExpanded}
            onChange={(_, expanded) => setEntriesExpanded(expanded)}
            sx={{
              border: 'none',
              borderRadius: 0,
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary sx={{
              padding: 0,
              minHeight: 'auto',
              '& .MuiAccordionSummary-content': { margin: 0 },
            }} expandIcon={<ExpandMoreIcon />}>
              <h3 className="text-xl font-heading text-gray-800">
                {t('teacher:practicum.entries.allEntries')}
              </h3>
            </AccordionSummary>

            <AccordionDetails
              sx={{
                paddingX: 0,
                paddingTop: 1,
                paddingBottom: 0,
                backgroundColor: 'transparent',
              }}
            >
              {entries.length === 0 ? (
                <p className="text-gray-600 font-body">
                  {t('teacher:practicum.entries.noEntries')}
                </p>
              ) : (
                <div className="overflow-x-auto max-w-full">
                  <table className="w-full text-sm min-w-[720px]">
                    <thead className="text-left text-gray-600">
                    <tr className="border-b">
                      <th className="p-3">{t('teacher:practicum.entries.date')}</th>
                      <th className="p-3">{t('teacher:practicum.entries.start')}</th>
                      <th className="p-3">{t('teacher:practicum.entries.end')}</th>
                      <th className="p-3">{t('teacher:practicum.entries.hours')}</th>
                      <th className="p-3">{t('teacher:practicum.entries.description')}</th>
                      <th className="p-3">{t('teacher:practicum.entries.status')}</th>
                      <th className="p-3">{t('teacher:practicum.entries.actions')}</th>
                    </tr>
                    </thead>

                    <tbody>
                    {entries.map((entry) => {
                      const start = new Date(entry.start_time);
                      const end = new Date(entry.end_time);
                      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

                      return (
                        <tr key={entry.entry_id} className="border-b hover:bg-gray-50 font-body">
                          <td className="p-3">{new Date(entry.start_time).toLocaleDateString()}</td>
                          <td className="p-3">{formatTime(entry.start_time)}</td>
                          <td className="p-3">{formatTime(entry.end_time)}</td>
                          <td className="p-3">{hours.toFixed(2)}h</td>
                          <td className="p-3 max-w-xs truncate">{entry.description}</td>
                          <td className="p-3">{entry.status}</td>
                          <td className="p-3">
                            <button
                              onClick={() => handleDeleteEntry(entry.entry_id, entry.start_time)}
                              className="text-red-600 hover:text-red-800 transition-colors p-1"
                              title={t('delete')}
                            >
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
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({open: false, entryId: null, entryDate: ''})}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          {t('teacher:worklog.entries.confirmDelete')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            {t('teacher:worklog.entries.confirmDeleteMessage', {date: deleteDialog.entryDate})}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({open: false, entryId: null, entryDate: ''})}>
            {t('cancel')}
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            {t('delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PracticumEntriesSection;
