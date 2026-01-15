// import React, { useState } from 'react';
// import {
//   FiUser,
//   FiPhone,
//   FiMail,
//   FiCalendar,
//   FiDollarSign,
//   FiActivity,
//   FiTrendingUp,
//   FiAlertCircle,
//   FiCheckCircle,
//   FiXCircle,
//   FiMapPin,
//   FiCreditCard,
//   FiBarChart2,
//   FiTag,
//   FiMessageSquare,
//   FiGlobe,
//   FiClock,
//   FiStar,
//   FiShield
// } from 'react-icons/fi';
// import { FaSpinner } from 'react-icons/fa';

// const ClientProfile = ({ client, onUpdate, theme }) => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedData, setEditedData] = useState({});
//   const [isSaving, setIsSaving] = useState(false);

//   const themeClasses = {
//     container: theme === 'dark' 
//       ? 'bg-gray-800 text-gray-100' 
//       : 'bg-white text-gray-900',
//     section: theme === 'dark'
//       ? 'bg-gray-900/50 border-gray-700'
//       : 'bg-gray-50 border-gray-200',
//     heading: theme === 'dark' ? 'text-white' : 'text-gray-800',
//     subheading: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
//     muted: theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
//   };

//   // Format currency
//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-KE', {
//       style: 'currency',
//       currency: 'KES',
//       minimumFractionDigits: 0
//     }).format(amount);
//   };

//   // Get risk level
//   const getRiskLevel = (score) => {
//     if (score >= 7) return { label: 'High', color: 'red', icon: FiAlertCircle };
//     if (score >= 4) return { label: 'Medium', color: 'yellow', icon: FiAlertCircle };
//     return { label: 'Low', color: 'green', icon: FiCheckCircle };
//   };

//   // Get tier color
//   const getTierColor = (tier) => {
//     const colors = {
//       vip: 'text-purple-500',
//       diamond: 'text-blue-500',
//       platinum: 'text-emerald-500',
//       gold: 'text-yellow-500',
//       silver: 'text-gray-400',
//       bronze: 'text-orange-700',
//       new: 'text-gray-500'
//     };
//     return colors[tier] || 'text-gray-500';
//   };

//   // Calculate days active
//   const calculateDaysActive = (customerSince) => {
//     if (!customerSince) return 0;
//     const created = new Date(customerSince);
//     const today = new Date();
//     const diffTime = Math.abs(today - created);
//     return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//   };

//   const riskLevel = getRiskLevel(client.churn_risk_score);
//   const daysActive = calculateDaysActive(client.customer_since);
//   const RiskIcon = riskLevel.icon;

//   return (
//     <div className="space-y-6">
//       {/* Header Section */}
//       <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
//         <div className="flex-1">
//           <div className="flex items-start gap-4 mb-4">
//             <div className={`p-3 rounded-full ${
//               theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
//             }`}>
//               <FiUser size={24} />
//             </div>
//             <div>
//               <h2 className={`text-2xl font-bold mb-1 ${themeClasses.heading}`}>
//                 {client.client_name}
//               </h2>
//               <div className="flex flex-wrap items-center gap-3 mb-2">
//                 <span className={`font-medium capitalize ${getTierColor(client.tier)}`}>
//                   {client.tier_display}
//                 </span>
//                 <span className={`px-2 py-1 rounded text-xs font-medium ${
//                   client.status === 'active'
//                     ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
//                     : client.status === 'inactive'
//                     ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
//                     : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
//                 }`}>
//                   {client.status_display}
//                 </span>
//                 {client.is_marketer && (
//                   <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
//                     Marketer ({client.marketer_tier})
//                   </span>
//                 )}
//               </div>
//               <div className="flex flex-wrap items-center gap-4 text-sm">
//                 <div className="flex items-center gap-2">
//                   <FiPhone size={14} className={themeClasses.muted} />
//                   <span className={themeClasses.subheading}>{client.phone_display}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <FiGlobe size={14} className={themeClasses.muted} />
//                   <span className={themeClasses.subheading}>{client.connection_type_display}</span>
//                 </div>
//                 {client.pppoe_username && (
//                   <div className="flex items-center gap-2">
//                     <FiShield size={14} className={themeClasses.muted} />
//                     <span className={themeClasses.subheading}>PPPoE: {client.pppoe_username}</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex gap-2">
//           <button
//             onClick={() => setIsEditing(!isEditing)}
//             className={`px-4 py-2 rounded-lg font-medium ${
//               theme === 'dark'
//                 ? 'bg-gray-700 hover:bg-gray-600'
//                 : 'bg-gray-200 hover:bg-gray-300'
//             }`}
//           >
//             {isEditing ? 'Cancel Edit' : 'Edit Profile'}
//           </button>
//         </div>
//       </div>

