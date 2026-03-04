



// // Optimized StatsCard component
// import React, { memo } from 'react';
// import { motion } from 'framer-motion';

// const colorMap = {
//   blue: 'text-blue-600 bg-blue-50/50 dark:text-blue-400 dark:bg-blue-900/30 border-blue-200/50 dark:border-blue-800/50',
//   green: 'text-green-600 bg-green-50/50 dark:text-green-400 dark:bg-green-900/30 border-green-200/50 dark:border-green-800/50',
//   yellow: 'text-yellow-600 bg-yellow-50/50 dark:text-yellow-400 dark:bg-yellow-900/30 border-yellow-200/50 dark:border-yellow-800/50',
//   red: 'text-red-600 bg-red-50/50 dark:text-red-400 dark:bg-red-900/30 border-red-200/50 dark:border-red-800/50',
//   orange: 'text-orange-600 bg-orange-50/50 dark:text-orange-400 dark:bg-orange-900/30 border-orange-200/50 dark:border-orange-800/50',
//   purple: 'text-purple-600 bg-purple-50/50 dark:text-purple-400 dark:bg-purple-900/30 border-purple-200/50 dark:border-purple-800/50',
//   indigo: 'text-indigo-600 bg-indigo-50/50 dark:text-indigo-400 dark:bg-indigo-900/30 border-indigo-200/50 dark:border-indigo-800/50',
//   amber: 'text-amber-600 bg-amber-50/50 dark:text-amber-400 dark:bg-amber-900/30 border-amber-200/50 dark:border-amber-800/50',
// };

// const StatsCard = memo(({ icon: Icon, value, label, color = 'blue' }) => {
//   const displayValue = value === undefined || value === null ? 0 : value;
  
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.3 }}
//       className={`p-4 rounded-xl ${colorMap[color]} border transition-all hover:shadow-lg hover:scale-105 flex items-center gap-4 shadow-sm`}
//     >
//       <div className={`p-3 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-inner`}>
//         <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
//       </div>
//       <div className="flex-1">
//         <div className="text-2xl font-bold truncate">{displayValue}</div>
//         <div className="text-sm text-gray-600 text-center dark:text-gray-400">{label}</div>
//       </div>
//     </motion.div>
//   );
// });

// StatsCard.displayName = 'StatsCard';

// export default StatsCard;






// Optimized StatsCard component
import React, { memo } from 'react';
import { motion } from 'framer-motion';

const colorMap = {
  blue: 'text-blue-600 bg-blue-50/50 dark:text-blue-400 dark:bg-blue-900/30 border-blue-200/50 dark:border-blue-800/50',
  green: 'text-green-600 bg-green-50/50 dark:text-green-400 dark:bg-green-900/30 border-green-200/50 dark:border-green-800/50',
  yellow: 'text-yellow-600 bg-yellow-50/50 dark:text-yellow-400 dark:bg-yellow-900/30 border-yellow-200/50 dark:border-yellow-800/50',
  red: 'text-red-600 bg-red-50/50 dark:text-red-400 dark:bg-red-900/30 border-red-200/50 dark:border-red-800/50',
  orange: 'text-orange-600 bg-orange-50/50 dark:text-orange-400 dark:bg-orange-900/30 border-orange-200/50 dark:border-orange-800/50',
  purple: 'text-purple-600 bg-purple-50/50 dark:text-purple-400 dark:bg-purple-900/30 border-purple-200/50 dark:border-purple-800/50',
  indigo: 'text-indigo-600 bg-indigo-50/50 dark:text-indigo-400 dark:bg-indigo-900/30 border-indigo-200/50 dark:border-indigo-800/50',
  amber: 'text-amber-600 bg-amber-50/50 dark:text-amber-400 dark:bg-amber-900/30 border-amber-200/50 dark:border-amber-800/50',
};

const StatsCard = memo(({ icon: Icon, value, label, color = 'blue' }) => {
  const displayValue = value === undefined || value === null ? 0 : value;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`p-3 sm:p-4 rounded-xl ${colorMap[color]} border transition-all hover:shadow-lg hover:scale-105 flex items-center gap-2 sm:gap-4 shadow-sm min-w-0`}
    >
      <div className={`p-2 sm:p-3 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-inner flex-shrink-0`}>
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-${color}-600 dark:text-${color}-400`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-base sm:text-lg md:text-2xl font-bold truncate">{displayValue}</div>
        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{label}</div>
      </div>
    </motion.div>
  );
});

StatsCard.displayName = 'StatsCard';

export default StatsCard;