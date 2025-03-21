import React from 'react';
import {Dialog} from '@mui/material';
import {useTranslation} from 'react-i18next';
import dayjs from 'dayjs';

interface WorkLogEntry {
  description: string;
  start_time: string;
  end_time: string;
  status: number;
}

interface EditWorklogModalProps {
  open: boolean;
  onClose: () => void;
  entry: WorkLogEntry | null;
  onSave: (updatedEntry: Partial<WorkLogEntry>) => Promise<void>;
}

const EditWorklogModal: React.FC<EditWorklogModalProps> = ({
  open,
  onClose,
  entry,
  onSave,
}) => {
  const {t} = useTranslation(['common']);
  const [description, setDescription] = React.useState(
    entry?.description || '',
  );
  const [startTime, setStartTime] = React.useState(entry?.start_time || '');
  const [endTime, setEndTime] = React.useState(entry?.end_time || '');
  const [status, setStatus] = React.useState(entry?.status || 1);

  React.useEffect(() => {
    if (entry) {
      setDescription(entry.description);
      setStartTime(dayjs(entry.start_time).format('YYYY-MM-DDTHH:mm'));
      setEndTime(dayjs(entry.end_time).format('YYYY-MM-DDTHH:mm'));
      setStatus(entry.status);
    }
  }, [entry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      description,
      start_time: startTime,
      end_time: endTime,
      status,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <div className='p-6'>
        <h2 className='mb-4 text-xl font-heading text-metropolia-main-orange'>
          {t('common:worklog.edit.title')}
        </h2>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block mb-1 text-sm text-metropolia-main-grey'>
              {t('common:worklog.entries.startTime')}
            </label>
            <input
              title={t('common:worklog.entries.startTime')}
              type='datetime-local'
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className='w-full p-2 border rounded-sm'
            />
          </div>
          <div>
            <label className='block mb-1 text-sm text-metropolia-main-grey'>
              {t('common:worklog.entries.endTime')}
            </label>
            <input
              title={t('common:worklog.entries.endTime')}
              type='datetime-local'
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className='w-full p-2 border rounded-sm'
            />
          </div>
          <div>
            <label className='block mb-1 text-sm text-metropolia-main-grey'>
              {t('common:worklog.entries.description')}
            </label>
            <textarea
              title={t('common:worklog.entries.description')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='w-full p-2 border rounded-sm'
              rows={3}
            />
          </div>
          <div>
            <label className='block mb-1 text-sm text-metropolia-main-grey'>
              {t('teacher:worklog.entries.status')}
            </label>
            <select
              title={t('teacher:worklog.entries.status')}
              value={status}
              onChange={(e) => setStatus(Number(e.target.value))}
              className='w-full p-2 border rounded-sm'>
              <option value={1}>{t('teacher:worklog.status.1')}</option>
              <option value={2}>{t('teacher:worklog.status.2')}</option>
            </select>
          </div>
          <div className='flex justify-end gap-2 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-sm text-gray-600 border rounded-sm hover:bg-gray-50'>
              {t('common:cancel')}
            </button>
            <button
              type='submit'
              className='px-4 py-2 text-sm text-white rounded-sm bg-metropolia-main-orange hover:bg-metropolia-main-orange/90'>
              {t('common:save')}
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};

export default EditWorklogModal;
