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
