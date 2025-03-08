import React from 'react';
/**
 * InputField component properties
 */
interface InputFieldProps {
  label?: string;
  type: string;
  name: string;
  value: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  disabled?: boolean;
  placeholder?: string;
  rows?: number;
  className?: string;
  maxLength?: number;
}
/**
 * InputField is a functional component that renders an input field with a label.
 *
 * @param props - The properties of the input field.
 * @returns A JSX element.
 */
const InputField: React.FC<InputFieldProps> = ({
  label = '',
  type,
  name,
  value,
  onChange,
  disabled = false,
  placeholder = '',
  rows = 4,
  className = 'w-full p-2 border rounded-sm focus:outline-hidden focus:ring-2 focus:ring-metropolia-main-orange',
  maxLength,
}) => (
  <>
    <label className='mb-2 font-heading text-gray-900' htmlFor={name}>
      {label}:
    </label>
    {type === 'textarea' ? (
      <textarea
        className={className}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        aria-label={label}
        required
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
      />
    ) : (
      <input
        className={className}
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        aria-label={label}
        required
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
      />
    )}
  </>
);

export default InputField;
