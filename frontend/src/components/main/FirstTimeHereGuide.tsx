import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';

interface FirstTimeHereGuideProps {
  message: string;
  position?: 'bottom' | 'left' | 'right' | 'top';
  storageKey: string;
  isFixed?: boolean; // New prop to control positioning
}

/**
 * FirstTimeHereGuide component that displays a guide message for first-time users
 * The message is shown only once and the state is persisted in localStorage
 *
 * @param {FirstTimeHereGuideProps} props - Component props
 * @returns {JSX.Element | null} The rendered component or null if already seen
 */
const FirstTimeHereGuide: React.FC<FirstTimeHereGuideProps> = ({
  message,
  position = 'bottom',
  storageKey,
  isFixed = false, // Default to relative positioning
}) => {
  const {t} = useTranslation(['common']);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem(storageKey);
    if (!hasSeenGuide) {
      setIsVisible(true);
      localStorage.setItem(storageKey, 'seen');
    }
  }, [storageKey]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const getPositionClasses = (): string => {
    const baseClasses = `${
      isFixed ? 'fixed' : 'absolute'
    } z-50 transition-transform duration-300`;

    switch (position) {
      case 'left':
        return `${baseClasses} left-4 top-1/2 -translate-y-1/2`;
      case 'right':
        return `${baseClasses} right-4 top-1/2 -translate-y-1/2`;
      case 'top':
        return `${baseClasses} -top-4 left-1/2 -translate-x-1/2 -translate-y-full`;
      case 'bottom':
      default:
        return `${baseClasses} top-full left-1/2 -translate-x-1/2 mt-2`;
    }
  };

  const getArrowClasses = (): string => {
    const baseClasses = 'absolute w-0 h-0 border-solid';

    switch (position) {
      case 'left':
        return `${baseClasses} right-0 top-1/2 -translate-y-1/2 translate-x-2 border-y-transparent border-y-[8px] border-l-[8px] border-l-metropolia-support-white dark:border-l-metropolia-main-grey border-r-0`;
      case 'right':
        return `${baseClasses} left-0 top-1/2 -translate-y-1/2 -translate-x-2 border-y-transparent border-y-[8px] border-r-[8px] border-r-metropolia-support-white dark:border-r-metropolia-main-grey border-l-0`;
      case 'top':
        return `${baseClasses} bottom-0 left-1/2 -translate-x-1/2 translate-y-2 border-x-transparent border-x-[8px] border-t-[8px] border-t-metropolia-support-white dark:border-t-metropolia-main-grey border-b-0`;
      case 'bottom':
      default:
        return `${baseClasses} top-0 left-1/2 -translate-x-1/2 -translate-y-2 border-x-transparent border-x-[8px] border-b-[8px] border-b-metropolia-support-white dark:border-b-metropolia-main-grey border-t-0`;
    }
  };

  if (!isVisible) return null;

  return (
    <div
      role='alert'
      aria-live='polite'
      className={`${getPositionClasses()} max-w-md w-40`}>
      <div className='relative p-4 rounded-lg shadow-lg flex flex-col bg-metropolia-support-white dark:bg-metropolia-main-grey'>
        <div className={getArrowClasses()} />
        <div className='h-2'>
          <button
            onClick={handleClose}
            aria-label={t('common:close', 'Close')}
            className='absolute p-2 rounded-full text-metropolia-main-grey dark:text-metropolia-support-white top-2 right-2 hover:bg-metropolia-main-grey/10 dark:hover:bg-metropolia-support-white/10'>
            <span className='' aria-hidden='true'>
              &times;
            </span>
          </button>
        </div>
        <div className='w-full p-2'>
          <p className='break-words font-bold text-metropolia-main-grey dark:text-metropolia-support-white font-body'>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FirstTimeHereGuide;
