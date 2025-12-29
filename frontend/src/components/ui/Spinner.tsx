import React from 'react';

const Spinner: React.FC<{ text?: string }> = ({ text = 'Loading settings...' }) => (
  <div className='flex flex-col items-center justify-center min-h-[60vh]'>
    <div className='w-16 h-16 border-4 border-t-4 rounded-full border-metropolia-main-orange border-t-metropolia-main-orange-dark animate-spin'></div>
    <p className='mt-4 text-lg font-body text-metropolia-main-grey'>{text}</p>
  </div>
);

export default Spinner;
