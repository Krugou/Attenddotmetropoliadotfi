import {useTranslation} from 'react-i18next';
import React from 'react';
import NavigationCard from '../../../../components/ui/cards/NavigationCard.tsx';
import Checklist from '@mui/icons-material/Checklist';
import TuneIcon from '@mui/icons-material/Tune';
import AssignmentTurnedIn from '@mui/icons-material/AssignmentTurnedIn';


const CreateWorklog: React.FC = () => {
  const {t} = useTranslation('teacher');

  return (
    <div className="w-full flex flex-col items-center mt-4">
      <h1 className="text-2xl sm:text-3xl font-heading text-center">
        {t('worklog.create.title')}
      </h1>

      <p className="text-center mt-2 mb-6 max-w-lg">
        {t('worklog.create.subtitle')}
      </p>

      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
        <NavigationCard
          path="/teacher/courses/create/worklog-easy"
          title={t('worklog.create.modes.easy.title')}
          subtitle={t('worklog.create.modes.easy.subtitle')}
          description={t('worklog.create.modes.easy.description')}
          icon={Checklist}
        />

        <NavigationCard
          path="/teacher/courses/create/worklog-custom"
          title={t('worklog.create.modes.custom.title')}
          subtitle={t('worklog.create.modes.custom.subtitle')}
          description={t('worklog.create.modes.custom.description')}
          icon={TuneIcon}
        />

        <NavigationCard
          path="/teacher/courses/create/practicum"
          title={t('worklog.create.modes.practicum.title')}
          description={t('worklog.create.modes.practicum.description')}
          icon={AssignmentTurnedIn}
        />
      </div>
    </div>
  );
};

export default CreateWorklog;
