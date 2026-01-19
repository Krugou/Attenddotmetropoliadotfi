import React, {useContext, useEffect, useState, useMemo} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import WorklogData from '../../../../components/features/worklogs/WorklogData.tsx';
import {UserContext} from '../../../../contexts/UserContext';
import apiHooks from '../../../../api';
import {useTranslation} from 'react-i18next';
import DetailPageLayout from '../../../../components/ui/layouts/DetailPageLayout.tsx';
import WorklogGroupsSection from '../../../../components/features/worklogs/WorklogGroupsSection.tsx';

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
  const {courseid} = useParams<{courseid: string}>();
  const courseIdNum = useMemo(() => (courseid ? Number(courseid) : null), [courseid]);
  const [worklogData, setWorklogData] = useState<WorkLogDetail | null>(null);

  const {user} = useContext(UserContext);
  const {t} = useTranslation(['teacher']);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorklog = async () => {
      if (!courseid) return;

      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No token available');

      const data = await apiHooks.getWorkLogCourseDetail(courseid, token);
      setWorklogData(data.course);
    };

    fetchWorklog();
  }, [courseid]);

  return (
    <DetailPageLayout
      title={worklogData?.name || t('teacher:worklog.detail.title')}
      backLabel={t('teacher:worklog.detail.backToWorklog')}
      onBack={() =>
        navigate(user?.role === 'admin' ? '/teacher/worklog' : `/${user?.role}/worklog`)
      }
      maxWidthClassName="max-w-6xl"
    >
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start min-w-0">

          {/* Vasen: Worklog */}
          <div className="self-start min-w-0">
            {worklogData && (
              <WorklogData worklogData={[worklogData]} allCourses={false} disableHover />
            )}
          </div>

          {/* Oikea: Groups + Group + Stats */}
          <div className="rounded-2xl self-start min-w-0 w-full">
            {courseIdNum && (
              <div className="w-full max-w-full p-6 bg-white rounded-2xl shadow-sm box-border border border-metropolia-main-orange/40 overflow-hidden">
                <WorklogGroupsSection courseId={courseIdNum} />
              </div>
            )}
          </div>

        </div>
      </div>
    </DetailPageLayout>
  );
};

export default TeacherWorklogCourseDetail;
