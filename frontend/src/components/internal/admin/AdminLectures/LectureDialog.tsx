import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';

interface LectureDialogProps {
  open: boolean;
  action: 'close' | 'delete' | null;
  onClose: () => void;
  onConfirm: () => void;
  t: (key: string) => string;
}

const LectureDialog: React.FC<LectureDialogProps> = ({
                                                       open,
                                                       action,
                                                       onClose,
                                                       onConfirm,
                                                       t,
                                                     }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {action
          ? `${t('admin:TeacherLectures.dialog.dialogTitlePrefix')} ${action} ${t(
            'admin:TeacherLectures.dialog.dialogTitleSuffix',
          )}`
          : ''}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t('admin:TeacherLectures.dialog.dialogText')}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='primary'>
          {t('admin:ui.cancel')}
        </Button>
        <Button onClick={onConfirm} color='primary' autoFocus>
          {t('admin:ui.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LectureDialog;
