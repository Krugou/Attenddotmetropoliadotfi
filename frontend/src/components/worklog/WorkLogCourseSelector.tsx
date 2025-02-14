import React from 'react';
import {useTranslation} from 'react-i18next';
import type {WorkLogCourse, ActiveEntry} from '../../types/worklog';

interface WorkLogCourseSelectorProps {
  courses: WorkLogCourse[];
  activeCourse: ActiveEntry | null;
  selectedCourse: number | null;
  onCourseChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const WorkLogCourseSelector: React.FC<WorkLogCourseSelectorProps> = ({
  courses,
  activeCourse,
  selectedCourse,
  onCourseChange,
}) => {
  const {t} = useTranslation(['common']);

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
    <div className='relative'>
      <select
        title={t('common:worklog.selectCourse')}
        value={selectedCourse || ''}
        onChange={onCourseChange}
        className="w-full p-4 rounded-xl font-body text-lg
          border-2 border-metropolia-main-grey/20
          bg-metropolia-support-white text-metropolia-main-grey
          shadow-lg transition-all duration-300
          hover:border-metropolia-main-orange/50
          focus:border-metropolia-main-orange focus:ring-2
          focus:ring-metropolia-main-orange/20
          focus:shadow-xl appearance-none cursor-pointer
          bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 24 24%27 stroke=%27%23666%27%3E%3Cpath stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27M19 9l-7 7-7-7%27%3E%3C/path%3E%3C/svg%3E')]
          bg-no-repeat bg-[length:20px] bg-[center_right_1rem]">
        <option value='' disabled>
          {t('common:worklog.selectCourse')}
        </option>
        {courses.map((course) => (
          <option
            key={course.work_log_course_id}
            value={course.work_log_course_id}
            className='py-2'>
            {course.name} {course.code && `- ${course.code}`}
          </option>
        ))}
      </select>
    </div>
  );
};

export default WorkLogCourseSelector;
