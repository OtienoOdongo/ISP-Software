


// import React, { useState } from 'react';
// import {
//   User, Phone, Calendar, DollarSign, Activity,
//   TrendingUp, AlertCircle, CheckCircle, XCircle,
//   MapPin, CreditCard, BarChart3, Tag, Globe,
//   Clock, Star, Shield, Wifi, HardDrive
// } from 'lucide-react';
// import { FaSpinner } from 'react-icons/fa';
// import { getThemeClasses } from '../ServiceManagement/Shared/components';
// import ClientAPI from './constants/clientConstants'
// import { formatCurrency, formatDate } from './utils/formatters'

// const ClientProfile = ({ client, onUpdate, theme }) => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedData, setEditedData] = useState({});
//   const [isSaving, setIsSaving] = useState(false);
//   const themeClasses = getThemeClasses(theme);

//   // Get risk level
//   const getRiskLevel = (score) => {
//     if (score >= 7) return { label: 'High', color: 'text-red-500', bg: themeClasses.bg.danger };
//     if (score >= 4) return { label: 'Medium', color: 'text-yellow-500', bg: themeClasses.bg.warning };
//     return { label: 'Low', color: 'text-green-500', bg: themeClasses.bg.success };
//   };

//   // Get tier color
//   const getTierColor = (tier) => {
//     const colors = {
//       vip: 'text-purple-500',
//       diamond: 'text-blue-500',
//       platinum: 'text-emerald-500',
//       gold: 'text-yellow-500',
//       silver: 'text-gray-400',
//       bronze: 'text-orange-500',
//       new: 'text-gray-500'
//     };
//     return colors[tier] || 'text-gray-500';
//   };

//   // Get status color
//   const getStatusColor = (status) => {
//     const colors = {
//       active: 'text-green-500',
//       inactive: 'text-gray-500',
//       suspended: 'text-red-500',
//       trial: 'text-yellow-500',
//       at_risk: 'text-orange-500',
//       churned: 'text-gray-400'
//     };
//     return colors[status] || 'text-gray-500';
//   };

//   const riskLevel = getRiskLevel(client.churn_risk_score);

//   // Handle save edit
//   const handleSaveEdit = async () => {
//     try {
//       setIsSaving(true);
//       const result = await ClientAPI.updateClient(client.id, editedData);
//       if (result.success) {
//         onUpdate(client.id, editedData);
//         setIsEditing(false);
//       }
//     } catch (error) {
//       console.error('Failed to update profile:', error);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   // Handle input change
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setEditedData(prev => ({ ...prev, [name]: value }));
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header Section */}
//       <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
//         <div className="flex items-start gap-4">
//           <div className={`p-3 rounded-full ${themeClasses.bg.secondary}`}>
//             <User size={32} />
//           </div>
//           <div>
//             <h2 className={`text-2xl font-bold mb-2 ${themeClasses.text.primary}`}>
//               {client.client_name || client.username}
//             </h2>
//             <div className="flex flex-wrap items-center gap-3 mb-2">
//               <span className={`font-medium capitalize ${getTierColor(client.tier)}`}>
//                 {client.tier_display}
//               </span>
//               <span className={`font-medium ${getStatusColor(client.status)}`}>
//                 • {client.status_display}
//               </span>
//               {client.is_marketer && (
//                 <span className={`px-2 py-1 rounded text-xs font-medium ${themeClasses.bg.info}`}>
//                   Marketer ({client.marketer_tier})
//                 </span>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Edit Toggle */}
//         <button
//           onClick={() => setIsEditing(!isEditing)}
//           className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.secondary}`}
//         >
//           {isEditing ? 'Cancel Edit' : 'Edit Profile'}
//         </button>
//       </div>

//       {/* Key Metrics Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
//         {/* Lifetime Value */}
//         <div className={`p-4 rounded-lg border ${themeClasses.bg.card}`}>
//           <div className="flex items-center gap-2 mb-2">
//             <DollarSign size={18} className="text-green-500" />
//             <h3 className={`text-sm font-medium ${themeClasses.text.secondary}`}>Lifetime Value</h3>
//           </div>
//           <p className={`text-xl font-bold ${themeClasses.text.primary}`}>
//             {formatCurrency(client.lifetime_value)}
//           </p>
//           <p className={`text-xs ${themeClasses.text.secondary}`}>
//             MRR: {formatCurrency(client.monthly_recurring_revenue)}
//           </p>
//         </div>

