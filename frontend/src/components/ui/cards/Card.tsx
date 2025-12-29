import React from 'react';

interface CardProps {
  title: string;
  value: React.ReactNode;
  suffix?: string;
  fullWidth?: boolean;
}

const Card: React.FC<CardProps> = ({ title, value, suffix, fullWidth = false }) => {
  const baseClasses =
    'bg-white p-4 rounded-md shadow-sm border border-gray-100 transition-all hover:shadow-md';

  return (
    <div className={`${baseClasses} ${fullWidth ? 'md:col-span-2' : ''}`}>
      <p className='text-sm uppercase text-metropolia-main-grey-dark mb-1'>{title}</p>
      <p className='font-heading text-lg'>
        {value}{' '}
        {suffix && <span className='text-sm text-metropolia-main-grey'>{suffix}</span>}
      </p>
    </div>
  );
};

export default Card;
