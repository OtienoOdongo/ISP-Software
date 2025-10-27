

// import React from 'react';
// import { FiCode, FiCopy, FiInfo } from 'react-icons/fi';

// const WebhookConfiguration = ({
//   callbackUrl,
//   onChange,
//   index,
//   generateCallbackUrl,
//   testConnection,
//   copyToClipboard
// }) => (
//   <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//     <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
//       <FiCode className="mr-2 text-green-500" />
//       Webhook Configuration
//     </h3>

//     <div className="space-y-4">
//       <div>
//         <label htmlFor={`callbackURL-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
//           Callback URL <span className="text-red-500">*</span>
//         </label>
//         <div className="relative">
//           <input
//             id={`callbackURL-${index}`}
//             type="url"
//             name="callbackURL"
//             value={callbackUrl || ''}
//             onChange={onChange}
//             className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//             placeholder="https://example.com/callback"
//           />
//           <button
//             type="button"
//             onClick={() => copyToClipboard(callbackUrl)}
//             className="absolute inset-y-0 right-10 pr-3 flex items-center text-gray-500 hover:text-gray-700"
//             title="Copy to clipboard"
//           >
//             <FiCopy />
//           </button>
//         </div>
//         <p className="mt-1 text-xs text-gray-500">
//           This URL will receive payment notifications
//         </p>
//       </div>

//       <div className="flex justify-between">
//         <button
//           type="button"
//           onClick={generateCallbackUrl}
//           className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         >
//           <FiCode className="mr-2" />
//           Generate URL
//         </button>
//         {testConnection}
//       </div>

//       <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
//         <div className="flex">
//           <FiInfo className="h-5 w-5 text-yellow-400 flex-shrink-0" />
//           <div className="ml-3">
//             <p className="text-sm text-yellow-700">
//               Ensure your server is configured to accept POST requests
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
// );

// export default WebhookConfiguration;







import React from 'react';
import { FiCode, FiCopy, FiInfo } from 'react-icons/fi';

const WebhookConfiguration = ({
  callbackUrl,
  onChange,
  index,
  generateCallbackUrl,
  testConnection,
  copyToClipboard,
  theme = 'light'
}) => {
  // Theme-based CSS classes
  const cardClass = theme === 'dark'
    ? 'bg-gray-800/80 backdrop-blur-md border border-gray-700'
    : 'bg-white border border-gray-200';

  const inputClass = theme === 'dark'
    ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500'
    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

  const titleClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const helperTextClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const iconClass = theme === 'dark' ? 'text-green-400' : 'text-green-500';

  const buttonClass = theme === 'dark'
    ? 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 text-white'
    : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 text-white';

  const infoClass = theme === 'dark'
    ? 'bg-yellow-900/30 border-l-4 border-yellow-500'
    : 'bg-yellow-50 border-l-4 border-yellow-400';

  const infoTextClass = theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700';

  return (
    <div className={`p-6 rounded-xl shadow-md ${cardClass}`}>
      <h3 className={`text-lg font-medium mb-4 flex items-center ${titleClass}`}>
        <FiCode className={`mr-2 ${iconClass}`} />
        Webhook Configuration
      </h3>

      <div className="space-y-4">
        <div>
          <label htmlFor={`callbackURL-${index}`} className={`block text-sm font-medium mb-1 ${textClass}`}>
            Callback URL <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id={`callbackURL-${index}`}
              type="url"
              name="callbackURL"
              value={callbackUrl || ''}
              onChange={onChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
              placeholder="https://example.com/callback"
            />
            <button
              type="button"
              onClick={() => copyToClipboard(callbackUrl)}
              className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
                theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Copy to clipboard"
            >
              <FiCopy />
            </button>
          </div>
          <p className={`mt-1 text-xs ${helperTextClass}`}>
            This URL will receive payment notifications
          </p>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={generateCallbackUrl}
            className={`inline-flex items-center px-4 py-2 rounded-md shadow-sm focus:outline-none transition-colors ${buttonClass}`}
          >
            <FiCode className="mr-2" />
            Generate URL
          </button>
          {testConnection}
        </div>

        <div className={`p-4 rounded-md ${infoClass}`}>
          <div className="flex">
            <FiInfo className={`h-5 w-5 flex-shrink-0 ${
              theme === 'dark' ? 'text-yellow-400' : 'text-yellow-400'
            }`} />
            <div className="ml-3">
              <p className={`text-sm ${infoTextClass}`}>
                Ensure your server is configured to accept POST requests
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebhookConfiguration;