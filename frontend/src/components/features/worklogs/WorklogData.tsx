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
            <div className="grid grid-cols-2 gap-2 [&_a]:w-full [&_button]:w-full">
              <GeneralLinkButton
                path={`/teacher/worklog/group/${worklog.work_log_course_id}`}
                text={t('teacher:worklog.data.viewGroups')}
              />
              <GeneralLinkButton
                path={`/teacher/worklog/${worklog.work_log_course_id}`}
                text={t('teacher:worklog.data.viewCourse')}
              />
            </div>
          ) : (
            <GeneralLinkButton
              path={`/teacher/worklog/group/${worklog.work_log_course_id}`}
              text={t('teacher:worklog.data.viewGroups')}
            />
          );

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


/* OLD CODE DO NOT TOUCH THIS import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Tooltip from '@mui/material/Tooltip';
import DeleteModal from '../../ui/modals/DeleteModal.tsx';
import apiHooks from '../../../api';
import GeneralLinkButton from '../../ui/buttons/GeneralLinkButton.tsx';

interface WorkLogCourse {
  work_log_course_id: number; // Change this to match backend's property name
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

// TODO Päivitä prop-tyyppien tarkkuus
// worklogData on aina taulukko WorkLogCourse-olioita, joten tyypitys suoraan näin:
// interface WorklogDataProps {
//   worklogData: WorkLogCourse[];
//   updateView?: () => void;
//   allCourses?: boolean;
//   showEndedCourses?: boolean;
// }
// Tämä positaa tarpeen Array.isArray()-tarkistuksille.

interface WorklogDataProps {
  worklogData: object;
  updateView?: () => void;
  allCourses?: boolean;
  showEndedCourses?: boolean;
}

const WorklogData: React.FC<WorklogDataProps> = ({
  worklogData,
  updateView,
  allCourses,
  showEndedCourses,
}) => {
  const {t} = useTranslation(['teacher']);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedWorklogId, setSelectedWorklogId] = useState<number | null>(
    null,
  );
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleDeleteWorklog = async (worklogid: number) => {
    setIsDeleteModalOpen(false);
    const token = localStorage.getItem('userToken') || '';

    try {
      await apiHooks.deleteWorklog(worklogid, token);
      toast.success(t('teacher:worklog.deleteSuccess'));

      if (!allCourses) {
        navigate('/teacher/worklog');
      } else {
        if (updateView) updateView();
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const openDeleteModal = (worklogid: number) => {
    setSelectedWorklogId(worklogid);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  useEffect(() => {
    if (isDeleteModalOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [isDeleteModalOpen]);

  const handleDelete = () => {
    if (selectedWorklogId !== null) {
      handleDeleteWorklog(selectedWorklogId);
    }
  };

  // TODO Älä muokkaa proppeja suoraan
  // Paikallinen muuttuja, esim. displayData ja käyttö:
  // let displayData = worklogData;
  // if (!showEndedCourses) {
  //   displayData = worklogData.filter(
  //     (course) =>
  //       new Date(course.end_date).setHours(0, 0, 0, 0) >=
  //       new Date().setHours(0, 0, 0, 0),
  //   );
  // }
  // korvaa returnin sisään "worklogData.map(...)" -> "displayData.map(...)"
  // eli ei {Array.isArray(worklogData) &&
  //       worklogData.map((worklog: WorkLogCourse) => {
  //         ...
  //       })}
  // VAAN:
  //{displayData.map((worklog: WorkLogCourse) => {
  //       ...
  //     })}

  if (Array.isArray(worklogData) && showEndedCourses === false) {
    worklogData = worklogData.filter(
      (course) =>
        new Date(course.end_date).setHours(0, 0, 0, 0) >=
        new Date().setHours(0, 0, 0, 0),
    );
  }

  return (
    <>
      {Array.isArray(worklogData) &&
        worklogData.map((worklog: WorkLogCourse) => {
          const endDate = new Date(worklog.end_date);
          const isCourseEnded =
            endDate.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
          return (
            <Tooltip
              key={worklog.work_log_course_id} // Change this
              title={isCourseEnded ? t('teacher:worklog.data.courseEnded') : ''}
              placement='top'>
              <div
                className={[
                  'mt-4 mb-4 relative p-5 rounded-2xl shadow-md border flex flex-col',
                  'transition-shadow transition-transform duration-200 ease-out will-change-transform',
                  isCourseEnded
                    ? 'bg-gray-100 border-gray-300 opacity-70'
                    : 'bg-white border-metropolia-main-orange/30 hover:shadow-lg hover:-translate-y-1',
                ].join(' ')}>
                <div className='flex items-center justify-between'>
                  <p className='text-lg font-heading'>{worklog.name}</p>
                  <div className='flex gap-5'>
                    <Tooltip title={t('teacher:worklog.data.modifyCourse')}>
                      <EditIcon
                        fontSize='large'
                        className='p-1 text-black bg-gray-300 rounded-full cursor-pointer hover:text-gray-700'
                        onClick={() =>
                          navigate(
                            `/teacher/worklog/${worklog.work_log_course_id}/modify`,
                          )
                        }
                      />
                    </Tooltip>
                    <Tooltip title={t('teacher:worklog.data.deleteCourse')}>
                      <DeleteIcon
                        fontSize='large'
                        className='p-1 text-red-500 bg-gray-300 rounded-full cursor-pointer hover:text-red-700'
                        onClick={() =>
                          openDeleteModal(worklog.work_log_course_id)
                        }
                      />
                    </Tooltip>
                  </div>
                </div>
                <div className='mt-2'>
                  <div className='flex justify-between'>
                    <p className='text-gray-700'>
                      {t('teacher:worklog.data.courseCode')}
                    </p>
                    <div>{worklog.code}</div>
                  </div>
                  <div className='flex justify-between'>
                    <p className='text-gray-700'>
                      {t('teacher:worklog.data.startDate')}
                    </p>
                    <p>{new Date(worklog.start_date).toLocaleDateString()}</p>
                  </div>
                  <div className='flex justify-between'>
                    <p className='text-gray-700'>
                      {t('teacher:worklog.data.endDate')}
                    </p>
                    <p>{new Date(worklog.end_date).toLocaleDateString()}</p>
                  </div>
                  <div className='flex justify-between'>
                    <p>{t('teacher:worklog.data.requiredHours')}</p>
                    <p>{worklog.required_hours}</p>
                  </div>
                  <div className=''>
                    <p className='text-sm font-heading mt-2'>
                      {t('teacher:worklog.data.description')}
                    </p>
                    <p className='text-sm text-metropolia-main-grey mb-2'>
                      {worklog.description}
                    </p>
                  </div>
                  {!allCourses ? (
                    <>
                      <div className='w-full border-t-4 border-metropolia-main-orange mt-4'></div>
                      <h2 className='text-lg font-heading mb-3'>
                        {t('teacher:worklog.data.additionalInfo')}
                      </h2>
                      <div className='flex justify-between mb-2'>
                        <p className='text-gray-700'>
                          {t('teacher:worklog.data.createdAt')}
                        </p>
                        <p>{formatDate(worklog.created_at || '')}</p>
                      </div>
                      <div className='flex justify-between mb-2'>
                        <p className='text-gray-700'>
                          {t('teacher:worklog.data.studentCount')}
                        </p>
                        <p>{worklog.user_count || 0}</p>
                      </div>
                      <div className='w-full border-t-4 border-metropolia-main-orange mt-4'></div>
                      <div className='mt-4 mb-4'>
                        <h2 className='text-lg font-heading text-gray-700 mb-2'>
                          {t('teacher:worklog.data.instructors')}
                        </h2>
                        <ul className='list-none pl-5'>
                          {worklog.instructor_name
                            ?.split(',')
                            ?.map((instructor) => (
                              <li
                                key={instructor.trim()}
                                className='text-gray-700'>
                                {instructor.trim()}
                              </li>
                            )) || (
                            <li className='text-gray-700'>
                              {t('teacher:worklog.noInstructors')}
                            </li>
                          )}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <div className='flex justify-end gap-2 mt-4'>
                      <GeneralLinkButton
                        path={`/teacher/worklog/group/${worklog.work_log_course_id}`}
                        text={t('teacher:worklog.data.viewGroups')}
                      />
                      <GeneralLinkButton
                        path={`/teacher/worklog/${worklog.work_log_course_id}`}
                        text={t('teacher:worklog.data.viewCourse')}
                      />
                    </div>
                  )}
                </div>
              </div>
            </Tooltip>
          );
        })}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onDelete={handleDelete}
        onClose={closeDeleteModal}
      />
    </>
  );
};

export default WorklogData;*/
