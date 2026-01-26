import React from 'react';
import {useParams} from 'react-router-dom';
import GeneralLinkButton from '../../../../components/ui/buttons/GeneralLinkButton.tsx';
import {useTranslation} from 'react-i18next';

import PracticumEntriesSection from '../../../../components/features/practicum/PracticumEntriesSection.tsx';

const TeacherPracticumEntries: React.FC = () => {
  const {t} = useTranslation(['teacher']);
  const {practicumid} = useParams<{practicumid: string}>();

  const id = Number(practicumid);

  return (
    <div className="container max-w-6xl px-4 py-8 mx-auto bg-gray-100 rounded-lg">
      <div className="flex gap-4 mb-6">
        <GeneralLinkButton
          path="/teacher/worklog"
          text={t('teacher:worklog.detail.backToWorklog')}
        />
      </div>

      {Number.isFinite(id) && (
        <PracticumEntriesSection practicumId={id} variant="page" />
      )}
    </div>
  );
};

export default TeacherPracticumEntries;
