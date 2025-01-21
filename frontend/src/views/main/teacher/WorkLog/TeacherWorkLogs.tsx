import React, {useState} from 'react';
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

interface Course {
  id: number;
  name: string;
  code: string;
}

const TeacherWorkLogs: React.FC = () => {
  const {t} = useTranslation();
  const [selectedCourse, setSelectedCourse] = useState<number>(1);

  // Mock courses data
  const mockCourses: Course[] = [
    {id: 1, name: 'Web Development', code: 'WEB2024'},
    {id: 2, name: 'Database Systems', code: 'DBS2024'},
    {id: 3, name: 'Software Engineering', code: 'SWE2024'},
  ];

  // Mock data for development, filtered by selected course
  //@ts-expect-error
  const mockEntries: WorkLogEntry[] = [
    // Web Development entries
    {
      id: 101,
      date: '2024-01-15',
      startTime: '09:00',
      endTime: '12:30',
      duration: '3h 30min',
      description: 'Frontend React components',
      course: 'Web Development',
      student: 'John Smith',
      status: 'pending',
    },
    {
      id: 102,
      date: '2024-01-15',
      startTime: '13:30',
      endTime: '16:00',
      duration: '2h 30min',
      description: 'REST API integration',
      course: 'Web Development',
      student: 'Sarah Connor',
      status: 'approved',
    },
    {
      id: 103,
      date: '2024-01-16',
      startTime: '10:00',
      endTime: '15:00',
      duration: '5h',
      description: 'User authentication implementation',
      course: 'Web Development',
      student: 'Mike Ross',
      status: 'approved',
    },
    {
      id: 104,
      date: '2024-01-17',
      startTime: '09:00',
      endTime: '14:00',
      duration: '5h',
      description: 'State management with Redux',
      course: 'Web Development',
      student: 'Emma Wilson',
      status: 'pending',
    },
    {
      id: 105,
      date: '2024-01-17',
      startTime: '14:30',
      endTime: '17:30',
      duration: '3h',
      description: 'Unit testing setup',
      course: 'Web Development',
      student: 'Alex Johnson',
      status: 'approved',
    },
    {
      id: 106,
      date: '2024-01-18',
      startTime: '09:00',
      endTime: '12:00',
      duration: '3h',
      description: 'CSS styling and responsive design',
      course: 'Web Development',
      student: 'Lisa Brown',
      status: 'rejected',
    },
    {
      id: 107,
      date: '2024-01-18',
      startTime: '13:00',
      endTime: '16:00',
      duration: '3h',
      description: 'Performance optimization',
      course: 'Web Development',
      student: 'David Chen',
      status: 'pending',
    },
    {
      id: 108,
      date: '2024-01-19',
      startTime: '10:00',
      endTime: '15:00',
      duration: '5h',
      description: 'Error handling implementation',
      course: 'Web Development',
      student: 'Maria Garcia',
      status: 'approved',
    },
    {
      id: 109,
      date: '2024-01-19',
      startTime: '15:30',
      endTime: '17:30',
      duration: '2h',
      description: 'Documentation writing',
      course: 'Web Development',
      student: 'Tom Wilson',
      status: 'pending',
    },
    {
      id: 110,
      date: '2024-01-20',
      startTime: '09:00',
      endTime: '14:00',
      duration: '5h',
      description: 'Final testing and deployment',
      course: 'Web Development',
      student: 'Anna Lee',
      status: 'approved',
    },

    // Database Systems entries
    {
      id: 201,
      date: '2024-01-15',
      startTime: '09:00',
      endTime: '12:00',
      duration: '3h',
      description: 'Database schema design',
      course: 'Database Systems',
      student: 'Peter Parker',
      status: 'approved',
    },
    {
      id: 202,
      date: '2024-01-15',
      startTime: '13:00',
      endTime: '16:00',
      duration: '3h',
      description: 'SQL query optimization',
      course: 'Database Systems',
      student: 'Mary Jane',
      status: 'pending',
    },
    {
      id: 203,
      date: '2024-01-16',
      startTime: '10:00',
      endTime: '15:00',
      duration: '5h',
      description: 'Indexing implementation',
      course: 'Database Systems',
      student: 'Harry Osborn',
      status: 'approved',
    },
    {
      id: 204,
      date: '2024-01-17',
      startTime: '09:00',
      endTime: '14:00',
      duration: '5h',
      description: 'Stored procedures',
      course: 'Database Systems',
      student: 'Gwen Stacy',
      status: 'rejected',
    },
    {
      id: 205,
      date: '2024-01-17',
      startTime: '14:30',
      endTime: '17:30',
      duration: '3h',
      description: 'Triggers and functions',
      course: 'Database Systems',
      student: 'Miles Morales',
      status: 'approved',
    },
    {
      id: 206,
      date: '2024-01-18',
      startTime: '09:00',
      endTime: '12:00',
      duration: '3h',
      description: 'Database backup implementation',
      course: 'Database Systems',
      student: 'Otto Octavius',
      status: 'pending',
    },
    {
      id: 207,
      date: '2024-01-18',
      startTime: '13:00',
      endTime: '16:00',
      duration: '3h',
      description: 'Data migration scripts',
      course: 'Database Systems',
      student: 'Norman Osborn',
      status: 'approved',
    },
    {
      id: 208,
      date: '2024-01-19',
      startTime: '10:00',
      endTime: '15:00',
      duration: '5h',
      description: 'Performance tuning',
      course: 'Database Systems',
      student: 'Betty Brant',
      status: 'pending',
    },
    {
      id: 209,
      date: '2024-01-19',
      startTime: '15:30',
      endTime: '17:30',
      duration: '2h',
      description: 'Security implementation',
      course: 'Database Systems',
      student: 'Flash Thompson',
      status: 'approved',
    },
    {
      id: 210,
      date: '2024-01-20',
      startTime: '09:00',
      endTime: '14:00',
      duration: '5h',
      description: 'Documentation and testing',
      course: 'Database Systems',
      student: 'J. Jonah Jameson',
      status: 'pending',
    },

    // Software Engineering entries
    {
      id: 301,
      date: '2024-01-15',
      startTime: '09:00',
      endTime: '12:00',
      duration: '3h',
      description: 'Requirements analysis',
      course: 'Software Engineering',
      student: 'Bruce Wayne',
      status: 'approved',
    },
    {
      id: 302,
      date: '2024-01-15',
      startTime: '13:00',
      endTime: '16:00',
      duration: '3h',
      description: 'System architecture design',
      course: 'Software Engineering',
      student: 'Clark Kent',
      status: 'pending',
    },
    {
      id: 303,
      date: '2024-01-16',
      startTime: '10:00',
      endTime: '15:00',
      duration: '5h',
      description: 'UML diagrams',
      course: 'Software Engineering',
      student: 'Diana Prince',
      status: 'approved',
    },
    {
      id: 304,
      date: '2024-01-17',
      startTime: '09:00',
      endTime: '14:00',
      duration: '5h',
      description: 'Design patterns implementation',
      course: 'Software Engineering',
      student: 'Barry Allen',
      status: 'approved',
    },
    {
      id: 305,
      date: '2024-01-17',
      startTime: '14:30',
      endTime: '17:30',
      duration: '3h',
      description: 'Code refactoring',
      course: 'Software Engineering',
      student: 'Hal Jordan',
      status: 'rejected',
    },
    {
      id: 306,
      date: '2024-01-18',
      startTime: '09:00',
      endTime: '12:00',
      duration: '3h',
      description: 'Unit testing',
      course: 'Software Engineering',
      student: 'Oliver Queen',
      status: 'pending',
    },
    {
      id: 307,
      date: '2024-01-18',
      startTime: '13:00',
      endTime: '16:00',
      duration: '3h',
      description: 'Integration testing',
      course: 'Software Engineering',
      student: 'Arthur Curry',
      status: 'approved',
    },
    {
      id: 308,
      date: '2024-01-19',
      startTime: '10:00',
      endTime: '15:00',
      duration: '5h',
      description: 'CI/CD pipeline setup',
      course: 'Software Engineering',
      student: 'Victor Stone',
      status: 'pending',
    },
    {
      id: 309,
      date: '2024-01-19',
      startTime: '15:30',
      endTime: '17:30',
      duration: '2h',
      description: 'Documentation',
      course: 'Software Engineering',
      student: 'John Stewart',
      status: 'approved',
    },
    {
      id: 310,
      date: '2024-01-20',
      startTime: '09:00',
      endTime: '14:00',
      duration: '5h',
      description: 'Final system testing',
      course: 'Software Engineering',
      student: 'Billy Batson',
      status: 'pending',
    },
  ].filter(
    (entry) =>
      entry.course === mockCourses.find((c) => c.id === selectedCourse)?.name,
  );

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
      <div className='flex items-center justify-between mb-8'>
        <h1 className='text-2xl font-heading text-metropoliaMainOrange'>
          {t('worklog.entries.title')}
        </h1>

        <div className='flex items-center gap-4'>
          <label
            htmlFor='courseSelect'
            className='text-sm font-medium text-metropoliaMainGrey'>
            {t('worklog.entries.selectCourse')}:
          </label>
          <select
            id='courseSelect'
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(Number(e.target.value))}
            className='p-2 border rounded-lg focus:ring-2 focus:ring-metropoliaMainOrange focus:border-metropoliaMainOrange text-metropoliaMainGrey'>
            {mockCourses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name} ({course.code})
              </option>
            ))}
          </select>
        </div>
      </div>

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