//         {/* Churn Risk */}
//         <div className={`p-4 rounded-lg border ${themeClasses.bg.card}`}>
//           <div className="flex items-center gap-2 mb-2">
//             <AlertCircle size={18} className={riskLevel.color} />
//             <h3 className={`text-sm font-medium ${themeClasses.text.secondary}`}>Churn Risk</h3>
//           </div>
//           <p className={`text-xl font-bold ${riskLevel.color}`}>
//             {client.churn_risk_score?.toFixed(1)}/10
//           </p>
//           <p className={`text-xs ${themeClasses.text.secondary}`}>{riskLevel.label} Risk</p>
//         </div>

//         {/* Engagement Score */}
//         <div className={`p-4 rounded-lg border ${themeClasses.bg.card}`}>
//           <div className="flex items-center gap-2 mb-2">
//             <Activity size={18} className="text-blue-500" />
//             <h3 className={`text-sm font-medium ${themeClasses.text.secondary}`}>Engagement</h3>
//           </div>
//           <p className={`text-xl font-bold ${
//             client.engagement_score >= 7 ? 'text-green-500' :
//             client.engagement_score >= 4 ? 'text-yellow-500' :
//             'text-red-500'
//           }`}>
//             {client.engagement_score?.toFixed(1)}/10
//           </p>
//           <p className={`text-xs ${themeClasses.text.secondary}`}>
//             {client.engagement_score >= 7 ? 'Highly Engaged' :
//              client.engagement_score >= 4 ? 'Moderately Engaged' :
//              'Low Engagement'}
//           </p>
//         </div>

//         {/* Satisfaction Score */}
//         <div className={`p-4 rounded-lg border ${themeClasses.bg.card}`}>
//           <div className="flex items-center gap-2 mb-2">
//             <Star size={18} className="text-yellow-500" />
//             <h3 className={`text-sm font-medium ${themeClasses.text.secondary}`}>Satisfaction</h3>
//           </div>
//           <p className={`text-xl font-bold ${
//             client.satisfaction_score >= 7 ? 'text-green-500' :
//             client.satisfaction_score >= 4 ? 'text-yellow-500' :
//             'text-red-500'
//           }`}>
//             {client.satisfaction_score?.toFixed(1)}/10
//           </p>
//           <p className={`text-xs ${themeClasses.text.secondary}`}>
//             {client.satisfaction_score >= 7 ? 'Satisfied' :
//              client.satisfaction_score >= 4 ? 'Neutral' :
//              'Unsatisfied'}
//           </p>
//         </div>
//       </div>

//       {/* Detailed Information Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Left Column - Personal Info */}
//         <div className={`p-5 rounded-lg border ${themeClasses.bg.card}`}>
//           <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${themeClasses.text.primary}`}>
//             <User size={18} />
//             Personal Information
//           </h3>
//           <div className="space-y-3">
//             <div className="flex items-center gap-3">
//               <Phone size={16} className={themeClasses.text.secondary} />
//               <span className={themeClasses.text.primary}>{client.phone_display}</span>
//             </div>
//             <div className="flex items-center gap-3">
//               <Globe size={16} className={themeClasses.text.secondary} />
//               <span className={themeClasses.text.primary}>{client.connection_type_display}</span>
//             </div>
//             {client.location && (
//               <div className="flex items-center gap-3">
//                 <MapPin size={16} className={themeClasses.text.secondary} />
//                 <span className={themeClasses.text.primary}>
//                   {typeof client.location === 'string' ? client.location : client.location.address || 'N/A'}
//                 </span>
//               </div>
//             )}
//             <div className="flex items-center gap-3">
//               <Calendar size={16} className={themeClasses.text.secondary} />
//               <span className={themeClasses.text.primary}>
//                 Customer since: {formatDate(client.customer_since, 'medium')}
//               </span>
//             </div>
//           </div>

