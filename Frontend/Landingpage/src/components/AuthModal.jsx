




import React, { useState, useEffect } from "react";
import api from "../api";
import { 
  Phone, 
  CreditCard, 
  CheckCircle, 
  X,
  ArrowRight,
  Smartphone,
  Shield,
  Zap,
  RotateCw,
  Wifi,
  User,
  History,
  Edit
} from "lucide-react";
import mpesa from "../assets/mpesa.png";

const AuthModal = ({ 
  onClose, 
  onLoginSuccess, 
  selectedPlan, 
  onPaymentSuccess, 
  existingClientData,
  getMacAddress
}) => {
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [isReturningClient, setIsReturningClient] = useState(false);
  const [isEditingNumber, setIsEditingNumber] = useState(false);

  const isFreePlan = selectedPlan?.category === "promotional" && 
                    (selectedPlan.price === 0 || selectedPlan.price === "0" || parseFloat(selectedPlan.price) === 0);

  // Check if client is returning from localStorage or props
  useEffect(() => {
    const savedPhone = localStorage.getItem("clientPhoneNumber");
    const savedClientId = localStorage.getItem("clientId");
    
    // Prioritize existingClientData from props, then check localStorage
    if (existingClientData.phoneNumber && existingClientData.clientId) {
      setPhoneNumber(existingClientData.phoneNumber);
      setClientId(existingClientData.clientId);
      setIsReturningClient(true);
    } else if (savedPhone && savedClientId) {
      setPhoneNumber(savedPhone);
      setClientId(savedClientId);
      setIsReturningClient(true);
    }
  }, [existingClientData]);

  const activateFreePlan = async (clientId) => {
    setLoading(true);
    try {
      const macAddress = await getMacAddress();
      await api.post("/api/network_management/routers/1/hotspot-users/", {
        client_id: clientId,
        plan_id: selectedPlan.id,
        transaction_id: null,
        mac: macAddress,
      });
      
      // Save to localStorage
      localStorage.setItem("clientPhoneNumber", phoneNumber);
      localStorage.setItem("clientId", clientId);
      
      onPaymentSuccess(selectedPlan.name, true);
      setStep(3);
    } catch (err) {
      setError("Failed to activate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const validateAndFormatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/[^\d+]/g, "");
    let formatted;
    
    if (cleaned.startsWith("07") && cleaned.length === 10) {
      formatted = `+254${cleaned.slice(1)}`;
    } else if (cleaned.startsWith("01") && cleaned.length === 10) {
      formatted = `+254${cleaned.slice(1)}`;
    } else if (cleaned.startsWith("254") && cleaned.length === 12) {
      formatted = `+${cleaned}`;
    } else if (cleaned.startsWith("+254") && cleaned.length === 13) {
      formatted = cleaned;
    } else if (cleaned.length === 9 && (cleaned[0] === "7" || cleaned[0] === "1")) {
      formatted = `+254${cleaned}`;
    } else {
      throw new Error("Invalid phone number format. Use 07XXXXXXXX, 01XXXXXXXX, or 7XXXXXXXX");
    }
    
    return formatted;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and limit to 10 digits
    const cleanedValue = value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(cleanedValue);
  };

  const findOrCreateClient = async (formattedPhone, displayPhone) => {
    try {
      // First try to find existing client
      const searchResponse = await api.get("/api/account/clients/", {
        params: { phonenumber: formattedPhone }
      });
      
      if (searchResponse.data.length > 0) {
        return searchResponse.data[0]; // Return existing client
      }
      
      // If client doesn't exist, create a new one
      const createResponse = await api.post("/api/account/clients/", {
        phonenumber: formattedPhone,
      });
      
      return createResponse.data; // Return new client
      
    } catch (err) {
      if (err.response?.status === 400) {
        // If creation failed due to duplicate (race condition), try to find again
        const retryResponse = await api.get("/api/account/clients/", {
          params: { phonenumber: formattedPhone }
        });
        if (retryResponse.data.length > 0) {
          return retryResponse.data[0];
        }
        throw new Error("Unable to create or find client. Please verify your phone number and try again.");
      }
      throw err;
    }
  };

  const handlePhoneSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // If we already have a client ID and it's a returning client, proceed directly
    if (isReturningClient && clientId && !isEditingNumber) {
      onLoginSuccess(validateAndFormatPhoneNumber(phoneNumber), clientId);
      
      if (isFreePlan) {
        await activateFreePlan(clientId);
      } else {
        setStep(2);
      }
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      if (!phoneNumber || phoneNumber.length < 9) {
        throw new Error("Please enter a valid phone number");
      }

      const formattedPhone = validateAndFormatPhoneNumber(phoneNumber);
      const displayPhone = `0${formattedPhone.slice(4)}`; // Standardize to 07XXXXXXXX format for display and storage
      const client = await findOrCreateClient(formattedPhone, displayPhone);

      if (client) {
        setClientId(client.id);
        onLoginSuccess(formattedPhone, client.id);
        
        // Save to localStorage using standardized display format
        localStorage.setItem("clientPhoneNumber", displayPhone);
        localStorage.setItem("clientId", client.id);
        setIsReturningClient(true);
        setIsEditingNumber(false);
        
        if (isFreePlan) {
          await activateFreePlan(client.id);
        } else {
          setStep(2);
        }
      }
    } catch (err) {
      console.error("Client error:", err);
      setError(err.response?.data?.phonenumber?.[0] || err.message || "Invalid phone number or server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError("");
    setPaymentInProgress(true);

    try {
      const formattedPhone = validateAndFormatPhoneNumber(phoneNumber);
      const displayPhone = `0${formattedPhone.slice(4)}`; // Standardize for storage
      const response = await api.post("/api/payments/initiate/", {
        phone_number: formattedPhone,
        amount: selectedPlan.price,
        plan_id: selectedPlan.id,
      });
      
      const checkoutRequestId = response.data.checkout_request_id;

      const interval = setInterval(async () => {
        try {
          const statusResponse = await api.post("/api/payments/stk-status/", {
            checkout_request_id: checkoutRequestId,
          });
          
          const status = statusResponse.data.status;
          if (status.ResultCode === "0") {
            const macAddress = await getMacAddress();
            await api.post("/api/network_management/routers/1/hotspot-users/", {
              client_id: clientId,
              plan_id: selectedPlan.id,
              transaction_id: checkoutRequestId,
              mac: macAddress,
            });
            
            // Save to localStorage on successful payment using standardized display format
            localStorage.setItem("clientPhoneNumber", displayPhone);
            localStorage.setItem("clientId", clientId);
            
            onPaymentSuccess(selectedPlan.name, false);
            clearInterval(interval);
            setPaymentInProgress(false);
            setStep(3);
          } else if (status.ResultCode && status.ResultCode !== "0") {
            setError("Payment failed. Please try again.");
            clearInterval(interval);
            setPaymentInProgress(false);
          }
        } catch (err) {
          setError("Error verifying payment. Please check your M-Pesa messages.");
          clearInterval(interval);
          setPaymentInProgress(false);
        }
      }, 3000);
    } catch (err) {
      setError("Payment initiation failed. Please check your phone number.");
      setPaymentInProgress(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEditNumber = () => {
    setIsEditingNumber(true);
  };

  const handleCancelEdit = () => {
    const savedPhone = localStorage.getItem("clientPhoneNumber");
    if (savedPhone) {
      setPhoneNumber(savedPhone);
    }
    setIsEditingNumber(false);
  };

  const renderReturningClientUI = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4 border border-green-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <History className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Registered Number</p>
            <p className="text-lg font-bold text-green-700">{phoneNumber}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => handlePhoneSubmit()}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
        >
          {loading ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin" />
              Continuing...
            </>
          ) : (
            <>
              Continue as {phoneNumber}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <button
          onClick={handleEditNumber}
          className="w-full py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-2"
        >
          <Edit className="w-5 h-5" />
          Use Different Number
        </button>
      </div>
    </div>
  );

  const renderPhoneInput = () => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <Smartphone className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-1">
          {isReturningClient && !isEditingNumber ? 'Welcome Back!' : 'Enter Your Phone Number'}
        </h3>
        <p className="text-sm text-gray-600">
          {isReturningClient && !isEditingNumber 
            ? 'We recognize your number from previous visits. Continue with your registered number or use a different one' 
            : 'We\'ll use this to process your payment and activate your plan'}
        </p>
      </div>

      {isReturningClient && !isEditingNumber ? (
        renderReturningClientUI()
      ) : (
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition-all text-base font-medium text-gray-800 bg-white"
                placeholder="07XXXXXXXX or 7XXXXXXXX"
                required
                maxLength="10"
                style={{ color: '#1f2937' }}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Phone className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Enter your 10-digit number (e.g., 07XXXXXXXX)</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-xs font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {isFreePlan ? 'Activate Now' : 'Continue to Payment'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {isReturningClient && isEditingNumber && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="w-full py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium rounded-lg transition-all duration-200 text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-blue-800">Your data is secure</p>
            <p className="text-xs text-blue-600">We use encryption to protect your personal information</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentConfirmation = () => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-1">Confirm Payment</h3>
        <p className="text-sm text-gray-600">Review your plan details before proceeding</p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
        <div className="text-center mb-4">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h4 className="text-lg font-bold text-gray-800">{selectedPlan.name}</h4>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">
            KES {Number(selectedPlan.price).toLocaleString()}
          </p>
        </div>

        <div className="space-y-2 bg-white rounded-lg p-3 border text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Data Limit:</span>
            <span className="font-semibold text-gray-800">{selectedPlan.dataLimit.value} {selectedPlan.dataLimit.unit}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Download Speed:</span>
            <span className="font-semibold text-gray-800">{selectedPlan.downloadSpeed.value} {selectedPlan.downloadSpeed.unit}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Validity:</span>
            <span className="font-semibold text-gray-800">{selectedPlan.expiry.value} {selectedPlan.expiry.unit}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Phone Number:</span>
            <span className="font-semibold text-gray-800">{phoneNumber}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-xs font-medium">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={handlePayment}
          disabled={loading || paymentInProgress}
          className="w-full py-3 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 disabled:opacity-50 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-3 text-sm"
        >
          {paymentInProgress ? (
            <>
              <RotateCw className="w-7 h-5 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <span>Pay with M-Pesa</span>
              <img src={mpesa} alt="M-Pesa" className="h-9 w-9" />
            </>
          )}
        </button>

        <button
          onClick={() => {
            setStep(1);
            setIsEditingNumber(true);
          }}
          className="w-full py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-2"
        >
          <Edit className="w-5 h-5" />
          Change Phone Number
        </button>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
        <CheckCircle className="w-8 h-8 text-white" />
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-1">You're Connected!</h3>
        <p className="text-sm text-gray-600">Your internet plan has been activated successfully</p>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-2">{selectedPlan.name}</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Data:</span>
            <span className="font-medium text-gray-800">{selectedPlan.dataLimit.value} {selectedPlan.dataLimit.unit}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Speed:</span>
            <span className="font-medium text-gray-800">{selectedPlan.downloadSpeed.value} {selectedPlan.downloadSpeed.unit}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Valid for:</span>
            <span className="font-medium text-gray-800">{selectedPlan.expiry.value} {selectedPlan.expiry.unit}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
      >
        Start Browsing
        <Wifi className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md mx-auto shadow-2xl border border-gray-100 relative">
        {step !== 3 && (
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        {step === 1 && renderPhoneInput()}
        {step === 2 && renderPaymentConfirmation()}
        {step === 3 && renderSuccess()}
      </div>
    </div>
  );
};

export default AuthModal;