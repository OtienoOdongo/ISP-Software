// // LanguageRegionSelector.js
// import React, { useState } from 'react';
// import { Globe, ChevronDown } from 'lucide-react';

// const LanguageRegionSelector = ({ language, region, onChange, theme }) => {
//   const [isOpen, setIsOpen] = useState(false);

//   const languages = [
//     { code: 'en', name: 'English', regions: ['US', 'GB', 'AU'] },
//     { code: 'sw', name: 'Swahili', regions: ['KE', 'TZ', 'UG'] }
//   ];

//   const currentLanguage = languages.find(lang => lang.code === language);
//   const currentRegion = region;

//   const handleLanguageChange = (newLanguageCode) => {
//     const newLanguage = languages.find(lang => lang.code === newLanguageCode);
//     if (newLanguage) {
//       onChange(newLanguageCode, newLanguage.regions[0]);
//     }
//     setIsOpen(false);
//   };

//   const handleRegionChange = (newRegion) => {
//     onChange(language, newRegion);
//     setIsOpen(false);
//   };

//   return (
//     <div className="relative">
//       <button 
//         onClick={() => setIsOpen(!isOpen)}
//         className={`flex items-center gap-2 px-3 py-2 rounded-lg ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-white hover:bg-gray-100"} border ${theme === "dark" ? "border-gray-600" : "border-gray-200"}`}
//       >
//         <Globe className="w-4 h-4" />
//         <span>{currentLanguage.code.toUpperCase()}-{currentRegion}</span>
//         <ChevronDown className="w-4 h-4" />
//       </button>

//       {isOpen && (
//         <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-10 ${theme === "dark" ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
//           <div className="p-2">
//             <h3 className="px-3 py-2 text-sm font-semibold">Language</h3>
//             {languages.map(lang => (
//               <button
//                 key={lang.code}
//                 onClick={() => handleLanguageChange(lang.code)}
//                 className={`w-full text-left px-3 py-2 rounded-md text-sm ${language === lang.code ? 'bg-indigo-100 text-indigo-700' : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
//               >
//                 {lang.name}
//               </button>
//             ))}
            
//             <h3 className="px-3 py-2 mt-2 text-sm font-semibold border-t border-gray-200 dark:border-gray-700">Region</h3>
//             {currentLanguage.regions.map(reg => (
//               <button
//                 key={reg}
//                 onClick={() => handleRegionChange(reg)}
//                 className={`w-full text-left px-3 py-2 rounded-md text-sm ${region === reg ? 'bg-indigo-100 text-indigo-700' : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
//               >
//                 {reg}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LanguageRegionSelector;








// import React, { useState } from 'react';
// import { Globe, ChevronDown } from 'lucide-react';

// const LanguageRegionSelector = ({ language, region, onChange, theme }) => {
//   const [isOpen, setIsOpen] = useState(false);

//   const languages = [
//     { code: 'en', name: 'English', regions: ['US', 'GB', 'AU'] },
//     { code: 'sw', name: 'Swahili', regions: ['KE', 'TZ', 'UG'] }
//   ];

//   const currentLanguage = languages.find(lang => lang.code === language) || languages[0];
//   const currentRegion = region;

//   const handleLanguageChange = (newLanguageCode) => {
//     const newLanguage = languages.find(lang => lang.code === newLanguageCode);
//     if (newLanguage) {
//       onChange(newLanguageCode, newLanguage.regions[0]);
//     }
//     setIsOpen(false);
//   };

//   const handleRegionChange = (newRegion) => {
//     onChange(language, newRegion);
//     setIsOpen(false);
//   };

//   return (
//     <div className="relative">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className={`flex items-center gap-2 px-3 py-2 rounded-lg ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-white hover:bg-gray-100"} border ${theme === "dark" ? "border-gray-600" : "border-gray-200"}`}
//       >
//         <Globe className="w-4 h-4" />
//         <span>{currentLanguage.code.toUpperCase()}-{currentRegion}</span>
//         <ChevronDown className="w-4 h-4" />
//       </button>

