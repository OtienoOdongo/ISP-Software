// // NotificationSystem.js
// import React, { useState } from 'react';
// import { Bell, X, Circle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

// const NotificationSystem = ({ notifications, onMarkAsRead, onClearAll, isWidget = false, theme }) => {
//   const [isOpen, setIsOpen] = useState(false);

//   const priorityIcons = {
//     high: AlertTriangle,
//     medium: Info,
//     low: CheckCircle
//   };

//   const priorityColors = {
//     high: "red",
//     medium: "yellow",
//     low: "green"
//   };

//   const unreadCount = notifications.filter(n => !n.read).length;

//   if (isWidget) {
//     return (
//       <div className="relative">
//         <button 
//           onClick={() => setIsOpen(!isOpen)}
//           className={`p-2 rounded-full relative ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
//         >
//           <Bell className="w-6 h-6" />
//           {unreadCount > 0 && (
//             <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//               {unreadCount}
//             </span>
//           )}
//         </button>

//         {isOpen && (
//           <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-lg z-10 ${theme === "dark" ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
//             <div className={`p-4 border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
//               <div className="flex justify-between items-center">
//                 <h3 className="font-semibold">Notifications</h3>
//                 {notifications.length > 0 && (
//                   <button 
//                     onClick={onClearAll}
//                     className="text-sm text-indigo-500 hover:text-indigo-700"
//                   >
//                     Clear All
//                   </button>
//                 )}
//               </div>
//             </div>
//             <div className="max-h-96 overflow-y-auto">
//               {notifications.length === 0 ? (
//                 <div className="p-4 text-center text-gray-500">
//                   No notifications
//                 </div>
//               ) : (
//                 notifications.map(notification => {
//                   const IconComponent = priorityIcons[notification.priority] || Info;
//                   const color = priorityColors[notification.priority] || "blue";
                  
//                   return (
//                     <div 
//                       key={notification.id}
//                       className={`p-4 border-b ${theme === "dark" ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"} ${notification.read ? "opacity-70" : ""}`}
//                     >
//                       <div className="flex gap-3">
//                         <div className={`flex-shrink-0 text-${color}-500`}>
//                           <IconComponent className="w-5 h-5" />
//                         </div>
//                         <div className="flex-1">
//                           <div className="flex justify-between">
//                             <h4 className="font-medium">{notification.title}</h4>
//                             {!notification.read && (
//                               <button onClick={() => onMarkAsRead(notification.id)}>
//                                 <Circle className="w-4 h-4 text-gray-400" />
//                               </button>
//                             )}
//                           </div>
//                           <p className="text-sm mt-1">{notification.message}</p>
//                           <p className="text-xs text-gray-500 mt-2">
//                             {new Date(notification.timestamp).toLocaleString()}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl font-semibold flex items-center gap-2">
//           <Bell className="w-6 h-6" /> Notifications
//         </h2>
//         {notifications.length > 0 && (
//           <button 
//             onClick={onClearAll}
//             className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
//           >
//             Clear All
//           </button>
//         )}
//       </div>

//       {notifications.length === 0 ? (
//         <div className="text-center py-8 text-gray-500">
//           <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
//           <p>No notifications to display</p>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {notifications.map(notification => {
//             const IconComponent = priorityIcons[notification.priority] || Info;
//             const color = priorityColors[notification.priority] || "blue";
            
//             return (
//               <div 
//                 key={notification.id}
//                 className={`p-4 rounded-lg border ${theme === "dark" ? "bg-gray-600 border-gray-500" : "bg-gray-50 border-gray-200"} ${notification.read ? "opacity-70" : ""}`}
//               >
//                 <div className="flex gap-4">
//                   <div className={`flex-shrink-0 p-2 rounded-full bg-${color}-100 text-${color}-600`}>
//                     <IconComponent className="w-5 h-5" />
//                   </div>
//                   <div className="flex-1">
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <h3 className="font-medium">{notification.title}</h3>
//                         <p className="text-sm mt-1">{notification.message}</p>
//                         <p className="text-xs text-gray-500 mt-2">
//                           {new Date(notification.timestamp).toLocaleString()}
//                         </p>
//                       </div>
//                       {!notification.read && (
//                         <button 
//                           onClick={() => onMarkAsRead(notification.id)}
//                           className="text-sm text-indigo-500 hover:text-indigo-700"
//                         >
//                           Mark as read
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default NotificationSystem;







