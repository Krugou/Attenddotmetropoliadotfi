import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import React, {useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import GeneralLinkButton from '../../../../components/main/buttons/GeneralLinkButton';
import {UserContext} from '../../../../contexts/UserContext';
import apihooks from '../../../../hooks/ApiHooks';
import {useTranslation} from 'react-i18next';
import WorklogData from '../../../../components/main/worklog/WorklogData';

interface WorkLogCourse {
  courseid: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  code: string;
  required_hours: number;
  created_at: string;
  user_count: number;
  instructor_name: string;
}

const TeacherWorkLogs: React.FC = () => {
  const {t} = useTranslation();
  const {user} = useContext(UserContext);
  const [worklogCourses, setWorklogCourses] = useState<WorkLogCourse[]>([]);
  const {update, setUpdate} = useContext(UserContext);
  const [showEndedCourses, setShowEndedCourses] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorklogCourses = async () => {
      if (user) {
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token available');
      }

        const courses = await apihooks.getWorkLogCoursesByInstructor(
          user.email,
          token
        );

          setWorklogCourses(courses);
      }
    };

    fetchWorklogCourses();
  }, [user, update]);

  const updateView = () => {
    setUpdate(!update);
  };


  return (
    <div className='w-full'>
      <h2 className='p-3 ml-auto mr-auto text-3xl font-heading text-center bg-white rounded-lg w-fit xl:text-4xl'>
        {t('teacher.worklog.title')}
      </h2>
      <div className='w-full p-5 m-auto mt-5 bg-gray-100 rounded-lg 2xl:w-3/4'>
        <div className='flex flex-col justify-between gap-5 sm:gap-0 sm:flex-row'>
          <GeneralLinkButton
            path ={
              user?.role === 'admin'
              ?'/counselor/mainview'
              :`${user?.role}/mainview`
            }
            text={t('teacher.courses.buttons.backToMainview')}
          />
          <FormControlLabel
            control={
              <Switch
                checked={showEndedCourses}
                onChange={() => setShowEndedCourses(!showEndedCourses)}
                name='showEndedCourses'
                color='primary'
              />
            }
            label={t('common.showEndedCourses')}
          />
        </div>
        <div className='grid max-h-[30em] mt-5 2xl:max-h-[50em] overflow-y-scroll w-full grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-4 m-auto'>
          {worklogCourses.length > 0 && (
            <WorklogData
              worklogData={worklogCourses}
              updateView={updateView}
              allCourses={true}
              showEndedCourses={showEndedCourses}
            />
          )}
          <div
            className='relative flex items-center justify-center p-5 mt-4 mb-4 bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300'
            onClick={() => navigate('/teacher/worklog/create')}>
            <button className='flex flex-col items-center'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                className='w-8 h-8 mb-2'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                />
              </svg>
              {t('teacher.worklog.create.title')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherWorkLogs;
