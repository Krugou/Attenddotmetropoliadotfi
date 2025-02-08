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
  const {t} = useTranslation();
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

  if (!isVisible) return null;

  return (
    <div
      role='alert'
      aria-live='polite'
      className={`${getPositionClasses()} max-w-md w-40`}>
      <div className='p-4 rounded-lg shadow-lg bg-metropolia-support-white dark:bg-metropolia-main-grey'>
        <button
          onClick={handleClose}
          aria-label={t('common.close', 'Close')}
          className='absolute p-2 rounded-full text-metropolia-main-grey dark:text-metropolia-support-white top-2 right-2 hover:bg-metropolia-main-grey/10 dark:hover:bg-metropolia-support-white/10'>
          <span aria-hidden='true'>&times;</span>
        </button>
        <div className='w-full p-2'>
          <p className='break-words text-metropolia-main-grey dark:text-metropolia-support-white font-body'>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FirstTimeHereGuide;
