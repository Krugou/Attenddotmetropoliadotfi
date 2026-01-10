import React, {useContext, useEffect, useMemo, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import PracticumData from '../../../../components/features/practicum/PracticumData.tsx';
import {UserContext} from '../../../../contexts/UserContext';
import apiHooks from '../../../../api';
import {useTranslation} from 'react-i18next';
import DetailPageLayout from '../../../../components/ui/layouts/DetailPageLayout.tsx';
import PracticumEntriesSection from '../../../../components/features/practicum/PracticumEntriesSection.tsx';

interface PracticumDetail {
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

const TeacherPracticumDetail: React.FC = () => {
  const {practicumid} = useParams<{practicumid: string}>();
  const practicumIdNum = useMemo(() => (practicumid ? Number(practicumid) : null), [practicumid]);

  const [practicumData, setPracticumData] = useState<PracticumDetail | null>(null);
  const {user} = useContext(UserContext);
  const {t} = useTranslation(['teacher']);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPracticum = async () => {
      if (!practicumIdNum) return;

      const token: string | null = localStorage.getItem('userToken');
      if (!token) return; // tai navigate('/login')

      const data = await apiHooks.getPracticumDetails(practicumIdNum, token);
      setPracticumData(data.practicum);
    };

    fetchPracticum();
  }, [practicumIdNum]);

  return (
    <DetailPageLayout
      title={practicumData?.name || t('teacher:practicum.detail.title')}
      backLabel={t('teacher:practicum.details.backToWorklog')}
      onBack={() =>
        navigate(user?.role === 'admin' ? '/teacher/practicum' : `/${user?.role}/practicum`)
      }
      maxWidthClassName="max-w-6xl"
    >
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start min-w-0">

          {/* Vasen: Practicum */}
          <div className="self-start min-w-0">
            {practicumData && (
              <PracticumData
                practicumData={[practicumData]}
                disableHover
              />
            )}
          </div>

          {/* Oikea: Entries */}
          <div className="rounded-2xl self-start min-w-0 w-full">
            {practicumIdNum && (
              <div className="w-full max-w-full p-6 bg-white rounded-2xl shadow-sm box-border border border-metropolia-main-orange/40 overflow-hidden">
                <PracticumEntriesSection practicumId={practicumIdNum} variant="embedded" />
              </div>
            )}
          </div>

        </div>
      </div>
    </DetailPageLayout>
  );
};

export default TeacherPracticumDetail;
