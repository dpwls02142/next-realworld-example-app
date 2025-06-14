import React from 'react';

interface TextInputProps {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  id?: string;
}

const TextInput = ({
  placeholder,
  value,
  onChange,
  className = '',
  id,
}: TextInputProps) => (
  <input
    id={id}
    type="text"
    placeholder={placeholder}
    className={`form-control ${className}`}
    value={value}
    onChange={onChange}
  />
);

export default TextInput;