// import React, { useState } from 'react';
// import { Bell, X, Circle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

// const NotificationSystem = ({ notifications, onMarkAsRead, onClearAll, isWidget = false, theme }) => {
//   const [isOpen, setIsOpen] = useState(false);

//   const priorityIcons = {
//     high: AlertTriangle,
//     medium: Info,
//     low: CheckCircle
//   };

//   const priorityColors = {
//     high: "red",
//     medium: "yellow",
//     low: "green"
//   };

//   const unreadCount = notifications.filter(n => !n.read).length;

//   if (isWidget) {
//     return (
//       <div className="relative">
//         <button
//           onClick={() => setIsOpen(!isOpen)}
//           className={`p-2 rounded-full relative ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
//         >
//           <Bell className="w-6 h-6" />
//           {unreadCount > 0 && (
//             <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//               {unreadCount}
//             </span>
//           )}
//         </button>

//         {isOpen && (
//           <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-lg z-10 ${theme === "dark" ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
//             <div className={`p-4 border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
//               <div className="flex justify-between items-center">
//                 <h3 className="font-semibold">Notifications</h3>
//                 {notifications.length > 0 && (
//                   <button
//                     onClick={onClearAll}
//                     className="text-sm text-indigo-500 hover:text-indigo-700"
//                   >
//                     Clear All
//                   </button>
//                 )}
//               </div>
//             </div>
//             <div className="max-h-96 overflow-y-auto">
//               {notifications.length === 0 ? (
//                 <div className="p-4 text-center text-gray-500">
//                   No notifications
//                 </div>
//               ) : (
//                 notifications.map(notification => {
//                   const IconComponent = priorityIcons[notification.priority] || Info;
//                   const color = priorityColors[notification.priority] || "blue";
                  
//                   return (
//                     <div
//                       key={notification.id}
//                       className={`p-4 border-b ${theme === "dark" ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"} ${notification.read ? "opacity-70" : ""}`}
//                     >
//                       <div className="flex gap-3">
//                         <div className={`flex-shrink-0 text-${color}-500`}>
//                           <IconComponent className="w-5 h-5" />
//                         </div>
//                         <div className="flex-1">
//                           <div className="flex justify-between">
//                             <h4 className="font-medium">{notification.title}</h4>
//                             {!notification.read && (
//                               <button onClick={() => onMarkAsRead(notification.id)}>
//                                 <Circle className="w-4 h-4 text-gray-400" />
//                               </button>
//                             )}
//                           </div>
//                           <p className="text-sm mt-1">{notification.message}</p>
//                           <p className="text-xs text-gray-500 mt-2">
//                             {new Date(notification.timestamp).toLocaleString()}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl font-semibold flex items-center gap-2">
//           <Bell className="w-6 h-6" /> Notifications
//         </h2>
//         {notifications.length > 0 && (
//           <button
//             onClick={onClearAll}
//             className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
//           >
//             Clear All
//           </button>
//         )}
//       </div>

//       {notifications.length === 0 ? (
//         <div className="text-center py-8 text-gray-500">
//           <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
//           <p>No notifications to display</p>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {notifications.map(notification => {
//             const IconComponent = priorityIcons[notification.priority] || Info;
//             const color = priorityColors[notification.priority] || "blue";
            
//             return (
//               <div
//                 key={notification.id}
//                 className={`p-4 rounded-lg border ${theme === "dark" ? "bg-gray-600 border-gray-500" : "bg-gray-50 border-gray-200"} ${notification.read ? "opacity-70" : ""}`}
//               >
//                 <div className="flex gap-4">
//                   <div className={`flex-shrink-0 p-2 rounded-full bg-${color}-100 text-${color}-600`}>
//                     <IconComponent className="w-5 h-5" />
//                   </div>
//                   <div className="flex-1">
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <h3 className="font-medium">{notification.title}</h3>
//                         <p className="text-sm mt-1">{notification.message}</p>
//                         <p className="text-xs text-gray-500 mt-2">
//                           {new Date(notification.timestamp).toLocaleString()}
//                         </p>
//                       </div>
//                       {!notification.read && (
//                         <button
//                           onClick={() => onMarkAsRead(notification.id)}
//                           className="text-sm text-indigo-500 hover:text-indigo-700"
//                         >
//                           Mark as read
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default NotificationSystem;









