import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  olderCoursesCount: number;
  toggleOlderCourses: () => void;
}

const OlderCoursesNotice: React.FC<Props> = ({
                                               olderCoursesCount,
                                               toggleOlderCourses,
                                             }) => {
  const { t } = useTranslation(['admin']);

  if (olderCoursesCount === 0) return null;

  return (
    <div className='mb-4 bg-gray-50 p-4 rounded-md border border-gray-200 flex items-center justify-between'>
      <p className='text-sm text-metropolia-main-grey'>
        <span className='font-medium'>{olderCoursesCount}</span>{' '}
        {olderCoursesCount === 1
          ? t('admin:course.oneOlderCourseHidden')
          : t('admin:course.multipleOlderCoursesHidden', {
            count: olderCoursesCount,
          })}
      </p>
      <button
        onClick={toggleOlderCourses}
        className='text-sm text-metropolia-support-blue hover:text-metropolia-support-blue-dark underline'>
        {t('admin:course.showAll')}
      </button>
    </div>
  );
};

export default OlderCoursesNotice;
