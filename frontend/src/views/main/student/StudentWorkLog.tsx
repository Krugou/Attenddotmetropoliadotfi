import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import {
  LoginRounded as LoginIcon,
  LogoutRounded as LogoutIcon,
  EditRounded as EditIcon,
} from '@mui/icons-material';
import {useNavigate} from 'react-router-dom';
const StudentWorkLog: React.FC = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const handleClockIn = useCallback(() => {
    const time = new Date().toLocaleTimeString();
    toast.success(`Clocked in at ${time}`);
  }, []);

  const handleClockOut = useCallback(() => {
    const time = new Date().toLocaleTimeString();
    toast.info(`Clocked out at ${time}`);
  }, []);

  const handleEdit = useCallback(() => {
    const time = new Date().toLocaleTimeString();
    toast.info(`Edit clicked at ${time}`);
    navigate('/student/worklogs');
  }, [navigate]);

  const buttonBaseStyle = `
    flex items-center justify-center gap-2
    px-6 py-2 rounded-lg text-lg m-3
    font-sans font-medium text-white
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `;

  return (
    <div className='flex items-center justify-center min-h-[50vh]'>
      <div className='flex flex-col gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm'>
        <button
          onClick={handleClockIn}
          className={`${buttonBaseStyle}
            bg-metropoliaMainOrange hover:bg-metropoliaSecondaryOrange
            focus:ring-metropoliaMainOrange`}
          aria-label={t('worklog.clockIn')}>
          <LoginIcon />
          <span>{t('worklog.actions.in')}</span>
        </button>

        <button
          onClick={handleClockOut}
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
    </div>
  );
};

export default StudentWorkLog;
