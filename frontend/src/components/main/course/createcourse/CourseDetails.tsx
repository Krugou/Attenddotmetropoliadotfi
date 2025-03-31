import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import apihooks from '../../../../api';
import InputField from './coursedetails/InputField';
/**
 * CourseDetails component properties
 */
interface CourseDetailsProps {
  courseCode: string;
  setCourseCode: (value: string) => void;
  courseName: string;
  setCourseName: (value: string) => void;
  studentGroup: string;
  setStudentGroup: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  modify?: boolean;
  courseExists: boolean;
  setCourseExists: (value: boolean) => void;
}

/**
 * CourseDetails is a functional component that renders a form for course details.
 * It checks if the course code already exists and displays appropriate messages.
 *
 * @param props - The properties of the course details form.
 * @returns A JSX element.
 */
const CourseDetails: React.FC<CourseDetailsProps> = ({
  courseCode,
  setCourseCode,
  courseName,
  setCourseName,
  studentGroup,
  setStudentGroup,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  modify = false,
  courseExists,
  setCourseExists,
}) => {
  const {t} = useTranslation(['teacher', 'common']);
  const [firstCourseCode] = useState(courseCode);
  const [courseCodeChanged, setCourseCodeChanged] = useState(false);
  const [courseNameCharCount, setCourseNameCharCount] = useState(
    courseName.length,
  );
  const [groupCharCount, setGroupCharCount] = useState(studentGroup.length);

  useEffect(() => {
    const token: string | null = localStorage.getItem('userToken');
    if (!token) {
      throw new Error('No token available');
    }
    const delay = 250; // Delay in milliseconds

    const checkCode = async () => {
      const response = await apihooks.checkCourseCode(courseCode, token);
      const exists = response.exists;
      setCourseExists(exists);
    };

    if (!modify) {
      // Only run the check if courseCode has changed
      setTimeout(checkCode, delay);
    } else {
      if (courseCode !== firstCourseCode && firstCourseCode !== '') {
        setTimeout(checkCode, delay);
      }
    }
  }, [courseCode]);

  const handleCourseNameChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (!e || !e.target) {
      return;
    }
    setCourseName(e.target.value);
    setCourseNameCharCount(e.target.value.length);
  };

  const handleGroupChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (!e || !e.target) {
      return;
    }
    setStudentGroup(e.target.value);
    setGroupCharCount(e.target.value.length);
  };

  return (
    <fieldset>
      {modify ? (
        <></>
      ) : (
        <legend className='mb-5 ml-1 text-xl'>
          {t('teacher:courseDetails.title')}
        </legend>
      )}

      <InputField
        label={t('teacher:courseDetails.labels.courseCode')}
        type='text'
        name='courseCode'
        value={courseCode}
        onChange={(e) => {
          setCourseCode(e.target.value);
          setCourseExists(false);
          if (e.target.value !== firstCourseCode) {
            setCourseCodeChanged(true);
          }
        }}
      />
      {!modify && courseExists && (
        <p className='text-red-400'>
          {t('teacher:courseDetails.errors.codeExists')}
        </p>
      )}
      {modify && courseExists && courseCode !== firstCourseCode && (
        <p className='text-red-400'>
          {t('teacher:courseDetails.errors.codeExists')}
        </p>
      )}

      {modify && courseCode === firstCourseCode && courseCodeChanged && (
        <p className='text-green-400'>
          {t('teacher:courseDetails.success.codeRestored')}
        </p>
      )}

      <div>
        <InputField
          label={t('teacher:courseDetails.labels.courseName')}
          type='text'
          name='courseName'
          value={courseName}
          onChange={handleCourseNameChange}
          maxLength={100}
        />
        <p className='mt-1 text-sm text-gray-500 text-right font-body'>
          {courseNameCharCount}/100 {t('common:characters')}
        </p>
      </div>

      <div>
        <InputField
          label={t('teacher:courseDetails.labels.studentGroup')}
          type='text'
          name='studentGroup'
          value={studentGroup}
          onChange={handleGroupChange}
          maxLength={100}
        />
        <p className='mt-1 text-sm text-gray-500 text-right font-body'>
          {groupCharCount}/100 {t('common:characters')}
        </p>
      </div>

      <InputField
        label={t('teacher:courseDetails.labels.startDate')}
        type='date'
        name='startDate'
        value={startDate ? startDate.split('T')[0] : ''}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <InputField
        label={t('teacher:courseDetails.labels.endDate')}
        type='date'
        name='endDate'
        value={endDate ? endDate.split('T')[0] : ''}
        onChange={(e) => setEndDate(e.target.value)}
      />
    </fieldset>
  );
};

export default CourseDetails;
