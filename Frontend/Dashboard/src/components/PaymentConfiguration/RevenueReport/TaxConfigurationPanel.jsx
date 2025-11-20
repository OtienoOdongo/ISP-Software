


// import React, { useState, useCallback, useMemo, useEffect } from 'react';
// import { 
//   FaPlus, 
//   FaEdit, 
//   FaTrash, 
//   FaSave, 
//   FaTimes, 
//   FaToggleOn, 
//   FaToggleOff, 
//   FaSpinner, 
//   FaExclamationTriangle, 
//   FaChartBar, 
//   FaMoneyBillWave, 
//   FaReceipt, 
//   FaCalendar,
//   FaUser,
//   FaCode } from 'react-icons/fa';
// import { TrendingUp, TrendingDown, BarChart3, Calculator, Clock, Archive, Copy, Download, Upload } from 'lucide-react';
// import { toast } from 'react-hot-toast';
// import api from '../../../api';
// import { EnhancedSelect, ConfirmationModal, AccessTypeBadge } from '../../ServiceManagement/Shared/components';

// // Algorithm: Enhanced tax impact calculation with access type breakdown
// const calculateTaxImpact = (taxes, reconciliationData) => {
//   const impact = {
//     totalRevenueTax: 0,
//     totalExpenseTax: 0,
//     byAccessType: {
//       hotspot: { revenue: 0, expenses: 0, count: 0 },
//       pppoe: { revenue: 0, expenses: 0, count: 0 },
//       both: { revenue: 0, expenses: 0, count: 0 },
//       all: { revenue: 0, expenses: 0, count: 0 }
//     },
//     byTaxType: {},
//     enabledCount: 0,
//     disabledCount: 0,
//     activeCount: 0,
//     archivedCount: 0
//   };

//   taxes.forEach(tax => {
//     // Count by status
//     if (tax.status === 'active' && tax.is_enabled) {
//       impact.activeCount++;
//       impact.enabledCount++;
//     } else if (tax.status === 'inactive') {
//       impact.disabledCount++;
//     } else if (tax.status === 'archived') {
//       impact.archivedCount++;
//     }

//     // Calculate tax impact for active and enabled taxes
//     if (tax.is_active) {
//       const appliesToRevenue = tax.applies_to === 'revenue' || tax.applies_to === 'both';
//       const appliesToExpenses = tax.applies_to === 'expenses' || tax.applies_to === 'both';
      
//       if (appliesToRevenue) {
//         impact.totalRevenueTax += parseFloat(tax.rate) || 0;
//         impact.byAccessType[tax.access_type].revenue += parseFloat(tax.rate) || 0;
//       }
      
//       if (appliesToExpenses) {
//         impact.totalExpenseTax += parseFloat(tax.rate) || 0;
//         impact.byAccessType[tax.access_type].expenses += parseFloat(tax.rate) || 0;
//       }

//       // Count by access type
//       impact.byAccessType[tax.access_type].count++;

//       // Group by tax type
//       if (!impact.byTaxType[tax.tax_type]) {
//         impact.byTaxType[tax.tax_type] = {
//           totalRate: 0,
//           count: 0,
//           revenueRate: 0,
//           expenseRate: 0
//         };
//       }
//       impact.byTaxType[tax.tax_type].totalRate += parseFloat(tax.rate) || 0;
//       impact.byTaxType[tax.tax_type].count++;
      
//       if (appliesToRevenue) impact.byTaxType[tax.tax_type].revenueRate += parseFloat(tax.rate) || 0;
//       if (appliesToExpenses) impact.byTaxType[tax.tax_type].expenseRate += parseFloat(tax.rate) || 0;
//     }
//   });

//   return impact;
// };

// // Algorithm: Enhanced tax configuration validation
// const validateTaxConfiguration = (taxForm) => {
//   const errors = {};

//   if (!taxForm.name?.trim()) {
//     errors.name = 'Tax name is required';
//   } else if (taxForm.name.length > 100) {
//     errors.name = 'Tax name cannot exceed 100 characters';
//   }

//   const rate = parseFloat(taxForm.rate);
//   if (isNaN(rate) || rate < 0 || rate > 100) {
//     errors.rate = 'Tax rate must be a number between 0 and 100';
//   } else if (rate > 50 && !taxForm.requires_approval) {
//     errors.rate = 'Tax rates above 50% require special approval';
//   }

//   // Validate effective dates
//   if (taxForm.effective_to && taxForm.effective_from) {
//     const fromDate = new Date(taxForm.effective_from);
//     const toDate = new Date(taxForm.effective_to);
//     if (toDate < fromDate) {
//       errors.effective_to = 'End date cannot be before start date';
//     }
//   }

//   if (taxForm.effective_to && new Date(taxForm.effective_to) < new Date()) {
//     errors.effective_to = 'End date cannot be in the past';
//   }

//   return errors;
// };

// // Algorithm: Generate intelligent tax recommendations
// const generateTaxRecommendations = (taxes, reconciliationData) => {
//   const recommendations = [];
//   const { access_type_breakdown } = reconciliationData || {};

//   // Check tax coverage by access type
//   const accessTypes = ['hotspot', 'pppoe', 'both'];
//   const activeTaxesByAccessType = {};
  
//   taxes.filter(t => t.is_active).forEach(tax => {
//     if (!activeTaxesByAccessType[tax.access_type]) {
//       activeTaxesByAccessType[tax.access_type] = [];
//     }
//     activeTaxesByAccessType[tax.access_type].push(tax);
//   });

//   accessTypes.forEach(accessType => {
//     const hasCoverage = activeTaxesByAccessType[accessType] || activeTaxesByAccessType.all;
//     const revenue = access_type_breakdown?.[accessType]?.revenue || 0;
    
//     if (!hasCoverage && revenue > 0) {
//       recommendations.push({
//         type: 'coverage_gap',
//         message: `No active taxes for ${accessType} access type with revenue`,
//         priority: revenue > 1000 ? 'high' : 'medium',
//         action: `Configure tax for ${accessType}`,
//         accessType
//       });
//     }
//   });

//   // Check for expired or expiring taxes
//   const now = new Date();
//   const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
//   taxes.filter(tax => tax.effective_to).forEach(tax => {
//     const effectiveTo = new Date(tax.effective_to);
//     if (effectiveTo < now && tax.is_active) {
//       recommendations.push({
//         type: 'expired',
//         message: `Tax "${tax.name}" has expired`,
//         priority: 'medium',
//         action: 'Update or archive tax',
//         taxId: tax.id
//       });
//     } else if (effectiveTo < thirtyDaysFromNow && tax.is_active) {
//       recommendations.push({
//         type: 'expiring_soon',
//         message: `Tax "${tax.name}" expires in less than 30 days`,
//         priority: 'low',
//         action: 'Review expiration date',
//         taxId: tax.id
//       });
//     }
//   });

//   // Check for high tax rates without approval
//   taxes.filter(tax => tax.rate > 50 && !tax.requires_approval && tax.is_active).forEach(tax => {
//     recommendations.push({
//       type: 'high_rate',
//       message: `Tax "${tax.name}" has high rate (${tax.rate}%) without approval flag`,
//       priority: 'medium',
//       action: 'Mark as requiring approval',
//       taxId: tax.id
//     });
//   });

//   // Check for duplicate configurations
//   const taxSignatures = taxes.map(t => 
//     `${t.tax_type}-${t.access_type}-${t.applies_to}-${Math.round(t.rate * 100)}`
//   );
//   const duplicates = taxSignatures.filter((sig, index) => 
//     taxSignatures.indexOf(sig) !== index
//   );
  
//   if (duplicates.length > 0) {
//     recommendations.push({
//       type: 'duplicate',
//       message: 'Potential duplicate tax configurations detected',
//       priority: 'low',
//       action: 'Review tax configurations'
//     });
//   }

//   return recommendations.sort((a, b) => {
//     const priorityOrder = { high: 3, medium: 2, low: 1 };
//     return priorityOrder[b.priority] - priorityOrder[a.priority];
//   });
// };

// // Algorithm: Format date for display
// const formatDate = (dateString) => {
//   if (!dateString) return 'Indefinite';
//   return new Date(dateString).toLocaleDateString('en-US', {
//     year: 'numeric',
//     month: 'short',
//     day: 'numeric'
//   });
// };

// // Algorithm: Check if tax is currently effective
// const isTaxEffective = (tax) => {
//   const now = new Date();
//   const effectiveFrom = new Date(tax.effective_from);
//   const effectiveTo = tax.effective_to ? new Date(tax.effective_to) : null;
  
//   return effectiveFrom <= now && (!effectiveTo || effectiveTo >= now);
// };

// // Enhanced TaxFormModal Component
// const TaxFormModal = ({ 
//   showTaxModal, 
//   setShowTaxModal, 
//   editingTax, 
//   taxForm, 
//   handleTaxInputChange, 
//   handleNumberInput, 
//   formErrors, 
//   setFormErrors, 
//   theme, 
//   cardClass, 
//   inputClass, 
//   handleSaveTax, 
//   loading, 
//   resetTaxForm, 
//   taxTypeOptions, 
//   appliesToOptions, 
//   accessTypeOptions,
//   statusOptions 
// }) => {
//   if (!showTaxModal) return null;

//   return (
//     <div className={`fixed inset-0 z-50 overflow-y-auto ${theme === "dark" ? "bg-gray-900 bg-opacity-75" : "bg-gray-500 bg-opacity-75"}`}>
//       <div className="flex items-center justify-center min-h-screen p-4 sm:p-6">
//         <div className={`${cardClass} w-full max-w-4xl transform transition-all max-h-[90vh] overflow-y-auto`}>
//           <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-inherit z-10">
//             <div className="flex items-center justify-between">
//               <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//                 {editingTax ? 'Edit Tax Configuration' : 'Create New Tax Configuration'}
//               </h3>
//               <button
//                 onClick={() => {
//                   setShowTaxModal(false);
//                   resetTaxForm();
//                 }}
//                 className={`p-1 rounded-full ${theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"}`}
//               >
//                 <FaTimes className="w-5 h-5" />
//               </button>
//             </div>
//           </div>

//           <div className="p-4 sm:p-6 space-y-6">
//             {/* Basic Information */}
//             <div>
//               <h4 className={`text-md font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//                 Basic Information
//               </h4>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                     Tax Name *
//                   </label>
//                   <input
//                     type="text"
//                     value={taxForm.name}
//                     onChange={(e) => handleTaxInputChange('name', e.target.value)}
//                     className={`${inputClass} w-full px-3 py-2 rounded-lg ${
//                       formErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
//                     }`}
//                     placeholder="e.g., VAT, Service Tax, Withholding"
//                     maxLength={100}
//                   />
//                   {formErrors.name && (
//                     <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                     Tax Type
//                   </label>
//                   <EnhancedSelect
//                     value={taxForm.tax_type}
//                     onChange={(value) => handleTaxInputChange('tax_type', value)}
//                     options={taxTypeOptions}
//                     theme={theme}
//                   />
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                     Tax Rate (%) *
//                   </label>
//                   <input
//                     type="text"
//                     value={taxForm.rate}
//                     onChange={(e) => handleNumberInput('rate', e.target.value)}
//                     className={`${inputClass} w-full px-3 py-2 rounded-lg ${
//                       formErrors.rate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
//                     }`}
//                     placeholder="e.g., 16 for 16%"
//                     inputMode="decimal"
//                   />
//                   {formErrors.rate && (
//                     <p className="text-red-500 text-xs mt-1">{formErrors.rate}</p>
//                   )}
//                   {taxForm.rate && !formErrors.rate && (
//                     <p className={`text-xs mt-1 ${
//                       parseFloat(taxForm.rate) > 30 ? 'text-yellow-600' : 'text-green-600'
//                     }`}>
//                       {parseFloat(taxForm.rate) > 30 ? '⚠️ Rate seems high' : '✓ Valid rate'}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                     Applies To
//                   </label>
//                   <EnhancedSelect
//                     value={taxForm.applies_to}
//                     onChange={(value) => handleTaxInputChange('applies_to', value)}
//                     options={appliesToOptions}
//                     theme={theme}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Scope and Settings */}
//             <div>
//               <h4 className={`text-md font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//                 Scope and Settings
//               </h4>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                     Access Type Scope
//                   </label>
//                   <EnhancedSelect
//                     value={taxForm.access_type}
//                     onChange={(value) => handleTaxInputChange('access_type', value)}
//                     options={accessTypeOptions}
//                     theme={theme}
//                   />
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                     Status
//                   </label>
//                   <EnhancedSelect
//                     value={taxForm.status}
//                     onChange={(value) => handleTaxInputChange('status', value)}
//                     options={statusOptions}
//                     theme={theme}
//                   />
//                 </div>

//                 <div className="sm:col-span-2">
//                   <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                     Description
//                   </label>
//                   <textarea
//                     value={taxForm.description}
//                     onChange={(e) => handleTaxInputChange('description', e.target.value)}
//                     className={`${inputClass} w-full px-3 py-2 rounded-lg resize-none`}
//                     placeholder="Optional description or notes"
//                     rows={3}
//                     maxLength={500}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Effective Date Range */}
//             <div>
//               <h4 className={`text-md font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//                 Effective Period
//               </h4>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                     Effective From *
//                   </label>
//                   <input
//                     type="datetime-local"
//                     value={taxForm.effective_from}
//                     onChange={(e) => handleTaxInputChange('effective_from', e.target.value)}
//                     className={`${inputClass} w-full px-3 py-2 rounded-lg ${
//                       formErrors.effective_from ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
//                     }`}
//                   />
//                   {formErrors.effective_from && (
//                     <p className="text-red-500 text-xs mt-1">{formErrors.effective_from}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                     Effective To (Optional)
//                   </label>
//                   <input
//                     type="datetime-local"
//                     value={taxForm.effective_to || ''}
//                     onChange={(e) => handleTaxInputChange('effective_to', e.target.value)}
//                     className={`${inputClass} w-full px-3 py-2 rounded-lg ${
//                       formErrors.effective_to ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
//                     }`}
//                   />
//                   {formErrors.effective_to && (
//                     <p className="text-red-500 text-xs mt-1">{formErrors.effective_to}</p>
//                   )}
//                   <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
//                     Leave empty for indefinite duration
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Configuration Options */}
//             <div>
//               <h4 className={`text-md font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//                 Configuration Options
//               </h4>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div className="space-y-4">
//                   <div className="flex items-center space-x-6">
//                     <div className="flex items-center">
//                       <input
//                         type="checkbox"
//                         id="is_enabled"
//                         checked={taxForm.is_enabled}
//                         onChange={(e) => handleTaxInputChange('is_enabled', e.target.checked)}
//                         className={`h-4 w-4 ${
//                           theme === "dark" 
//                             ? "text-indigo-400 focus:ring-indigo-400 border-gray-600" 
//                             : "text-blue-600 focus:ring-blue-500 border-gray-300"
//                         } rounded`}
//                       />
//                       <label htmlFor="is_enabled" className={`ml-2 block text-sm ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                         Enabled
//                       </label>
//                     </div>

//                     <div className="flex items-center">
//                       <input
//                         type="checkbox"
//                         id="is_included_in_price"
//                         checked={taxForm.is_included_in_price}
//                         onChange={(e) => handleTaxInputChange('is_included_in_price', e.target.checked)}
//                         className={`h-4 w-4 ${
//                           theme === "dark" 
//                             ? "text-indigo-400 focus:ring-indigo-400 border-gray-600" 
//                             : "text-blue-600 focus:ring-blue-500 border-gray-300"
//                         } rounded`}
//                       />
//                       <label htmlFor="is_included_in_price" className={`ml-2 block text-sm ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                         Tax included in price
//                       </label>
//                     </div>
//                   </div>

//                   <div className="flex items-center">
//                     <input
//                       type="checkbox"
//                       id="requires_approval"
//                       checked={taxForm.requires_approval}
//                       onChange={(e) => handleTaxInputChange('requires_approval', e.target.checked)}
//                       className={`h-4 w-4 ${
//                         theme === "dark" 
//                           ? "text-indigo-400 focus:ring-indigo-400 border-gray-600" 
//                           : "text-blue-600 focus:ring-blue-500 border-gray-300"
//                       } rounded`}
//                     />
//                     <label htmlFor="requires_approval" className={`ml-2 block text-sm ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                       Requires special approval
//                     </label>
//                   </div>
//                 </div>
                
//                 {/* Tax Impact Preview */}
//                 <div className={`p-3 rounded-lg border ${
//                   theme === "dark" ? "border-gray-600 bg-gray-700/30" : "border-gray-200 bg-gray-50"
//                 }`}>
//                   <div className="flex items-center space-x-2 mb-2">
//                     <Calculator className="w-4 h-4" />
//                     <span className="text-sm font-medium">Tax Impact Preview</span>
//                   </div>
//                   <div className="space-y-1 text-xs">
//                     <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
//                       KES 1,000 × {taxForm.rate || 0}% = KES {((1000 * (parseFloat(taxForm.rate) || 0)) / 100).toFixed(2)}
//                     </p>
//                     {taxForm.is_included_in_price && (
//                       <p className={theme === "dark" ? "text-green-300" : "text-green-600"}>
//                         Tax included in base price
//                       </p>
//                     )}
//                     {parseFloat(taxForm.rate) > 50 && (
//                       <p className={theme === "dark" ? "text-yellow-300" : "text-yellow-600"}>
//                         ⚠️ High rate - approval required
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Revision Notes */}
//             {editingTax && (
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                   Revision Notes
//                 </label>
//                 <textarea
//                   value={taxForm.revision_notes || ''}
//                   onChange={(e) => handleTaxInputChange('revision_notes', e.target.value)}
//                   className={`${inputClass} w-full px-3 py-2 rounded-lg resize-none`}
//                   placeholder="Describe the changes made in this revision..."
//                   rows={2}
//                   maxLength={255}
//                 />
//               </div>
//             )}

//             {/* Form Validation Summary */}
//             {Object.keys(formErrors).length > 0 && (
//               <div className={`p-3 rounded-lg border ${
//                 theme === "dark" ? "border-red-600 bg-red-900/20" : "border-red-200 bg-red-50"
//               }`}>
//                 <div className="flex items-center space-x-2">
//                   <FaExclamationTriangle className="w-4 h-4 text-red-500" />
//                   <span className="text-sm font-medium text-red-700 dark:text-red-300">
//                     Please fix the following errors:
//                   </span>
//                 </div>
//                 <ul className="text-xs text-red-600 dark:text-red-400 mt-1 list-disc list-inside">
//                   {Object.values(formErrors).map((error, index) => (
//                     <li key={index}>{error}</li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             {/* Validation Success */}
//             {taxForm.name && taxForm.rate && taxForm.effective_from && Object.keys(formErrors).length === 0 && (
//               <div className={`p-3 rounded-lg border ${
//                 theme === "dark" ? "border-green-600 bg-green-900/20" : "border-green-200 bg-green-50"
//               }`}>
//                 <div className="flex items-center space-x-2">
//                   <FaSave className="w-4 h-4 text-green-500" />
//                   <span className="text-sm font-medium text-green-700 dark:text-green-300">
//                     Configuration Valid
//                   </span>
//                 </div>
//                 <p className="text-xs text-green-600 dark:text-green-400 mt-1">
//                   Ready to {editingTax ? 'update' : 'create'} tax configuration
//                 </p>
//               </div>
//             )}
//           </div>

//           <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 sticky bottom-0 bg-inherit">
//             <button
//               onClick={() => {
//                 setShowTaxModal(false);
//                 resetTaxForm();
//               }}
//               className={`px-4 py-2 rounded-lg text-sm font-medium ${
//                 theme === "dark" 
//                   ? "bg-gray-700 hover:bg-gray-600 text-white" 
//                   : "bg-gray-200 hover:bg-gray-300 text-gray-800"
//               }`}
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSaveTax}
//               disabled={loading || !taxForm.name || !taxForm.rate || !taxForm.effective_from || Object.keys(formErrors).length > 0}
//               className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
//             >
//               {loading ? (
//                 <div className="flex items-center">
//                   <FaSpinner className="animate-spin mr-2" />
//                   {editingTax ? 'Updating...' : 'Creating...'}
//                 </div>
//               ) : (
//                 <div className="flex items-center">
//                   <FaSave className="mr-2" />
//                   {editingTax ? 'Update Tax' : 'Create Tax'}
//                 </div>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const TaxConfigurationPanel = ({ reconciliationData, theme, cardClass, textSecondaryClass, inputClass, onRefresh }) => {
//   const [showTaxModal, setShowTaxModal] = useState(false);
//   const [editingTax, setEditingTax] = useState(null);
//   const [deleteTax, setDeleteTax] = useState(null);
//   const [cloneTax, setCloneTax] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [taxesLoading, setTaxesLoading] = useState(false);
//   const [taxConfigurations, setTaxConfigurations] = useState([]);
//   const [formErrors, setFormErrors] = useState({});
//   const [filters, setFilters] = useState({
//     status: 'all',
//     access_type: 'all',
//     tax_type: 'all',
//     search: ''
//   });

//   const [taxForm, setTaxForm] = useState({
//     name: '',
//     tax_type: 'custom',
//     rate: '',
//     description: '',
//     applies_to: 'revenue',
//     access_type: 'all',
//     is_enabled: true,
//     is_included_in_price: false,
//     requires_approval: false,
//     status: 'active',
//     effective_from: new Date().toISOString().slice(0, 16),
//     effective_to: '',
//     revision_notes: ''
//   });

//   // Enhanced options with all tax types from backend
//   const taxTypeOptions = [
//     { value: 'vat', label: 'VAT' },
//     { value: 'withholding', label: 'Withholding Tax' },
//     { value: 'custom', label: 'Custom Tax' },
//     { value: 'sales', label: 'Sales Tax' },
//     { value: 'service', label: 'Service Tax' },
//     { value: 'excise', label: 'Excise Duty' }
//   ];

//   const appliesToOptions = [
//     { value: 'revenue', label: 'Revenue Only' },
//     { value: 'expenses', label: 'Expenses Only' },
//     { value: 'both', label: 'Both Revenue & Expenses' }
//   ];

//   const accessTypeOptions = [
//     { value: 'all', label: 'All Access Types' },
//     { value: 'hotspot', label: 'Hotspot Only' },
//     { value: 'pppoe', label: 'PPPoE Only' },
//     { value: 'both', label: 'Both Access Types' }
//   ];

//   const statusOptions = [
//     { value: 'active', label: 'Active' },
//     { value: 'inactive', label: 'Inactive' },
//     { value: 'archived', label: 'Archived' }
//   ];

//   const statusFilterOptions = [
//     { value: 'all', label: 'All Status' },
//     { value: 'active', label: 'Active Only' },
//     { value: 'inactive', label: 'Inactive Only' },
//     { value: 'archived', label: 'Archived Only' }
//   ];

//   // Algorithm: Enhanced tax configurations fetch with error handling
//   const fetchTaxConfigurations = useCallback(async (retryCount = 0) => {
//     setTaxesLoading(true);
//     try {
//       const params = new URLSearchParams();
//       if (filters.status !== 'all') params.append('status', filters.status);
//       if (filters.access_type !== 'all') params.append('access_type', filters.access_type);
//       if (filters.tax_type !== 'all') params.append('tax_type', filters.tax_type);
//       if (filters.search) params.append('search', filters.search);

//       const response = await api.get(`/api/payments/taxes/?${params}`);
//       setTaxConfigurations(response.data.data || response.data);
//     } catch (error) {
//       console.error('Failed to fetch tax configurations:', error);
//       if (retryCount < 3) {
//         const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
//         setTimeout(() => fetchTaxConfigurations(retryCount + 1), delay);
//       } else {
//         toast.error('Failed to load tax configurations');
//         // Fallback to reconciliation data
//         const { tax_configuration = [] } = reconciliationData || {};
//         setTaxConfigurations(tax_configuration);
//       }
//     } finally {
//       setTaxesLoading(false);
//     }
//   }, [filters, reconciliationData]);

//   useEffect(() => {
//     fetchTaxConfigurations();
//   }, [fetchTaxConfigurations]);

//   // Algorithm: Enhanced tax impact calculation with memoization
//   const taxImpact = useMemo(() => 
//     calculateTaxImpact(taxConfigurations, reconciliationData || {}),
//     [taxConfigurations, reconciliationData]
//   );

//   // Algorithm: Enhanced tax recommendations
//   const taxRecommendations = useMemo(() => 
//     generateTaxRecommendations(taxConfigurations, reconciliationData || {}),
//     [taxConfigurations, reconciliationData]
//   );

//   // Algorithm: Filtered tax configurations
//   const filteredTaxConfigurations = useMemo(() => {
//     return taxConfigurations.filter(tax => {
//       if (filters.status !== 'all' && tax.status !== filters.status) return false;
//       if (filters.access_type !== 'all' && tax.access_type !== filters.access_type) return false;
//       if (filters.tax_type !== 'all' && tax.tax_type !== filters.tax_type) return false;
//       if (filters.search && !tax.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
//       return true;
//     });
//   }, [taxConfigurations, filters]);

//   // Algorithm: Enhanced form input handling with validation
//   const handleTaxInputChange = useCallback((field, value) => {
//     setTaxForm(prev => {
//       const newForm = {
//         ...prev,
//         [field]: value
//       };

//       // Real-time validation
//       const validationErrors = validateTaxConfiguration(newForm);
//       setFormErrors(validationErrors);

//       return newForm;
//     });
//   }, []);

//   // Algorithm: Enhanced number input handling
//   const handleNumberInput = useCallback((field, value) => {
//     // Allow only numbers and decimal point
//     const numericValue = value.replace(/[^0-9.]/g, '');
//     // Ensure only one decimal point
//     const parts = numericValue.split('.');
//     const formattedValue = parts.length > 2 
//       ? parts[0] + '.' + parts.slice(1).join('')
//       : numericValue;
    
//     handleTaxInputChange(field, formattedValue);
//   }, [handleTaxInputChange]);

//   const resetTaxForm = useCallback(() => {
//     setTaxForm({
//       name: '',
//       tax_type: 'custom',
//       rate: '',
//       description: '',
//       applies_to: 'revenue',
//       access_type: 'all',
//       is_enabled: true,
//       is_included_in_price: false,
//       requires_approval: false,
//       status: 'active',
//       effective_from: new Date().toISOString().slice(0, 16),
//       effective_to: '',
//       revision_notes: ''
//     });
//     setFormErrors({});
//     setEditingTax(null);
//   }, []);

//   // Algorithm: Enhanced tax saving with comprehensive validation
//   const handleSaveTax = useCallback(async () => {
//     const validationErrors = validateTaxConfiguration(taxForm);
    
//     if (Object.keys(validationErrors).length > 0) {
//       setFormErrors(validationErrors);
//       Object.values(validationErrors).forEach(error => toast.error(error));
//       return;
//     }

//     setLoading(true);
//     try {
//       const taxData = {
//         ...taxForm,
//         rate: parseFloat(taxForm.rate)
//       };

//       if (editingTax) {
//         await api.patch(`/api/payments/taxes/${editingTax.id}/`, taxData);
//         toast.success('Tax configuration updated successfully');
//       } else {
//         await api.post('/api/payments/taxes/', taxData);
//         toast.success('Tax configuration created successfully');
//       }

//       setShowTaxModal(false);
//       resetTaxForm();
//       await fetchTaxConfigurations();
//       onRefresh?.();
//     } catch (error) {
//       console.error('Tax save error:', error);
//       const errorMessage = error.response?.data?.error || 
//                           error.response?.data?.detail || 
//                           error.response?.data?.message ||
//                           error.message ||
//                           'Failed to save tax configuration';
//       toast.error(errorMessage);
      
//       // Handle validation errors from backend
//       if (error.response?.status === 400 && error.response.data) {
//         const backendErrors = {};
//         Object.keys(error.response.data).forEach(key => {
//           backendErrors[key] = Array.isArray(error.response.data[key]) 
//             ? error.response.data[key].join(', ')
//             : error.response.data[key];
//         });
//         setFormErrors(backendErrors);
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [taxForm, editingTax, resetTaxForm, fetchTaxConfigurations, onRefresh]);

//   const handleEditTax = useCallback((tax) => {
//     setEditingTax(tax);
//     setTaxForm({
//       name: tax.name,
//       tax_type: tax.tax_type,
//       rate: tax.rate.toString(),
//       description: tax.description || '',
//       applies_to: tax.applies_to,
//       access_type: tax.access_type,
//       is_enabled: tax.is_enabled,
//       is_included_in_price: tax.is_included_in_price,
//       requires_approval: tax.requires_approval,
//       status: tax.status,
//       effective_from: tax.effective_from ? new Date(tax.effective_from).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
//       effective_to: tax.effective_to ? new Date(tax.effective_to).toISOString().slice(0, 16) : '',
//       revision_notes: tax.revision_notes || ''
//     });
//     setFormErrors({});
//     setShowTaxModal(true);
//   }, []);

//   const handleCloneTax = useCallback(async (tax) => {
//     setLoading(true);
//     try {
//       const cloneData = {
//         ...tax,
//         name: `${tax.name} (Copy)`,
//         tax_code: null, // Will be regenerated by backend
//         version: 1,
//         revision_notes: `Cloned from ${tax.tax_code || tax.name}`
//       };
      
