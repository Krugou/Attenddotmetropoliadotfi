import React from 'react';
import {useTranslation} from 'react-i18next';

interface Course {
  courseid: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  code: string;
  studentgroup_name: string;
  topic_names: string;
  // Include other properties of course here
}

interface CourseSelectProps {
  courses: Course[];
  selectedCourse: number | null;
  onChange: (value: number) => void;
}

const CourseSelect: React.FC<CourseSelectProps> = ({
  courses,
  selectedCourse,
  onChange,
}) => {
  const {t} = useTranslation(['translation']);

  return (
    <label className='block mt-4'>
      <span className='font-heading text-gray-700'>
        {t('translation:courseSelect.label')}
      </span>
      <select
        required
        value={selectedCourse || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        className='w-full px-3 py-2 mt-1 mb-3 leading-tight text-gray-700 border shadow-sm appearance-none cursor-pointer rounded-3xl focus:outline-hidden focus:shadow-outline'>
        <option value='null'>
          {t('translation:courseSelect.placeholder')}
        </option>
        {courses.map((course) => (
          <option key={course.courseid} value={course.courseid}>
            {course.name + '|' + course.code}
          </option>
        ))}
      </select>
    </label>
  );
};

export default CourseSelect;