// import React, { useState, useCallback } from 'react';
// import { BellRing, X, CircleDot, AlertOctagon, CheckCircle2, Info } from 'lucide-react';
// import { motion } from 'framer-motion';
// import { toast } from 'react-hot-toast';

// const NotificationSystem = ({ notifications, onMarkAsRead, onClearAll, isWidget = false, theme }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [sortBy, setSortBy] = useState('timestamp');

//   const priorityIcons = {
//     high: AlertOctagon,
//     medium: Info,
//     low: CheckCircle2
//   };

//   const priorityColors = {
//     high: "red",
//     medium: "yellow",
//     low: "green"
//   };

//   const unreadCount = notifications.filter(n => !n.read).length;

//   const sortedNotifications = [...notifications].sort((a, b) => {
//     if (sortBy === 'priority') {
//       const priorityOrder = { high: 3, medium: 2, low: 1 };
//       return priorityOrder[b.priority] - priorityOrder[a.priority];
//     }
//     return new Date(b.timestamp) - new Date(a.timestamp);
//   });

//   const handleMarkAsRead = useCallback((id) => {
//     onMarkAsRead(id);
//     toast.success('Marked as read');
//   }, [onMarkAsRead]);

//   const handleClearAll = useCallback(() => {
//     if (window.confirm('Are you sure you want to clear all notifications?')) {
//       onClearAll();
//       toast.success('Notifications cleared');
//     }
//   }, [onClearAll]);

//   if (isWidget) {
//     return (
//       <div className="relative">
//         <button
//           onClick={() => setIsOpen(!isOpen)}
//           className={`p-2 rounded-full relative transition ${
//             theme === "dark" 
//               ? "hover:bg-gray-700 text-white" 
//               : "hover:bg-gray-200 text-gray-800"
//           }`}
//           aria-label={`Notifications, ${unreadCount} unread`}
//         >
//           <BellRing className="w-6 h-6 text-indigo-500" />
//           {unreadCount > 0 && (
//             <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
//               {unreadCount}
//             </span>
//           )}
//         </button>

//         {isOpen && (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }} 
//             animate={{ opacity: 1, scale: 1 }} 
//             exit={{ opacity: 0, scale: 0.95 }}
//             className={`absolute right-0 mt-2 w-96 rounded-xl shadow-2xl z-20 overflow-hidden ${
//               theme === "dark" 
//                 ? "bg-gray-900 border border-gray-800 text-white" 
//                 : "bg-white border border-gray-300 text-gray-800"
//             }`}
//           >
//             <div className={`p-4 border-b flex justify-between items-center ${
//               theme === "dark" ? "border-gray-800" : "border-gray-300"
//             }`}>
//               <h3 className="font-semibold text-lg">Notifications</h3>
//               <div className="flex gap-2 items-center">
//                 <select 
//                   onChange={(e) => setSortBy(e.target.value)} 
//                   className={`text-sm p-1 rounded ${
//                     theme === "dark" 
//                       ? "bg-gray-800 text-white" 
//                       : "bg-gray-100 text-gray-800"
//                   }`}
//                 >
//                   <option value="timestamp">Sort by Time</option>
//                   <option value="priority">Sort by Priority</option>
//                 </select>
//                 {notifications.length > 0 && (
//                   <button 
//                     onClick={handleClearAll} 
//                     className="text-sm text-indigo-500 hover:text-indigo-700"
//                   >
//                     Clear All
//                   </button>
//                 )}
//                 <button 
//                   onClick={() => setIsOpen(false)} 
//                   className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
//                 >
//                   <X className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>
//             <div className="max-h-96 overflow-y-auto">
//               {sortedNotifications.length === 0 ? (
//                 <div className="p-4 text-center text-gray-500">No notifications</div>
//               ) : (
//                 sortedNotifications.map(notification => {
//                   const IconComponent = priorityIcons[notification.priority] || Info;
//                   const color = priorityColors[notification.priority] || "blue";
                  
