import React from 'react';

export const LoadingSpinner: React.FC<{ size?: string; className?: string }> = ({
  size = 'w-6 h-6',
  className = ''
}) => {
  return (
    <div
      className={`inline-block ${size} border-3 border-blue-500 border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
};
