import React, {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SchoolIcon from '@mui/icons-material/School';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import Tooltip from '@mui/material/Tooltip';

import DeleteModal from '../../ui/modals/DeleteModal.tsx';
import apiHooks from '../../../api';
import GeneralLinkButton from '../../ui/buttons/GeneralLinkButton.tsx';
import BaseCourseCard from '../../ui/cards/BaseCourseCard.tsx';

interface WorkLogPracticum {
  work_log_practicum_id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  required_hours: number;
  created_at: string;
  user_count?: number;
  instructor_name?: string;
  first_name?: string;
  last_name?: string;
}

interface PracticumDataProps {
  practicumData: WorkLogPracticum[] | object;
  updateView?: () => void;
  allPracticums?: boolean;
  showEndedPracticums?: boolean;
  disableHover?: boolean;
  hideEntriesButton?: boolean;
}

const PracticumData: React.FC<PracticumDataProps> = ({
                                                       practicumData,
                                                       updateView,
                                                       allPracticums = false,
                                                       showEndedPracticums = true,
                                                       disableHover = false,
                                                     }) => {
  const {t} = useTranslation(['teacher']);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPracticumId, setSelectedPracticumId] = useState<number | null>(null);
  const navigate = useNavigate();

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  const handleDeletePracticum = async (practicumId: number) => {
    setIsDeleteModalOpen(false);
    const token = localStorage.getItem('userToken') || '';

    try {
      await apiHooks.deletePracticum(practicumId, token);
      toast.success(t('teacher:practicum.deleteSuccess'));

      if (!allPracticums) {
        navigate('/teacher/practicum');
      } else {
        updateView?.();
      }
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  const openDeleteModal = (practicumId: number) => {
    setSelectedPracticumId(practicumId);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  useEffect(() => {
    if (isDeleteModalOpen) document.body.classList.add('overflow-hidden');
    else document.body.classList.remove('overflow-hidden');
  }, [isDeleteModalOpen]);

  const handleDelete = () => {
    if (selectedPracticumId !== null) handleDeletePracticum(selectedPracticumId);
  };

  let filteredData = practicumData;
  if (Array.isArray(practicumData) && !showEndedPracticums) {
    filteredData = practicumData.filter((practicum) => {
      const end = new Date(practicum.end_date);
      end.setHours(0, 0, 0, 0);
      return end.getTime() >= today.getTime();
    });
  }

  return (
    <>
      {Array.isArray(filteredData) &&
        filteredData.map((practicum) => {
          const endDate = new Date(practicum.end_date);
          endDate.setHours(0, 0, 0, 0);
          const isPracticumEnded = endDate.getTime() < today.getTime();

          const studentName = `${practicum.first_name ?? ''} ${practicum.last_name ?? ''}`.trim();

          const actions = (
            <>
              <div className="flex gap-2">
                <Tooltip title={t('teacher:practicum.data.modifyPracticum')}>
                  <EditIcon
                    className="p-1 text-black bg-gray-300 rounded-full cursor-pointer hover:text-gray-700"
                    onClick={() =>
                      navigate(`/teacher/practicum/${practicum.work_log_practicum_id}/modify`)
                    }
                  />
                </Tooltip>

                <Tooltip title={t('teacher:practicum.data.deletePracticum')}>
                  <DeleteIcon
                    className="p-1 text-red-600 rounded-full bg-gray-200 cursor-pointer hover:bg-red-700 hover:text-white"
                    onClick={() => openDeleteModal(practicum.work_log_practicum_id)}
                  />
                </Tooltip>
              </div>
            </>
          );


          const detailBtn = (
            <GeneralLinkButton
              path={`/teacher/practicum/${practicum.work_log_practicum_id}`}
              text={t('teacher:practicum.data.viewPracticum')}
            />
          );

          const footer = allPracticums ? (
            <div className="grid grid-cols-1 gap-2 [&_a]:w-full">
              {detailBtn}
            </div>
          ) : null;

          return (
            <Tooltip
              key={practicum.work_log_practicum_id}
              title={isPracticumEnded ? t('teacher:practicum.data.practicumEnded') : ''}
              placement="top"
            >
              <div>
                <BaseCourseCard
                  isEnded={isPracticumEnded}
                  actions={actions}
                  footer={footer}
                  footerAlign="auto"
                  disableHover={disableHover}
                  header={
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-metropolia-main-orange/10">
                          <SchoolIcon className="text-metropolia-main-orange" />
                        </div>

                        <div className="min-w-0">
                          <p
                            className="text-lg font-heading text-gray-800 leading-snug">
                            {practicum.name}
                          </p>
                        </div>
                      </div>

                      {actions ? <div
                        className="flex gap-5 shrink-0">{actions}</div> : null}
                    </div>
                  }
                >
                  {/* ---- Ydininfo (CourseData-tyylinen) ---- */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {/* VASEN SARKE: Päivät */}
                    <div className="flex items-start gap-2">
                      <CalendarMonthIcon
                        className="text-metropolia-main-orange mt-1" />
                      <div>
                        <div
                          className="text-xs text-gray-500">{t('teacher:practicum.data.startDate')}</div>
                        <div>{new Date(practicum.start_date).toLocaleDateString()}</div>

                        <div
                          className="mt-1 text-xs text-gray-500">{t('teacher:practicum.data.endDate')}</div>
                        <div>{new Date(practicum.end_date).toLocaleDateString()}</div>
                      </div>
                    </div>

                    {/* OIKEA SARKE: Tunnit + Oppilas (sama sarake, päällekkäin) */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <ScheduleIcon
                          className="text-metropolia-main-orange mt-1" />
                        <div>
                          <div className="text-xs text-gray-500">
                            {t('teacher:practicum.data.requiredHours')}
                          </div>
                          <div>{practicum.required_hours}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <PersonOutlineIcon
                          className="text-metropolia-main-orange mt-0.5" />
                        <div className="min-w-0">
                          <div className="text-xs text-gray-500">
                            {t('teacher:practicum.data.studentName')}
                          </div>
                          <div
                            className="break-words">{studentName || '-'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ---- Kuvaus ---- */}
                  <div className="mt-3">
                    <p className="text-sm font-heading text-gray-800">
                      {t('teacher:practicum.data.description')}
                    </p>
                    <p className="mt-0.5 text-sm text-metropolia-main-grey">
                      {practicum.description}
                    </p>
                  </div>

                  {!allPracticums ? (
                    <div className="mt-4">
                      <div className="mt-4">
                        <p className="text-sm font-heading text-gray-700">
                          {t('teacher:practicum.data.instructors')}
                        </p>
                        <ul className="space-y-1">
                          {practicum.instructor_name
                            ?.split(',')
                            ?.map((instructor) => (
                              <li key={instructor.trim()}
                                  className="text-gray-700">
                                {instructor.trim()}
                              </li>
                            )) || (
                            <li
                              className="text-gray-700">{t('teacher:practicum.noInstructors')}</li>
                          )}
                        </ul>
                      </div>
                      <p className="mt-4 text-sm font-heading text-gray-700">
                        {t('teacher:practicum.data.additionalInfo')}
                      </p>

                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <p
                            className="text-gray-600">{t('teacher:practicum.data.createdAt')}</p>
                          <p>{formatDate(practicum.created_at || '')}</p>
                        </div>

                        {practicum.user_count !== undefined && (
                          <div className="flex justify-between">
                            <p
                              className="text-gray-600">{t('teacher:practicum.data.studentCount')}</p>
                            <p>{practicum.user_count}</p>
                          </div>
                        )}
                      </div>

                    </div>
                  ) : null}
                </BaseCourseCard>
              </div>
            </Tooltip>
          );
        })}

      <DeleteModal isOpen={isDeleteModalOpen} onDelete={handleDelete}
                   onClose={closeDeleteModal} />
    </>
  );
};

export default PracticumData;