//       delete cloneData.id;
//       delete cloneData.created_at;
//       delete cloneData.updated_at;
//       delete cloneData.created_by;
//       delete cloneData.updated_by;

//       await api.post('/api/payments/taxes/', cloneData);
//       toast.success('Tax configuration cloned successfully');
//       await fetchTaxConfigurations();
//       onRefresh?.();
//     } catch (error) {
//       console.error('Tax clone error:', error);
//       toast.error('Failed to clone tax configuration');
//     } finally {
//       setLoading(false);
//       setCloneTax(null);
//     }
//   }, [fetchTaxConfigurations, onRefresh]);

//   // Algorithm: Enhanced tax deletion with full autonomy
//   const handleDeleteTax = useCallback(async () => {
//     if (!deleteTax) return;

//     setLoading(true);
//     try {
//       await api.delete(`/api/payments/taxes/${deleteTax.id}/`);
      
//       toast.success(`Tax configuration "${deleteTax.name}" deleted successfully`);
//       setDeleteTax(null);
//       await fetchTaxConfigurations();
//       onRefresh?.();
//     } catch (error) {
//       console.error('Tax deletion error:', error);
      
//       if (error.response?.status === 404) {
//         toast.error('Tax configuration not found');
//       } else {
//         const errorMessage = error.response?.data?.error || 
//                             error.response?.data?.detail || 
//                             'Failed to delete tax configuration';
//         toast.error(errorMessage);
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [deleteTax, fetchTaxConfigurations, onRefresh]);

//   // Algorithm: Enhanced tax status management
//   const handleUpdateTaxStatus = useCallback(async (tax, updates) => {
//     const originalTax = { ...tax };
    
//     // Optimistic update
//     setTaxConfigurations(prev => 
//       prev.map(t => 
//         t.id === tax.id ? { ...t, ...updates } : t
//       )
//     );

//     try {
//       await api.patch(`/api/payments/taxes/${tax.id}/`, updates);
      
//       let message = '';
//       if (updates.hasOwnProperty('is_enabled')) {
//         message = `Tax ${updates.is_enabled ? 'enabled' : 'disabled'} successfully`;
//       } else if (updates.hasOwnProperty('status')) {
//         message = `Tax status updated to ${updates.status} successfully`;
//       } else {
//         message = 'Tax configuration updated successfully';
//       }
      
//       toast.success(message);
//       await fetchTaxConfigurations();
//       onRefresh?.();
//     } catch (error) {
//       console.error('Tax status update error:', error);
//       // Revert optimistic update
//       setTaxConfigurations(prev => 
//         prev.map(t => 
//           t.id === tax.id ? originalTax : t
//         )
//       );
      
//       const errorMessage = error.response?.data?.error || 
//                           error.response?.data?.detail || 
//                           'Failed to update tax configuration';
//       toast.error(errorMessage);
//     }
//   }, [fetchTaxConfigurations, onRefresh]);

//   // Algorithm: Tax simulation for preview
//   const simulateTaxImpact = useCallback((amount, accessType = 'all') => {
//     const applicableTaxes = taxConfigurations.filter(tax => 
//       tax.is_active && 
//       (tax.access_type === 'all' || tax.access_type === accessType) &&
//       (tax.applies_to === 'revenue' || tax.applies_to === 'both')
//     );

//     let totalTax = 0;
//     let breakdown = [];

//     applicableTaxes.forEach(tax => {
//       const taxAmount = tax.is_included_in_price 
//         ? amount - (amount / (1 + (parseFloat(tax.rate) || 0) / 100))
//         : amount * ((parseFloat(tax.rate) || 0) / 100);
      
//       totalTax += taxAmount;
//       breakdown.push({
//         name: tax.name,
//         rate: tax.rate,
//         amount: taxAmount,
//         isIncluded: tax.is_included_in_price,
//         type: tax.tax_type
//       });
//     });

//     return {
//       totalTax,
//       breakdown,
//       netAmount: amount - totalTax,
//       grossAmount: tax.is_included_in_price ? amount : amount + totalTax
//     };
//   }, [taxConfigurations]);

//   // Enhanced TaxCard Component
//   const TaxCard = ({ tax }) => {
//     const isActive = tax.is_active;
//     const isEffective = isTaxEffective(tax);
    
//     return (
//       <div className={`p-4 rounded-lg border transition-all duration-300 ${
//         theme === "dark" 
//           ? `bg-gray-700/30 ${isActive ? (isEffective ? 'border-green-600' : 'border-yellow-600') : 'border-gray-600'} hover:bg-gray-700/50` 
//           : `bg-white ${isActive ? (isEffective ? 'border-green-200' : 'border-yellow-200') : 'border-gray-200'} hover:bg-gray-50`
//       }`}>
//         <div className="flex items-start justify-between mb-3">
//           <div className="flex-1 min-w-0">
//             <div className="flex items-center space-x-2 mb-1">
//               <h4 className={`font-semibold truncate ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//                 {tax.name}
//               </h4>
//               {tax.tax_code && (
//                 <span className={`text-xs px-1.5 py-0.5 rounded ${
//                   theme === "dark" ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-600"
//                 }`}>
//                   <FaCode className="inline w-3 h-3 mr-1" />
//                   {tax.tax_code}
//                 </span>
//               )}
//             </div>
            
//             <div className="flex flex-wrap items-center gap-1 mb-2">
//               <span className={`text-sm px-2 py-1 rounded-full ${
//                 theme === "dark" 
//                   ? `${isActive ? (isEffective ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300') : 'bg-gray-600 text-gray-300'}` 
//                   : `${isActive ? (isEffective ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800') : 'bg-gray-200 text-gray-600'}`
//               }`}>
//                 {tax.rate}%
//               </span>
              
//               <span className={`text-xs px-2 py-1 rounded-full ${
//                 theme === "dark" ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-800"
//               }`}>
//                 {tax.tax_type_display || tax.tax_type}
//               </span>

//               {!isEffective && isActive && (
//                 <span className={`text-xs px-2 py-1 rounded-full ${
//                   theme === "dark" ? "bg-yellow-900 text-yellow-300" : "bg-yellow-100 text-yellow-800"
//                 }`}>
//                   <Clock className="inline w-3 h-3 mr-1" />
//                   Not Effective
//                 </span>
//               )}

//               {tax.requires_approval && (
//                 <span className={`text-xs px-2 py-1 rounded-full ${
//                   theme === "dark" ? "bg-purple-900 text-purple-300" : "bg-purple-100 text-purple-800"
//                 }`}>
//                   Requires Approval
//                 </span>
//               )}
//             </div>
//           </div>
          
//           <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
//             {/* Status Toggle */}
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 handleUpdateTaxStatus(tax, { is_enabled: !tax.is_enabled });
//               }}
//               className={`p-1 rounded ${
//                 tax.is_enabled 
//                   ? "text-green-500 hover:text-green-600" 
//                   : "text-gray-400 hover:text-gray-500"
//               }`}
//               title={tax.is_enabled ? 'Disable Tax' : 'Enable Tax'}
//             >
//               {tax.is_enabled ? <FaToggleOn className="w-5 h-5" /> : <FaToggleOff className="w-5 h-5" />}
//             </button>
            
//             {/* Edit Button */}
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 handleEditTax(tax);
//               }}
//               className={`p-1 rounded ${
//                 theme === "dark" 
//                   ? "text-blue-400 hover:text-blue-300" 
//                   : "text-blue-600 hover:text-blue-800"
//               }`}
//               title="Edit Tax"
//             >
//               <FaEdit className="w-4 h-4" />
//             </button>

//             {/* Clone Button */}
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setCloneTax(tax);
//               }}
//               className={`p-1 rounded ${
//                 theme === "dark" 
//                   ? "text-green-400 hover:text-green-300" 
//                   : "text-green-600 hover:text-green-800"
//               }`}
//               title="Clone Tax"
//             >
//               <Copy className="w-4 h-4" />
//             </button>
            
//             {/* Delete Button - Full Autonomy */}
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setDeleteTax(tax);
//               }}
//               className={`p-1 rounded text-red-500 hover:text-red-600`}
//               title="Delete Tax"
//             >
//               <FaTrash className="w-4 h-4" />
//             </button>
//           </div>
//         </div>

//         <div className="space-y-2 text-sm">
//           <div className="flex justify-between">
//             <span className={textSecondaryClass}>Applies To</span>
//             <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
//               {tax.applies_to_display || tax.applies_to}
//             </span>
//           </div>
          
//           <div className="flex justify-between">
//             <span className={textSecondaryClass}>Access Type</span>
//             <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
//               <AccessTypeBadge accessType={tax.access_type} theme={theme} size="sm" />
//             </span>
//           </div>

//           <div className="flex justify-between">
//             <span className={textSecondaryClass}>Status</span>
//             <span className={`text-xs px-2 py-1 rounded-full ${
//               tax.status === 'active' 
//                 ? (theme === "dark" ? "bg-green-900 text-green-300" : "bg-green-100 text-green-800")
//                 : tax.status === 'inactive'
//                 ? (theme === "dark" ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-600")
//                 : (theme === "dark" ? "bg-yellow-900 text-yellow-300" : "bg-yellow-100 text-yellow-800")
//             }`}>
//               {tax.status_display || tax.status}
//             </span>
//           </div>
          
//           {tax.description && (
//             <div className="text-sm">
//               <span className={textSecondaryClass}>Description: </span>
//               <span className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
//                 {tax.description}
//               </span>
//             </div>
//           )}
          
//           <div className="flex justify-between">
//             <span className={textSecondaryClass}>Price Inclusion</span>
//             <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
//               {tax.is_included_in_price ? 'Included' : 'Added'}
//             </span>
//           </div>

//           {/* Effective Period */}
//           <div className="flex justify-between">
//             <span className={textSecondaryClass}>Effective From</span>
//             <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
//               {formatDate(tax.effective_from)}
//             </span>
//           </div>

//           {tax.effective_to && (
//             <div className="flex justify-between">
//               <span className={textSecondaryClass}>Effective To</span>
//               <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
//                 {formatDate(tax.effective_to)}
//               </span>
//             </div>
//           )}

//           {/* Audit Information */}
//           <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
//             <div className="flex justify-between text-xs">
//               <span className={textSecondaryClass}>Created</span>
//               <span className={textSecondaryClass}>
//                 {tax.created_by_name && (
//                   <><FaUser className="inline w-3 h-3 mr-1" />{tax.created_by_name} • </>
//                 )}
//                 {formatDate(tax.created_at)}
//               </span>
//             </div>
//             {tax.updated_at && (
//               <div className="flex justify-between text-xs mt-1">
//                 <span className={textSecondaryClass}>Updated</span>
//                 <span className={textSecondaryClass}>{formatDate(tax.updated_at)}</span>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Quick Actions */}
//         <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
//           <span className={`text-xs ${textSecondaryClass}`}>
//             v{tax.version} • {tax.is_active ? (isEffective ? 'Active' : 'Scheduled') : 'Inactive'}
//           </span>
//           <div className="flex space-x-1">
//             <button
//               onClick={() => {
//                 const simulation = simulateTaxImpact(1000, tax.access_type);
//                 toast.success(
//                   `KES 1,000 → KES ${simulation.netAmount.toFixed(2)} net with ${simulation.breakdown.length} tax(es)`
//                 );
//               }}
//               className={`text-xs px-2 py-1 rounded ${
//                 theme === "dark" ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-200 hover:bg-gray-300"
//               }`}
//             >
//               Test
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className={`${cardClass} p-6 transition-colors duration-300`}>
//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
//           <div className="flex-1">
//             <h2 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"} mb-2 flex items-center`}>
//               <FaChartBar className="mr-2" /> Tax Configuration Management
//             </h2>
//             <p className={textSecondaryClass}>
//               Configure and manage tax rules across different access types and revenue streams with full autonomy
//             </p>
//           </div>
          
//           <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
//             <button
//               onClick={fetchTaxConfigurations}
//               disabled={taxesLoading}
//               className={`flex items-center justify-center px-4 py-2 rounded-lg ${
//                 theme === "dark" 
//                   ? "bg-gray-700 hover:bg-gray-600 text-white" 
//                   : "bg-gray-200 hover:bg-gray-300 text-gray-800"
//               } disabled:opacity-50 transition-colors duration-200`}
//             >
//               {taxesLoading ? (
//                 <FaSpinner className="animate-spin mr-2" />
//               ) : (
//                 <FaSpinner className="mr-2" />
//               )}
//               Refresh
//             </button>
//             <button
//               onClick={() => setShowTaxModal(true)}
//               className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
//             >
//               <FaPlus className="mr-2" />
//               Add Tax
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className={`${cardClass} p-6 transition-colors duration-300`}>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
//           <div>
//             <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//               Status
//             </label>
//             <EnhancedSelect
//               value={filters.status}
//               onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
//               options={statusFilterOptions}
//               theme={theme}
//             />
//           </div>
          
//           <div>
//             <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//               Access Type
//             </label>
//             <EnhancedSelect
//               value={filters.access_type}
//               onChange={(value) => setFilters(prev => ({ ...prev, access_type: value }))}
//               options={accessTypeOptions}
//               theme={theme}
//             />
//           </div>

//           <div>
//             <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//               Tax Type
//             </label>
//             <EnhancedSelect
//               value={filters.tax_type}
//               onChange={(value) => setFilters(prev => ({ ...prev, tax_type: value }))}
//               options={[{ value: 'all', label: 'All Types' }, ...taxTypeOptions]}
//               theme={theme}
//             />
//           </div>

//           <div className="sm:col-span-2 lg:col-span-2">
//             <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//               Search Taxes
//             </label>
//             <input
//               type="text"
//               value={filters.search}
//               onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
//               className={`${inputClass} w-full px-3 py-2 rounded-lg`}
//               placeholder="Search by name, tax code, or description..."
//             />
//           </div>
//         </div>
//       </div>

//       {/* Tax Impact Overview */}
//       {taxConfigurations.length > 0 && (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
//           <div className={`p-4 rounded-lg border-l-4 ${
//             theme === "dark" ? "border-blue-500 bg-blue-900/20" : "border-blue-500 bg-blue-50"
//           }`}>
//             <h3 className={`text-sm ${textSecondaryClass} mb-1`}>Active Taxes</h3>
//             <p className={`text-2xl font-bold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
//               {taxImpact.activeCount}
//             </p>
//             <p className={`text-xs ${textSecondaryClass}`}>
//               {taxImpact.enabledCount} enabled • {taxImpact.disabledCount} disabled
//             </p>
//           </div>
          
//           <div className={`p-4 rounded-lg border-l-4 ${
//             theme === "dark" ? "border-green-500 bg-green-900/20" : "border-green-500 bg-green-50"
//           }`}>
//             <h3 className={`text-sm ${textSecondaryClass} mb-1`}>Revenue Impact</h3>
//             <p className={`text-2xl font-bold ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
//               {typeof taxImpact.totalRevenueTax === 'number' ? taxImpact.totalRevenueTax.toFixed(1) : '0.0'}%
//             </p>
//             <p className={`text-xs ${textSecondaryClass}`}>Total rate on revenue</p>
//           </div>
          
//           <div className={`p-4 rounded-lg border-l-4 ${
//             theme === "dark" ? "border-purple-500 bg-purple-900/20" : "border-purple-500 bg-purple-50"
//           }`}>
//             <h3 className={`text-sm ${textSecondaryClass} mb-1`}>Expense Impact</h3>
//             <p className={`text-2xl font-bold ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`}>
//               {typeof taxImpact.totalExpenseTax === 'number' ? taxImpact.totalExpenseTax.toFixed(1) : '0.0'}%
//             </p>
//             <p className={`text-xs ${textSecondaryClass}`}>Total rate on expenses</p>
//           </div>
          
//           <div className={`p-4 rounded-lg border-l-4 ${
//             theme === "dark" ? "border-yellow-500 bg-yellow-900/20" : "border-yellow-500 bg-yellow-50"
//           }`}>
//             <h3 className={`text-sm ${textSecondaryClass} mb-1`}>Configurations</h3>
//             <p className={`text-2xl font-bold ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"}`}>
//               {taxConfigurations.length}
//             </p>
//             <p className={`text-xs ${textSecondaryClass}`}>
//               {taxImpact.archivedCount} archived
//             </p>
//           </div>
//         </div>
//       )}

