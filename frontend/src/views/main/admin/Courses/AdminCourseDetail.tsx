import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Tooltip from '@mui/material/Tooltip';
import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import DeleteModal from '../../../../components/main/modals/DeleteModal';
import apiHooks from '../../../../api';
import {useTranslation} from 'react-i18next';

/**
 * CourseDetail interface.
 * This interface defines the shape of a course detail object.
 */
interface CourseDetail {
  courseid: number;
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  code: string;
  studentgroup_name: string;
  created_at: string;
  topic_names: string[];
  user_count: number;
  instructor_name: string;
}
/**
 * Course interface.
 * This interface defines the shape of a course object.
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
 * AdminCourseDetail component.
 * This component is responsible for rendering the course detail view for an admin.
 * It includes information about the course such as its name, description, start and end dates, code, student group, topics, instructors, and creation date.
 * It also includes buttons for editing and deleting the course, and a modal for confirming the deletion.
 *
 * @returns {JSX.Element} The rendered AdminCourseDetail component.
 */
const AdminCourseDetail: React.FC = () => {
  const {t} = useTranslation(['translation']);
  const {id} = useParams<{id: string}>();
  const [courseData, setCourseData] = useState<CourseDetail | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  const navigate = useNavigate();

  const handleDeleteCourse = async (courseid: number) => {
    setIsDeleteModalOpen(false);

    // Get token from local storage
    const token: string = localStorage.getItem('userToken') || '';
    try {
      await apiHooks.deleteCourse(courseid, token);

      toast.success(t('admin.courses.delete.success'));

      navigate('/admin/courses');
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

  useEffect(() => {
    const fetchCourse = async () => {
      if (id) {
        const token: string | null = localStorage.getItem('userToken');
        if (!token) {
          throw new Error('No token available');
        }
        const courseData = await apiHooks.getCourseDetailByCourseId(id, token);

        setCourseData(courseData);
      }
    };

    fetchCourse();
  }, [id]);

  return (
    <>
      <h2 className='p-3 text-lg bg-white rounded-lg font-heading'>
        {t('translation:admin.common.courseId')} {id}
      </h2>
      <div className='w-full m-4 mx-auto bg-white rounded-lg shadow-lg sm:w-3/4 md:w-2/4 lg:w-2/5 2xl:w-1/5'>
        <>
          {Array.isArray(courseData) &&
            courseData.map((course: Course) => (
              <div
                key={course.courseid}
                className='relative p-5 mt-4 mb-4 bg-white rounded-lg'>
                {/* Add a relative position to the card container */}
                <Tooltip title='Modify this course'>
                  <EditIcon
                    fontSize='large'
                    className='absolute top-0 right-0 p-1 m-4 mr-16 text-black bg-gray-300 rounded-full cursor-pointer hover:text-gray-700'
                    onClick={() =>
                      navigate(`/admin/courses/${course.courseid}/modify`)
                    }
                  />
                </Tooltip>
                <Tooltip
                  title={t('translation:admin.courses.delete.deleteCourse')}>
                  <DeleteIcon
                    fontSize='large'
                    className='absolute top-0 right-0 p-1 m-4 text-red-500 bg-gray-300 rounded-full cursor-pointer hover:text-red-700'
                    onClick={() => openDeleteModal(course.courseid)}
                  />
                </Tooltip>
                {/* Position the DeleteIcon at the top right corner */}
                <p className='text-lg font-heading'>{course.name}</p>
                <p className='text-base text-gray-700'>{course.description}</p>
                <div className='mt-2'>
                  <div className='flex justify-between'>
                    <p className='text-gray-700'>
                      {t('translation:admin.common.startDate')}:
                    </p>
                    <p>{new Date(course.start_date).toLocaleDateString()}</p>
                  </div>
                  <div className='flex justify-between'>
                    <p className='text-gray-700'>
                      {t('translation:admin.common.endDate')}:
                    </p>
                    <p>{new Date(course.end_date).toLocaleDateString()}</p>
                  </div>
                  <div className='flex justify-between'>
                    <div className='text-gray-700'>
                      {t('translation:admin.common.code')}:
                    </div>
                    <div>{course.code}</div>
                  </div>
                  <div className='flex justify-between'>
                    <p className='text-gray-700'>
                      {t('translation:admin.common.studentGroup')}:
                    </p>
                    <p>{course.studentgroup_name}</p>
                  </div>
                  <div className='flex flex-col justify-between mb-4'>
                    <h2 className='mt-4 text-lg font-heading'>
                      {t('translation:admin.common.topics')}:
                    </h2>
                    <p>{course.topic_names?.replace(/,/g, ', ')}</p>
                  </div>
                  <div className='w-full border-t-4 border-metropolia-main-orange'></div>
                  <h2 className='mt-4 mb-2 text-lg font-heading'>
                    {' '}
                    {t('translation:admin.common.additionalInfo')}
                  </h2>
                  <div className='flex justify-between'>
                    <p className='text-gray-700'>
                      {t('translation:admin.common.courseCreatedAt')}:
                    </p>
                    <p>{new Date(course.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className='flex justify-between'>
                    <p className='text-gray-700'>
                      {t('translation:admin.common.ammountOfStudents')}
                    </p>
                    <p>{course.user_count}</p>
                  </div>
                  <div className='w-full mt-4 mb-4 border-t-4 border-metropolia-main-orange'></div>
                  <div className='mt-4'>
                    <h2 className='text-lg text-gray-700 font-heading'>
                      {t('translation:admin.common.instructors')}
                    </h2>
                    <ul>
                      {course.instructor_name
                        .split(',')
                        .map((instructor, index) => (
                          <li key={index}>{instructor.trim()}</li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          <DeleteModal
            isOpen={isDeleteModalOpen}
            onDelete={handleDelete}
            onClose={closeDeleteModal}
          />
        </>
      </div>
    </>
  );
};

export default AdminCourseDetail;
