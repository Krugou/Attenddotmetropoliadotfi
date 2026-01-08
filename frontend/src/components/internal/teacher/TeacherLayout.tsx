import React from 'react';
import {Outlet} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import TeacherTopNav from './TeacherTopNav';

/**
 * Yhteinen layout kaikille opettajan routeille:
 * - yläpalkin TeacherTopNav
 * - yhtenäiset paddingit ja keskitys
 * - Outlet sisältöä varten
 */
const TeacherLayout: React.FC = () => {
  const {t} = useTranslation(['teacher']);

  return (
    <div className="flex flex-col items-center w-full px-1 sm:px-3 pt-3 sm:pt-4 pb-10">
      <TeacherTopNav t={t} />

      <div className="mt-6 w-full flex flex-col items-center">
        <Outlet />
      </div>
    </div>
  );
};

export default TeacherLayout;



/*import React, {ReactNode} from 'react';
import TeacherTopNav from './TeacherTopNav';

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

type TeacherLayoutProps = {
  t: TranslateFn;
  children: ReactNode;
};

/**
 * Yhteinen layout kaikille opettajan näkymille:
 * - yläpalkin TeacherTopNav
 * - yhtenäiset paddingit ja keskitys
 */
/*const TeacherLayout: React.FC<TeacherLayoutProps> = ({t, children}) => {
  return (
    <div className="flex flex-col items-center w-full px-1 sm:px-3 pt-3 sm:pt-4 pb-10">

      <TeacherTopNav t={t} />


      <div className="mt-6 w-full flex flex-col items-center">
        {children}
      </div>
    </div>
  );
};

export default TeacherLayout;*/


