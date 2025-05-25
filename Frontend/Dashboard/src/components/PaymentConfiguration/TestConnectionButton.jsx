// import React, { useState } from 'react';
// import { FaPlug, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';
// import { toast } from 'react-toastify';

// const TestConnectionButton = ({ methodType, callbackUrl, fullWidth = false }) => {
//   const [isTesting, setIsTesting] = useState(false);
//   const [isSuccess, setIsSuccess] = useState(null);

//   const testConnection = async () => {
//     if (!callbackUrl) {
//       toast.error('Please configure a callback URL first', {
//         position: "top-right",
//         autoClose: 5000,
//       });
//       return;
//     }

//     setIsTesting(true);
//     setIsSuccess(null);

//     // Simulate API test (replace with actual API call)
//     try {
//       await new Promise(resolve => setTimeout(resolve, 1500));
      
//       // Random success/failure for demo purposes
//       const success = Math.random() > 0.3;
//       setIsSuccess(success);
      
//       if (success) {
//         toast.success(`${methodType} connection test successful!`, {
//           position: "top-right",
//           autoClose: 3000,
//         });
//       } else {
//         toast.error(`${methodType} connection failed. Check your settings.`, {
//           position: "top-right",
//           autoClose: 5000,
//         });
//       }
//     } catch (error) {
//       setIsSuccess(false);
//       toast.error('Connection test failed', {
//         position: "top-right",
//         autoClose: 5000,
//       });
//     } finally {
//       setIsTesting(false);
//     }
//   };

//   return (
//     <button
//       onClick={testConnection}
//       disabled={isTesting}
//       className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
//         isSuccess === null 
//           ? 'bg-blue-600 hover:bg-blue-700' 
//           : isSuccess 
//             ? 'bg-green-600 hover:bg-green-700' 
//             : 'bg-red-600 hover:bg-red-700'
//       } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
//         fullWidth ? 'w-full' : ''
//       } transition-colors duration-200`}
//     >
//       {isTesting ? (
//         <>
//           <FaSpinner className="animate-spin mr-2" />
//           Testing...
//         </>
//       ) : isSuccess === null ? (
//         <>
//           <FaPlug className="mr-2" />
//           Test Connection
//         </>
//       ) : isSuccess ? (
//         <>
//           <FaCheck className="mr-2" />
//           Success
//         </>
//       ) : (
//         <>
//           <FaTimes className="mr-2" />
//           Failed
//         </>
//       )}
//     </button>
//   );
// };

// export default TestConnectionButton;





// import React, { useState } from 'react';
// import { FiPlug, FiLoader, FiCheck, FiX } from 'react-icons/fi';
// import { toast } from 'react-toastify';

// const TestConnectionButton = ({ methodType, callbackUrl, fullWidth = false }) => {
//   const [isTesting, setIsTesting] = useState(false);
//   const [isSuccess, setIsSuccess] = useState(null);

//   const testConnection = async () => {
//     if (!callbackUrl) {
//       toast.error('Please configure a callback URL first', {
//         position: "top-right",
//         autoClose: 5000,
//       });
//       return;
//     }

//     setIsTesting(true);
//     setIsSuccess(null);

//     // Simulate API test (replace with actual API call)
//     try {
//       await new Promise(resolve => setTimeout(resolve, 1500));
      
//       // Random success/failure for demo purposes
//       const success = Math.random() > 0.3;
//       setIsSuccess(success);
      
//       if (success) {
//         toast.success(`${methodType} connection test successful!`, {
//           position: "top-right",
//           autoClose: 3000,
//         });
//       } else {
//         toast.error(`${methodType} connection failed. Check your settings.`, {
//           position: "top-right",
//           autoClose: 5000,
//         });
//       }
//     } catch (error) {
//       setIsSuccess(false);
//       toast.error('Connection test failed', {
//         position: "top-right",
//         autoClose: 5000,
//       });
//     } finally {
//       setIsTesting(false);
//     }
//   };

//   return (
//     <button
//       onClick={testConnection}
//       disabled={isTesting}
//       className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
//         isSuccess === null 
//           ? 'bg-blue-600 hover:bg-blue-700' 
//           : isSuccess 
//             ? 'bg-green-600 hover:bg-green-700' 
//             : 'bg-red-600 hover:bg-red-700'
//       } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
//         fullWidth ? 'w-full' : ''
//       } transition-colors duration-200`}
//     >
//       {isTesting ? (
//         <>
//           <FiLoader className="animate-spin mr-2" />
//           Testing...
//         </>
//       ) : isSuccess === null ? (
//         <>
//           <FiPlug className="mr-2" />
//           Test Connection
//         </>
//       ) : isSuccess ? (
//         <>
//           <FiCheck className="mr-2" />
//           Success
//         </>
//       ) : (
//         <>
//           <FiX className="mr-2" />
//           Failed
//         </>
//       )}
//     </button>
//   );
// };

