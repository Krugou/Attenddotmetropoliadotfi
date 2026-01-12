import React, {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Tooltip from '@mui/material/Tooltip';

import DeleteModal from '../../ui/modals/DeleteModal.tsx';
import apiHooks from '../../../api';
import GeneralLinkButton from '../../ui/buttons/GeneralLinkButton.tsx';
import BaseCourseCard from '../../ui/cards/BaseCourseCard.tsx';

export interface WorkLogCourse {
  work_log_course_id: number;
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

interface WorklogDataProps {
  worklogData: WorkLogCourse[] | object;
  updateView?: () => void;
  allCourses?: boolean;
  showEndedCourses?: boolean;
  disableHover?: boolean;
}

const WorklogData: React.FC<WorklogDataProps> = ({
                                                   worklogData,
                                                   updateView,
                                                   allCourses = false,
                                                   showEndedCourses = true,
                                                   disableHover = false,
                                                 }) => {
  const {t} = useTranslation(['teacher']);
  const navigate = useNavigate();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedWorklogId, setSelectedWorklogId] = useState<number | null>(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  useEffect(() => {
    if (isDeleteModalOpen) document.body.classList.add('overflow-hidden');
    else document.body.classList.remove('overflow-hidden');
  }, [isDeleteModalOpen]);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  const handleDeleteWorklog = async (worklogid: number) => {
    const token = localStorage.getItem('userToken') || '';
    setIsDeleteModalOpen(false);

    try {
      await apiHooks.deleteWorklog(worklogid, token);
      toast.success(t('teacher:worklog.data.courseDeleted'));
      updateView?.();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || t('teacher:errors.generic'));
    }
  };

  const openDeleteModal = (worklogid: number) => {
    setSelectedWorklogId(worklogid);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  const handleConfirmDelete = () => {
    if (selectedWorklogId == null) return;
    handleDeleteWorklog(selectedWorklogId);
  };

  let filteredData: WorkLogCourse[] | object = worklogData;
  if (Array.isArray(worklogData) && !showEndedCourses) {
    filteredData = worklogData.filter((course) => {
      const end = new Date(course.end_date);
      end.setHours(0, 0, 0, 0);
      return end.getTime() >= today.getTime();
    });
  }

  return (
    <>
      {Array.isArray(filteredData) &&
        filteredData.map((worklog) => {
          const endDate = new Date(worklog.end_date);
          endDate.setHours(0, 0, 0, 0);
          const isCourseEnded = endDate.getTime() < today.getTime();

          const actions = (
            <>
              <div className="flex gap-2">
                <Tooltip title={t('teacher:worklog.data.modifyCourse')}>
                  <EditIcon
                    className="p-1 text-black bg-gray-300 rounded-full cursor-pointer hover:text-gray-700"
                    onClick={() =>
                      navigate(`/teacher/worklog/${worklog.work_log_course_id}/modify`)
                    }
                  />
                </Tooltip>

                <Tooltip title={t('teacher:worklog.data.deleteCourse')}>
                  <DeleteIcon
                    className="p-1 text-red-600 rounded-full bg-gray-200 cursor-pointer hover:bg-red-700 hover:text-white"
                    onClick={() => openDeleteModal(worklog.work_log_course_id)}
                  />
                </Tooltip>
              </div>
            </>

          );

          const footer = allCourses ? (
            <div className="grid grid-cols-1 gap-2 [&_a]:w-full [&_button]:w-full">
              <GeneralLinkButton
                path={`/teacher/worklog/${worklog.work_log_course_id}`}
                text={t('teacher:worklog.data.viewCourse')}
              />
            </div>
          ) : null;

          return (
            <Tooltip
              key={worklog.work_log_course_id}
              title={isCourseEnded ? t('teacher:worklog.data.courseEnded') : ''}
              placement="top"
            >
              <div>
                <BaseCourseCard
                  isEnded={isCourseEnded}
                  actions={actions}
                  footer={footer}
                  footerAlign="auto"
                  disableHover={disableHover}
                  header={
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-metropolia-main-orange/10">
                          <AssignmentIcon
                            className="text-metropolia-main-orange" />
                        </div>

                        <div className="min-w-0">
                          {/* Otsikko */}
                          <p
                            className="text-lg font-heading text-gray-800 leading-snug">
                            {worklog.name}
                          </p>

                          {/* Secondary-rivi */}
                          <div className="mt-0.5 text-sm text-gray-600">
                          </div>
                        </div>
                      </div>

                      {actions ? <div
                        className="flex gap-5 shrink-0">{actions}</div> : null}
                    </div>
                  }
                >
                  {/* ---- Ydininfo (2 saraketta + ikonit) ---- */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-2">
                      <CalendarMonthIcon
                        className="text-metropolia-main-orange mt-1" />
                      <div>
                        <div className="text-xs text-gray-500">
                          {t('teacher:worklog.data.startDate')}
                        </div>
                        <div>{new Date(worklog.start_date).toLocaleDateString()}</div>

                        <div className="mt-1 text-xs text-gray-500">
                          {t('teacher:worklog.data.endDate')}
                        </div>
                        <div>{new Date(worklog.end_date).toLocaleDateString()}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <ScheduleIcon
                        className="text-metropolia-main-orange mt-1" />
                      <div>
                        <div className="text-xs text-gray-500">
                          {t('teacher:worklog.data.requiredHours')}
                        </div>
                        <div>{worklog.required_hours}</div>
                      </div>
                    </div>
                  </div>

                  {/* ---- Kuvaus sekundäärinä ---- */}
                  <div className="mt-3">
                    <p className="text-sm font-heading text-gray-800">
                      {t('teacher:worklog.data.description')}
                    </p>
                    <p className="mt-0.5 text-sm text-metropolia-main-grey">
                      {worklog.description}
                    </p>
                  </div>

                  {/* ---- Lisätiedot (jos !allCourses) pidetään ennallaan, mutta CourseData-tyylillä ---- */}
                  {!allCourses ? (
                    <div className="mt-4">
                      <p className="text-sm font-heading text-gray-700">
                        {t('teacher:worklog.data.additionalInfo')}
                      </p>

                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <p
                            className="text-gray-600">{t('teacher:worklog.data.createdAt')}</p>
                          <p>{formatDate(worklog.created_at)}</p>
                        </div>

                        <div className="flex justify-between">
                          <p
                            className="text-gray-600">{t('teacher:worklog.data.studentCount')}</p>
                          <p>{worklog.user_count || 0}</p>
                        </div>

                        <div className="flex justify-between">
                          <p
                            className="text-gray-600">{t('teacher:worklog.data.instructor')}</p>
                          <p>{worklog.instructor_name}</p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </BaseCourseCard>

              </div>
            </Tooltip>
          );
        })}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onDelete={handleConfirmDelete}
        onClose={closeDeleteModal}
      />
    </>
  );
};

export default WorklogData;
