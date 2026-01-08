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

/*import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Tooltip from '@mui/material/Tooltip';
import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import apiHooks from '../../../api';
import GeneralLinkButton from '../../ui/buttons/GeneralLinkButton.tsx';
import DeleteModal from '../../ui/modals/DeleteModal.tsx';
import {useTranslation} from 'react-i18next';

/**
 * Course interface represents the structure of a course.
 * It includes properties for the course id, name, description, start date, end date, code, student group name, topic names, created at date, user count, and instructor name.
 */
/*interface Course {
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

  // Include other properties of course here
}
/**
 * CourseDataProps interface represents the properties of the CourseData component.
 * It includes properties for the course data, update view function, and a boolean to check if all courses are being displayed.
 */
/*interface CourseDataProps {
  courseData: object;
  updateView?: () => void;
  allCourses?: boolean;
  showEndedCourses?: boolean;
}
/**
 * CourseData component.
 * This component is responsible for displaying the data of a course.
 * It uses the useState hook from React to manage the state of the delete modal and selected course id.
 * The component also uses the useNavigate hook from React Router to navigate between pages.
 * The handleDeleteCourse function is used to delete a course.
 * The openDeleteModal function is used to open the delete modal.
 * The closeDeleteModal function is used to close the delete modal.
 * The useEffect hook is used to add or remove the 'overflow-hidden' class from the body based on the state of the delete modal.
 * The handleDelete function is used to delete a course if a course id is selected.
 *
 * @param {CourseDataProps} props The properties of the CourseData component.
 * @returns {JSX.Element} The rendered CourseData component.
 */
/*const CourseData: React.FC<CourseDataProps> = ({
  courseData,
  updateView,
  allCourses,
  showEndedCourses,
}) => {
  const {t} = useTranslation(['teacher']);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  const navigate = useNavigate();

  const handleDeleteCourse = async (courseid: number) => {
    setIsDeleteModalOpen(false);

    // Get token from local storage
    const token: string = localStorage.getItem('userToken') || '';
    try {
      await apiHooks.deleteCourse(courseid, token);

      toast.success('Course deleted');
      // Check if we are in the TeacherCourseDetail route
      if (!allCourses) {
        // If so, navigate to TeacherCourses
        navigate('/teacher/courses');
      } else {
        // Otherwise, update the view
        if (updateView) updateView();
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const openDeleteModal = (courseid: number) => {
    setSelectedCourseId(courseid);
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
    if (selectedCourseId !== null) {
      handleDeleteCourse(selectedCourseId);
    }
  };

  if (Array.isArray(courseData) && showEndedCourses === false) {
    courseData = courseData.filter(
      (course) =>
        new Date(course.end_date).setHours(0, 0, 0, 0) >=
        new Date().setHours(0, 0, 0, 0),
    );
  }

  return (
    <>
      {Array.isArray(courseData) &&
        courseData.map((course: Course) => {
          const endDate = new Date(course.end_date);
          const isCourseEnded =
            endDate.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
          return (
            <Tooltip
              key={course.courseid}
              title={
                isCourseEnded
                  ? t('teacher:courseData.tooltips.courseEnded')
                  : ''
              }
              placement='top'>
              <div
                key={course.courseid}
                className={`p-5 rounded-lg mt-4 mb-4 relative ${
                  isCourseEnded ? 'opacity-50 bg-gray-200' : 'bg-white'
                }`}>
                <div className='flex items-center justify-between'>
                  <p className='text-lg font-heading'>{course.name}</p>
                  <p className='text-base text-gray-700'>
                    {course.description}
                  </p>
                  <div className='flex gap-5'>
                    <Tooltip
                      title={t('teacher:courseData.tooltips.modifyCourse')}>
                      <EditIcon
                        fontSize='large'
                        className='p-1 text-black bg-gray-300 rounded-full cursor-pointer hover:text-gray-700'
                        onClick={() =>
                          navigate(`/teacher/courses/${course.courseid}/modify`)
                        }
                      />
                    </Tooltip>
                    <Tooltip
                      title={t('teacher:courseData.tooltips.deleteCourse')}>
                      <DeleteIcon
                        fontSize='large'
                        className='p-1 text-red-500 bg-gray-300 rounded-full cursor-pointer hover:text-red-700'
                        onClick={() => openDeleteModal(course.courseid)}
                      />
                    </Tooltip>
                  </div>
                </div>
                <div className='mt-2'>
                  <div className='flex justify-between'>
                    <p className='text-gray-700'>
                      {t('teacher:courseData.labels.startDate')}
                    </p>
                    <p>{new Date(course.start_date).toLocaleDateString()}</p>
                  </div>
                  <div className='flex justify-between'>
                    <p className='text-gray-700'>
                      {t('teacher:courseData.labels.endDate')}
                    </p>
                    <p>{new Date(course.end_date).toLocaleDateString()}</p>
                  </div>
                  <div className='flex justify-between'>
                    <div className='text-gray-700'>
                      {t('teacher:courseData.labels.code')}
                    </div>
                    <div>{course.code}</div>
                  </div>
                  <div className='flex justify-between'>
                    <p className='text-gray-700'>
                      {t('teacher:courseData.labels.studentGroup')}
                    </p>
                    <p>{course.studentgroup_name}</p>
                  </div>
                  <div className='flex flex-col justify-between mb-4'>
                    <h2 className='mt-4 text-lg font-heading'>
                      {t('teacher:courseData.labels.topics')}
                    </h2>
                    <p>{course.topic_names?.replace(/,/g, ', ')}</p>
                  </div>
                  {!allCourses ? (
                    <>
                      <div className='w-full border-t-4 border-metropolia-main-orange'></div>
                      <h2 className='mt-4 text-lg font-heading'>
                        {t('teacher:courseData.labels.additionalInfo')}
                      </h2>
                      <div className='flex justify-between'>
                        <p className='text-gray-700'>
                          {t('teacher:courseData.labels.courseCreatedAt')}
                        </p>
                        <p>
                          {new Date(course.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className='flex justify-between mb-4'>
                        <p className='text-gray-700'>
                          {t('teacher:courseData.labels.amountOfStudents')}
                        </p>
                        <p>{course.user_count}</p>
                      </div>
                      <div className='w-full border-t-4 border-metropolia-main-orange'></div>
                      <div className='mt-4 mb-5'>
                        <h2 className='text-lg text-gray-700 font-heading'>
                          {t('teacher:courseData.labels.instructors')}
                        </h2>
                        <ul>
                          {course.instructor_name
                            .split(',')
                            .map((instructor) => (
                              <li key={instructor.trim()}>
                                {instructor.trim()}
                              </li>
                            ))}
                        </ul>
                      </div>
                      <GeneralLinkButton
                        path={`/teacher/courses/attendances/${course.courseid}`}
                        text={t('teacher:courseData.buttons.viewAttendances')}
                      />
                    </>
                  ) : (
                    <div className='flex justify-between'>
                      <GeneralLinkButton
                        path={`/teacher/courses/${course.courseid}`}
                        text={t('teacher:courseData.buttons.viewDetails')}
                      />
                      <div className='ml-2'>
                        <GeneralLinkButton
                          path={`/teacher/courses/attendances/${course.courseid}`}
                          text={t('teacher:courseData.buttons.viewAttendances')}
                        />
                      </div>
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

export default CourseData;*/
