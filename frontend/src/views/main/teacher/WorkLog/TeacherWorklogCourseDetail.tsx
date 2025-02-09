import React, {useContext, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import GeneralLinkButton from '../../../../components/main/buttons/GeneralLinkButton';
import WorklogData from '../../../../components/main/worklog/WorklogData';
import {UserContext} from '../../../../contexts/UserContext';
import apiHooks from '../../../../api';
import {useTranslation} from 'react-i18next';

interface WorkLogDetail {
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

const TeacherWorklogCourseDetail: React.FC = () => {
  const params = useParams();
  console.log('All params:', params); // Add this line to see what parameters are available

  const {courseid} = useParams<{courseid: string}>();
  console.log('courseid:', courseid); // Add this line to debug the courseid

  const [worklogData, setWorklogData] = useState<WorkLogDetail | null>(null);
  const {user} = useContext(UserContext);
  const {t} = useTranslation(['translation']);

  useEffect(() => {
    const fetchWorklog = async () => {
      if (courseid) {
        const token: string | null = localStorage.getItem('userToken');
        if (!token) {
          throw new Error('No token available');
        }

        console.log('Fetching worklog with id:', courseid);
        const data = await apiHooks.getWorkLogCourseDetail(courseid, token);
        console.log('Received worklog data:', data);
        setWorklogData(data.course);
        console.log('Worklog name:', data.course?.name);
      }
    };

    fetchWorklog();
  }, [courseid]);

  return (
    <div className='w-full'>
      <h2 className='p-3 ml-auto mr-auto text-2xl text-center bg-white rounded-lg font-heading w-fit'>
        {worklogData?.name} - {worklogData?.code}
      </h2>
      <div className='w-full mx-auto mt-4 bg-white rounded-lg shadow-lg sm:w-3/4 md:w-2/4 lg:w-2/5 2xl:w-1/5'>
        <div className='pt-5 pl-5'>
          <GeneralLinkButton
            path={
              user?.role === 'admin'
                ? '/counselor/worklog'
                : `/${user?.role}/worklog`
            }
            text={t('translation:teacher.worklog.detail.backToWorklog')}
          />
        </div>
        {worklogData && (
          <WorklogData worklogData={[worklogData]} allCourses={false} />
        )}
      </div>
    </div>
  );
};

export default TeacherWorklogCourseDetail;
