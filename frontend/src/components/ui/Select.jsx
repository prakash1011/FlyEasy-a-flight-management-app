import React, { forwardRef } from 'react';

const Select = forwardRef(({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  disabled = false,
  required = false,
  error = '',
  className = '',
  placeholder = 'Select an option',
  fullWidth = true,
  ...props
}, ref) => {
  const selectClasses = `
    block px-4 py-2.5 w-full
    bg-dark-700 border
    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-dark-500 focus:border-primary-500 focus:ring-primary-500'}
    text-gray-100 rounded-md
    focus:outline-none focus:ring-2
    disabled:opacity-50 disabled:cursor-not-allowed
    appearance-none
    ${className}
  `;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} mb-4`}>
      {label && (
        <label 
          htmlFor={id} 
          className={`block mb-2 text-sm font-medium ${error ? 'text-red-500' : 'text-gray-300'}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          name={name}
          ref={ref}
          value={value}
          onChange={onChange}
          className={selectClasses}
          disabled={disabled}
          required={required}
          {...props}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              className="bg-dark-700 text-gray-100"
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
