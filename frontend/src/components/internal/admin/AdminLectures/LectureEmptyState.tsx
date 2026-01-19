import React from 'react';

interface LectureEmptyStateProps {
  filterOpen: boolean;
  openLecturesCount: number;
  t: (key: string) => string;
}

const LectureEmptyState: React.FC<LectureEmptyStateProps> = ({
                                                               filterOpen,
                                                               openLecturesCount,
                                                               t,
                                                             }) => {
  const noOpenLectures = filterOpen && openLecturesCount === 0;

  return (
    <div className='flex items-center justify-center h-full'>
      <div className='p-8 text-center bg-white rounded-lg shadow-xs'>
        <h3 className='mb-2 text-xl font-semibold text-gray-700 font-heading'>
          {noOpenLectures
            ? t('admin:TeacherLectures.noData.noOpenLectures')
            : t('admin:TeacherLectures.noData.noLecturesFound')}
        </h3>
        <p className='text-gray-500 font-body'>
          {noOpenLectures
            ? t('admin:TeacherLectures.noData.tryShowingAll')
            : t('admin:TeacherLectures.noData.tryDifferentSearch')}
        </p>
      </div>
    </div>
  );
};

export default LectureEmptyState;
