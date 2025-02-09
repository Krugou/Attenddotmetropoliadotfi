import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Tooltip from '@mui/material/Tooltip';
import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import apiHooks from '../../../api';
import GeneralLinkButton from '../buttons/GeneralLinkButton';
import DeleteModal from '../modals/DeleteModal';
import {useTranslation} from 'react-i18next';

/**
 * Course interface represents the structure of a course.
 * It includes properties for the course id, name, description, start date, end date, code, student group name, topic names, created at date, user count, and instructor name.
 */
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

  // Include other properties of course here
}
/**
 * CourseDataProps interface represents the properties of the CourseData component.
 * It includes properties for the course data, update view function, and a boolean to check if all courses are being displayed.
 */
interface CourseDataProps {
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
const CourseData: React.FC<CourseDataProps> = ({
  courseData,
  updateView,
  allCourses,
  showEndedCourses,
}) => {
  const {t} = useTranslation(['translation']);
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
                  ? t('teacher.courseData.tooltips.courseEnded')
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
                      title={t(
                        'translation:teacher.courseData.tooltips.modifyCourse',
                      )}>
                      <EditIcon
                        fontSize='large'
                        className='p-1 text-black bg-gray-300 rounded-full cursor-pointer hover:text-gray-700'
                        onClick={() =>
                          navigate(`/teacher/courses/${course.courseid}/modify`)
                        }
                      />
                    </Tooltip>
                    <Tooltip
                      title={t(
                        'translation:teacher.courseData.tooltips.deleteCourse',
                      )}>
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
                      {t('translation:teacher.courseData.labels.startDate')}
                    </p>
                    <p>{new Date(course.start_date).toLocaleDateString()}</p>
                  </div>
                  <div className='flex justify-between'>
                    <p className='text-gray-700'>
                      {t('translation:teacher.courseData.labels.endDate')}
                    </p>
                    <p>{new Date(course.end_date).toLocaleDateString()}</p>
                  </div>
                  <div className='flex justify-between'>
                    <div className='text-gray-700'>
                      {t('translation:teacher.courseData.labels.code')}
                    </div>
                    <div>{course.code}</div>
                  </div>
                  <div className='flex justify-between'>
                    <p className='text-gray-700'>
                      {t('translation:teacher.courseData.labels.studentGroup')}
                    </p>
                    <p>{course.studentgroup_name}</p>
                  </div>
                  <div className='flex flex-col justify-between mb-4'>
                    <h2 className='mt-4 text-lg font-heading'>
                      {t('translation:teacher.courseData.labels.topics')}
                    </h2>
                    <p>{course.topic_names?.replace(/,/g, ', ')}</p>
                  </div>
                  {!allCourses ? (
                    <>
                      <div className='w-full border-t-4 border-metropolia-main-orange'></div>
                      <h2 className='mt-4 text-lg font-heading'>
                        {t(
                          'translation:teacher.courseData.labels.additionalInfo',
                        )}
                      </h2>
                      <div className='flex justify-between'>
                        <p className='text-gray-700'>
                          {t(
                            'translation:teacher.courseData.labels.courseCreatedAt',
                          )}
                        </p>
                        <p>
                          {new Date(course.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className='flex justify-between mb-4'>
                        <p className='text-gray-700'>
                          {t(
                            'translation:teacher.courseData.labels.amountOfStudents',
                          )}
                        </p>
                        <p>{course.user_count}</p>
                      </div>
                      <div className='w-full border-t-4 border-metropolia-main-orange'></div>
                      <div className='mt-4 mb-5'>
                        <h2 className='text-lg text-gray-700 font-heading'>
                          {t(
                            'translation:teacher.courseData.labels.instructors',
                          )}
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
                        text={t(
                          'translation:teacher.courseData.buttons.viewAttendances',
                        )}
                      />
                    </>
                  ) : (
                    <div className='flex justify-between'>
                      <GeneralLinkButton
                        path={`/teacher/courses/${course.courseid}`}
                        text={t(
                          'translation:teacher.courseData.buttons.viewDetails',
                        )}
                      />
                      <div className='ml-2'>
                        <GeneralLinkButton
                          path={`/teacher/courses/attendances/${course.courseid}`}
                          text={t(
                            'translation:teacher.courseData.buttons.viewAttendances',
                          )}
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

export default CourseData;
