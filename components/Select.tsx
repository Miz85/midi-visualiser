import React from "react";

interface SelectProps {
  options: Array<{
    value: string;
    label: string;
  }>;
  value: string;
  onChange: (newValue: string) => void;
}
export const Select: React.FunctionComponent<SelectProps> = React.memo(
  ({ options, value, onChange }) => {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option value={option.value}>{option.label}</option>
        ))}
      </select>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.value === nextProps.value &&
      prevProps.options === nextProps.options
    );
  }
);