//       {/* Key Metrics Grid */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         {/* Lifetime Value */}
//         <div className={`p-4 rounded-lg border ${themeClasses.section}`}>
//           <div className="flex items-center gap-2 mb-2">
//             <FiDollarSign size={18} className="text-green-500" />
//             <h3 className={`text-sm font-medium ${themeClasses.subheading}`}>Lifetime Value</h3>
//           </div>
//           <p className={`text-xl font-bold ${themeClasses.heading}`}>
//             {formatCurrency(client.lifetime_value)}
//           </p>
//           <p className={`text-xs ${themeClasses.muted}`}>
//             {client.monthly_recurring_revenue > 0 && (
//               <>MRR: {formatCurrency(client.monthly_recurring_revenue)}</>
//             )}
//           </p>
//         </div>

//         {/* Churn Risk */}
//         <div className={`p-4 rounded-lg border ${themeClasses.section}`}>
//           <div className="flex items-center gap-2 mb-2">
//             <RiskIcon size={18} className={`text-${riskLevel.color}-500`} />
//             <h3 className={`text-sm font-medium ${themeClasses.subheading}`}>Churn Risk</h3>
//           </div>
//           <p className={`text-xl font-bold text-${riskLevel.color}-500`}>
//             {client.churn_risk_score.toFixed(1)}/10
//           </p>
//           <p className={`text-xs ${themeClasses.muted}`}>{riskLevel.label} Risk</p>
//         </div>

//         {/* Engagement Score */}
//         <div className={`p-4 rounded-lg border ${themeClasses.section}`}>
//           <div className="flex items-center gap-2 mb-2">
//             <FiTrendingUp size={18} className="text-blue-500" />
//             <h3 className={`text-sm font-medium ${themeClasses.subheading}`}>Engagement</h3>
//           </div>
//           <p className={`text-xl font-bold ${
//             client.engagement_score >= 7 ? 'text-green-500' :
//             client.engagement_score >= 4 ? 'text-yellow-500' :
//             'text-red-500'
//           }`}>
//             {client.engagement_score.toFixed(1)}/10
//           </p>
//           <p className={`text-xs ${themeClasses.muted}`}>
//             {client.engagement_score >= 7 ? 'Highly Engaged' :
//              client.engagement_score >= 4 ? 'Moderately Engaged' :
//              'Low Engagement'}
//           </p>
//         </div>

//         {/* Days Active */}
//         <div className={`p-4 rounded-lg border ${themeClasses.section}`}>
//           <div className="flex items-center gap-2 mb-2">
//             <FiClock size={18} className="text-purple-500" />
//             <h3 className={`text-sm font-medium ${themeClasses.subheading}`}>Customer Since</h3>
//           </div>
//           <p className={`text-xl font-bold ${themeClasses.heading}`}>
//             {daysActive} days
//           </p>
//           <p className={`text-xs ${themeClasses.muted}`}>
//             Since {new Date(client.customer_since).toLocaleDateString()}
//           </p>
//         </div>
//       </div>

