
// Loading spinner component
import React from 'react';
import { RefreshCw } from 'lucide-react';

export const LoadingSpinner = ({ size = 'default' }) => {
  const sizes = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className="flex items-center justify-center p-8">
      <RefreshCw className={`${sizes[size]} text-indigo-600 animate-spin`} />
    </div>
  );
};