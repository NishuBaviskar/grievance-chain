import React from 'react';
import Spinner from './Spinner';

const Button = ({
  children,
  onClick,
  type = 'button',
  isLoading = false,
  disabled = false,
  className = '',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`relative inline-flex items-center justify-center px-6 py-2.5 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading && <Spinner size="sm" className="absolute" />}
      <span className={isLoading ? 'opacity-0' : 'opacity-100'}>{children}</span>
    </button>
  );
};

export default Button;