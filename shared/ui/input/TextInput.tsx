import React from 'react';

interface TextInputProps {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const TextInput = ({
  placeholder,
  value,
  onChange,
  className = '',
}: TextInputProps) => (
  <input
    type="text"
    placeholder={placeholder}
    className={`form-control ${className}`}
    value={value}
    onChange={onChange}
  />
);

export default TextInput;
