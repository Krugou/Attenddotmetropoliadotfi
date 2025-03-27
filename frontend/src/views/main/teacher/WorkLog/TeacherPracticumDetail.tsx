import React, {useContext, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import GeneralLinkButton from '../../../../components/main/buttons/GeneralLinkButton';
import PracticumData from '../../../../components/main/practicum/PracticumData';
import {UserContext} from '../../../../contexts/UserContext';
import apiHooks from '../../../../api';
import {useTranslation} from 'react-i18next';

interface WorkLogDetail {
  practicumId: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  required_hours: number;
  created_at: string;
  user_count: number;
  instructor_name: string;
}

const TeacherWorklogCourseDetail: React.FC = () => {
  const {practicumid} = useParams<{practicumid: string}>();

  const [practicumData, setPracticumData] = useState<WorkLogDetail | null>(
    null,
  );
  const {user} = useContext(UserContext);
  const {t} = useTranslation(['teacher']);

  useEffect(() => {
    const fetchWorklog = async () => {
      if (practicumid) {
        const token: string | null = localStorage.getItem('userToken');
        if (!token) {
          throw new Error('No token available');
        }

        const data = await apiHooks.getPracticumDetails(
          Number(practicumid),
          token,
        );
        setPracticumData(data.practicum);
      }
    };

    fetchWorklog();
  }, [practicumid]);

  return (
    <div className='w-full'>
      <h2 className='p-3 ml-auto mr-auto text-2xl text-center bg-white rounded-lg font-heading w-fit'>
        {practicumData?.name}
      </h2>
      <div className='w-full mx-auto mt-4 bg-white rounded-lg shadow-lg sm:w-3/4 md:w-2/4 lg:w-2/5 2xl:w-1/5'>
        <div className='flex flex-col sm:flex-row justify-start items-center gap-3 p-5'>
          <GeneralLinkButton
            path={
              user?.role === 'admin'
                ? '/teacher/worklog'
                : `/${user?.role}/worklog`
            }
            text={t('teacher:worklog.detail.backToWorklog')}
            className='w-full sm:w-auto'
          />
        </div>
        {practicumData && <PracticumData practicumData={[practicumData]} />}
      </div>
    </div>
  );
};

export default TeacherWorklogCourseDetail;
