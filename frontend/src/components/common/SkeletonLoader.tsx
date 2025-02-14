import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
  width?: string;
  height?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  count = 1,
  width = 'w-full',
  height = 'h-5',
}) => {
  return (
    <>
      {Array.from({length: count}).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-gray-200 rounded ${width} ${height} ${className}`}
        />
      ))}
    </>
  );
};

export default SkeletonLoader;