//       {/* Recommendations */}
//       {taxRecommendations.length > 0 && (
//         <div className={`${cardClass} p-6 transition-colors duration-300`}>
//           <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"} flex items-center`}>
//             <FaExclamationTriangle className="mr-2 text-yellow-500" />
//             Configuration Recommendations
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {taxRecommendations.slice(0, 6).map((rec, index) => (
//               <div 
//                 key={index}
//                 className={`p-3 rounded-lg border ${
//                   rec.priority === 'high' 
//                     ? (theme === "dark" ? "border-red-600 bg-red-900/20" : "border-red-200 bg-red-50")
//                     : rec.priority === 'medium'
//                     ? (theme === "dark" ? "border-yellow-600 bg-yellow-900/20" : "border-yellow-200 bg-yellow-50")
//                     : (theme === "dark" ? "border-blue-600 bg-blue-900/20" : "border-blue-200 bg-blue-50")
//                 }`}
//               >
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <h4 className={`font-medium text-sm ${
//                       rec.priority === 'high' 
//                         ? (theme === "dark" ? "text-red-300" : "text-red-700")
//                         : rec.priority === 'medium'
//                         ? (theme === "dark" ? "text-yellow-300" : "text-yellow-700")
//                         : (theme === "dark" ? "text-blue-300" : "text-blue-700")
//                     }`}>
//                       {rec.message}
//                     </h4>
//                     <p className={`text-xs mt-1 ${
//                       theme === "dark" ? "text-gray-400" : "text-gray-600"
//                     }`}>
//                       {rec.action}
//                     </p>
//                   </div>
//                   <span className={`text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0 ${
//                     rec.priority === 'high' 
//                       ? (theme === "dark" ? "bg-red-900 text-red-300" : "bg-red-100 text-red-800")
//                       : rec.priority === 'medium'
//                       ? (theme === "dark" ? "bg-yellow-900 text-yellow-300" : "bg-yellow-100 text-yellow-800")
//                       : (theme === "dark" ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-800")
//                   }`}>
//                     {rec.priority}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Tax Configuration Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
//         {taxesLoading ? (
//           // Enhanced Loading State
//           Array.from({ length: 6 }).map((_, index) => (
//             <div 
//               key={index}
//               className={`p-4 rounded-lg border animate-pulse ${
//                 theme === "dark" ? "bg-gray-700/30 border-gray-600" : "bg-gray-100 border-gray-200"
//               }`}
//             >
//               <div className="flex items-center justify-between mb-3">
//                 <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-3/4"></div>
//                 <div className="h-6 bg-gray-400 dark:bg-gray-600 rounded w-1/4"></div>
//               </div>
//               <div className="space-y-2">
//                 {Array.from({ length: 6 }).map((_, i) => (
//                   <div key={i} className="flex justify-between">
//                     <div className="h-3 bg-gray-400 dark:bg-gray-600 rounded w-1/3"></div>
//                     <div className="h-3 bg-gray-400 dark:bg-gray-600 rounded w-1/4"></div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ))
//         ) : filteredTaxConfigurations.length > 0 ? (
//           filteredTaxConfigurations.map((tax) => (
//             <TaxCard key={tax.id} tax={tax} />
//           ))
//         ) : (
//           <div className={`col-span-3 p-8 text-center rounded-lg border-2 border-dashed ${
//             theme === "dark" ? "border-gray-600" : "border-gray-300"
//           }`}>
//             <FaPlus className={`w-12 h-12 mx-auto mb-4 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
//             <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//               {filters.search || filters.status !== 'all' || filters.access_type !== 'all' || filters.tax_type !== 'all' 
//                 ? 'No matching tax configurations found' 
//                 : 'No Tax Configurations'
//               }
//             </h3>
//             <p className={textSecondaryClass}>
//               {filters.search || filters.status !== 'all' || filters.access_type !== 'all' || filters.tax_type !== 'all'
//                 ? 'Try adjusting your filters or search terms'
//                 : 'Get started by creating your first tax configuration to manage revenue and expense taxes'
//               }
//             </p>
//             {(filters.search || filters.status !== 'all' || filters.access_type !== 'all' || filters.tax_type !== 'all') && (
//               <button
//                 onClick={() => setFilters({
//                   status: 'all',
//                   access_type: 'all',
//                   tax_type: 'all',
//                   search: ''
//                 })}
//                 className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
//               >
//                 Clear Filters
//               </button>
//             )}
//             {!filters.search && filters.status === 'all' && filters.access_type === 'all' && filters.tax_type === 'all' && (
//               <button
//                 onClick={() => setShowTaxModal(true)}
//                 className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
//               >
//                 Create First Tax
//               </button>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Enhanced Tax Analytics */}
//       {taxConfigurations.length > 0 && (
//         <div className={`${cardClass} p-6 transition-colors duration-300`}>
//           <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//             Tax Configuration Analytics
//           </h3>
//           <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
//             {/* By Tax Type */}
//             <div className={`p-4 rounded-lg ${
//               theme === "dark" ? "bg-blue-900/20 border-blue-700" : "bg-blue-50 border-blue-200"
//             } border`}>
//               <h4 className={`text-sm font-medium mb-3 ${theme === "dark" ? "text-blue-300" : "text-blue-700"} flex items-center`}>
//                 <FaChartBar className="mr-2" /> By Tax Type
//               </h4>
//               <div className="space-y-2">
//                 {Object.entries(taxImpact.byTaxType).map(([type, data]) => (
//                   <div key={type} className="flex justify-between items-center text-sm">
//                     <span className="capitalize">{type.replace('_', ' ')}</span>
//                     <div className="text-right">
//                       <div className="font-semibold">{data.count} configs</div>
//                       <div className={`text-xs ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
//                         {data.totalRate.toFixed(1)}% total
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
            
//             {/* By Access Type */}
//             <div className={`p-4 rounded-lg ${
//               theme === "dark" ? "bg-green-900/20 border-green-700" : "bg-green-50 border-green-200"
//             } border`}>
//               <h4 className={`text-sm font-medium mb-3 ${theme === "dark" ? "text-green-300" : "text-green-700"} flex items-center`}>
//                 <BarChart3 className="mr-2" /> By Access Type
//               </h4>
//               <div className="space-y-2">
//                 {Object.entries(taxImpact.byAccessType).map(([accessType, data]) => (
//                   <div key={accessType} className="flex justify-between items-center text-sm">
//                     <span>
//                       <AccessTypeBadge accessType={accessType} theme={theme} size="sm" />
//                     </span>
//                     <div className="text-right">
//                       <div className="font-semibold">{data.count}</div>
//                       <div className={`text-xs ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
//                         Rev: {data.revenue.toFixed(1)}%
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
            
//             {/* Status Overview */}
//             <div className={`p-4 rounded-lg ${
//               theme === "dark" ? "bg-yellow-900/20 border-yellow-700" : "bg-yellow-50 border-yellow-200"
//             } border`}>
//               <h4 className={`text-sm font-medium mb-3 ${theme === "dark" ? "text-yellow-300" : "text-yellow-700"} flex items-center`}>
//                 <FaToggleOn className="mr-2" /> Status Overview
//               </h4>
//               <div className="space-y-3">
//                 <div className="flex justify-between items-center">
//                   <span>Active & Effective</span>
//                   <span className="font-semibold text-green-500">{taxImpact.activeCount}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span>Inactive</span>
//                   <span className="font-semibold text-gray-500">{taxImpact.disabledCount}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span>Archived</span>
//                   <span className="font-semibold text-yellow-500">{taxImpact.archivedCount}</span>
//                 </div>
//                 <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
//                   <div 
//                     className="bg-green-500 h-2 rounded-full transition-all duration-500"
//                     style={{ 
//                       width: `${(taxImpact.activeCount / taxConfigurations.length) * 100}%` 
//                     }}
//                   ></div>
//                 </div>
//                 <div className="text-xs text-center text-gray-500 dark:text-gray-400">
//                   {((taxImpact.activeCount / taxConfigurations.length) * 100).toFixed(1)}% Active
//                 </div>
//               </div>
//             </div>

//             {/* Quick Actions */}
//             <div className={`p-4 rounded-lg ${
//               theme === "dark" ? "bg-purple-900/20 border-purple-700" : "bg-purple-50 border-purple-200"
//             } border`}>
//               <h4 className={`text-sm font-medium mb-3 ${theme === "dark" ? "text-purple-300" : "text-purple-700"} flex items-center`}>
//                 <FaMoneyBillWave className="mr-2" /> Quick Actions
//               </h4>
//               <div className="space-y-2">
//                 <button
//                   onClick={() => setShowTaxModal(true)}
//                   className="w-full text-left p-2 rounded hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors duration-200"
//                 >
//                   + Create New Tax
//                 </button>
//                 <button
//                   onClick={fetchTaxConfigurations}
//                   className="w-full text-left p-2 rounded hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors duration-200"
//                 >
//                   ↻ Refresh Data
//                 </button>
//                 <button
//                   onClick={() => {
//                     const simulation = simulateTaxImpact(5000, 'all');
//                     toast.success(`Tax simulation: KES 5,000 → KES ${simulation.netAmount.toFixed(2)} net`);
//                   }}
//                   className="w-full text-left p-2 rounded hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors duration-200"
//                 >
//                   🧪 Test Tax Calculation
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Modals */}
//       <TaxFormModal
//         showTaxModal={showTaxModal}
//         setShowTaxModal={setShowTaxModal}
//         editingTax={editingTax}
//         taxForm={taxForm}
//         handleTaxInputChange={handleTaxInputChange}
//         handleNumberInput={handleNumberInput}
//         formErrors={formErrors}
//         setFormErrors={setFormErrors}
//         theme={theme}
//         cardClass={cardClass}
//         inputClass={inputClass}
//         handleSaveTax={handleSaveTax}
//         loading={loading}
//         resetTaxForm={resetTaxForm}
//         taxTypeOptions={taxTypeOptions}
//         appliesToOptions={appliesToOptions}
//         accessTypeOptions={accessTypeOptions}
//         statusOptions={statusOptions}
//       />
      
//       <ConfirmationModal
//         isOpen={!!deleteTax}
//         onClose={() => setDeleteTax(null)}
//         onConfirm={handleDeleteTax}
//         title="Delete Tax Configuration"
//         message={`Are you sure you want to delete the tax configuration "${deleteTax?.name}"? This action cannot be undone and will be permanently removed from the system.`}
//         confirmText="Delete Tax Configuration"
//         type="danger"
//         theme={theme}
//       />

//       <ConfirmationModal
//         isOpen={!!cloneTax}
//         onClose={() => setCloneTax(null)}
//         onConfirm={() => handleCloneTax(cloneTax)}
//         title="Clone Tax Configuration"
//         message={`Create a copy of "${cloneTax?.name}" tax configuration? The clone will have "(Copy)" appended to its name.`}
//         confirmText="Clone Tax"
//         type="info"
//         theme={theme}
//       />
//     </div>
//   );
// };

// export default TaxConfigurationPanel;













// import React, { useState, useCallback, useMemo, useEffect } from 'react';
// import { 
//   FaPlus, 
//   FaEdit, 
//   FaTrash, 
//   FaSave, 
//   FaTimes, 
//   FaToggleOn, 
//   FaToggleOff, 
//   FaSpinner, 
//   FaExclamationTriangle, 
//   FaChartBar, 
//   FaMoneyBillWave, 
//   FaReceipt, 
//   FaCalendar,
//   FaUser,
//   FaCode 
// } from 'react-icons/fa';
// import { TrendingUp, TrendingDown, BarChart3, Calculator, Clock, Archive, Copy, Download, Upload } from 'lucide-react';
// import { toast } from 'react-hot-toast';
// import api from '../../../api';
// import { EnhancedSelect, ConfirmationModal, AccessTypeBadge } from '../../ServiceManagement/Shared/components';

// // Algorithm: Enhanced tax impact calculation with access type breakdown
// const calculateTaxImpact = (taxes, reconciliationData) => {
//   const impact = {
//     totalRevenueTax: 0,
//     totalExpenseTax: 0,
//     byAccessType: {
//       hotspot: { revenue: 0, expenses: 0, count: 0 },
//       pppoe: { revenue: 0, expenses: 0, count: 0 },
//       both: { revenue: 0, expenses: 0, count: 0 },
//       all: { revenue: 0, expenses: 0, count: 0 }
//     },
//     byTaxType: {},
//     enabledCount: 0,
//     disabledCount: 0,
//     activeCount: 0,
//     archivedCount: 0
//   };

//   taxes.forEach(tax => {
//     // Count by status
//     if (tax.status === 'active' && tax.is_enabled) {
//       impact.activeCount++;
//       impact.enabledCount++;
//     } else if (tax.status === 'inactive') {
//       impact.disabledCount++;
//     } else if (tax.status === 'archived') {
//       impact.archivedCount++;
//     }

//     // Calculate tax impact for active and enabled taxes
//     if (tax.is_active) {
//       const appliesToRevenue = tax.applies_to === 'revenue' || tax.applies_to === 'both';
//       const appliesToExpenses = tax.applies_to === 'expenses' || tax.applies_to === 'both';
      
//       if (appliesToRevenue) {
//         impact.totalRevenueTax += parseFloat(tax.rate) || 0;
//         impact.byAccessType[tax.access_type].revenue += parseFloat(tax.rate) || 0;
//       }
      
//       if (appliesToExpenses) {
//         impact.totalExpenseTax += parseFloat(tax.rate) || 0;
//         impact.byAccessType[tax.access_type].expenses += parseFloat(tax.rate) || 0;
//       }

//       // Count by access type
//       impact.byAccessType[tax.access_type].count++;

//       // Group by tax type
//       if (!impact.byTaxType[tax.tax_type]) {
//         impact.byTaxType[tax.tax_type] = {
//           totalRate: 0,
//           count: 0,
//           revenueRate: 0,
//           expenseRate: 0
//         };
//       }
//       impact.byTaxType[tax.tax_type].totalRate += parseFloat(tax.rate) || 0;
//       impact.byTaxType[tax.tax_type].count++;
      
//       if (appliesToRevenue) impact.byTaxType[tax.tax_type].revenueRate += parseFloat(tax.rate) || 0;
//       if (appliesToExpenses) impact.byTaxType[tax.tax_type].expenseRate += parseFloat(tax.rate) || 0;
//     }
//   });

//   return impact;
// };

// // Algorithm: Enhanced tax configuration validation
// const validateTaxConfiguration = (taxForm) => {
//   const errors = {};

//   if (!taxForm.name?.trim()) {
//     errors.name = 'Tax name is required';
//   } else if (taxForm.name.length > 100) {
//     errors.name = 'Tax name cannot exceed 100 characters';
//   }

//   const rate = parseFloat(taxForm.rate);
//   if (isNaN(rate) || rate < 0 || rate > 100) {
//     errors.rate = 'Tax rate must be a number between 0 and 100';
//   } else if (rate > 50 && !taxForm.requires_approval) {
//     errors.requires_approval = 'Tax rates above 50% require special approval';
//   }

//   // Validate effective dates
//   if (taxForm.effective_to && taxForm.effective_from) {
//     const fromDate = new Date(taxForm.effective_from);
//     const toDate = new Date(taxForm.effective_to);
//     if (toDate < fromDate) {
//       errors.effective_to = 'End date cannot be before start date';
//     }
//   }

//   if (taxForm.effective_to && new Date(taxForm.effective_to) < new Date()) {
//     errors.effective_to = 'End date cannot be in the past';
//   }

//   return errors;
// };

// // Algorithm: Generate intelligent tax recommendations
// const generateTaxRecommendations = (taxes, reconciliationData) => {
//   const recommendations = [];
//   const { access_type_breakdown } = reconciliationData || {};

//   // Check tax coverage by access type
//   const accessTypes = ['hotspot', 'pppoe', 'both'];
//   const activeTaxesByAccessType = {};
  
//   taxes.filter(t => t.is_active).forEach(tax => {
//     if (!activeTaxesByAccessType[tax.access_type]) {
//       activeTaxesByAccessType[tax.access_type] = [];
//     }
//     activeTaxesByAccessType[tax.access_type].push(tax);
//   });

//   accessTypes.forEach(accessType => {
//     const hasCoverage = activeTaxesByAccessType[accessType] || activeTaxesByAccessType.all;
//     const revenue = access_type_breakdown?.[accessType]?.revenue || 0;
    
//     if (!hasCoverage && revenue > 0) {
//       recommendations.push({
//         type: 'coverage_gap',
//         message: `No active taxes for ${accessType} access type with revenue`,
//         priority: revenue > 1000 ? 'high' : 'medium',
//         action: `Configure tax for ${accessType}`,
//         accessType
//       });
//     }
//   });

//   // Check for expired or expiring taxes
//   const now = new Date();
//   const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
//   taxes.filter(tax => tax.effective_to).forEach(tax => {
//     const effectiveTo = new Date(tax.effective_to);
//     if (effectiveTo < now && tax.is_active) {
//       recommendations.push({
//         type: 'expired',
//         message: `Tax "${tax.name}" has expired`,
//         priority: 'medium',
//         action: 'Update or archive tax',
//         taxId: tax.id
//       });
//     } else if (effectiveTo < thirtyDaysFromNow && tax.is_active) {
//       recommendations.push({
//         type: 'expiring_soon',
//         message: `Tax "${tax.name}" expires in less than 30 days`,
//         priority: 'low',
//         action: 'Review expiration date',
//         taxId: tax.id
//       });
//     }
//   });

//   // Check for high tax rates without approval
//   taxes.filter(tax => tax.rate > 50 && !tax.requires_approval && tax.is_active).forEach(tax => {
//     recommendations.push({
//       type: 'high_rate',
//       message: `Tax "${tax.name}" has high rate (${tax.rate}%) without approval flag`,
//       priority: 'medium',
//       action: 'Mark as requiring approval',
//       taxId: tax.id
//     });
//   });

//   // Check for duplicate configurations
//   const taxSignatures = taxes.map(t => 
//     `${t.tax_type}-${t.access_type}-${t.applies_to}-${Math.round(t.rate * 100)}`
//   );
//   const duplicates = taxSignatures.filter((sig, index) => 
//     taxSignatures.indexOf(sig) !== index
//   );
  
//   if (duplicates.length > 0) {
//     recommendations.push({
//       type: 'duplicate',
//       message: 'Potential duplicate tax configurations detected',
//       priority: 'low',
//       action: 'Review tax configurations'
//     });
//   }

//   return recommendations.sort((a, b) => {
//     const priorityOrder = { high: 3, medium: 2, low: 1 };
//     return priorityOrder[b.priority] - priorityOrder[a.priority];
//   });
// };

// // Algorithm: Format date for display - FIXED to handle objects
// const formatDate = (dateValue) => {
//   if (!dateValue) return 'Indefinite';
  
//   // Handle both string dates and objects with effective_from property
//   let dateString;
//   if (typeof dateValue === 'object' && dateValue !== null) {
//     // If it's an object with effective_from property (common error case)
//     if (dateValue.effective_from) {
//       dateString = dateValue.effective_from;
//     } else {
//       return 'Invalid Date';
//     }
//   } else {
//     dateString = dateValue;
//   }
  
//   try {
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) return 'Invalid Date';
    
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   } catch (error) {
//     console.error('Date formatting error:', error);
//     return 'Invalid Date';
//   }
// };

// // Algorithm: Check if tax is currently effective
// const isTaxEffective = (tax) => {
//   const now = new Date();
  
//   // Safely parse effective_from
//   let effectiveFrom;
//   if (typeof tax.effective_from === 'object' && tax.effective_from !== null) {
//     effectiveFrom = new Date(tax.effective_from.effective_from || tax.effective_from);
//   } else {
//     effectiveFrom = new Date(tax.effective_from);
//   }
  
//   // Safely parse effective_to
//   let effectiveTo = null;
//   if (tax.effective_to) {
//     if (typeof tax.effective_to === 'object' && tax.effective_to !== null) {
//       effectiveTo = new Date(tax.effective_to.effective_to || tax.effective_to);
//     } else {
//       effectiveTo = new Date(tax.effective_to);
//     }
//   }
  
//   return effectiveFrom <= now && (!effectiveTo || effectiveTo >= now);
// };

// // Algorithm: Convert datetime-local format to backend format
// const formatDateTimeForBackend = (dateTimeString) => {
//   if (!dateTimeString) return null;
  
//   try {
//     const date = new Date(dateTimeString);
//     return date.toISOString().slice(0, 19).replace('T', ' ');
//   } catch (error) {
//     console.error('DateTime formatting error:', error);
//     return null;
//   }
// };

// // Algorithm: Parse backend datetime to local format
// const parseBackendDateTime = (backendDateTime) => {
//   if (!backendDateTime) return '';
  
//   try {
//     // Handle both ISO format and custom backend format
//     const date = new Date(backendDateTime);
//     if (isNaN(date.getTime())) return '';
    
//     // Convert to datetime-local format (YYYY-MM-DDTHH:MM)
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');
//     const hours = String(date.getHours()).padStart(2, '0');
//     const minutes = String(date.getMinutes()).padStart(2, '0');
    
//     return `${year}-${month}-${day}T${hours}:${minutes}`;
//   } catch (error) {
//     console.error('DateTime parsing error:', error);
//     return '';
//   }
// };

// // Enhanced TaxFormModal Component
// const TaxFormModal = ({ 
//   showTaxModal, 
//   setShowTaxModal, 
//   editingTax, 
//   taxForm, 
//   handleTaxInputChange, 
//   handleNumberInput, 
//   formErrors, 
//   setFormErrors, 
//   theme, 
//   cardClass, 
//   inputClass, 
//   handleSaveTax, 
//   loading, 
//   resetTaxForm, 
//   taxTypeOptions, 
//   appliesToOptions, 
//   accessTypeOptions,
//   statusOptions 
// }) => {
//   if (!showTaxModal) return null;

//   return (
//     <div className={`fixed inset-0 z-50 overflow-y-auto ${theme === "dark" ? "bg-gray-900 bg-opacity-75" : "bg-gray-500 bg-opacity-75"}`}>
//       <div className="flex items-center justify-center min-h-screen p-4 sm:p-6">
//         <div className={`${cardClass} w-full max-w-4xl transform transition-all max-h-[90vh] overflow-y-auto`}>
//           <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-inherit z-10">
//             <div className="flex items-center justify-between">
//               <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//                 {editingTax ? 'Edit Tax Configuration' : 'Create New Tax Configuration'}
//               </h3>
//               <button
//                 onClick={() => {
//                   setShowTaxModal(false);
//                   resetTaxForm();
//                 }}
//                 className={`p-1 rounded-full ${theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"}`}
//               >
//                 <FaTimes className="w-5 h-5" />
//               </button>
//             </div>
//           </div>

//           <div className="p-4 sm:p-6 space-y-6">
//             {/* Basic Information */}
//             <div>
//               <h4 className={`text-md font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//                 Basic Information
//               </h4>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                     Tax Name *
//                   </label>
//                   <input
//                     type="text"
//                     value={taxForm.name}
//                     onChange={(e) => handleTaxInputChange('name', e.target.value)}
//                     className={`${inputClass} w-full px-3 py-2 rounded-lg ${
//                       formErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
//                     }`}
//                     placeholder="e.g., VAT, Service Tax, Withholding"
//                     maxLength={100}
//                   />
//                   {formErrors.name && (
//                     <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                     Tax Type
//                   </label>
//                   <EnhancedSelect
//                     value={taxForm.tax_type}
//                     onChange={(value) => handleTaxInputChange('tax_type', value)}
//                     options={taxTypeOptions}
//                     theme={theme}
//                   />
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                     Tax Rate (%) *
//                   </label>
//                   <input
//                     type="text"
//                     value={taxForm.rate}
//                     onChange={(e) => handleNumberInput('rate', e.target.value)}
//                     className={`${inputClass} w-full px-3 py-2 rounded-lg ${
//                       formErrors.rate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
//                     }`}
//                     placeholder="e.g., 16 for 16%"
//                     inputMode="decimal"
//                   />
//                   {formErrors.rate && (
//                     <p className="text-red-500 text-xs mt-1">{formErrors.rate}</p>
//                   )}
//                   {taxForm.rate && !formErrors.rate && (
//                     <p className={`text-xs mt-1 ${
//                       parseFloat(taxForm.rate) > 30 ? 'text-yellow-600' : 'text-green-600'
//                     }`}>
//                       {parseFloat(taxForm.rate) > 30 ? '⚠️ Rate seems high' : '✓ Valid rate'}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                     Applies To
//                   </label>
//                   <EnhancedSelect
//                     value={taxForm.applies_to}
//                     onChange={(value) => handleTaxInputChange('applies_to', value)}
//                     options={appliesToOptions}
//                     theme={theme}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Scope and Settings */}
//             <div>
//               <h4 className={`text-md font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//                 Scope and Settings
//               </h4>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                     Access Type Scope
//                   </label>
//                   <EnhancedSelect
//                     value={taxForm.access_type}
//                     onChange={(value) => handleTaxInputChange('access_type', value)}
//                     options={accessTypeOptions}
//                     theme={theme}
//                   />
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                     Status
//                   </label>
//                   <EnhancedSelect
//                     value={taxForm.status}
//                     onChange={(value) => handleTaxInputChange('status', value)}
//                     options={statusOptions}
//                     theme={theme}
//                   />
//                 </div>

//                 <div className="sm:col-span-2">
//                   <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                     Description
//                   </label>
//                   <textarea
//                     value={taxForm.description}
//                     onChange={(e) => handleTaxInputChange('description', e.target.value)}
//                     className={`${inputClass} w-full px-3 py-2 rounded-lg resize-none`}
//                     placeholder="Optional description or notes"
//                     rows={3}
//                     maxLength={500}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Effective Date Range */}
//             <div>
//               <h4 className={`text-md font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//                 Effective Period
//               </h4>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                     Effective From *
//                   </label>
//                   <input
//                     type="datetime-local"
//                     value={taxForm.effective_from}
//                     onChange={(e) => handleTaxInputChange('effective_from', e.target.value)}
//                     className={`${inputClass} w-full px-3 py-2 rounded-lg ${
//                       formErrors.effective_from ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
//                     }`}
//                   />
//                   {formErrors.effective_from && (
//                     <p className="text-red-500 text-xs mt-1">{formErrors.effective_from}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                     Effective To (Optional)
//                   </label>
//                   <input
//                     type="datetime-local"
//                     value={taxForm.effective_to || ''}
//                     onChange={(e) => handleTaxInputChange('effective_to', e.target.value)}
//                     className={`${inputClass} w-full px-3 py-2 rounded-lg ${
//                       formErrors.effective_to ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
//                     }`}
//                   />
//                   {formErrors.effective_to && (
//                     <p className="text-red-500 text-xs mt-1">{formErrors.effective_to}</p>
//                   )}
//                   <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
//                     Leave empty for indefinite duration
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Configuration Options */}
//             <div>
//               <h4 className={`text-md font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//                 Configuration Options
//               </h4>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div className="space-y-4">
//                   <div className="flex items-center space-x-6">
//                     <div className="flex items-center">
//                       <input
//                         type="checkbox"
//                         id="is_enabled"
//                         checked={taxForm.is_enabled}
//                         onChange={(e) => handleTaxInputChange('is_enabled', e.target.checked)}
//                         className={`h-4 w-4 ${
//                           theme === "dark" 
//                             ? "text-indigo-400 focus:ring-indigo-400 border-gray-600" 
//                             : "text-blue-600 focus:ring-blue-500 border-gray-300"
//                         } rounded`}
//                       />
//                       <label htmlFor="is_enabled" className={`ml-2 block text-sm ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                         Enabled
//                       </label>
//                     </div>

//                     <div className="flex items-center">
//                       <input
//                         type="checkbox"
//                         id="is_included_in_price"
//                         checked={taxForm.is_included_in_price}
//                         onChange={(e) => handleTaxInputChange('is_included_in_price', e.target.checked)}
//                         className={`h-4 w-4 ${
//                           theme === "dark" 
//                             ? "text-indigo-400 focus:ring-indigo-400 border-gray-600" 
//                             : "text-blue-600 focus:ring-blue-500 border-gray-300"
//                         } rounded`}
//                       />
//                       <label htmlFor="is_included_in_price" className={`ml-2 block text-sm ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                         Tax included in price
//                       </label>
//                     </div>
//                   </div>

//                   <div className="flex items-center">
//                     <input
//                       type="checkbox"
//                       id="requires_approval"
//                       checked={taxForm.requires_approval}
//                       onChange={(e) => handleTaxInputChange('requires_approval', e.target.checked)}
//                       className={`h-4 w-4 ${
//                         theme === "dark" 
//                           ? "text-indigo-400 focus:ring-indigo-400 border-gray-600" 
//                           : "text-blue-600 focus:ring-blue-500 border-gray-300"
//                       } rounded`}
//                     />
//                     <label htmlFor="requires_approval" className={`ml-2 block text-sm ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                       Requires special approval
//                     </label>
//                     {formErrors.requires_approval && (
//                       <p className="text-red-500 text-xs ml-2">{formErrors.requires_approval}</p>
//                     )}
//                   </div>
//                 </div>
                
//                 {/* Tax Impact Preview */}
//                 <div className={`p-3 rounded-lg border ${
//                   theme === "dark" ? "border-gray-600 bg-gray-700/30" : "border-gray-200 bg-gray-50"
//                 }`}>
//                   <div className="flex items-center space-x-2 mb-2">
//                     <Calculator className="w-4 h-4" />
//                     <span className="text-sm font-medium">Tax Impact Preview</span>
//                   </div>
//                   <div className="space-y-1 text-xs">
//                     <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
//                       KES 1,000 × {taxForm.rate || 0}% = KES {((1000 * (parseFloat(taxForm.rate) || 0)) / 100).toFixed(2)}
//                     </p>
//                     {taxForm.is_included_in_price && (
//                       <p className={theme === "dark" ? "text-green-300" : "text-green-600"}>
//                         Tax included in base price
//                       </p>
//                     )}
//                     {parseFloat(taxForm.rate) > 50 && (
//                       <p className={theme === "dark" ? "text-yellow-300" : "text-yellow-600"}>
//                         ⚠️ High rate - approval required
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Revision Notes */}
//             {editingTax && (
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                   Revision Notes
//                 </label>
//                 <textarea
//                   value={taxForm.revision_notes || ''}
//                   onChange={(e) => handleTaxInputChange('revision_notes', e.target.value)}
//                   className={`${inputClass} w-full px-3 py-2 rounded-lg resize-none`}
//                   placeholder="Describe the changes made in this revision..."
//                   rows={2}
//                   maxLength={255}
//                 />
//               </div>
//             )}

//             {/* Form Validation Summary */}
//             {Object.keys(formErrors).length > 0 && (
//               <div className={`p-3 rounded-lg border ${
//                 theme === "dark" ? "border-red-600 bg-red-900/20" : "border-red-200 bg-red-50"
//               }`}>
//                 <div className="flex items-center space-x-2">
//                   <FaExclamationTriangle className="w-4 h-4 text-red-500" />
//                   <span className="text-sm font-medium text-red-700 dark:text-red-300">
//                     Please fix the following errors:
//                   </span>
//                 </div>
//                 <ul className="text-xs text-red-600 dark:text-red-400 mt-1 list-disc list-inside">
//                   {Object.values(formErrors).map((error, index) => (
//                     <li key={index}>{error}</li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             {/* Validation Success */}
//             {taxForm.name && taxForm.rate && taxForm.effective_from && Object.keys(formErrors).length === 0 && (
//               <div className={`p-3 rounded-lg border ${
//                 theme === "dark" ? "border-green-600 bg-green-900/20" : "border-green-200 bg-green-50"
//               }`}>
//                 <div className="flex items-center space-x-2">
//                   <FaSave className="w-4 h-4 text-green-500" />
//                   <span className="text-sm font-medium text-green-700 dark:text-green-300">
//                     Configuration Valid
//                   </span>
//                 </div>
//                 <p className="text-xs text-green-600 dark:text-green-400 mt-1">
//                   Ready to {editingTax ? 'update' : 'create'} tax configuration
//                 </p>
//               </div>
//             )}
//           </div>

//           <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 sticky bottom-0 bg-inherit">
//             <button
//               onClick={() => {
//                 setShowTaxModal(false);
//                 resetTaxForm();
//               }}
//               className={`px-4 py-2 rounded-lg text-sm font-medium ${
//                 theme === "dark" 
//                   ? "bg-gray-700 hover:bg-gray-600 text-white" 
//                   : "bg-gray-200 hover:bg-gray-300 text-gray-800"
//               }`}
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSaveTax}
//               disabled={loading || !taxForm.name || !taxForm.rate || !taxForm.effective_from || Object.keys(formErrors).length > 0}
//               className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
//             >
//               {loading ? (
//                 <div className="flex items-center">
//                   <FaSpinner className="animate-spin mr-2" />
//                   {editingTax ? 'Updating...' : 'Creating...'}
//                 </div>
//               ) : (
//                 <div className="flex items-center">
//                   <FaSave className="mr-2" />
//                   {editingTax ? 'Update Tax' : 'Create Tax'}
//                 </div>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const TaxConfigurationPanel = ({ reconciliationData, theme, cardClass, textSecondaryClass, inputClass, onRefresh }) => {
//   const [showTaxModal, setShowTaxModal] = useState(false);
//   const [editingTax, setEditingTax] = useState(null);
//   const [deleteTax, setDeleteTax] = useState(null);
//   const [cloneTax, setCloneTax] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [taxesLoading, setTaxesLoading] = useState(false);
//   const [taxConfigurations, setTaxConfigurations] = useState([]);
//   const [formErrors, setFormErrors] = useState({});
//   const [filters, setFilters] = useState({
//     status: 'all',
//     access_type: 'all',
//     tax_type: 'all',
//     search: ''
//   });

//   const [taxForm, setTaxForm] = useState({
//     name: '',
//     tax_type: 'custom',
//     rate: '',
//     description: '',
//     applies_to: 'revenue',
//     access_type: 'all',
//     is_enabled: true,
//     is_included_in_price: false,
//     requires_approval: false,
//     status: 'active',
//     effective_from: new Date().toISOString().slice(0, 16), // datetime-local format
//     effective_to: '',
//     revision_notes: ''
//   });

//   // Enhanced options with all tax types from backend
//   const taxTypeOptions = [
//     { value: 'vat', label: 'VAT' },
//     { value: 'withholding', label: 'Withholding Tax' },
//     { value: 'custom', label: 'Custom Tax' },
//     { value: 'sales', label: 'Sales Tax' },
//     { value: 'service', label: 'Service Tax' },
//     { value: 'excise', label: 'Excise Duty' }
//   ];

//   const appliesToOptions = [
//     { value: 'revenue', label: 'Revenue Only' },
//     { value: 'expenses', label: 'Expenses Only' },
//     { value: 'both', label: 'Both Revenue & Expenses' }
//   ];

//   const accessTypeOptions = [
//     { value: 'all', label: 'All Access Types' },
//     { value: 'hotspot', label: 'Hotspot Only' },
//     { value: 'pppoe', label: 'PPPoE Only' },
//     { value: 'both', label: 'Both Access Types' }
//   ];

//   const statusOptions = [
//     { value: 'active', label: 'Active' },
//     { value: 'inactive', label: 'Inactive' },
//     { value: 'archived', label: 'Archived' }
//   ];

//   const statusFilterOptions = [
//     { value: 'all', label: 'All Status' },
//     { value: 'active', label: 'Active Only' },
//     { value: 'inactive', label: 'Inactive Only' },
//     { value: 'archived', label: 'Archived Only' }
//   ];

//   // Algorithm: Enhanced tax configurations fetch with error handling - FIXED response structure
//   const fetchTaxConfigurations = useCallback(async (retryCount = 0) => {
//     setTaxesLoading(true);
//     try {
//       const params = new URLSearchParams();
//       if (filters.status !== 'all') params.append('status', filters.status);
//       if (filters.access_type !== 'all') params.append('access_type', filters.access_type);
//       if (filters.tax_type !== 'all') params.append('tax_type', filters.tax_type);
//       if (filters.search) params.append('search', filters.search);

//       const response = await api.get(`/api/payments/taxes/?${params}`);
      
//       // FIXED: Handle both response structures (data.data and data)
//       const taxData = response.data.data || response.data;
      
//       if (Array.isArray(taxData)) {
//         setTaxConfigurations(taxData);
//       } else {
//         console.error('Invalid tax data structure:', taxData);
//         setTaxConfigurations([]);
//       }
//     } catch (error) {
//       console.error('Failed to fetch tax configurations:', error);
      
//       // Enhanced error handling with specific messages
//       let errorMessage = 'Failed to load tax configurations';
//       if (error.response?.status === 401) {
//         errorMessage = 'Authentication failed. Please log in again.';
//       } else if (error.response?.status === 403) {
//         errorMessage = 'You do not have permission to view tax configurations.';
//       } else if (error.response?.status === 500) {
//         errorMessage = 'Server error. Please try again later.';
//       }
      
//       toast.error(errorMessage);
      
//       // Fallback to reconciliation data with proper structure checking
//       const { tax_configuration = [] } = reconciliationData || {};
//       if (Array.isArray(tax_configuration)) {
//         setTaxConfigurations(tax_configuration);
//       } else {
//         setTaxConfigurations([]);
//       }
//     } finally {
//       setTaxesLoading(false);
//     }
//   }, [filters, reconciliationData]);

//   useEffect(() => {
//     fetchTaxConfigurations();
//   }, [fetchTaxConfigurations]);

//   // Algorithm: Enhanced tax impact calculation with memoization
//   const taxImpact = useMemo(() => 
//     calculateTaxImpact(taxConfigurations, reconciliationData || {}),
//     [taxConfigurations, reconciliationData]
//   );

//   // Algorithm: Enhanced tax recommendations
//   const taxRecommendations = useMemo(() => 
//     generateTaxRecommendations(taxConfigurations, reconciliationData || {}),
//     [taxConfigurations, reconciliationData]
//   );

//   // Algorithm: Filtered tax configurations
//   const filteredTaxConfigurations = useMemo(() => {
//     return taxConfigurations.filter(tax => {
//       if (filters.status !== 'all' && tax.status !== filters.status) return false;
//       if (filters.access_type !== 'all' && tax.access_type !== filters.access_type) return false;
//       if (filters.tax_type !== 'all' && tax.tax_type !== filters.tax_type) return false;
//       if (filters.search && !tax.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
//       return true;
//     });
//   }, [taxConfigurations, filters]);

//   // Algorithm: Enhanced form input handling with validation
//   const handleTaxInputChange = useCallback((field, value) => {
//     setTaxForm(prev => {
//       const newForm = {
//         ...prev,
//         [field]: value
//       };

//       // Real-time validation
//       const validationErrors = validateTaxConfiguration(newForm);
//       setFormErrors(validationErrors);

//       return newForm;
//     });
//   }, []);

//   // Algorithm: Enhanced number input handling
//   const handleNumberInput = useCallback((field, value) => {
//     // Allow only numbers and decimal point
//     const numericValue = value.replace(/[^0-9.]/g, '');
//     // Ensure only one decimal point
//     const parts = numericValue.split('.');
//     const formattedValue = parts.length > 2 
//       ? parts[0] + '.' + parts.slice(1).join('')
//       : numericValue;
    
//     handleTaxInputChange(field, formattedValue);
//   }, [handleTaxInputChange]);

//   const resetTaxForm = useCallback(() => {
//     setTaxForm({
//       name: '',
//       tax_type: 'custom',
//       rate: '',
//       description: '',
//       applies_to: 'revenue',
//       access_type: 'all',
//       is_enabled: true,
//       is_included_in_price: false,
//       requires_approval: false,
//       status: 'active',
//       effective_from: new Date().toISOString().slice(0, 16),
//       effective_to: '',
//       revision_notes: ''
//     });
//     setFormErrors({});
//     setEditingTax(null);
//   }, []);

//   // Algorithm: Enhanced tax saving with comprehensive validation and proper data formatting
//   const handleSaveTax = useCallback(async () => {
//     const validationErrors = validateTaxConfiguration(taxForm);
    
//     if (Object.keys(validationErrors).length > 0) {
//       setFormErrors(validationErrors);
//       Object.values(validationErrors).forEach(error => toast.error(error));
//       return;
//     }

//     setLoading(true);
//     try {
//       // Format data for backend - FIXED datetime formatting
//       const taxData = {
//         ...taxForm,
//         rate: parseFloat(taxForm.rate),
//         effective_from: formatDateTimeForBackend(taxForm.effective_from),
//         effective_to: taxForm.effective_to ? formatDateTimeForBackend(taxForm.effective_to) : null,
//         description: taxForm.description || null,
//         revision_notes: taxForm.revision_notes || null
//       };

//       // Clean up empty strings for optional fields
//       Object.keys(taxData).forEach(key => {
//         if (taxData[key] === '') {
//           taxData[key] = null;
//         }
//       });

//       if (editingTax) {
//         await api.patch(`/api/payments/taxes/${editingTax.id}/`, taxData);
//         toast.success('Tax configuration updated successfully');
//       } else {
//         await api.post('/api/payments/taxes/', taxData);
//         toast.success('Tax configuration created successfully');
//       }

//       setShowTaxModal(false);
//       resetTaxForm();
//       await fetchTaxConfigurations();
//       onRefresh?.();
//     } catch (error) {
//       console.error('Tax save error:', error);
      
//       // Enhanced error handling with specific messages
//       let errorMessage = 'Failed to save tax configuration';
//       let backendErrors = {};
      
//       if (error.response?.status === 400) {
//         errorMessage = 'Invalid tax data. Please check your inputs.';
//         backendErrors = error.response.data;
//       } else if (error.response?.status === 409) {
//         errorMessage = 'A tax configuration with this name already exists.';
//       } else if (error.response?.status === 500) {
//         errorMessage = 'Server error. Please try again later.';
//       } else {
//         errorMessage = error.response?.data?.error || 
//                       error.response?.data?.detail || 
//                       error.response?.data?.message ||
//                       error.message ||
//                       'Failed to save tax configuration';
//       }
      
