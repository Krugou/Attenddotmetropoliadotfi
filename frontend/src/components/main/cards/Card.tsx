import React from 'react';
import {useNavigate} from 'react-router-dom';
import {SvgIconProps} from '@mui/material';

/**
 * Props for the Card component.
 */
interface CardProps {
  path: string;
  title: string;
  description: string;
  className?: string;
  icon?: React.ComponentType<SvgIconProps>;
}

const Card: React.FC<CardProps> = ({
  path,
  title,
  description,
  className,
  icon: Icon,
}) => {
  const navigate = useNavigate();
  /**
   * Navigates to the specified path when the card is clicked.
   */
  const handleCardClick = () => {
    navigate(path);
  };
  /**
   * A card component that displays a title and description, and navigates to a specified path when clicked.
   */
  return (
    <div
      onClick={handleCardClick}
      className={`card-link m-3 cursor-pointer ${className?.toString()}`}>
      <div className='relative bg-white p-4 rounded-md  transition-transform transform hover:scale-105 group w-[15rem] h-[8rem] hover:shadow-none shadow-[4px_5px_0px_0px_rgba(0,0,0,1)] shadow-metropoliaMainOrange'>
        <div className='flex items-center gap-2 mb-2'>
          {Icon && <Icon className='text-metropoliaMainOrange' />}
          <h2 className='text-lg font-semibold text-metropoliaSupportBlack'>
            {title}
          </h2>
        </div>
        <div className='absolute bottom-0 left-0 flex items-center justify-between w-full p-2 transition-opacity duration-300 ease-in-out opacity-0 h-1/2 bg-metropoliaMainOrange rounded-b-md sm:group-hover:opacity-100'>
          <p className='inline-block text-white'>{description}</p>
          <span className='inline-block ml-1 text-xl text-white'>&#8594;</span>
        </div>
      </div>
    </div>
  );
};

export default Card;
