import React from 'react';

const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  size = 'md', 
  className = '',
  disabled = false,
  fullWidth = false,
  icon = null,
  iconPosition = 'left', 
  onClick,
  ...props
}) => {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-800';
  
  // Size classes
  let sizeClasses = '';
  switch (size) {
    case 'xs':
      sizeClasses = 'px-2.5 py-1.5 text-xs';
      break;
    case 'sm':
      sizeClasses = 'px-3 py-2 text-sm';
      break;
    case 'lg':
      sizeClasses = 'px-5 py-3 text-lg';
      break;
    case 'md':
    default:
      sizeClasses = 'px-4 py-2 text-sm';
  }
  
  // Variant classes
  let variantClasses = '';
  switch (variant) {
    case 'secondary':
      variantClasses = 'bg-dark-600 hover:bg-dark-500 text-white focus:ring-primary-400 border border-dark-500';
      break;
    case 'outline':
      variantClasses = 'bg-transparent hover:bg-dark-700 text-primary-400 border border-primary-500 focus:ring-primary-400';
      break;
    case 'danger':
      variantClasses = 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500';
      break;
    case 'success':
      variantClasses = 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500';
      break;
    case 'warning':
      variantClasses = 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500';
      break;
    case 'ghost':
      variantClasses = 'bg-transparent hover:bg-dark-700 text-gray-300 hover:text-white focus:ring-primary-400';
      break;
    case 'link':
      variantClasses = 'bg-transparent text-primary-400 hover:text-primary-300 hover:underline p-0 border-0 focus:ring-0';
      break;
    case 'primary':
    default:
      variantClasses = 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500';
  }
  
  // Disabled classes
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer';
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Filter out custom props that shouldn't be passed to the button element
  const { iconPosition: _, ...buttonProps } = props;
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${disabledClasses} ${widthClasses} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...buttonProps}
    >
      {icon && iconPosition === 'left' && <span className={`${children ? 'mr-2' : ''}`}>{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className={`${children ? 'ml-2' : ''}`}>{icon}</span>}
    </button>
  );
};

export default Button;
