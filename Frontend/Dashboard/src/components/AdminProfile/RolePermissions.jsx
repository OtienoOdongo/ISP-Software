// // RolePermissions.js
// import React from 'react';
// import { UserCheck, Shield, CheckCircle } from 'lucide-react';

// const RolePermissions = ({ theme }) => {
//   const roles = [
//     {
//       name: "Super Admin",
//       description: "Full system access with all permissions",
//       permissions: ["All permissions"]
//     },
//     {
//       name: "Support Admin",
//       description: "Access to client management and support functions",
//       permissions: ["View clients", "Edit client details", "Process payments", "View system logs"]
//     },
//     {
//       name: "Network Technician",
//       description: "Access to network monitoring and troubleshooting",
//       permissions: ["View network status", "Run diagnostics", "Create support tickets"]
//     }
//   ];

//   return (
//     <div className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
//       <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
//         <UserCheck className="w-6 h-6" /> Roles & Permissions
//       </h2>

//       <div className="space-y-6">
//         {roles.map((role, index) => (
//           <div key={index} className={`p-4 rounded-lg border ${theme === "dark" ? "bg-gray-600 border-gray-500" : "bg-gray-50 border-gray-200"}`}>
//             <div className="flex items-start gap-4">
//               <div className={`p-2 rounded-full ${theme === "dark" ? "bg-indigo-900 text-indigo-200" : "bg-indigo-100 text-indigo-600"}`}>
//                 <Shield className="w-5 h-5" />
//               </div>
//               <div className="flex-1">
//                 <h3 className="font-semibold text-lg">{role.name}</h3>
//                 <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                
//                 <div className="mt-4">
//                   <h4 className="font-medium mb-2">Permissions:</h4>
//                   <ul className="space-y-2">
//                     {role.permissions.map((permission, i) => (
//                       <li key={i} className="flex items-center gap-2">
//                         <CheckCircle className="w-4 h-4 text-green-500" />
//                         <span>{permission}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default RolePermissions;





// import React from 'react';
// import { UserCheck, Shield, CheckCircle } from 'lucide-react';

// const RolePermissions = ({ theme }) => {
//   const roles = [
//     {
//       name: "Super Admin",
//       description: "Full system access with all permissions",
//       permissions: ["All permissions"]
//     },
//     {
//       name: "Support Admin",
//       description: "Access to client management and support functions",
//       permissions: ["View clients", "Edit client details", "Process payments", "View system logs"]
//     },
//     {
//       name: "Network Technician",
//       description: "Access to network monitoring and troubleshooting",
//       permissions: ["View network status", "Run diagnostics", "Create support tickets"]
//     }
//   ];

//   return (
//     <div className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
//       <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
//         <UserCheck className="w-6 h-6" /> Roles & Permissions
//       </h2>

//       <div className="space-y-6">
//         {roles.map((role, index) => (
//           <div key={index} className={`p-4 rounded-lg border ${theme === "dark" ? "bg-gray-600 border-gray-500" : "bg-gray-50 border-gray-200"}`}>
//             <div className="flex items-start gap-4">
//               <div className={`p-2 rounded-full ${theme === "dark" ? "bg-indigo-900 text-indigo-200" : "bg-indigo-100 text-indigo-600"}`}>
//                 <Shield className="w-5 h-5" />
//               </div>
//               <div className="flex-1">
//                 <h3 className="font-semibold text-lg">{role.name}</h3>
//                 <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                
//                 <div className="mt-4">
//                   <h4 className="font-medium mb-2">Permissions:</h4>
//                   <ul className="space-y-2">
//                     {role.permissions.map((permission, i) => (
//                       <li key={i} className="flex items-center gap-2">
//                         <CheckCircle className="w-4 h-4 text-green-500" />
//                         <span>{permission}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default RolePermissions;












// import React, { useState } from 'react';
// import { UserCog, ShieldCheck, CheckCircle2, ChevronDown } from 'lucide-react';
// import { motion } from 'framer-motion';

// const RolePermissions = ({ theme }) => {
//   const [expandedRole, setExpandedRole] = useState(null);

//   const roles = [
//     {
//       name: "Super Admin",
//       description: "Full system access with all permissions",
//       permissions: ["All permissions", "User management", "System configuration", "Billing and payments", "Network management"]
//     },
//     {
//       name: "Support Admin",
//       description: "Access to client management and support functions",
//       permissions: ["View clients", "Edit client details", "Process payments", "View system logs", "Create support tickets"]
//     },
//     {
//       name: "Network Technician",
//       description: "Access to network monitoring and troubleshooting",
//       permissions: ["View network status", "Run diagnostics", "Create support tickets", "View device information"]
//     }
//   ];

