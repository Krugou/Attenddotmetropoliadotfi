import React, {useEffect, useState} from 'react';
import {useParams, Link} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import apiHooks from '../../../../../api';
import GeneralLinkButton from '../../../../../components/main/buttons/GeneralLinkButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContentText from '@mui/material/DialogContentText';

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
    first_name: string;
    last_name: string;
    entry_id: number;
    start_time: string;
    end_time: string;
    description: string;
    status: number;
    user_id: number;
  }[];
}

interface Student {
  userid: number;
  first_name: string;
  last_name: string;
  email: string;
}

const TeacherWorklogCourseGroup: React.FC = () => {
  const {t} = useTranslation(['translation']);
  const {courseid, groupid} = useParams<{courseid: string; groupid: string}>();
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [studentList, setStudentList] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    studentId: number | null;
    studentName: string;
  }>({
    open: false,
    studentId: null,
    studentName: '',
  });

  const fetchGroupDetails = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token || !courseid || !groupid) {
        throw new Error('Missing required parameters');
      }

      const list = await apiHooks.getWorkLogStudentsByCourse(courseid, token);

      const details = await apiHooks.getWorkLogGroupDetails(
        Number(courseid),
        Number(groupid),
        token,
      );

      const studentsWithGroupCheck = await Promise.all(
        list.students.map(async (student) => {
          const existingGroup = await apiHooks.checkStudentExistingGroup(
            student.userid,
            Number(courseid),
            token,
          );
          return {...student, existingGroup};
        }),
      );

      // Filter out students who are already in any group
      const availableStudents = studentsWithGroupCheck.filter(
        (student) => !student.existingGroup,
      );

      setStudentList(availableStudents);
      setGroupDetails(details);
    } catch (error) {
      console.error('Error fetching group details:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
  }, [courseid, groupid]);

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-xl font-body'>Loading...</div>
      </div>
    );
  }

  if (!groupDetails) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-xl text-red-500 font-body'>
          {t('teacher:worklog.errors.groupNotFound')}
        </div>
      </div>
    );
  }

  const totalHours = groupDetails.entries.reduce((acc, entry) => {
    const hours =
      (new Date(entry.end_time).getTime() -
        new Date(entry.start_time).getTime()) /
      (1000 * 60 * 60);
    return acc + hours;
  }, 0);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleRemoveStudent = async (studentId: number) => {
    const student = groupDetails?.students.find((s) => s.userid === studentId);
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
    } catch (error) {
      console.error('Error removing student:', error);
      toast.error(t('teacher:worklog.groups.errors.failedToRemove'));
    } finally {
      setConfirmDialog({open: false, studentId: null, studentName: ''});
    }
  };

  return (
    <>
      <div className='container max-w-6xl px-4 py-8 mx-auto bg-gray-100 rounded-lg'>
        <div className='flex gap-4 mb-6'>
          <GeneralLinkButton
            path={`/teacher/worklog/group/${courseid}`}
            text={t('teacher:worklog.detail.backToCourse')}
          />
          <GeneralLinkButton
            path={`/teacher/worklog`}
            text={t('teacher:worklog.detail.backToWorklog')}
          />
        </div>
        <div className='p-6 mb-8 bg-white rounded-lg shadow-sm'>
          <h1 className='mb-4 text-3xl font-heading'>
            {groupDetails.group.group_name}
          </h1>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            <div className='font-body'>
              <p className='text-gray-600'>
                {t('teacher:worklog.details.name')}
              </p>
              <p className='font-medium'>{groupDetails.course.name}</p>
            </div>
            <div className='font-body'>
              <p className='text-gray-600'>
                {t('teacher:worklog.details.code')}
              </p>
              <p className='font-medium'>{groupDetails.course.code}</p>
            </div>
            <div className='font-body'>
              <p className='text-gray-600'>
                {t('teacher:worklog.details.requiredHours')}
              </p>
              <p className='font-medium'>
                {groupDetails.course.required_hours}h
              </p>
            </div>
          </div>
        </div>

        <div className='grid gap-4 mb-8 md:grid-cols-3'>
          <div className='p-6 bg-white rounded-lg shadow-sm'>
            <h3 className='mb-2 text-lg font-heading'>
              {t('teacher:worklog.groups.studentCount', {
                count: groupDetails.students.length,
              })}
            </h3>
          </div>
          <div className='p-6 bg-white rounded-lg shadow-sm'>
            <h3 className='mb-2 text-lg font-heading'>
              {t('common:worklog.entries.total')}: {totalHours.toFixed(1)}h
            </h3>
          </div>
          <div className='p-6 bg-white rounded-lg shadow-sm'>
            <h3 className='mb-2 text-lg font-heading'>
              {t('common:worklog.entries.entries')}:{' '}
              {groupDetails.entries.length}
            </h3>
          </div>
          <GeneralLinkButton
            path={`/teacher/worklog/group/${courseid}/${groupid}/stats`}
            text={t('teacher:worklog.groups.stats')}
          />
        </div>

        <Accordion className='mb-4'>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls='students-content'
            id='students-header'
            className='bg-white rounded-t-lg'>
            <h2 className='text-2xl font-heading'>
              {t('teacher:worklog.groups.students.title')}
            </h2>
          </AccordionSummary>
          <AccordionDetails className='bg-white rounded-b-lg'>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr'>
              {groupDetails.students.map((student) => (
                <div
                  key={student.userid}
                  className='p-4 transition-colors border rounded-lg hover:bg-gray-50 font-body'>
                  <div className='flex justify-between items-center'>
                    <div>
                      <p className='font-medium'>
                        {student.first_name} {student.last_name}
                      </p>
                      <p className='text-sm text-gray-600'>{student.email}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveStudent(student.userid)}
                      className='text-red-600 hover:text-red-800 transition-colors'
                      title={t('common:remove')}>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-5 w-5'
                        viewBox='0 0 20 20'
                        fill='currentColor'>
                        <path
                          fillRule='evenodd'
                          d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              {studentList.length > 0 && (
                <div
                  className='relative flex items-center justify-center h-full p-5 bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300'
                  onClick={handleOpenModal}>
                  <button className='flex flex-col items-center'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                      className='w-8 h-8 mb-2'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                      />
                    </svg>
                    <span className='mt-1 text-sm text-gray-600'>
                      {t('teacher:worklog.groups.addToGroup')}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </AccordionDetails>
        </Accordion>

        {groupDetails.entries.length > 0 && (
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls='entries-content'
              id='entries-header'
              className='bg-white rounded-t-lg'>
              <h2 className='text-2xl font-heading'>
                {t('teacher:worklog.groups.entries')}
              </h2>
            </AccordionSummary>
            <AccordionDetails className='bg-white rounded-b-lg'>
              <div className='overflow-x-auto'>
                <table className='w-full table-auto'>
                  <thead>
                    <tr className='text-gray-600 border-b font-body'>
                      <th className='p-3 text-left'>
                        {t('teacher:worklog.entries.name')}
                      </th>
                      <th className='p-3 text-left'>
                        {t('teacher:worklog.entries.date')}
                      </th>
                      <th className='p-3 text-left'>
                        {t('teacher:worklog.entries.hours')}
                      </th>
                      <th className='p-3 text-left'>
                        {t('teacher:worklog.entries.description')}
                      </th>
                      <th className='p-3 text-left'>
                        {t('teacher:worklog.entries.status')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupDetails.entries.map((entry) => (
                      <tr
                        key={entry.entry_id}
                        className='border-b hover:bg-gray-50 font-body'>
                        <td className='p-3'>
                          {entry.first_name} {entry.last_name}
                        </td>
                        <td className='p-3'>
                          {new Date(entry.start_time).toLocaleDateString()}
                        </td>
                        <td className='p-3'>
                          {(
                            (new Date(entry.end_time).getTime() -
                              new Date(entry.start_time).getTime()) /
                            (1000 * 60 * 60)
                          ).toFixed(1)}
                        </td>
                        <td className='p-3'>{entry.description}</td>
                        <td className='p-3'>
                          {t(`teacher:worklog.status.${entry.status}`)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AccordionDetails>
          </Accordion>
        )}
        <Dialog
          open={isModalOpen}
          onClose={handleCloseModal}
          maxWidth='sm'
          fullWidth>
          <DialogTitle className='flex items-center justify-center text-center font-heading'>
            add students to group
          </DialogTitle>
          <DialogContent className='flex flex-col items-center text-center'>
            <div className='w-full max-w-md mx-auto max-h-[400px] overflow-y-auto space-y-2 p-4'>
              {studentList.map((student) => (
                <div
                  key={student.userid}
                  className={`relative p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedStudents.includes(student.userid)
                      ? 'border-metropolia-main-orange bg-orange-50'
                      : 'border-gray-200 hover:border-metropolia-main-orange/50'
                  }`}
                  onClick={() => {
                    if (selectedStudents.includes(student.userid)) {
                      setSelectedStudents(
                        selectedStudents.filter((id) => id !== student.userid),
                      );
                    } else {
                      setSelectedStudents([
                        ...selectedStudents,
                        student.userid,
                      ]);
                    }
                  }}>
                  <div className='flex items-center justify-center'>
                    <div className='font-medium text-center font-body'>
                      {`${student.first_name} ${student.last_name}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
          <DialogActions sx={{justifyContent: 'center'}} className='w-full p-4'>
            <div className='flex items-center justify-center gap-4'>
              <Button
                onClick={handleCloseModal}
                variant='outlined'
                className='font-body'
                sx={{margin: 0}}>
                {t('teacher:worklog.groups.back')}
              </Button>
              <button
                onClick={() => {
                  const token = localStorage.getItem('userToken');
                  if (token) {
                    apiHooks
                      .addStudentsToWorkLogGroup(
                        Number(groupid),
                        selectedStudents,
                        token,
                      )
                      .then(() => {
                        toast.success(
                          t('teacher:worklog.groups.studentsAdded'),
                        );
                        fetchGroupDetails();
                      })
                      .catch((error) => {
                        toast.error('Failed to add students');
                        console.error(error);
                      });
                  } else {
                    toast.error('User token is missing');
                  }
                  handleCloseModal();
                }}
                disabled={selectedStudents.length === 0}
                className={`px-2 py-1 font-heading text-white transition rounded bg-metropolia-main-orange h-fit hover:bg-metropolia-secondary-orange sm:py-2 sm:px-4 focus:outline-hidden focus:shadow-outline ${
                  selectedStudents.length === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}>
                {t('teacher:worklog.groups.addStudents')}
              </button>
            </div>
          </DialogActions>
        </Dialog>
      </div>
      <Dialog
        open={confirmDialog.open}
        onClose={() =>
          setConfirmDialog({open: false, studentId: null, studentName: ''})
        }
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'>
        <DialogTitle id='alert-dialog-title'>
          {t('teacher:studentList.dialog.title')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            {t('teacher:studentList.dialog.message')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setConfirmDialog({open: false, studentId: null, studentName: ''})
            }>
            {t('teacher:studentList.buttons.cancel')}
          </Button>
          <Button onClick={handleConfirmRemove} color='error' autoFocus>
            {t('teacher:studentList.buttons.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TeacherWorklogCourseGroup;
