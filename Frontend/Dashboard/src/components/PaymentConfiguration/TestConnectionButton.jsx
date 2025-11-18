

// import React, { useState } from 'react';
// import { FiLoader, FiCheck, FiAlertCircle } from 'react-icons/fi';
// import { toast } from 'react-toastify';
// import api from '../../api';
// import { getMethodLabel } from './Utils/paymentUtils';

// const TestConnectionButton = ({ methodType, gatewayId, callbackUrl, fullWidth = false, theme = 'light' }) => {
//   const [isTesting, setIsTesting] = useState(false);
//   const [testResult, setTestResult] = useState(null);

//   const handleTest = async () => {
//     if (!gatewayId) {
//       toast.error('Please save the configuration first before testing');
//       return;
//     }

//     setIsTesting(true);
//     try {
//       const response = await api.post(`/api/payments/gateways/${gatewayId}/test/`);
      
//       if (response.data.success) {
//         setTestResult('success');
//         toast.success(`${getMethodLabel(methodType)} connection successful!`);
//       } else {
//         setTestResult('error');
//         toast.error(`${getMethodLabel(methodType)} connection failed: ${response.data.message}`);
//       }
//     } catch (error) {
//       setTestResult('error');
//       toast.error(`${getMethodLabel(methodType)} connection failed`);
//       console.error('Connection test error:', error);
//     } finally {
//       setIsTesting(false);
//     }
//   };

//   const getButtonClass = () => {
//     if (isTesting) {
//       return theme === 'dark' 
//         ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
//         : 'bg-gray-400 text-white cursor-not-allowed';
//     }
//     if (testResult === 'success') {
//       return theme === 'dark'
//         ? 'bg-green-700 text-white hover:bg-green-600'
//         : 'bg-green-600 text-white hover:bg-green-700';
//     }
//     if (testResult === 'error') {
//       return theme === 'dark'
//         ? 'bg-red-700 text-white hover:bg-red-600'
//         : 'bg-red-600 text-white hover:bg-red-700';
//     }
//     if (!gatewayId) {
//       return theme === 'dark'
//         ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
//         : 'bg-gray-400 text-white cursor-not-allowed';
//     }
//     return theme === 'dark'
//       ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
//       : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500';
//   };

//   return (
//     <button
//       onClick={handleTest}
//       disabled={isTesting || !gatewayId}
//       className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
//         theme === 'dark' ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'
//       } ${getButtonClass()} ${fullWidth ? 'w-full justify-center' : ''}`}
//     >
//       {isTesting ? (
//         <>
//           <FiLoader className="animate-spin mr-2" />
//           Testing...
//         </>
//       ) : testResult === 'success' ? (
//         <>
//           <FiCheck className="mr-2" />
//           Connected
//         </>
//       ) : testResult === 'error' ? (
//         <>
//           <FiAlertCircle className="mr-2" />
//           Failed
//         </>
//       ) : !gatewayId ? (
//         'Save First'
//       ) : (
//         'Test Connection'
//       )}
//     </button>
//   );
// };

// export default TestConnectionButton;





// src/components/PaymentConfiguration/TestConnectionButton.jsx
import React, { useState } from 'react';
import { FiLoader, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../api';
import { getMethodLabel } from './Utils/paymentUtils';

const TestConnectionButton = ({ methodType, gatewayId, callbackUrl, fullWidth = false, theme = 'light' }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTest = async () => {
    if (!gatewayId) {
      toast.error('Please save the configuration first before testing');
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    
    try {
      const response = await api.post(`/api/payments/gateways/${gatewayId}/test/`);
      
      if (response.data.success) {
        setTestResult('success');
        toast.success(`${getMethodLabel(methodType)} connection successful!`);
      } else {
        setTestResult('error');
        toast.error(`${getMethodLabel(methodType)} connection failed: ${response.data.message}`);
      }
    } catch (error) {
      setTestResult('error');
      const errorMessage = error.response?.data?.error || error.message || 'Connection test failed';
      toast.error(`${getMethodLabel(methodType)} connection failed: ${errorMessage}`);
      console.error('Connection test error:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const getButtonClass = () => {
    const baseClasses = `inline-flex items-center px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
      theme === 'dark' ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'
    } ${fullWidth ? 'w-full justify-center' : ''}`;

    if (isTesting) {
      return `${baseClasses} ${
        theme === 'dark' 
          ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
          : 'bg-gray-400 text-white cursor-not-allowed'
      }`;
    }
    
    if (testResult === 'success') {
      return `${baseClasses} ${
        theme === 'dark'
          ? 'bg-green-700 text-white hover:bg-green-600'
          : 'bg-green-600 text-white hover:bg-green-700'
      }`;
    }
    
    if (testResult === 'error') {
      return `${baseClasses} ${
        theme === 'dark'
          ? 'bg-red-700 text-white hover:bg-red-600'
          : 'bg-red-600 text-white hover:bg-red-700'
      }`;
    }
    
    if (!gatewayId) {
      return `${baseClasses} ${
        theme === 'dark'
          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
          : 'bg-gray-400 text-white cursor-not-allowed'
      }`;
    }
    
    return `${baseClasses} ${
      theme === 'dark'
        ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
        : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
    }`;
  };

  return (
    <button
      onClick={handleTest}
      disabled={isTesting || !gatewayId}
      className={getButtonClass()}
    >
      {isTesting ? (
        <>
          <FiLoader className="animate-spin mr-2" />
          Testing...
        </>
      ) : testResult === 'success' ? (
        <>
          <FiCheck className="mr-2" />
          Connected
        </>
      ) : testResult === 'error' ? (
        <>
          <FiAlertCircle className="mr-2" />
          Failed
        </>
      ) : !gatewayId ? (
        'Save First'
      ) : (
        'Test Connection'
      )}
    </button>
  );
};

export default TestConnectionButton;