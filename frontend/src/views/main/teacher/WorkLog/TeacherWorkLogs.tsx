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
  student?: string; // Added student field for teacher view
  status?: 'pending' | 'approved' | 'rejected'; // Added status field
}

const TeacherWorkLogs: React.FC = () => {
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
      student: 'John Smith',
      status: 'pending',
    },
    {
      id: 2,
      date: '2024-01-15',
      startTime: '13:30',
      endTime: '16:00',
      duration: '2h 30min',
      description: 'Backend API implementation',
      course: 'Web Development',
      student: 'Jane Doe',
      status: 'approved',
    },
    {
      id: 3,
      date: '2024-01-16',
      startTime: '10:00',
      endTime: '15:00',
      duration: '5h',
      description: 'Database design and implementation',
      course: 'Database Systems',
      student: 'Mike Johnson',
      status: 'rejected',
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <div className='container px-4 py-8 mx-auto'>
      <h1 className='mb-6 text-2xl font-bold text-metropoliaMainOrange'>
        {t('worklog.entries.title')}
      </h1>

      <div className='overflow-hidden bg-white rounded-lg shadow-lg'>
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
                  {t('worklog.entries.student')}
                </th>
                <th className={tableHeaderClass}>
                  {t('worklog.entries.description')}
                </th>
                <th className={tableHeaderClass}>
                  {t('worklog.entries.status')}
                </th>
                <th className={tableHeaderClass}>
                  {t('worklog.entries.actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {mockEntries.map((entry) => (
                <tr
                  key={entry.id}
                  className='transition-colors hover:bg-metropoliaMainGrey/5'>
                  <td className={tableCellClass}>{entry.date}</td>
                  <td className={tableCellClass}>{entry.startTime}</td>
                  <td className={tableCellClass}>{entry.endTime}</td>
                  <td className={tableCellClass}>{entry.duration}</td>
                  <td className={tableCellClass}>{entry.course}</td>
                  <td className={tableCellClass}>{entry.student}</td>
                  <td className={tableCellClass}>{entry.description}</td>
                  <td
                    className={`${tableCellClass} ${getStatusColor(
                      entry.status || '',
                    )}`}>
                    {entry.status}
                  </td>
                  <td className={tableCellClass}>
                    <button
                      className='mr-2 text-blue-600 hover:text-blue-800'
                      onClick={() => console.log('Edit entry:', entry.id)}>
                      {t('worklog.entries.edit')}
                    </button>
                    <button
                      className='text-red-600 hover:text-red-800'
                      onClick={() => console.log('Delete entry:', entry.id)}>
                      {t('worklog.entries.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='flex items-center justify-between p-4 border-t border-metropoliaMainGrey/10'>
          <p className='text-sm text-metropoliaMainGrey'>
            {t('worklog.entries.total')}: {mockEntries.length}{' '}
            {t('worklog.entries.entries')}
          </p>
          <button
            className='px-4 py-2 text-white transition-colors rounded-lg bg-metropoliaMainOrange hover:bg-metropoliaSecondaryOrange'
            onClick={() => console.log('Export data')}>
            {t('worklog.entries.export')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherWorkLogs;
