import React from 'react';

interface SubmitButtonProps {
  disabled: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({disabled}) => (
  <div className='flex justify-center w-full'>
    <button
      type='submit'
      disabled={disabled}
      className={`mt-5 mb-2 p-2 w-fit bg-metropolia-trend-green hover:bg-green-600 transition text-white rounded-md ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}>
      Add New User
    </button>
  </div>
);

export default SubmitButton;
