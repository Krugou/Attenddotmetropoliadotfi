import React from 'react';
import {motion} from 'framer-motion';
import {useTranslation} from 'react-i18next';

const Loader = () => {
  const {t} = useTranslation('common');

  return (
    <div className='flex-col gap-4 w-full flex items-center justify-center'>
      <motion.h1
        className='text-2xl text-metropolia-main-orange'
        initial={{opacity: 0, y: -20}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.5, ease: 'easeOut'}}>
        {t('common:metropoliaLoading')}
      </motion.h1>

      <motion.div
        animate={{rotate: 360}}
        transition={{duration: 2, repeat: Infinity, ease: 'linear'}}
        className='w-20 h-20 border-4 border-transparent text-orange-600 text-4xl flex items-center justify-center border-t-orange-600 rounded-full'>
        <motion.div
          animate={{rotate: -360}}
          transition={{duration: 1.5, repeat: Infinity, ease: 'linear'}}
          className='w-16 h-16 border-4 border-transparent text-blue-600 text-2xl flex items-center justify-center border-t-blue-600 rounded-full'></motion.div>
      </motion.div>
    </div>
  );
};

export default Loader;
