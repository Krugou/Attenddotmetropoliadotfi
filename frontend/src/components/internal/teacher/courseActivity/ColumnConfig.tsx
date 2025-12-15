import {useTranslation} from 'react-i18next';

export const useColumnConfig = () => {
  const {t} = useTranslation();

  const columns = [
    {key: 'name', label: t('ui:name'), defaultVisible: true},
    {key: 'courseName', label: t('ui:course'), defaultVisible: true},
    {key: 'code', label: t('ui:courseCode'), defaultVisible: false},
    {key: 'email', label: t('ui:email'), defaultVisible: true},
    {
      key: 'studentNumber',
      label: t('ui:studentNumber'),
      defaultVisible: true,
    },
    {key: 'groupName', label: t('ui:group'), defaultVisible: true},
    {
      key: 'attendance.total',
      label: t('ui:totalLectures'),
      defaultVisible: true,
    },
    {
      key: 'attendance.attended',
      label: t('ui:attendedLectures'),
      defaultVisible: true,
    },
    {
      key: 'attendance.percentage',
      label: t('ui:attendancePercentage'),
      defaultVisible: true,
    },
    {
      key: 'attendance.lastAttendance',
      label: t('ui:lastAttendance'),
      defaultVisible: true,
    },
  ];

  return columns;
};
