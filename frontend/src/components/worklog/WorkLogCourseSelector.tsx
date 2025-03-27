import React from 'react';
import {useTranslation} from 'react-i18next';
import type {WorkLogCourse, ActiveEntry} from '../../types/worklog';
import {School as SchoolIcon, Work as WorkIcon} from '@mui/icons-material';

// Define a unified course type that can handle both worklog and practicum courses
export interface UnifiedCourse extends WorkLogCourse {
  type: 'worklog' | 'practicum';
  work_log_course_id: number; // From worklog courses
  work_log_practicum_id?: number; // From practicum courses
}

interface WorkLogCourseSelectorProps {
  courses: UnifiedCourse[];
  activeCourse: ActiveEntry | null;
  selectedCourse: number | null;
  onCourseChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  hasActiveEntry?: boolean;
}

const WorkLogCourseSelector: React.FC<WorkLogCourseSelectorProps> = ({
  courses,
  activeCourse,
  selectedCourse,
  onCourseChange,
  hasActiveEntry = false,
}) => {
  const {t} = useTranslation(['common']);

  // Function to get course type icon
  const CourseTypeIcon = ({type}: {type: 'worklog' | 'practicum'}) => {
    return type === 'worklog' ? (
      <WorkIcon fontSize='small' className='text-metropolia-main-orange' />
    ) : (
      <SchoolIcon fontSize='small' className='text-metropolia-support-blue' />
    );
  };

  if (courses.length === 0) {
    return (
      <div className='p-6 text-center bg-metropolia-support-white rounded-xl shadow-lg border-2 border-metropolia-main-grey/10 transition-transform duration-300 hover:scale-[1.02]'>
        <p className='text-lg font-heading text-metropolia-main-grey'>
          {t('common:worklog.noCourses')}
        </p>
        <p className='text-sm font-body text-metropolia-main-grey/70 mt-3 animate-pulse'>
          {t('common:worklog.redirecting')}
        </p>
      </div>
    );
  }

  if (activeCourse) {
    return (
      <div className='p-6 rounded-xl bg-gradient-to-br from-metropolia-main-orange/10 to-metropolia-support-white border-2 border-metropolia-main-orange/30 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] break-all'>
        <div className='flex flex-col gap-2'>
          <h3 className='font-heading font-bold text-xl  bg-gradient-to-r from-metropolia-main-orange to-metropolia-secondary-orange bg-clip-text text-transparent'>
            {activeCourse.course.name}
          </h3>
          <p className='text-sm font-body text-metropolia-main-grey/70 flex items-center gap-2 border-t border-metropolia-main-orange/20 pt-2 mt-1'>
            <span className='inline-block w-2 h-2 bg-metropolia-main-orange rounded-full animate-pulse' />
            {activeCourse.course.code}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className='block mb-2 text-sm font-medium text-metropolia-main-grey'>
        {t('common:worklog.selectCourse')}
      </label>
      <div className='relative'>
        <select
          value={selectedCourse || ''}
          onChange={onCourseChange}
          disabled={hasActiveEntry}
          className='w-full p-3 border-2 rounded-lg font-body focus:border-metropolia-main-orange focus:ring-2 focus:ring-metropolia-main-orange/20 transition-colors duration-200 appearance-none pr-10'>
          {courses.map((course) => (
            <option
              key={course.work_log_course_id}
              value={course.work_log_course_id}>
              {course.name} {course.type === 'practicum' ? '(Practicum)' : ''}
            </option>
          ))}
        </select>
        <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
          {selectedCourse && (
            <CourseTypeIcon
              type={
                courses.find((c) => c.work_log_course_id === selectedCourse)
                  ?.type || 'worklog'
              }
            />
          )}
        </div>
      </div>
      {hasActiveEntry && activeCourse && (
        <p className='mt-2 text-sm text-metropolia-main-orange'>
          {t('common:worklog.activeEntry')}: {activeCourse.name}
        </p>
      )}
    </div>
  );
};

export default WorkLogCourseSelector;
