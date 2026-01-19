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

// TODO Korjaa placeholder arvo
// Placeholderilla on value='null', mikä on merkkijono
// Tämä aiheuttaa tilanteen, jossa `Number(e.target.value)` antaa NaN, jos käyttäjä ei ole valinnut mitään.
// Vaihdetaan arvo tyhjäksi merkkijonoksi ja käsitellään null erikseen
//
// <option value=''>{t('ui:courseSelect.placeholder')}</option>
//
// ja onChange:ssä:
// const value = e.target.value ? Number(e.target.value) : null;
// onChange(value);

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
  const {t} = useTranslation(['common']);

  return (
    <label className='block'>
      <span className='font-heading text-gray-700'>
        {t('courseSelect.label')}
      </span>
      <select
        required
        value={selectedCourse || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        className='w-full px-3 py-2 mt-1 mb-3 leading-tight text-gray-700 border shadow-sm appearance-none cursor-pointer rounded-3xl focus:outline-hidden focus:shadow-outline'>
        <option value='null'>{t('courseSelect.placeholder')}</option>
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
