import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  type = 'text',
  id,
  name,
  placeholder = '',
  value,
  onChange,
  disabled = false,
  required = false,
  error = '',
  icon = null,
  className = '',
  fullWidth = true,
  autoComplete = 'off',
  ...props
}, ref) => {
  const inputClasses = `
    block px-4 py-2.5 w-full
    bg-dark-700 border
    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-dark-500 focus:border-primary-500 focus:ring-primary-500'}
    text-gray-100 rounded-md
    focus:outline-none focus:ring-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${icon ? 'pl-10' : ''}
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
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
        <input
          type={type}
          id={id}
          name={name}
          ref={ref}
          value={value}
          onChange={onChange}
          className={inputClasses}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
