import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TopicIcon from '@mui/icons-material/Topic';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Tooltip from '@mui/material/Tooltip';

import React, {useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import apiHooks from '../../../api';
import GeneralLinkButton from '../../ui/buttons/GeneralLinkButton';
import DeleteModal from '../../ui/modals/DeleteModal';
import {useTranslation} from 'react-i18next';
import BaseCourseCard from '../../ui/cards/BaseCourseCard';

/* ---------- Types ---------- */
interface Course {
  courseid: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  code: string;
  studentgroup_name: string;
  topic_names: string;
  created_at: string;
  user_count: number;
  instructor_name: string;
}

interface CourseDataProps {
  courseData: Course[] | object;
  updateView?: () => void;
  allCourses?: boolean;
  showEndedCourses?: boolean;
  disableHover?: boolean;
}

/* ---------- Component ---------- */
const CourseData: React.FC<CourseDataProps> = ({
                                                 courseData,
                                                 updateView,
                                                 allCourses = false,
                                                 showEndedCourses = true,
                                                 disableHover = false,
                                               }) => {
  const {t} = useTranslation(['teacher']);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const navigate = useNavigate();

  /* ---------- Delete Logic ---------- */
  const openDeleteModal = (courseid: number) => {
    setSelectedCourseId(courseid);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleDeleteCourse = async (courseid: number) => {
    setIsDeleteModalOpen(false);
    const token = localStorage.getItem('userToken') ?? '';

    try {
      await apiHooks.deleteCourse(courseid, token);
      toast.success(t('teacher:courseData.success.deleted', 'Kurssi poistettu'));

      if (!allCourses) {
        navigate('/teacher/courses');
      } else if (updateView) {
        updateView();
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedCourseId !== null) handleDeleteCourse(selectedCourseId);
  };

  /* ---------- Filter ended courses ---------- */
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const normalizedData = useMemo(() => {
    if (!Array.isArray(courseData)) return [];
    let sorted = [...courseData].sort((a, b) => b.courseid - a.courseid);

    if (!showEndedCourses) {
      sorted = sorted.filter((c) => new Date(c.end_date) >= today);
    }
    return sorted;
  }, [courseData, showEndedCourses, today]);

  if (!normalizedData.length) {
    return (
      <div
        className="w-full col-span-full text-center mt-10 text-metropolia-main-grey">
        {t('teacher:courseData.noCourses', 'Ei kursseja')}
      </div>
    );
  }

  /* ---------- Rendering ---------- */
  return (
    <>
      {normalizedData.map((course) => {
        const endDate = new Date(course.end_date);
        const isEnded = endDate < today;

        const topics = course.topic_names
          ? course.topic_names.split(',').map((a) => a.trim())
          : [];

        const actions = (
          <>
            <div className="flex gap-2">
              <Tooltip title={t('teacher:courseData.tooltips.modifyCourse')}>
                <EditIcon
                  className="p-1 rounded-full bg-gray-200 cursor-pointer hover:bg-gray-300"
                  onClick={() => navigate(`/teacher/courses/${course.courseid}/modify`)}
                />
              </Tooltip>

              <Tooltip title={t('teacher:courseData.tooltips.deleteCourse')}>
                <DeleteIcon
                  className="p-1 text-red-600 rounded-full bg-gray-200 cursor-pointer hover:bg-red-700 hover:text-white"
                  onClick={() => openDeleteModal(course.courseid)}
                />
              </Tooltip>
            </div>
          </>
        );

        const footer = allCourses ? (
          <div className="grid grid-cols-2 gap-2">
            <GeneralLinkButton
              path={`/teacher/courses/${course.courseid}`}
              text={t('teacher:courseData.buttons.viewDetails')}
            />
            <GeneralLinkButton
              path={`/teacher/courses/attendances/${course.courseid}`}
              text={t('teacher:courseData.buttons.viewAttendances')}
            />
          </div>
        ) : (
          <>
            <div
              className="border-t-4 border-metropolia-main-orange mb-6"></div>

            <div className="text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-700">
                  {t('teacher:courseData.labels.courseCreatedAt')}
                </span>
                <span>{new Date(course.created_at).toLocaleDateString()}</span>
              </div>

              <div className="flex justify-between mt-2">
                <span className="text-gray-700">
                  {t('teacher:courseData.labels.amountOfStudents')}
                </span>
                <span>{course.user_count}</span>
              </div>

              <div className="flex justify-between mt-2">
                <span className="text-gray-700">
                  {t('teacher:courseData.labels.instructors')}
                </span>
                <span>{course.instructor_name}</span>
              </div>
            </div>

            <GeneralLinkButton
              path={`/teacher/courses/attendances/${course.courseid}`}
              text={t('teacher:courseData.buttons.viewAttendances')}
            />
          </>
        );

        return (
          <div key={course.courseid} className="flex justify-center">
            <Tooltip
              title={isEnded ? t('teacher:courseData.tooltips.courseEnded') : ''}
              placement="top"
            >
              <div>
                <BaseCourseCard
                  // title/actions jätetään tyhjiksi -> renderöidään oma header childrenissä
                  title=""
                  isEnded={isEnded}
                  actions={null}
                  footer={footer}
                  disableHover={disableHover}
                  // pakotetaan sama min-height
                  className="min-h-[300px]"
                >
                  {/* ---- Header ---- */}
                  <div className="flex justify-between items-start gap-3 mb-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-metropolia-main-orange/10">
                        <MenuBookIcon className="text-metropolia-main-orange" />
                      </div>

                      <div className="min-w-0">
                        <h2
                          className="text-lg font-heading gray-800 leading-snug">
                          {course.name}
                        </h2>

                        <div className="mt-1 text-sm text-gray-600 min-w-0">
                          <span
                            className="font-mono break-words">{course.code}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <div className="flex items-center gap-3">{actions}</div>

                      {course.studentgroup_name && (
                        <span
                          className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full max-w-[12rem] break-words text-right">
                          {course.studentgroup_name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ---- Dates ---- */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-start gap-2">
                      <CalendarMonthIcon
                        className="text-metropolia-main-orange mt-1" />
                      <div>
                        <div className="text-xs text-gray-500">
                          {t('teacher:courseData.labels.startDate')}
                        </div>
                        <div>{new Date(course.start_date).toLocaleDateString()}</div>

                        <div className="mt-1 text-xs text-gray-500">
                          {t('teacher:courseData.labels.endDate')}
                        </div>
                        <div>{new Date(course.end_date).toLocaleDateString()}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <TopicIcon className="text-metropolia-main-orange mt-1" />
                      <div>
                        <div className="text-xs text-gray-500">
                          {t('teacher:courseData.labels.topics')}
                        </div>

                        <div className="text-sm text-gray-800 line-clamp-2">
                          {topics.length
                            ? topics.join(', ')
                            : t('teacher:courseData.noTopics')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ---- Description ---- */}
                  {course.description && (
                    <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                      {course.description}
                    </p>
                  )}

                  {/* spacer jotta footer pysyy samalla tavalla alhaalla */}
                  <div className="flex-1" />
                </BaseCourseCard>
              </div>
            </Tooltip>
          </div>
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

export default CourseData;
