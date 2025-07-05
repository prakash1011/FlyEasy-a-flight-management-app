import React from 'react';
import PropTypes from 'prop-types';

const Loader = ({ size = 'medium', text, fullScreen = false }) => {
  // Size classes for the spinner
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4',
  };

  // Container classes based on fullScreen prop
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center z-50 bg-dark-900 bg-opacity-80'
    : 'flex flex-col items-center justify-center';

  return (
    <div className={containerClasses}>
      <div
        className={`${sizeClasses[size]} rounded-full border-primary-500 border-t-transparent animate-spin`}
        role="status"
        aria-label="Loading"
      ></div>
      
      {text && (
        <p className="mt-4 text-gray-300 text-center">
          {text}
        </p>
      )}
    </div>
  );
};

Loader.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  text: PropTypes.string,
  fullScreen: PropTypes.bool,
};

export default Loader;