//                   return (
//                     <motion.div
//                       key={notification.id}
//                       initial={{ opacity: 0 }} 
//                       animate={{ opacity: 1 }}
//                       className={`p-4 border-b transition ${
//                         theme === "dark" 
//                           ? "border-gray-800 hover:bg-gray-800" 
//                           : "border-gray-300 hover:bg-gray-50"
//                       } ${notification.read ? "opacity-60" : ""}`}
//                     >
//                       <div className="flex gap-3">
//                         <div className={`flex-shrink-0 text-${color}-500`}>
//                           <IconComponent className="w-5 h-5" />
//                         </div>
//                         <div className="flex-1">
//                           <div className="flex justify-between">
//                             <h4 className="font-medium text-base">{notification.title}</h4>
//                             {!notification.read && (
//                               <button 
//                                 onClick={() => handleMarkAsRead(notification.id)} 
//                                 aria-label="Mark as read"
//                                 className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
//                               >
//                                 <CircleDot className="w-4 h-4 text-indigo-500" />
//                               </button>
//                             )}
//                           </div>
//                           <p className="text-sm mt-1">{notification.message}</p>
//                           <p className="text-xs text-gray-400 mt-2">
//                             {new Date(notification.timestamp).toLocaleString()}
//                           </p>
//                         </div>
//                       </div>
//                     </motion.div>
//                   );
//                 })
//               )}
//             </div>
//           </motion.div>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div className={`rounded-xl p-6 shadow-lg ${
//       theme === "dark" 
//         ? "bg-gray-800/50 backdrop-blur-md text-white" 
//         : "bg-white/50 backdrop-blur-md text-gray-800"
//     }`}>
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl font-semibold flex items-center gap-2">
//           <BellRing className="w-6 h-6 text-indigo-500" /> Notifications
//         </h2>
//         {notifications.length > 0 && (
//           <button 
//             onClick={handleClearAll} 
//             className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
//           >
//             Clear All
//           </button>
//         )}
//       </div>

//       {notifications.length === 0 ? (
//         <div className="text-center py-8 text-gray-500">
//           <BellRing className="w-12 h-12 mx-auto mb-4 opacity-50" />
//           <p>No notifications to display</p>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {sortedNotifications.map(notification => {
//             const IconComponent = priorityIcons[notification.priority] || Info;
//             const color = priorityColors[notification.priority] || "blue";
            
//             return (
//               <motion.div
//                 key={notification.id}
//                 className={`p-4 rounded-lg border transition ${
//                   theme === "dark" 
//                     ? "bg-gray-700 border-gray-600" 
//                     : "bg-gray-50 border-gray-200"
//                 } ${notification.read ? "opacity-60" : ""}`}
//                 whileHover={{ scale: 1.02 }}
//               >
//                 <div className="flex gap-4">
//                   <div className={`flex-shrink-0 p-2 rounded-full bg-${color}-100/50 text-${color}-600`}>
//                     <IconComponent className="w-5 h-5" />
//                   </div>
//                   <div className="flex-1">
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <h3 className="font-medium text-lg">{notification.title}</h3>
//                         <p className="text-sm mt-1">{notification.message}</p>
//                         <p className="text-xs text-gray-400 mt-2">
//                           {new Date(notification.timestamp).toLocaleString()}
//                         </p>
//                       </div>
//                       {!notification.read && (
//                         <button 
//                           onClick={() => handleMarkAsRead(notification.id)} 
//                           className="text-sm text-indigo-500 hover:text-indigo-700"
//                         >
//                           Mark as read
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default NotificationSystem;









