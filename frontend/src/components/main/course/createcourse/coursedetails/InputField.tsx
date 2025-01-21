import React from 'react';
/**
 * InputField component properties
 */
interface InputFieldProps {
  label?: string;
  type: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
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
}) => (
  <>
    <label className='mb-2 font-heading text-gray-900' htmlFor={name}>
      {label}
    </label>
    <input
      className='w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-metropoliaMainOrange '
      type={type}
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      aria-label={label}
      required
      disabled={disabled}
      placeholder={placeholder}
    />
  </>
);

export default InputField;