//           {client.is_pppoe_client && client.pppoe_username && (
//             <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
//               <h4 className={`font-medium mb-2 flex items-center gap-2 ${themeClasses.text.primary}`}>
//                 <Shield size={16} />
//                 PPPoE Credentials
//               </h4>
//               <div className="space-y-2">
//                 <div className="flex items-center gap-2">
//                   <span className={`text-sm ${themeClasses.text.secondary}`}>Username:</span>
//                   <span className="text-sm font-mono">{client.pppoe_username}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <span className={`text-sm ${themeClasses.text.secondary}`}>Password:</span>
//                   <span className="text-sm font-mono">••••••••</span>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Right Column - Financial Info */}
//         <div className={`p-5 rounded-lg border ${themeClasses.bg.card}`}>
//           <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${themeClasses.text.primary}`}>
//             <CreditCard size={18} />
//             Financial Information
//           </h3>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <p className={`text-sm ${themeClasses.text.secondary}`}>Avg Monthly Spend</p>
//               <p className={`font-medium ${themeClasses.text.primary}`}>
//                 {formatCurrency(client.avg_monthly_spend)}
//               </p>
//             </div>
//             <div>
//               <p className={`text-sm ${themeClasses.text.secondary}`}>Revenue Segment</p>
//               <p className={`font-medium capitalize ${themeClasses.text.primary}`}>
//                 {client.revenue_segment_display}
//               </p>
//             </div>
//             <div>
//               <p className={`text-sm ${themeClasses.text.secondary}`}>Last Payment</p>
//               <p className={`font-medium ${themeClasses.text.primary}`}>
//                 {client.last_payment_formatted || 'No payments'}
//               </p>
//             </div>
//             <div>
//               <p className={`text-sm ${themeClasses.text.secondary}`}>Days Since Payment</p>
//               <p className={`font-medium ${
//                 client.days_since_last_payment > 14 ? 'text-red-500' :
//                 client.days_since_last_payment > 7 ? 'text-yellow-500' :
//                 themeClasses.text.primary
//               }`}>
//                 {client.days_since_last_payment} days
//               </p>
//             </div>
//             {client.commission_balance > 0 && (
//               <>
//                 <div>
//                   <p className={`text-sm ${themeClasses.text.secondary}`}>Commission Balance</p>
//                   <p className="font-medium text-green-500">
//                     {formatCurrency(client.commission_balance)}
//                   </p>
//                 </div>
//                 <div>
//                   <p className={`text-sm ${themeClasses.text.secondary}`}>Total Earned</p>
//                   <p className="font-medium text-blue-500">
//                     {formatCurrency(client.total_commission_earned)}
//                   </p>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>

//         {/* Usage Information */}
//         <div className={`p-5 rounded-lg border ${themeClasses.bg.card}`}>
//           <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${themeClasses.text.primary}`}>
//             <HardDrive size={18} />
//             Usage Information
//           </h3>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <p className={`text-sm ${themeClasses.text.secondary}`}>Total Data Used</p>
//               <p className={`font-medium ${themeClasses.text.primary}`}>
//                 {client.total_data_used_formatted}
//               </p>
//             </div>
//             <div>
//               <p className={`text-sm ${themeClasses.text.secondary}`}>Avg Monthly Data</p>
//               <p className={`font-medium ${themeClasses.text.primary}`}>
//                 {client.avg_monthly_data_formatted}
//               </p>
//             </div>
//             <div>
//               <p className={`text-sm ${themeClasses.text.secondary}`}>Usage Pattern</p>
//               <p className={`font-medium capitalize ${themeClasses.text.primary}`}>
//                 {client.usage_pattern_display}
//               </p>
//             </div>
//             <div>
//               <p className={`text-sm ${themeClasses.text.secondary}`}>Peak Usage Hour</p>
//               <p className={`font-medium ${themeClasses.text.primary}`}>
//                 {client.peak_usage_hour ? `${client.peak_usage_hour}:00` : 'N/A'}
//               </p>
//             </div>
//             <div>
//               <p className={`text-sm ${themeClasses.text.secondary}`}>Hotspot Sessions</p>
//               <p className={`font-medium ${themeClasses.text.primary}`}>
//                 {client.hotspot_sessions || 0}
//               </p>
//             </div>
//             <div>
//               <p className={`text-sm ${themeClasses.text.secondary}`}>Devices</p>
//               <p className={`font-medium ${themeClasses.text.primary}`}>
//                 {client.devices_count || 1}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Preferences */}
//         <div className={`p-5 rounded-lg border ${themeClasses.bg.card}`}>
//           <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${themeClasses.text.primary}`}>
//             <Tag size={18} />
//             Preferences
//           </h3>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <p className={`text-sm ${themeClasses.text.secondary}`}>Payment Method</p>
//               <p className={`font-medium capitalize ${themeClasses.text.primary}`}>
//                 {client.preferred_payment_method}
//               </p>
//             </div>
//             <div>
//               <p className={`text-sm ${themeClasses.text.secondary}`}>Primary Device</p>
//               <p className={`font-medium capitalize ${themeClasses.text.primary}`}>
//                 {client.primary_device}
//               </p>
//             </div>
//           </div>

