// components/SharedComponents.jsx
import React from 'react';
import { Zap, BatteryFull, BatteryMedium, BatteryLow, BadgeCheck, Clock, AlertTriangle, CreditCard, MessageSquare, Mail, Bell } from 'lucide-react';

// Memoized components to prevent unnecessary re-renders
export const DataUsageBar = React.memo(({ used, total, isUnlimited, theme }) => {
  if (isUnlimited) {
    return (
      <div className={`w-full bg-gradient-to-r from-purple-100 to-blue-100 rounded-full h-3 relative overflow-hidden ${
        theme === "dark" ? "from-purple-900 to-blue-900" : ""
      }`}>
        <div className={`absolute inset-0 bg-gradient-to-r from-purple-400 via-blue-500 to-teal-400 opacity-70 animate-pulse rounded-full ${
          theme === "dark" ? "from-purple-600 via-blue-600 to-teal-600" : ""
        }`}></div>
      </div>
    );
  }

  const percentage = Math.min((used / parseFloat(total || 1)) * 100, 100);
  let colorClass = "bg-green-500";
  if (percentage > 80) colorClass = "bg-yellow-500";
  if (percentage > 95) colorClass = "bg-red-500";

  if (theme === "dark") {
    if (percentage > 80) colorClass = "bg-yellow-600";
    if (percentage > 95) colorClass = "bg-red-600";
  }

  return (
    <div className={`w-full rounded-full h-3 overflow-hidden ${
      theme === "dark" ? "bg-gray-700" : "bg-gray-200"
    }`}>
      <div
        className={`${colorClass} h-3 rounded-full transition-all duration-500`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
});

export const DataUsageIcon = React.memo(({ used, total, isUnlimited }) => {
  if (isUnlimited) return <Zap className="text-purple-500" size={18} />;
  const percentage = used / parseFloat(total || 1);
  if (percentage < 0.3) return <BatteryFull className="text-green-500" size={18} />;
  if (percentage < 0.7) return <BatteryMedium className="text-yellow-500" size={18} />;
  return <BatteryLow className="text-red-500" size={18} />;
});

export const PaymentStatusIcon = React.memo(({ status }) => {
  switch (status) {
    case "Paid":
      return <BadgeCheck className="text-green-500" size={18} />;
    case "Due":
      return <Clock className="text-yellow-500" size={18} />;
    case "Expired":
      return <AlertTriangle className="text-red-500" size={18} />;
    default:
      return <CreditCard className="text-gray-500" size={18} />;
  }
});

export const MessageTypeIcon = React.memo(({ type }) => {
  switch (type) {
    case "sms":
      return <MessageSquare className="text-blue-500" size={16} />;
    case "email":
      return <Mail className="text-green-500" size={16} />;
    case "system":
      return <Bell className="text-purple-500" size={16} />;
    default:
      return <MessageSquare className="text-gray-500" size={16} />;
  }
});

export const StatusBadge = React.memo(({ status, theme }) => {
  let bgColor = theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700";
  if (status === "delivered") bgColor = theme === "dark" ? "bg-green-900 text-green-300" : "bg-green-100 text-green-700";
  if (status === "failed") bgColor = theme === "dark" ? "bg-red-900 text-red-300" : "bg-red-100 text-red-700";
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs ${bgColor}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
});