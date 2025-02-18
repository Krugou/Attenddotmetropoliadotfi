import React from 'react';
import {useTranslation} from 'react-i18next';
import {format, parseISO} from 'date-fns';
import {CombinedStudentData} from './types';

interface TableBodyProps {
  students: CombinedStudentData[];
  visibleColumns: Set<string>;
  columns: Array<{key: string; label: string}>;
  threshold?: number;
}

export const TableBody: React.FC<TableBodyProps> = ({
  students,
  visibleColumns,
  columns,
  threshold,
}) => {
  const {t} = useTranslation();

  return (
    <tbody className='bg-white divide-y divide-gray-200'>
      {students.map((student, index) => (
        <tr
          key={`${student.userId}-${student.courseName}-${student.studentNumber}-${index}`}
          className='hover:bg-gray-50 transition-colors duration-150'>
          {columns
            .filter((column) => visibleColumns.has(column.key))
            .map(({key}) => (
              <td key={key} className='px-4 py-2'>
                {(() => {
                  if (key === 'name') {
                    return `${student.firstName} ${student.lastName}`;
                  }
                  if (key.includes('attendance.')) {
                    const attendanceKey = key.split('.')[1] as keyof typeof student.attendance;
                    if (key === 'attendance.lastAttendance') {
                      return student.attendance.lastAttendance
                        ? format(
                            parseISO(student.attendance.lastAttendance),
                            'dd.MM.yyyy HH:mm',
                          )
                        : t('common:never');
                    }
                    if (key === 'attendance.percentage') {
                      return `${student.attendance.percentage}%`;
                    }
                    return String(student.attendance[attendanceKey]);
                  }
                  const studentKey = key.split('.')[0] as keyof typeof student;
                  return String(student[studentKey]);
                })()}
              </td>
            ))}
          <td className='px-4 py-2'>
            {threshold && typeof threshold === 'number' && (
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                  ${
                    student.attendance.percentage >= threshold
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  } transition-colors duration-200`}>
                {student.attendance.percentage >= threshold
                  ? t('common:passing')
                  : t('common:failing')}
              </span>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  );
};
