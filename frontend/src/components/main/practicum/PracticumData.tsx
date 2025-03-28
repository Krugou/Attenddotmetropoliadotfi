import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Tooltip from '@mui/material/Tooltip';
import DeleteModal from '../modals/DeleteModal';
import apiHooks from '../../../api';
import GeneralLinkButton from '../buttons/GeneralLinkButton';

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
}

const PracticumData: React.FC<PracticumDataProps> = ({
  practicumData,
  updateView,
  allPracticums = false,
  showEndedPracticums = true,
}) => {
  const { t } = useTranslation(['teacher']);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPracticumId, setSelectedPracticumId] = useState<number | null>(
    null,
  );
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleDeletePracticum = async (practicumId: number) => {
    setIsDeleteModalOpen(false);
    const token = localStorage.getItem('userToken') || '';

    try {
      await apiHooks.deletePracticum(practicumId, token);
      toast.success(t('teacher:practicum.deleteSuccess'));

      if (!allPracticums) {
        navigate('/teacher/practicum');
      } else {
        if (updateView) updateView();
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const openDeleteModal = (practicumId: number) => {
    setSelectedPracticumId(practicumId);
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
    if (selectedPracticumId !== null) {
      handleDeletePracticum(selectedPracticumId);
    }
  };

  let filteredData = practicumData;
  if (Array.isArray(practicumData) && !showEndedPracticums) {
    filteredData = practicumData.filter(
      (practicum) =>
        new Date(practicum.end_date).setHours(0, 0, 0, 0) >=
        new Date().setHours(0, 0, 0, 0),
    );
  }

  return (
    <>
      {Array.isArray(filteredData) &&
        filteredData.map((practicum: WorkLogPracticum) => {
          const endDate = new Date(practicum.end_date);
          const isPracticumEnded =
            endDate.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
          return (
            <Tooltip
              key={practicum.work_log_practicum_id}
              title={isPracticumEnded ? t('teacher:practicum.data.practicumEnded') : ''}
              placement="top">
              <div
                className={`p-5 rounded-lg mt-4 mb-4 relative ${
                  isPracticumEnded ? 'opacity-50 bg-gray-200' : 'bg-white'
                }`}>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-heading">{practicum.name}</p>
                  <div className="flex gap-5">
                    <Tooltip title={t('teacher:practicum.data.modifyPracticum')}>
                      <EditIcon
                        fontSize="large"
                        className="p-1 text-black bg-gray-300 rounded-full cursor-pointer hover:text-gray-700"
                        onClick={() =>
                          navigate(
                            `/teacher/practicum/${practicum.work_log_practicum_id}/modify`,
                          )
                        }
                      />
                    </Tooltip>
                    <Tooltip title={t('teacher:practicum.data.deletePracticum')}>
                      <DeleteIcon
                        fontSize="large"
                        className="p-1 text-red-500 bg-gray-300 rounded-full cursor-pointer hover:text-red-700"
                        onClick={() =>
                          openDeleteModal(practicum.work_log_practicum_id)
                        }
                      />
                    </Tooltip>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between">
                    <p className="text-gray-700">
                      {t('teacher:practicum.data.startDate')}
                    </p>
                    <p>{new Date(practicum.start_date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-700">
                      {t('teacher:practicum.data.endDate')}
                    </p>
                    <p>{new Date(practicum.end_date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>{t('teacher:practicum.data.requiredHours')}</p>
                    <p>{practicum.required_hours}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>{t('teacher:practicum.data.studentName')}</p>
                    <p>{practicum.first_name}{practicum.last_name}</p>
                  </div>
                  <div className="">
                    <p className="text-sm font-heading mt-2">
                      {t('teacher:practicum.data.description')}
                    </p>
                    <p className="text-sm text-metropolia-main-grey mb-2">
                      {practicum.description}
                    </p>
                  </div>
                  {!allPracticums ? (
                    <>
                      <div className="w-full border-t-4 border-metropolia-main-orange mt-4"></div>
                      <h2 className="text-lg font-heading mb-3">
                        {t('teacher:practicum.data.additionalInfo')}
                      </h2>
                      <div className="flex justify-between mb-2">
                        <p className="text-gray-700">
                          {t('teacher:practicum.data.createdAt')}
                        </p>
                        <p>{formatDate(practicum.created_at || '')}</p>
                      </div>
                      {practicum.user_count !== undefined && (
                        <div className="flex justify-between mb-2">
                          <p className="text-gray-700">
                            {t('teacher:practicum.data.studentCount')}
                          </p>
                          <p>{practicum.user_count}</p>
                        </div>
                      )}
                      <div className="w-full border-t-4 border-metropolia-main-orange mt-4"></div>
                      <div className="mt-4 mb-4">
                        <h2 className="text-lg font-heading text-gray-700 mb-2">
                          {t('teacher:practicum.data.instructors')}
                        </h2>
                        <ul className="list-none pl-5">
                          {practicum.instructor_name
                            ?.split(',')
                            ?.map((instructor) => (
                              <li
                                key={instructor.trim()}
                                className="text-gray-700">
                                {instructor.trim()}
                              </li>
                            )) || (
                            <li className="text-gray-700">
                              {t('teacher:practicum.noInstructors')}
                            </li>
                          )}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-end gap-2 mt-4">
                        <GeneralLinkButton
                        path={`/teacher/practicum/${practicum.work_log_practicum_id}/entries`}
                        text={t('teacher:practicum.data.viewEntries')}
                      />
                      <GeneralLinkButton
                        path={`/teacher/practicum/${practicum.work_log_practicum_id}`}
                        text={t('teacher:practicum.data.viewPracticum')}
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

export default PracticumData;
