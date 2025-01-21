import React, {FC} from 'react';
import {useNavigate} from 'react-router-dom';
/**
 * Props for the NavigationButton component.
 */
interface NavigationButtonProps {
  user: any;
  path: string;
  label: string;
}

/**
 * A button component that navigates to a specified path when clicked.
 * The button is only rendered if a user is provided.
 */
const NavigationButton: FC<NavigationButtonProps> = ({user, path, label}) => {
  const navigate = useNavigate();

  return (
    user && (
      <button
        type='button'
        className='px-4 py-2 mx-2 font-heading text-white transition border border-white rounded sm:w-full w-fit bg-metropoliaMainOrange hover:bg-metropoliaSecondaryOrange focus:outline-none focus:ring-2 focus:ring-metropoliaMainOrange'
        onClick={() => navigate(path)}>
        {label}
      </button>
    )
  );
};

export default NavigationButton;
