import React from 'react';
import { useTranslation } from 'react-i18next';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface Props {
  showOlderCourses: boolean;
  olderCoursesCount: number;
  toggleOlderCourses: () => void;
}

const ToggleOlderCoursesButton: React.FC<Props> = ({
                                                     showOlderCourses,
                                                     olderCoursesCount,
                                                     toggleOlderCourses,
                                                   }) => {
  const { t } = useTranslation(['admin']);

  if (olderCoursesCount === 0) return null;

  return (
    <button
      onClick={toggleOlderCourses}
      className={`flex items-center gap-2 px-4 py-2 ml-4 text-white rounded-md transition-colors ${
        showOlderCourses
          ? 'bg-metropolia-support-blue hover:bg-metropolia-support-blue-dark'
          : 'bg-metropolia-support-secondary-red hover:bg-metropolia-support-secondary-red-dark'
      } shadow-md hover:shadow-lg`}
      aria-label={
        showOlderCourses
          ? t('admin:course.hideOlder')
          : t('admin:course.showOlder')
      }
      title={
        showOlderCourses
          ? t('admin:course.hideOlder')
          : t('admin:course.showOlder')
      }>
      {showOlderCourses ? (
        <VisibilityIcon className='w-5 h-5' />
      ) : (
        <VisibilityOffIcon className='w-5 h-5' />
      )}
      <span className='hidden sm:inline'>
        {showOlderCourses
          ? t('admin:course.hideOlder')
          : t('admin:course.showOlder')}
      </span>
      <span className='ml-1 inline-flex items-center justify-center w-6 h-6 bg-white text-metropolia-main-grey text-xs font-medium rounded-full'>
        {olderCoursesCount}
      </span>
    </button>
  );
};

export default ToggleOlderCoursesButton;
