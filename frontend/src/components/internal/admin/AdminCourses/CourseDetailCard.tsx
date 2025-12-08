import React from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';
import { AdminCourse } from '../../../../types/course.ts';
import { useTranslation } from 'react-i18next';

interface Props {
  course: AdminCourse;
  onEdit: (courseId: number) => void;
  onDelete: (courseId: number) => void;
}

const CourseDetailCard: React.FC<Props> = ({ course, onEdit, onDelete }) => {
  const { t } = useTranslation(['admin']);

  return (
    <div className='relative p-5 mt-4 mb-4 bg-white rounded-lg'>
      <Tooltip title={t('admin:courses.modifyCourse')}>
        <EditIcon
          fontSize='large'
          className='absolute top-0 right-0 p-1 m-4 mr-16 text-black bg-gray-300 rounded-full cursor-pointer hover:text-gray-700'
          onClick={() => onEdit(course.courseid)}
        />
      </Tooltip>
      <Tooltip title={t('admin:courses.delete.deleteCourse')}>
        <DeleteIcon
          fontSize='large'
          className='absolute top-0 right-0 p-1 m-4 text-red-500 bg-gray-300 rounded-full cursor-pointer hover:text-red-700'
          onClick={() => onDelete(course.courseid)}
        />
      </Tooltip>
      <p className='text-lg font-heading'>{course.name}</p>
      <p className='text-base text-gray-700'>{course.description}</p>
      <div className='mt-2'>
        <div className='flex justify-between'>
          <p className='text-gray-700'>{t('admin:ui.startDate')}:</p>
          <p>{new Date(course.start_date).toLocaleDateString()}</p>
        </div>
        <div className='flex justify-between'>
          <p className='text-gray-700'>{t('admin:ui.endDate')}:</p>
          <p>{new Date(course.end_date).toLocaleDateString()}</p>
        </div>
        <div className='flex justify-between'>
          <p className='text-gray-700'>{t('admin:ui.code')}:</p>
          <p>{course.code}</p>
        </div>
        <div className='flex justify-between'>
          <p className='text-gray-700'>{t('admin:ui.studentGroup')}:</p>
          <p>{course.studentgroup_name}</p>
        </div>
        <div className='flex flex-col justify-between mb-4'>
          <h2 className='mt-4 text-lg font-heading'>{t('admin:ui.topics')}:</h2>
          <p>{course.topic_names?.replace(/,/g, ', ')}</p>
        </div>
        <div className='w-full border-t-4 border-metropolia-main-orange'></div>
        <h2 className='mt-4 mb-2 text-lg font-heading'>{t('admin:ui.additionalInfo')}</h2>
        <div className='flex justify-between'>
          <p className='text-gray-700'>{t('admin:ui.courseCreatedAt')}:</p>
          <p>{new Date(course.created_at).toLocaleDateString()}</p>
        </div>
        <div className='flex justify-between'>
          <p className='text-gray-700'>{t('admin:ui.ammountOfStudents')}</p>
          <p>{course.user_count}</p>
        </div>
        <div className='w-full mt-4 mb-4 border-t-4 border-metropolia-main-orange'></div>
        <div className='mt-4'>
          <h2 className='text-lg text-gray-700 font-heading'>{t('admin:ui.instructors')}</h2>
          <ul>
            {course.instructor_name.split(',').map((instructor, index) => (
              <li key={index}>{instructor.trim()}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailCard;