//       {/* Detailed Information Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Left Column */}
//         <div className="space-y-6">
//           {/* Financial Information */}
//           <div className={`p-5 rounded-lg border ${themeClasses.section}`}>
//             <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${themeClasses.heading}`}>
//               <FiDollarSign />
//               Financial Information
//             </h3>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <p className={`text-sm ${themeClasses.muted}`}>Avg Monthly Spend</p>
//                 <p className={`font-medium ${themeClasses.heading}`}>
//                   {formatCurrency(client.avg_monthly_spend)}
//                 </p>
//               </div>
//               <div>
//                 <p className={`text-sm ${themeClasses.muted}`}>Revenue Segment</p>
//                 <p className={`font-medium capitalize ${themeClasses.heading}`}>
//                   {client.revenue_segment_display}
//                 </p>
//               </div>
//               <div>
//                 <p className={`text-sm ${themeClasses.muted}`}>Last Payment</p>
//                 <p className={`font-medium ${themeClasses.heading}`}>
//                   {client.last_payment_formatted || 'No payments'}
//                 </p>
//               </div>
//               <div>
//                 <p className={`text-sm ${themeClasses.muted}`}>Days Since Payment</p>
//                 <p className={`font-medium ${
//                   client.days_since_last_payment > 14 ? 'text-red-500' :
//                   client.days_since_last_payment > 7 ? 'text-yellow-500' :
//                   themeClasses.heading
//                 }`}>
//                   {client.days_since_last_payment} days
//                 </p>
//               </div>
//               {client.commission_balance > 0 && (
//                 <>
//                   <div>
//                     <p className={`text-sm ${themeClasses.muted}`}>Commission Balance</p>
//                     <p className="font-medium text-green-500">
//                       {formatCurrency(client.commission_balance)}
//                     </p>
//                   </div>
//                   <div>
//                     <p className={`text-sm ${themeClasses.muted}`}>Total Earned</p>
//                     <p className="font-medium text-blue-500">
//                       {formatCurrency(client.total_commission_earned)}
//                     </p>
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>

//           {/* Usage Information */}
//           <div className={`p-5 rounded-lg border ${themeClasses.section}`}>
//             <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${themeClasses.heading}`}>
//               <FiActivity />
//               Usage Information
//             </h3>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <p className={`text-sm ${themeClasses.muted}`}>Total Data Used</p>
//                 <p className={`font-medium ${themeClasses.heading}`}>
//                   {client.total_data_used_formatted}
//                 </p>
//               </div>
//               <div>
//                 <p className={`text-sm ${themeClasses.muted}`}>Avg Monthly Data</p>
//                 <p className={`font-medium ${themeClasses.heading}`}>
//                   {client.avg_monthly_data_formatted}
//                 </p>
//               </div>
//               <div>
//                 <p className={`text-sm ${themeClasses.muted}`}>Usage Pattern</p>
//                 <p className={`font-medium capitalize ${themeClasses.heading}`}>
//                   {client.usage_pattern_display}
//                 </p>
//               </div>
//               <div>
//                 <p className={`text-sm ${themeClasses.muted}`}>Peak Usage Hour</p>
//                 <p className={`font-medium ${themeClasses.heading}`}>
//                   {client.peak_usage_hour ? `${client.peak_usage_hour}:00` : 'N/A'}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right Column */}
//         <div className="space-y-6">
//           {/* Behavior & Insights */}
//           <div className={`p-5 rounded-lg border ${themeClasses.section}`}>
//             <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${themeClasses.heading}`}>
//               <FiBarChart2 />
//               Behavior & Insights
//             </h3>
            
