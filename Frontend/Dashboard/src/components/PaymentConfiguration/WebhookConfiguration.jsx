// import React from 'react';
// import { FiCode, FiCopy } from 'react-icons/fi';

// export const WebhookConfiguration = ({ 
//   callbackURL, 
//   onChange, 
//   index, 
//   generateCallbackUrl,
//   testConnection
// }) => (
//   <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//     <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
//       <FiCode className="mr-2 text-green-500" />
//       Webhook Configuration
//     </h3>
    
//     <div className="space-y-4">
//       <div>
//         <label htmlFor={`callbackURL-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
//           Callback URL
//           <span className="text-red-500">*</span>
//         </label>
//         <div className="relative">
//           <input
//             id={`callbackURL-${index}`}
//             type="url"
//             name="callbackURL"
//             value={callbackURL || ''}
//             onChange={onChange}
//             className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
//             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             placeholder="https://example.com/callback"
//           />
//           <button
//             type="button"
//             onClick={() => copyToClipboard(callbackURL)}
//             className="absolute inset-y-0 right-10 pr-3 flex items-center text-gray-500 hover:text-gray-700"
//             title="Copy to clipboard"
//           >
//             <FiCopy />
//           </button>
//         </div>
//         <p className="mt-1 text-xs text-gray-500 break-all">
//           This URL will receive payment notifications. Click "Generate" to create a secure endpoint.
//         </p>
//       </div>
      
//       <div className="flex justify-between">
//         <button
//           type="button"
//           onClick={() => generateCallbackUrl(index)}
//           className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//         >
//           <FiCode className="mr-2" />
//           Generate URL
//         </button>
        
//         {testConnection}
//       </div>
      
//       <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
//         <div className="flex">
//           <div className="flex-shrink-0">
//             <FiInfo className="h-5 w-5 text-yellow-400" />
//           </div>
//           <div className="ml-3">
//             <p className="text-sm text-yellow-700">
//               <strong>Important:</strong> Ensure your server is configured to accept POST requests at the callback URL. 
//               The endpoint should return a 200 status code within 5 seconds.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
// );




import React from 'react';
import { FiCode, FiCopy, FiInfo } from 'react-icons/fi';
import PropTypes from 'prop-types';

/**
 * Configuration panel for webhook settings.
 */
const WebhookConfiguration = ({
  callback_url,
  onChange,
  index,
  generateCallbackUrl,
  testConnection,
  copyToClipboard,
}) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
      <FiCode className="mr-2 text-green-500" />
      Webhook Configuration
    </h3>

    <div className="space-y-4">
      <div>
        <label htmlFor={`callback_url-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
          Callback URL
          <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id={`callback_url-${index}`}
            type="url"
            name="callback_url"
            value={callback_url || ''}
            onChange={(e) => onChange(index, e)}
            className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com/callback"
          />
          <button
            type="button"
            onClick={() => copyToClipboard(callback_url)}
            className="absolute inset-y-0 right-10 pr-3 flex items-center text-gray-500 hover:text-gray-700"
            title="Copy to clipboard"
          >
            <FiCopy />
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500 break-all">
          This URL will receive payment notifications. Click "Generate" to create a secure endpoint.
        </p>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => generateCallbackUrl(index)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FiCode className="mr-2" />
          Generate URL
        </button>

        {testConnection}
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <FiInfo className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Important:</strong> Ensure your server is configured to accept POST requests at the callback URL.
              The endpoint should return a 200 status code within 5 seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

WebhookConfiguration.propTypes = {
  callback_url: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  generateCallbackUrl: PropTypes.func.isRequired,
  testConnection: PropTypes.node.isRequired,
  copyToClipboard: PropTypes.func.isRequired,
};

export default WebhookConfiguration;