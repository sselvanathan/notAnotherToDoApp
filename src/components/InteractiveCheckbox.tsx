import React from 'react';
import { Check } from 'lucide-react';

interface InteractiveCheckboxProps {
  checked: boolean;
  onChange: () => void;
}

export const InteractiveCheckbox: React.FC<InteractiveCheckboxProps> = ({ checked, onChange }) => {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        onChange();
      }}
      className={`inline-flex items-center justify-center w-4 h-4 mr-1 ${
        checked ? 'bg-green-500 text-white' : 'border border-gray-300 bg-white'
      } rounded`}
      aria-checked={checked}
      role="checkbox"
    >
      {checked && <Check size={12} />}
    </button>
  );
};