//           {/* Behavior Tags */}
//           {client.behavior_tags && client.behavior_tags.length > 0 && (
//             <div className="mt-4">
//               <p className={`text-sm ${themeClasses.text.secondary} mb-2`}>Behavior Tags</p>
//               <div className="flex flex-wrap gap-2">
//                 {client.behavior_tags.map((tag, index) => (
//                   <span
//                     key={index}
//                     className={`px-2 py-1 rounded-full text-xs capitalize ${themeClasses.bg.secondary}`}
//                   >
//                     {tag.replace('_', ' ')}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Insights */}
//       {client.insights && client.insights.length > 0 && (
//         <div className={`p-5 rounded-lg border ${themeClasses.bg.info}`}>
//           <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${themeClasses.text.primary}`}>
//             <BarChart3 size={18} />
//             Insights
//           </h3>
//           <div className="space-y-3">
//             {client.insights.slice(0, 3).map((insight, index) => (
//               <div key={index} className="flex items-start gap-3">
//                 <span className="text-lg">{insight.icon || '💡'}</span>
//                 <div>
//                   <p className="font-medium text-sm">{insight.title}</p>
//                   <p className="text-sm opacity-80">{insight.description}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Next Best Offer */}
//       {client.next_best_offer && Object.keys(client.next_best_offer).length > 0 && (
//         <div className={`p-5 rounded-lg border ${themeClasses.bg.success}`}>
//           <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${themeClasses.text.primary}`}>
//             <Star className="text-yellow-500" size={18} />
//             Recommended Next Best Offer
//           </h3>
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//             <div>
//               <p className={`font-medium mb-1 ${themeClasses.text.primary}`}>
//                 {client.next_best_offer.name}
//               </p>
//               <p className={`text-sm ${themeClasses.text.secondary}`}>
//                 {client.next_best_offer.description}
//               </p>
//             </div>
//             <button className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${themeClasses.button.primary}`}>
//               Apply Offer
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ClientProfile;








import React, { useState } from 'react';
import {
  User, Phone, Calendar, DollarSign, Activity,
  AlertCircle, CheckCircle, XCircle,
  MapPin, CreditCard, BarChart3, Tag, Globe,
  Clock, Star, Shield, Wifi, HardDrive
} from 'lucide-react';
import { FaSpinner } from 'react-icons/fa';
import { getThemeClasses } from '../ServiceManagement/Shared/components';
import ClientService from './services/ClientService';
import { formatCurrency, formatDate } from './utils/formatters';

