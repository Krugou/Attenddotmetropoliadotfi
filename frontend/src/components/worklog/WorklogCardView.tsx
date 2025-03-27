import React from 'react';
import {useTranslation} from 'react-i18next';
import dayjs from 'dayjs';
import {WorkLogEntry} from '../../types/worklog';
import {calculateDuration} from '../../utils/timeUtils';

interface WorklogCardViewProps {
  entries: WorkLogEntry[];
  setSelectedEntry: (entry: WorkLogEntry | null) => void;
  setIsModalOpen: (isOpen: boolean) => void;
}

const WorklogCardView: React.FC<WorklogCardViewProps> = ({entries}) => {
  const {t} = useTranslation(['common', 'teacher']);

  const statusClass = (status: number) => {
    return `inline-flex px-2 py-1 text-xs font-medium rounded-full ${
      status === 1
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-green-100 text-green-800'
    }`;
  };

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {entries.map((entry) => (
        <div
          key={entry.entry_id}
          className='relative overflow-hidden transition-shadow duration-300 bg-metropolia-support-white rounded-lg shadow-lg hover:shadow-xl'>
          <div className='p-4 pt-10'>
            <div className='flex items-center justify-between mb-4'>
              <div className='text-lg font-semibold text-metropolia-main-grey'>
                {/* if code is '' then show practicum on where code is from translation */}
                {entry.course?.name} -{' '}
                {entry.course?.code === ''
                  ? t('common:practicum')
                  : entry.course?.code}
              </div>
              <div className='text-sm text-metropolia-main-grey'>
                {dayjs(entry.start_time).format('YYYY-MM-DD')}
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span className='text-sm text-metropolia-main-grey'>
                  {t('common:worklog.entries.time')}:
                </span>
                <span className='text-sm font-medium'>
                  {dayjs(entry.start_time).format('HH:mm')} -{' '}
                  {dayjs(entry.end_time).format('HH:mm')}
                </span>
              </div>

              <div className='flex justify-between'>
                <span className='text-sm text-metropolia-main-grey'>
                  {t('common:worklog.entries.duration')}:
                </span>
                <span className='text-sm font-medium'>
                  {calculateDuration(entry.start_time, entry.end_time)}
                </span>
              </div>

              <div className='pt-2 mt-2 border-t'>
                <p className='text-sm text-metropolia-main-grey line-clamp-2'>
                  {entry.description}
                </p>
              </div>
              <div className='flex items-center justify-between pt-2 mt-2 border-t'>
                <span className={statusClass(entry.status)}>
                  {t(`teacher:worklog.status.${entry.status}`)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorklogCardView;