//       toast.error(errorMessage);
      
//       // Handle validation errors from backend
//       if (error.response?.status === 400 && error.response.data) {
//         const formattedErrors = {};
//         Object.keys(error.response.data).forEach(key => {
//           if (Array.isArray(error.response.data[key])) {
//             formattedErrors[key] = error.response.data[key].join(', ');
//           } else if (typeof error.response.data[key] === 'string') {
//             formattedErrors[key] = error.response.data[key];
//           } else if (typeof error.response.data[key] === 'object') {
//             // Handle nested error objects
//             formattedErrors[key] = JSON.stringify(error.response.data[key]);
//           }
//         });
//         setFormErrors(formattedErrors);
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [taxForm, editingTax, resetTaxForm, fetchTaxConfigurations, onRefresh]);

//   // FIXED: Enhanced tax editing with proper date parsing
//   const handleEditTax = useCallback((tax) => {
//     setEditingTax(tax);
//     setTaxForm({
//       name: tax.name,
//       tax_type: tax.tax_type,
//       rate: tax.rate?.toString() || '',
//       description: tax.description || '',
//       applies_to: tax.applies_to,
//       access_type: tax.access_type,
//       is_enabled: tax.is_enabled,
//       is_included_in_price: tax.is_included_in_price,
//       requires_approval: tax.requires_approval,
//       status: tax.status,
//       effective_from: parseBackendDateTime(tax.effective_from),
//       effective_to: parseBackendDateTime(tax.effective_to),
//       revision_notes: tax.revision_notes || ''
//     });
//     setFormErrors({});
//     setShowTaxModal(true);
//   }, []);

//   // FIXED: Enhanced tax cloning with proper data structure
//   const handleCloneTax = useCallback(async (tax) => {
//     setLoading(true);
//     try {
//       const cloneData = {
//         name: `${tax.name} (Copy)`,
//         tax_type: tax.tax_type,
//         rate: parseFloat(tax.rate),
//         description: tax.description,
//         applies_to: tax.applies_to,
//         access_type: tax.access_type,
//         is_enabled: true, // Always enable cloned taxes
//         is_included_in_price: tax.is_included_in_price,
//         requires_approval: tax.requires_approval,
//         status: 'active',
//         effective_from: formatDateTimeForBackend(new Date().toISOString()),
//         revision_notes: `Cloned from ${tax.tax_code || tax.name}`
//       };

//       await api.post('/api/payments/taxes/', cloneData);
//       toast.success('Tax configuration cloned successfully');
//       await fetchTaxConfigurations();
//       onRefresh?.();
//     } catch (error) {
//       console.error('Tax clone error:', error);
      
//       let errorMessage = 'Failed to clone tax configuration';
//       if (error.response?.status === 400) {
//         errorMessage = 'Invalid clone data. Please try again.';
//       } else if (error.response?.status === 409) {
//         errorMessage = 'A tax configuration with this name already exists.';
//       }
      
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//       setCloneTax(null);
//     }
//   }, [fetchTaxConfigurations, onRefresh]);

//   // Algorithm: Enhanced tax deletion with full autonomy and proper error handling
//   const handleDeleteTax = useCallback(async () => {
//     if (!deleteTax) return;

//     setLoading(true);
//     try {
//       await api.delete(`/api/payments/taxes/${deleteTax.id}/`);
      
//       toast.success(`Tax configuration "${deleteTax.name}" deleted successfully`);
//       setDeleteTax(null);
//       await fetchTaxConfigurations();
//       onRefresh?.();
//     } catch (error) {
//       console.error('Tax deletion error:', error);
      
//       let errorMessage = 'Failed to delete tax configuration';
//       if (error.response?.status === 404) {
//         errorMessage = 'Tax configuration not found. It may have been already deleted.';
//       } else if (error.response?.status === 403) {
//         errorMessage = 'You do not have permission to delete this tax configuration.';
//       } else if (error.response?.status === 500) {
//         errorMessage = 'Server error. Please try again later.';
//       } else {
//         errorMessage = error.response?.data?.error || 
//                       error.response?.data?.detail || 
//                       'Failed to delete tax configuration';
//       }
      
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   }, [deleteTax, fetchTaxConfigurations, onRefresh]);

//   // Algorithm: Enhanced tax status management with optimistic updates
//   const handleUpdateTaxStatus = useCallback(async (tax, updates) => {
//     const originalTax = { ...tax };
    
//     // Optimistic update
//     setTaxConfigurations(prev => 
//       prev.map(t => 
//         t.id === tax.id ? { ...t, ...updates } : t
//       )
//     );

//     try {
//       // Format data for backend
//       const updateData = { ...updates };
//       if (updates.effective_from) {
//         updateData.effective_from = formatDateTimeForBackend(updates.effective_from);
//       }
//       if (updates.effective_to) {
//         updateData.effective_to = formatDateTimeForBackend(updates.effective_to);
//       }

//       await api.patch(`/api/payments/taxes/${tax.id}/`, updateData);
      
//       let message = '';
//       if (updates.hasOwnProperty('is_enabled')) {
//         message = `Tax ${updates.is_enabled ? 'enabled' : 'disabled'} successfully`;
//       } else if (updates.hasOwnProperty('status')) {
//         message = `Tax status updated to ${updates.status} successfully`;
//       } else {
//         message = 'Tax configuration updated successfully';
//       }
      
//       toast.success(message);
//       await fetchTaxConfigurations();
//       onRefresh?.();
//     } catch (error) {
//       console.error('Tax status update error:', error);
//       // Revert optimistic update
//       setTaxConfigurations(prev => 
//         prev.map(t => 
//           t.id === tax.id ? originalTax : t
//         )
//       );
      
//       let errorMessage = 'Failed to update tax configuration';
//       if (error.response?.status === 400) {
//         errorMessage = 'Invalid update data. Please check your inputs.';
//       } else if (error.response?.status === 404) {
//         errorMessage = 'Tax configuration not found.';
//       } else if (error.response?.status === 500) {
//         errorMessage = 'Server error. Please try again later.';
//       }
      
//       toast.error(errorMessage);
//     }
//   }, [fetchTaxConfigurations, onRefresh]);

//   // Algorithm: Tax simulation for preview
//   const simulateTaxImpact = useCallback((amount, accessType = 'all') => {
//     const applicableTaxes = taxConfigurations.filter(tax => 
//       tax.is_active && 
//       (tax.access_type === 'all' || tax.access_type === accessType) &&
//       (tax.applies_to === 'revenue' || tax.applies_to === 'both')
//     );

//     let totalTax = 0;
//     let breakdown = [];

//     applicableTaxes.forEach(tax => {
//       const taxAmount = tax.is_included_in_price 
//         ? amount - (amount / (1 + (parseFloat(tax.rate) || 0) / 100))
//         : amount * ((parseFloat(tax.rate) || 0) / 100);
      
//       totalTax += taxAmount;
//       breakdown.push({
//         name: tax.name,
//         rate: tax.rate,
//         amount: taxAmount,
//         isIncluded: tax.is_included_in_price,
//         type: tax.tax_type
//       });
//     });

//     return {
//       totalTax,
//       breakdown,
//       netAmount: amount - totalTax,
//       grossAmount: applicableTaxes.some(tax => tax.is_included_in_price) ? amount : amount + totalTax
//     };
//   }, [taxConfigurations]);

//   // Enhanced TaxCard Component with FIXED date rendering
//   const TaxCard = ({ tax }) => {
//     const isActive = tax.is_active;
//     const isEffective = isTaxEffective(tax);
    
//     // FIXED: Safe date rendering
//     const renderDate = (dateValue) => {
//       try {
//         return formatDate(dateValue);
//       } catch (error) {
//         console.error('Date rendering error:', error, dateValue);
//         return 'Invalid Date';
//       }
//     };
    
//     return (
//       <div className={`p-4 rounded-lg border transition-all duration-300 ${
//         theme === "dark" 
//           ? `bg-gray-700/30 ${isActive ? (isEffective ? 'border-green-600' : 'border-yellow-600') : 'border-gray-600'} hover:bg-gray-700/50` 
//           : `bg-white ${isActive ? (isEffective ? 'border-green-200' : 'border-yellow-200') : 'border-gray-200'} hover:bg-gray-50`
//       }`}>
//         <div className="flex items-start justify-between mb-3">
//           <div className="flex-1 min-w-0">
//             <div className="flex items-center space-x-2 mb-1">
//               <h4 className={`font-semibold truncate ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//                 {tax.name}
//               </h4>
//               {tax.tax_code && (
//                 <span className={`text-xs px-1.5 py-0.5 rounded ${
//                   theme === "dark" ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-600"
//                 }`}>
//                   <FaCode className="inline w-3 h-3 mr-1" />
//                   {tax.tax_code}
//                 </span>
//               )}
//             </div>
            
//             <div className="flex flex-wrap items-center gap-1 mb-2">
//               <span className={`text-sm px-2 py-1 rounded-full ${
//                 theme === "dark" 
//                   ? `${isActive ? (isEffective ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300') : 'bg-gray-600 text-gray-300'}` 
//                   : `${isActive ? (isEffective ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800') : 'bg-gray-200 text-gray-600'}`
//               }`}>
//                 {tax.rate}%
//               </span>
              
//               <span className={`text-xs px-2 py-1 rounded-full ${
//                 theme === "dark" ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-800"
//               }`}>
//                 {tax.tax_type_display || tax.tax_type}
//               </span>

//               {!isEffective && isActive && (
//                 <span className={`text-xs px-2 py-1 rounded-full ${
//                   theme === "dark" ? "bg-yellow-900 text-yellow-300" : "bg-yellow-100 text-yellow-800"
//                 }`}>
//                   <Clock className="inline w-3 h-3 mr-1" />
//                   Not Effective
//                 </span>
//               )}

//               {tax.requires_approval && (
//                 <span className={`text-xs px-2 py-1 rounded-full ${
//                   theme === "dark" ? "bg-purple-900 text-purple-300" : "bg-purple-100 text-purple-800"
//                 }`}>
//                   Requires Approval
//                 </span>
//               )}
//             </div>
//           </div>
          
//           <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
//             {/* Status Toggle */}
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 handleUpdateTaxStatus(tax, { is_enabled: !tax.is_enabled });
//               }}
//               className={`p-1 rounded ${
//                 tax.is_enabled 
//                   ? "text-green-500 hover:text-green-600" 
//                   : "text-gray-400 hover:text-gray-500"
//               }`}
//               title={tax.is_enabled ? 'Disable Tax' : 'Enable Tax'}
//             >
//               {tax.is_enabled ? <FaToggleOn className="w-5 h-5" /> : <FaToggleOff className="w-5 h-5" />}
//             </button>
            
//             {/* Edit Button */}
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 handleEditTax(tax);
//               }}
//               className={`p-1 rounded ${
//                 theme === "dark" 
//                   ? "text-blue-400 hover:text-blue-300" 
//                   : "text-blue-600 hover:text-blue-800"
//               }`}
//               title="Edit Tax"
//             >
//               <FaEdit className="w-4 h-4" />
//             </button>

//             {/* Clone Button */}
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setCloneTax(tax);
//               }}
//               className={`p-1 rounded ${
//                 theme === "dark" 
//                   ? "text-green-400 hover:text-green-300" 
//                   : "text-green-600 hover:text-green-800"
//               }`}
//               title="Clone Tax"
//             >
//               <Copy className="w-4 h-4" />
//             </button>
            
//             {/* Delete Button - Full Autonomy */}
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setDeleteTax(tax);
//               }}
//               className={`p-1 rounded text-red-500 hover:text-red-600`}
//               title="Delete Tax"
//             >
//               <FaTrash className="w-4 h-4" />
//             </button>
//           </div>
//         </div>

//         <div className="space-y-2 text-sm">
//           <div className="flex justify-between">
//             <span className={textSecondaryClass}>Applies To</span>
//             <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
//               {tax.applies_to_display || tax.applies_to}
//             </span>
//           </div>
          
//           <div className="flex justify-between">
//             <span className={textSecondaryClass}>Access Type</span>
//             <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
//               <AccessTypeBadge accessType={tax.access_type} theme={theme} size="sm" />
//             </span>
//           </div>

//           <div className="flex justify-between">
//             <span className={textSecondaryClass}>Status</span>
//             <span className={`text-xs px-2 py-1 rounded-full ${
//               tax.status === 'active' 
//                 ? (theme === "dark" ? "bg-green-900 text-green-300" : "bg-green-100 text-green-800")
//                 : tax.status === 'inactive'
//                 ? (theme === "dark" ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-600")
//                 : (theme === "dark" ? "bg-yellow-900 text-yellow-300" : "bg-yellow-100 text-yellow-800")
//             }`}>
//               {tax.status_display || tax.status}
//             </span>
//           </div>
          
//           {tax.description && (
//             <div className="text-sm">
//               <span className={textSecondaryClass}>Description: </span>
//               <span className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
//                 {tax.description}
//               </span>
//             </div>
//           )}
          
//           <div className="flex justify-between">
//             <span className={textSecondaryClass}>Price Inclusion</span>
//             <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
//               {tax.is_included_in_price ? 'Included' : 'Added'}
//             </span>
//           </div>

//           {/* Effective Period - FIXED date rendering */}
//           <div className="flex justify-between">
//             <span className={textSecondaryClass}>Effective From</span>
//             <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
//               {renderDate(tax.effective_from)}
//             </span>
//           </div>

//           {tax.effective_to && (
//             <div className="flex justify-between">
//               <span className={textSecondaryClass}>Effective To</span>
//               <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
//                 {renderDate(tax.effective_to)}
//               </span>
//             </div>
//           )}

//           {/* Audit Information */}
//           <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
//             <div className="flex justify-between text-xs">
//               <span className={textSecondaryClass}>Created</span>
//               <span className={textSecondaryClass}>
//                 {tax.created_by_name && (
//                   <><FaUser className="inline w-3 h-3 mr-1" />{tax.created_by_name} • </>
//                 )}
//                 {renderDate(tax.created_at)}
//               </span>
//             </div>
//             {tax.updated_at && (
//               <div className="flex justify-between text-xs mt-1">
//                 <span className={textSecondaryClass}>Updated</span>
//                 <span className={textSecondaryClass}>{renderDate(tax.updated_at)}</span>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Quick Actions */}
//         <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
//           <span className={`text-xs ${textSecondaryClass}`}>
//             v{tax.version} • {tax.is_active ? (isEffective ? 'Active' : 'Scheduled') : 'Inactive'}
//           </span>
//           <div className="flex space-x-1">
//             <button
//               onClick={() => {
//                 const simulation = simulateTaxImpact(1000, tax.access_type);
//                 toast.success(
//                   `KES 1,000 → KES ${simulation.netAmount.toFixed(2)} net with ${simulation.breakdown.length} tax(es)`
//                 );
//               }}
//               className={`text-xs px-2 py-1 rounded ${
//                 theme === "dark" ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-200 hover:bg-gray-300"
//               }`}
//             >
//               Test
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className={`${cardClass} p-6 transition-colors duration-300`}>
//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
//           <div className="flex-1">
//             <h2 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"} mb-2 flex items-center`}>
//               <FaChartBar className="mr-2" /> Tax Configuration Management
//             </h2>
//             <p className={textSecondaryClass}>
//               Configure and manage tax rules across different access types and revenue streams with full autonomy
//             </p>
//           </div>
          
//           <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
//             <button
//               onClick={fetchTaxConfigurations}
//               disabled={taxesLoading}
//               className={`flex items-center justify-center px-4 py-2 rounded-lg ${
//                 theme === "dark" 
//                   ? "bg-gray-700 hover:bg-gray-600 text-white" 
//                   : "bg-gray-200 hover:bg-gray-300 text-gray-800"
//               } disabled:opacity-50 transition-colors duration-200`}
//             >
//               {taxesLoading ? (
//                 <FaSpinner className="animate-spin mr-2" />
//               ) : (
//                 <FaSpinner className="mr-2" />
//               )}
//               Refresh
//             </button>
//             <button
//               onClick={() => setShowTaxModal(true)}
//               className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
//             >
//               <FaPlus className="mr-2" />
//               Add Tax
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className={`${cardClass} p-6 transition-colors duration-300`}>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
//           <div>
//             <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//               Status
//             </label>
//             <EnhancedSelect
//               value={filters.status}
//               onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
//               options={statusFilterOptions}
//               theme={theme}
//             />
//           </div>
          
//           <div>
//             <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//               Access Type
//             </label>
//             <EnhancedSelect
//               value={filters.access_type}
//               onChange={(value) => setFilters(prev => ({ ...prev, access_type: value }))}
//               options={accessTypeOptions}
//               theme={theme}
//             />
//           </div>

//           <div>
//             <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//               Tax Type
//             </label>
//             <EnhancedSelect
//               value={filters.tax_type}
//               onChange={(value) => setFilters(prev => ({ ...prev, tax_type: value }))}
//               options={[{ value: 'all', label: 'All Types' }, ...taxTypeOptions]}
//               theme={theme}
//             />
//           </div>

//           <div className="sm:col-span-2 lg:col-span-2">
//             <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//               Search Taxes
//             </label>
//             <input
//               type="text"
//               value={filters.search}
//               onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
//               className={`${inputClass} w-full px-3 py-2 rounded-lg`}
//               placeholder="Search by name, tax code, or description..."
//             />
//           </div>
//         </div>
//       </div>

//       {/* Tax Impact Overview */}
//       {taxConfigurations.length > 0 && (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
//           <div className={`p-4 rounded-lg border-l-4 ${
//             theme === "dark" ? "border-blue-500 bg-blue-900/20" : "border-blue-500 bg-blue-50"
//           }`}>
//             <h3 className={`text-sm ${textSecondaryClass} mb-1`}>Active Taxes</h3>
//             <p className={`text-2xl font-bold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
//               {taxImpact.activeCount}
//             </p>
//             <p className={`text-xs ${textSecondaryClass}`}>
//               {taxImpact.enabledCount} enabled • {taxImpact.disabledCount} disabled
//             </p>
//           </div>
          
//           <div className={`p-4 rounded-lg border-l-4 ${
//             theme === "dark" ? "border-green-500 bg-green-900/20" : "border-green-500 bg-green-50"
//           }`}>
//             <h3 className={`text-sm ${textSecondaryClass} mb-1`}>Revenue Impact</h3>
//             <p className={`text-2xl font-bold ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
//               {typeof taxImpact.totalRevenueTax === 'number' ? taxImpact.totalRevenueTax.toFixed(1) : '0.0'}%
//             </p>
//             <p className={`text-xs ${textSecondaryClass}`}>Total rate on revenue</p>
//           </div>
          
//           <div className={`p-4 rounded-lg border-l-4 ${
//             theme === "dark" ? "border-purple-500 bg-purple-900/20" : "border-purple-500 bg-purple-50"
//           }`}>
//             <h3 className={`text-sm ${textSecondaryClass} mb-1`}>Expense Impact</h3>
//             <p className={`text-2xl font-bold ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`}>
//               {typeof taxImpact.totalExpenseTax === 'number' ? taxImpact.totalExpenseTax.toFixed(1) : '0.0'}%
//             </p>
//             <p className={`text-xs ${textSecondaryClass}`}>Total rate on expenses</p>
//           </div>
          
//           <div className={`p-4 rounded-lg border-l-4 ${
//             theme === "dark" ? "border-yellow-500 bg-yellow-900/20" : "border-yellow-500 bg-yellow-50"
//           }`}>
//             <h3 className={`text-sm ${textSecondaryClass} mb-1`}>Configurations</h3>
//             <p className={`text-2xl font-bold ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"}`}>
//               {taxConfigurations.length}
//             </p>
//             <p className={`text-xs ${textSecondaryClass}`}>
//               {taxImpact.archivedCount} archived
//             </p>
//           </div>
//         </div>
//       )}

