import React from 'react';
import {useTranslation} from 'react-i18next';
import dayjs from 'dayjs';
import {WorkLogEntry} from '../../types/worklog';
import {calculateDuration} from '../../utils/timeUtils';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

interface WorklogTableViewProps {
  entries: WorkLogEntry[];
}

const WorklogTableView: React.FC<WorklogTableViewProps> = ({entries}) => {
  const {t} = useTranslation(['common', 'teacher']);

  const statusClass = (status: number) => {
    return `inline-flex px-2 py-1 text-xs font-medium rounded-full ${
      status === 1
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-green-100 text-green-800'
    }`;
  };

  return (
    <TableContainer component={Paper} className='mt-4'>
      <Table>
        <TableHead>
          <TableRow className='bg-metropolia-support-white'>
            <TableCell>{t('common:worklog.table.date')}</TableCell>
            <TableCell>{t('common:worklog.table.course')}</TableCell>
            <TableCell>{t('common:worklog.table.time')}</TableCell>
            <TableCell>{t('common:worklog.table.duration')}</TableCell>
            <TableCell>{t('common:worklog.table.description')}</TableCell>
            <TableCell>{t('common:worklog.table.status')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.entry_id} hover>
              <TableCell>
                {dayjs(entry.start_time).format('YYYY-MM-DD')}
              </TableCell>
              <TableCell>
                {entry.course?.name} - {entry.course?.code}
              </TableCell>
              <TableCell>
                {dayjs(entry.start_time).format('HH:mm')} -{' '}
                {dayjs(entry.end_time).format('HH:mm')}
              </TableCell>
              <TableCell>
                {calculateDuration(entry.start_time, entry.end_time)}
              </TableCell>
              <TableCell className='max-w-xs'>
                <div className='line-clamp-2'>{entry.description}</div>
              </TableCell>
              <TableCell>
                <span className={statusClass(entry.status)}>
                  {t(`teacher:worklog.status.${entry.status}`)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default WorklogTableView;
