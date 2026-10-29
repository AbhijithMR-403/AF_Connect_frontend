import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { inputClass, labelClass } from './styles';

const PasswordField = ({ id, label, value, onChange, autoComplete, error, disabled, autoFocus }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          disabled={disabled}
          required
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${inputClass} pr-10`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="absolute inset-y-0 right-0 px-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-r-lg"
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600 dark:text-red-400">
          {Array.isArray(error) ? error.join(' ') : error}
        </p>
      )}
    </div>
  );
};

export default PasswordField;
