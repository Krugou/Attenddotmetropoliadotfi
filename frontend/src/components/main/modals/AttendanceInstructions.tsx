import {Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import React from 'react';
import {useTranslation} from 'react-i18next';

interface AttendanceInstructionsProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
}

const AttendanceInstructions: React.FC<AttendanceInstructionsProps> = ({
  dialogOpen,
  setDialogOpen,
}) => {
  const {t} = useTranslation();

  return (
    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
      <DialogTitle className='p-4 text-white bg-metropoliaMainOrange'>
        {t('teacher.attendanceInstructions.title')}
      </DialogTitle>
      <DialogContent>
        <p className='mt-2 mb-4'>{t('teacher.attendanceInstructions.intro')}</p>
        <ol className='space-y-4 list-decimal list-inside'>
          <li>{t('teacher.attendanceInstructions.instructions.timer')}</li>
          <li>
            {t('teacher.attendanceInstructions.instructions.studentList')}
          </li>
          <li>{t('teacher.attendanceInstructions.instructions.navigation')}</li>
          <li>
            {t('teacher.attendanceInstructions.instructions.manualAttendance')}
          </li>
          <li>
            {t('teacher.attendanceInstructions.instructions.finishLecture')}
          </li>
          <li>
            {t('teacher.attendanceInstructions.instructions.cancelLecture')}
          </li>
        </ol>
      </DialogContent>
      <DialogActions>
        <button
          className='w-full p-2 mt-4 text-sm font-heading text-white transition rounded bg-metropoliaMainOrange sm:w-fit h-fit hover:bg-metropoliaSecondaryOrange'
          onClick={() => setDialogOpen(false)}>
          {t('teacher.attendanceInstructions.buttons.close')}
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default AttendanceInstructions;
