import React from 'react';
import {useTranslation} from 'react-i18next';
import {
  LoginRounded as LoginIcon,
  LogoutRounded as LogoutIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
interface WorkLogActionButtonsProps {
  hasActiveEntry: boolean;
  onOpenModal: (type: 'in' | 'out') => void;
  onEdit: () => void;
  showButtons: boolean;
}

const WorkLogActionButtons: React.FC<WorkLogActionButtonsProps> = ({
  hasActiveEntry,
  onOpenModal,
  onEdit,
  showButtons,
}) => {
  const {t} = useTranslation(['common']);

  const buttonBaseStyle = `
    flex items-center justify-center gap-3
    w-full px-6 py-3 rounded-lg
    font-body text-xl font-medium text-metropolia-support-white
    transition-all duration-300 ease-in-out
    shadow-md hover:shadow-lg
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    transform hover:scale-[1.02]
  `;

  if (!showButtons) return null;

  return (
    <div className='space-y-4'>
      <div>
        {!hasActiveEntry && (
          <button
            onClick={() => onOpenModal('in')}
            disabled={hasActiveEntry}
            className={`${buttonBaseStyle} ${
              hasActiveEntry
                ? 'bg-gray-400'
                : 'bg-metropolia-main-orange hover:bg-metropolia-secondary-orange'
            }`}
            aria-label={t('common:worklog.clockIn')}>
            <LoginIcon className='w-6 h-6' />
            <span>{t('common:worklog.actions.in')}</span>
          </button>
        )}
        {hasActiveEntry && (
          <button
            onClick={() => onOpenModal('out')}
            disabled={!hasActiveEntry}
            className={`${buttonBaseStyle} ${
              !hasActiveEntry
                ? 'bg-gray-400'
                : 'bg-metropolia-support-red hover:bg-metropolia-support-secondary-red'
            }`}
            aria-label={t('common:worklog.clockOut')}>
            <LogoutIcon className='w-6 h-6' />
            <span>{t('common:worklog.actions.out')}</span>
          </button>
        )}
      </div>
      <button
        onClick={onEdit}
        className={`${buttonBaseStyle}
          bg-metropolia-trend-green hover:bg-metropolia-trend-green/90`}
        aria-label={t('common:worklog.actions.view')}>
        <AssignmentIcon className='w-6 h-6' />
        <span>{t('common:worklog.actions.view')}</span>
      </button>
    </div>
  );
};

export default WorkLogActionButtons;
