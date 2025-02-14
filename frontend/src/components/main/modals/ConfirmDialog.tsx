import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import React from 'react';
import {useTranslation} from 'react-i18next';

interface ConfirmDialogProps {
  title: string;
  children: React.ReactNode;
  open: boolean;
  setOpen: (value: boolean) => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  children,
  open,
  setOpen,
  onConfirm,
  confirmText,
  cancelText,
}) => {
  const {t} = useTranslation(['teacher']);

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby='confirm-dialog'>
      <DialogTitle
        className='p-4 text-white bg-metropolia-main-orange'
        id='confirm-dialog'>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText className='pt-2 ' id='confirm-dialog-description'>
          {children}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <button
          className='w-full p-2 mt-4 text-sm font-heading text-white transition rounded-sm bg-metropolia-main-orange sm:w-fit h-fit hover:bg-metropolia-secondary-orange'
          onClick={handleClose}>
          {cancelText || t('common:dialog.cancel')}
        </button>
        <button
          className='w-full p-2 mt-4 text-sm font-heading text-white transition rounded-sm bg-metropolia-support-red sm:w-fit h-fit hover:bg-metropolia-support-red'
          onClick={handleConfirm}
          autoFocus>
          {confirmText || t('common:dialog.confirm')}
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