//       {/* Recommendations */}
//       {taxRecommendations.length > 0 && (
//         <div className={`${cardClass} p-6 transition-colors duration-300`}>
//           <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"} flex items-center`}>
//             <FaExclamationTriangle className="mr-2 text-yellow-500" />
//             Configuration Recommendations
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {taxRecommendations.slice(0, 6).map((rec, index) => (
//               <div 
//                 key={index}
//                 className={`p-3 rounded-lg border ${
//                   rec.priority === 'high' 
//                     ? (theme === "dark" ? "border-red-600 bg-red-900/20" : "border-red-200 bg-red-50")
//                     : rec.priority === 'medium'
//                     ? (theme === "dark" ? "border-yellow-600 bg-yellow-900/20" : "border-yellow-200 bg-yellow-50")
//                     : (theme === "dark" ? "border-blue-600 bg-blue-900/20" : "border-blue-200 bg-blue-50")
//                 }`}
//               >
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <h4 className={`font-medium text-sm ${
//                       rec.priority === 'high' 
//                         ? (theme === "dark" ? "text-red-300" : "text-red-700")
//                         : rec.priority === 'medium'
//                         ? (theme === "dark" ? "text-yellow-300" : "text-yellow-700")
//                         : (theme === "dark" ? "text-blue-300" : "text-blue-700")
//                     }`}>
//                       {rec.message}
//                     </h4>
//                     <p className={`text-xs mt-1 ${
//                       theme === "dark" ? "text-gray-400" : "text-gray-600"
//                     }`}>
//                       {rec.action}
//                     </p>
//                   </div>
//                   <span className={`text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0 ${
//                     rec.priority === 'high' 
//                       ? (theme === "dark" ? "bg-red-900 text-red-300" : "bg-red-100 text-red-800")
//                       : rec.priority === 'medium'
//                       ? (theme === "dark" ? "bg-yellow-900 text-yellow-300" : "bg-yellow-100 text-yellow-800")
//                       : (theme === "dark" ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-800")
//                   }`}>
//                     {rec.priority}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Tax Configuration Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
//         {taxesLoading ? (
//           // Enhanced Loading State
//           Array.from({ length: 6 }).map((_, index) => (
//             <div 
//               key={index}
//               className={`p-4 rounded-lg border animate-pulse ${
//                 theme === "dark" ? "bg-gray-700/30 border-gray-600" : "bg-gray-100 border-gray-200"
//               }`}
//             >
//               <div className="flex items-center justify-between mb-3">
//                 <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-3/4"></div>
//                 <div className="h-6 bg-gray-400 dark:bg-gray-600 rounded w-1/4"></div>
//               </div>
//               <div className="space-y-2">
//                 {Array.from({ length: 6 }).map((_, i) => (
//                   <div key={i} className="flex justify-between">
//                     <div className="h-3 bg-gray-400 dark:bg-gray-600 rounded w-1/3"></div>
//                     <div className="h-3 bg-gray-400 dark:bg-gray-600 rounded w-1/4"></div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ))
//         ) : filteredTaxConfigurations.length > 0 ? (
//           filteredTaxConfigurations.map((tax) => (
//             <TaxCard key={tax.id} tax={tax} />
//           ))
//         ) : (
//           <div className={`col-span-3 p-8 text-center rounded-lg border-2 border-dashed ${
//             theme === "dark" ? "border-gray-600" : "border-gray-300"
//           }`}>
//             <FaPlus className={`w-12 h-12 mx-auto mb-4 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
//             <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//               {filters.search || filters.status !== 'all' || filters.access_type !== 'all' || filters.tax_type !== 'all' 
//                 ? 'No matching tax configurations found' 
//                 : 'No Tax Configurations'
//               }
//             </h3>
//             <p className={textSecondaryClass}>
//               {filters.search || filters.status !== 'all' || filters.access_type !== 'all' || filters.tax_type !== 'all'
//                 ? 'Try adjusting your filters or search terms'
//                 : 'Get started by creating your first tax configuration to manage revenue and expense taxes'
//               }
//             </p>
//             {(filters.search || filters.status !== 'all' || filters.access_type !== 'all' || filters.tax_type !== 'all') && (
//               <button
//                 onClick={() => setFilters({
//                   status: 'all',
//                   access_type: 'all',
//                   tax_type: 'all',
//                   search: ''
//                 })}
//                 className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
//               >
//                 Clear Filters
//               </button>
//             )}
//             {!filters.search && filters.status === 'all' && filters.access_type === 'all' && filters.tax_type === 'all' && (
//               <button
//                 onClick={() => setShowTaxModal(true)}
//                 className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
//               >
//                 Create First Tax
//               </button>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Enhanced Tax Analytics */}
//       {taxConfigurations.length > 0 && (
//         <div className={`${cardClass} p-6 transition-colors duration-300`}>
//           <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//             Tax Configuration Analytics
//           </h3>
//           <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
//             {/* By Tax Type */}
//             <div className={`p-4 rounded-lg ${
//               theme === "dark" ? "bg-blue-900/20 border-blue-700" : "bg-blue-50 border-blue-200"
//             } border`}>
//               <h4 className={`text-sm font-medium mb-3 ${theme === "dark" ? "text-blue-300" : "text-blue-700"} flex items-center`}>
//                 <FaChartBar className="mr-2" /> By Tax Type
//               </h4>
//               <div className="space-y-2">
//                 {Object.entries(taxImpact.byTaxType).map(([type, data]) => (
//                   <div key={type} className="flex justify-between items-center text-sm">
//                     <span className="capitalize">{type.replace('_', ' ')}</span>
//                     <div className="text-right">
//                       <div className="font-semibold">{data.count} configs</div>
//                       <div className={`text-xs ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
//                         {data.totalRate.toFixed(1)}% total
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
            
//             {/* By Access Type */}
//             <div className={`p-4 rounded-lg ${
//               theme === "dark" ? "bg-green-900/20 border-green-700" : "bg-green-50 border-green-200"
//             } border`}>
//               <h4 className={`text-sm font-medium mb-3 ${theme === "dark" ? "text-green-300" : "text-green-700"} flex items-center`}>
//                 <BarChart3 className="mr-2" /> By Access Type
//               </h4>
//               <div className="space-y-2">
//                 {Object.entries(taxImpact.byAccessType).map(([accessType, data]) => (
//                   <div key={accessType} className="flex justify-between items-center text-sm">
//                     <span>
//                       <AccessTypeBadge accessType={accessType} theme={theme} size="sm" />
//                     </span>
//                     <div className="text-right">
//                       <div className="font-semibold">{data.count}</div>
//                       <div className={`text-xs ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
//                         Rev: {data.revenue.toFixed(1)}%
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
            
//             {/* Status Overview */}
//             <div className={`p-4 rounded-lg ${
//               theme === "dark" ? "bg-yellow-900/20 border-yellow-700" : "bg-yellow-50 border-yellow-200"
//             } border`}>
//               <h4 className={`text-sm font-medium mb-3 ${theme === "dark" ? "text-yellow-300" : "text-yellow-700"} flex items-center`}>
//                 <FaToggleOn className="mr-2" /> Status Overview
//               </h4>
//               <div className="space-y-3">
//                 <div className="flex justify-between items-center">
//                   <span>Active & Effective</span>
//                   <span className="font-semibold text-green-500">{taxImpact.activeCount}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span>Inactive</span>
//                   <span className="font-semibold text-gray-500">{taxImpact.disabledCount}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span>Archived</span>
//                   <span className="font-semibold text-yellow-500">{taxImpact.archivedCount}</span>
//                 </div>
//                 <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
//                   <div 
//                     className="bg-green-500 h-2 rounded-full transition-all duration-500"
//                     style={{ 
//                       width: `${(taxImpact.activeCount / taxConfigurations.length) * 100}%` 
//                     }}
//                   ></div>
//                 </div>
//                 <div className="text-xs text-center text-gray-500 dark:text-gray-400">
//                   {((taxImpact.activeCount / taxConfigurations.length) * 100).toFixed(1)}% Active
//                 </div>
//               </div>
//             </div>

//             {/* Quick Actions */}
//             <div className={`p-4 rounded-lg ${
//               theme === "dark" ? "bg-purple-900/20 border-purple-700" : "bg-purple-50 border-purple-200"
//             } border`}>
//               <h4 className={`text-sm font-medium mb-3 ${theme === "dark" ? "text-purple-300" : "text-purple-700"} flex items-center`}>
//                 <FaMoneyBillWave className="mr-2" /> Quick Actions
//               </h4>
//               <div className="space-y-2">
//                 <button
//                   onClick={() => setShowTaxModal(true)}
//                   className="w-full text-left p-2 rounded hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors duration-200"
//                 >
//                   + Create New Tax
//                 </button>
//                 <button
//                   onClick={fetchTaxConfigurations}
//                   className="w-full text-left p-2 rounded hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors duration-200"
//                 >
//                   ↻ Refresh Data
//                 </button>
//                 <button
//                   onClick={() => {
//                     const simulation = simulateTaxImpact(5000, 'all');
//                     toast.success(`Tax simulation: KES 5,000 → KES ${simulation.netAmount.toFixed(2)} net`);
//                   }}
//                   className="w-full text-left p-2 rounded hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors duration-200"
//                 >
//                   🧪 Test Tax Calculation
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Modals */}
//       <TaxFormModal
//         showTaxModal={showTaxModal}
//         setShowTaxModal={setShowTaxModal}
//         editingTax={editingTax}
//         taxForm={taxForm}
//         handleTaxInputChange={handleTaxInputChange}
//         handleNumberInput={handleNumberInput}
//         formErrors={formErrors}
//         setFormErrors={setFormErrors}
//         theme={theme}
//         cardClass={cardClass}
//         inputClass={inputClass}
//         handleSaveTax={handleSaveTax}
//         loading={loading}
//         resetTaxForm={resetTaxForm}
//         taxTypeOptions={taxTypeOptions}
//         appliesToOptions={appliesToOptions}
//         accessTypeOptions={accessTypeOptions}
//         statusOptions={statusOptions}
//       />
      
//       <ConfirmationModal
//         isOpen={!!deleteTax}
//         onClose={() => setDeleteTax(null)}
//         onConfirm={handleDeleteTax}
//         title="Delete Tax Configuration"
//         message={`Are you sure you want to delete the tax configuration "${deleteTax?.name}"? This action cannot be undone and will be permanently removed from the system.`}
//         confirmText="Delete Tax Configuration"
//         type="danger"
//         theme={theme}
//       />

//       <ConfirmationModal
//         isOpen={!!cloneTax}
//         onClose={() => setCloneTax(null)}
//         onConfirm={() => handleCloneTax(cloneTax)}
//         title="Clone Tax Configuration"
//         message={`Create a copy of "${cloneTax?.name}" tax configuration? The clone will have "(Copy)" appended to its name.`}
//         confirmText="Clone Tax"
//         type="info"
//         theme={theme}
//       />
//     </div>
//   );
// };

// export default TaxConfigurationPanel;











// import React, { useState, useCallback, useMemo, useEffect } from 'react';
// import { 
//   FaPlus, 
//   FaEdit, 
//   FaTrash, 
//   FaSave, 
//   FaTimes, 
//   FaToggleOn, 
//   FaToggleOff, 
//   FaSpinner, 
//   FaExclamationTriangle, 
//   FaChartBar, 
//   FaMoneyBillWave, 
//   FaReceipt, 
//   FaCalendar,
//   FaUser,
//   FaCode 
// } from 'react-icons/fa';
// import { TrendingUp, TrendingDown, BarChart3, Calculator, Clock, Archive, Copy, Download, Upload } from 'lucide-react';
// import { toast } from 'react-hot-toast';
// import api from '../../../api';
// import { EnhancedSelect, ConfirmationModal, AccessTypeBadge } from '../../ServiceManagement/Shared/components';

// // Algorithm: Enhanced tax impact calculation with access type breakdown
// const calculateTaxImpact = (taxes, reconciliationData) => {
//   const impact = {
//     totalRevenueTax: 0,
//     totalExpenseTax: 0,
//     byAccessType: {
//       hotspot: { revenue: 0, expenses: 0, count: 0 },
//       pppoe: { revenue: 0, expenses: 0, count: 0 },
//       both: { revenue: 0, expenses: 0, count: 0 },
//       all: { revenue: 0, expenses: 0, count: 0 }
//     },
//     byTaxType: {},
//     enabledCount: 0,
//     disabledCount: 0,
//     activeCount: 0,
//     archivedCount: 0
//   };

//   taxes.forEach(tax => {
//     // Count by status - FIXED: Properly count enabled/disabled taxes
//     if (tax.is_enabled) {
//       impact.enabledCount++;
//       if (tax.status === 'active') {
//         impact.activeCount++;
//       }
//     } else {
//       impact.disabledCount++;
//     }
    
//     if (tax.status === 'archived') {
//       impact.archivedCount++;
//     }

//     // Calculate tax impact for enabled taxes only
//     if (tax.is_enabled && tax.status === 'active') {
//       const appliesToRevenue = tax.applies_to === 'revenue' || tax.applies_to === 'both';
//       const appliesToExpenses = tax.applies_to === 'expenses' || tax.applies_to === 'both';
      
//       if (appliesToRevenue) {
//         impact.totalRevenueTax += parseFloat(tax.rate) || 0;
//         impact.byAccessType[tax.access_type].revenue += parseFloat(tax.rate) || 0;
//       }
      
//       if (appliesToExpenses) {
//         impact.totalExpenseTax += parseFloat(tax.rate) || 0;
//         impact.byAccessType[tax.access_type].expenses += parseFloat(tax.rate) || 0;
//       }

//       // Count by access type
//       impact.byAccessType[tax.access_type].count++;

//       // Group by tax type
//       if (!impact.byTaxType[tax.tax_type]) {
//         impact.byTaxType[tax.tax_type] = {
//           totalRate: 0,
//           count: 0,
//           revenueRate: 0,
//           expenseRate: 0
//         };
//       }
//       impact.byTaxType[tax.tax_type].totalRate += parseFloat(tax.rate) || 0;
//       impact.byTaxType[tax.tax_type].count++;
      
//       if (appliesToRevenue) impact.byTaxType[tax.tax_type].revenueRate += parseFloat(tax.rate) || 0;
//       if (appliesToExpenses) impact.byTaxType[tax.tax_type].expenseRate += parseFloat(tax.rate) || 0;
//     }
//   });

//   return impact;
// };

// // Algorithm: Enhanced tax configuration validation
// const validateTaxConfiguration = (taxForm) => {
//   const errors = {};

//   if (!taxForm.name?.trim()) {
//     errors.name = 'Tax name is required';
//   } else if (taxForm.name.length > 100) {
//     errors.name = 'Tax name cannot exceed 100 characters';
//   }

//   const rate = parseFloat(taxForm.rate);
//   if (isNaN(rate) || rate < 0 || rate > 100) {
//     errors.rate = 'Tax rate must be a number between 0 and 100';
//   } else if (rate > 50 && !taxForm.requires_approval) {
//     errors.requires_approval = 'Tax rates above 50% require special approval';
//   }

//   // Validate effective dates
//   if (taxForm.effective_to && taxForm.effective_from) {
//     const fromDate = new Date(taxForm.effective_from);
//     const toDate = new Date(taxForm.effective_to);
//     if (toDate < fromDate) {
//       errors.effective_to = 'End date cannot be before start date';
//     }
//   }

//   return errors;
// };

// // Algorithm: Generate intelligent tax recommendations
// const generateTaxRecommendations = (taxes, reconciliationData) => {
//   const recommendations = [];
//   const { access_type_breakdown } = reconciliationData || {};

//   // Check tax coverage by access type
//   const accessTypes = ['hotspot', 'pppoe', 'both'];
//   const activeTaxesByAccessType = {};
  
//   taxes.filter(t => t.is_enabled && t.status === 'active').forEach(tax => {
//     if (!activeTaxesByAccessType[tax.access_type]) {
//       activeTaxesByAccessType[tax.access_type] = [];
//     }
//     activeTaxesByAccessType[tax.access_type].push(tax);
//   });

//   accessTypes.forEach(accessType => {
//     const hasCoverage = activeTaxesByAccessType[accessType] || activeTaxesByAccessType.all;
//     const revenue = access_type_breakdown?.[accessType]?.revenue || 0;
    
//     if (!hasCoverage && revenue > 0) {
//       recommendations.push({
//         type: 'coverage_gap',
//         message: `No active taxes for ${accessType} access type with revenue`,
//         priority: revenue > 1000 ? 'high' : 'medium',
//         action: `Configure tax for ${accessType}`,
//         accessType
//       });
//     }
//   });

//   // Check for expired or expiring taxes
//   const now = new Date();
//   const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
//   taxes.filter(tax => tax.effective_to).forEach(tax => {
//     const effectiveTo = new Date(tax.effective_to);
//     if (effectiveTo < now && tax.is_enabled && tax.status === 'active') {
//       recommendations.push({
//         type: 'expired',
//         message: `Tax "${tax.name}" has expired`,
//         priority: 'medium',
//         action: 'Update or archive tax',
//         taxId: tax.id
//       });
//     } else if (effectiveTo < thirtyDaysFromNow && tax.is_enabled && tax.status === 'active') {
//       recommendations.push({
//         type: 'expiring_soon',
//         message: `Tax "${tax.name}" expires in less than 30 days`,
//         priority: 'low',
//         action: 'Review expiration date',
//         taxId: tax.id
//       });
//     }
//   });

//   // Check for high tax rates without approval
//   taxes.filter(tax => tax.rate > 50 && !tax.requires_approval && tax.is_enabled && tax.status === 'active').forEach(tax => {
//     recommendations.push({
//       type: 'high_rate',
//       message: `Tax "${tax.name}" has high rate (${tax.rate}%) without approval flag`,
//       priority: 'medium',
//       action: 'Mark as requiring approval',
//       taxId: tax.id
//     });
//   });

//   // Check for disabled taxes that should be active
//   taxes.filter(tax => !tax.is_enabled && tax.status === 'active').forEach(tax => {
//     recommendations.push({
//       type: 'disabled_active',
//       message: `Tax "${tax.name}" is disabled but marked as active`,
//       priority: 'low',
//       action: 'Enable or archive tax',
//       taxId: tax.id
//     });
//   });

//   return recommendations.sort((a, b) => {
//     const priorityOrder = { high: 3, medium: 2, low: 1 };
//     return priorityOrder[b.priority] - priorityOrder[a.priority];
//   });
// };

// // Algorithm: Format date for display - FIXED to handle objects
// const formatDate = (dateValue) => {
//   if (!dateValue) return 'Indefinite';
  
//   // Handle both string dates and objects with effective_from property
//   let dateString;
//   if (typeof dateValue === 'object' && dateValue !== null) {
//     // If it's an object with effective_from property (common error case)
//     if (dateValue.effective_from) {
//       dateString = dateValue.effective_from;
//     } else {
//       return 'Invalid Date';
//     }
//   } else {
//     dateString = dateValue;
//   }
  
//   try {
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) return 'Invalid Date';
    
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   } catch (error) {
//     console.error('Date formatting error:', error);
//     return 'Invalid Date';
//   }
// };

// // Algorithm: Check if tax is currently effective
// const isTaxEffective = (tax) => {
//   const now = new Date();
  
//   // Safely parse effective_from
//   let effectiveFrom;
//   if (typeof tax.effective_from === 'object' && tax.effective_from !== null) {
//     effectiveFrom = new Date(tax.effective_from.effective_from || tax.effective_from);
//   } else {
//     effectiveFrom = new Date(tax.effective_from);
//   }
  
//   // Safely parse effective_to
//   let effectiveTo = null;
//   if (tax.effective_to) {
//     if (typeof tax.effective_to === 'object' && tax.effective_to !== null) {
//       effectiveTo = new Date(tax.effective_to.effective_to || tax.effective_to);
//     } else {
//       effectiveTo = new Date(tax.effective_to);
//     }
//   }
  
//   return effectiveFrom <= now && (!effectiveTo || effectiveTo >= now);
// };

// // Algorithm: Get current datetime in local format for form inputs
// const getCurrentDateTimeLocal = () => {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = String(now.getMonth() + 1).padStart(2, '0');
//   const day = String(now.getDate()).padStart(2, '0');
//   const hours = String(now.getHours()).padStart(2, '0');
//   const minutes = String(now.getMinutes()).padStart(2, '0');
  
//   return `${year}-${month}-${day}T${hours}:${minutes}`;
// };

// // Algorithm: Convert datetime-local format to backend format
// const formatDateTimeForBackend = (dateTimeString) => {
//   if (!dateTimeString) return null;
  
//   try {
//     const date = new Date(dateTimeString);
//     return date.toISOString().slice(0, 19).replace('T', ' ');
//   } catch (error) {
//     console.error('DateTime formatting error:', error);
//     return null;
//   }
// };

// // Algorithm: Parse backend datetime to local format
// const parseBackendDateTime = (backendDateTime) => {
//   if (!backendDateTime) return '';
  
//   try {
//     // Handle both ISO format and custom backend format
//     const date = new Date(backendDateTime);
//     if (isNaN(date.getTime())) return '';
    
//     // Convert to datetime-local format (YYYY-MM-DDTHH:MM)
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');
//     const hours = String(date.getHours()).padStart(2, '0');
//     const minutes = String(date.getMinutes()).padStart(2, '0');
    
//     return `${year}-${month}-${day}T${hours}:${minutes}`;
//   } catch (error) {
//     console.error('DateTime parsing error:', error);
//     return '';
//   }
// };

// // Enhanced TaxFormModal Component
// const TaxFormModal = ({ 
//   showTaxModal, 
//   setShowTaxModal, 
//   editingTax, 
//   taxForm, 
//   handleTaxInputChange, 
//   handleNumberInput, 
//   formErrors, 
//   setFormErrors, 
//   theme, 
//   cardClass, 
//   inputClass, 
//   handleSaveTax, 
//   loading, 
//   resetTaxForm, 
//   taxTypeOptions, 
//   appliesToOptions, 
//   accessTypeOptions,
//   statusOptions 
// }) => {
//   if (!showTaxModal) return null;

//   return (
//     <div className={`fixed inset-0 z-50 overflow-y-auto ${theme === "dark" ? "bg-gray-900 bg-opacity-75" : "bg-gray-500 bg-opacity-75"}`}>
//       <div className="flex items-center justify-center min-h-screen p-4 sm:p-6">
//         <div className={`${cardClass} w-full max-w-4xl transform transition-all max-h-[90vh] overflow-y-auto`}>
//           <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-inherit z-10">
//             <div className="flex items-center justify-between">
//               <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//                 {editingTax ? 'Edit Tax Configuration' : 'Create New Tax Configuration'}
//               </h3>
//               <button
//                 onClick={() => {
//                   setShowTaxModal(false);
//                   resetTaxForm();
//                 }}
//                 className={`p-1 rounded-full ${theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"}`}
//               >
//                 <FaTimes className="w-5 h-5" />
//               </button>
//             </div>
//           </div>

//           <div className="p-4 sm:p-6 space-y-6">
//             {/* Basic Information */}
//             <div>
//               <h4 className={`text-md font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//                 Basic Information
//               </h4>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                     Tax Name *
//                   </label>
//                   <input
//                     type="text"
//                     value={taxForm.name}
//                     onChange={(e) => handleTaxInputChange('name', e.target.value)}
//                     className={`${inputClass} w-full px-3 py-2 rounded-lg ${
//                       formErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
//                     }`}
//                     placeholder="e.g., VAT, Service Tax, Withholding"
//                     maxLength={100}
//                   />
//                   {formErrors.name && (
//                     <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                     Tax Type
//                   </label>
//                   <EnhancedSelect
//                     value={taxForm.tax_type}
//                     onChange={(value) => handleTaxInputChange('tax_type', value)}
//                     options={taxTypeOptions}
//                     theme={theme}
//                   />
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                     Tax Rate (%) *
//                   </label>
//                   <input
//                     type="text"
//                     value={taxForm.rate}
//                     onChange={(e) => handleNumberInput('rate', e.target.value)}
//                     className={`${inputClass} w-full px-3 py-2 rounded-lg ${
//                       formErrors.rate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
//                     }`}
//                     placeholder="e.g., 16 for 16%"
//                     inputMode="decimal"
//                   />
//                   {formErrors.rate && (
//                     <p className="text-red-500 text-xs mt-1">{formErrors.rate}</p>
//                   )}
//                   {taxForm.rate && !formErrors.rate && (
//                     <p className={`text-xs mt-1 ${
//                       parseFloat(taxForm.rate) > 30 ? 'text-yellow-600' : 'text-green-600'
//                     }`}>
//                       {parseFloat(taxForm.rate) > 30 ? '⚠️ Rate seems high' : '✓ Valid rate'}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                     Applies To
//                   </label>
//                   <EnhancedSelect
//                     value={taxForm.applies_to}
//                     onChange={(value) => handleTaxInputChange('applies_to', value)}
//                     options={appliesToOptions}
//                     theme={theme}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Scope and Settings */}
//             <div>
//               <h4 className={`text-md font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//                 Scope and Settings
//               </h4>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                     Access Type Scope
//                   </label>
//                   <EnhancedSelect
//                     value={taxForm.access_type}
//                     onChange={(value) => handleTaxInputChange('access_type', value)}
//                     options={accessTypeOptions}
//                     theme={theme}
//                   />
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                     Status
//                   </label>
//                   <EnhancedSelect
//                     value={taxForm.status}
//                     onChange={(value) => handleTaxInputChange('status', value)}
//                     options={statusOptions}
//                     theme={theme}
//                   />
//                 </div>

//                 <div className="sm:col-span-2">
//                   <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                     Description
//                   </label>
//                   <textarea
//                     value={taxForm.description}
//                     onChange={(e) => handleTaxInputChange('description', e.target.value)}
//                     className={`${inputClass} w-full px-3 py-2 rounded-lg resize-none`}
//                     placeholder="Optional description or notes"
//                     rows={3}
//                     maxLength={500}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Effective Date Range */}
//             <div>
//               <h4 className={`text-md font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//                 Effective Period
//               </h4>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                     Effective From *
//                   </label>
//                   <input
//                     type="datetime-local"
//                     value={taxForm.effective_from}
//                     onChange={(e) => handleTaxInputChange('effective_from', e.target.value)}
//                     className={`${inputClass} w-full px-3 py-2 rounded-lg ${
//                       formErrors.effective_from ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
//                     }`}
//                   />
//                   {formErrors.effective_from && (
//                     <p className="text-red-500 text-xs mt-1">{formErrors.effective_from}</p>
//                   )}
//                   <p className={`text-xs mt-1 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
//                     ⓘ Set to current time for immediate effect
//                   </p>
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                     Effective To (Optional)
//                   </label>
//                   <input
//                     type="datetime-local"
//                     value={taxForm.effective_to || ''}
//                     onChange={(e) => handleTaxInputChange('effective_to', e.target.value)}
//                     className={`${inputClass} w-full px-3 py-2 rounded-lg ${
//                       formErrors.effective_to ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
//                     }`}
//                   />
//                   {formErrors.effective_to && (
//                     <p className="text-red-500 text-xs mt-1">{formErrors.effective_to}</p>
//                   )}
//                   <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
//                     Leave empty for indefinite duration
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Configuration Options */}
//             <div>
//               <h4 className={`text-md font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//                 Configuration Options
//               </h4>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div className="space-y-4">
//                   <div className="flex items-center space-x-6">
//                     <div className="flex items-center">
//                       <input
//                         type="checkbox"
//                         id="is_enabled"
//                         checked={taxForm.is_enabled}
//                         onChange={(e) => handleTaxInputChange('is_enabled', e.target.checked)}
//                         className={`h-4 w-4 ${
//                           theme === "dark" 
//                             ? "text-indigo-400 focus:ring-indigo-400 border-gray-600" 
//                             : "text-blue-600 focus:ring-blue-500 border-gray-300"
//                         } rounded`}
//                       />
//                       <label htmlFor="is_enabled" className={`ml-2 block text-sm ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                         Enabled
//                       </label>
//                     </div>

//                     <div className="flex items-center">
//                       <input
//                         type="checkbox"
//                         id="is_included_in_price"
//                         checked={taxForm.is_included_in_price}
//                         onChange={(e) => handleTaxInputChange('is_included_in_price', e.target.checked)}
//                         className={`h-4 w-4 ${
//                           theme === "dark" 
//                             ? "text-indigo-400 focus:ring-indigo-400 border-gray-600" 
//                             : "text-blue-600 focus:ring-blue-500 border-gray-300"
//                         } rounded`}
//                       />
//                       <label htmlFor="is_included_in_price" className={`ml-2 block text-sm ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                         Tax included in price
//                       </label>
//                     </div>
//                   </div>

//                   <div className="flex items-center">
//                     <input
//                       type="checkbox"
//                       id="requires_approval"
//                       checked={taxForm.requires_approval}
//                       onChange={(e) => handleTaxInputChange('requires_approval', e.target.checked)}
//                       className={`h-4 w-4 ${
//                         theme === "dark" 
//                           ? "text-indigo-400 focus:ring-indigo-400 border-gray-600" 
//                           : "text-blue-600 focus:ring-blue-500 border-gray-300"
//                       } rounded`}
//                     />
//                     <label htmlFor="requires_approval" className={`ml-2 block text-sm ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                       Requires special approval
//                     </label>
//                     {formErrors.requires_approval && (
//                       <p className="text-red-500 text-xs ml-2">{formErrors.requires_approval}</p>
//                     )}
//                   </div>
//                 </div>
                
//                 {/* Tax Impact Preview */}
//                 <div className={`p-3 rounded-lg border ${
//                   theme === "dark" ? "border-gray-600 bg-gray-700/30" : "border-gray-200 bg-gray-50"
//                 }`}>
//                   <div className="flex items-center space-x-2 mb-2">
//                     <Calculator className="w-4 h-4" />
//                     <span className="text-sm font-medium">Tax Impact Preview</span>
//                   </div>
//                   <div className="space-y-1 text-xs">
//                     <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
//                       KES 1,000 × {taxForm.rate || 0}% = KES {((1000 * (parseFloat(taxForm.rate) || 0)) / 100).toFixed(2)}
//                     </p>
//                     {taxForm.is_included_in_price && (
//                       <p className={theme === "dark" ? "text-green-300" : "text-green-600"}>
//                         Tax included in base price
//                       </p>
//                     )}
//                     {parseFloat(taxForm.rate) > 50 && (
//                       <p className={theme === "dark" ? "text-yellow-300" : "text-yellow-600"}>
//                         ⚠️ High rate - approval required
//                       </p>
//                     )}
//                     {!taxForm.is_enabled && (
//                       <p className={theme === "dark" ? "text-red-300" : "text-red-600"}>
//                         ⚠️ Tax is disabled
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Revision Notes */}
//             {editingTax && (
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                   Revision Notes
//                 </label>
//                 <textarea
//                   value={taxForm.revision_notes || ''}
//                   onChange={(e) => handleTaxInputChange('revision_notes', e.target.value)}
//                   className={`${inputClass} w-full px-3 py-2 rounded-lg resize-none`}
//                   placeholder="Describe the changes made in this revision..."
//                   rows={2}
//                   maxLength={255}
//                 />
//               </div>
//             )}

//             {/* Form Validation Summary */}
//             {Object.keys(formErrors).length > 0 && (
//               <div className={`p-3 rounded-lg border ${
//                 theme === "dark" ? "border-red-600 bg-red-900/20" : "border-red-200 bg-red-50"
//               }`}>
//                 <div className="flex items-center space-x-2">
//                   <FaExclamationTriangle className="w-4 h-4 text-red-500" />
//                   <span className="text-sm font-medium text-red-700 dark:text-red-300">
//                     Please fix the following errors:
//                   </span>
//                 </div>
//                 <ul className="text-xs text-red-600 dark:text-red-400 mt-1 list-disc list-inside">
//                   {Object.values(formErrors).map((error, index) => (
//                     <li key={index}>{error}</li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             {/* Validation Success */}
//             {taxForm.name && taxForm.rate && taxForm.effective_from && Object.keys(formErrors).length === 0 && (
//               <div className={`p-3 rounded-lg border ${
//                 theme === "dark" ? "border-green-600 bg-green-900/20" : "border-green-200 bg-green-50"
//               }`}>
//                 <div className="flex items-center space-x-2">
//                   <FaSave className="w-4 h-4 text-green-500" />
//                   <span className="text-sm font-medium text-green-700 dark:text-green-300">
//                     Configuration Valid
//                   </span>
//                 </div>
//                 <p className="text-xs text-green-600 dark:text-green-400 mt-1">
//                   Ready to {editingTax ? 'update' : 'create'} tax configuration
//                 </p>
//               </div>
//             )}
//           </div>

//           <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 sticky bottom-0 bg-inherit">
//             <button
//               onClick={() => {
//                 setShowTaxModal(false);
//                 resetTaxForm();
//               }}
//               className={`px-4 py-2 rounded-lg text-sm font-medium ${
//                 theme === "dark" 
//                   ? "bg-gray-700 hover:bg-gray-600 text-white" 
//                   : "bg-gray-200 hover:bg-gray-300 text-gray-800"
//               }`}
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSaveTax}
//               disabled={loading || !taxForm.name || !taxForm.rate || !taxForm.effective_from || Object.keys(formErrors).length > 0}
//               className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
//             >
//               {loading ? (
//                 <div className="flex items-center">
//                   <FaSpinner className="animate-spin mr-2" />
//                   {editingTax ? 'Updating...' : 'Creating...'}
//                 </div>
//               ) : (
//                 <div className="flex items-center">
//                   <FaSave className="mr-2" />
//                   {editingTax ? 'Update Tax' : 'Create Tax'}
//                 </div>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const TaxConfigurationPanel = ({ reconciliationData, theme, cardClass, textSecondaryClass, inputClass, onRefresh }) => {
//   const [showTaxModal, setShowTaxModal] = useState(false);
//   const [editingTax, setEditingTax] = useState(null);
//   const [deleteTax, setDeleteTax] = useState(null);
//   const [cloneTax, setCloneTax] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [taxesLoading, setTaxesLoading] = useState(false);
//   const [taxConfigurations, setTaxConfigurations] = useState([]);
//   const [formErrors, setFormErrors] = useState({});
//   const [filters, setFilters] = useState({
//     status: 'all',
//     access_type: 'all',
//     tax_type: 'all',
//     search: '',
//     show_disabled: true // NEW: Filter to show/hide disabled taxes
//   });

//   // UPDATED: Initialize with current time for effective_from
//   const [taxForm, setTaxForm] = useState({
//     name: '',
//     tax_type: 'custom',
//     rate: '',
//     description: '',
//     applies_to: 'revenue',
//     access_type: 'all',
//     is_enabled: true,
//     is_included_in_price: false,
//     requires_approval: false,
//     status: 'active',
//     effective_from: getCurrentDateTimeLocal(), // UPDATED: Always use current time
//     effective_to: '',
//     revision_notes: ''
//   });

//   // Enhanced options with all tax types from backend
//   const taxTypeOptions = [
//     { value: 'vat', label: 'VAT' },
//     { value: 'withholding', label: 'Withholding Tax' },
//     { value: 'custom', label: 'Custom Tax' },
//     { value: 'sales', label: 'Sales Tax' },
//     { value: 'service', label: 'Service Tax' },
//     { value: 'excise', label: 'Excise Duty' }
//   ];

//   const appliesToOptions = [
//     { value: 'revenue', label: 'Revenue Only' },
//     { value: 'expenses', label: 'Expenses Only' },
//     { value: 'both', label: 'Both Revenue & Expenses' }
//   ];

//   const accessTypeOptions = [
//     { value: 'all', label: 'All Access Types' },
//     { value: 'hotspot', label: 'Hotspot Only' },
//     { value: 'pppoe', label: 'PPPoE Only' },
//     { value: 'both', label: 'Both Access Types' }
//   ];

//   const statusOptions = [
//     { value: 'active', label: 'Active' },
//     { value: 'inactive', label: 'Inactive' },
//     { value: 'archived', label: 'Archived' }
//   ];

//   const statusFilterOptions = [
//     { value: 'all', label: 'All Status' },
//     { value: 'active', label: 'Active Only' },
//     { value: 'inactive', label: 'Inactive Only' },
//     { value: 'archived', label: 'Archived Only' }
//   ];

//   // Algorithm: Enhanced tax configurations fetch with error handling
//   const fetchTaxConfigurations = useCallback(async (retryCount = 0) => {
//     setTaxesLoading(true);
//     try {
//       const params = new URLSearchParams();
//       if (filters.status !== 'all') params.append('status', filters.status);
//       if (filters.access_type !== 'all') params.append('access_type', filters.access_type);
//       if (filters.tax_type !== 'all') params.append('tax_type', filters.tax_type);
//       if (filters.search) params.append('search', filters.search);

//       const response = await api.get(`/api/payments/taxes/?${params}`);
      
//       // Handle both response structures (data.data and data)
//       const taxData = response.data.data || response.data;
      
//       if (Array.isArray(taxData)) {
//         setTaxConfigurations(taxData);
//       } else {
//         console.error('Invalid tax data structure:', taxData);
//         setTaxConfigurations([]);
//       }
//     } catch (error) {
//       console.error('Failed to fetch tax configurations:', error);
      
//       // Enhanced error handling with specific messages
//       let errorMessage = 'Failed to load tax configurations';
//       if (error.response?.status === 401) {
//         errorMessage = 'Authentication failed. Please log in again.';
//       } else if (error.response?.status === 403) {
//         errorMessage = 'You do not have permission to view tax configurations.';
//       } else if (error.response?.status === 500) {
//         errorMessage = 'Server error. Please try again later.';
//       }
      
//       toast.error(errorMessage);
      
//       // Fallback to reconciliation data with proper structure checking
//       const { tax_configuration = [] } = reconciliationData || {};
//       if (Array.isArray(tax_configuration)) {
//         setTaxConfigurations(tax_configuration);
//       } else {
//         setTaxConfigurations([]);
//       }
//     } finally {
//       setTaxesLoading(false);
//     }
//   }, [filters, reconciliationData]);

//   useEffect(() => {
//     fetchTaxConfigurations();
//   }, [fetchTaxConfigurations]);

