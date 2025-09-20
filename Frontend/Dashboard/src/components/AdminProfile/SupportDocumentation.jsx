// // SupportDocumentation.js
// import React from 'react';
// import { BookOpen, FileText, HelpCircle, Video, MessageCircle } from 'lucide-react';

// const SupportDocumentation = ({ theme }) => {
//   const resources = [
//     {
//       title: "System Documentation",
//       description: "Complete guide to system features and administration",
//       icon: BookOpen,
//       link: "#"
//     },
//     {
//       title: "FAQs",
//       description: "Frequently asked questions and solutions",
//       icon: HelpCircle,
//       link: "#"
//     },
//     {
//       title: "Video Tutorials",
//       description: "Step-by-step video guides for common tasks",
//       icon: Video,
//       link: "#"
//     },
//     {
//       title: "API Documentation",
//       description: "Technical reference for API integration",
//       icon: FileText,
//       link: "#"
//     },
//     {
//       title: "Community Forum",
//       description: "Connect with other administrators",
//       icon: MessageCircle,
//       link: "#"
//     }
//   ];

//   return (
//     <div className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
//       <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
//         <BookOpen className="w-6 h-6" /> Support & Documentation
//       </h2>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {resources.map((resource, index) => {
//           const IconComponent = resource.icon;
//           return (
//             <a
//               key={index}
//               href={resource.link}
//               className={`p-4 rounded-lg border ${theme === "dark" ? "bg-gray-600 border-gray-500 hover:bg-gray-500" : "bg-gray-50 border-gray-200 hover:bg-gray-100"} transition-colors`}
//             >
//               <div className="flex items-start gap-4">
//                 <div className={`p-2 rounded-full ${theme === "dark" ? "bg-indigo-900 text-indigo-200" : "bg-indigo-100 text-indigo-600"}`}>
//                   <IconComponent className="w-5 h-5" />
//                 </div>
//                 <div>
//                   <h3 className="font-semibold">{resource.title}</h3>
//                   <p className="text-sm mt-1 text-gray-500">{resource.description}</p>
//                 </div>
//               </div>
//             </a>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default SupportDocumentation;








// import React from 'react';
// import { BookOpen, FileText, HelpCircle, Video, MessageCircle } from 'lucide-react';

// const SupportDocumentation = ({ theme }) => {
//   const resources = [
//     {
//       title: "System Documentation",
//       description: "Complete guide to system features and administration",
//       icon: BookOpen,
//       link: "/docs/system"
//     },
//     {
//       title: "FAQs",
//       description: "Frequently asked questions and solutions",
//       icon: HelpCircle,
//       link: "/docs/faqs"
//     },
//     {
//       title: "Video Tutorials",
//       description: "Step-by-step video guides for common tasks",
//       icon: Video,
//       link: "/docs/tutorials"
//     },
//     {
//       title: "API Documentation",
//       description: "Technical reference for API integration",
//       icon: FileText,
//       link: "/docs/api"
//     },
//     {
//       title: "Community Forum",
//       description: "Connect with other administrators",
//       icon: MessageCircle,
//       link: "/forum"
//     }
//   ];

//   return (
//     <div className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
//       <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
//         <BookOpen className="w-6 h-6" /> Support & Documentation
//       </h2>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {resources.map((resource, index) => {
//           const IconComponent = resource.icon;
//           return (
//             <a
//               key={index}
//               href={resource.link}
//               className={`p-4 rounded-lg border ${theme === "dark" ? "bg-gray-600 border-gray-500 hover:bg-gray-500" : "bg-gray-50 border-gray-200 hover:bg-gray-100"} transition-colors`}
//             >
//               <div className="flex items-start gap-4">
//                 <div className={`p-2 rounded-full ${theme === "dark" ? "bg-indigo-900 text-indigo-200" : "bg-indigo-100 text-indigo-600"}`}>
//                   <IconComponent className="w-5 h-5" />
//                 </div>
//                 <div>
//                   <h3 className="font-semibold">{resource.title}</h3>
//                   <p className="text-sm mt-1 text-gray-500">{resource.description}</p>
//                 </div>
//               </div>
//             </a>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default SupportDocumentation;










// import React, { useState } from 'react';
// import { BookOpen, FileText, HelpCircle, Video, MessageCircle, Search, ExternalLink } from 'lucide-react';
// import { motion } from 'framer-motion';

// const SupportDocumentation = ({ theme }) => {
//   const [searchTerm, setSearchTerm] = useState('');

//   const resources = [
//     {
//       title: "System Documentation",
//       description: "Complete guide to system features and administration",
//       icon: BookOpen,
//       link: "/docs/system"
//     },
//     {
//       title: "FAQs",
//       description: "Frequently asked questions and solutions",
//       icon: HelpCircle,
//       link: "/docs/faqs"
//     },
//     {
//       title: "Video Tutorials",
//       description: "Step-by-step video guides for common tasks",
//       icon: Video,
//       link: "/docs/tutorials"
//     },
//     {
//       title: "API Documentation",
//       description: "Technical reference for API integration",
//       icon: FileText,
//       link: "/docs/api"
//     },
//     {
//       title: "Community Forum",
//       description: "Connect with other administrators",
//       icon: MessageCircle,
//       link: "/forum"
//     },
//     {
//       title: "Troubleshooting Guide",
//       description: "Common issues and how to resolve them",
//       icon: HelpCircle,
//       link: "/docs/troubleshooting"
//     }
//   ];

//   const filteredResources = resources.filter(res => 
//     res.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
//     res.description.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className={`rounded-xl p-6 shadow-lg ${
//       theme === "dark" 
//         ? "bg-gray-800/50 backdrop-blur-md text-white" 
//         : "bg-white/50 backdrop-blur-md text-gray-800"
//     }`}>
//       <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
//         <BookOpen className="w-6 h-6 text-indigo-500" /> Support & Documentation
//       </h2>
      
