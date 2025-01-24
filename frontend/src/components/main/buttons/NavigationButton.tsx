import React, {FC} from 'react';
import {useNavigate} from 'react-router-dom';
/**
 * Props for the NavigationButton component.
 */
interface NavigationButtonProps {
  path: string;
  label: string;
}

/**
 * A button component that navigates to a specified path when clicked.
 * The button is only rendered if a user is provided.
 */
const NavigationButton: FC<NavigationButtonProps> = ({path, label}) => {
  const navigate = useNavigate();

  return (
    <button
      type='button'
      className='px-4 py-2 mx-2 text-white transition border border-white rounded font-heading sm:w-full w-fit bg-metropoliaMainOrange hover:bg-metropoliaSecondaryOrange focus:outline-none focus:ring-2 focus:ring-metropoliaMainOrange'
      onClick={() => navigate(path)}>
      {label}
    </button>
  );
};

export default NavigationButton;