//   // Algorithm: Enhanced tax impact calculation with memoization
//   const taxImpact = useMemo(() => 
//     calculateTaxImpact(taxConfigurations, reconciliationData || {}),
//     [taxConfigurations, reconciliationData]
//   );

//   // Algorithm: Enhanced tax recommendations
//   const taxRecommendations = useMemo(() => 
//     generateTaxRecommendations(taxConfigurations, reconciliationData || {}),
//     [taxConfigurations, reconciliationData]
//   );

//   // Algorithm: Filtered tax configurations - UPDATED with disabled tax filter
//   const filteredTaxConfigurations = useMemo(() => {
//     return taxConfigurations.filter(tax => {
//       if (filters.status !== 'all' && tax.status !== filters.status) return false;
//       if (filters.access_type !== 'all' && tax.access_type !== filters.access_type) return false;
//       if (filters.tax_type !== 'all' && tax.tax_type !== filters.tax_type) return false;
//       if (!filters.show_disabled && !tax.is_enabled) return false; // NEW: Filter out disabled taxes
//       if (filters.search && !tax.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
//       return true;
//     });
//   }, [taxConfigurations, filters]);

//   // Algorithm: Enhanced form input handling with validation
//   const handleTaxInputChange = useCallback((field, value) => {
//     setTaxForm(prev => {
//       const newForm = {
//         ...prev,
//         [field]: value
//       };

//       // Real-time validation
//       const validationErrors = validateTaxConfiguration(newForm);
//       setFormErrors(validationErrors);

//       return newForm;
//     });
//   }, []);

//   // Algorithm: Enhanced number input handling
//   const handleNumberInput = useCallback((field, value) => {
//     // Allow only numbers and decimal point
//     const numericValue = value.replace(/[^0-9.]/g, '');
//     // Ensure only one decimal point
//     const parts = numericValue.split('.');
//     const formattedValue = parts.length > 2 
//       ? parts[0] + '.' + parts.slice(1).join('')
//       : numericValue;
    
//     handleTaxInputChange(field, formattedValue);
//   }, [handleTaxInputChange]);

//   // UPDATED: Reset form with current time
//   const resetTaxForm = useCallback(() => {
//     setTaxForm({
//       name: '',
//       tax_type: 'custom',
//       rate: '',
//       description: '',
//       applies_to: 'revenue',
//       access_type: 'all',
//       is_enabled: true,
//       is_included_in_price: false,
//       requires_approval: false,
//       status: 'active',
//       effective_from: getCurrentDateTimeLocal(), // UPDATED: Always reset to current time
//       effective_to: '',
//       revision_notes: ''
//     });
//     setFormErrors({});
//     setEditingTax(null);
//   }, []);

//   // Algorithm: Enhanced tax saving with comprehensive validation and proper data formatting
//   const handleSaveTax = useCallback(async () => {
//     const validationErrors = validateTaxConfiguration(taxForm);
    
//     if (Object.keys(validationErrors).length > 0) {
//       setFormErrors(validationErrors);
//       Object.values(validationErrors).forEach(error => toast.error(error));
//       return;
//     }

//     setLoading(true);
//     try {
//       // Format data for backend - UPDATED: Ensure effective_from uses current time if not provided
//       const taxData = {
//         ...taxForm,
//         rate: parseFloat(taxForm.rate),
//         effective_from: formatDateTimeForBackend(taxForm.effective_from) || formatDateTimeForBackend(getCurrentDateTimeLocal()),
//         effective_to: taxForm.effective_to ? formatDateTimeForBackend(taxForm.effective_to) : null,
//         description: taxForm.description || null,
//         revision_notes: taxForm.revision_notes || null
//       };

//       // Clean up empty strings for optional fields
//       Object.keys(taxData).forEach(key => {
//         if (taxData[key] === '') {
//           taxData[key] = null;
//         }
//       });

//       if (editingTax) {
//         await api.patch(`/api/payments/taxes/${editingTax.id}/`, taxData);
//         toast.success('Tax configuration updated successfully');
//       } else {
//         await api.post('/api/payments/taxes/', taxData);
//         toast.success('Tax configuration created successfully');
//       }

//       setShowTaxModal(false);
//       resetTaxForm();
//       await fetchTaxConfigurations();
//       onRefresh?.();
//     } catch (error) {
//       console.error('Tax save error:', error);
      
//       // Enhanced error handling with specific messages
//       let errorMessage = 'Failed to save tax configuration';
//       let backendErrors = {};
      
//       if (error.response?.status === 400) {
//         errorMessage = 'Invalid tax data. Please check your inputs.';
//         backendErrors = error.response.data;
//       } else if (error.response?.status === 409) {
//         errorMessage = 'A tax configuration with this name already exists.';
//       } else if (error.response?.status === 500) {
//         errorMessage = 'Server error. Please try again later.';
//       } else {
//         errorMessage = error.response?.data?.error || 
//                       error.response?.data?.detail || 
//                       error.response?.data?.message ||
//                       error.message ||
//                       'Failed to save tax configuration';
//       }
      
//       toast.error(errorMessage);
      
//       // Handle validation errors from backend
//       if (error.response?.status === 400 && error.response.data) {
//         const formattedErrors = {};
//         Object.keys(error.response.data).forEach(key => {
//           if (Array.isArray(error.response.data[key])) {
//             formattedErrors[key] = error.response.data[key].join(', ');
//           } else if (typeof error.response.data[key] === 'string') {
//             formattedErrors[key] = error.response.data[key];
//           } else if (typeof error.response.data[key] === 'object') {
//             // Handle nested error objects
//             formattedErrors[key] = JSON.stringify(error.response.data[key]);
//           }
//         });
//         setFormErrors(formattedErrors);
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [taxForm, editingTax, resetTaxForm, fetchTaxConfigurations, onRefresh]);

//   // FIXED: Enhanced tax editing with proper date parsing
//   const handleEditTax = useCallback((tax) => {
//     setEditingTax(tax);
//     setTaxForm({
//       name: tax.name,
//       tax_type: tax.tax_type,
//       rate: tax.rate?.toString() || '',
//       description: tax.description || '',
//       applies_to: tax.applies_to,
//       access_type: tax.access_type,
//       is_enabled: tax.is_enabled,
//       is_included_in_price: tax.is_included_in_price,
//       requires_approval: tax.requires_approval,
//       status: tax.status,
//       effective_from: parseBackendDateTime(tax.effective_from) || getCurrentDateTimeLocal(),
//       effective_to: parseBackendDateTime(tax.effective_to),
//       revision_notes: tax.revision_notes || ''
//     });
//     setFormErrors({});
//     setShowTaxModal(true);
//   }, []);

//   // FIXED: Enhanced tax cloning with proper data structure
//   const handleCloneTax = useCallback(async (tax) => {
//     setLoading(true);
//     try {
//       const cloneData = {
//         name: `${tax.name} (Copy)`,
//         tax_type: tax.tax_type,
//         rate: parseFloat(tax.rate),
//         description: tax.description,
//         applies_to: tax.applies_to,
//         access_type: tax.access_type,
//         is_enabled: true, // Always enable cloned taxes
//         is_included_in_price: tax.is_included_in_price,
//         requires_approval: tax.requires_approval,
//         status: 'active',
//         effective_from: formatDateTimeForBackend(getCurrentDateTimeLocal()), // UPDATED: Use current time
//         revision_notes: `Cloned from ${tax.tax_code || tax.name}`
//       };

//       await api.post('/api/payments/taxes/', cloneData);
//       toast.success('Tax configuration cloned successfully');
//       await fetchTaxConfigurations();
//       onRefresh?.();
//     } catch (error) {
//       console.error('Tax clone error:', error);
      
//       let errorMessage = 'Failed to clone tax configuration';
//       if (error.response?.status === 400) {
//         errorMessage = 'Invalid clone data. Please try again.';
//       } else if (error.response?.status === 409) {
//         errorMessage = 'A tax configuration with this name already exists.';
//       }
      
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//       setCloneTax(null);
//     }
//   }, [fetchTaxConfigurations, onRefresh]);

//   // Algorithm: Enhanced tax deletion with full autonomy and proper error handling
//   const handleDeleteTax = useCallback(async () => {
//     if (!deleteTax) return;

//     setLoading(true);
//     try {
//       await api.delete(`/api/payments/taxes/${deleteTax.id}/`);
      
//       toast.success(`Tax configuration "${deleteTax.name}" deleted successfully`);
//       setDeleteTax(null);
//       await fetchTaxConfigurations();
//       onRefresh?.();
//     } catch (error) {
//       console.error('Tax deletion error:', error);
      
//       let errorMessage = 'Failed to delete tax configuration';
//       if (error.response?.status === 404) {
//         errorMessage = 'Tax configuration not found. It may have been already deleted.';
//       } else if (error.response?.status === 403) {
//         errorMessage = 'You do not have permission to delete this tax configuration.';
//       } else if (error.response?.status === 500) {
//         errorMessage = 'Server error. Please try again later.';
//       } else {
//         errorMessage = error.response?.data?.error || 
//                       error.response?.data?.detail || 
//                       'Failed to delete tax configuration';
//       }
      
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   }, [deleteTax, fetchTaxConfigurations, onRefresh]);

//   // Algorithm: Enhanced tax status management with optimistic updates
//   const handleUpdateTaxStatus = useCallback(async (tax, updates) => {
//     const originalTax = { ...tax };
    
//     // Optimistic update
//     setTaxConfigurations(prev => 
//       prev.map(t => 
//         t.id === tax.id ? { ...t, ...updates } : t
//       )
//     );

//     try {
//       // Format data for backend
//       const updateData = { ...updates };
//       if (updates.effective_from) {
//         updateData.effective_from = formatDateTimeForBackend(updates.effective_from);
//       }
//       if (updates.effective_to) {
//         updateData.effective_to = formatDateTimeForBackend(updates.effective_to);
//       }

//       await api.patch(`/api/payments/taxes/${tax.id}/`, updateData);
      
//       let message = '';
//       if (updates.hasOwnProperty('is_enabled')) {
//         message = `Tax ${updates.is_enabled ? 'enabled' : 'disabled'} successfully`;
//       } else if (updates.hasOwnProperty('status')) {
//         message = `Tax status updated to ${updates.status} successfully`;
//       } else {
//         message = 'Tax configuration updated successfully';
//       }
      
//       toast.success(message);
//       await fetchTaxConfigurations();
//       onRefresh?.();
//     } catch (error) {
//       console.error('Tax status update error:', error);
//       // Revert optimistic update
//       setTaxConfigurations(prev => 
//         prev.map(t => 
//           t.id === tax.id ? originalTax : t
//         )
//       );
      
//       let errorMessage = 'Failed to update tax configuration';
//       if (error.response?.status === 400) {
//         errorMessage = 'Invalid update data. Please check your inputs.';
//       } else if (error.response?.status === 404) {
//         errorMessage = 'Tax configuration not found.';
//       } else if (error.response?.status === 500) {
//         errorMessage = 'Server error. Please try again later.';
//       }
      
//       toast.error(errorMessage);
//     }
//   }, [fetchTaxConfigurations, onRefresh]);

//   // Algorithm: Tax simulation for preview
//   const simulateTaxImpact = useCallback((amount, accessType = 'all') => {
//     const applicableTaxes = taxConfigurations.filter(tax => 
//       tax.is_enabled && 
//       tax.status === 'active' &&
//       (tax.access_type === 'all' || tax.access_type === accessType) &&
//       (tax.applies_to === 'revenue' || tax.applies_to === 'both')
//     );

//     let totalTax = 0;
//     let breakdown = [];

//     applicableTaxes.forEach(tax => {
//       const taxAmount = tax.is_included_in_price 
//         ? amount - (amount / (1 + (parseFloat(tax.rate) || 0) / 100))
//         : amount * ((parseFloat(tax.rate) || 0) / 100);
      
//       totalTax += taxAmount;
//       breakdown.push({
//         name: tax.name,
//         rate: tax.rate,
//         amount: taxAmount,
//         isIncluded: tax.is_included_in_price,
//         type: tax.tax_type
//       });
//     });

//     return {
//       totalTax,
//       breakdown,
//       netAmount: amount - totalTax,
//       grossAmount: applicableTaxes.some(tax => tax.is_included_in_price) ? amount : amount + totalTax
//     };
//   }, [taxConfigurations]);

//   // Enhanced TaxCard Component with FIXED disabled tax display
//   const TaxCard = ({ tax }) => {
//     const isEffective = isTaxEffective(tax);
    
//     // FIXED: Safe date rendering
//     const renderDate = (dateValue) => {
//       try {
//         return formatDate(dateValue);
//       } catch (error) {
//         console.error('Date rendering error:', error, dateValue);
//         return 'Invalid Date';
//       }
//     };
    
//     return (
//       <div className={`p-4 rounded-lg border transition-all duration-300 ${
//         theme === "dark" 
//           ? `bg-gray-700/30 ${tax.is_enabled ? (isEffective ? 'border-green-600' : 'border-yellow-600') : 'border-red-600'} hover:bg-gray-700/50` 
//           : `bg-white ${tax.is_enabled ? (isEffective ? 'border-green-200' : 'border-yellow-200') : 'border-red-300'} hover:bg-gray-50`
//       } ${!tax.is_enabled ? 'opacity-75' : ''}`}> {/* FIXED: Visual indicator for disabled taxes */}
//         <div className="flex items-start justify-between mb-3">
//           <div className="flex-1 min-w-0">
//             <div className="flex items-center space-x-2 mb-1">
//               <h4 className={`font-semibold truncate ${!tax.is_enabled ? 'line-through' : ''} ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//                 {tax.name}
//                 {!tax.is_enabled && (
//                   <span className="ml-2 text-xs text-red-500">(Disabled)</span>
//                 )}
//               </h4>
//               {tax.tax_code && (
//                 <span className={`text-xs px-1.5 py-0.5 rounded ${
//                   theme === "dark" ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-600"
//                 }`}>
//                   <FaCode className="inline w-3 h-3 mr-1" />
//                   {tax.tax_code}
//                 </span>
//               )}
//             </div>
            
//             <div className="flex flex-wrap items-center gap-1 mb-2">
//               <span className={`text-sm px-2 py-1 rounded-full ${
//                 theme === "dark" 
//                   ? `${tax.is_enabled ? (isEffective ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300') : 'bg-red-900 text-red-300'}` 
//                   : `${tax.is_enabled ? (isEffective ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800') : 'bg-red-100 text-red-800'}`
//               }`}>
//                 {tax.rate}%
//                 {!tax.is_enabled && ' ⚠️'}
//               </span>
              
//               <span className={`text-xs px-2 py-1 rounded-full ${
//                 theme === "dark" ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-800"
//               }`}>
//                 {tax.tax_type_display || tax.tax_type}
//               </span>

//               {!isEffective && tax.is_enabled && (
//                 <span className={`text-xs px-2 py-1 rounded-full ${
//                   theme === "dark" ? "bg-yellow-900 text-yellow-300" : "bg-yellow-100 text-yellow-800"
//                 }`}>
//                   <Clock className="inline w-3 h-3 mr-1" />
//                   Not Effective
//                 </span>
//               )}

//               {tax.requires_approval && (
//                 <span className={`text-xs px-2 py-1 rounded-full ${
//                   theme === "dark" ? "bg-purple-900 text-purple-300" : "bg-purple-100 text-purple-800"
//                 }`}>
//                   Requires Approval
//                 </span>
//               )}
//             </div>
//           </div>
          
//           <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
//             {/* Status Toggle */}
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 handleUpdateTaxStatus(tax, { is_enabled: !tax.is_enabled });
//               }}
//               className={`p-1 rounded ${
//                 tax.is_enabled 
//                   ? "text-green-500 hover:text-green-600" 
//                   : "text-gray-400 hover:text-gray-500"
//               }`}
//               title={tax.is_enabled ? 'Disable Tax' : 'Enable Tax'}
//             >
//               {tax.is_enabled ? <FaToggleOn className="w-5 h-5" /> : <FaToggleOff className="w-5 h-5" />}
//             </button>
            
//             {/* Edit Button */}
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 handleEditTax(tax);
//               }}
//               className={`p-1 rounded ${
//                 theme === "dark" 
//                   ? "text-blue-400 hover:text-blue-300" 
//                   : "text-blue-600 hover:text-blue-800"
//               }`}
//               title="Edit Tax"
//             >
//               <FaEdit className="w-4 h-4" />
//             </button>

//             {/* Clone Button */}
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setCloneTax(tax);
//               }}
//               className={`p-1 rounded ${
//                 theme === "dark" 
//                   ? "text-green-400 hover:text-green-300" 
//                   : "text-green-600 hover:text-green-800"
//               }`}
//               title="Clone Tax"
//             >
//               <Copy className="w-4 h-4" />
//             </button>
            
//             {/* Delete Button - Full Autonomy */}
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setDeleteTax(tax);
//               }}
//               className={`p-1 rounded text-red-500 hover:text-red-600`}
//               title="Delete Tax"
//             >
//               <FaTrash className="w-4 h-4" />
//             </button>
//           </div>
//         </div>

//         <div className="space-y-2 text-sm">
//           <div className="flex justify-between">
//             <span className={textSecondaryClass}>Applies To</span>
//             <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
//               {tax.applies_to_display || tax.applies_to}
//             </span>
//           </div>
          
//           <div className="flex justify-between">
//             <span className={textSecondaryClass}>Access Type</span>
//             <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
//               <AccessTypeBadge accessType={tax.access_type} theme={theme} size="sm" />
//             </span>
//           </div>

//           <div className="flex justify-between">
//             <span className={textSecondaryClass}>Status</span>
//             <span className={`text-xs px-2 py-1 rounded-full ${
//               tax.status === 'active' 
//                 ? (theme === "dark" ? "bg-green-900 text-green-300" : "bg-green-100 text-green-800")
//                 : tax.status === 'inactive'
//                 ? (theme === "dark" ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-600")
//                 : (theme === "dark" ? "bg-yellow-900 text-yellow-300" : "bg-yellow-100 text-yellow-800")
//             }`}>
//               {tax.status_display || tax.status}
//             </span>
//           </div>
          
//           {tax.description && (
//             <div className="text-sm">
//               <span className={textSecondaryClass}>Description: </span>
//               <span className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
//                 {tax.description}
//               </span>
//             </div>
//           )}
          
//           <div className="flex justify-between">
//             <span className={textSecondaryClass}>Price Inclusion</span>
//             <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
//               {tax.is_included_in_price ? 'Included' : 'Added'}
//             </span>
//           </div>

//           {/* Effective Period - FIXED date rendering */}
//           <div className="flex justify-between">
//             <span className={textSecondaryClass}>Effective From</span>
//             <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
//               {renderDate(tax.effective_from)}
//             </span>
//           </div>

//           {tax.effective_to && (
//             <div className="flex justify-between">
//               <span className={textSecondaryClass}>Effective To</span>
//               <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
//                 {renderDate(tax.effective_to)}
//               </span>
//             </div>
//           )}

//           {/* Audit Information */}
//           <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
//             <div className="flex justify-between text-xs">
//               <span className={textSecondaryClass}>Created</span>
//               <span className={textSecondaryClass}>
//                 {tax.created_by_name && (
//                   <><FaUser className="inline w-3 h-3 mr-1" />{tax.created_by_name} • </>
//                 )}
//                 {renderDate(tax.created_at)}
//               </span>
//             </div>
//             {tax.updated_at && (
//               <div className="flex justify-between text-xs mt-1">
//                 <span className={textSecondaryClass}>Updated</span>
//                 <span className={textSecondaryClass}>{renderDate(tax.updated_at)}</span>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Quick Actions */}
//         <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
//           <span className={`text-xs ${textSecondaryClass}`}>
//             v{tax.version} • {tax.is_enabled ? (isEffective ? 'Active' : 'Scheduled') : 'Disabled'}
//           </span>
//           <div className="flex space-x-1">
//             <button
//               onClick={() => {
//                 const simulation = simulateTaxImpact(1000, tax.access_type);
//                 toast.success(
//                   `KES 1,000 → KES ${simulation.netAmount.toFixed(2)} net with ${simulation.breakdown.length} tax(es)`
//                 );
//               }}
//               className={`text-xs px-2 py-1 rounded ${
//                 theme === "dark" ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-200 hover:bg-gray-300"
//               }`}
//             >
//               Test
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className={`${cardClass} p-6 transition-colors duration-300`}>
//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
//           <div className="flex-1">
//             <h2 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"} mb-2 flex items-center`}>
//               <FaChartBar className="mr-2" /> Tax Configuration Management
//             </h2>
//             <p className={textSecondaryClass}>
//               Configure and manage tax rules across different access types and revenue streams with full autonomy
//             </p>
//           </div>
          
//           <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
//             <button
//               onClick={fetchTaxConfigurations}
//               disabled={taxesLoading}
//               className={`flex items-center justify-center px-4 py-2 rounded-lg ${
//                 theme === "dark" 
//                   ? "bg-gray-700 hover:bg-gray-600 text-white" 
//                   : "bg-gray-200 hover:bg-gray-300 text-gray-800"
//               } disabled:opacity-50 transition-colors duration-200`}
//             >
//               {taxesLoading ? (
//                 <FaSpinner className="animate-spin mr-2" />
//               ) : (
//                 <FaSpinner className="mr-2" />
//               )}
//               Refresh
//             </button>
//             <button
//               onClick={() => setShowTaxModal(true)}
//               className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
//             >
//               <FaPlus className="mr-2" />
//               Add Tax
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Filters - UPDATED with disabled tax toggle */}
//       <div className={`${cardClass} p-6 transition-colors duration-300`}>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
//           <div>
//             <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//               Status
//             </label>
//             <EnhancedSelect
//               value={filters.status}
//               onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
//               options={statusFilterOptions}
//               theme={theme}
//             />
//           </div>
          
//           <div>
//             <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//               Access Type
//             </label>
//             <EnhancedSelect
//               value={filters.access_type}
//               onChange={(value) => setFilters(prev => ({ ...prev, access_type: value }))}
//               options={accessTypeOptions}
//               theme={theme}
//             />
//           </div>

//           <div>
//             <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//               Tax Type
//             </label>
//             <EnhancedSelect
//               value={filters.tax_type}
//               onChange={(value) => setFilters(prev => ({ ...prev, tax_type: value }))}
//               options={[{ value: 'all', label: 'All Types' }, ...taxTypeOptions]}
//               theme={theme}
//             />
//           </div>

//           {/* NEW: Show Disabled Taxes Toggle */}
//           <div className="flex items-end">
//             <div className="flex items-center">
//               <input
//                 type="checkbox"
//                 id="show_disabled"
//                 checked={filters.show_disabled}
//                 onChange={(e) => setFilters(prev => ({ ...prev, show_disabled: e.target.checked }))}
//                 className={`h-4 w-4 ${
//                   theme === "dark" 
//                     ? "text-indigo-400 focus:ring-indigo-400 border-gray-600" 
//                     : "text-blue-600 focus:ring-blue-500 border-gray-300"
//                 } rounded`}
//               />
//               <label htmlFor="show_disabled" className={`ml-2 block text-sm ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                 Show Disabled
//               </label>
//             </div>
//           </div>

//           <div className="sm:col-span-2">
//             <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//               Search Taxes
//             </label>
//             <input
//               type="text"
//               value={filters.search}
//               onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
//               className={`${inputClass} w-full px-3 py-2 rounded-lg`}
//               placeholder="Search by name, tax code, or description..."
//             />
//           </div>
//         </div>
//       </div>

//       {/* Tax Impact Overview */}
//       {taxConfigurations.length > 0 && (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
//           <div className={`p-4 rounded-lg border-l-4 ${
//             theme === "dark" ? "border-blue-500 bg-blue-900/20" : "border-blue-500 bg-blue-50"
//           }`}>
//             <h3 className={`text-sm ${textSecondaryClass} mb-1`}>Active Taxes</h3>
//             <p className={`text-2xl font-bold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
//               {taxImpact.activeCount}
//             </p>
//             <p className={`text-xs ${textSecondaryClass}`}>
//               {taxImpact.enabledCount} enabled • {taxImpact.disabledCount} disabled
//             </p>
//           </div>
          
//           <div className={`p-4 rounded-lg border-l-4 ${
//             theme === "dark" ? "border-green-500 bg-green-900/20" : "border-green-500 bg-green-50"
//           }`}>
//             <h3 className={`text-sm ${textSecondaryClass} mb-1`}>Revenue Impact</h3>
//             <p className={`text-2xl font-bold ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
//               {typeof taxImpact.totalRevenueTax === 'number' ? taxImpact.totalRevenueTax.toFixed(1) : '0.0'}%
//             </p>
//             <p className={`text-xs ${textSecondaryClass}`}>Total rate on revenue</p>
//           </div>
          
//           <div className={`p-4 rounded-lg border-l-4 ${
//             theme === "dark" ? "border-purple-500 bg-purple-900/20" : "border-purple-500 bg-purple-50"
//           }`}>
//             <h3 className={`text-sm ${textSecondaryClass} mb-1`}>Expense Impact</h3>
//             <p className={`text-2xl font-bold ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`}>
//               {typeof taxImpact.totalExpenseTax === 'number' ? taxImpact.totalExpenseTax.toFixed(1) : '0.0'}%
//             </p>
//             <p className={`text-xs ${textSecondaryClass}`}>Total rate on expenses</p>
//           </div>
          
//           <div className={`p-4 rounded-lg border-l-4 ${
//             theme === "dark" ? "border-yellow-500 bg-yellow-900/20" : "border-yellow-500 bg-yellow-50"
//           }`}>
//             <h3 className={`text-sm ${textSecondaryClass} mb-1`}>Configurations</h3>
//             <p className={`text-2xl font-bold ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"}`}>
//               {taxConfigurations.length}
//             </p>
//             <p className={`text-xs ${textSecondaryClass}`}>
//               {taxImpact.archivedCount} archived
//             </p>
//           </div>
//         </div>
//       )}

