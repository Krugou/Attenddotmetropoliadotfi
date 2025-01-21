import React from 'react';
import {useTranslation} from 'react-i18next';

interface WorkLogEntry {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  description: string;
  course: string;
}

const StudentWorklogs: React.FC = () => {
  const {t} = useTranslation();

  // Mock data for development
  const mockEntries: WorkLogEntry[] = [
    {
      id: 1,
      date: '2024-01-15',
      startTime: '09:00',
      endTime: '12:30',
      duration: '3h 30min',
      description: 'Frontend development for project X',
      course: 'Web Development',
    },
    {
      id: 2,
      date: '2024-01-15',
      startTime: '13:30',
      endTime: '16:00',
      duration: '2h 30min',
      description: 'Backend API implementation',
      course: 'Web Development',
    },
    {
      id: 3,
      date: '2024-01-16',
      startTime: '10:00',
      endTime: '15:00',
      duration: '5h',
      description: 'Database design and implementation',
      course: 'Database Systems',
    },
  ];

  const tableHeaderClass = `
    px-4 py-2 text-left text-sm font-semibold
    text-metropoliaMainGrey bg-metropoliaSupportWhite
    border-b border-metropoliaMainGrey/20
  `;

  const tableCellClass = `
    px-4 py-2 text-sm text-metropoliaMainGrey
    border-b border-metropoliaMainGrey/10
  `;

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-2xl font-heading text-metropoliaMainOrange mb-6'>
        {t('worklog.entries.title')}
      </h1>

      <div className='bg-white shadow-lg rounded-lg overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full'>
            <thead>
              <tr>
                <th className={tableHeaderClass}>
                  {t('worklog.entries.date')}
                </th>
                <th className={tableHeaderClass}>
                  {t('worklog.entries.startTime')}
                </th>
                <th className={tableHeaderClass}>
                  {t('worklog.entries.endTime')}
                </th>
                <th className={tableHeaderClass}>
                  {t('worklog.entries.duration')}
                </th>
                <th className={tableHeaderClass}>
                  {t('worklog.entries.course')}
                </th>
                <th className={tableHeaderClass}>
                  {t('worklog.entries.description')}
                </th>
              </tr>
            </thead>
            <tbody>
              {mockEntries.map((entry) => (
                <tr
                  key={entry.id}
                  className='hover:bg-metropoliaMainGrey/5 transition-colors'>
                  <td className={tableCellClass}>{entry.date}</td>
                  <td className={tableCellClass}>{entry.startTime}</td>
                  <td className={tableCellClass}>{entry.endTime}</td>
                  <td className={tableCellClass}>{entry.duration}</td>
                  <td className={tableCellClass}>{entry.course}</td>
                  <td className={tableCellClass}>{entry.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='p-4 border-t border-metropoliaMainGrey/10'>
          <p className='text-sm text-metropoliaMainGrey'>
            {t('worklog.entries.total')}: {mockEntries.length}{' '}
            {t('worklog.entries.entries')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentWorklogs;
