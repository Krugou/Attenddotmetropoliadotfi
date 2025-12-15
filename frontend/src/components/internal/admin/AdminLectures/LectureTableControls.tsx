import React from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import SortIcon from '@mui/icons-material/Sort';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';

interface Props {
  filterOpen: boolean;
  toggleFilter: () => void;
  hasOpenLectures: boolean;
  handleMenuOpen: (event: React.MouseEvent<HTMLButtonElement>) => void;
  extraStats: boolean;
  toggleExtraStats: () => void;
  handleRefresh: () => void;
  isRefreshing: boolean;
  toggleSortOrder: () => void;
  sortOrder: 'asc' | 'desc';
  isExpanded: boolean;
  toggleExpanded: () => void;
  t: (key: string) => string;
}

const LectureTableControls: React.FC<Props> = ({
                                                 filterOpen,
                                                 toggleFilter,
                                                 hasOpenLectures,
                                                 handleMenuOpen,
                                                 extraStats,
                                                 toggleExtraStats,
                                                 handleRefresh,
                                                 isRefreshing,
                                                 toggleSortOrder,
                                                 sortOrder,
                                                 isExpanded,
                                                 toggleExpanded,
                                                 t,
                                               }) => {
  return (
    <div className='flex justify-between mt-4 mb-4 space-x-2'>
      <div className='flex justify-between gap-3'>
        <button
          onClick={toggleFilter}
          className='px-2 py-1 text-white transition rounded-sm font-heading bg-metropolia-main-orange h-fit hover:hover:bg-metropolia-secondary-orange sm:py-2 sm:px-4 focus:outline-hidden focus:shadow-outline'>
          {filterOpen
            ? t('admin:TeacherLectures.alternative.showAllLectures')
            : t('admin:TeacherLectures.alternative.showOpenLecture')}
        </button>

        {!(!hasOpenLectures && filterOpen) && (
          <>
            <button
              onClick={handleMenuOpen}
              className='px-2 py-1 text-white transition rounded-sm font-heading bg-metropolia-main-orange h-fit hover:bg-metropolia-secondary-orange sm:py-2 sm:px-4 focus:outline-hidden focus:shadow-outline'>
              <ViewColumnIcon className='w-5 h-5 mr-1' />
              {t('admin:TeacherLectures.alternative.columns')}
            </button>

            {!filterOpen && (
              <button
                onClick={toggleExtraStats}
                className='px-2 py-1 text-white transition rounded-sm font-heading bg-metropolia-main-orange h-fit hover:bg-metropolia-secondary-orange sm:py-2 sm:px-4 focus:outline-hidden focus:shadow-outline'>
                {extraStats
                  ? t('admin:TeacherLectures.alternative.hideStats')
                  : t('admin:TeacherLectures.alternative.showStats')}
              </button>
            )}
          </>
        )}
      </div>

      {!(!hasOpenLectures && filterOpen) && (
        <div className='flex gap-2 group'>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className='px-2 py-1 text-white transition rounded-sm font-heading bg-metropolia-main-orange h-fit hover:bg-metropolia-secondary-orange disabled:opacity-50 disabled:cursor-not-allowed sm:py-2 sm:px-4 focus:outline-hidden focus:shadow-outline'
            aria-label={t('admin:ui.refresh')}
            title={t('admin:ui.refresh')}>
            <RefreshIcon
              className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </button>

          <button
            onClick={toggleSortOrder}
            className='px-2 py-1 text-white transition rounded-sm font-heading bg-metropolia-main-orange h-fit hover:hover:bg-metropolia-secondary-orange sm:py-2 sm:px-4 focus:outline-hidden focus:shadow-outline'
            aria-label={
              sortOrder === 'asc'
                ? t('admin:TeacherLectures.alternative.sortByNewest')
                : t('admin:TeacherLectures.alternative.sortByOldest')
            }
            title={
              sortOrder === 'asc'
                ? t('admin:TeacherLectures.alternative.sortByNewest')
                : t('admin:TeacherLectures.alternative.sortByOldest')
            }>
            <SortIcon className='w-5 h-5' />
          </button>

          <button
            onClick={toggleExpanded}
            className='p-2 text-white transition-colors rounded-sm bg-metropolia-main-orange hover:bg-metropolia-main-orange/90'
            aria-label={
              isExpanded
                ? t('admin:TeacherLectures.alternative.shrinkTable')
                : t('admin:TeacherLectures.alternative.expandTable')
            }
            title={
              isExpanded
                ? t('admin:TeacherLectures.alternative.shrinkTable')
                : t('admin:TeacherLectures.alternative.expandTable')
            }>
            {isExpanded ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
          </button>
        </div>
      )}
    </div>
  );
};

export default LectureTableControls;