//             {/* Behavior Tags */}
//             {client.behavior_tags && client.behavior_tags.length > 0 && (
//               <div className="mb-4">
//                 <p className={`text-sm ${themeClasses.muted} mb-2`}>Behavior Tags</p>
//                 <div className="flex flex-wrap gap-2">
//                   {client.behavior_tags.map((tag, index) => (
//                     <span
//                       key={index}
//                       className={`px-3 py-1 rounded-full text-sm capitalize ${
//                         theme === 'dark'
//                           ? 'bg-gray-700 text-gray-300'
//                           : 'bg-gray-200 text-gray-700'
//                       }`}
//                     >
//                       {tag.replace('_', ' ')}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Insights */}
//             {client.insights && client.insights.length > 0 && (
//               <div className="space-y-3">
//                 <p className={`text-sm ${themeClasses.muted}`}>Insights</p>
//                 {client.insights.slice(0, 3).map((insight, index) => (
//                   <div
//                     key={index}
//                     className={`p-3 rounded-lg ${
//                       insight.priority === 'critical'
//                         ? 'bg-red-900/20 border border-red-800/30'
//                         : insight.priority === 'high'
//                         ? 'bg-orange-900/20 border border-orange-800/30'
//                         : 'bg-blue-900/20 border border-blue-800/30'
//                     }`}
//                   >
//                     <p className="font-medium text-sm mb-1">{insight.title}</p>
//                     <p className="text-xs opacity-80">{insight.description}</p>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Preferences & Settings */}
//           <div className={`p-5 rounded-lg border ${themeClasses.section}`}>
//             <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${themeClasses.heading}`}>
//               <FiTag />
//               Preferences
//             </h3>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <p className={`text-sm ${themeClasses.muted}`}>Preferred Payment</p>
//                 <p className={`font-medium ${themeClasses.heading}`}>
//                   {client.preferred_payment_method}
//                 </p>
//               </div>
//               <div>
//                 <p className={`text-sm ${themeClasses.muted}`}>Primary Device</p>
//                 <p className={`font-medium ${themeClasses.heading}`}>
//                   {client.primary_device}
//                 </p>
//               </div>
//               {client.location && client.location.address && (
//                 <div className="col-span-2">
//                   <p className={`text-sm ${themeClasses.muted}`}>Location</p>
//                   <p className={`font-medium ${themeClasses.heading}`}>
//                     {client.location.address}
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Next Best Offer */}
//       {client.next_best_offer && Object.keys(client.next_best_offer).length > 0 && (
//         <div className={`p-5 rounded-lg border ${
//           theme === 'dark'
//             ? 'bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-800'
//             : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'
//         }`}>
//           <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${themeClasses.heading}`}>
//             <FiStar className="text-yellow-500" />
//             Recommended Next Best Offer
//           </h3>
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//             <div>
//               <p className={`font-medium mb-1 ${themeClasses.heading}`}>
//                 {client.next_best_offer.name}
//               </p>
//               <p className={`text-sm ${themeClasses.subheading}`}>
//                 {client.next_best_offer.description}
//               </p>
//               <div className="flex items-center gap-2 mt-2">
//                 <span className={`px-2 py-1 rounded text-xs font-medium ${
//                   client.next_best_offer.priority === 'critical'
//                     ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
//                     : client.next_best_offer.priority === 'high'
//                     ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
//                     : client.next_best_offer.priority === 'medium'
//                     ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
//                     : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
//                 }`}>
//                   {client.next_best_offer.priority} priority
//                 </span>
//                 <span className={`text-sm ${themeClasses.muted}`}>
//                   Value: {client.next_best_offer.value}
//                 </span>
//               </div>
//             </div>
//             <button className={`px-6 py-2 rounded-lg font-medium whitespace-nowrap ${
//               theme === 'dark'
//                 ? 'bg-purple-600 hover:bg-purple-700 text-white'
//                 : 'bg-purple-500 hover:bg-purple-600 text-white'
//             }`}>
//               Apply Offer
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ClientProfile;












// components/ClientManagement/ClientProfile.jsx
import React, { useState } from 'react';
import {
  FiUser,
  FiPhone,
  FiMail,
  FiCalendar,
  FiDollarSign,
  FiActivity,
  FiTrendingUp,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiMapPin,
  FiCreditCard,
  FiBarChart2,
  FiTag,
  FiMessageSquare,
  FiGlobe,
  FiClock,
  FiStar,
  FiShield
} from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import ClientService from '../ClientManagement/services/ClientService'
import { getThemeClasses } from '../ServiceManagement/Shared/components'

