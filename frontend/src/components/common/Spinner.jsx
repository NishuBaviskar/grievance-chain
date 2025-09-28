import React from 'react';
import { Loader } from 'lucide-react';

const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <Loader
      className={`animate-spin text-blue-600 ${sizeClasses[size]} ${className}`}
    />
  );
};

export default Spinner;