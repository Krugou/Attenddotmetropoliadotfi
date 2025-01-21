import React from 'react';
import {useTranslation} from 'react-i18next';

/**
 * MainViewTitleProps interface represents the structure of the MainViewTitle props.
 * It includes a property for the user's role.
 */
interface MainViewTitleProps {
  role: string;
}

/**
 * MainViewTitle component.
 * This component is responsible for displaying the title of the main view.
 * It uses the role prop to determine the user's role and displays it in the title.
 * The title is styled with various Tailwind CSS classes.
 *
 * @param {MainViewTitleProps} props The props that define the user's role.
 * @returns {JSX.Element} The rendered MainViewTitle component.
 */
const MainViewTitle: React.FC<MainViewTitleProps> = ({role}) => {
  const {t} = useTranslation();
  return (
    <h1 className='p-3 mt-5 mb-5 ml-auto mr-auto text-2xl font-heading text-center bg-white md:text-4xl rounded-xl w-fit text-metropoliaSupportBlack'>
      {role} {t('mainViewTitle.dashboard')}
    </h1>
  );
};

export default MainViewTitle;