//       {/* Recommendations */}
//       {taxRecommendations.length > 0 && (
//         <div className={`${cardClass} p-6 transition-colors duration-300`}>
//           <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"} flex items-center`}>
//             <FaExclamationTriangle className="mr-2 text-yellow-500" />
//             Configuration Recommendations
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {taxRecommendations.slice(0, 6).map((rec, index) => (
//               <div 
//                 key={index}
//                 className={`p-3 rounded-lg border ${
//                   rec.priority === 'high' 
//                     ? (theme === "dark" ? "border-red-600 bg-red-900/20" : "border-red-200 bg-red-50")
//                     : rec.priority === 'medium'
//                     ? (theme === "dark" ? "border-yellow-600 bg-yellow-900/20" : "border-yellow-200 bg-yellow-50")
//                     : (theme === "dark" ? "border-blue-600 bg-blue-900/20" : "border-blue-200 bg-blue-50")
//                 }`}
//               >
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <h4 className={`font-medium text-sm ${
//                       rec.priority === 'high' 
//                         ? (theme === "dark" ? "text-red-300" : "text-red-700")
//                         : rec.priority === 'medium'
//                         ? (theme === "dark" ? "text-yellow-300" : "text-yellow-700")
//                         : (theme === "dark" ? "text-blue-300" : "text-blue-700")
//                     }`}>
//                       {rec.message}
//                     </h4>
//                     <p className={`text-xs mt-1 ${
//                       theme === "dark" ? "text-gray-400" : "text-gray-600"
//                     }`}>
//                       {rec.action}
//                     </p>
//                   </div>
//                   <span className={`text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0 ${
//                     rec.priority === 'high' 
//                       ? (theme === "dark" ? "bg-red-900 text-red-300" : "bg-red-100 text-red-800")
//                       : rec.priority === 'medium'
//                       ? (theme === "dark" ? "bg-yellow-900 text-yellow-300" : "bg-yellow-100 text-yellow-800")
//                       : (theme === "dark" ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-800")
//                   }`}>
//                     {rec.priority}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Tax Configuration Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
//         {taxesLoading ? (
//           // Enhanced Loading State
//           Array.from({ length: 6 }).map((_, index) => (
//             <div 
//               key={index}
//               className={`p-4 rounded-lg border animate-pulse ${
//                 theme === "dark" ? "bg-gray-700/30 border-gray-600" : "bg-gray-100 border-gray-200"
//               }`}
//             >
//               <div className="flex items-center justify-between mb-3">
//                 <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-3/4"></div>
//                 <div className="h-6 bg-gray-400 dark:bg-gray-600 rounded w-1/4"></div>
//               </div>
//               <div className="space-y-2">
//                 {Array.from({ length: 6 }).map((_, i) => (
//                   <div key={i} className="flex justify-between">
//                     <div className="h-3 bg-gray-400 dark:bg-gray-600 rounded w-1/3"></div>
//                     <div className="h-3 bg-gray-400 dark:bg-gray-600 rounded w-1/4"></div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ))
//         ) : filteredTaxConfigurations.length > 0 ? (
//           filteredTaxConfigurations.map((tax) => (
//             <TaxCard key={tax.id} tax={tax} />
//           ))
//         ) : (
//           <div className={`col-span-3 p-8 text-center rounded-lg border-2 border-dashed ${
//             theme === "dark" ? "border-gray-600" : "border-gray-300"
//           }`}>
//             <FaPlus className={`w-12 h-12 mx-auto mb-4 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
//             <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//               {filters.search || filters.status !== 'all' || filters.access_type !== 'all' || filters.tax_type !== 'all' || !filters.show_disabled
//                 ? 'No matching tax configurations found' 
//                 : 'No Tax Configurations'
//               }
//             </h3>
//             <p className={textSecondaryClass}>
//               {filters.search || filters.status !== 'all' || filters.access_type !== 'all' || filters.tax_type !== 'all' || !filters.show_disabled
//                 ? 'Try adjusting your filters or search terms'
//                 : 'Get started by creating your first tax configuration to manage revenue and expense taxes'
//               }
//             </p>
//             {(filters.search || filters.status !== 'all' || filters.access_type !== 'all' || filters.tax_type !== 'all' || !filters.show_disabled) && (
//               <button
//                 onClick={() => setFilters({
//                   status: 'all',
//                   access_type: 'all',
//                   tax_type: 'all',
//                   search: '',
//                   show_disabled: true
//                 })}
//                 className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
//               >
//                 Clear Filters
//               </button>
//             )}
//             {!filters.search && filters.status === 'all' && filters.access_type === 'all' && filters.tax_type === 'all' && filters.show_disabled && (
//               <button
//                 onClick={() => setShowTaxModal(true)}
//                 className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
//               >
//                 Create First Tax
//               </button>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Enhanced Tax Analytics */}
//       {taxConfigurations.length > 0 && (
//         <div className={`${cardClass} p-6 transition-colors duration-300`}>
//           <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//             Tax Configuration Analytics
//           </h3>
//           <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
//             {/* By Tax Type */}
//             <div className={`p-4 rounded-lg ${
//               theme === "dark" ? "bg-blue-900/20 border-blue-700" : "bg-blue-50 border-blue-200"
//             } border`}>
//               <h4 className={`text-sm font-medium mb-3 ${theme === "dark" ? "text-blue-300" : "text-blue-700"} flex items-center`}>
//                 <FaChartBar className="mr-2" /> By Tax Type
//               </h4>
//               <div className="space-y-2">
//                 {Object.entries(taxImpact.byTaxType).map(([type, data]) => (
//                   <div key={type} className="flex justify-between items-center text-sm">
//                     <span className="capitalize">{type.replace('_', ' ')}</span>
//                     <div className="text-right">
//                       <div className="font-semibold">{data.count} configs</div>
//                       <div className={`text-xs ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
//                         {data.totalRate.toFixed(1)}% total
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
            
//             {/* By Access Type */}
//             <div className={`p-4 rounded-lg ${
//               theme === "dark" ? "bg-green-900/20 border-green-700" : "bg-green-50 border-green-200"
//             } border`}>
//               <h4 className={`text-sm font-medium mb-3 ${theme === "dark" ? "text-green-300" : "text-green-700"} flex items-center`}>
//                 <BarChart3 className="mr-2" /> By Access Type
//               </h4>
//               <div className="space-y-2">
//                 {Object.entries(taxImpact.byAccessType).map(([accessType, data]) => (
//                   <div key={accessType} className="flex justify-between items-center text-sm">
//                     <span>
//                       <AccessTypeBadge accessType={accessType} theme={theme} size="sm" />
//                     </span>
//                     <div className="text-right">
//                       <div className="font-semibold">{data.count}</div>
//                       <div className={`text-xs ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
//                         Rev: {data.revenue.toFixed(1)}%
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
            
//             {/* Status Overview */}
//             <div className={`p-4 rounded-lg ${
//               theme === "dark" ? "bg-yellow-900/20 border-yellow-700" : "bg-yellow-50 border-yellow-200"
//             } border`}>
//               <h4 className={`text-sm font-medium mb-3 ${theme === "dark" ? "text-yellow-300" : "text-yellow-700"} flex items-center`}>
//                 <FaToggleOn className="mr-2" /> Status Overview
//               </h4>
//               <div className="space-y-3">
//                 <div className="flex justify-between items-center">
//                   <span>Active & Effective</span>
//                   <span className="font-semibold text-green-500">{taxImpact.activeCount}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span>Disabled</span>
//                   <span className="font-semibold text-red-500">{taxImpact.disabledCount}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span>Archived</span>
//                   <span className="font-semibold text-yellow-500">{taxImpact.archivedCount}</span>
//                 </div>
//                 <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
//                   <div 
//                     className="bg-green-500 h-2 rounded-full transition-all duration-500"
//                     style={{ 
//                       width: `${(taxImpact.enabledCount / taxConfigurations.length) * 100}%` 
//                     }}
//                   ></div>
//                 </div>
//                 <div className="text-xs text-center text-gray-500 dark:text-gray-400">
//                   {((taxImpact.enabledCount / taxConfigurations.length) * 100).toFixed(1)}% Enabled
//                 </div>
//               </div>
//             </div>

//             {/* Quick Actions */}
//             <div className={`p-4 rounded-lg ${
//               theme === "dark" ? "bg-purple-900/20 border-purple-700" : "bg-purple-50 border-purple-200"
//             } border`}>
//               <h4 className={`text-sm font-medium mb-3 ${theme === "dark" ? "text-purple-300" : "text-purple-700"} flex items-center`}>
//                 <FaMoneyBillWave className="mr-2" /> Quick Actions
//               </h4>
//               <div className="space-y-2">
//                 <button
//                   onClick={() => setShowTaxModal(true)}
//                   className="w-full text-left p-2 rounded hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors duration-200"
//                 >
//                   + Create New Tax
//                 </button>
//                 <button
//                   onClick={fetchTaxConfigurations}
//                   className="w-full text-left p-2 rounded hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors duration-200"
//                 >
//                   ↻ Refresh Data
//                 </button>
//                 <button
//                   onClick={() => {
//                     const simulation = simulateTaxImpact(5000, 'all');
//                     toast.success(`Tax simulation: KES 5,000 → KES ${simulation.netAmount.toFixed(2)} net`);
//                   }}
//                   className="w-full text-left p-2 rounded hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors duration-200"
//                 >
//                   🧪 Test Tax Calculation
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Modals */}
//       <TaxFormModal
//         showTaxModal={showTaxModal}
//         setShowTaxModal={setShowTaxModal}
//         editingTax={editingTax}
//         taxForm={taxForm}
//         handleTaxInputChange={handleTaxInputChange}
//         handleNumberInput={handleNumberInput}
//         formErrors={formErrors}
//         setFormErrors={setFormErrors}
//         theme={theme}
//         cardClass={cardClass}
//         inputClass={inputClass}
//         handleSaveTax={handleSaveTax}
//         loading={loading}
//         resetTaxForm={resetTaxForm}
//         taxTypeOptions={taxTypeOptions}
//         appliesToOptions={appliesToOptions}
//         accessTypeOptions={accessTypeOptions}
//         statusOptions={statusOptions}
//       />
      
//       <ConfirmationModal
//         isOpen={!!deleteTax}
//         onClose={() => setDeleteTax(null)}
//         onConfirm={handleDeleteTax}
//         title="Delete Tax Configuration"
//         message={`Are you sure you want to delete the tax configuration "${deleteTax?.name}"? This action cannot be undone and will be permanently removed from the system.`}
//         confirmText="Delete Tax Configuration"
//         type="danger"
//         theme={theme}
//       />

//       <ConfirmationModal
//         isOpen={!!cloneTax}
//         onClose={() => setCloneTax(null)}
//         onConfirm={() => handleCloneTax(cloneTax)}
//         title="Clone Tax Configuration"
//         message={`Create a copy of "${cloneTax?.name}" tax configuration? The clone will have "(Copy)" appended to its name.`}
//         confirmText="Clone Tax"
//         type="info"
//         theme={theme}
//       />
//     </div>
//   );
// };

// export default TaxConfigurationPanel;










import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSave, 
  FaTimes, 
  FaToggleOn, 
  FaToggleOff, 
  FaSpinner, 
  FaExclamationTriangle, 
  FaChartBar, 
  FaMoneyBillWave, 
  FaReceipt, 
  FaCalendar,
  FaUser,
  FaCode 
} from 'react-icons/fa';
import { TrendingUp, TrendingDown, BarChart3, Calculator, Clock, Archive, Copy, Download, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../api';
import { EnhancedSelect, ConfirmationModal, AccessTypeBadge } from '../../ServiceManagement/Shared/components';

// Algorithm: Enhanced tax impact calculation with access type breakdown
const calculateTaxImpact = (taxes, reconciliationData) => {
  const impact = {
    totalRevenueTax: 0,
    totalExpenseTax: 0,
    byAccessType: {
      hotspot: { revenue: 0, expenses: 0, count: 0 },
      pppoe: { revenue: 0, expenses: 0, count: 0 },
      both: { revenue: 0, expenses: 0, count: 0 },
      all: { revenue: 0, expenses: 0, count: 0 }
    },
    byTaxType: {},
    enabledCount: 0,
    disabledCount: 0,
    activeCount: 0,
    archivedCount: 0
  };

  taxes.forEach(tax => {
    // Count by status - FIXED: Properly count enabled/disabled taxes
    if (tax.is_enabled) {
      impact.enabledCount++;
      if (tax.status === 'active') {
        impact.activeCount++;
      }
    } else {
      impact.disabledCount++;
    }
    
    if (tax.status === 'archived') {
      impact.archivedCount++;
    }

    // Calculate tax impact for enabled taxes only
    if (tax.is_enabled && tax.status === 'active') {
      const appliesToRevenue = tax.applies_to === 'revenue' || tax.applies_to === 'both';
      const appliesToExpenses = tax.applies_to === 'expenses' || tax.applies_to === 'both';
      
      if (appliesToRevenue) {
        impact.totalRevenueTax += parseFloat(tax.rate) || 0;
        impact.byAccessType[tax.access_type].revenue += parseFloat(tax.rate) || 0;
      }
      
      if (appliesToExpenses) {
        impact.totalExpenseTax += parseFloat(tax.rate) || 0;
        impact.byAccessType[tax.access_type].expenses += parseFloat(tax.rate) || 0;
      }

      // Count by access type
      impact.byAccessType[tax.access_type].count++;

      // Group by tax type
      if (!impact.byTaxType[tax.tax_type]) {
        impact.byTaxType[tax.tax_type] = {
          totalRate: 0,
          count: 0,
          revenueRate: 0,
          expenseRate: 0
        };
      }
      impact.byTaxType[tax.tax_type].totalRate += parseFloat(tax.rate) || 0;
      impact.byTaxType[tax.tax_type].count++;
      
      if (appliesToRevenue) impact.byTaxType[tax.tax_type].revenueRate += parseFloat(tax.rate) || 0;
      if (appliesToExpenses) impact.byTaxType[tax.tax_type].expenseRate += parseFloat(tax.rate) || 0;
    }
  });

  return impact;
};

// Algorithm: Enhanced tax configuration validation
const validateTaxConfiguration = (taxForm) => {
  const errors = {};

  if (!taxForm.name?.trim()) {
    errors.name = 'Tax name is required';
  } else if (taxForm.name.length > 100) {
    errors.name = 'Tax name cannot exceed 100 characters';
  }

  const rate = parseFloat(taxForm.rate);
  if (isNaN(rate) || rate < 0 || rate > 100) {
    errors.rate = 'Tax rate must be a number between 0 and 100';
  } else if (rate > 50 && !taxForm.requires_approval) {
    errors.requires_approval = 'Tax rates above 50% require special approval';
  }

  // Validate effective dates
  if (taxForm.effective_to && taxForm.effective_from) {
    const fromDate = new Date(taxForm.effective_from);
    const toDate = new Date(taxForm.effective_to);
    if (toDate < fromDate) {
      errors.effective_to = 'End date cannot be before start date';
    }
  }

  return errors;
};

// Algorithm: Generate intelligent tax recommendations
const generateTaxRecommendations = (taxes, reconciliationData) => {
  const recommendations = [];
  const { access_type_breakdown } = reconciliationData || {};

  // Check tax coverage by access type
  const accessTypes = ['hotspot', 'pppoe', 'both'];
  const activeTaxesByAccessType = {};
  
  taxes.filter(t => t.is_enabled && t.status === 'active').forEach(tax => {
    if (!activeTaxesByAccessType[tax.access_type]) {
      activeTaxesByAccessType[tax.access_type] = [];
    }
    activeTaxesByAccessType[tax.access_type].push(tax);
  });

  accessTypes.forEach(accessType => {
    const hasCoverage = activeTaxesByAccessType[accessType] || activeTaxesByAccessType.all;
    const revenue = access_type_breakdown?.[accessType]?.revenue || 0;
    
    if (!hasCoverage && revenue > 0) {
      recommendations.push({
        type: 'coverage_gap',
        message: `No active taxes for ${accessType} access type with revenue`,
        priority: revenue > 1000 ? 'high' : 'medium',
        action: `Configure tax for ${accessType}`,
        accessType
      });
    }
  });

  // Check for expired or expiring taxes
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  taxes.filter(tax => tax.effective_to).forEach(tax => {
    const effectiveTo = new Date(tax.effective_to);
    if (effectiveTo < now && tax.is_enabled && tax.status === 'active') {
      recommendations.push({
        type: 'expired',
        message: `Tax "${tax.name}" has expired`,
        priority: 'medium',
        action: 'Update or archive tax',
        taxId: tax.id
      });
    } else if (effectiveTo < thirtyDaysFromNow && tax.is_enabled && tax.status === 'active') {
      recommendations.push({
        type: 'expiring_soon',
        message: `Tax "${tax.name}" expires in less than 30 days`,
        priority: 'low',
        action: 'Review expiration date',
        taxId: tax.id
      });
    }
  });

  // Check for high tax rates without approval
  taxes.filter(tax => tax.rate > 50 && !tax.requires_approval && tax.is_enabled && tax.status === 'active').forEach(tax => {
    recommendations.push({
      type: 'high_rate',
      message: `Tax "${tax.name}" has high rate (${tax.rate}%) without approval flag`,
      priority: 'medium',
      action: 'Mark as requiring approval',
      taxId: tax.id
    });
  });

  // Check for disabled taxes that should be active
  taxes.filter(tax => !tax.is_enabled && tax.status === 'active').forEach(tax => {
    recommendations.push({
      type: 'disabled_active',
      message: `Tax "${tax.name}" is disabled but marked as active`,
      priority: 'low',
      action: 'Enable or archive tax',
      taxId: tax.id
    });
  });

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

// Algorithm: Format date for display
const formatDate = (dateValue) => {
  if (!dateValue) return 'Indefinite';
  
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

// Algorithm: Check if tax is currently effective
const isTaxEffective = (tax) => {
  const now = new Date();
  
  const effectiveFrom = new Date(tax.effective_from);
  const effectiveTo = tax.effective_to ? new Date(tax.effective_to) : null;
  
  return effectiveFrom <= now && (!effectiveTo || effectiveTo >= now);
};

// Algorithm: Get current datetime in local format for form inputs
const getCurrentDateTimeLocal = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Algorithm: Convert datetime-local format to backend format
const formatDateTimeForBackend = (dateTimeString) => {
  if (!dateTimeString) return null;
  
  try {
    const date = new Date(dateTimeString);
    return date.toISOString().slice(0, 19).replace('T', ' ');
  } catch (error) {
    console.error('DateTime formatting error:', error);
    return null;
  }
};

// Algorithm: Parse backend datetime to local format
const parseBackendDateTime = (backendDateTime) => {
  if (!backendDateTime) return '';
  
  try {
    const date = new Date(backendDateTime);
    if (isNaN(date.getTime())) return '';
    
    // Convert to datetime-local format (YYYY-MM-DDTHH:MM)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error('DateTime parsing error:', error);
    return '';
  }
};

// Enhanced TaxFormModal Component
const TaxFormModal = ({ 
  showTaxModal, 
  setShowTaxModal, 
  editingTax, 
  taxForm, 
  handleTaxInputChange, 
  handleNumberInput, 
  formErrors, 
  setFormErrors, 
  theme, 
  cardClass, 
  inputClass, 
  handleSaveTax, 
  loading, 
  resetTaxForm, 
  taxTypeOptions, 
  appliesToOptions, 
  accessTypeOptions,
  statusOptions 
}) => {
  if (!showTaxModal) return null;

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${theme === "dark" ? "bg-gray-900 bg-opacity-75" : "bg-gray-500 bg-opacity-75"}`}>
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-6">
        <div className={`${cardClass} w-full max-w-4xl transform transition-all max-h-[90vh] overflow-y-auto`}>
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-inherit z-10">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                {editingTax ? 'Edit Tax Configuration' : 'Create New Tax Configuration'}
              </h3>
              <button
                onClick={() => {
                  setShowTaxModal(false);
                  resetTaxForm();
                }}
                className={`p-1 rounded-full ${theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"}`}
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className={`text-md font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                Basic Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                    Tax Name *
                  </label>
                  <input
                    type="text"
                    value={taxForm.name}
                    onChange={(e) => handleTaxInputChange('name', e.target.value)}
                    className={`${inputClass} w-full px-3 py-2 rounded-lg ${
                      formErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    placeholder="e.g., VAT, Service Tax, Withholding"
                    maxLength={100}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                    Tax Type
                  </label>
                  <EnhancedSelect
                    value={taxForm.tax_type}
                    onChange={(value) => handleTaxInputChange('tax_type', value)}
                    options={taxTypeOptions}
                    theme={theme}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                    Tax Rate (%) *
                  </label>
                  <input
                    type="text"
                    value={taxForm.rate}
                    onChange={(e) => handleNumberInput('rate', e.target.value)}
                    className={`${inputClass} w-full px-3 py-2 rounded-lg ${
                      formErrors.rate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    placeholder="e.g., 16 for 16%"
                    inputMode="decimal"
                  />
                  {formErrors.rate && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.rate}</p>
                  )}
                  {taxForm.rate && !formErrors.rate && (
                    <p className={`text-xs mt-1 ${
                      parseFloat(taxForm.rate) > 30 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {parseFloat(taxForm.rate) > 30 ? '⚠️ Rate seems high' : '✓ Valid rate'}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                    Applies To
                  </label>
                  <EnhancedSelect
                    value={taxForm.applies_to}
                    onChange={(value) => handleTaxInputChange('applies_to', value)}
                    options={appliesToOptions}
                    theme={theme}
                  />
                </div>
              </div>
            </div>

            {/* Scope and Settings */}
            <div>
              <h4 className={`text-md font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                Scope and Settings
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                    Access Type Scope
                  </label>
                  <EnhancedSelect
                    value={taxForm.access_type}
                    onChange={(value) => handleTaxInputChange('access_type', value)}
                    options={accessTypeOptions}
                    theme={theme}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                    Status
                  </label>
                  <EnhancedSelect
                    value={taxForm.status}
                    onChange={(value) => handleTaxInputChange('status', value)}
                    options={statusOptions}
                    theme={theme}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                    Description
                  </label>
                  <textarea
                    value={taxForm.description}
                    onChange={(e) => handleTaxInputChange('description', e.target.value)}
                    className={`${inputClass} w-full px-3 py-2 rounded-lg resize-none`}
                    placeholder="Optional description or notes"
                    rows={3}
                    maxLength={500}
                  />
                </div>
              </div>
            </div>

            {/* Effective Date Range */}
            <div>
              <h4 className={`text-md font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                Effective Period
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                    Effective From *
                  </label>
                  <input
                    type="datetime-local"
                    value={taxForm.effective_from}
                    onChange={(e) => handleTaxInputChange('effective_from', e.target.value)}
                    className={`${inputClass} w-full px-3 py-2 rounded-lg ${
                      formErrors.effective_from ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {formErrors.effective_from && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.effective_from}</p>
                  )}
                  <p className={`text-xs mt-1 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                    ⓘ Defaults to current time, but you can set any date
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                    Effective To (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={taxForm.effective_to || ''}
                    onChange={(e) => handleTaxInputChange('effective_to', e.target.value)}
                    className={`${inputClass} w-full px-3 py-2 rounded-lg ${
                      formErrors.effective_to ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {formErrors.effective_to && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.effective_to}</p>
                  )}
                  <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    Leave empty for indefinite duration
                  </p>
                </div>
              </div>
            </div>

            {/* Configuration Options */}
            <div>
              <h4 className={`text-md font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                Configuration Options
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_enabled"
                        checked={taxForm.is_enabled}
                        onChange={(e) => handleTaxInputChange('is_enabled', e.target.checked)}
                        className={`h-4 w-4 ${
                          theme === "dark" 
                            ? "text-indigo-400 focus:ring-indigo-400 border-gray-600" 
                            : "text-blue-600 focus:ring-blue-500 border-gray-300"
                        } rounded`}
                      />
                      <label htmlFor="is_enabled" className={`ml-2 block text-sm ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                        Enabled
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_included_in_price"
                        checked={taxForm.is_included_in_price}
                        onChange={(e) => handleTaxInputChange('is_included_in_price', e.target.checked)}
                        className={`h-4 w-4 ${
                          theme === "dark" 
                            ? "text-indigo-400 focus:ring-indigo-400 border-gray-600" 
                            : "text-blue-600 focus:ring-blue-500 border-gray-300"
                        } rounded`}
                      />
                      <label htmlFor="is_included_in_price" className={`ml-2 block text-sm ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                        Tax included in price
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requires_approval"
                      checked={taxForm.requires_approval}
                      onChange={(e) => handleTaxInputChange('requires_approval', e.target.checked)}
                      className={`h-4 w-4 ${
                        theme === "dark" 
                          ? "text-indigo-400 focus:ring-indigo-400 border-gray-600" 
                          : "text-blue-600 focus:ring-blue-500 border-gray-300"
                      } rounded`}
                    />
                    <label htmlFor="requires_approval" className={`ml-2 block text-sm ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                      Requires special approval
                    </label>
                    {formErrors.requires_approval && (
                      <p className="text-red-500 text-xs ml-2">{formErrors.requires_approval}</p>
                    )}
                  </div>
                </div>
                
                {/* Tax Impact Preview */}
                <div className={`p-3 rounded-lg border ${
                  theme === "dark" ? "border-gray-600 bg-gray-700/30" : "border-gray-200 bg-gray-50"
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Calculator className="w-4 h-4" />
                    <span className="text-sm font-medium">Tax Impact Preview</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
                      KES 1,000 × {taxForm.rate || 0}% = KES {((1000 * (parseFloat(taxForm.rate) || 0)) / 100).toFixed(2)}
                    </p>
                    {taxForm.is_included_in_price && (
                      <p className={theme === "dark" ? "text-green-300" : "text-green-600"}>
                        Tax included in base price
                      </p>
                    )}
                    {parseFloat(taxForm.rate) > 50 && (
                      <p className={theme === "dark" ? "text-yellow-300" : "text-yellow-600"}>
                        ⚠️ High rate - approval required
                      </p>
                    )}
                    {!taxForm.is_enabled && (
                      <p className={theme === "dark" ? "text-red-300" : "text-red-600"}>
                        ⚠️ Tax is disabled
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Revision Notes */}
            {editingTax && (
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                  Revision Notes
                </label>
                <textarea
                  value={taxForm.revision_notes || ''}
                  onChange={(e) => handleTaxInputChange('revision_notes', e.target.value)}
                  className={`${inputClass} w-full px-3 py-2 rounded-lg resize-none`}
                  placeholder="Describe the changes made in this revision..."
                  rows={2}
                  maxLength={255}
                />
              </div>
            )}

            {/* Form Validation Summary */}
            {Object.keys(formErrors).length > 0 && (
              <div className={`p-3 rounded-lg border ${
                theme === "dark" ? "border-red-600 bg-red-900/20" : "border-red-200 bg-red-50"
              }`}>
                <div className="flex items-center space-x-2">
                  <FaExclamationTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">
                    Please fix the following errors:
                  </span>
                </div>
                <ul className="text-xs text-red-600 dark:text-red-400 mt-1 list-disc list-inside">
                  {Object.values(formErrors).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Validation Success */}
            {taxForm.name && taxForm.rate && taxForm.effective_from && Object.keys(formErrors).length === 0 && (
              <div className={`p-3 rounded-lg border ${
                theme === "dark" ? "border-green-600 bg-green-900/20" : "border-green-200 bg-green-50"
              }`}>
                <div className="flex items-center space-x-2">
                  <FaSave className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Configuration Valid
                  </span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Ready to {editingTax ? 'update' : 'create'} tax configuration
                </p>
              </div>
            )}
          </div>

          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 sticky bottom-0 bg-inherit">
            <button
              onClick={() => {
                setShowTaxModal(false);
                resetTaxForm();
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                theme === "dark" 
                  ? "bg-gray-700 hover:bg-gray-600 text-white" 
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveTax}
              disabled={loading || !taxForm.name || !taxForm.rate || !taxForm.effective_from || Object.keys(formErrors).length > 0}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <FaSpinner className="animate-spin mr-2" />
                  {editingTax ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                <div className="flex items-center">
                  <FaSave className="mr-2" />
                  {editingTax ? 'Update Tax' : 'Create Tax'}
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TaxConfigurationPanel = ({ reconciliationData, theme, cardClass, textSecondaryClass, inputClass, onRefresh }) => {
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [editingTax, setEditingTax] = useState(null);
  const [deleteTax, setDeleteTax] = useState(null);
  const [cloneTax, setCloneTax] = useState(null);
  const [loading, setLoading] = useState(false);
  const [taxesLoading, setTaxesLoading] = useState(false);
  const [taxConfigurations, setTaxConfigurations] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [filters, setFilters] = useState({
    status: 'all',
    access_type: 'all',
    tax_type: 'all',
    search: '',
    show_disabled: true
  });

  // Initialize form with current time for effective_from
  const [taxForm, setTaxForm] = useState({
    name: '',
    tax_type: 'custom',
    rate: '',
    description: '',
    applies_to: 'revenue',
    access_type: 'all',
    is_enabled: true,
    is_included_in_price: false,
    requires_approval: false,
    status: 'active',
    effective_from: getCurrentDateTimeLocal(), // Default to current time
    effective_to: '',
    revision_notes: ''
  });

  // Enhanced options with all tax types from backend
  const taxTypeOptions = [
    { value: 'vat', label: 'VAT' },
    { value: 'withholding', label: 'Withholding Tax' },
    { value: 'custom', label: 'Custom Tax' },
    { value: 'sales', label: 'Sales Tax' },
    { value: 'service', label: 'Service Tax' },
    { value: 'excise', label: 'Excise Duty' }
  ];

  const appliesToOptions = [
    { value: 'revenue', label: 'Revenue Only' },
    { value: 'expenses', label: 'Expenses Only' },
    { value: 'both', label: 'Both Revenue & Expenses' }
  ];

  const accessTypeOptions = [
    { value: 'all', label: 'All Access Types' },
    { value: 'hotspot', label: 'Hotspot Only' },
    { value: 'pppoe', label: 'PPPoE Only' },
    { value: 'both', label: 'Both Access Types' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'archived', label: 'Archived' }
  ];

  const statusFilterOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active Only' },
    { value: 'inactive', label: 'Inactive Only' },
    { value: 'archived', label: 'Archived Only' }
  ];

  // Fetch tax configurations
  const fetchTaxConfigurations = useCallback(async (retryCount = 0) => {
    setTaxesLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.access_type !== 'all') params.append('access_type', filters.access_type);
      if (filters.tax_type !== 'all') params.append('tax_type', filters.tax_type);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/api/payments/taxes/?${params}`);
      
      // Handle both response structures (data.data and data)
      const taxData = response.data.data || response.data;
      
      if (Array.isArray(taxData)) {
        setTaxConfigurations(taxData);
      } else {
        console.error('Invalid tax data structure:', taxData);
        setTaxConfigurations([]);
      }
    } catch (error) {
      console.error('Failed to fetch tax configurations:', error);
      
      let errorMessage = 'Failed to load tax configurations';
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to view tax configurations.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      toast.error(errorMessage);
      
      // Fallback to reconciliation data
      const { tax_configuration = [] } = reconciliationData || {};
      if (Array.isArray(tax_configuration)) {
        setTaxConfigurations(tax_configuration);
      } else {
        setTaxConfigurations([]);
      }
    } finally {
      setTaxesLoading(false);
    }
  }, [filters, reconciliationData]);

  useEffect(() => {
    fetchTaxConfigurations();
  }, [fetchTaxConfigurations]);

  // Algorithm: Enhanced tax impact calculation with memoization
  const taxImpact = useMemo(() => 
    calculateTaxImpact(taxConfigurations, reconciliationData || {}),
    [taxConfigurations, reconciliationData]
  );

  // Algorithm: Enhanced tax recommendations
  const taxRecommendations = useMemo(() => 
    generateTaxRecommendations(taxConfigurations, reconciliationData || {}),
    [taxConfigurations, reconciliationData]
  );

  // Algorithm: Filtered tax configurations with disabled tax filter
  const filteredTaxConfigurations = useMemo(() => {
    return taxConfigurations.filter(tax => {
      if (filters.status !== 'all' && tax.status !== filters.status) return false;
      if (filters.access_type !== 'all' && tax.access_type !== filters.access_type) return false;
      if (filters.tax_type !== 'all' && tax.tax_type !== filters.tax_type) return false;
      if (!filters.show_disabled && !tax.is_enabled) return false;
      if (filters.search && !tax.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [taxConfigurations, filters]);

  // Algorithm: Enhanced form input handling with validation
  const handleTaxInputChange = useCallback((field, value) => {
    setTaxForm(prev => {
      const newForm = {
        ...prev,
        [field]: value
      };

      // Real-time validation
      const validationErrors = validateTaxConfiguration(newForm);
      setFormErrors(validationErrors);

      return newForm;
    });
  }, []);

  // Algorithm: Enhanced number input handling
  const handleNumberInput = useCallback((field, value) => {
    // Allow only numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    const formattedValue = parts.length > 2 
      ? parts[0] + '.' + parts.slice(1).join('')
      : numericValue;
    
    handleTaxInputChange(field, formattedValue);
  }, [handleTaxInputChange]);

  // Reset form with current time
  const resetTaxForm = useCallback(() => {
    setTaxForm({
      name: '',
      tax_type: 'custom',
      rate: '',
      description: '',
      applies_to: 'revenue',
      access_type: 'all',
      is_enabled: true,
      is_included_in_price: false,
      requires_approval: false,
      status: 'active',
      effective_from: getCurrentDateTimeLocal(), // Always reset to current time
      effective_to: '',
      revision_notes: ''
    });
    setFormErrors({});
    setEditingTax(null);
  }, []);

  // Algorithm: Enhanced tax saving with proper timestamp handling
  const handleSaveTax = useCallback(async () => {
    const validationErrors = validateTaxConfiguration(taxForm);
    
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      Object.values(validationErrors).forEach(error => toast.error(error));
      return;
    }

    setLoading(true);
    try {
      // Format data for backend - respect user's effective_from choice
      const taxData = {
        ...taxForm,
        rate: parseFloat(taxForm.rate),
        effective_from: formatDateTimeForBackend(taxForm.effective_from),
        effective_to: taxForm.effective_to ? formatDateTimeForBackend(taxForm.effective_to) : null,
        description: taxForm.description || null,
        revision_notes: taxForm.revision_notes || null
      };

      // Clean up empty strings for optional fields
      Object.keys(taxData).forEach(key => {
        if (taxData[key] === '') {
          taxData[key] = null;
        }
      });

      if (editingTax) {
        // Update existing tax - backend will handle updated_at automatically
        await api.patch(`/api/payments/taxes/${editingTax.id}/`, taxData);
        toast.success('Tax configuration updated successfully');
      } else {
        // Create new tax - backend will handle created_at automatically
        await api.post('/api/payments/taxes/', taxData);
        toast.success('Tax configuration created successfully');
      }

      setShowTaxModal(false);
      resetTaxForm();
      await fetchTaxConfigurations();
      onRefresh?.();
    } catch (error) {
      console.error('Tax save error:', error);
      
      let errorMessage = 'Failed to save tax configuration';
      let backendErrors = {};
      
      if (error.response?.status === 400) {
        errorMessage = 'Invalid tax data. Please check your inputs.';
        backendErrors = error.response.data;
      } else if (error.response?.status === 409) {
        errorMessage = 'A tax configuration with this name already exists.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = error.response?.data?.error || 
                      error.response?.data?.detail || 
                      error.response?.data?.message ||
                      error.message ||
                      'Failed to save tax configuration';
      }
      
      toast.error(errorMessage);
      
      // Handle validation errors from backend
      if (error.response?.status === 400 && error.response.data) {
        const formattedErrors = {};
        Object.keys(error.response.data).forEach(key => {
          if (Array.isArray(error.response.data[key])) {
            formattedErrors[key] = error.response.data[key].join(', ');
          } else if (typeof error.response.data[key] === 'string') {
            formattedErrors[key] = error.response.data[key];
          } else if (typeof error.response.data[key] === 'object') {
            formattedErrors[key] = JSON.stringify(error.response.data[key]);
          }
        });
        setFormErrors(formattedErrors);
      }
    } finally {
      setLoading(false);
    }
  }, [taxForm, editingTax, resetTaxForm, fetchTaxConfigurations, onRefresh]);

  // Enhanced tax editing with proper date parsing
  const handleEditTax = useCallback((tax) => {
    setEditingTax(tax);
    setTaxForm({
      name: tax.name,
      tax_type: tax.tax_type,
      rate: tax.rate?.toString() || '',
      description: tax.description || '',
      applies_to: tax.applies_to,
      access_type: tax.access_type,
      is_enabled: tax.is_enabled,
      is_included_in_price: tax.is_included_in_price,
      requires_approval: tax.requires_approval,
      status: tax.status,
      effective_from: parseBackendDateTime(tax.effective_from),
      effective_to: parseBackendDateTime(tax.effective_to),
      revision_notes: tax.revision_notes || ''
    });
    setFormErrors({});
    setShowTaxModal(true);
  }, []);

  // Enhanced tax cloning with proper data structure
  const handleCloneTax = useCallback(async (tax) => {
    setLoading(true);
    try {
      const cloneData = {
        name: `${tax.name} (Copy)`,
        tax_type: tax.tax_type,
        rate: parseFloat(tax.rate),
        description: tax.description,
        applies_to: tax.applies_to,
        access_type: tax.access_type,
        is_enabled: true, // Always enable cloned taxes
        is_included_in_price: tax.is_included_in_price,
        requires_approval: tax.requires_approval,
        status: 'active',
        effective_from: formatDateTimeForBackend(getCurrentDateTimeLocal()), // Use current time for clone
        revision_notes: `Cloned from ${tax.tax_code || tax.name}`
      };

      await api.post('/api/payments/taxes/', cloneData);
      toast.success('Tax configuration cloned successfully');
      await fetchTaxConfigurations();
      onRefresh?.();
    } catch (error) {
      console.error('Tax clone error:', error);
      
      let errorMessage = 'Failed to clone tax configuration';
      if (error.response?.status === 400) {
        errorMessage = 'Invalid clone data. Please try again.';
      } else if (error.response?.status === 409) {
        errorMessage = 'A tax configuration with this name already exists.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setCloneTax(null);
    }
  }, [fetchTaxConfigurations, onRefresh]);

  // Enhanced tax deletion with proper error handling
  const handleDeleteTax = useCallback(async () => {
    if (!deleteTax) return;

    setLoading(true);
    try {
      await api.delete(`/api/payments/taxes/${deleteTax.id}/`);
      
      toast.success(`Tax configuration "${deleteTax.name}" deleted successfully`);
      setDeleteTax(null);
      await fetchTaxConfigurations();
      onRefresh?.();
    } catch (error) {
      console.error('Tax deletion error:', error);
      
      let errorMessage = 'Failed to delete tax configuration';
      if (error.response?.status === 404) {
        errorMessage = 'Tax configuration not found. It may have been already deleted.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to delete this tax configuration.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = error.response?.data?.error || 
                      error.response?.data?.detail || 
                      'Failed to delete tax configuration';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [deleteTax, fetchTaxConfigurations, onRefresh]);

  // Enhanced tax status management with optimistic updates
  const handleUpdateTaxStatus = useCallback(async (tax, updates) => {
    const originalTax = { ...tax };
    
    // Optimistic update
    setTaxConfigurations(prev => 
      prev.map(t => 
        t.id === tax.id ? { ...t, ...updates } : t
      )
    );

    try {
      // Format data for backend
      const updateData = { ...updates };

      await api.patch(`/api/payments/taxes/${tax.id}/`, updateData);
      
      let message = '';
      if (updates.hasOwnProperty('is_enabled')) {
        message = `Tax ${updates.is_enabled ? 'enabled' : 'disabled'} successfully`;
      } else if (updates.hasOwnProperty('status')) {
        message = `Tax status updated to ${updates.status} successfully`;
      } else {
        message = 'Tax configuration updated successfully';
      }
      
      toast.success(message);
      await fetchTaxConfigurations();
      onRefresh?.();
    } catch (error) {
      console.error('Tax status update error:', error);
      // Revert optimistic update
      setTaxConfigurations(prev => 
        prev.map(t => 
          t.id === tax.id ? originalTax : t
        )
      );
      
      let errorMessage = 'Failed to update tax configuration';
      if (error.response?.status === 400) {
        errorMessage = 'Invalid update data. Please check your inputs.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Tax configuration not found.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      toast.error(errorMessage);
    }
  }, [fetchTaxConfigurations, onRefresh]);

  // Algorithm: Tax simulation for preview
  const simulateTaxImpact = useCallback((amount, accessType = 'all') => {
    const applicableTaxes = taxConfigurations.filter(tax => 
      tax.is_enabled && 
      tax.status === 'active' &&
      (tax.access_type === 'all' || tax.access_type === accessType) &&
      (tax.applies_to === 'revenue' || tax.applies_to === 'both')
    );

    let totalTax = 0;
    let breakdown = [];

    applicableTaxes.forEach(tax => {
      const taxAmount = tax.is_included_in_price 
        ? amount - (amount / (1 + (parseFloat(tax.rate) || 0) / 100))
        : amount * ((parseFloat(tax.rate) || 0) / 100);
      
      totalTax += taxAmount;
      breakdown.push({
        name: tax.name,
        rate: tax.rate,
        amount: taxAmount,
        isIncluded: tax.is_included_in_price,
        type: tax.tax_type
      });
    });

    return {
      totalTax,
      breakdown,
      netAmount: amount - totalTax,
      grossAmount: applicableTaxes.some(tax => tax.is_included_in_price) ? amount : amount + totalTax
    };
  }, [taxConfigurations]);

  // Enhanced TaxCard Component with proper timestamp display
  const TaxCard = ({ tax }) => {
    const isEffective = isTaxEffective(tax);
    
    return (
      <div className={`p-4 rounded-lg border transition-all duration-300 ${
        theme === "dark" 
          ? `bg-gray-700/30 ${tax.is_enabled ? (isEffective ? 'border-green-600' : 'border-yellow-600') : 'border-red-600'} hover:bg-gray-700/50` 
          : `bg-white ${tax.is_enabled ? (isEffective ? 'border-green-200' : 'border-yellow-200') : 'border-red-300'} hover:bg-gray-50`
      } ${!tax.is_enabled ? 'opacity-75' : ''}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className={`font-semibold truncate ${!tax.is_enabled ? 'line-through' : ''} ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                {tax.name}
                {!tax.is_enabled && (
                  <span className="ml-2 text-xs text-red-500">(Disabled)</span>
                )}
              </h4>
              {tax.tax_code && (
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  theme === "dark" ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-600"
                }`}>
                  <FaCode className="inline w-3 h-3 mr-1" />
                  {tax.tax_code}
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-1 mb-2">
              <span className={`text-sm px-2 py-1 rounded-full ${
                theme === "dark" 
                  ? `${tax.is_enabled ? (isEffective ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300') : 'bg-red-900 text-red-300'}` 
                  : `${tax.is_enabled ? (isEffective ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800') : 'bg-red-100 text-red-800'}`
              }`}>
                {tax.rate}%
                {!tax.is_enabled && ' ⚠️'}
              </span>
              
              <span className={`text-xs px-2 py-1 rounded-full ${
                theme === "dark" ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-800"
              }`}>
                {tax.tax_type_display || tax.tax_type}
              </span>

              {!isEffective && tax.is_enabled && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  theme === "dark" ? "bg-yellow-900 text-yellow-300" : "bg-yellow-100 text-yellow-800"
                }`}>
                  <Clock className="inline w-3 h-3 mr-1" />
                  Not Effective
                </span>
              )}

              {tax.requires_approval && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  theme === "dark" ? "bg-purple-900 text-purple-300" : "bg-purple-100 text-purple-800"
                }`}>
                  Requires Approval
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
            {/* Status Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUpdateTaxStatus(tax, { is_enabled: !tax.is_enabled });
              }}
              className={`p-1 rounded ${
                tax.is_enabled 
                  ? "text-green-500 hover:text-green-600" 
                  : "text-gray-400 hover:text-gray-500"
              }`}
              title={tax.is_enabled ? 'Disable Tax' : 'Enable Tax'}
            >
              {tax.is_enabled ? <FaToggleOn className="w-5 h-5" /> : <FaToggleOff className="w-5 h-5" />}
            </button>
            
            {/* Edit Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditTax(tax);
              }}
              className={`p-1 rounded ${
                theme === "dark" 
                  ? "text-blue-400 hover:text-blue-300" 
                  : "text-blue-600 hover:text-blue-800"
              }`}
              title="Edit Tax"
            >
              <FaEdit className="w-4 h-4" />
            </button>

            {/* Clone Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCloneTax(tax);
              }}
              className={`p-1 rounded ${
                theme === "dark" 
                  ? "text-green-400 hover:text-green-300" 
                  : "text-green-600 hover:text-green-800"
              }`}
              title="Clone Tax"
            >
              <Copy className="w-4 h-4" />
            </button>
            
            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTax(tax);
              }}
              className={`p-1 rounded text-red-500 hover:text-red-600`}
              title="Delete Tax"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className={textSecondaryClass}>Applies To</span>
            <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
              {tax.applies_to_display || tax.applies_to}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className={textSecondaryClass}>Access Type</span>
            <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
              <AccessTypeBadge accessType={tax.access_type} theme={theme} size="sm" />
            </span>
          </div>

          <div className="flex justify-between">
            <span className={textSecondaryClass}>Status</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              tax.status === 'active' 
                ? (theme === "dark" ? "bg-green-900 text-green-300" : "bg-green-100 text-green-800")
                : tax.status === 'inactive'
                ? (theme === "dark" ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-600")
                : (theme === "dark" ? "bg-yellow-900 text-yellow-300" : "bg-yellow-100 text-yellow-800")
            }`}>
              {tax.status_display || tax.status}
            </span>
          </div>
          
          {tax.description && (
            <div className="text-sm">
              <span className={textSecondaryClass}>Description: </span>
              <span className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
                {tax.description}
              </span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className={textSecondaryClass}>Price Inclusion</span>
            <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
              {tax.is_included_in_price ? 'Included' : 'Added'}
            </span>
          </div>

          {/* Effective Period */}
          <div className="flex justify-between">
            <span className={textSecondaryClass}>Effective From</span>
            <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
              {formatDate(tax.effective_from)}
            </span>
          </div>

          {tax.effective_to && (
            <div className="flex justify-between">
              <span className={textSecondaryClass}>Effective To</span>
              <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
                {formatDate(tax.effective_to)}
              </span>
            </div>
          )}

          {/* Timestamp Information */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-between text-xs">
              <span className={textSecondaryClass}>Created</span>
              <span className={textSecondaryClass}>
                {tax.created_by_name && (
                  <><FaUser className="inline w-3 h-3 mr-1" />{tax.created_by_name} • </>
                )}
                {formatDate(tax.created_at)}
              </span>
            </div>
            {tax.updated_at && tax.updated_at !== tax.created_at && (
              <div className="flex justify-between text-xs mt-1">
                <span className={textSecondaryClass}>Updated</span>
                <span className={textSecondaryClass}>
                  {tax.updated_by_name && (
                    <><FaUser className="inline w-3 h-3 mr-1" />{tax.updated_by_name} • </>
                  )}
                  {formatDate(tax.updated_at)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <span className={`text-xs ${textSecondaryClass}`}>
            v{tax.version} • {tax.is_enabled ? (isEffective ? 'Active' : 'Scheduled') : 'Disabled'}
          </span>
          <div className="flex space-x-1">
            <button
              onClick={() => {
                const simulation = simulateTaxImpact(1000, tax.access_type);
                toast.success(
                  `KES 1,000 → KES ${simulation.netAmount.toFixed(2)} net with ${simulation.breakdown.length} tax(es)`
                );
              }}
              className={`text-xs px-2 py-1 rounded ${
                theme === "dark" ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Test
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${cardClass} p-6 transition-colors duration-300`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1">
            <h2 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"} mb-2 flex items-center`}>
              <FaChartBar className="mr-2" /> Tax Configuration Management
            </h2>
            <p className={textSecondaryClass}>
              Configure and manage tax rules across different access types and revenue streams
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={fetchTaxConfigurations}
              disabled={taxesLoading}
              className={`flex items-center justify-center px-4 py-2 rounded-lg ${
                theme === "dark" 
                  ? "bg-gray-700 hover:bg-gray-600 text-white" 
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              } disabled:opacity-50 transition-colors duration-200`}
            >
              {taxesLoading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaSpinner className="mr-2" />
              )}
              Refresh
            </button>
            <button
              onClick={() => setShowTaxModal(true)}
              className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <FaPlus className="mr-2" />
              Add Tax
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`${cardClass} p-6 transition-colors duration-300`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
              Status
            </label>
            <EnhancedSelect
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              options={statusFilterOptions}
              theme={theme}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
              Access Type
            </label>
            <EnhancedSelect
              value={filters.access_type}
              onChange={(value) => setFilters(prev => ({ ...prev, access_type: value }))}
              options={accessTypeOptions}
              theme={theme}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
              Tax Type
            </label>
            <EnhancedSelect
              value={filters.tax_type}
              onChange={(value) => setFilters(prev => ({ ...prev, tax_type: value }))}
              options={[{ value: 'all', label: 'All Types' }, ...taxTypeOptions]}
              theme={theme}
            />
          </div>

          {/* Show Disabled Taxes Toggle */}
          <div className="flex items-end">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="show_disabled"
                checked={filters.show_disabled}
                onChange={(e) => setFilters(prev => ({ ...prev, show_disabled: e.target.checked }))}
                className={`h-4 w-4 ${
                  theme === "dark" 
                    ? "text-indigo-400 focus:ring-indigo-400 border-gray-600" 
                    : "text-blue-600 focus:ring-blue-500 border-gray-300"
                } rounded`}
              />
              <label htmlFor="show_disabled" className={`ml-2 block text-sm ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                Show Disabled
              </label>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
              Search Taxes
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className={`${inputClass} w-full px-3 py-2 rounded-lg`}
              placeholder="Search by name, tax code, or description..."
            />
          </div>
        </div>
      </div>

      {/* Tax Impact Overview */}
      {taxConfigurations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className={`p-4 rounded-lg border-l-4 ${
            theme === "dark" ? "border-blue-500 bg-blue-900/20" : "border-blue-500 bg-blue-50"
          }`}>
            <h3 className={`text-sm ${textSecondaryClass} mb-1`}>Active Taxes</h3>
            <p className={`text-2xl font-bold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
              {taxImpact.activeCount}
            </p>
            <p className={`text-xs ${textSecondaryClass}`}>
              {taxImpact.enabledCount} enabled • {taxImpact.disabledCount} disabled
            </p>
          </div>
          
          <div className={`p-4 rounded-lg border-l-4 ${
            theme === "dark" ? "border-green-500 bg-green-900/20" : "border-green-500 bg-green-50"
          }`}>
            <h3 className={`text-sm ${textSecondaryClass} mb-1`}>Revenue Impact</h3>
            <p className={`text-2xl font-bold ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
              {typeof taxImpact.totalRevenueTax === 'number' ? taxImpact.totalRevenueTax.toFixed(1) : '0.0'}%
            </p>
            <p className={`text-xs ${textSecondaryClass}`}>Total rate on revenue</p>
          </div>
          
          <div className={`p-4 rounded-lg border-l-4 ${
            theme === "dark" ? "border-purple-500 bg-purple-900/20" : "border-purple-500 bg-purple-50"
          }`}>
            <h3 className={`text-sm ${textSecondaryClass} mb-1`}>Expense Impact</h3>
            <p className={`text-2xl font-bold ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`}>
              {typeof taxImpact.totalExpenseTax === 'number' ? taxImpact.totalExpenseTax.toFixed(1) : '0.0'}%
            </p>
            <p className={`text-xs ${textSecondaryClass}`}>Total rate on expenses</p>
          </div>
          
          <div className={`p-4 rounded-lg border-l-4 ${
            theme === "dark" ? "border-yellow-500 bg-yellow-900/20" : "border-yellow-500 bg-yellow-50"
          }`}>
            <h3 className={`text-sm ${textSecondaryClass} mb-1`}>Configurations</h3>
            <p className={`text-2xl font-bold ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"}`}>
              {taxConfigurations.length}
            </p>
            <p className={`text-xs ${textSecondaryClass}`}>
              {taxImpact.archivedCount} archived
            </p>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {taxRecommendations.length > 0 && (
        <div className={`${cardClass} p-6 transition-colors duration-300`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"} flex items-center`}>
            <FaExclamationTriangle className="mr-2 text-yellow-500" />
            Configuration Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {taxRecommendations.slice(0, 6).map((rec, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${
                  rec.priority === 'high' 
                    ? (theme === "dark" ? "border-red-600 bg-red-900/20" : "border-red-200 bg-red-50")
                    : rec.priority === 'medium'
                    ? (theme === "dark" ? "border-yellow-600 bg-yellow-900/20" : "border-yellow-200 bg-yellow-50")
                    : (theme === "dark" ? "border-blue-600 bg-blue-900/20" : "border-blue-200 bg-blue-50")
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className={`font-medium text-sm ${
                      rec.priority === 'high' 
                        ? (theme === "dark" ? "text-red-300" : "text-red-700")
                        : rec.priority === 'medium'
                        ? (theme === "dark" ? "text-yellow-300" : "text-yellow-700")
                        : (theme === "dark" ? "text-blue-300" : "text-blue-700")
                    }`}>
                      {rec.message}
                    </h4>
                    <p className={`text-xs mt-1 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}>
                      {rec.action}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0 ${
                    rec.priority === 'high' 
                      ? (theme === "dark" ? "bg-red-900 text-red-300" : "bg-red-100 text-red-800")
                      : rec.priority === 'medium'
                      ? (theme === "dark" ? "bg-yellow-900 text-yellow-300" : "bg-yellow-100 text-yellow-800")
                      : (theme === "dark" ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-800")
                  }`}>
                    {rec.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tax Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {taxesLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border animate-pulse ${
                theme === "dark" ? "bg-gray-700/30 border-gray-600" : "bg-gray-100 border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-6 bg-gray-400 dark:bg-gray-600 rounded w-1/4"></div>
              </div>
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-3 bg-gray-400 dark:bg-gray-600 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-400 dark:bg-gray-600 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : filteredTaxConfigurations.length > 0 ? (
          filteredTaxConfigurations.map((tax) => (
            <TaxCard key={tax.id} tax={tax} />
          ))
        ) : (
          <div className={`col-span-3 p-8 text-center rounded-lg border-2 border-dashed ${
            theme === "dark" ? "border-gray-600" : "border-gray-300"
          }`}>
            <FaPlus className={`w-12 h-12 mx-auto mb-4 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
            <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
              {filters.search || filters.status !== 'all' || filters.access_type !== 'all' || filters.tax_type !== 'all' || !filters.show_disabled
                ? 'No matching tax configurations found' 
                : 'No Tax Configurations'
              }
            </h3>
            <p className={textSecondaryClass}>
              {filters.search || filters.status !== 'all' || filters.access_type !== 'all' || filters.tax_type !== 'all' || !filters.show_disabled
                ? 'Try adjusting your filters or search terms'
                : 'Get started by creating your first tax configuration to manage revenue and expense taxes'
              }
            </p>
            {(filters.search || filters.status !== 'all' || filters.access_type !== 'all' || filters.tax_type !== 'all' || !filters.show_disabled) && (
              <button
                onClick={() => setFilters({
                  status: 'all',
                  access_type: 'all',
                  tax_type: 'all',
                  search: '',
                  show_disabled: true
                })}
                className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Clear Filters
              </button>
            )}
            {!filters.search && filters.status === 'all' && filters.access_type === 'all' && filters.tax_type === 'all' && filters.show_disabled && (
              <button
                onClick={() => setShowTaxModal(true)}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Create First Tax
              </button>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Tax Analytics */}
      {taxConfigurations.length > 0 && (
        <div className={`${cardClass} p-6 transition-colors duration-300`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
            Tax Configuration Analytics
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* By Tax Type */}
            <div className={`p-4 rounded-lg ${
              theme === "dark" ? "bg-blue-900/20 border-blue-700" : "bg-blue-50 border-blue-200"
            } border`}>
              <h4 className={`text-sm font-medium mb-3 ${theme === "dark" ? "text-blue-300" : "text-blue-700"} flex items-center`}>
                <FaChartBar className="mr-2" /> By Tax Type
              </h4>
              <div className="space-y-2">
                {Object.entries(taxImpact.byTaxType).map(([type, data]) => (
                  <div key={type} className="flex justify-between items-center text-sm">
                    <span className="capitalize">{type.replace('_', ' ')}</span>
                    <div className="text-right">
                      <div className="font-semibold">{data.count} configs</div>
                      <div className={`text-xs ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                        {data.totalRate.toFixed(1)}% total
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* By Access Type */}
            <div className={`p-4 rounded-lg ${
              theme === "dark" ? "bg-green-900/20 border-green-700" : "bg-green-50 border-green-200"
            } border`}>
              <h4 className={`text-sm font-medium mb-3 ${theme === "dark" ? "text-green-300" : "text-green-700"} flex items-center`}>
                <BarChart3 className="mr-2" /> By Access Type
              </h4>
              <div className="space-y-2">
                {Object.entries(taxImpact.byAccessType).map(([accessType, data]) => (
                  <div key={accessType} className="flex justify-between items-center text-sm">
                    <span>
                      <AccessTypeBadge accessType={accessType} theme={theme} size="sm" />
                    </span>
                    <div className="text-right">
                      <div className="font-semibold">{data.count}</div>
                      <div className={`text-xs ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
                        Rev: {data.revenue.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Status Overview */}
            <div className={`p-4 rounded-lg ${
              theme === "dark" ? "bg-yellow-900/20 border-yellow-700" : "bg-yellow-50 border-yellow-200"
            } border`}>
              <h4 className={`text-sm font-medium mb-3 ${theme === "dark" ? "text-yellow-300" : "text-yellow-700"} flex items-center`}>
                <FaToggleOn className="mr-2" /> Status Overview
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Active & Effective</span>
                  <span className="font-semibold text-green-500">{taxImpact.activeCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Disabled</span>
                  <span className="font-semibold text-red-500">{taxImpact.disabledCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Archived</span>
                  <span className="font-semibold text-yellow-500">{taxImpact.archivedCount}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(taxImpact.enabledCount / taxConfigurations.length) * 100}%` 
                    }}
                  ></div>
                </div>
                <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                  {((taxImpact.enabledCount / taxConfigurations.length) * 100).toFixed(1)}% Enabled
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={`p-4 rounded-lg ${
              theme === "dark" ? "bg-purple-900/20 border-purple-700" : "bg-purple-50 border-purple-200"
            } border`}>
              <h4 className={`text-sm font-medium mb-3 ${theme === "dark" ? "text-purple-300" : "text-purple-700"} flex items-center`}>
                <FaMoneyBillWave className="mr-2" /> Quick Actions
              </h4>
              <div className="space-y-2">
                <button
                  onClick={() => setShowTaxModal(true)}
                  className="w-full text-left p-2 rounded hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors duration-200"
                >
                  + Create New Tax
                </button>
                <button
                  onClick={fetchTaxConfigurations}
                  className="w-full text-left p-2 rounded hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors duration-200"
                >
                  ↻ Refresh Data
                </button>
                <button
                  onClick={() => {
                    const simulation = simulateTaxImpact(5000, 'all');
                    toast.success(`Tax simulation: KES 5,000 → KES ${simulation.netAmount.toFixed(2)} net`);
                  }}
                  className="w-full text-left p-2 rounded hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors duration-200"
                >
                  🧪 Test Tax Calculation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <TaxFormModal
        showTaxModal={showTaxModal}
        setShowTaxModal={setShowTaxModal}
        editingTax={editingTax}
        taxForm={taxForm}
        handleTaxInputChange={handleTaxInputChange}
        handleNumberInput={handleNumberInput}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        theme={theme}
        cardClass={cardClass}
        inputClass={inputClass}
        handleSaveTax={handleSaveTax}
        loading={loading}
        resetTaxForm={resetTaxForm}
        taxTypeOptions={taxTypeOptions}
        appliesToOptions={appliesToOptions}
        accessTypeOptions={accessTypeOptions}
        statusOptions={statusOptions}
      />
      
      <ConfirmationModal
        isOpen={!!deleteTax}
        onClose={() => setDeleteTax(null)}
        onConfirm={handleDeleteTax}
        title="Delete Tax Configuration"
        message={`Are you sure you want to delete the tax configuration "${deleteTax?.name}"? This action cannot be undone and will be permanently removed from the system.`}
        confirmText="Delete Tax Configuration"
        type="danger"
        theme={theme}
      />

      <ConfirmationModal
        isOpen={!!cloneTax}
        onClose={() => setCloneTax(null)}
        onConfirm={() => handleCloneTax(cloneTax)}
        title="Clone Tax Configuration"
        message={`Create a copy of "${cloneTax?.name}" tax configuration? The clone will have "(Copy)" appended to its name.`}
        confirmText="Clone Tax"
        type="info"
        theme={theme}
      />
    </div>
  );
};

export default TaxConfigurationPanel;