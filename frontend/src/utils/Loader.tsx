import React from 'react';
import {motion} from 'framer-motion';
import {useTranslation} from 'react-i18next';

const Loader = () => {
  const {t} = useTranslation('common');

  return (
    <div className='flex-col gap-4 w-full h-full flex items-center justify-center'>
      <div className='bg-metropolia-support-white  p-6 rounded-2xl flex flex-col items-center justify-center'>
        <motion.div
          animate={{rotate: 360}}
          transition={{duration: 1, repeat: Infinity, ease: 'linear'}}
          className='w-20 h-20 border-4 border-transparent text-metropolia-main-orange text-4xl flex items-center justify-center border-t-metropolia-main-orange rounded-full'>
          <motion.div
            animate={{rotate: -360}}
            transition={{duration: 2, repeat: Infinity, ease: 'linear'}}
            className='w-16 h-16 border-4 border-transparent text-blue-600 text-2xl flex items-center justify-center border-t-blue-600 rounded-full'></motion.div>
        </motion.div>
        <motion.h1
          className='text-2xl font-bold text-metropolia-main-orange tracking-wider'
          initial={{opacity: 0, scale: 0.5}}
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.98, 1.02, 0.98],
            y: [0, -2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}>
          ✨ {t('common:metropoliaLoading')} ✨
        </motion.h1>
      </div>
    </div>
  );
};

export default Loader;
