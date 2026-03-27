'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from './Button';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: string[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, options, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`
              w-full h-10 px-3 pr-10
              bg-white dark:bg-zinc-800/80 border border-gray-300 dark:border-zinc-700/60 rounded-md
              text-gray-900 dark:text-gray-100
              focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500
              transition-all duration-200 appearance-none
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              ${className}
            `}
            {...props}
          >
            <option value="" className="bg-white dark:bg-gray-950">Select an option</option>
            {options.map((option) => (
              <option key={option} value={option} className="bg-white dark:bg-gray-950">
                {option}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
