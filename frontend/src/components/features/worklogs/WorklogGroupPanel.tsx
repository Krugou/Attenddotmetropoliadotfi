import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';

import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContentText from '@mui/material/DialogContentText';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import DeleteIcon from '@mui/icons-material/Delete';

import apiHooks from '../../../api';

interface GroupDetails {
  group: {
    group_id: number;
    group_name: string;
  };
  course: {
    name: string;
    code: string;
    description: string;
    start_date: string;
    end_date: string;
    required_hours: number;
  };
  students: {
    userid: number;
    email: string;
    first_name: string;
    last_name: string;
    studentnumber: string;
  }[];
  entries: {
    entry_id: number;
    start_time: string;
    end_time: string;
    description: string;
    status: number;
    user_id: number;
    first_name: string;
    last_name: string;
  }[];
}

interface Student {
  userid: number;
  first_name: string;
  last_name: string;
  email: string;
}

type Props = {
  courseId: number;
  groupId: number;
  showStats: boolean;
  onShowGroup: () => void;
  onShowStats?: () => void;
  onGroupUpdated?: () => void;
};

const WorklogGroupPanel: React.FC<Props> = ({
                                              courseId,
                                              groupId,
                                              showStats,
                                              onShowGroup,
                                              onShowStats,
                                              onGroupUpdated,
                                            }) => {
  const {t} = useTranslation(['teacher', 'common']);

  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [studentList, setStudentList] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    studentId: number | null;
    studentName: string;
  }>({open: false, studentId: null, studentName: ''});

  const [deleteEntryDialog, setDeleteEntryDialog] = useState<{
    open: boolean;
    entryId: number | null;
    entryDate: string;
  }>({open: false, entryId: null, entryDate: ''});

  const fetchGroupDetails = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('Missing token');

      const list = await apiHooks.getWorkLogStudentsByCourse(String(courseId), token);

      const details = await apiHooks.getWorkLogGroupDetails(
        Number(courseId),
        Number(groupId),
        token,
      );

      const studentsWithGroupCheck = await Promise.all(
        list.students.map(async (student: any) => {
          const existingGroup = await apiHooks.checkStudentExistingGroup(
            student.userid,
            Number(courseId),
            token,
          );
          return {...student, existingGroup};
        }),
      );

      const availableStudents = studentsWithGroupCheck.filter(
        (student: any) => !student.existingGroup,
      );

      setStudentList(availableStudents);
      setGroupDetails(details);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setGroupDetails(null);
    setSelectedStudents([]);
    setIsModalOpen(false);
    fetchGroupDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, groupId]);

  const totalHours = (groupDetails?.entries ?? []).reduce((acc, entry) => {
    const hours =
      (new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()) /
      (1000 * 60 * 60);
    return acc + hours;
  }, 0);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleRemoveStudent = async (studentId: number) => {
    const student = groupDetails?.students.find(s => s.userid === studentId);
    if (!student) return;

    setConfirmDialog({
      open: true,
      studentId,
      studentName: `${student.first_name} ${student.last_name}`,
    });
  };

  const handleConfirmRemove = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token || !groupDetails?.group.group_id || !confirmDialog.studentId) {
        throw new Error('Missing required data');
      }

      await apiHooks.removeStudentFromGroup(
        groupDetails.group.group_id,
        confirmDialog.studentId,
        token,
      );

      toast.success(t('teacher:worklog.groups.studentRemoved'));
      await fetchGroupDetails();
      onGroupUpdated?.();
    } catch {
      toast.error(t('teacher:worklog.groups.errors.failedToRemove'));
    } finally {
      setConfirmDialog({open: false, studentId: null, studentName: ''});
    }
  };

  const handleDeleteEntry = (entryId: number, date: string) => {
    setDeleteEntryDialog({
      open: true,
      entryId,
      entryDate: new Date(date).toLocaleDateString(),
    });
  };

  const handleConfirmDeleteEntry = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token || !deleteEntryDialog.entryId) throw new Error('Missing data');

      await apiHooks.deleteWorkLogEntry(deleteEntryDialog.entryId, token);
      toast.success(t('teacher:worklog.entries.deleted'));
      await fetchGroupDetails();
    } catch {
      toast.error(t('teacher:worklog.entries.errors.failedToDelete'));
    } finally {
      setDeleteEntryDialog({open: false, entryId: null, entryDate: ''});
    }
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center p-8 bg-gray-50 rounded-2xl border border-gray-200">
        <div className="text-xl font-body">{t('loading')}</div>
      </div>
    );
  }

  if (!groupDetails) {
    return (
      <div
        className="flex items-center justify-center p-8 bg-gray-50 rounded-2xl border border-gray-200">
        <div className="text-xl text-red-500 font-body">
          {t('teacher:worklog.errors.groupNotFound')}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Yhteinen container jossa Summary + Quick stats + accordions */}
      <div className="p-6 mb-4 bg-gray-50 rounded-2xl border border-gray-200">
        {/* Summary */}
        <div
          className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <h4 className="text-2xl font-heading break-words">
              {groupDetails.group.group_name}
            </h4>

            <div className="mt-4 font-body">
              <dl className="space-y-3">
                <div className="grid grid-cols-[120px_1fr] items-baseline gap-x-6">
                  <dt className="text-s tracking-wide text-gray-500">
                    {t('teacher:worklog.details.name')}
                  </dt>
                  <dd className="text-s font-medium text-gray-900">
                    {groupDetails.course.name}
                  </dd>
                </div>

                <div className="grid grid-cols-[120px_1fr] items-baseline gap-x-6">
                  <dt className="text-s tracking-wide text-gray-500">
                    {t('teacher:worklog.details.code')}
                  </dt>
                  <dd className="text-s font-medium text-gray-900">
                    {groupDetails.course.code}
                  </dd>
                </div>

                <div className="grid grid-cols-[120px_1fr] items-baseline gap-x-6">
                  <dt className="text-s tracking-wide text-gray-500">
                    {t('teacher:worklog.details.requiredHours')}
                  </dt>
                  <dd className="text-s font-medium text-gray-900">
                    {groupDetails.course.required_hours}h
                  </dd>
                </div>
              </dl>
            </div>
          </div>

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

        <div className="mt-5 pt-5 border-t border-gray-200">
          {/* Quick stats */}
          <div
            className="mb-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700 font-body">
            <div className="text-sm font-body text-gray-700">
              {t('teacher:worklog.groups.studentCount', {count: groupDetails.students.length})}
            </div>

            <div>
              <span
                className="text-gray-600">{t('teacher:worklog.entries.total')}:</span>{' '}
              <span className="font-medium">{totalHours.toFixed(1)}h</span>
            </div>

            <div>
              <span
                className="text-gray-600">{t('teacher:worklog.entries.entries')}:</span>{' '}
              <span className="font-medium">{groupDetails.entries.length}</span>
            </div>
          </div>

          {/* Students */}
          <Accordion className="mb-4">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="students-content"
              id="students-header"
              className="bg-white rounded-t-lg"
            >
              <h2 className="text-xl font-heading">
                {t('teacher:worklog.groups.students.title')}
              </h2>
            </AccordionSummary>

            <AccordionDetails className="bg-white rounded-b-lg">
              <div className="pt-2">
                <div
                  className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
                  {groupDetails.students.map(student => (
                    <div
                      key={student.userid}
                      className="p-4 transition-colors border rounded-lg hover:bg-gray-50 font-body"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <p className="font-medium">
                            {student.first_name} {student.last_name}
                          </p>
                          <p
                            className="text-xs text-gray-600 break-all">{student.email}</p>
                        </div>

                        <button
                          onClick={() => handleRemoveStudent(student.userid)}
                          className="text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
                          title={t('teacher:worklog.groups.removeStudent')}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {studentList.length > 0 && (
                    <div
                      className="relative flex items-center justify-center h-full p-5 bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300"
                      onClick={handleOpenModal}
                    >
                      <button className="flex flex-col items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          className="w-8 h-8 mb-2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        <span className="mt-1 text-sm text-gray-600">
                      {t('teacher:worklog.groups.addToGroup')}
                    </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </AccordionDetails>
          </Accordion>

          {/* Entries */}
          {groupDetails.entries.length > 0 && (
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="entries-content"
                id="entries-header"
                className="bg-white rounded-t-lg"
              >
                <h2 className="text-2xl font-heading">
                  {t('teacher:worklog.groups.entries')}
                </h2>
              </AccordionSummary>

              <AccordionDetails className="bg-white rounded-b-lg">
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                    <tr className="text-gray-600 border-b font-body">
                      <th
                        className="p-3 text-left">{t('teacher:worklog.entries.name')}</th>
                      <th
                        className="p-3 text-left">{t('teacher:worklog.entries.date')}</th>
                      <th
                        className="p-3 text-left">{t('teacher:worklog.entries.hours')}</th>
                      <th
                        className="p-3 text-left">{t('teacher:worklog.entries.description')}</th>
                      <th
                        className="p-3 text-left">{t('teacher:worklog.entries.status')}</th>
                      <th
                        className="p-3 text-left">{t('teacher:worklog.entries.actions')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {groupDetails.entries.map(entry => (
                      <tr key={entry.entry_id}
                          className="border-b hover:bg-gray-50 font-body">
                        <td
                          className="p-3">{entry.first_name} {entry.last_name}</td>
                        <td
                          className="p-3">{new Date(entry.start_time).toLocaleDateString()}</td>
                        <td className="p-3">
                          {(
                            (new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()) /
                            (1000 * 60 * 60)
                          ).toFixed(1)}
                        </td>
                        <td className="p-3">{entry.description}</td>
                        <td
                          className="p-3">{t(`teacher:worklog.status.${entry.status}`)}</td>
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
                    ))}
                    </tbody>
                  </table>
                </div>
              </AccordionDetails>
            </Accordion>
          )}
        </div>
      </div>

      {/* Add students modal */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm"
              fullWidth>
        <DialogTitle
          className="flex items-center justify-center text-center font-heading">
          {t('teacher:worklog.groups.addStudentsToGroup')}
        </DialogTitle>

        <DialogContent className="flex flex-col items-center text-center">
          <div
            className="w-full max-w-md mx-auto max-h-[400px] overflow-y-auto space-y-2 p-4">
            {studentList.map(student => (
              <div
                key={student.userid}
                className={[
                  'relative p-3 border rounded-lg cursor-pointer transition-all duration-200',
                  selectedStudents.includes(student.userid)
                    ? 'border-metropolia-main-orange bg-orange-50'
                    : 'border-gray-200 hover:border-metropolia-main-orange/50',
                ].join(' ')}
                onClick={() => {
                  setSelectedStudents(prev =>
                    prev.includes(student.userid)
                      ? prev.filter(id => id !== student.userid)
                      : [...prev, student.userid],
                  );
                }}
              >
                <div className="flex items-center justify-center">
                  <div className="font-medium text-center font-body">
                    {student.first_name} {student.last_name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>

        <DialogActions sx={{justifyContent: 'center'}} className="w-full p-4">
          <div className="flex items-center justify-center gap-4">
            <Button onClick={handleCloseModal} variant="outlined"
                    className="font-body" sx={{margin: 0}}>
              {t('teacher:worklog.groups.back')}
            </Button>

            <button
              onClick={() => {
                const token = localStorage.getItem('userToken');
                if (!token) {
                  toast.error(t('teacher:toasts.error.tokenMissing'));
                  return;
                }

                apiHooks
                  .addStudentsToWorkLogGroup(Number(groupId), selectedStudents, token)
                  .then(async () => {
                    toast.success(t('teacher:worklog.groups.studentsAdded'));
                    await fetchGroupDetails();
                    onGroupUpdated?.();
                  })
                  .catch(() => {
                    toast.error(t('teacher:toasts.error.addStudentsFailed'));
                  })
                  .finally(() => {
                    handleCloseModal();
                  });
              }}
              disabled={selectedStudents.length === 0}
              className={[
                'px-2 py-1 font-heading text-white transition rounded bg-metropolia-main-orange h-fit hover:bg-metropolia-secondary-orange sm:py-2 sm:px-4',
                selectedStudents.length === 0 ? 'opacity-50 cursor-not-allowed' : '',
              ].join(' ')}
            >
              {t('teacher:worklog.groups.addStudents')}
            </button>
          </div>
        </DialogActions>
      </Dialog>

      {/* Remove student confirm */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({
          open: false,
          studentId: null,
          studentName: '',
        })}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {t('teacher:studentList.dialog.title')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t('teacher:studentList.dialog.message')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({
            open: false,
            studentId: null,
            studentName: '',
          })}>
            {t('teacher:studentList.buttons.cancel')}
          </Button>
          <Button onClick={handleConfirmRemove} color="error" autoFocus>
            {t('teacher:studentList.buttons.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete entry confirm */}
      <Dialog
        open={deleteEntryDialog.open}
        onClose={() => setDeleteEntryDialog({
          open: false,
          entryId: null,
          entryDate: '',
        })}
        aria-labelledby="delete-entry-dialog-title"
        aria-describedby="delete-entry-dialog-description"
      >
        <DialogTitle id="delete-entry-dialog-title">
          {t('teacher:worklog.entries.confirmDelete')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-entry-dialog-description">
            {t('teacher:worklog.entries.confirmDeleteMessage', {date: deleteEntryDialog.entryDate})}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteEntryDialog({
            open: false,
            entryId: null,
            entryDate: '',
          })}>
            {t('cancel')}
          </Button>
          <Button onClick={handleConfirmDeleteEntry} color="error" autoFocus>
            {t('delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WorklogGroupPanel;
