import React from 'react';
import {useNavigate} from 'react-router-dom';
/**
 * Props for the GeneralLinkButton component.
 */
interface GeneralLinkButtonProps {
  path: string;
  text: string;
  className?: string;
}
/**
 * A button component that navigates to a specified path when clicked.
 */
const GeneralLinkButton: React.FC<GeneralLinkButtonProps> = ({
  path,
  text,
  className,
}) => {
  const navigate = useNavigate();
  return (
    <button
      className={`px-2 py-1 font-heading text-white transition rounded-sm bg-metropolia-main-orange h-fit hover:hover:bg-metropolia-secondary-orange sm:py-2 sm:px-4 focus:outline-hidden focus:shadow-outline ${
        className || ''
      }`}
      onClick={() => navigate(path)}>
      {text}
    </button>
  );
};

export default GeneralLinkButton;
