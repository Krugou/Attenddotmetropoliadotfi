import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import apiHooks from '../../../../../hooks/ApiHooks';

interface GroupDetails {
  group: {
    group_id: number;
    group_name: string;
  };
  course: {
    name: string;
    code: string;
    description: string;
    start_date: string;
    end_date: string;
    required_hours: number;
  };
  students: {
    userid: number;
    email: string;
    first_name: string;
    last_name: string;
    studentnumber: string;
  }[];
  entries: {
    entry_id: number;
    start_time: string;
    end_time: string;
    description: string;
    status: number;
    user_id: number;
  }[];
}

const TeacherWorklogCourseGroup: React.FC = () => {
  const {t} = useTranslation();
  const {courseid, groupid} = useParams<{courseid: string; groupid: string}>();
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token || !courseid || !groupid) {
          throw new Error('Missing required parameters');
        }

        const details = await apiHooks.getWorkLogGroupDetails(
          Number(courseid),
          Number(groupid),
          token,
        );
        console.log('🚀 ~ fetchGroupDetails ~ details:', details.entries);

        setGroupDetails(details);
      } catch (error) {
        console.error('Error fetching group details:', error);
        if (error instanceof Error) {
          toast.error(error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [courseid, groupid]);

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-xl font-body'>Loading...</div>
      </div>
    );
  }

  if (!groupDetails) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-xl text-red-500 font-body'>
          {t('errors.groupNotFound')}
        </div>
      </div>
    );
  }

  return (
    <div className='container px-4 py-8 mx-auto'>
      <div className='mb-8'>
        <h1 className='text-3xl font-heading'>
          {groupDetails.group.group_name}
        </h1>
        <p className='mt-2 text-gray-600 font-body'>
          {groupDetails.course.name} ({groupDetails.course.code})
        </p>
      </div>

      {/* Students Section */}
      <div className='mb-8'>
        <h2 className='mb-4 text-2xl font-heading'>
          {t('teacher.worklog.groups.students.title')}
        </h2>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {groupDetails.students.map((student) => (
            <div
              key={student.userid}
              className='p-4 bg-white rounded-lg shadow font-body'>
              <p className='font-medium'>
                {student.first_name} {student.last_name}
              </p>
              <p className='text-sm text-gray-600'>{student.email}</p>
              <p className='text-sm text-gray-600'>{student.studentnumber}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Entries Section */}
      {groupDetails.entries.length > 0 && (
        <div>
          <h2 className='mb-4 text-2xl font-heading'>
            {t('teacher.worklog.groups.entries')}
          </h2>
          <div className='overflow-x-auto'>
            <table className='w-full table-auto'>
              <thead>
                <tr className='bg-gray-100 font-body'>
                  <th className='p-2 text-left'>
                    {t('teacher.worklog.entries.date')}
                  </th>
                  <th className='p-2 text-left'>
                    {t('teacher.worklog.entries.hours')}
                  </th>
                  <th className='p-2 text-left'>
                    {t('teacher.worklog.entries.description')}
                  </th>
                  <th className='p-2 text-left'>
                    {t('teacher.worklog.entries.status')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {groupDetails.entries.map((entry) => (
                  <tr key={entry.entry_id} className='border-b font-body'>
                    <td className='p-2'>
                      {new Date(entry.start_time).toLocaleDateString()}
                    </td>
                    <td className='p-2'>
                      {(
                        (new Date(entry.end_time).getTime() -
                          new Date(entry.start_time).getTime()) /
                        (1000 * 60 * 60)
                      ).toFixed(1)}
                    </td>
                    <td className='p-2'>{entry.description}</td>
                    <td className='p-2'>{entry.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherWorklogCourseGroup;
