// import React, { useState, useEffect } from 'react';
// import { FaSave, FaSync, FaCheckCircle } from 'react-icons/fa';
// import { FiEdit } from 'react-icons/fi';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const MpesaConfiguration = () => {
//   const [config, setConfig] = useState({
//     apiKey: '',
//     secretKey: '',
//     shortCode: '',
//     passKey: '',
//     callbackURL: '',
//     validationURL: '',
//   });
//   const [savedConfig, setSavedConfig] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [changesSaved, setChangesSaved] = useState(false);
//   const [showEditForm, setShowEditForm] = useState(true);

//   // Mock saved configuration data
//   const mockSavedConfig = {
//     apiKey: 'mock-api-key',
//     secretKey: 'mock-secret-key',
//     shortCode: '12345',
//     passKey: 'mock-pass-key',
//     callbackURL: 'https://example.com/mpesa-callback',
//     validationURL: 'https://example.com/mpesa-validation',
//   };

//   useEffect(() => {
//     setLoading(true);
//     setTimeout(() => {
//       try {
//         setSavedConfig(mockSavedConfig);
//         setConfig({ ...mockSavedConfig });
//         setChangesSaved(true);
//         setShowEditForm(false);
//       } catch (error) {
//         setError('Failed to fetch configuration');
//       } finally {
//         setLoading(false);
//       }
//     }, 1000);
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setConfig(prevConfig => ({
//       ...prevConfig,
//       [name]: value
//     }));
//     setChangesSaved(false);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setTimeout(() => {
//       try {
//         setSavedConfig(config);
//         toast.success('Configuration saved successfully!', {
//           position: "top-right",
//           autoClose: 3000,
//           hideProgressBar: false,
//           closeOnClick: true,
//           pauseOnHover: true,
//           draggable: true,
//           progress: undefined,
//           theme: "colored",
//         });
//         setChangesSaved(true);
//         setShowEditForm(false);
//       } catch (error) {
//         toast.error('Failed to save configuration', {
//           position: "top-right",
//           autoClose: 5000,
//           hideProgressBar: false,
//           closeOnClick: true,
//           pauseOnHover: true,
//           draggable: true,
//           progress: undefined,
//           theme: "colored",
//         });
//       } finally {
//         setLoading(false);
//       }
//     }, 1000);
//   };

//   const handleReset = () => {
//     setConfig({ ...mockSavedConfig });
//     setChangesSaved(true);
//     toast.info('Configuration reset to last saved state.', {
//       position: "top-right",
//       autoClose: 3000,
//       hideProgressBar: false,
//       closeOnClick: true,
//       pauseOnHover: true,
//       draggable: true,
//       progress: undefined,
//       theme: "colored",
//     });
//   };

//   const handleEdit = () => {
//     setShowEditForm(true);
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
//       <div className="relative py-3 sm:max-w-xl sm:mx-auto">
//         <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
//         <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
//           <h1 className="text-3xl font-bold text-indigo-800 mb-6 text-center">M-Pesa Configuration</h1>

//           {loading ? (
//             <div className="text-center text-gray-500">Loading configuration...</div>
//           ) : error ? (
//             <div className="text-center text-red-500">{error}</div>
//           ) : showEditForm ? (
//             <form onSubmit={handleSubmit}>
//               <div className="space-y-6">
//                 {[
//                   { label: 'API Key', name: 'apiKey', type: 'text' },
//                   { label: 'Secret Key', name: 'secretKey', type: 'password' },
//                   { label: 'Short Code', name: 'shortCode', type: 'text' },
//                   { label: 'Pass Key', name: 'passKey', type: 'password' },
//                   { label: 'Callback URL', name: 'callbackURL', type: 'url' },
//                   { label: 'Validation URL', name: 'validationURL', type: 'url' },
//                 ].map(({ label, name, type }, index) => (
//                   <div key={index}>
//                     <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
//                     <input
//                       id={name}
//                       type={type}
//                       name={name}
//                       value={config[name]}
//                       onChange={handleChange}
//                       className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
//                       focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
//                       disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
//                       placeholder={`Enter ${label}`}
//                     />
//                   </div>
//                 ))}
//               </div>

//               <div className="mt-6 flex justify-between">
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-full shadow-md hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
//                 >
//                   {loading ? <FaSync className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
//                   {loading ? 'Saving...' : 'Save Configuration'}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={handleReset}
//                   className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300 disabled:opacity-50"
//                   disabled={loading}
//                 >
//                   <FaSync className="mr-2" /> Reset
//                 </button>
//               </div>
//             </form>
//           ) : (
//             <>
//               <div className="mt-8">
//                 <div className="bg-gray-50 border-l-4 border-green-500 rounded-lg shadow-lg p-4">
//                   <h3 className="text-lg font-semibold text-green-700 mb-2 flex items-center justify-between">
//                     <span><FaCheckCircle className="text-green-500 mr-2" /> Configuration Saved</span>
//                     <button
//                       onClick={handleEdit}
//                       className="p-2 hover:bg-indigo-100 rounded-full transition duration-300"
//                     >
//                       <FiEdit className="text-indigo-500 hover:text-indigo-700" size={20} />
//                     </button>
//                   </h3>
//                   <ul className="list-none space-y-2">
//                     <li className="flex items-center">
//                       <span className="text-sm text-gray-700 w-1/3">API Key:</span>
//                       <span className="text-sm font-medium text-green-600 w-2/3">{savedConfig.apiKey.slice(0, 5)}...</span>
//                     </li>
//                     <li className="flex items-center">
//                       <span className="text-sm text-gray-700 w-1/3">Short Code:</span>
//                       <span className="text-sm font-medium text-green-600 w-2/3">{savedConfig.shortCode}</span>
//                     </li>
//                     <li className="flex items-center">
//                       <span className="text-sm text-gray-700 w-1/3">Callback URL:</span>
//                       <span className="text-sm font-medium text-green-600 w-2/3">{savedConfig.callbackURL}</span>
//                     </li>
//                     <li className="flex items-center">
//                       <span className="text-sm text-gray-700 w-1/3">Validation URL:</span>
//                       <span className="text-sm font-medium text-green-600 w-2/3">{savedConfig.validationURL}</span>
//                     </li>
//                   </ul>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//       <ToastContainer />
//     </div>
//   );
// };

// export default MpesaConfiguration;





import React, { useState, useEffect } from "react";
import api from "../../../api";
import { FaSave, FaSync, FaCheckCircle } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader } from "react-spinners"; 

const MpesaConfiguration = () => {
  const [config, setConfig] = useState({
    apiKey: "",
    secretKey: "",
    shortCodeTill: "",
    shortCodeStore: "",
    passKey: "",
    callbackURL: "",
  });
  const [savedConfig, setSavedConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [changesSaved, setChangesSaved] = useState(false);
  const [showEditForm, setShowEditForm] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const response = await api.get("/api/payments/mpesa-config/");
        setSavedConfig(response.data);
        setConfig(response.data);
        setChangesSaved(true);
        setShowEditForm(false);
      } catch (err) {
        setError("Failed to fetch configuration");
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
    setChangesSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/api/payments/mpesa-config/", config);
      setSavedConfig(response.data);
      toast.success("Configuration saved successfully!");
      setChangesSaved(true);
      setShowEditForm(false);
    } catch (err) {
      toast.error("Failed to save configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setConfig({ ...savedConfig });
    setChangesSaved(true);
    toast.info("Configuration reset to last saved state.");
  };

  const handleEdit = () => {
    setShowEditForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-3xl font-bold text-indigo-800 mb-6 text-center">M-Pesa Configuration</h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center">
              <ClipLoader color="#4f46e5" loading={loading} size={50} /> {/* Spinner */}
              <p className="mt-2 text-gray-600">Loading configuration...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : showEditForm ? (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {[
                  { label: "API Key", name: "apiKey", type: "text" },
                  { label: "Secret Key", name: "secretKey", type: "password" },
                  { label: "Till Number", name: "shortCodeTill", type: "text" },
                  { label: "Store Number", name: "shortCodeStore", type: "text" },
                  { label: "Pass Key", name: "passKey", type: "password" },
                  { label: "Callback URL", name: "callbackURL", type: "url" },
                ].map(({ label, name, type }, index) => (
                  <div key={index}>
                    <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
                    <input
                      id={name}
                      type={type}
                      name={name}
                      value={config[name]}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                      focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                      disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                      placeholder={`Enter ${label}`}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-full shadow-md hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
                >
                  {loading ? <FaSync className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
                  {loading ? "Saving..." : "Save Configuration"}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300 disabled:opacity-50"
                  disabled={loading}
                >
                  <FaSync className="mr-2" /> Reset
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="mt-8">
                <div className="bg-gray-50 border-l-4 border-green-500 rounded-lg shadow-lg p-4">
                  <h3 className="text-lg font-semibold text-green-700 mb-2 flex items-center justify-between">
                    <span><FaCheckCircle className="text-green-500 mr-2" /> Configuration Saved</span>
                    <button
                      onClick={handleEdit}
                      className="p-2 hover:bg-indigo-100 rounded-full transition duration-300"
                    >
                      <FiEdit className="text-indigo-500 hover:text-indigo-700" size={20} />
                    </button>
                  </h3>
                  <ul className="list-none space-y-2">
                    <li className="flex items-center">
                      <span className="text-sm text-gray-700 w-1/3">API Key:</span>
                      <span className="text-sm font-medium text-green-600 w-2/3">{savedConfig.apiKey.slice(0, 5)}...</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-sm text-gray-700 w-1/3">Till Number:</span>
                      <span className="text-sm font-medium text-green-600 w-2/3">{savedConfig.shortCodeTill}</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-sm text-gray-700 w-1/3">Store Number:</span>
                      <span className="text-sm font-medium text-green-600 w-2/3">{savedConfig.shortCodeStore}</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-sm text-gray-700 w-1/3">Callback URL:</span>
                      <span className="text-sm font-medium text-green-600 w-2/3">{savedConfig.callbackURL}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default MpesaConfiguration;