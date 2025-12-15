import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import DeleteModal from '../../../../components/ui/modals/DeleteModal';
import apiHooks from '../../../../api';
import {useTranslation} from 'react-i18next';
import { CourseDetail, AdminCourse } from '../../../../types/course.ts';
import CourseDetailCard from '../../../../components/internal/admin/AdminCourses/CourseDetailCard'

/**
 * AdminCourseDetail view.
 *
 * Displays details of a selected course for admins. Fetches course data using
 * the course ID from the URL, renders it with CourseDetailCard, and provides
 * edit and delete options with confirmation via DeleteModal.
 *
 * Features:
 * - Fetches course data on mount
 * - Renders detailed course info
 * - Allows editing and deletion with confirmation
 *
 * @returns {JSX.Element} The rendered AdminCourseDetail component.
 */

// TODO: Datan haku omaan hookkiin, esim. `useCourseDetail(id)`
const AdminCourseDetail: React.FC = () => {
  const {t} = useTranslation(['admin']);
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

      toast.success(t('admin:courses.delete.success'));

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
        {t('admin:ui.courseId')} {id}
      </h2>
      <div className='w-full m-4 mx-auto bg-white rounded-lg shadow-lg sm:w-3/4 md:w-2/4 lg:w-2/5 2xl:w-1/5'>
        {Array.isArray(courseData) &&
          courseData.map((course: AdminCourse) => (
            <CourseDetailCard
              key={course.courseid}
              course={course}
              onEdit={(id) => navigate(`/admin/courses/${id}/modify`)}
              onDelete={(id) => openDeleteModal(id)}
            />
          ))}
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onDelete={handleDelete}
          onClose={closeDeleteModal}
        />
      </div>
    </>
  );
};

export default AdminCourseDetail;