// export default TestConnectionButton;





// import React, { useState } from 'react';
// import { FiPower, FiLoader, FiCheck, FiX } from 'react-icons/fi';
// import { toast } from 'react-toastify';
// import PropTypes from 'prop-types';

// // TestConnectionButton component to test payment gateway connection
// const TestConnectionButton = ({ config }) => {
//   const [isTesting, setIsTesting] = useState(false);
//   const [testResult, setTestResult] = useState(null);

//   const handleTestConnection = async () => {
//     setIsTesting(true);
//     setTestResult(null);

//     try {
//       // Simulate API call to test connection (replace with actual API call)
//       await new Promise((resolve) => setTimeout(resolve, 1000));
      
//       // Mock success/failure based on config (replace with real logic)
//       if (config && config.apiKey && config.endpoint) {
//         setTestResult('success');
//         toast.success('Connection test successful!');
//       } else {
//         throw new Error('Invalid configuration');
//       }
//     } catch (error) {
//       setTestResult('error');
//       toast.error(`Connection test failed: ${error.message}`);
//     } finally {
//       setIsTesting(false);
//     }
//   };

//   return (
//     <div className="flex items-center space-x-2">
//       <button
//         onClick={handleTestConnection}
//         disabled={isTesting}
//         className={`flex items-center px-4 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
//           isTesting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
//         }`}
//         aria-label="Test payment gateway connection"
//       >
//         {isTesting ? (
//           <FiLoader className="animate-spin mr-2" />
//         ) : testResult === 'success' ? (
//           <FiCheck className="mr-2" />
//         ) : testResult === 'error' ? (
//           <FiX className="mr-2" />
//         ) : (
//           <FiPower className="mr-2" />
//         )}
//         {isTesting ? 'Testing...' : 'Test Connection'}
//       </button>
//       {testResult && (
//         <span
//           className={`text-sm ${
//             testResult === 'success' ? 'text-green-600' : 'text-red-600'
//           }`}
//         >
//           {testResult === 'success' ? 'Connected' : 'Failed'}
//         </span>
//       )}
//     </div>
//   );
// };

// TestConnectionButton.propTypes = {
//   config: PropTypes.shape({
//     apiKey: PropTypes.string,
//     endpoint: PropTypes.string,
//   }),
// };

// TestConnectionButton.defaultProps = {
//   config: null,
// };

// export default TestConnectionButton;






import React, { useState } from 'react';
import { FiPower, FiLoader, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

const TestConnectionButton = ({ methodType, callbackUrl, fullWidth = false }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // Simulate API call to test connection
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Mock success (in real app, this would be an actual API call)
      if (callbackUrl) {
        setTestResult('success');
        toast.success(`${methodType} connection test successful!`);
      } else {
        throw new Error('Callback URL not configured');
      }
    } catch (error) {
      setTestResult('error');
      toast.error(`${methodType} connection failed: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className={`flex ${fullWidth ? 'w-full' : ''}`}>
      <button
        onClick={handleTestConnection}
        disabled={isTesting}
        className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
          isTesting 
            ? 'bg-gray-400 cursor-not-allowed w-full' 
            : testResult === 'success' 
              ? 'bg-green-600 hover:bg-green-700 w-full'
              : testResult === 'error'
                ? 'bg-red-600 hover:bg-red-700 w-full'
                : 'bg-blue-600 hover:bg-blue-700 w-full'
        }`}
      >
        {isTesting ? (
          <>
            <FiLoader className="animate-spin mr-2" />
            Testing...
          </>
        ) : testResult === 'success' ? (
          <>
            <FiCheck className="mr-2" />
            Connection Verified
          </>
        ) : testResult === 'error' ? (
          <>
            <FiAlertCircle className="mr-2" />
            Connection Failed
          </>
        ) : (
          <>
            <FiPower className="mr-2" />
            Test Connection
          </>
        )}
      </button>
    </div>
  );
};

TestConnectionButton.propTypes = {
  methodType: PropTypes.string.isRequired,
  callbackUrl: PropTypes.string,
  fullWidth: PropTypes.bool
};

export default TestConnectionButton;