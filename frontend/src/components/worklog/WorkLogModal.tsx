import React from 'react';
import {useTranslation} from 'react-i18next';

interface WorkLogModalProps {
  isOpen: boolean;
  actionType: 'in' | 'out';
  description: string;
  onDescriptionChange: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

const WorkLogModal: React.FC<WorkLogModalProps> = ({
  isOpen,
  actionType,
  description,
  onDescriptionChange,
  onConfirm,
  onClose,
}) => {
  const {t} = useTranslation(['common']);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm'>
      <div className='w-full max-w-md m-4 bg-white rounded-2xl shadow-2xl transform transition-all'>
        <div className='p-6 space-y-6'>
          <h3 className='text-xl font-heading font-bold text-gray-800'>
            {actionType === 'in'
              ? t('common:worklog.clockIn')
              : t('common:worklog.clockOut')}
          </h3>

          {actionType === 'in' && (
            <label className='block space-y-2'>
              <span className='font-body font-medium text-gray-700'>
                {t('common:worklog.description')} *
              </span>
              <input
                type='text'
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                className='w-full p-3 border-2 rounded-lg font-body
                  focus:border-metropolia-main-orange focus:ring-2 focus:ring-metropolia-main-orange/20
                  transition-colors duration-200'
                required
                placeholder={t('common:worklog.requiredDescription')}
              />
            </label>
          )}

          <div className='flex gap-4 pt-4'>
            <button
              onClick={onConfirm}
              disabled={actionType === 'in' && !description.trim()}
              className='flex-1 px-6 py-3 font-body text-white rounded-lg
                bg-metropolia-main-orange hover:bg-metropolia-secondary-orange
                disabled:bg-gray-400 font-bold disabled:cursor-not-allowed
                transition-colors duration-200'>
              {t('common:confirm')}
            </button>
            <button
              onClick={onClose}
              className='flex-1 px-6 py-3 font-body font-medium text-gray-700 rounded-lg
                bg-gray-100 hover:bg-gray-200
                transition-colors duration-200'>
              {t('common:cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkLogModal;
