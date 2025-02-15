import {useTranslation} from 'react-i18next';
import {SortField} from './types';

export const useColumnConfig = () => {
  const {t} = useTranslation();

  const columns = [
    {key: 'name', label: t('common:name'), defaultVisible: true},
    {key: 'courseName', label: t('common:course'), defaultVisible: true},
    {key: 'code', label: t('common:courseCode'), defaultVisible: false},
    {key: 'email', label: t('common:email'), defaultVisible: true},
    {
      key: 'studentNumber',
      label: t('common:studentNumber'),
      defaultVisible: true,
    },
    {key: 'groupName', label: t('common:group'), defaultVisible: true},
    {
      key: 'attendance.total',
      label: t('common:totalLectures'),
      defaultVisible: true,
    },
    {
      key: 'attendance.attended',
      label: t('common:attendedLectures'),
      defaultVisible: true,
    },
    {
      key: 'attendance.percentage',
      label: t('common:attendancePercentage'),
      defaultVisible: true,
    },
    {
      key: 'attendance.lastAttendance',
      label: t('common:lastAttendance'),
      defaultVisible: true,
    },
  ];

  return columns;
};
