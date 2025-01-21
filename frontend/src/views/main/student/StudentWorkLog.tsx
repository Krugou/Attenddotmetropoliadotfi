import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import {
  LoginRounded as LoginIcon,
  LogoutRounded as LogoutIcon,
  EditRounded as EditIcon,
} from '@mui/icons-material';
import {useNavigate} from 'react-router-dom';
import {Modal, TextField, Button} from '@mui/material';

const StudentWorkLog: React.FC = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [actionType, setActionType] = useState<'in' | 'out'>('in');

  const handleOpenModal = useCallback((type: 'in' | 'out') => {
    setActionType(type);
    setReason(
      type === 'in' ? 'Reason for clocking in' : 'Reason for clocking out',
    );
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleConfirmAction = useCallback(() => {
    const time = new Date().toLocaleTimeString();
    if (actionType === 'in') {
      toast.success(`Clocked in at ${time} with reason: ${reason}`);
    } else {
      toast.info(`Clocked out at ${time} with reason: ${reason}`);
    }
    setIsModalOpen(false);
  }, [actionType, reason]);

  const handleEdit = useCallback(() => {
    const time = new Date().toLocaleTimeString();
    toast.info(`Edit clicked at ${time}`);
    navigate('/student/worklogs');
  }, [navigate]);

  const buttonBaseStyle = `
    flex items-center justify-center gap-2
    px-6 py-2 rounded-lg text-lg m-3
    font-body font-medium text-white
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `;

  return (
    <div className='flex items-center justify-center min-h-[50vh]'>
      <div className='flex flex-col gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm'>
        <button
          onClick={() => handleOpenModal('in')}
          className={`${buttonBaseStyle}
            bg-metropoliaMainOrange hover:bg-metropoliaSecondaryOrange
            focus:ring-metropoliaMainOrange`}
          aria-label={t('worklog.clockIn')}>
          <LoginIcon />
          <span>{t('worklog.actions.in')}</span>
        </button>

        <button
          onClick={() => handleOpenModal('out')}
          className={`${buttonBaseStyle}
            bg-metropoliaSupportRed hover:bg-metropoliaSupportSecondaryRed
            focus:ring-metropoliaSupportRed`}
          aria-label={t('worklog.clockOut')}>
          <LogoutIcon />
          <span>{t('worklog.actions.out')}</span>
        </button>

        <button
          onClick={handleEdit}
          className={`${buttonBaseStyle}
            bg-metropoliaTrendGreen hover:bg-metropoliaTrendGreen/80
            focus:ring-metropoliaTrendGreen`}
          aria-label={t('worklog.edit')}>
          <EditIcon />
          <span>{t('worklog.actions.edit')}</span>
        </button>
      </div>

      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <div className='flex flex-col gap-4 p-4 bg-white rounded-lg shadow-lg'>
          <TextField
            label={t('worklog.reason')}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
          />
          <Button
            onClick={handleConfirmAction}
            variant='contained'
            color='primary'>
            {t('common.confirm')}
          </Button>
          <Button
            onClick={handleCloseModal}
            variant='outlined'
            color='secondary'>
            {t('common.cancel')}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default StudentWorkLog;
