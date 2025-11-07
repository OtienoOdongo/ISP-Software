



// src/Pages/NetworkManagement/components/UserManagement/UserActivationForm.jsx
import React, { useState, useCallback, useEffect } from "react";
import { User, Wifi, Cable, Smartphone, CreditCard, Search } from "lucide-react";
import CustomModal from "../Common/CustomModal";
import CustomButton from "../Common/CustomButton";
import InputField from "../Common/InputField";
import { toast } from "react-toastify";
import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components"

const UserActivationForm = ({ 
  isOpen = false, 
  onClose, 
  availableClients = [], 
  availablePlans = [], 
  activeRouter, 
  theme = "light", 
  onActivateUser,
  isLoading = false 
}) => {
  const themeClasses = getThemeClasses(theme);
  const [activationData, setActivationData] = useState({
    connection_type: "hotspot",
    client_id: "",
    plan_id: "",
    mac: "",
    username: "",
    password: "",
    transaction_id: "",
    routerId: activeRouter?.id || ""
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [detectedMAC, setDetectedMAC] = useState("");

  // Filter clients based on search - FIXED: Added null check
  const filteredClients = Array.isArray(availableClients) 
    ? availableClients.filter(client => {
        const username = client?.user?.username || "";
        const phoneNumber = client?.user?.phone_number || "";
        return username.toLowerCase().includes(searchTerm.toLowerCase()) ||
               phoneNumber.includes(searchTerm);
      })
    : [];

  // Auto-detect MAC address
  const detectMACAddress = useCallback(async () => {
    try {
      const response = await fetch("/api/network_management/get-mac/");
      const data = await response.json();
      if (data.mac && data.mac !== "00:00:00:00:00:00") {
        setDetectedMAC(data.mac);
        setActivationData(prev => ({ ...prev, mac: data.mac }));
      }
    } catch (error) {
      console.error("Failed to detect MAC address:", error);
    }
  }, []);

  useEffect(() => {
    if (isOpen && activationData.connection_type === "hotspot") {
      detectMACAddress();
    }
  }, [isOpen, activationData.connection_type, detectMACAddress]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setActivationData({
        connection_type: "hotspot",
        client_id: "",
        plan_id: "",
        mac: "",
        username: "",
        password: "",
        transaction_id: "",
        routerId: activeRouter?.id || ""
      });
      setSearchTerm("");
      setDetectedMAC("");
    }
  }, [isOpen, activeRouter]);

  const handleInputChange = (field, value) => {
    setActivationData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!activeRouter?.id) {
      toast.error("No active router selected");
      return;
    }

    // Validation
    if (!activationData.client_id || !activationData.plan_id) {
      toast.error("Please select both client and plan");
      return;
    }

    if (activationData.connection_type === "hotspot" && !activationData.mac) {
      toast.error("MAC address is required for hotspot");
      return;
    }

    if (activationData.connection_type === "pppoe" && (!activationData.username || !activationData.password)) {
      toast.error("Username and password are required for PPPoE");
      return;
    }

    try {
      const submitData = {
        ...activationData,
        routerId: activeRouter.id
      };

      await onActivateUser(submitData);
      onClose();
    } catch (error) {
      // Error handled in the hook
    }
  };

  const selectedClient = Array.isArray(availableClients) 
    ? availableClients.find(c => c.id === activationData.client_id)
    : null;
    
  const selectedPlan = Array.isArray(availablePlans) 
    ? availablePlans.find(p => p.id === activationData.plan_id)
    : null;

  return (
    <CustomModal 
      isOpen={isOpen} 
      title="Activate User Session" 
      onClose={onClose}
      size="lg"
      theme={theme}
    >
      <div className="space-y-6">
        {/* Connection Type Selection */}
        <div>
          <label className={`block text-sm font-medium mb-3 ${themeClasses.text.secondary}`}>
            Connection Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleInputChange("connection_type", "hotspot")}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                activationData.connection_type === "hotspot"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                  : `${themeClasses.border.medium} hover:border-gray-400 dark:hover:border-gray-500`
              }`}
            >
              <Wifi className="w-6 h-6 mx-auto mb-2" />
              <span className="font-medium">Hotspot</span>
              <p className={`text-xs mt-1 ${themeClasses.text.tertiary}`}>
                Wireless connection
              </p>
            </button>
            
            <button
              type="button"
              onClick={() => handleInputChange("connection_type", "pppoe")}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                activationData.connection_type === "pppoe"
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                  : `${themeClasses.border.medium} hover:border-gray-400 dark:hover:border-gray-500`
              }`}
            >
              <Cable className="w-6 h-6 mx-auto mb-2" />
              <span className="font-medium">PPPoE</span>
              <p className={`text-xs mt-1 ${themeClasses.text.tertiary}`}>
                Wired connection
              </p>
            </button>
          </div>
        </div>

        {/* Client Selection */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
            Select Client
          </label>
          <div className="relative mb-3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className={`w-full pl-10 pr-4 py-2 border rounded-lg ${themeClasses.input}`}
              placeholder="Search clients by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            value={activationData.client_id}
            onChange={(e) => handleInputChange("client_id", e.target.value)}
            className={`w-full p-3 border rounded-lg ${themeClasses.input}`}
          >
            <option value="">Select a client</option>
            {filteredClients.map(client => (
              <option key={client.id} value={client.id}>
                {client.user?.username || "Unknown"} - {client.user?.phone_number || "No phone"}
              </option>
            ))}
          </select>
          
          {filteredClients.length === 0 && availableClients.length > 0 && (
            <p className={`text-sm ${themeClasses.text.tertiary} mt-2`}>
              No clients match your search
            </p>
          )}
        </div>

        {/* Plan Selection */}
        <InputField
          label="Internet Plan"
          value={activationData.plan_id}
          onChange={(e) => handleInputChange("plan_id", e.target.value)}
          type="select"
          options={Array.isArray(availablePlans) ? availablePlans.map(plan => ({
            value: plan.id,
            label: `${plan.name || "Unknown"} - ${plan.price || "N/A"}`
          })) : []}
          icon={<CreditCard className="w-4 h-4" />}
          theme={theme}
        />

        {/* Connection-specific fields */}
        {activationData.connection_type === "hotspot" && (
          <InputField
            label="MAC Address"
            value={activationData.mac}
            onChange={(e) => handleInputChange("mac", e.target.value)}
            placeholder="00:11:22:33:44:55"
            icon={<Smartphone className="w-4 h-4" />}
            theme={theme}
            subtitle={detectedMAC ? "Auto-detected from your device" : "Enter MAC address manually"}
          />
        )}

        {activationData.connection_type === "pppoe" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="PPPoE Username"
              value={activationData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              placeholder="username"
              icon={<User className="w-4 h-4" />}
              theme={theme}
            />
            <InputField
              label="PPPoE Password"
              type="password"
              value={activationData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="••••••••"
              icon={<CreditCard className="w-4 h-4" />}
              theme={theme}
            />
          </div>
        )}

        {/* Transaction ID (Optional) */}
        <InputField
          label="Transaction ID (Optional)"
          value={activationData.transaction_id}
          onChange={(e) => handleInputChange("transaction_id", e.target.value)}
          placeholder="Payment transaction reference"
          icon={<CreditCard className="w-4 h-4" />}
          theme={theme}
        />

        {/* Summary */}
        {(selectedClient || selectedPlan) && (
          <div className={`p-4 rounded-lg border ${
            themeClasses.bg.card
          } ${themeClasses.border.medium}`}>
            <h4 className={`font-medium mb-2 ${themeClasses.text.primary}`}>Activation Summary</h4>
            {selectedClient && (
              <p className={`text-sm ${themeClasses.text.secondary}`}>
                <strong>Client:</strong> {selectedClient.user?.username || "Unknown"} ({selectedClient.user?.phone_number || "No phone"})
              </p>
            )}
            {selectedPlan && (
              <p className={`text-sm ${themeClasses.text.secondary}`}>
                <strong>Plan:</strong> {selectedPlan.name || "Unknown"} - {selectedPlan.price || "N/A"}
              </p>
            )}
            <p className={`text-sm ${themeClasses.text.secondary}`}>
              <strong>Type:</strong> {activationData.connection_type.toUpperCase()}
            </p>
          </div>
        )}

        <div className={`flex justify-end space-x-3 pt-4 border-t ${themeClasses.border.light}`}>
          <CustomButton
            onClick={onClose}
            label="Cancel"
            variant="secondary"
            disabled={isLoading}
            theme={theme}
          />
          <CustomButton
            onClick={handleSubmit}
            label={isLoading ? "Activating..." : "Activate User"}
            variant="primary"
            disabled={isLoading || !activationData.client_id || !activationData.plan_id}
            loading={isLoading}
            theme={theme}
          />
        </div>
      </div>
    </CustomModal>
  );
};

export default UserActivationForm;