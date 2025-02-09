import SortIcon from '@mui/icons-material/Sort';
import {CircularProgress} from '@mui/material';
import React, {useContext, useEffect, useState} from 'react';
// import {useNavigate} from 'react-router-dom';
import GeneralLinkButton from '../../../components/main/buttons/GeneralLinkButton';
import InputField from '../../../components/main/course/createcourse/coursedetails/InputField';
import {UserContext} from '../../../contexts/UserContext';
import apiHooks from '../../../api';
import {useTranslation} from 'react-i18next';

interface WorkLogCourse {
  work_log_course_id: number;
  name: string;
  start_date: string;
  end_date: string;
  code: string;
  description: string;
  required_hours: number;
  created_at: string;
}

const AdminWorkLogs: React.FC = () => {
  const {t} = useTranslation(['translation']);
  // const navigate = useNavigate();
  const {user} = useContext(UserContext);
  const [workLogs, setWorkLogs] = useState<WorkLogCourse[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<keyof WorkLogCourse>('created_at');
  const [isLoading, setIsLoading] = useState(true);

  const sortedWorkLogs = [...workLogs].sort((a, b) => {
    const aValue = a[sortKey]?.toString() || '';
    const bValue = b[sortKey]?.toString() || '';
    return sortOrder === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  const sortWorkLogs = (key: keyof WorkLogCourse) => {
    setSortKey(key);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const filteredWorkLogs = sortedWorkLogs.filter((course) =>
    Object.values(course).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token available');
      }

      const fetchWorkLogs = async () => {
        try {
          const fetchedWorkLogs = await apiHooks.getWorkLogCourses(token);
          setWorkLogs(fetchedWorkLogs);
        } catch (error) {
          console.error('Error fetching worklog courses:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchWorkLogs();
    }
  }, [user]);

  return (
    <div className='relative w-full p-5 bg-white rounded-lg lg:w-fit'>
      {isLoading ? (
        <div className='flex items-center justify-center h-full'>
          <CircularProgress />
        </div>
      ) : workLogs.length === 0 ? (
        <div className='flex items-center justify-center h-full'>
          <p>{t('translation:admin.common.noWorkLogsAvailable')}</p>
        </div>
      ) : (
        <>
          <GeneralLinkButton
            text={t('translation:admin.worklog.createNewWorkLog')}
            path='/teacher/worklog/create'
          />
          <div className='lg:w-1/4 sm:w-[20em] w-1/2 mt-4 mb-4'>
            <InputField
              type='text'
              name='search'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('translation:admin.common.searchPlaceholder')}
              label={t('translation:admin.common.search')}
            />
          </div>
          <div className='relative bg-gray-100'>
            <div className='relative overflow-y-scroll max-h-96 h-96'>
              <table className='w-full table-auto'>
                <thead className='sticky top-0 z-10 bg-white border-t-2 border-black'>
                  <tr>
                    {[
                      {key: 'name', label: 'name'},
                      {key: 'code', label: 'code'},
                      {key: 'start_date', label: 'startDate'},
                      {key: 'end_date', label: 'endDate'},
                      {key: 'required_hours', label: 'requiredHours'},
                      {key: 'description', label: 'description'},
                    ].map(({key, label}) => (
                      <th key={key} className='px-4 py-2'>
                        {t(`admin.worklog.${label}`)}
                        <button
                          aria-label={`Sort by ${label}`}
                          className='p-1 ml-2 text-sm text-white rounded-sm font-heading bg-metropolia-main-orange hover:bg-metropolia-main-orangeDark focus:outline-hidden focus:ring-2 focus:ring-metropolia-main-orangeDark'
                          onClick={() =>
                            sortWorkLogs(key as keyof WorkLogCourse)
                          }>
                          <SortIcon />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkLogs.map((course) => (
                    <tr
                      key={course.work_log_course_id}
                      className='hover:bg-gray-200'>
                      <td className='px-2 py-2 border'>{course.name}</td>
                      <td className='px-2 py-2 border'>{course.code}</td>
                      <td className='px-2 py-2 border'>
                        {new Date(course.start_date).toLocaleDateString()}
                      </td>
                      <td className='px-2 py-2 border'>
                        {new Date(course.end_date).toLocaleDateString()}
                      </td>
                      <td className='px-2 py-2 border'>
                        {course.required_hours}
                      </td>
                      <td className='px-2 py-2 border'>{course.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminWorkLogs;
