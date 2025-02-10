import React, {useState, useEffect, useCallback} from 'react';
import '../css/logo.css';

/**
 * Logo component.
 * This component is responsible for rendering the logo of the application.
 * It includes click tracking for special animations and effects.
 * @returns {JSX.Element} The rendered Logo component.
 */
const Logo = () => {
  const [isCrazy, setIsCrazy] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [resetTimer, setResetTimer] = useState<NodeJS.Timeout | null>(null);

  const resetClickCount = useCallback(() => {
    setClickCount(0);
    setIsCrazy(false);
    setIsHidden(false);
  }, []);

  useEffect(() => {
    if (resetTimer) {
      clearTimeout(resetTimer);
    }
    if (clickCount > 0) {
      const timer = setTimeout(resetClickCount, 2000);
      setResetTimer(timer);
    }
    return () => {
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, [clickCount, resetTimer, resetClickCount]);

  const handleClick = () => {
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);

    if (newClickCount === 3) {
      setIsCrazy(true);
      setTimeout(() => setIsCrazy(false), 5000);
    } else if (newClickCount === 5) {
      setIsHidden(true);
      setTimeout(() => {
        setIsHidden(false);
        resetClickCount();
      }, 5000);
    }
  };

  return (
    <div
      className={`transition-opacity duration-500 ${
        isHidden ? 'opacity-0' : 'opacity-100'
      }`}>
      <div
        className='p-2 m-4 logo cursor-pointer active:scale-95 transition-transform duration-150'
        onClick={handleClick}>
        <div className='oval-shape bg-metropolia-main-orange dark:bg-metropolia-main-orange-dark'>
          <div className={`big-brother-eye ${isCrazy ? 'crazy' : ''}`}>
            <div className={`eye ${isCrazy ? 'crazy' : ''}`}></div>
          </div>
        </div>
      </div>

      <p className='p-2 m-2 text-4xl subpixel-antialiased tracking-widest text-center font-heading'>
        {isHidden ? 'Stop it' : 'JakSec'}
      </p>
    </div>
  );
};

export default Logo;
