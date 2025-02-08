import React, {useState} from 'react';
/**
 * VideoDropdownProps interface represents the structure of the VideoDropdown props.
 * It includes properties for the title of the dropdown and the source of the video.
 */
interface VideoDropdownProps {
  title: string;
  src: string;
}
/**
 * VideoDropdown component.
 * This component is responsible for displaying a dropdown that contains a video.
 * It uses the title and src props to determine the title of the dropdown and the source of the video.
 * The component uses the useState hook from React to manage the open state of the dropdown.
 * The dropdown can be toggled by clicking on the button that displays the title.
 * When the dropdown is open, it displays a video player that plays the video from the provided source.
 *
 * @param {VideoDropdownProps} props The props that define the title and source of the video.
 * @returns {JSX.Element} The rendered VideoDropdown component.
 */
const VideoDropdown: React.FC<VideoDropdownProps> = ({title, src}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className='w-full m-auto sm:w-full md:w-3/4 xl:w-3/4 2xl:w-2/4'>
      <button
        onClick={toggleDropdown}
        className={`border p-2 rounded-md flex items-center transition hover:bg-metropolia-secondary-orange text-white gap-4 m-auto ${
          isOpen
            ? 'bg-metropolia-secondary-orange'
            : 'bg-metropolia-main-orange'
        }`}>
        {title}
        <span className='mr-2'>
          {isOpen ? (
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='w-4 h-4'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M19 9l-7 7-7-7'
              />
            </svg>
          ) : (
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='w-4 h-4'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M5 15l7-7 7 7'
              />
            </svg>
          )}
        </span>
      </button>
      {isOpen && (
        <div className='w-full h-full p-0 m-auto mt-4 rounded-lg sm:p-5 sm:bg-gray-200 bg-none'>
          <video controls src={src} className='w-full h-full rounded-sm' />
        </div>
      )}
    </div>
  );
};

export default VideoDropdown;
