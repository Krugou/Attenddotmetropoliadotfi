import React, {useContext} from 'react';
import {useTranslation} from 'react-i18next';
import {UserContext} from '../../../contexts/UserContext';

const MainViewTitle: React.FC = () => {
  const {user} = useContext(UserContext);
  const {t} = useTranslation('common');

  const roleKey = user?.role ?? 'default';

  const title = t(`mainViewTitle.${roleKey}`, {
    defaultValue: t('mainViewTitle.dashboard'),
  });

  return (
    <h1 className="p-3 mt-5 mb-5 ml-auto mr-auto text-2xl font-heading text-center bg-white md:text-4xl rounded-xl w-fit text-metropolia-support-black">
      {title}
    </h1>
  );
};

export default MainViewTitle;
