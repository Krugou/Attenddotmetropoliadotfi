import React from 'react';

interface NumberInputFieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (val: number) => void;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
  hint?: string;
}

const NumberInputField: React.FC<NumberInputFieldProps> = ({
                                                 id,
                                                 label,
                                                 value,
                                                 onChange,
                                                 step,
                                                 min,
                                                 max,
                                                 unit,
                                                 hint,
                                               }) => {
  return (
    <div>
      <label
        className='block mb-2 text-metropolia-main-grey font-heading text-sm'
        htmlFor={id}>
        {label}
      </label>
      <div className='relative'>
        <input
          id={id}
          type='number'
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          step={step}
          min={min}
          max={max}
          className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-metropolia-main-orange focus:border-transparent transition-all duration-200'
        />
        {unit && (
          <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-sm text-gray-500'>
            {unit}
          </div>
        )}
      </div>
      {hint && <p className='mt-1 text-xs text-gray-500'>{hint}</p>}
    </div>
  );
};

export default NumberInputField;