//       {isOpen && (
//         <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-10 ${theme === "dark" ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
//           <div className="p-2">
//             <h3 className="px-3 py-2 text-sm font-semibold">Language</h3>
//             {languages.map(lang => (
//               <button
//                 key={lang.code}
//                 onClick={() => handleLanguageChange(lang.code)}
//                 className={`w-full text-left px-3 py-2 rounded-md text-sm ${language === lang.code ? 'bg-indigo-100 text-indigo-700' : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
//               >
//                 {lang.name}
//               </button>
//             ))}
            
//             <h3 className="px-3 py-2 mt-2 text-sm font-semibold border-t border-gray-200 dark:border-gray-700">Region</h3>
//             {currentLanguage.regions.map(reg => (
//               <button
//                 key={reg}
//                 onClick={() => handleRegionChange(reg)}
//                 className={`w-full text-left px-3 py-2 rounded-md text-sm ${region === reg ? 'bg-indigo-100 text-indigo-700' : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
//               >
//                 {reg}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LanguageRegionSelector;





import React, { useState, useMemo } from 'react';
import { Globe2, ChevronDown, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const LanguageRegionSelector = ({ language, region, onChange, theme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const languages = useMemo(() => [
    { code: 'en', name: 'English', regions: ['US', 'GB', 'AU'], icon: '🇺🇸' },
    { code: 'sw', name: 'Swahili', regions: ['KE', 'TZ', 'UG'], icon: '🇰🇪' }
  ], []);

  const filteredLanguages = languages.filter(lang => 
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    lang.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];
  const currentRegion = region;

  const handleLanguageChange = (newLanguageCode) => {
    const newLanguage = languages.find(lang => lang.code === newLanguageCode);
    if (newLanguage) onChange(newLanguageCode, newLanguage.regions[0]);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleRegionChange = (newRegion) => {
    onChange(language, newRegion);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition shadow ${
          theme === "dark" 
            ? "bg-gray-800 hover:bg-gray-700 text-white" 
            : "bg-white hover:bg-gray-100 text-gray-800"
        } border ${
          theme === "dark" ? "border-gray-700" : "border-gray-300"
        }`}
        aria-haspopup="true" 
        aria-expanded={isOpen}
      >
        <Globe2 className="w-4 h-4 text-indigo-500" />
        <span>{currentLanguage.code.toUpperCase()}-{currentRegion}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: -10 }}
          className={`absolute right-0 mt-2 w-64 rounded-xl shadow-2xl z-20 overflow-hidden ${
            theme === "dark" 
              ? "bg-gray-900 border border-gray-800 text-white" 
              : "bg-white border border-gray-300 text-gray-800"
          }`}
        >
          <div className="p-3 border-b border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search language..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 p-2 rounded-lg ${
                  theme === "dark" 
                    ? "bg-gray-800 text-white placeholder-gray-400" 
                    : "bg-gray-100 text-gray-800 placeholder-gray-500"
                }`}
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto p-2">
            <h3 className="px-3 py-2 text-sm font-semibold text-gray-400">Language</h3>
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center gap-2 text-left px-3 py-2 rounded-md text-sm transition ${
                    language === lang.code 
                      ? 'bg-indigo-600 text-white' 
                      : theme === 'dark' 
                        ? 'hover:bg-gray-800' 
                        : 'hover:bg-gray-100'
                  }`}
                >
                  <span>{lang.icon}</span> {lang.name}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-400">No languages found</div>
            )}
            
            <h3 className="px-3 py-2 mt-2 text-sm font-semibold text-gray-400 border-t border-gray-700">Region</h3>
            {currentLanguage.regions.map(reg => (
              <button
                key={reg}
                onClick={() => handleRegionChange(reg)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition ${
                  region === reg 
                    ? 'bg-indigo-600 text-white' 
                    : theme === 'dark' 
                      ? 'hover:bg-gray-800' 
                      : 'hover:bg-gray-100'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LanguageRegionSelector;