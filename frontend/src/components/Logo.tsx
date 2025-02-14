import React, {useState, useEffect, useCallback} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
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
  // @ts-expect-error resetTimer is not initialized
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
      setTimeout(() => {
        setIsCrazy(false);
        resetClickCount();
      }, 5000);
    } else if (newClickCount === 5) {
      setIsHidden(true);
      setTimeout(() => {
        setIsHidden(false);
        resetClickCount();
      }, 5000);
    }
  };

  const containerVariants = {
    hidden: {opacity: 0, y: 20},
    visible: {
      opacity: 1,
      y: 0,
      transition: {duration: 0.5},
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {duration: 0.3},
    },
  };

  const logoVariants = {
    normal: {rotate: 0, scale: 1},
    crazy: {
      rotate: [0, -10, 10, -10, 10, 0],
      scale: [1, 1.1, 0.9, 1.1, 0.9, 1],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatType: 'reverse',
      },
    },
    hover: {
      scale: 1.1,
      transition: {type: 'spring', stiffness: 400, damping: 10},
    },
    tap: {scale: 0.9},
  };

  const textVariants = {
    normal: {y: 0},
    crazy: {
      y: [0, -10, 10, -10, 10, 0],
      transition: {
        duration: 1,
        repeat: Infinity,
        repeatType: 'reverse',
      },
    },
  };

  return (
    <AnimatePresence>
      {!isHidden && (
        <motion.div
          variants={containerVariants}
          initial='hidden'
          animate='visible'
          exit='exit'>
          <motion.div
            className='p-2 m-4 logo cursor-pointer'
            // @ts-expect-error variants is not initialized
            variants={logoVariants}
            animate={isCrazy ? 'crazy' : 'normal'}
            whileHover='hover'
            whileTap='tap'
            onClick={handleClick}>
            <div className='oval-shape bg-metropolia-main-orange dark:bg-metropolia-main-orange-dark'>
              <div className={`big-brother-eye ${isCrazy ? 'crazy' : ''}`}>
                <div className={`eye ${isCrazy ? 'crazy' : ''}`}></div>
              </div>
            </div>
          </motion.div>

          <motion.p
            className='p-2 m-2 text-4xl subpixel-antialiased tracking-widest text-center font-heading'
            // @ts-expect-error variants is not initialized
            variants={textVariants}
            animate={isCrazy ? 'crazy' : 'normal'}>
            {isHidden ? 'Stop it' : 'JakSec'}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Logo;
