// // src/components/Loading/LoadingSpinner.jsx
// import React from 'react';

// export const LoadingSpinner = ({ size = 'md', theme = 'light' }) => {
//   const sizes = {
//     sm: 'h-4 w-4',
//     md: 'h-8 w-8',
//     lg: 'h-12 w-12'
//   };

//   return (
//     <div className={`animate-spin rounded-full border-b-2 ${
//       theme === 'dark' ? 'border-indigo-400' : 'border-blue-500'
//     } ${sizes[size]}`}></div>
//   );
// };

// export const SkeletonLoader = ({ lines = 3, theme = 'light' }) => {
//   return (
//     <div className="space-y-3">
//       {Array.from({ length: lines }).map((_, i) => (
//         <div
//           key={i}
//           className={`animate-pulse rounded ${
//             theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
//           } h-4`}
//         ></div>
//       ))}
//     </div>
//   );
// };







// src/components/PaymentConfiguration/LoadingSpinner.jsx
import React from 'react';

export const LoadingSpinner = ({ size = 'md', theme = 'light' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 ${
      theme === 'dark' ? 'border-indigo-400' : 'border-blue-500'
    } ${sizes[size]}`}></div>
  );
};

export const SkeletonLoader = ({ lines = 3, theme = 'light' }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse rounded ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          } h-4`}
        ></div>
      ))}
    </div>
  );
};

export default LoadingSpinner;