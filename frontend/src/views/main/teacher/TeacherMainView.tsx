import React, {useContext, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {QrCode} from '@mui/icons-material';

import NavigationCard from '../../../components/ui/cards/NavigationCard.tsx';
import WelcomeModal from '../../../components/ui/modals/WelcomeModal';
import {UserContext} from '../../../contexts/UserContext';
import OpenDataTest from '../../../components/features/system/OpenDataTest.tsx';

import CheckOpenLectures
  from '../../../components/features/courses/attendance/CheckOpenLectures.tsx';

const MainView: React.FC = () => {
  const {user} = useContext(UserContext);
  const {t, i18n} = useTranslation();

  const displayName =
    (user as any)?.first_name ||
    user?.email ||
    '';

  const todayText = useMemo(() => {
    const today = new Date();
    const lang = i18n.language || 'fi-FI';

    const weekday = today.toLocaleDateString(lang, {
      weekday: 'long',
    });

    const date = today.toLocaleDateString(lang, {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });

    return `${weekday} ${date}`;
  }, [i18n.language]);

  return (
    <>
      {/* Tekniset testit */}
      {user && (
        <div className="w-full px-2 sm:px-4 pt-1">
          <OpenDataTest token={localStorage.getItem('userToken') || ''} />
        </div>
      )}

      {/* Tervehdys + päivämäärä */}
      <div className="mt-4 text-center max-w-xl mx-auto">
        <h2 className="text-3xl font-heading">
          {displayName
            ? t('teacher:toasts.mainView.greetingWithName', {name: displayName})
            : t('teacher:toasts.mainView.greeting')}
        </h2>
        <p className="mt-1 text-xl text-gray-700">
          {t('teacher:toasts.mainView.todayIs', {date: todayText})}
        </p>
      </div>

      {/* Avoimet luennot + "Luo uusi luento" */}
      <div
        className="mt-6 w-full flex flex-col items-center gap-4 md:flex-row md:items-start md:justify-center">
        <CheckOpenLectures />

        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <NavigationCard
              path="/teacher/attendance/createlecture"
              title={t('teacher:mainView.cards.createLecture.title')}
              description={t(
                'teacher:mainView.cards.createLecture.description',
              )}
              icon={QrCode}
            />
          </div>
        </div>
      </div>

      <WelcomeModal storageKey="welcomeModal.v1" />
    </>
  );
};

export default MainView;
