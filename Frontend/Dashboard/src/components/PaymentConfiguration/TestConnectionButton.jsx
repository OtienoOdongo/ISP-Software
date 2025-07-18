



import React, { useState, useEffect } from 'react';
import { FiLoader, FiCheck, FiPlus, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import api from '../../api'
import { getMethodLabel } from './Utils/paymentUtils'

/**
 * Button to test payment method connection.
 */
const TestConnectionButton = ({ methodType, configId, fullWidth = false }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (testResult) {
      const timer = setTimeout(() => setTestResult(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [testResult]);

  const handleTestConnection = async () => {
    if (!configId) {
      toast.error('Configuration ID is required');
      return;
    }

    setIsTesting(true);
    try {
      const response = await api.post(`/api/payments/config/${configId}/test/`);
      if (response.data.success) {
        setTestResult('success');
        toast.success(`${getMethodLabel(methodType)} connection test successful!`);
      } else {
        throw new Error(response.data.message || 'Test failed');
      }
    } catch (error) {
      setTestResult('error');
      toast.error(`${getMethodLabel(methodType)} connection test failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      <button
        onClick={handleTestConnection}
        disabled={isTesting}
        className={`inline-flex items-center px-4 py-2 rounded-md text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          isTesting
            ? 'bg-gray-400 cursor-not-allowed'
            : testResult === 'success'
            ? 'bg-green-600 hover:bg-green-700'
            : testResult === 'error'
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-blue-600 hover:bg-blue-800'
        } ${fullWidth ? 'w-full' : ''}`}
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
            <FiPlus className="mr-2" />
            Test Connection
          </>
        )}
      </button>
    </div>
  );
};

TestConnectionButton.propTypes = {
  methodType: PropTypes.string.isRequired,
  configId: PropTypes.string.isRequired,
  fullWidth: PropTypes.bool,
};

export default TestConnectionButton;