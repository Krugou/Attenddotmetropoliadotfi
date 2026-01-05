import React from 'react';
import SortIcon from '@mui/icons-material/Sort';
import { useTranslation } from 'react-i18next';
import { AdminWorkLogCourse } from '../../../../types/worklog.ts';

interface WorkLogTableProps {
  workLogs: AdminWorkLogCourse[];
  sortKey: keyof AdminWorkLogCourse;
  sortOrder: 'asc' | 'desc';
  sortWorkLogs: (key: keyof AdminWorkLogCourse) => void;
  onRowClick: (course: AdminWorkLogCourse) => void;
  debouncedSearchTerm: string;
  searchField: keyof AdminWorkLogCourse | 'all';
}

const highlightMatch = (
  text: string,
  searchTerm: string,
  searchField: keyof AdminWorkLogCourse | 'all',
  currentField: keyof AdminWorkLogCourse
): React.ReactNode => {
  if (!searchTerm || (searchField !== 'all' && searchField !== currentField)) {
    return text;
  }

  const searchTermLower = searchTerm.toLowerCase();
  const textLower = text.toLowerCase();

  if (!textLower.includes(searchTermLower)) return text;

  const startIndex = textLower.indexOf(searchTermLower);
  const endIndex = startIndex + searchTermLower.length;

  const before = text.slice(0, startIndex);
  const match = text.slice(startIndex, endIndex);
  const after = text.slice(endIndex);

  return (
    <>
      {before}
      <span className='bg-metropolia-support-yellow text-metropolia-main-grey font-medium px-1 rounded'>
        {match}
      </span>
      {after}
    </>
  );
};

const WorkLogTable: React.FC<WorkLogTableProps> = ({
                                                     workLogs,
                                                     sortKey,
                                                     sortOrder,
                                                     sortWorkLogs,
                                                     onRowClick,
                                                     debouncedSearchTerm,
                                                     searchField,
                                                   }) => {
  const { t } = useTranslation(['admin']);

  const columns: { key: keyof AdminWorkLogCourse; label: string }[] = [
    { key: 'name', label: 'name' },
    { key: 'code', label: 'code' },
    { key: 'start_date', label: 'startDate' },
    { key: 'end_date', label: 'endDate' },
    { key: 'required_hours', label: 'requiredHours' },
    { key: 'description', label: 'description' },
  ];

  return (
    <div className='relative bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg overflow-hidden shadow-inner border border-gray-200'>
      <div className='relative overflow-y-scroll max-h-96 h-96 scrollbar-thin scrollbar-thumb-metropolia-main-orange scrollbar-track-gray-100'>
        <table className='w-full table-auto'>
          <thead className='sticky top-0 z-10 bg-gradient-to-r from-metropolia-main-orange/90 to-metropolia-secondary-orange/90 text-white shadow-md'>
          <tr>
            {columns.map(({ key, label }) => {
              const isActive = sortKey === key;
              const arrow = isActive ? (sortOrder === 'asc' ? '↑' : '↓') : '';
              return (
                <th
                  key={key}
                  className='px-4 py-3 font-semibold text-left transition-colors whitespace-nowrap'
                >
                  <span>{t(`admin:worklog.${label}`)} {arrow}</span>
                  <button
                    aria-label={`Sort by ${label}`}
                    className='p-1 ml-2 text-sm rounded-full bg-white/20 hover:bg-white/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95'
                    onClick={() => sortWorkLogs(key)}
                  >
                    <SortIcon className='w-4 h-4' />
                  </button>
                </th>
              );
            })}
          </tr>
          </thead>
          <tbody>
          {workLogs.map((course) => (
            <tr
              key={course.work_log_course_id}
              className='hover:bg-gray-200 cursor-pointer transition-colors duration-200'
              onClick={() => onRowClick(course)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onRowClick(course);
                }
              }}
              role='button'
              aria-label={`View details for ${course.name}`}
            >
              {columns.map(({ key }) => (
                <td key={key} className='px-2 py-2 border'>
                  {key === 'start_date' || key === 'end_date'
                    ? new Date(course[key]).toLocaleDateString()
                    : key === 'required_hours'
                      ? course[key]
                      : highlightMatch(
                        (course[key] ?? '').toString(),
                        debouncedSearchTerm,
                        searchField,
                        key
                      )}
                </td>
              ))}
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkLogTable;
