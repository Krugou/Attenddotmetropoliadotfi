import { ColumnConfig } from '../../../../types/lecture.ts'
import { TFunction } from 'i18next';

/**
 * Returns column configurations for the AdminLectures table.
 *
 * @param {TFunction} t - Translation function from useTranslation hook
 * @returns {ColumnConfig[]} Array of column configurations
 */
export const getLectureColumns = (t: TFunction): ColumnConfig[] => [
  { key: 'lectureid', label: t('admin:ui.lectureId'), align: 'text-center', defaultVisible: true },
  { key: 'teacheremail', label: t('admin:TeacherLectures.tableContent.teacherEmail'), align: 'text-left', defaultVisible: true },
  { key: 'coursename', label: t('admin:TeacherLectures.tableContent.courseName'), align: 'text-left', defaultVisible: true },
  { key: 'coursecode', label: t('admin:TeacherLectures.tableContent.courseCode'), align: 'text-left', defaultVisible: false },
  { key: 'topicname', label: t('admin:TeacherLectures.tableContent.topicName'), align: 'text-left', defaultVisible: true },
  { key: 'start_date', label: t('admin:TeacherLectures.tableContent.date'), align: 'center', defaultVisible: true },
  { key: 'timeofday', label: t('admin:TeacherLectures.tableContent.dayTime'), align: 'center', defaultVisible: false },
  { key: 'attended', label: t('admin:TeacherLectures.tableContent.attendance'), align: 'center', defaultVisible: true },
  { key: 'actualStudentCount', label: t('admin:TeacherLectures.tableContent.currentTopicStudentCount'), align: 'center', defaultVisible: false },
  { key: 'state', label: t('admin:TeacherLectures.tableContent.state'), align: 'center', defaultVisible: true },
];
