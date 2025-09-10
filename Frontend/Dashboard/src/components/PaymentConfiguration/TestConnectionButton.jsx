






// import React, { useState } from 'react';
// import { FiLoader, FiCheck, FiAlertCircle } from 'react-icons/fi';
// import { toast } from 'react-toastify';
// import { getMethodLabel } from './Utils/paymentUtils';

// const TestConnectionButton = ({ methodType, callbackUrl, fullWidth = false }) => {
//   const [isTesting, setIsTesting] = useState(false);
//   const [testResult, setTestResult] = useState(null);

//   const handleTest = async () => {
//     setIsTesting(true);
//     try {
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 1500));
      
//       // Randomly determine success for demo purposes
//       const isSuccess = Math.random() > 0.3;
      
//       if (isSuccess) {
//         setTestResult('success');
//         toast.success(`${getMethodLabel(methodType)} connection successful!`);
//       } else {
//         throw new Error('Connection failed');
//       }
//     } catch (error) {
//       setTestResult('error');
//       toast.error(`${getMethodLabel(methodType)} connection failed`);
//     } finally {
//       setIsTesting(false);
//     }
//   };

//   return (
//     <button
//       onClick={handleTest}
//       disabled={isTesting}
//       className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
//         isTesting ? 'bg-gray-400 text-white cursor-not-allowed' :
//         testResult === 'success' ? 'bg-green-600 text-white hover:bg-green-700' :
//         testResult === 'error' ? 'bg-red-600 text-white hover:bg-red-700' :
//         'bg-blue-600 text-white hover:bg-blue-700'
//       } ${fullWidth ? 'w-full justify-center' : ''}`}
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
//       ) : (
//         'Test Connection'
//       )}
//     </button>
//   );
// };

// export default TestConnectionButton;







import React, { useState } from 'react';
import { FiLoader, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../api';
import { getMethodLabel } from './Utils/paymentUtils';

const TestConnectionButton = ({ methodType, gatewayId, callbackUrl, fullWidth = false }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTest = async () => {
    if (!gatewayId) {
      toast.error('Please save the configuration first before testing');
      return;
    }

    setIsTesting(true);
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
      toast.error(`${getMethodLabel(methodType)} connection failed`);
      console.error('Connection test error:', error);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <button
      onClick={handleTest}
      disabled={isTesting || !gatewayId}
      className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
        isTesting ? 'bg-gray-400 text-white cursor-not-allowed' :
        testResult === 'success' ? 'bg-green-600 text-white hover:bg-green-700' :
        testResult === 'error' ? 'bg-red-600 text-white hover:bg-red-700' :
        !gatewayId ? 'bg-gray-400 text-white cursor-not-allowed' :
        'bg-blue-600 text-white hover:bg-blue-700'
      } ${fullWidth ? 'w-full justify-center' : ''}`}
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