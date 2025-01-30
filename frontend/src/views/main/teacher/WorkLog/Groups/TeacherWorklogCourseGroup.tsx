import React, {useEffect, useState} from 'react';
import {useParams, Link} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import apiHooks from '../../../../../hooks/ApiHooks';
import GeneralLinkButton from '../../../../../components/main/buttons/GeneralLinkButton';

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
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-xl font-body'>Loading...</div>
      </div>
    );
  }

  if (!groupDetails) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-xl text-red-500 font-body'>
          {t('errors.groupNotFound')}
        </div>
      </div>
    );
  }


  const totalHours = groupDetails.entries.reduce((acc, entry) => {
    const hours =
      (new Date(entry.end_time).getTime() -
        new Date(entry.start_time).getTime()) /
      (1000 * 60 * 60);
    return acc + hours;
  }, 0);

  return (
    <div className='container max-w-6xl px-4 py-8 mx-auto'>
      <div className='mb-6'>
        <Link
          to={`/teacher/worklog/course/${courseid}`}
          className='inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors duration-150 bg-metropoliaMainOrange rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-metropoliaMainOrange font-body'>
          {t('teacher.worklog.detail.backToWorklog')}
        </Link>
      </div>

      <div className='p-6 mb-8 bg-white rounded-lg shadow'>
        <h1 className='mb-4 text-3xl font-heading'>
          {groupDetails.group.group_name}
        </h1>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          <div className='font-body'>
            <p className='text-gray-600'>{t('teacher.worklog.details.name')}</p>
            <p className='font-medium'>{groupDetails.course.name}</p>
          </div>
          <div className='font-body'>
            <p className='text-gray-600'>{t('teacher.worklog.details.code')}</p>
            <p className='font-medium'>{groupDetails.course.code}</p>
          </div>
          <div className='font-body'>
            <p className='text-gray-600'>
              {t('teacher.worklog.details.requiredHours')}
            </p>
            <p className='font-medium'>{groupDetails.course.required_hours}h</p>
          </div>
        </div>
      </div>

      <div className='grid gap-4 mb-8 md:grid-cols-3'>
        <div className='p-6 bg-white rounded-lg shadow'>
          <h3 className='mb-2 text-lg font-heading'>
            {t('teacher.worklog.groups.studentCount', {
              count: groupDetails.students.length,
            })}
          </h3>
        </div>
        <div className='p-6 bg-white rounded-lg shadow'>
          <h3 className='mb-2 text-lg font-heading'>
            {t('worklog.entries.total')}: {totalHours.toFixed(1)}h
          </h3>
        </div>
        <div className='p-6 bg-white rounded-lg shadow'>
          <h3 className='mb-2 text-lg font-heading'>
            {t('worklog.entries.entries')}: {groupDetails.entries.length}
          </h3>
        </div>
        <GeneralLinkButton
          path={`/teacher/worklog/group/${courseid}/${groupid}/stats`}
          text={t('teacher.worklog.groups.stats')}
        />
      </div>


      <Accordion className='mb-4'>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls='students-content'
          id='students-header'
          className='bg-white rounded-t-lg'>
          <h2 className='text-2xl font-heading'>
            {t('teacher.worklog.groups.students.title')}
          </h2>
        </AccordionSummary>
        <AccordionDetails className='bg-white rounded-b-lg'>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {groupDetails.students.map((student) => (
              <div
                key={student.userid}
                className='p-4 transition-colors border rounded-lg hover:bg-gray-50 font-body'>
                <p className='font-medium'>
                  {student.first_name} {student.last_name}
                </p>
                <p className='text-sm text-gray-600'>{student.email}</p>
              </div>
            ))}
          </div>

        </AccordionDetails>
      </Accordion>

      {groupDetails.entries.length > 0 && (
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls='entries-content'
            id='entries-header'
            className='bg-white rounded-t-lg'>
            <h2 className='text-2xl font-heading'>
              {t('teacher.worklog.groups.entries')}
            </h2>
          </AccordionSummary>
          <AccordionDetails className='bg-white rounded-b-lg'>
            <div className='overflow-x-auto'>
              <table className='w-full table-auto'>
                <thead>
                  <tr className='text-gray-600 border-b font-body'>
                    <th className='p-3 text-left'>
                      {t('teacher.worklog.entries.date')}
                    </th>
                    <th className='p-3 text-left'>
                      {t('teacher.worklog.entries.hours')}
                    </th>
                    <th className='p-3 text-left'>
                      {t('teacher.worklog.entries.description')}
                    </th>
                    <th className='p-3 text-left'>
                      {t('teacher.worklog.entries.status')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groupDetails.entries.map((entry) => (
                    <tr
                      key={entry.entry_id}
                      className='border-b hover:bg-gray-50 font-body'>
                      <td className='p-3'>
                        {new Date(entry.start_time).toLocaleDateString()}
                      </td>
                      <td className='p-3'>
                        {(
                          (new Date(entry.end_time).getTime() -
                            new Date(entry.start_time).getTime()) /
                          (1000 * 60 * 60)
                        ).toFixed(1)}
                      </td>
                      <td className='p-3'>{entry.description}</td>
                      <td className='p-3'>
                        {t(`teacher.worklog.status.${entry.status}`)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AccordionDetails>
        </Accordion>
      )}
    </div>
  );
};

export default TeacherWorklogCourseGroup;
