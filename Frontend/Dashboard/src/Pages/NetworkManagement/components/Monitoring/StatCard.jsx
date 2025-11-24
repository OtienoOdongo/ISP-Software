// // src/components/Network/StatCard.jsx
// import React from 'react';
// import { motion } from 'framer-motion';
// import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components"

// const StatCard = ({ 
//   title, 
//   value, 
//   icon, 
//   subtitle, 
//   color = "blue", 
//   trend,
//   theme = "light",
//   onClick 
// }) => {
//   const themeClasses = getThemeClasses(theme);

//   const colorClasses = {
//     blue: "bg-blue-500",
//     green: "bg-green-500", 
//     red: "bg-red-500",
//     purple: "bg-purple-500",
//     orange: "bg-orange-500",
//     yellow: "bg-yellow-500"
//   };

//   const CardComponent = onClick ? motion.div : 'div';
//   const cardProps = onClick ? {
//     whileHover: { y: -2, scale: 1.02 },
//     onClick,
//     className: "cursor-pointer"
//   } : {};

//   return (
//     <CardComponent 
//       {...cardProps}
//       className={`p-4 rounded-lg border ${themeClasses.bg.card} ${themeClasses.border.light} ${onClick ? 'cursor-pointer' : ''}`}
//     >
//       <div className="flex items-center justify-between">
//         <div>
//           <p className={`text-sm font-medium ${themeClasses.text.secondary}`}>{title}</p>
//           <div className="flex items-baseline space-x-2 mt-1">
//             <p className={`text-2xl font-bold ${themeClasses.text.primary}`}>{value}</p>
//             {trend && (
//               <span className={`text-sm ${
//                 trend.direction === 'up' ? 'text-green-500' : 
//                 trend.direction === 'down' ? 'text-red-500' : 
//                 themeClasses.text.tertiary
//               }`}>
//                 {trend.value}
//               </span>
//             )}
//           </div>
//           {subtitle && (
//             <p className={`text-xs mt-1 ${themeClasses.text.tertiary}`}>{subtitle}</p>
//           )}
//         </div>
//         <div className={`p-3 rounded-full ${colorClasses[color]} text-white shadow-lg`}>
//           {icon}
//         </div>
//       </div>
//     </CardComponent>
//   );
// };

// export default StatCard;







// src/components/Network/StatCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components"

const StatCard = ({ 
  title, 
  value, 
  icon, 
  subtitle, 
  color = "blue", 
  trend,
  theme = "light",
  onClick,
  size = "default"
}) => {
  const themeClasses = getThemeClasses(theme);

  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500", 
    red: "bg-red-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
    yellow: "bg-yellow-500"
  };

  const sizeClasses = {
    small: "p-3",
    default: "p-4",
    large: "p-6"
  };

  const textSizeClasses = {
    small: "text-lg",
    default: "text-2xl", 
    large: "text-3xl"
  };

  const CardComponent = onClick ? motion.div : 'div';
  const cardProps = onClick ? {
    whileHover: { y: -2, scale: 1.02 },
    onClick,
    className: "cursor-pointer"
  } : {};

  return (
    <CardComponent 
      {...cardProps}
      className={`${sizeClasses[size]} rounded-lg border ${themeClasses.bg.card} ${themeClasses.border.light} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${themeClasses.text.secondary}`}>{title}</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <p className={`${textSizeClasses[size]} font-bold ${themeClasses.text.primary}`}>{value}</p>
            {trend && (
              <span className={`text-sm ${
                trend.direction === 'up' ? 'text-green-500' : 
                trend.direction === 'down' ? 'text-red-500' : 
                themeClasses.text.tertiary
              }`}>
                {trend.value}
              </span>
            )}
          </div>
          {subtitle && (
            <p className={`text-xs mt-1 ${themeClasses.text.tertiary}`}>{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]} text-white shadow-lg`}>
          {icon}
        </div>
      </div>
    </CardComponent>
  );
};

export default StatCard;