
// Skeleton loader for tables
import React from 'react';

export const TableSkeleton = ({ rows = 5, columns = 5 }) => {
  return (
    <div className="animate-pulse">
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex space-x-3">
            {Array.from({ length: columns }).map((_, j) => (
              <div
                key={j}
                className="h-12 bg-gray-200 dark:bg-gray-800 rounded flex-1"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};