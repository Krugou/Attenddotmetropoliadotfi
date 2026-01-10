import {useTranslation} from 'react-i18next';

export const useColumnConfig = () => {
  const {t} = useTranslation();

  const columns = [
    {key: 'name', label: t('name'), defaultVisible: true},
    {key: 'courseName', label: t('course'), defaultVisible: true},
    {key: 'code', label: t('courseCode'), defaultVisible: true},
    {key: 'email', label: t('email'), defaultVisible: false},
    {
      key: 'studentNumber',
      label: t('studentNumber'),
      defaultVisible: true,
    },
    {key: 'groupName', label: t('group'), defaultVisible: true},
    {
      key: 'attendance.total',
      label: t('totalLectures'),
      defaultVisible: false,
    },
    {
      key: 'attendance.attended',
      label: t('attendedLectures'),
      defaultVisible: false,
    },
    {
      key: 'attendance.percentage',
      label: t('attendancePercentage'),
      defaultVisible: true,
    },
    {
      key: 'attendance.lastAttendance',
      label: t('lastAttendance'),
      defaultVisible: false,
    },
  ];

  return columns;
};