//       <div className="relative mb-6">
//         <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
//         <input
//           type="text"
//           placeholder="Search resources..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className={`w-full pl-10 p-2 rounded-lg ${
//             theme === "dark" 
//               ? "bg-gray-700 text-white placeholder-gray-400" 
//               : "bg-gray-100 text-gray-800 placeholder-gray-500"
//           }`}
//         />
//       </div>
      
//       {filteredResources.length === 0 ? (
//         <div className="text-center py-8 text-gray-500">
//           <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
//           <p>No resources found matching your search</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {filteredResources.map((resource, index) => {
//             const IconComponent = resource.icon;
//             return (
//               <motion.a
//                 key={index}
//                 href={resource.link}
//                 className={`p-4 rounded-lg border flex items-start gap-4 transition hover:shadow-md ${
//                   theme === "dark" 
//                     ? "bg-gray-700 border-gray-600 hover:bg-gray-600" 
//                     : "bg-gray-50 border-gray-200 hover:bg-gray-100"
//                 }`}
//                 target="_blank" 
//                 rel="noopener noreferrer"
//                 whileHover={{ y: -5 }}
//               >
//                 <div className={`p-2 rounded-full ${
//                   theme === "dark" 
//                     ? "bg-indigo-900/50 text-indigo-300" 
//                     : "bg-indigo-100/50 text-indigo-600"
//                 }`}>
//                   <IconComponent className="w-5 h-5" />
//                 </div>
//                 <div className="flex-1">
//                   <h3 className="font-semibold flex items-center gap-1">
//                     {resource.title} 
//                     <ExternalLink className="w-4 h-4 text-gray-400" />
//                   </h3>
//                   <p className="text-sm mt-1 text-gray-400">{resource.description}</p>
//                 </div>
//               </motion.a>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default SupportDocumentation;



import React, { useState, useMemo, useCallback } from 'react';
import { BookOpen, FileText, HelpCircle, Video, MessageCircle, Search, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Support resources manager
class SupportResourcesManager {
  constructor() {
    this.resources = new Map([
      ['system-docs', {
        id: 'system-docs',
        title: "System Documentation",
        description: "Complete guide to system features and administration",
        icon: BookOpen,
        link: "/docs/system"
      }],
      ['faqs', {
        id: 'faqs',
        title: "FAQs",
        description: "Frequently asked questions and solutions",
        icon: HelpCircle,
        link: "/docs/faqs"
      }],
      ['tutorials', {
        id: 'tutorials',
        title: "Video Tutorials",
        description: "Step-by-step video guides for common tasks",
        icon: Video,
        link: "/docs/tutorials"
      }],
      ['api-docs', {
        id: 'api-docs',
        title: "API Documentation",
        description: "Technical reference for API integration",
        icon: FileText,
        link: "/docs/api"
      }],
      ['forum', {
        id: 'forum',
        title: "Community Forum",
        description: "Connect with other administrators",
        icon: MessageCircle,
        link: "/forum"
      }],
      ['troubleshooting', {
        id: 'troubleshooting',
        title: "Troubleshooting Guide",
        description: "Common issues and how to resolve them",
        icon: HelpCircle,
        link: "/docs/troubleshooting"
      }]
    ]);
  }

  searchResources(searchTerm) {
    const term = searchTerm.toLowerCase();
    return Array.from(this.resources.values()).filter(res => 
      res.title.toLowerCase().includes(term) || 
      res.description.toLowerCase().includes(term)
    );
  }

  getAllResources() {
    return Array.from(this.resources.values());
  }
}

const SupportDocumentation = ({ theme }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize support manager
  const supportManager = useMemo(() => new SupportResourcesManager(), []);
  
  // Memoized filtered resources
  const filteredResources = useMemo(() => 
    searchTerm ? supportManager.searchResources(searchTerm) : supportManager.getAllResources(),
    [supportManager, searchTerm]
  );

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  return (
    <div className={`rounded-xl p-6 shadow-lg ${
      theme === "dark" 
        ? "bg-gray-800/60 backdrop-blur-md text-white" 
        : "bg-white/60 backdrop-blur-md text-gray-800"
    }`}>
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-indigo-500" /> Support & Documentation
      </h2>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search resources..."
          value={searchTerm}
          onChange={handleSearch}
          className={`w-full pl-10 p-2 rounded-lg text-sm ${
            theme === "dark" 
              ? "bg-gray-700 text-white placeholder-gray-400" 
              : "bg-gray-100 text-gray-800 placeholder-gray-500"
          }`}
        />
      </div>
      
      <AnimatePresence mode="wait">
        {filteredResources.length === 0 ? (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-8 text-gray-500"
          >
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No resources found matching your search</p>
          </motion.div>
        ) : (
          <motion.div
            key="resources-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {filteredResources.map((resource, index) => {
              const IconComponent = resource.icon;
              return (
                <motion.a
                  key={resource.id}
                  href={resource.link}
                  className={`p-4 rounded-lg border flex items-start gap-4 transition-all hover:shadow-md ${
                    theme === "dark" 
                      ? "bg-gray-700 border-gray-600 hover:bg-gray-600" 
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  whileHover={{ y: -5 }}
                  whileTap={{ y: 0 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`p-2 rounded-full ${
                    theme === "dark" 
                      ? "bg-indigo-900/50 text-indigo-300" 
                      : "bg-indigo-100/50 text-indigo-600"
                  }`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold flex items-center gap-1">
                      {resource.title} 
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </h3>
                    <p className={`text-sm mt-1 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}>{resource.description}</p>
                  </div>
                </motion.a>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(SupportDocumentation);