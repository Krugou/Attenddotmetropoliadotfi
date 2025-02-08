import React, {FC} from 'react';
import {useNavigate} from 'react-router-dom';

/**
 * Props for the NavigationButton component.
 */
interface NavigationButtonProps {
  path: `/${string}`; // Ensure path always starts with /
  label: string;
}

/**
 * A button component that navigates to a specified path when clicked.
 * Always navigates from root (/).
 */
const NavigationButton: FC<NavigationButtonProps> = ({path, label}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(path);
  };
  return (
    <button
      type='button'
      className='px-4 py-2 mx-2 text-white transition border border-white rounded-sm font-heading sm:w-full w-fit bg-metropolia-main-orange hover:bg-metropolia-secondary-orange focus:outline-hidden focus:ring-2 focus:ring-metropolia-main-orange'
      onClick={handleClick}>
      {label}
    </button>
  );
};

export default NavigationButton;
