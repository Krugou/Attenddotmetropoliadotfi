import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Tooltip from '@mui/material/Tooltip';
import DeleteModal from '../modals/DeleteModal';
import apiHooks from '../../../api';
import GeneralLinkButton from '../buttons/GeneralLinkButton';

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
                className={`p-5 rounded-lg mt-4 mb-4 relative ${
                  isCourseEnded ? 'opacity-50 bg-gray-200' : 'bg-white'
                }`}>
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

export default WorklogData;
