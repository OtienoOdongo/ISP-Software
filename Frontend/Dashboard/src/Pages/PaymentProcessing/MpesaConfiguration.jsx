import React, { useState, useEffect } from 'react';
import { 
  FiSave, FiRefreshCw, FiCheckCircle, FiPlus, FiTrash2, 
  FiSmartphone, FiDollarSign, FiHome, FiEye, FiEyeOff, FiCode,
  FiInfo, FiShield, FiSettings, FiClipboard, FiEdit2, FiCopy,
  FiChevronRight, FiAlertCircle, FiZap, FiArrowLeft, FiCreditCard
} from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Puff } from 'react-loading-icons';
import PaymentMethodCard from '../../components/PaymentConfiguration/PaymentMethodCard';
import TestConnectionButton from '../../components/PaymentConfiguration/TestConnectionButton';
import SecurityBadge from '../../components/PaymentConfiguration/SecurityBadge';
import ConfigurationHistory from '../../components/PaymentConfiguration/ConfigurationHistory';

const PaymentConfiguration = () => {
  // Enhanced payment method types with additional metadata
  const PAYMENT_METHODS = {
    MPESA_PAYBILL: {
      value: 'mpesa_paybill',
      label: 'M-Pesa Paybill',
      icon: <FiSmartphone className="text-purple-500" />,
      color: 'bg-purple-100 text-purple-800',
      gradient: 'from-purple-500 to-purple-600',
      description: 'Accept payments via M-Pesa Paybill number',
      supportedCurrencies: ['KES'],
      feeStructure: '1.5% + KES 10 per transaction',
      documentationLink: 'https://developer.safaricom.co.ke/docs'
    },
    MPESA_TILL: {
      value: 'mpesa_till',
      label: 'M-Pesa Till',
      icon: <FiSmartphone className="text-green-500" />,
      color: 'bg-green-100 text-green-800',
      gradient: 'from-green-500 to-green-600',
      description: 'Accept payments via M-Pesa Till number and store number',
      supportedCurrencies: ['KES'],
      feeStructure: '1.2% + KES 5 per transaction',
      documentationLink: 'https://developer.safaricom.co.ke/docs'
    },
    PAYPAL: {
      value: 'paypal',
      label: 'PayPal',
      icon: <FiDollarSign className="text-blue-500" />,
      color: 'bg-blue-100 text-blue-800',
      gradient: 'from-blue-500 to-blue-600',
      description: 'Accept international payments via PayPal',
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'AUD', 'CAD'],
      feeStructure: '2.9% + $0.30 per transaction',
      documentationLink: 'https://developer.paypal.com/docs'
    },
    BANK: {
      value: 'bank',
      label: 'Bank Transfer',
      icon: <FiHome className="text-indigo-500" />,
      color: 'bg-indigo-100 text-indigo-800',
      gradient: 'from-indigo-500 to-indigo-600',
      description: 'Accept direct bank transfers',
      supportedCurrencies: ['KES', 'USD', 'EUR', 'GBP'],
      feeStructure: 'Flat fee of KES 50 per transaction',
      documentationLink: 'https://bankingapi.com/docs'
    }
  };

  const KENYAN_BANKS = [
    { name: 'Equity Bank', code: '68' },
    { name: 'KCB Bank', code: '01' },
    { name: 'Cooperative Bank', code: '11' },
    { name: 'Standard Chartered', code: '02' },
    { name: 'Absa Bank', code: '03' },
    { name: 'NCBA Bank', code: '07' },
    { name: 'DTB Bank', code: '63' },
    { name: 'I&M Bank', code: '57' },
    { name: 'Stanbic Bank', code: '31' },
    { name: 'Citi Bank', code: '04' },
    { name: 'Bank of Africa', code: '55' },
    { name: 'Sidian Bank', code: '66' },
    { name: 'Prime Bank', code: '40' },
    { name: 'Family Bank', code: '70' },
    { name: 'GT Bank', code: '53' }
  ];

  const initialConfig = {
    paymentMethods: [{
      type: PAYMENT_METHODS.MPESA_PAYBILL.value,
      apiKey: '',
      secretKey: '',
      shortCode: '',
      passKey: '',
      callbackURL: '',
      isActive: true,
      sandboxMode: false,
      webhookSecret: '',
      transactionLimit: '',
      autoSettle: true
    }],
    configurationVersion: '1.0.0',
    lastUpdated: new Date().toISOString()
  };

  const [config, setConfig] = useState(initialConfig);
  const [savedConfig, setSavedConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [changesSaved, setChangesSaved] = useState(false);
  const [showEditForm, setShowEditForm] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [showSecrets, setShowSecrets] = useState({});
  const [showAdvanced, setShowAdvanced] = useState({});
  const [history, setHistory] = useState([]);
  const [methodToAdd, setMethodToAdd] = useState(null);
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);

  const mockSavedConfig = {
    paymentMethods: [
      {
        type: PAYMENT_METHODS.MPESA_PAYBILL.value,
        apiKey: 'sk_live_1234567890abcdef',
        secretKey: 'sec_9876543210fedcba',
        shortCode: '123456',
        passKey: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
        callbackURL: 'https://api.yourdomain.com/v1/payments/mpesa/callback',
        isActive: true,
        sandboxMode: false,
        webhookSecret: 'whsec_1234567890abcdef',
        transactionLimit: '500000',
        autoSettle: true
      },
      {
        type: PAYMENT_METHODS.MPESA_TILL.value,
        tillNumber: '1234567',
        storeNumber: '0012345',
        passKey: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
        callbackURL: 'https://api.yourdomain.com/v1/payments/mpesa/callback',
        isActive: true,
        sandboxMode: false,
        webhookSecret: 'whsec_1234567890abcdef',
        transactionLimit: '200000',
        autoSettle: true
      },
      {
        type: PAYMENT_METHODS.BANK.value,
        bankName: 'Equity Bank',
        accountNumber: '1234567890',
        accountName: 'My Business',
        branchCode: '123',
        swiftCode: 'EQBLKENA',
        callbackURL: 'https://api.yourdomain.com/v1/payments/bank/callback',
        isActive: true,
        transactionLimit: '1000000',
        autoSettle: false
      },
      {
        type: PAYMENT_METHODS.PAYPAL.value,
        clientId: 'AeA9Q3hL9L1dL8QJ6QJ5QJ4QJ3QJ2QJ1QJ0QJ9QJ8QJ7QJ6QJ5QJ4QJ3QJ2QJ1QJ0',
        secret: 'EC-9QJ8QJ7QJ6QJ5QJ4QJ3QJ2QJ1QJ0QJ9QJ8QJ7QJ6QJ5QJ4QJ3QJ2QJ1QJ0',
        merchantId: 'XYZ1234567890',
        callbackURL: 'https://api.yourdomain.com/v1/payments/paypal/callback',
        isActive: true,
        sandboxMode: true,
        webhookSecret: 'whsec_paypal_1234567890abcdef',
        transactionLimit: '10000',
        autoSettle: false
      }
    ],
    configurationVersion: '1.2.0',
    lastUpdated: new Date().toISOString()
  };

  const mockHistory = [
    {
      id: 1,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      user: 'admin@example.com',
      action: 'Updated M-Pesa credentials',
      changes: ['apiKey', 'secretKey']
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      user: 'dev@example.com',
      action: 'Added PayPal integration',
      changes: ['Added new payment method: PayPal']
    }
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      try {
        setSavedConfig(mockSavedConfig);
        setConfig({ ...mockSavedConfig });
        setHistory(mockHistory);
        setChangesSaved(true);
        setShowEditForm(false);
      } catch (error) {
        setError('Failed to fetch configuration');
        showToast('Failed to load payment configuration', 'error');
      } finally {
        setLoading(false);
      }
    }, 1500);
  }, []);

  const showToast = (message, type = 'success') => {
    toast[type](message, {
      position: "top-right",
      autoClose: type === 'error' ? 5000 : 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
  };

  const handleChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prevConfig => {
      const updatedMethods = [...prevConfig.paymentMethods];
      updatedMethods[index] = {
        ...updatedMethods[index],
        [name]: type === 'checkbox' ? checked : value
      };
      return {
        ...prevConfig,
        paymentMethods: updatedMethods,
        lastUpdated: new Date().toISOString()
      };
    });
    setChangesSaved(false);
  };

  const toggleSecretVisibility = (index) => {
    setShowSecrets(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleAdvancedSettings = (index) => {
    setShowAdvanced(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleMethodTypeChange = (index, value) => {
    setConfig(prevConfig => {
      const updatedMethods = [...prevConfig.paymentMethods];
      
      // Reset to default values when changing type
      updatedMethods[index] = {
        type: value,
        isActive: updatedMethods[index].isActive,
        sandboxMode: false,
        autoSettle: true
      };
      
      // Set default fields based on type
      switch(value) {
        case PAYMENT_METHODS.MPESA_PAYBILL.value:
          updatedMethods[index] = {
            ...updatedMethods[index],
            apiKey: '',
            secretKey: '',
            shortCode: '',
            passKey: '',
            callbackURL: '',
            webhookSecret: '',
            transactionLimit: '500000'
          };
          break;
        case PAYMENT_METHODS.MPESA_TILL.value:
          updatedMethods[index] = {
            ...updatedMethods[index],
            tillNumber: '',
            storeNumber: '',
            passKey: '',
            callbackURL: '',
            webhookSecret: '',
            transactionLimit: '200000'
          };
          break;
        case PAYMENT_METHODS.PAYPAL.value:
          updatedMethods[index] = {
            ...updatedMethods[index],
            clientId: '',
            secret: '',
            merchantId: '',
            callbackURL: '',
            webhookSecret: '',
            transactionLimit: '10000'
          };
          break;
        case PAYMENT_METHODS.BANK.value:
          updatedMethods[index] = {
            ...updatedMethods[index],
            bankName: '',
            accountNumber: '',
            accountName: '',
            branchCode: '',
            swiftCode: '',
            callbackURL: '',
            transactionLimit: '1000000'
          };
          break;
        default:
          break;
      }
      
      return {
        ...prevConfig,
        paymentMethods: updatedMethods,
        lastUpdated: new Date().toISOString()
      };
    });
    setChangesSaved(false);
  };

  const generateCallbackUrl = (index) => {
    const method = config.paymentMethods[index];
    let baseUrl = window.location.origin;
    let callbackPath = '';
    let webhookId = `wh_${Math.random().toString(36).substring(2, 15)}`;
    
    switch(method.type) {
      case PAYMENT_METHODS.MPESA_PAYBILL.value:
      case PAYMENT_METHODS.MPESA_TILL.value:
        callbackPath = `/api/v1/payments/mpesa/callback/${webhookId}`;
        break;
      case PAYMENT_METHODS.PAYPAL.value:
        callbackPath = `/api/v1/payments/paypal/callback/${webhookId}`;
        break;
      case PAYMENT_METHODS.BANK.value:
        callbackPath = `/api/v1/payments/bank/callback/${webhookId}`;
        break;
      default:
        callbackPath = `/api/v1/payments/callback/${webhookId}`;
    }
    
    const callbackUrl = `${baseUrl}${callbackPath}`;
    const webhookSecret = `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    
    setConfig(prevConfig => {
      const updatedMethods = [...prevConfig.paymentMethods];
      updatedMethods[index] = {
        ...updatedMethods[index],
        callbackURL: callbackUrl,
        webhookSecret: webhookSecret
      };
      return {
        ...prevConfig,
        paymentMethods: updatedMethods,
        lastUpdated: new Date().toISOString()
      };
    });
    
    showToast('Callback URL and webhook secret generated successfully!');
    setChangesSaved(false);
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'info');
  };

  const openAddMethodModal = () => {
    const availableMethods = Object.values(PAYMENT_METHODS).filter(method => 
      !config.paymentMethods.some(pm => pm.type === method.value)
    );
    
    if (availableMethods.length === 0) {
      showToast('All payment methods are already added', 'info');
      return;
    }
    
    setShowAddMethodModal(true);
  };

  const confirmAddPaymentMethod = () => {
    if (!methodToAdd) return;
    
    setConfig(prevConfig => ({
      ...prevConfig,
      paymentMethods: [
        ...prevConfig.paymentMethods,
        {
          type: methodToAdd,
          isActive: true,
          sandboxMode: false,
          autoSettle: true
        }
      ],
      lastUpdated: new Date().toISOString()
    }));
    
    setActiveTab(config.paymentMethods.length);
    setChangesSaved(false);
    setShowAddMethodModal(false);
    setMethodToAdd(null);
    showToast(`${getMethodLabel(methodToAdd)} added successfully`);
  };

  const removePaymentMethod = (index) => {
    if (config.paymentMethods.length <= 1) {
      showToast('You must have at least one payment method', 'error');
      return;
    }
    
    const methodName = getMethodLabel(config.paymentMethods[index].type);
    
    setConfig(prevConfig => {
      const updatedMethods = [...prevConfig.paymentMethods];
      updatedMethods.splice(index, 1);
      return {
        ...prevConfig,
        paymentMethods: updatedMethods,
        lastUpdated: new Date().toISOString()
      };
    });
    
    if (activeTab >= index) {
      setActiveTab(Math.max(0, activeTab - 1));
    }
    
    showToast(`Removed ${methodName} payment method`, 'warning');
    setChangesSaved(false);
  };

  const validateConfigurations = () => {
    const errors = [];
    config.paymentMethods.forEach((method, index) => {
      if (method.isActive) {
        switch(method.type) {
          case PAYMENT_METHODS.MPESA_PAYBILL.value:
            if (!method.shortCode || !method.passKey) {
              errors.push(`M-Pesa Paybill method (${index + 1}) is missing required fields`);
            }
            break;
          case PAYMENT_METHODS.MPESA_TILL.value:
            if (!method.tillNumber || !method.storeNumber || !method.passKey) {
              errors.push(`M-Pesa Till method (${index + 1}) is missing required fields`);
            }
            break;
          case PAYMENT_METHODS.PAYPAL.value:
            if (!method.clientId || !method.secret || !method.merchantId) {
              errors.push(`PayPal method (${index + 1}) is missing required fields`);
            }
            break;
          case PAYMENT_METHODS.BANK.value:
            if (!method.bankName || !method.accountNumber || !method.accountName) {
              errors.push(`Bank Transfer method (${index + 1}) is missing required fields`);
            }
            break;
        }
      }
    });
    
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    const errors = validateConfigurations();
    if (errors.length > 0) {
      setLoading(false);
      errors.forEach(error => showToast(error, 'error'));
      return;
    }
    
    setTimeout(() => {
      try {
        const newHistoryEntry = {
          id: history.length + 1,
          timestamp: new Date().toISOString(),
          user: 'admin@example.com',
          action: 'Updated payment configuration',
          changes: ['Modified payment methods']
        };
        
        setSavedConfig(config);
        setHistory([newHistoryEntry, ...history]);
        showToast('Configuration saved successfully!');
        setChangesSaved(true);
        setShowEditForm(false);
      } catch (error) {
        showToast('Failed to save configuration', 'error');
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  const handleReset = () => {
    setConfig(savedConfig ? {...savedConfig} : {...mockSavedConfig});
    setChangesSaved(true);
    showToast('Configuration reset to last saved state.', 'info');
  };

  const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleBackToDefault = () => {
    setShowEditForm(false);
  };

  const getMethodIcon = (type) => {
    const method = Object.values(PAYMENT_METHODS).find(m => m.value === type);
    return method ? method.icon : <FiSmartphone className="text-gray-500" />;
  };

  const getMethodLabel = (type) => {
    const method = Object.values(PAYMENT_METHODS).find(m => m.value === type);
    return method ? method.label : 'Payment Method';
  };

  const getMethodColor = (type) => {
    const method = Object.values(PAYMENT_METHODS).find(m => m.value === type);
    return method ? method.color : 'bg-gray-100 text-gray-800';
  };

  const getMethodGradient = (type) => {
    const method = Object.values(PAYMENT_METHODS).find(m => m.value === type);
    return method ? method.gradient : 'from-gray-500 to-gray-600';
  };

  const renderMethodFields = (method, index) => {
    const methodInfo = Object.values(PAYMENT_METHODS).find(m => m.value === method.type);
    
    return (
      <div className="space-y-6">
        {/* Method Information Card */}
        <div className={`p-5 rounded-xl bg-gradient-to-r ${getMethodGradient(method.type)} text-white shadow-md`}>
          <div className="flex items-start">
            <div className="flex-shrink-0 p-2 bg-white bg-opacity-20 rounded-lg">
              {methodInfo.icon}
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-semibold">{methodInfo.label}</h3>
              <p className="mt-1 text-blue-100">{methodInfo.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
                  Currencies: {methodInfo.supportedCurrencies.join(', ')}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
                  Fees: {methodInfo.feeStructure}
                </span>
                <a 
                  href={methodInfo.documentationLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white hover:bg-opacity-30"
                >
                  View Documentation
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Method Specific Fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* Credentials Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FiShield className="mr-2 text-blue-500" />
                Credentials
              </h3>
              
              {method.type === PAYMENT_METHODS.MPESA_PAYBILL.value && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor={`apiKey-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      API Key
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id={`apiKey-${index}`}
                        type={showSecrets[index] ? "text" : "password"}
                        name="apiKey"
                        value={method.apiKey || ''}
                        onChange={(e) => handleChange(index, e)}
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="sk_live_xxxxxxxxxxxxxx"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecretVisibility(index)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      >
                        {showSecrets[index] ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor={`secretKey-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Secret Key
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id={`secretKey-${index}`}
                        type={showSecrets[index] ? "text" : "password"}
                        name="secretKey"
                        value={method.secretKey || ''}
                        onChange={(e) => handleChange(index, e)}
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="sec_xxxxxxxxxxxxxx"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecretVisibility(index)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      >
                        {showSecrets[index] ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor={`shortCode-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Paybill Number
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`shortCode-${index}`}
                      type="text"
                      name="shortCode"
                      value={method.shortCode || ''}
                      onChange={(e) => handleChange(index, e)}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="123456"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor={`passKey-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Pass Key
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id={`passKey-${index}`}
                        type={showSecrets[index] ? "text" : "password"}
                        name="passKey"
                        value={method.passKey || ''}
                        onChange={(e) => handleChange(index, e)}
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="bfb279f9aa9bdbcf158e..."
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecretVisibility(index)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      >
                        {showSecrets[index] ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {method.type === PAYMENT_METHODS.MPESA_TILL.value && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor={`tillNumber-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Till Number
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`tillNumber-${index}`}
                      type="text"
                      name="tillNumber"
                      value={method.tillNumber || ''}
                      onChange={(e) => handleChange(index, e)}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1234567"
                    />
                  </div>

                  <div>
                    <label htmlFor={`storeNumber-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Store Number
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`storeNumber-${index}`}
                      type="text"
                      name="storeNumber"
                      value={method.storeNumber || ''}
                      onChange={(e) => handleChange(index, e)}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0012345"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor={`passKey-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Pass Key
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id={`passKey-${index}`}
                        type={showSecrets[index] ? "text" : "password"}
                        name="passKey"
                        value={method.passKey || ''}
                        onChange={(e) => handleChange(index, e)}
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="bfb279f9aa9bdbcf158e..."
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecretVisibility(index)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      >
                        {showSecrets[index] ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {method.type === PAYMENT_METHODS.PAYPAL.value && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor={`clientId-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Client ID
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`clientId-${index}`}
                      type="text"
                      name="clientId"
                      value={method.clientId || ''}
                      onChange={(e) => handleChange(index, e)}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="AeA9Q3hL9L1dL8QJ6QJ5QJ4..."
                    />
                  </div>
                  
                  <div>
                    <label htmlFor={`secret-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Secret
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id={`secret-${index}`}
                        type={showSecrets[index] ? "text" : "password"}
                        name="secret"
                        value={method.secret || ''}
                        onChange={(e) => handleChange(index, e)}
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="EC-9QJ8QJ7QJ6QJ5QJ4..."
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecretVisibility(index)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      >
                        {showSecrets[index] ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor={`merchantId-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Merchant ID
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`merchantId-${index}`}
                      type="text"
                      name="merchantId"
                      value={method.merchantId || ''}
                      onChange={(e) => handleChange(index, e)}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="XYZ1234567890"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id={`sandboxMode-${index}`}
                      name="sandboxMode"
                      type="checkbox"
                      checked={method.sandboxMode || false}
                      onChange={(e) => handleChange(index, e)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`sandboxMode-${index}`} className="ml-2 block text-sm text-gray-900">
                      Sandbox Mode
                    </label>
                  </div>
                </div>
              )}
              
              {method.type === PAYMENT_METHODS.BANK.value && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor={`bankName-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Name
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      id={`bankName-${index}`}
                      name="bankName"
                      value={method.bankName || ''}
                      onChange={(e) => handleChange(index, e)}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Bank</option>
                      {KENYAN_BANKS.map((bank, i) => (
                        <option key={i} value={bank.name}>{bank.name} ({bank.code})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor={`accountNumber-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`accountNumber-${index}`}
                      type="text"
                      name="accountNumber"
                      value={method.accountNumber || ''}
                      onChange={(e) => handleChange(index, e)}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1234567890"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor={`accountName-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Account Name
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`accountName-${index}`}
                      type="text"
                      name="accountName"
                      value={method.accountName || ''}
                      onChange={(e) => handleChange(index, e)}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your Business Name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor={`branchCode-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Branch Code
                    </label>
                    <input
                      id={`branchCode-${index}`}
                      type="text"
                      name="branchCode"
                      value={method.branchCode || ''}
                      onChange={(e) => handleChange(index, e)}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="123"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor={`swiftCode-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      SWIFT Code
                    </label>
                    <input
                      id={`swiftCode-${index}`}
                      type="text"
                      name="swiftCode"
                      value={method.swiftCode || ''}
                      onChange={(e) => handleChange(index, e)}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="BARCKENX"
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Advanced Settings */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <button
                type="button"
                onClick={() => toggleAdvancedSettings(index)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <FiSettings className="mr-2 text-purple-500" />
                  Advanced Settings
                </h3>
                <svg
                  className={`h-5 w-5 text-gray-500 transform transition-transform ${showAdvanced[index] ? 'rotate-180' : ''}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {showAdvanced[index] && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor={`transactionLimit-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Transaction Limit (KES)
                    </label>
                    <input
                      id={`transactionLimit-${index}`}
                      type="number"
                      name="transactionLimit"
                      value={method.transactionLimit || ''}
                      onChange={(e) => handleChange(index, e)}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="500000"
                    />
                    <p className="mt-1 text-xs text-gray-500">Maximum amount per transaction. Leave empty for no limit.</p>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id={`autoSettle-${index}`}
                      name="autoSettle"
                      type="checkbox"
                      checked={method.autoSettle || false}
                      onChange={(e) => handleChange(index, e)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`autoSettle-${index}`} className="ml-2 block text-sm text-gray-900">
                      Auto-settle payments
                    </label>
                  </div>
                  
                  <div>
                    <label htmlFor={`webhookSecret-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Webhook Secret
                    </label>
                    <div className="relative">
                      <input
                        id={`webhookSecret-${index}`}
                        type={showSecrets[index] ? "text" : "password"}
                        name="webhookSecret"
                        value={method.webhookSecret || ''}
                        onChange={(e) => handleChange(index, e)}
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="whsec_xxxxxxxxxxxxxx"
                        readOnly
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(method.webhookSecret)}
                        className="absolute inset-y-0 right-10 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                        title="Copy to clipboard"
                      >
                        <FiCopy />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleSecretVisibility(index)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      >
                        {showSecrets[index] ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Used to verify webhook requests from the payment provider.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Webhook Configuration */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FiCode className="mr-2 text-green-500" />
                Webhook Configuration
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor={`callbackURL-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Callback URL
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id={`callbackURL-${index}`}
                      type="url"
                      name="callbackURL"
                      value={method.callbackURL || ''}
                      onChange={(e) => handleChange(index, e)}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/callback"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(method.callbackURL)}
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
                  
                  <TestConnectionButton 
                    methodType={method.type} 
                    callbackUrl={method.callbackURL}
                  />
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
            
            {/* Security Recommendations */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FiShield className="mr-2 text-red-500" />
                Security Recommendations
              </h3>
              
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start">
                  <SecurityBadge level="high" />
                  <span className="ml-2">Rotate API keys and secrets every 90 days</span>
                </li>
                <li className="flex items-start">
                  <SecurityBadge level="medium" />
                  <span className="ml-2">Restrict IP addresses that can access your payment endpoints</span>
                </li>
                <li className="flex items-start">
                  <SecurityBadge level="critical" />
                  <span className="ml-2">Never share or commit secrets to version control</span>
                </li>
                <li className="flex items-start">
                  <SecurityBadge level="high" />
                  <span className="ml-2">Implement webhook signature verification</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FiCreditCard className="mr-3 text-indigo-600" />
                Payment Gateway
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Configure and manage all payment integrations in one place
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 flex items-center">
                <div className="p-2 rounded-full bg-indigo-100 text-indigo-600 mr-3">
                  <FiZap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Methods</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {savedConfig ? savedConfig.paymentMethods.length : '0'}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 flex items-center">
                <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                  <FiShield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Security Status</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {savedConfig ? 'Verified' : 'Pending'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Payment Integrations Dashboard</h2>
                <p className="mt-2 text-blue-100 max-w-2xl">
                  Securely connect with multiple payment providers and streamline your checkout experience.
                </p>
              </div>
              {!showEditForm ? (
                <button
                  onClick={handleEdit}
                  className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                >
                  <FiEdit2 className="mr-2 text-indigo-600" />
                  <span className="font-semibold">Edit Payment Methods</span>
                </button>
              ) : (
                <button
                  onClick={handleBackToDefault}
                  className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
                >
                  <FiArrowLeft className="mr-2" />
                  Back to Overview
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-flex flex-col items-center justify-center space-y-4">
                <Puff stroke="#3B82F6" speed={1} />
                <div>
                  <h3 className="text-lg font-medium text-gray-700">Loading Payment Configuration</h3>
                  <p className="mt-1 text-sm text-gray-500">Securely fetching your payment settings...</p>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : showEditForm ? (
            <form onSubmit={handleSubmit}>
              {/* Tabs */}
              <div className="mb-8">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8 overflow-x-auto">
                    {config.paymentMethods.map((method, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setActiveTab(index)}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === index ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                      >
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${getMethodColor(method.type)}`}>
                          {getMethodIcon(method.type)}
                        </span>
                        {getMethodLabel(method.type)}
                        {method.isActive ? (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={openAddMethodModal}
                      className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center border-transparent text-blue-500 hover:text-blue-700"
                    >
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-600 mr-2">
                        <FiPlus className="h-3 w-3" />
                      </span>
                      Add Method
                    </button>
                  </nav>
                </div>
              </div>

              {/* Tab Content */}
              {config.paymentMethods.map((method, index) => (
                <div key={index} className={activeTab === index ? 'block' : 'hidden'}>
                  <div className="bg-gray-50 rounded-xl p-6 mb-8 shadow-inner">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <label htmlFor={`methodType-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Payment Method Type
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          id={`methodType-${index}`}
                          value={method.type}
                          onChange={(e) => handleMethodTypeChange(index, e.target.value)}
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                          {Object.values(PAYMENT_METHODS).map((methodOption, i) => (
                            <option key={i} value={methodOption.value}>{methodOption.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <label htmlFor={`isActive-${index}`} className="flex items-center cursor-pointer">
                            <div className="relative">
                              <input
                                id={`isActive-${index}`}
                                name="isActive"
                                type="checkbox"
                                checked={method.isActive || false}
                                onChange={(e) => handleChange(index, e)}
                                className="sr-only"
                              />
                              <div className={`block w-10 h-6 rounded-full ${method.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${method.isActive ? 'transform translate-x-4' : ''}`}></div>
                            </div>
                            <div className="ml-3 text-sm font-medium text-gray-700">
                              Enable Method
                            </div>
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePaymentMethod(index)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                        >
                          <FiTrash2 className="mr-1" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Method Specific Fields */}
                  <div className="space-y-8">
                    {renderMethodFields(method, index)}
                  </div>

                  {/* Method-specific save and cancel buttons */}
                  <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4 mx-8 my-4">
                    <button
                      type="button"
                      onClick={handleBackToDefault}
                      className="px-6 py-3 mb-5 border border-gray-300 rounded-md text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3  border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                    >
                      <FiSave className="inline mr-2" />
                      Save {getMethodLabel(method.type)} Settings
                    </button>
                  </div>
                </div>
              ))}
            </form>
          ) : (
            <div className="space-y-8 p-8">
              {/* Success Alert */}
              <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FiCheckCircle className="h-6 w-6 text-green-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        Payment configuration is active and up to date!
                      </p>
                      <p className="mt-1 text-sm text-green-700">
                        Last updated: {new Date(savedConfig.lastUpdated).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedConfig.paymentMethods.map((method, index) => (
                  <PaymentMethodCard 
                    key={index}
                    method={method}
                    methodInfo={PAYMENT_METHODS[Object.keys(PAYMENT_METHODS).find(key => PAYMENT_METHODS[key].value === method.type)]}
                    isActive={index === activeTab}
                    onClick={() => setActiveTab(index)}
                  />
                ))}
              </div>

              {/* Selected Method Details */}
              <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
                <div className="p-6">
                  {savedConfig.paymentMethods.map((method, index) => (
                    <div key={index} className={activeTab === index ? 'block' : 'hidden'}>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                              {getMethodIcon(method.type)}
                              <span className="ml-2">{getMethodLabel(method.type)} Details</span>
                            </h3>
                            
                            <dl className="space-y-4">
                              {method.type === PAYMENT_METHODS.MPESA_PAYBILL.value && (
                                <>
                                  <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                                    <dt className="text-sm font-medium text-gray-700">Paybill Number</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                      {method.shortCode || 'Not configured'}
                                    </dd>
                                  </div>
                                  <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                                    <dt className="text-sm font-medium text-gray-700">API Key</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                      {method.apiKey ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-800">
                                          {`${method.apiKey.substring(0, 8)}...${method.apiKey.substring(method.apiKey.length - 4)}`}
                                          <button 
                                            onClick={() => copyToClipboard(method.apiKey)}
                                            className="ml-2 text-gray-500 hover:text-gray-700"
                                            title="Copy to clipboard"
                                          >
                                            <FiCopy size={14} />
                                          </button>
                                        </span>
                                      ) : 'Not configured'}
                                    </dd>
                                  </div>
                                </>
                              )}
                              
                              {method.type === PAYMENT_METHODS.MPESA_TILL.value && (
                                <>
                                  <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                                    <dt className="text-sm font-medium text-gray-700">Till Number</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                      {method.tillNumber || 'Not configured'}
                                    </dd>
                                  </div>
                                  <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                                    <dt className="text-sm font-medium text-gray-700">Store Number</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                      {method.storeNumber || 'Not configured'}
                                    </dd>
                                  </div>
                                </>
                              )}
                              
                              {method.type === PAYMENT_METHODS.PAYPAL.value && (
                                <>
                                  <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                                    <dt className="text-sm font-medium text-gray-700">Client ID</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                      {method.clientId ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-800">
                                          {`${method.clientId.substring(0, 8)}...${method.clientId.substring(method.clientId.length - 4)}`}
                                          <button 
                                            onClick={() => copyToClipboard(method.clientId)}
                                            className="ml-2 text-gray-500 hover:text-gray-700"
                                            title="Copy to clipboard"
                                          >
                                            <FiCopy size={14} />
                                          </button>
                                        </span>
                                      ) : 'Not configured'}
                                    </dd>
                                  </div>
                                  <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                                    <dt className="text-sm font-medium text-gray-700">Merchant ID</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                      {method.merchantId || 'Not configured'}
                                    </dd>
                                  </div>
                                </>
                              )}
                              
                              {method.type === PAYMENT_METHODS.BANK.value && (
                                <>
                                  <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                                    <dt className="text-sm font-medium text-gray-700">Bank Name</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                      {method.bankName || 'Not configured'}
                                    </dd>
                                  </div>
                                  <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                                    <dt className="text-sm font-medium text-gray-700">Account Number</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                      {method.accountNumber || 'Not configured'}
                                    </dd>
                                  </div>
                                  <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                                    <dt className="text-sm font-medium text-gray-700">Account Name</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                      {method.accountName || 'Not configured'}
                                    </dd>
                                  </div>
                                </>
                              )}
                              
                              <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-sm font-medium text-gray-700">Transaction Limit</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                  {method.transactionLimit ? `KES ${parseInt(method.transactionLimit).toLocaleString()}` : 'No limit'}
                                </dd>
                              </div>
                              
                              <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-sm font-medium text-gray-700">Mode</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                  {method.sandboxMode ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                                      Sandbox (Testing)
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800">
                                      Live (Production)
                                    </span>
                                  )}
                                </dd>
                              </div>
                            </dl>
                          </div>
                          
                          <TestConnectionButton 
                            methodType={method.type} 
                            callbackUrl={method.callbackURL}
                            fullWidth
                          />
                        </div>
                        
                        <div className="space-y-6">
                          <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                              <FiCode className="mr-2" />
                              Integration Details
                            </h3>
                            
                            <div className="space-y-4">
                              <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-sm font-medium text-gray-700">Callback URL</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 break-all">
                                  {method.callbackURL ? (
                                    <div className="bg-gray-100 p-3 rounded-md">
                                      <div className="flex items-center justify-between">
                                        <span className="truncate">{method.callbackURL}</span>
                                        <button 
                                          onClick={() => copyToClipboard(method.callbackURL)}
                                          className="ml-2 text-gray-500 hover:text-gray-700 flex-shrink-0"
                                          title="Copy to clipboard"
                                        >
                                          <FiCopy size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  ) : 'Not configured'}
                                </dd>
                              </div>
                              
                              <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-sm font-medium text-gray-700">Auto-settle</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                  {method.autoSettle ? 'Enabled' : 'Disabled'}
                                </dd>
                              </div>
                              
                              <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-sm font-medium text-gray-700">Status</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                  {method.isActive ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800">
                                      Active
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                      Inactive
                                    </span>
                                  )}
                                </dd>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                            <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
                              <FiInfo className="mr-2" />
                              {getMethodLabel(method.type)} Integration Guide
                            </h3>
                            <p className="text-sm text-blue-800 mb-3">
                              Follow these steps to integrate {getMethodLabel(method.type)} with your application:
                            </p>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
                              {method.type === PAYMENT_METHODS.MPESA_PAYBILL.value && (
                                <>
                                  <li>Register your Paybill number with Safaricom</li>
                                  <li>Configure the callback URL in your Daraja API settings</li>
                                  <li>Implement STK Push and C2B APIs for payments</li>
                                  <li>Set up webhook verification using the provided secret</li>
                                </>
                              )}
                              {method.type === PAYMENT_METHODS.MPESA_TILL.value && (
                                <>
                                  <li>Register your Till number with Safaricom</li>
                                  <li>Configure the callback URL in your Daraja API settings</li>
                                  <li>Implement USSD Push for payments</li>
                                  <li>Set up webhook verification using the provided secret</li>
                                </>
                              )}
                              {method.type === PAYMENT_METHODS.PAYPAL.value && (
                                <>
                                  <li>Create a PayPal business account</li>
                                  <li>Configure your app credentials in the PayPal Developer Dashboard</li>
                                  <li>Implement PayPal Checkout or Smart Buttons</li>
                                  <li>Set up IPN (Instant Payment Notification) webhooks</li>
                                </>
                              )}
                              {method.type === PAYMENT_METHODS.BANK.value && (
                                <>
                                  <li>Contact your bank to enable API access</li>
                                  <li>Configure your account details for transfers</li>
                                  <li>Implement bank transfer processing</li>
                                  <li>Set up payment confirmation webhooks</li>
                                </>
                              )}
                            </ol>
                            <a 
                              href={PAYMENT_METHODS[method.type]?.documentationLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <FiClipboard className="mr-2" />
                              View {getMethodLabel(method.type)} Documentation
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Configuration History */}
              <ConfigurationHistory history={history} />
            </div>
          )}
        </div>
      </div>

      {/* Add Method Modal */}
      {showAddMethodModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Payment Method</h3>
              <p className="text-sm text-gray-500 mb-4">Select a payment method to add to your configuration:</p>
              
              <div className="space-y-3">
                {Object.values(PAYMENT_METHODS)
                  .filter(method => !config.paymentMethods.some(pm => pm.type === method.value))
                  .map((method, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setMethodToAdd(method.value)}
                      className={`w-full flex items-center p-3 rounded-lg border ${methodToAdd === method.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      <span className={`flex-shrink-0 p-2 rounded-lg ${method.color} mr-3`}>
                        {method.icon}
                      </span>
                      <div className="text-left">
                        <h4 className="font-medium text-gray-900">{method.label}</h4>
                        <p className="text-sm text-gray-500">{method.description}</p>
                      </div>
                    </button>
                  ))}
              </div>
              
              {Object.values(PAYMENT_METHODS).every(method => 
                config.paymentMethods.some(pm => pm.type === method.value)
              ) && (
                <p className="text-sm text-gray-500 mt-4">All available payment methods have been added.</p>
              )}
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMethodModal(false);
                    setMethodToAdd(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmAddPaymentMethod}
                  disabled={!methodToAdd}
                  className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${methodToAdd ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                >
                  Add Method
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default PaymentConfiguration;