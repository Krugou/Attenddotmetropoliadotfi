import React from 'react';
import SortIcon from '@mui/icons-material/Sort';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import { Lecture, ColumnConfig } from '../../../../types/lecture.ts';
import { TFunction } from 'i18next';

interface LectureTableProps {
  lectures: Lecture[];
  columns: ColumnConfig[];
  visibleColumns: Set<string>;
  sortKey: keyof Lecture;
  sortOrder: 'asc' | 'desc';
  onSort: (key: keyof Lecture) => void;
  onRowClick: (courseId: string, lectureId: string) => void;
  onDialogOpen: (lectureId: string, action: 'close' | 'delete') => void;
  t: TFunction;
  isExpanded: boolean;
}

const LectureTable: React.FC<LectureTableProps> = ({
                                                     lectures,
                                                     columns,
                                                     visibleColumns,
                                                     sortKey,
                                                     sortOrder,
                                                     onSort,
                                                     onRowClick,
                                                     onDialogOpen,
                                                     t,
                                                     isExpanded,
                                                   }) => {
  return (
    <div className='relative bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg overflow-hidden shadow-inner border border-gray-200'>
      <div
        className={`relative overflow-y-scroll ${
          isExpanded ? 'h-screen' : 'max-h-96 h-96'
        } scrollbar-thin scrollbar-thumb-metropolia-main-orange scrollbar-track-gray-100`}
      >
        {lectures.length > 0 ? (
          <table className='w-full table-auto'>
            <thead className='sticky top-0 z-10 bg-gradient-to-r from-metropolia-main-orange/90 to-metropolia-secondary-orange/90 text-white shadow-md'>
            <tr>
              {columns
                .filter((column) => visibleColumns.has(column.key))
                .map(({ key, label, align }) => (
                  <th
                    key={key}
                    className={`p-3 border-b border-gray-200 ${align} whitespace-nowrap font-heading`}
                  >
                    <div className='flex items-center justify-center gap-2'>
                      {label}
                      <button
                        onClick={() => onSort(key)}
                        className='p-1.5 text-white rounded-xl bg-metropolia-secondary-orange hover:bg-metropolia-main-orange'
                        title={`Sort by ${label}`}
                        aria-label={`Sort by ${label}`}
                      >
                        {sortKey === key ? (
                          sortOrder === 'asc' ? (
                            <UnfoldMoreIcon className='w-4 h-4' />
                          ) : (
                            <UnfoldLessIcon className='w-4 h-4' />
                          )
                        ) : (
                          <SortIcon className='w-4 h-4' />
                        )}
                      </button>
                    </div>
                  </th>
                ))}
              <th className='p-3 text-center border-b border-gray-200 whitespace-nowrap font-heading'>
                {t('admin:TeacherLectures.tableContent.actions')}
              </th>
            </tr>
            </thead>
            <tbody>
            {lectures.map((lecture) => (
              <tr
                key={lecture.lectureid}
                className={`hover:bg-gray-100 transition-colors ${
                  lecture.attended === 0 ? 'bg-red-100' : ''
                }`}
              >
                {columns
                  .filter((column) => visibleColumns.has(column.key))
                  .map(({ key, align }) => (
                    <td
                      key={key}
                      className={`p-3 ${align} border-b border-gray-200`}
                    >
                      {lecture[key]}
                    </td>
                  ))}
                <td className='p-3 text-center border-b border-gray-200 whitespace-nowrap'>
                  <div className='flex gap-1 justify-center'>
                    <button
                      title={t('admin:ui.details')}
                      onClick={() =>
                        onRowClick(lecture.courseid, lecture.lectureid.toString())
                      }
                      className='px-2 py-1 text-white transition rounded-sm font-heading bg-metropolia-main-orange hover:bg-metropolia-secondary-orange'
                    >
                      {t('admin:ui.details')}
                    </button>
                    {lecture.state === 'open' && (
                      <button
                        onClick={() =>
                          onDialogOpen(lecture.lectureid.toString(), 'close')
                        }
                        className='px-2 py-1 text-white transition rounded-sm font-heading bg-metropolia-trend-green hover:bg-green-600'
                      >
                        {t('admin:ui.close')}
                      </button>
                    )}
                    {(lecture.state === 'open' || lecture.state === 'closed') && (
                      <button
                        onClick={() =>
                          onDialogOpen(lecture.lectureid.toString(), 'delete')
                        }
                        className='px-2 py-1 text-white transition rounded-sm font-heading bg-metropolia-support-red hover:bg-red-600'
                      >
                        {t('admin:ui.delete')}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        ) : (
          <div className='flex items-center justify-center h-full'>
            <div className='p-8 text-center bg-white rounded-lg shadow-xs'>
              <h3 className='mb-2 text-xl font-semibold text-gray-700 font-heading'>
                {t('admin:TeacherLectures.noData.noLecturesFound')}
              </h3>
              <p className='text-gray-500 font-body'>
                {t('admin:TeacherLectures.noData.tryDifferentSearch')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LectureTable;
