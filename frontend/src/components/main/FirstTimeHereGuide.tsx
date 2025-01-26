import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';

interface FirstTimeHereGuideProps {
  message: string;
  position?: 'bottom' | 'left' | 'right' | 'top';
  storageKey: string;
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
    const baseClasses = 'fixed z-50 transition-transform duration-300';
    switch (position) {
      case 'left':
        return `${baseClasses} left-4 top-1/2 -translate-y-1/2`;
      case 'right':
        return `${baseClasses} right-4 top-1/2 -translate-y-1/2`;
      case 'top':
        return `${baseClasses} top-4 left-1/2 -translate-x-1/2`;
      case 'bottom':
      default:
        return `${baseClasses} bottom-4 left-1/2 -translate-x-1/2`;
    }
  };

  if (!isVisible) return null;

  return (
    <div
      role='alert'
      aria-live='polite'
      className={`${getPositionClasses()} max-w-md`}>
      <div className='p-4 rounded-lg shadow-lg bg-metropoliaSupportWhite dark:bg-metropoliaMainGrey'>
        <button
          onClick={handleClose}
          aria-label={t('common.close', 'Close')}
          className='absolute p-2 rounded-full text-metropoliaMainGrey dark:text-metropoliaSupportWhite top-2 right-2 hover:bg-metropoliaMainGrey/10 dark:hover:bg-metropoliaSupportWhite/10'>
          <span aria-hidden='true'>&times;</span>
        </button>
        <div className='p-2'>
          <p className='text-metropoliaMainGrey dark:text-metropoliaSupportWhite font-body'>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FirstTimeHereGuide;
