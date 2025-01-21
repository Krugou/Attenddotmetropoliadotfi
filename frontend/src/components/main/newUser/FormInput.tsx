import React from 'react';

interface FormInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
}) => (
  <label className='block mt-4'>
    <span className='font-heading text-gray-700'>{label}</span>
    <input
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className='w-full px-3 py-2 mt-1 mb-3 leading-tight text-gray-700 border shadow appearance-none rounded-3xl focus:outline-none focus:shadow-outline'
    />
  </label>
);

export default FormInput;
