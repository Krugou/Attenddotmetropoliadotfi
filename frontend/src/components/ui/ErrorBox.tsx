import React from 'react';

interface ErrorBoxProps {
  errors: string[];
}

const ErrorBox: React.FC<ErrorBoxProps> = ({ errors }) => {
  if (errors.length === 0) return null;

  return (
    <div className='p-5 mb-6 bg-metropolia-support-red/10 border-l-4 border-metropolia-support-red rounded-r-lg animate-pulse'>
      <h3 className='text-lg font-heading text-metropolia-support-red mb-2'>Validation Errors</h3>
      <ul className='list-disc list-inside text-metropolia-support-red-dark font-body'>
        {errors.map((error, index) => (
          <li key={index} className='mb-1'>
            {error}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ErrorBox;
