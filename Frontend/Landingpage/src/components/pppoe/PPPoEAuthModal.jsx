import React, { useState, useEffect } from "react";
import { 
  Phone, CreditCard, CheckCircle, X, ArrowRight, 
  User, Lock, Shield, Zap, RotateCw, Wifi,
  History, Edit
} from "lucide-react";
import mpesa from "../../assets/mpesa.png";
import api from "../../api/index";

const PPPoEAuthModal = ({ 
  onClose, 
  selectedPlan, 
  onPaymentSuccess, 
  onRegistrationSuccess,
  clientData,
  paymentMethods,
  isAuthenticated
}) => {
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isFreePlan = selectedPlan?.category === "promotional" && 
                    (selectedPlan.price === 0 || selectedPlan.price === "0" || parseFloat(selectedPlan.price) === 0);

  // Set default payment method to M-Pesa
  useEffect(() => {
    const mpesaMethod = paymentMethods.find(method => 
      method.name === 'mpesa_paybill' || method.name === 'mpesa_till'
    );
    if (mpesaMethod) {
      setSelectedPaymentMethod(mpesaMethod);
    } else if (paymentMethods.length > 0) {
      setSelectedPaymentMethod(paymentMethods[0]);
    }
  }, [paymentMethods]);

  // Pre-fill phone number if user is authenticated
  useEffect(() => {
    if (isAuthenticated && clientData) {
      setPhoneNumber(clientData.phone_number || "");
      if (clientData.pppoe_username) {
        setUsername(clientData.pppoe_username);
      }
      setStep(2); // Skip to payment if already authenticated
    }
  }, [isAuthenticated, clientData]);

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
    const cleanedValue = value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(cleanedValue);
  };

  const generatePPPoEUsername = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-8);
    return `pppoe${cleanPhone}`;
  };

  const handleRegistration = async (e) => {
    if (e) e.preventDefault();
    
    setLoading(true);
    setError("");

    try {
      if (!phoneNumber || phoneNumber.length < 9) {
        throw new Error("Please enter a valid phone number");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const formattedPhone = validateAndFormatPhoneNumber(phoneNumber);
      const pppoeUsername = username || generatePPPoEUsername(phoneNumber);

      // Register PPPoE client
      const response = await api.post("/api/account/clients/create-pppoe/", {
        phone_number: formattedPhone,
        pppoe_username: pppoeUsername,
        pppoe_password: password
      });

      if (response.data.success) {
        const client = response.data.client;
        onRegistrationSuccess(client);
        
        if (isFreePlan) {
          await activateFreePlan(client.id, pppoeUsername);
        } else {
          setStep(2);
        }
      } else {
        throw new Error(response.data.error || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.error || err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const activateFreePlan = async (clientId, pppoeUsername) => {
    setLoading(true);
    try {
      await api.post("/api/internet_plans/purchase/", {
        plan_id: selectedPlan.id,
        phone_number: phoneNumber,
        payment_method: "free",
        access_type: "pppoe",
        pppoe_username: pppoeUsername
      });
      
      onPaymentSuccess(selectedPlan.name, true);
      setStep(3);
    } catch (err) {
      setError("Failed to activate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      setError("Please select a payment method");
      return;
    }

    setLoading(true);
    setError("");
    setPaymentInProgress(true);

    try {
      const formattedPhone = validateAndFormatPhoneNumber(phoneNumber);
      const pppoeUsername = username || generatePPPoEUsername(phoneNumber);
      
      // ✅ CORRECTED: Using proper payment initiation endpoint
      const paymentResponse = await api.post("/api/payments/initiate-payment/", {
        gateway_id: selectedPaymentMethod.id,
        amount: selectedPlan.price,
        plan_id: selectedPlan.id,
        phone_number: formattedPhone,
        access_type: "pppoe",
        pppoe_username: pppoeUsername
      });

      if (paymentResponse.data.success) {
        // For M-Pesa, wait for callback
        if (selectedPaymentMethod.name.includes('mpesa')) {
          await waitForMpesaPayment(paymentResponse.data.transaction_id, pppoeUsername);
        } else {
          // For other methods, proceed with activation
          await completePaymentActivation(paymentResponse.data.transaction_id, pppoeUsername);
        }
      } else {
        throw new Error(paymentResponse.data.error || "Payment initiation failed");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Payment failed. Please try again.");
      setPaymentInProgress(false);
    } finally {
      setLoading(false);
    }
  };

  const waitForMpesaPayment = async (transactionId, pppoeUsername) => {
    const maxAttempts = 30; // 2.5 minutes at 5-second intervals
    let attempts = 0;

    const checkInterval = setInterval(async () => {
      attempts++;
      try {
        // ✅ CORRECTED: Using proper transaction status endpoint
        const statusResponse = await api.get(`/api/payments/transactions/${transactionId}/status/`);
        
        if (statusResponse.data.status === 'completed') {
          clearInterval(checkInterval);
          await completePaymentActivation(transactionId, pppoeUsername);
        } else if (statusResponse.data.status === 'failed') {
          clearInterval(checkInterval);
          setError("Payment failed. Please try again.");
          setPaymentInProgress(false);
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          setError("Payment timeout. Please check your M-Pesa messages.");
          setPaymentInProgress(false);
        }
      } catch (err) {
        console.error("Payment status check failed:", err);
      }
    }, 5000);
  };

  const completePaymentActivation = async (transactionId, pppoeUsername) => {
    try {
      // Payment is confirmed, activate the plan
      // ✅ CORRECTED: Using proper plan activation endpoint
      await api.post("/api/internet_plans/activate/", {
        plan_id: selectedPlan.id,
        phone_number: phoneNumber,
        payment_method: selectedPaymentMethod.name,
        access_type: "pppoe",
        pppoe_username: pppoeUsername,
        transaction_id: transactionId
      });

      onPaymentSuccess(selectedPlan.name, false);
      setPaymentInProgress(false);
      setStep(3);
    } catch (err) {
      setError("Activation failed after payment. Please contact support.");
      setPaymentInProgress(false);
    }
  };

  const renderRegistrationForm = () => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <Wifi className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-1">
          {isAuthenticated ? 'Upgrade PPPoE Plan' : 'Create PPPoE Account'}
        </h3>
        <p className="text-sm text-gray-600">
          {isAuthenticated 
            ? 'Upgrade your current PPPoE plan for better speeds and features'
            : 'Create your PPPoE account to get started with wired internet'}
        </p>
      </div>

      <form onSubmit={handleRegistration} className="space-y-4">
        {/* Phone Number */}
        <div>
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
              disabled={isAuthenticated}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <Phone className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Enter your 10-digit number</p>
        </div>

        {/* PPPoE Username */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            PPPoE Username
          </label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition-all text-base font-medium text-gray-800 bg-white"
              placeholder="pppoe_username"
              required
              pattern="pppoe.*"
              title="PPPoE username should start with 'pppoe'"
              disabled={isAuthenticated && clientData?.pppoe_username}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <User className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {!username && "Will be auto-generated if left empty"}
            {username && !username.startsWith('pppoe') && "Username should start with 'pppoe'"}
          </p>
        </div>

        {/* Password - Only show for new registration */}
        {!isAuthenticated && (
          <>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                PPPoE Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition-all text-base font-medium text-gray-800 bg-white pr-10"
                  placeholder="Create a secure password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Lock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition-all text-base font-medium text-gray-800 bg-white pr-10"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <Lock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </>
        )}

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
                {isAuthenticated ? 'Processing...' : 'Creating Account...'}
              </>
            ) : (
              <>
                {isFreePlan ? 'Activate Free Plan' : 'Continue to Payment'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {isAuthenticated && (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium rounded-lg transition-all duration-200 text-sm"
            >
              Skip to Payment
            </button>
          )}
        </div>
      </form>

      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-blue-800">PPPoE Security</p>
            <p className="text-xs text-blue-600">
              Your PPPoE credentials are encrypted and used only for authentication. 
              {!isAuthenticated && " Keep them secure for router configuration."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentSelection = () => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-1">Select Payment Method</h3>
        <p className="text-sm text-gray-600">Choose how you'd like to pay for your PPPoE plan</p>
      </div>

      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedPaymentMethod?.id === method.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedPaymentMethod(method)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {method.name.includes('mpesa') ? (
                  <img src={mpesa} alt="M-Pesa" className="w-8 h-8" />
                ) : (
                  <CreditCard className="w-6 h-6 text-gray-600" />
                )}
                <div>
                  <p className="font-medium text-gray-800">
                    {method.name === 'mpesa_paybill' ? 'M-Pesa Paybill' :
                     method.name === 'mpesa_till' ? 'M-Pesa Till' :
                     method.name === 'bank_transfer' ? 'Bank Transfer' :
                     method.name === 'paypal' ? 'PayPal' : method.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {method.name.includes('mpesa') 
                      ? 'Pay with your M-Pesa account' 
                      : method.name === 'bank_transfer'
                      ? 'Bank transfer or deposit'
                      : 'Pay with PayPal'}
                  </p>
                </div>
              </div>
              {selectedPaymentMethod?.id === method.id && (
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedPaymentMethod && (
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
              <span className="text-gray-600">Connection Type:</span>
              <span className="font-semibold text-gray-800 flex items-center gap-1">
                <Wifi className="w-4 h-4 text-blue-500" />
                PPPoE
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Username:</span>
              <span className="font-semibold text-gray-800">{username || generatePPPoEUsername(phoneNumber)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Phone Number:</span>
              <span className="font-semibold text-gray-800">{phoneNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-semibold text-gray-800">
                {selectedPaymentMethod.name === 'mpesa_paybill' ? 'M-Pesa Paybill' :
                 selectedPaymentMethod.name === 'mpesa_till' ? 'M-Pesa Till' :
                 selectedPaymentMethod.name}
              </span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-xs font-medium">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={handlePayment}
          disabled={!selectedPaymentMethod || loading || paymentInProgress}
          className="w-full py-3 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 disabled:opacity-50 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-3 text-sm"
        >
          {paymentInProgress ? (
            <>
              <RotateCw className="w-5 h-5 animate-spin" />
              Processing Payment...
            </>
          ) : selectedPaymentMethod?.name.includes('mpesa') ? (
            <>
              <span>Pay with M-Pesa</span>
              <img src={mpesa} alt="M-Pesa" className="h-6 w-6" />
            </>
          ) : (
            <>
              <span>Pay with {selectedPaymentMethod?.name}</span>
              <CreditCard className="w-5 h-5" />
            </>
          )}
        </button>

        <button
          onClick={() => setStep(1)}
          className="w-full py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-2"
        >
          <Edit className="w-5 h-5" />
          {isAuthenticated ? 'Change Account Details' : 'Back to Registration'}
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
        <h3 className="text-xl font-bold text-gray-800 mb-1">
          {isFreePlan ? 'PPPoE Account Created!' : 'Payment Successful!'}
        </h3>
        <p className="text-sm text-gray-600">
          {isFreePlan 
            ? 'Your free PPPoE plan has been activated successfully'
            : 'Your PPPoE plan has been activated and payment processed'}
        </p>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-2">{selectedPlan.name}</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">PPPoE Username:</span>
            <span className="font-medium text-gray-800">{username || generatePPPoEUsername(phoneNumber)}</span>
          </div>
          {!isAuthenticated && (
            <div className="flex justify-between">
              <span className="text-gray-600">PPPoE Password:</span>
              <span className="font-medium text-gray-800">••••••••</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Connection Type:</span>
            <span className="font-medium text-gray-800 flex items-center gap-1">
              <Wifi className="w-4 h-4 text-blue-500" />
              PPPoE
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment:</span>
            <span className="font-medium text-gray-800">
              {isFreePlan ? 'FREE' : selectedPaymentMethod?.name.includes('mpesa') ? 'M-Pesa' : selectedPaymentMethod?.name}
            </span>
          </div>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-yellow-800">Important: Save Your Credentials</p>
              <p className="text-xs text-yellow-700">
                Use these PPPoE credentials in your router settings. You'll need them to connect.
              </p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={onClose}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
      >
        {isAuthenticated ? 'Back to Dashboard' : 'Configure Router'}
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
        
        {step === 1 && renderRegistrationForm()}
        {step === 2 && renderPaymentSelection()}
        {step === 3 && renderSuccess()}
      </div>
    </div>
  );
};

export default PPPoEAuthModal;