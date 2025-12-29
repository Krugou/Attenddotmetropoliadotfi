import React from 'react';
import SortIcon from '@mui/icons-material/Sort';
import { useTranslation } from 'react-i18next';
import { Course } from '../../../../types/course.ts';

type SortOrder = 'asc' | 'desc';
type SortKey = keyof Course;

interface CourseTableProps {
  courses: Course[];
  sortKey: SortKey;
  sortOrder: SortOrder;
  sortCourses: (key: SortKey) => void;
  navigateToCourse: (courseId: string) => void;
  isOlderCourse: (course: Course) => boolean;
  debouncedSearchTerm: string;
}

const highlightMatch = (text: string, searchTerm: string): React.ReactNode => {
  if (!searchTerm) return text;

  const searchTermLower = searchTerm.toLowerCase();
  const textLower = text.toLowerCase();

  if (!textLower.includes(searchTermLower)) return text;

  const startIndex = textLower.indexOf(searchTermLower);
  const endIndex = startIndex + searchTermLower.length;

  return (
    <>
      {text.slice(0, startIndex)}
      <span className='bg-metropolia-support-yellow text-metropolia-main-grey font-medium px-1 rounded'>
        {text.slice(startIndex, endIndex)}
      </span>
      {text.slice(endIndex)}
    </>
  );
};

const CourseTable: React.FC<CourseTableProps> = ({
                                                   courses,
                                                   sortKey,
                                                   sortOrder,
                                                   sortCourses,
                                                   navigateToCourse,
                                                   isOlderCourse,
                                                   debouncedSearchTerm,
                                                 }) => {
  const { t } = useTranslation(['admin']);

  return (
    <div className='relative bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg overflow-hidden shadow-inner border border-gray-200'>
      <div className='relative overflow-y-scroll max-h-96 h-96 scrollbar-thin scrollbar-thumb-metropolia-main-orange scrollbar-track-gray-100'>
        <table className='w-full table-auto'>
          <thead className='sticky top-0 z-10 bg-gradient-to-r from-metropolia-main-orange/90 to-metropolia-secondary-orange/90 text-white shadow-md'>
          <tr>
            {(['name', 'code', 'start_date', 'end_date', 'student_group', 'topics', 'instructors'] as SortKey[]).map(
              (key) => {
                const isActive = sortKey === key;
                const arrow = isActive ? (sortOrder === 'asc' ? '↑' : '↓') : '';
                return (
                  <th key={key} className='px-4 py-3 font-semibold text-left whitespace-nowrap'>
                    {t(`admin:course.${key}`)} {arrow}
                    <button
                      aria-label={`Sort by ${key}`}
                      className='p-1 ml-2 text-sm rounded-full bg-white/20 hover:bg-white/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95'
                      onClick={() => sortCourses(key)}
                    >
                      <SortIcon className='w-4 h-4' />
                    </button>
                  </th>
                );
              }
            )}
          </tr>
          </thead>
          <tbody>
          {courses.map((course) => (
            <tr
              key={course.courseid}
              className={`hover:bg-gray-200 cursor-pointer transition-colors duration-200 ${
                isOlderCourse(course) ? 'bg-gray-100 text-metropolia-main-grey/70' : ''
              }`}
              onClick={() => navigateToCourse(course.courseid)}
            >
              {(['name', 'code', 'start_date', 'end_date', 'student_group', 'topics', 'instructors'] as SortKey[]).map(
                (key) => (
                  <td key={key} className='px-2 py-2 border'>
                    {key === 'start_date' || key === 'end_date'
                      ? new Date(course[key]).toLocaleDateString()
                      : Array.isArray(course[key])
                        ? course[key].join(', ')
                        : highlightMatch(course[key].toString(), debouncedSearchTerm)}
                  </td>
                )
              )}
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseTable;
