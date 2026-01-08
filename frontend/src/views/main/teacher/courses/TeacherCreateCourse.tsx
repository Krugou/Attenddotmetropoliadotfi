import {useTranslation} from 'react-i18next';
import React from 'react';
import NavigationCard from '../../../../components/ui/cards/NavigationCard.tsx';
import TuneIcon from '@mui/icons-material/Tune';
import Checklist from '@mui/icons-material/Checklist';


const TeacherCreateCourse: React.FC = () => {
  const {t} = useTranslation('teacher');

  return (
    <div className="w-full flex flex-col items-center mt-4">
      <h1 className="text-2xl sm:text-3xl font-heading text-center">
        {t('createCourse.title')}
      </h1>

      <p className="text-center mt-2 mb-6 max-w-lg">
        {t('createCourse.subtitle')}
      </p>

      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
        <NavigationCard
          path="/teacher/courses/create/easy"
          title={t('createCourse.modes.easy.title')}
          description={t('createCourse.modes.easy.description')}
          icon={Checklist}
        />

        <NavigationCard
          path="/teacher/courses/create/custom"
          title={t('createCourse.modes.custom.title')}
          description={t('createCourse.modes.custom.description')}
          icon={TuneIcon}
        />
      </div>
    </div>
  );
};

export default TeacherCreateCourse;

/*import {useTranslation} from 'react-i18next';
import React from 'react';
import NavigationCard from '../../../../components/features/navigation/NavigationCard.tsx';

/**
 * TeacherCreateCourse component.
 * This component is responsible for rendering the view for a teacher to create a new course.
 * It provides two options for the teacher to create a course: Easy mode and Custom mode.
 * In Easy mode, the teacher can create a course easily with their own student data file.
 * In Custom mode, the teacher can create a course with their custom details.
 */
/* const TeacherCreateCourse: React.FC = () => {
  const {t} = useTranslation(['translation']);

  return (
    <div>
      <div className='w-full pt-10 pb-10'>
        <h1 className='p-3 mb-8 ml-auto mr-auto text-4xl font-heading text-center bg-white rounded-lg w-fit'>
          {t('teacher:createCourse.title')}
        </h1>
        <p className='p-2 mb-4 ml-auto mr-auto text-center bg-white rounded-lg w-fit'>
          {t('teacher:createCourse.subtitle')}
        </p>
        <div className='flex flex-wrap justify-center space-x-4'>
          <NavigationCard
            path='/teacher/courses/create/easy'
            title={t('teacher:createCourse.modes.easy.title')}
            description={t('teacher:createCourse.modes.easy.description')}
          />

          <NavigationCard
            path='/teacher/courses/create/custom'
            title={t('teacher:createCourse.modes.custom.title')}
            description={t('teacher:createCourse.modes.custom.description')}
          />
        </div>
      </div>
    </div>
  );
};

export default TeacherCreateCourse;*/