import React, { useState, useMemo, useCallback } from 'react';
import { BellRing, X, CircleDot, AlertOctagon, CheckCircle2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

// Priority mapping for efficient sorting
const PRIORITY_ORDER = { high: 3, medium: 2, low: 1 };
const PRIORITY_ICONS = {
  high: AlertOctagon,
  medium: Info,
  low: CheckCircle2
};
const PRIORITY_COLORS = {
  high: "red",
  medium: "yellow",
  low: "green"
};

// Notification manager class
class NotificationManager {
  constructor(notifications = []) {
    this.notifications = notifications;
  }

  sortNotifications(sortBy) {
    return [...this.notifications].sort((a, b) => {
      if (sortBy === 'priority') {
        return PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
      }
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
  }

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  markAsRead(id) {
    return this.notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
  }
}

const NotificationSystem = ({ notifications, onMarkAsRead, onClearAll, isWidget = false, theme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sortBy, setSortBy] = useState('timestamp');

  // Initialize notification manager
  const notificationManager = useMemo(() => 
    new NotificationManager(notifications),
    [notifications]
  );

  // Memoized sorted notifications
  const sortedNotifications = useMemo(() => 
    notificationManager.sortNotifications(sortBy),
    [notificationManager, sortBy]
  );

  const unreadCount = useMemo(() => 
    notificationManager.getUnreadCount(),
    [notificationManager]
  );

  const handleMarkAsRead = useCallback((id) => {
    onMarkAsRead(id);
    toast.success('Marked as read');
  }, [onMarkAsRead]);

  const handleClearAll = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      onClearAll();
      toast.success('Notifications cleared');
    }
  }, [onClearAll]);

  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  if (isWidget) {
    return (
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className={`p-2 rounded-full relative transition-all ${
            theme === "dark" 
              ? "hover:bg-gray-700 text-white" 
              : "hover:bg-gray-200 text-gray-800"
          }`}
          aria-label={`Notifications, ${unreadCount} unread`}
        >
          <BellRing className="w-6 h-6 text-indigo-500" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className={`absolute right-0 mt-2 w-96 rounded-xl shadow-2xl z-50 overflow-hidden ${
                theme === "dark" 
                  ? "bg-gray-900 border border-gray-800 text-white" 
                  : "bg-white border border-gray-300 text-gray-800"
              }`}
            >
              <div className={`p-4 border-b flex justify-between items-center ${
                theme === "dark" ? "border-gray-800" : "border-gray-300"
              }`}>
                <h3 className="font-semibold text-lg">Notifications</h3>
                <div className="flex gap-2 items-center">
                  <select 
                    onChange={(e) => setSortBy(e.target.value)} 
                    className={`text-sm p-1 rounded ${
                      theme === "dark" 
                        ? "bg-gray-800 text-white" 
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <option value="timestamp">Sort by Time</option>
                    <option value="priority">Sort by Priority</option>
                  </select>
                  {notifications.length > 0 && (
                    <button 
                      onClick={handleClearAll} 
                      className="text-sm text-indigo-500 hover:text-indigo-700"
                    >
                      Clear All
                    </button>
                  )}
                  <button 
                    onClick={toggleDropdown} 
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {sortedNotifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No notifications</div>
                ) : (
                  sortedNotifications.map(notification => {
                    const IconComponent = PRIORITY_ICONS[notification.priority] || Info;
                    const color = PRIORITY_COLORS[notification.priority] || "blue";
                    
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`p-4 border-b transition-all ${
                          theme === "dark" 
                            ? "border-gray-800 hover:bg-gray-800" 
                            : "border-gray-300 hover:bg-gray-50"
                        } ${notification.read ? "opacity-60" : ""}`}
                      >
                        <div className="flex gap-3">
                          <div className={`flex-shrink-0 text-${color}-500`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h4 className="font-medium text-base">{notification.title}</h4>
                              {!notification.read && (
                                <button 
                                  onClick={() => handleMarkAsRead(notification.id)} 
                                  aria-label="Mark as read"
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                >
                                  <CircleDot className="w-4 h-4 text-indigo-500" />
                                </button>
                              )}
                            </div>
                            <p className="text-sm mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={`rounded-xl p-6 shadow-lg ${
      theme === "dark" 
        ? "bg-gray-800/60 backdrop-blur-md text-white" 
        : "bg-white/60 backdrop-blur-md text-gray-800"
    }`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <BellRing className="w-6 h-6 text-indigo-500" /> Notifications
        </h2>
        {notifications.length > 0 && (
          <button 
            onClick={handleClearAll} 
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
          >
            Clear All
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {notifications.length === 0 ? (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-8 text-gray-500"
          >
            <BellRing className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No notifications to display</p>
          </motion.div>
        ) : (
          <motion.div
            key="notifications-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {sortedNotifications.map(notification => {
              const IconComponent = PRIORITY_ICONS[notification.priority] || Info;
              const color = PRIORITY_COLORS[notification.priority] || "blue";
              
              return (
                <motion.div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all ${
                    theme === "dark" 
                      ? "bg-gray-700 border-gray-600" 
                      : "bg-gray-50 border-gray-200"
                  } ${notification.read ? "opacity-60" : ""}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex gap-4">
                    <div className={`flex-shrink-0 p-2 rounded-full bg-${color}-100/50 text-${color}-600`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg">{notification.title}</h3>
                          <p className="text-sm mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <button 
                            onClick={() => handleMarkAsRead(notification.id)} 
                            className="text-sm text-indigo-500 hover:text-indigo-700"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(NotificationSystem);