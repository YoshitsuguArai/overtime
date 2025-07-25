import React from 'react';

interface TimeInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const TimeInput: React.FC<TimeInputProps> = ({
  label,
  value,
  onChange,
  disabled = false
}) => {
  return (
    <div className="time-input">
      <label htmlFor={`time-${label}`}>{label}:</label>
      <input
        id={`time-${label}`}
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="time-input-field"
      />
    </div>
  );
};