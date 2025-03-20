import {useTranslation} from 'react-i18next';
import React from 'react';
import Card from '../../../../components/main/cards/Card';

/**
 * TeacherCreateCourse component.
 * This component is responsible for rendering the view for a teacher to create a new course.
 * It provides two options for the teacher to create a course: Easy mode and Custom mode.
 * In Easy mode, the teacher can create a course easily with their own student data file.
 * In Custom mode, the teacher can create a course with their custom details.
 */
const ModeSelection: React.FC = () => {
  const {t} = useTranslation(['teacher']);

  return (
    <div>
      <div className='w-full pt-10 pb-10'>
        <h1 className='p-3 mb-8 ml-auto mr-auto text-4xl font-heading text-center bg-white rounded-lg w-fit'>
          {t('teacher:worklog.create.title')}
        </h1>
        <p className='p-2 mb-4 ml-auto mr-auto text-center bg-white rounded-lg w-fit'>
          {t('teacher:worklog.create.subtitle')}
        </p>
        <div className='flex flex-wrap justify-center space-x-4'>
          <Card
            path='/teacher/courses/create/worklog-easy'
            title={t('teacher:worklog.create.modes.easy.title')}
            description={t('teacher:worklog.create.modes.easy.description')}
          />

          <Card
            path='/teacher/courses/create/worklog-custom'
            title={t('teacher:worklog.create.modes.custom.title')}
            description={t('teacher:worklog.create.modes.custom.description')}
          />

          <Card
            path='/teacher/courses/create/practicum'
            title={t('teacher:worklog.create.modes.practicum.title')}
            description={t('teacher:worklog.create.modes.practicum.description')}
          />
        </div>
      </div>
    </div>
  );
};

export default ModeSelection;