//   return (
//     <div className={`rounded-xl p-6 shadow-lg ${
//       theme === "dark" 
//         ? "bg-gray-800/50 backdrop-blur-md text-white" 
//         : "bg-white/50 backdrop-blur-md text-gray-800"
//     }`}>
//       <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
//         <UserCog className="w-6 h-6 text-indigo-500" /> Roles & Permissions
//       </h2>

//       <div className="space-y-4">
//         {roles.map((role, index) => (
//           <motion.div
//             key={index}
//             className={`p-4 rounded-lg border cursor-pointer transition ${
//               theme === "dark" 
//                 ? "bg-gray-700 border-gray-600 hover:bg-gray-600" 
//                 : "bg-gray-50 border-gray-200 hover:bg-gray-100"
//             }`}
//             onClick={() => setExpandedRole(expandedRole === index ? null : index)}
//             whileHover={{ scale: 1.02 }}
//           >
//             <div className="flex items-center justify-between">
//               <div className="flex items-start gap-4">
//                 <div className={`p-2 rounded-full ${
//                   theme === "dark" 
//                     ? "bg-indigo-900/50 text-indigo-300" 
//                     : "bg-indigo-100/50 text-indigo-600"
//                 }`}>
//                   <ShieldCheck className="w-5 h-5" />
//                 </div>
//                 <div>
//                   <h3 className="font-semibold text-lg">{role.name}</h3>
//                   <p className="text-sm text-gray-400">{role.description}</p>
//                 </div>
//               </div>
//               <ChevronDown className={`w-5 h-5 transition-transform ${
//                 expandedRole === index ? 'rotate-180' : ''
//               }`} />
//             </div>
            
//             {expandedRole === index && (
//               <motion.div 
//                 initial={{ height: 0, opacity: 0 }} 
//                 animate={{ height: 'auto', opacity: 1 }}
//                 transition={{ duration: 0.3 }}
//                 className="mt-4 overflow-hidden"
//               >
//                 <h4 className="font-medium mb-2 text-gray-400">Permissions:</h4>
//                 <ul className="space-y-2">
//                   {role.permissions.map((permission, i) => (
//                     <li key={i} className="flex items-center gap-2 text-sm">
//                       <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
//                       <span title={permission}>{permission}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </motion.div>
//             )}
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default RolePermissions;





import React, { useState, useMemo, useCallback } from 'react';
import { UserCog, ShieldCheck, CheckCircle2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Role permissions data structure
class RolePermissionsManager {
  constructor() {
    this.roles = new Map([
      ['super-admin', {
        name: "Super Admin",
        description: "Full system access with all permissions",
        permissions: ["All permissions", "User management", "System configuration", "Billing and payments", "Network management"]
      }],
      ['support-admin', {
        name: "Support Admin",
        description: "Access to client management and support functions",
        permissions: ["View clients", "Edit client details", "Process payments", "View system logs", "Create support tickets"]
      }],
      ['network-technician', {
        name: "Network Technician",
        description: "Access to network monitoring and troubleshooting",
        permissions: ["View network status", "Run diagnostics", "Create support tickets", "View device information"]
      }]
    ]);
  }

  getRole(key) {
    return this.roles.get(key);
  }

  getAllRoles() {
    return Array.from(this.roles.values());
  }
}

const RolePermissions = ({ theme }) => {
  const [expandedRole, setExpandedRole] = useState(null);

  // Initialize role manager
  const roleManager = useMemo(() => new RolePermissionsManager(), []);
  const roles = useMemo(() => roleManager.getAllRoles(), [roleManager]);

  const toggleRole = useCallback((index) => {
    setExpandedRole(prev => prev === index ? null : index);
  }, []);

  return (
    <div className={`rounded-xl p-6 shadow-lg ${
      theme === "dark" 
        ? "bg-gray-800/60 backdrop-blur-md text-white" 
        : "bg-white/60 backdrop-blur-md text-gray-800"
    }`}>
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <UserCog className="w-6 h-6 text-indigo-500" /> Roles & Permissions
      </h2>

      <div className="space-y-4">
        {roles.map((role, index) => (
          <motion.div
            key={index}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              theme === "dark" 
                ? "bg-gray-700 border-gray-600 hover:bg-gray-600" 
                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
            }`}
            onClick={() => toggleRole(index)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-full ${
                  theme === "dark" 
                    ? "bg-indigo-900/50 text-indigo-300" 
                    : "bg-indigo-100/50 text-indigo-600"
                }`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{role.name}</h3>
                  <p className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}>{role.description}</p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform ${
                expandedRole === index ? 'rotate-180' : ''
              }`} />
            </div>
            
            <AnimatePresence>
              {expandedRole === index && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 overflow-hidden"
                >
                  <h4 className={`font-medium mb-2 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}>Permissions:</h4>
                  <ul className="space-y-2">
                    {role.permissions.map((permission, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span title={permission}>{permission}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(RolePermissions);