import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle,
  icon,
  footer,
  variant = 'default',
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = ''
}) => {
  // Card variants
  let cardClasses = 'rounded-lg overflow-hidden shadow-md';
  let headerClasses = 'px-6 py-4 border-b';
  let bodyClasses = 'px-6 py-4';
  let footerClasses = 'px-6 py-4 border-t';
  
  switch (variant) {
    case 'primary':
      cardClasses += ' bg-dark-800 border border-primary-600';
      headerClasses += ' border-primary-600 bg-gradient-to-r from-primary-800 to-primary-900';
      footerClasses += ' border-primary-700 bg-dark-700';
      break;
    case 'elevated':
      cardClasses += ' bg-dark-700 border border-dark-600 shadow-lg';
      headerClasses += ' border-dark-600';
      footerClasses += ' border-dark-600';
      break;
    case 'flat':
      cardClasses += ' bg-dark-800 border-none shadow-none';
      headerClasses += ' border-dark-700';
      footerClasses += ' border-dark-700';
      break;
    case 'default':
    default:
      cardClasses += ' bg-dark-800 border border-dark-700';
      headerClasses += ' border-dark-700';
      footerClasses += ' border-dark-700';
  }
  
  return (
    <div className={`${cardClasses} ${className}`}>
      {(title || subtitle) && (
        <div className={`${headerClasses} ${headerClassName}`}>
          {icon && <div className="mb-2">{icon}</div>}
          <div className="flex items-center justify-between">
            <div>
              {title && <h3 className="text-lg font-semibold text-gray-100">{title}</h3>}
              {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
            </div>
          </div>
        </div>
      )}
      
      <div className={`${bodyClasses} ${bodyClassName}`}>{children}</div>
      
      {footer && (
        <div className={`${footerClasses} ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