const ClientProfile = ({ client, onUpdate, theme }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const themeClasses = getThemeClasses(theme);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Get risk level
  const getRiskLevel = (score) => {
    if (score >= 7) return { label: 'High', color: 'red', icon: FiAlertCircle };
    if (score >= 4) return { label: 'Medium', color: 'yellow', icon: FiAlertCircle };
    return { label: 'Low', color: 'green', icon: FiCheckCircle };
  };

  // Get tier color
  const getTierColor = (tier) => {
    const colors = {
      vip: 'text-purple-500',
      diamond: 'text-blue-500',
      platinum: 'text-emerald-500',
      gold: 'text-yellow-500',
      silver: 'text-gray-400',
      bronze: 'text-orange-700',
      new: 'text-gray-500'
    };
    return colors[tier] || 'text-gray-500';
  };

  // Calculate days active
  const calculateDaysActive = (customerSince) => {
    if (!customerSince) return 0;
    const created = new Date(customerSince);
    const today = new Date();
    const diffTime = Math.abs(today - created);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const riskLevel = getRiskLevel(client.churn_risk_score);
  const daysActive = calculateDaysActive(client.customer_since);
  const RiskIcon = riskLevel.icon;

  // Handle edit save
  const handleSaveEdit = async () => {
    try {
      setIsSaving(true);
      const result = await ClientService.updateClient(client.id, editedData);
      if (result.success) {
        onUpdate(client.id, editedData);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle input change for editing
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header Section - Responsive */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-start gap-4 mb-4">
            <div className={`${themeClasses.bg.secondary} p-3 rounded-full`}>
              <FiUser size={24} />
            </div>
            <div>
              <h2 className={`text-2xl font-bold mb-1 ${themeClasses.text.primary}`}>
                {client.client_name}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className={`font-medium capitalize ${getTierColor(client.tier)}`}>
                  {client.tier_display}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  client.status === 'active' ? themeClasses.bg.success :
                  client.status === 'inactive' ? themeClasses.bg.secondary :
                  themeClasses.bg.danger
                }`}>
                  {client.status_display}
                </span>
                {client.is_marketer && (
                  <span className={`px-2 py-1 rounded text-xs font-medium ${themeClasses.bg.info}`}>
                    Marketer ({client.marketer_tier})
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <FiPhone size={14} className={themeClasses.text.secondary} />
                  <span className={themeClasses.text.secondary}>{client.phone_display}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiGlobe size={14} className={themeClasses.text.secondary} />
                  <span className={themeClasses.text.secondary}>{client.connection_type_display}</span>
                </div>
                {client.pppoe_username && (
                  <div className="flex items-center gap-2">
                    <FiShield size={14} className={themeClasses.text.secondary} />
                    <span className={themeClasses.text.secondary}>PPPoE: {client.pppoe_username}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`${themeClasses.button.secondary} px-4 py-2 rounded-lg font-medium`}
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
          {isEditing && (
            <button
              onClick={handleSaveEdit}
              disabled={isSaving}
              className={`${themeClasses.button.primary} px-4 py-2 rounded-lg font-medium`}
            >
              {isSaving ? <FaSpinner className="animate-spin" /> : 'Save'}
            </button>
          )}
        </div>
      </div>
      {/* Key Metrics Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Lifetime Value */}
        <div className={`p-4 rounded-lg border ${themeClasses.bg.card}`}>
          <div className="flex items-center gap-2 mb-2">
            <FiDollarSign size={18} className="text-green-500" />
            <h3 className={`text-sm font-medium ${themeClasses.text.secondary}`}>Lifetime Value</h3>
          </div>
          <p className={`text-xl font-bold ${themeClasses.text.primary}`}>
            {formatCurrency(client.lifetime_value)}
          </p>
          <p className={`text-xs ${themeClasses.text.secondary}`}>
            {client.monthly_recurring_revenue > 0 && (
              <>MRR: {formatCurrency(client.monthly_recurring_revenue)}</>
            )}
          </p>
        </div>
        {/* Churn Risk */}
        <div className={`p-4 rounded-lg border ${themeClasses.bg.card}`}>
          <div className="flex items-center gap-2 mb-2">
            <RiskIcon size={18} className={`text-${riskLevel.color}-500`} />
            <h3 className={`text-sm font-medium ${themeClasses.text.secondary}`}>Churn Risk</h3>
          </div>
          <p className={`text-xl font-bold text-${riskLevel.color}-500`}>
            {client.churn_risk_score.toFixed(1)}/10
          </p>
          <p className={`text-xs ${themeClasses.text.secondary}`}>{riskLevel.label} Risk</p>
        </div>
        {/* Engagement Score */}
        <div className={`p-4 rounded-lg border ${themeClasses.bg.card}`}>
          <div className="flex items-center gap-2 mb-2">
            <FiTrendingUp size={18} className="text-blue-500" />
            <h3 className={`text-sm font-medium ${themeClasses.text.secondary}`}>Engagement</h3>
          </div>
          <p className={`text-xl font-bold ${
            client.engagement_score >= 7 ? 'text-green-500' :
            client.engagement_score >= 4 ? 'text-yellow-500' :
            'text-red-500'
          }`}>
            {client.engagement_score.toFixed(1)}/10
          </p>
          <p className={`text-xs ${themeClasses.text.secondary}`}>
            {client.engagement_score >= 7 ? 'Highly Engaged' :
             client.engagement_score >= 4 ? 'Moderately Engaged' :
             'Low Engagement'}
          </p>
        </div>
        {/* Days Active */}
        <div className={`p-4 rounded-lg border ${themeClasses.bg.card}`}>
          <div className="flex items-center gap-2 mb-2">
            <FiClock size={18} className="text-purple-500" />
            <h3 className={`text-sm font-medium ${themeClasses.text.secondary}`}>Customer Since</h3>
          </div>
          <p className={`text-xl font-bold ${themeClasses.text.primary}`}>
            {daysActive} days
          </p>
          <p className={`text-xs ${themeClasses.text.secondary}`}>
            Since {new Date(client.customer_since).toLocaleDateString()}
          </p>
        </div>
      </div>
      {/* Detailed Information Grid - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Financial Information */}
          <div className={`p-5 rounded-lg border ${themeClasses.bg.card}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${themeClasses.text.primary}`}>
              <FiDollarSign />
              Financial Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${themeClasses.text.secondary}`}>Avg Monthly Spend</p>
                <p className={`font-medium ${themeClasses.text.primary}`}>
                  {formatCurrency(client.avg_monthly_spend)}
                </p>
              </div>
              <div>
                <p className={`text-sm ${themeClasses.text.secondary}`}>Revenue Segment</p>
                <p className={`font-medium capitalize ${themeClasses.text.primary}`}>
                  {client.revenue_segment_display}
                </p>
              </div>
              <div>
                <p className={`text-sm ${themeClasses.text.secondary}`}>Last Payment</p>
                <p className={`font-medium ${themeClasses.text.primary}`}>
                  {client.last_payment_formatted || 'No payments'}
                </p>
              </div>
              <div>
                <p className={`text-sm ${themeClasses.text.secondary}`}>Days Since Payment</p>
                <p className={`font-medium ${
                  client.days_since_last_payment > 14 ? 'text-red-500' :
                  client.days_since_last_payment > 7 ? 'text-yellow-500' :
                  themeClasses.text.primary
                }`}>
                  {client.days_since_last_payment} days
                </p>
              </div>
              {client.commission_balance > 0 && (
                <>
                  <div>
                    <p className={`text-sm ${themeClasses.text.secondary}`}>Commission Balance</p>
                    <p className="font-medium text-green-500">
                      {formatCurrency(client.commission_balance)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${themeClasses.text.secondary}`}>Total Earned</p>
                    <p className="font-medium text-blue-500">
                      {formatCurrency(client.total_commission_earned)}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
          {/* Usage Information */}
          <div className={`p-5 rounded-lg border ${themeClasses.bg.card}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${themeClasses.text.primary}`}>
              <FiActivity />
              Usage Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${themeClasses.text.secondary}`}>Total Data Used</p>
                <p className={`font-medium ${themeClasses.text.primary}`}>
                  {client.total_data_used_formatted}
                </p>
              </div>
              <div>
                <p className={`text-sm ${themeClasses.text.secondary}`}>Avg Monthly Data</p>
                <p className={`font-medium ${themeClasses.text.primary}`}>
                  {client.avg_monthly_data_formatted}
                </p>
              </div>
              <div>
                <p className={`text-sm ${themeClasses.text.secondary}`}>Usage Pattern</p>
                <p className={`font-medium capitalize ${themeClasses.text.primary}`}>
                  {client.usage_pattern_display}
                </p>
              </div>
              <div>
                <p className={`text-sm ${themeClasses.text.secondary}`}>Peak Usage Hour</p>
                <p className={`font-medium ${themeClasses.text.primary}`}>
                  {client.peak_usage_hour ? `${client.peak_usage_hour}:00` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Right Column */}
        <div className="space-y-6">
          {/* Behavior & Insights */}
          <div className={`p-5 rounded-lg border ${themeClasses.bg.card}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${themeClasses.text.primary}`}>
              <FiBarChart2 />
              Behavior & Insights
            </h3>
            {/* Behavior Tags */}
            {client.behavior_tags && client.behavior_tags.length > 0 && (
              <div className="mb-4">
                <p className={`text-sm ${themeClasses.text.secondary} mb-2`}>Behavior Tags</p>
                <div className="flex flex-wrap gap-2">
                  {client.behavior_tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm capitalize ${themeClasses.bg.secondary}`}
                    >
                      {tag.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {/* Insights */}
            {client.insights && client.insights.length > 0 && (
              <div className="space-y-3">
                <p className={`text-sm ${themeClasses.text.secondary}`}>Insights</p>
                {client.insights.slice(0, 3).map((insight, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      insight.priority === 'critical' ? themeClasses.bg.danger :
                      insight.priority === 'high' ? themeClasses.bg.warning :
                      themeClasses.bg.info
                    }`}
                  >
                    <p className="font-medium text-sm mb-1">{insight.title}</p>
                    <p className="text-xs opacity-80">{insight.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Preferences & Settings */}
          <div className={`p-5 rounded-lg border ${themeClasses.bg.card}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${themeClasses.text.primary}`}>
              <FiTag />
              Preferences
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${themeClasses.text.secondary}`}>Preferred Payment</p>
                <p className={`font-medium ${themeClasses.text.primary}`}>
                  {client.preferred_payment_method}
                </p>
              </div>
              <div>
                <p className={`text-sm ${themeClasses.text.secondary}`}>Primary Device</p>
                <p className={`font-medium ${themeClasses.text.primary}`}>
                  {client.primary_device}
                </p>
              </div>
              {client.location && client.location.address && (
                <div className="col-span-1 sm:col-span-2">
                  <p className={`text-sm ${themeClasses.text.secondary}`}>Location</p>
                  <p className={`font-medium ${themeClasses.text.primary}`}>
                    {client.location.address}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Next Best Offer */}
      {client.next_best_offer && Object.keys(client.next_best_offer).length > 0 && (
        <div className={`p-5 rounded-lg border ${themeClasses.bg.info}`}>
          <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${themeClasses.text.primary}`}>
            <FiStar className="text-yellow-500" />
            Recommended Next Best Offer
          </h3>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className={`font-medium mb-1 ${themeClasses.text.primary}`}>
                {client.next_best_offer.name}
              </p>
              <p className={`text-sm ${themeClasses.text.secondary}`}>
                {client.next_best_offer.description}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  client.next_best_offer.priority === 'critical' ? themeClasses.bg.danger :
                  client.next_best_offer.priority === 'high' ? themeClasses.bg.warning :
                  themeClasses.bg.secondary
                }`}>
                  {client.next_best_offer.priority} priority
                </span>
                <span className={`text-sm ${themeClasses.text.secondary}`}>
                  Value: {client.next_best_offer.value}
                </span>
              </div>
            </div>
            <button className={`${themeClasses.button.primary} px-6 py-2 rounded-lg font-medium whitespace-nowrap`}>
              Apply Offer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientProfile;