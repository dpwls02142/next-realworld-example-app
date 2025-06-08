import React from 'react';

interface TextAreaProps {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  className?: string;
}

const TextArea = ({
  placeholder,
  value,
  onChange,
  rows = 8,
  className = '',
}: TextAreaProps) => (
  <textarea
    className={`form-control ${className}`}
    rows={rows}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
  />
);

export default TextArea;