const ClientProfile = ({ client, onUpdate, theme }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const themeClasses = getThemeClasses(theme);

  const getRiskLevel = (score) => {
    if (score >= 7) return { label: 'High', color: 'text-red-500', bg: themeClasses.bg.danger };
    if (score >= 4) return { label: 'Medium', color: 'text-yellow-500', bg: themeClasses.bg.warning };
    return { label: 'Low', color: 'text-green-500', bg: themeClasses.bg.success };
  };

  const getTierColor = (tier) => {
    const colors = {
      vip: 'text-purple-500',
      diamond: 'text-blue-500',
      platinum: 'text-emerald-500',
      gold: 'text-yellow-500',
      silver: 'text-gray-400',
      bronze: 'text-orange-500',
      new: 'text-gray-500'
    };
    return colors[tier] || 'text-gray-500';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-green-500',
      inactive: 'text-gray-500',
      suspended: 'text-red-500',
      trial: 'text-yellow-500',
      at_risk: 'text-orange-500',
      churned: 'text-gray-400'
    };
    return colors[status] || 'text-gray-500';
  };

  const riskLevel = getRiskLevel(client.churn_risk_score);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${themeClasses.bg.secondary}`}>
            <User size={32} />
          </div>
          <div>
            <h2 className={`text-2xl font-bold mb-2 ${themeClasses.text.primary}`}>
              {client.username}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className={`font-medium capitalize ${getTierColor(client.tier)}`}>
                {client.tier_display}
              </span>
              <span className={`font-medium ${getStatusColor(client.status)}`}>
                • {client.status_display}
              </span>
              {client.is_marketer && (
                <span className={`px-2 py-1 rounded text-xs font-medium ${themeClasses.bg.info}`}>
                  Marketer
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.secondary}`}
        >
          {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg border ${themeClasses.bg.card}`}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={18} className="text-green-500" />
            <h3 className={`text-sm font-medium ${themeClasses.text.secondary}`}>Lifetime Value</h3>
          </div>
          <p className={`text-xl font-bold ${themeClasses.text.primary}`}>
            {formatCurrency(client.lifetime_value)}
          </p>
          <p className={`text-xs ${themeClasses.text.secondary}`}>
            MRR: {formatCurrency(client.monthly_recurring_revenue)}
          </p>
        </div>

        <div className={`p-4 rounded-lg border ${themeClasses.bg.card}`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={18} className={riskLevel.color} />
            <h3 className={`text-sm font-medium ${themeClasses.text.secondary}`}>Churn Risk</h3>
          </div>
          <p className={`text-xl font-bold ${riskLevel.color}`}>
            {client.churn_risk_score?.toFixed(1)}/10
          </p>
          <p className={`text-xs ${themeClasses.text.secondary}`}>{riskLevel.label} Risk</p>
        </div>

        <div className={`p-4 rounded-lg border ${themeClasses.bg.card}`}>
          <div className="flex items-center gap-2 mb-2">
            <Activity size={18} className="text-blue-500" />
            <h3 className={`text-sm font-medium ${themeClasses.text.secondary}`}>Engagement</h3>
          </div>
          <p className={`text-xl font-bold ${
            client.engagement_score >= 7 ? 'text-green-500' :
            client.engagement_score >= 4 ? 'text-yellow-500' :
            'text-red-500'
          }`}>
            {client.engagement_score?.toFixed(1)}/10
          </p>
          <p className={`text-xs ${themeClasses.text.secondary}`}>
            {client.engagement_score >= 7 ? 'Highly Engaged' :
             client.engagement_score >= 4 ? 'Moderately Engaged' :
             'Low Engagement'}
          </p>
        </div>

        <div className={`p-4 rounded-lg border ${themeClasses.bg.card}`}>
          <div className="flex items-center gap-2 mb-2">
            <Star size={18} className="text-yellow-500" />
            <h3 className={`text-sm font-medium ${themeClasses.text.secondary}`}>Satisfaction</h3>
          </div>
          <p className={`text-xl font-bold ${
            client.satisfaction_score >= 7 ? 'text-green-500' :
            client.satisfaction_score >= 4 ? 'text-yellow-500' :
            'text-red-500'
          }`}>
            {client.satisfaction_score?.toFixed(1)}/10
          </p>
          <p className={`text-xs ${themeClasses.text.secondary}`}>
            {client.satisfaction_score >= 7 ? 'Satisfied' :
             client.satisfaction_score >= 4 ? 'Neutral' :
             'Unsatisfied'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-5 rounded-lg border ${themeClasses.bg.card}`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${themeClasses.text.primary}`}>
            <User size={18} />
            Personal Information
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone size={16} className={themeClasses.text.secondary} />
              <span className={themeClasses.text.primary}>{client.phone_display}</span>
            </div>
            <div className="flex items-center gap-3">
              <Globe size={16} className={themeClasses.text.secondary} />
              <span className={themeClasses.text.primary}>{client.connection_type_display}</span>
            </div>
            {client.location && (
              <div className="flex items-center gap-3">
                <MapPin size={16} className={themeClasses.text.secondary} />
                <span className={themeClasses.text.primary}>{client.location}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar size={16} className={themeClasses.text.secondary} />
              <span className={themeClasses.text.primary}>
                Customer since: {formatDate(client.customer_since, 'medium')}
              </span>
            </div>
          </div>

          {client.connection_type === 'pppoe' && client.pppoe_username && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className={`font-medium mb-2 flex items-center gap-2 ${themeClasses.text.primary}`}>
                <Shield size={16} />
                PPPoE Credentials
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${themeClasses.text.secondary}`}>Username:</span>
                  <span className="text-sm font-mono">{client.pppoe_username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${themeClasses.text.secondary}`}>Password:</span>
                  <span className="text-sm font-mono">••••••••</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={`p-5 rounded-lg border ${themeClasses.bg.card}`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${themeClasses.text.primary}`}>
            <CreditCard size={18} />
            Financial Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
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
                {client.days_since_last_payment || 0} days
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

        <div className={`p-5 rounded-lg border ${themeClasses.bg.card}`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${themeClasses.text.primary}`}>
            <HardDrive size={18} />
            Usage Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <p className={`text-sm ${themeClasses.text.secondary}`}>Hotspot Sessions</p>
              <p className={`font-medium ${themeClasses.text.primary}`}>
                {client.hotspot_sessions || 0}
              </p>
            </div>
            <div>
              <p className={`text-sm ${themeClasses.text.secondary}`}>Devices</p>
              <p className={`font-medium ${themeClasses.text.primary}`}>
                {client.devices_count || 1}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-5 rounded-lg border ${themeClasses.bg.card}`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${themeClasses.text.primary}`}>
            <Tag size={18} />
            Preferences
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={`text-sm ${themeClasses.text.secondary}`}>Payment Method</p>
              <p className={`font-medium capitalize ${themeClasses.text.primary}`}>
                {client.preferred_payment_method || 'N/A'}
              </p>
            </div>
            <div>
              <p className={`text-sm ${themeClasses.text.secondary}`}>Primary Device</p>
              <p className={`font-medium capitalize ${themeClasses.text.primary}`}>
                {client.primary_device || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;