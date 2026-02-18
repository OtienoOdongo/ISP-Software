




// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   DollarSign, Percent, Tag, TrendingUp, TrendingDown,
//   Calendar, Users, Package, Layers, Award, CheckCircle,
//   ChevronDown, ChevronUp, Plus, Trash2, Edit, Calculator, X,
//   AlertCircle, Check, Clock, Zap, Gift, Star, Target,
//   Save, RefreshCw, Filter, Copy, Eye, EyeOff,
//   BarChart3, PieChart, Activity, CreditCard, BadgePercent,
//   ArrowRight, Infinity, AlertTriangle, Settings, Info
// } from 'lucide-react';
// import { FaSpinner } from 'react-icons/fa';
// import { toast } from 'react-toastify';

// import { getThemeClasses, EmptyState, ConfirmationModal } from '../Shared/components';
// import { formatNumber, formatCurrency, formatDate } from '../Shared/formatters';
// import usePricing from './hooks/usePricing';

// // ============================================================================
// // CONSTANTS - Match backend exactly
// // ============================================================================

// const DISCOUNT_TYPES = [
//   { value: 'percentage', label: 'Percentage Discount', icon: Percent, color: 'blue' },
//   { value: 'fixed', label: 'Fixed Amount', icon: DollarSign, color: 'green' },
//   { value: 'tiered', label: 'Tiered Pricing', icon: Layers, color: 'purple' },
//   { value: 'volume', label: 'Volume Discount', icon: TrendingDown, color: 'orange' },
//   { value: 'none', label: 'No Discount', icon: Tag, color: 'gray' }
// ];

// const RULE_TYPES = [
//   { value: 'first_time', label: 'First Time Purchase', icon: Gift, color: 'blue' },
//   { value: 'loyalty', label: 'Loyalty Discount', icon: Award, color: 'purple' },
//   { value: 'seasonal', label: 'Seasonal Promotion', icon: Calendar, color: 'green' },
//   { value: 'referral', label: 'Referral Bonus', icon: Users, color: 'orange' },
//   { value: 'bulk', label: 'Bulk Purchase', icon: Package, color: 'indigo' }
// ];

// const QUANTITY_PRESETS = [1, 5, 10, 20, 50, 100];

// // ============================================================================
// // HELPER COMPONENTS
// // ============================================================================

// /**
//  * Section Header Component
//  */
// const SectionHeader = ({ icon: Icon, title, description, theme }) => {
//   const themeClasses = getThemeClasses(theme);
  
//   return (
//     <div className="flex items-start gap-3 mb-4">
//       <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
//         <Icon className={`w-5 h-5 ${themeClasses.text.primary}`} />
//       </div>
//       <div>
//         <h3 className={`font-semibold ${themeClasses.text.primary}`}>{title}</h3>
//         {description && (
//           <p className={`text-sm mt-1 ${themeClasses.text.secondary}`}>{description}</p>
//         )}
//       </div>
//     </div>
//   );
// };

// /**
//  * Input Field Component
//  */
// const InputField = ({
//   label,
//   type = 'text',
//   value,
//   onChange,
//   error,
//   placeholder,
//   min,
//   max,
//   step,
//   disabled,
//   theme,
//   icon: Icon,
//   required,
//   helperText
// }) => {
//   const themeClasses = getThemeClasses(theme);
  
//   return (
//     <div className="space-y-1">
//       {label && (
//         <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//           {label}
//           {required && <span className="text-red-500 ml-1">*</span>}
//         </label>
//       )}
//       <div className="relative">
//         {Icon && (
//           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//             <Icon className={`w-4 h-4 ${themeClasses.text.secondary}`} />
//           </div>
//         )}
//         <input
//           type={type}
//           value={value || ''}
//           onChange={(e) => onChange(e.target.value)}
//           placeholder={placeholder}
//           min={min}
//           max={max}
//           step={step}
//           disabled={disabled}
//           className={`w-full px-3 py-2 rounded-lg border ${
//             Icon ? 'pl-10' : ''
//           } ${
//             error
//               ? 'border-red-500 focus:ring-red-500'
//               : theme === 'dark'
//                 ? 'border-gray-700 bg-gray-800 focus:ring-indigo-500 focus:border-indigo-500'
//                 : 'border-gray-300 bg-white focus:ring-indigo-500 focus:border-indigo-500'
//           } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${themeClasses.text.primary}`}
//         />
//       </div>
//       {error && (
//         <p className="text-xs text-red-500 mt-1">{error}</p>
//       )}
//       {helperText && !error && (
//         <p className={`text-xs ${themeClasses.text.secondary}`}>{helperText}</p>
//       )}
//     </div>
//   );
// };

// /**
//  * Select Field Component
//  */
// const SelectField = ({
//   label,
//   value,
//   onChange,
//   options,
//   error,
//   disabled,
//   theme,
//   required
// }) => {
//   const themeClasses = getThemeClasses(theme);
  
//   return (
//     <div className="space-y-1">
//       {label && (
//         <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//           {label}
//           {required && <span className="text-red-500 ml-1">*</span>}
//         </label>
//       )}
//       <select
//         value={value || ''}
//         onChange={(e) => onChange(e.target.value)}
//         disabled={disabled}
//         className={`w-full px-3 py-2 rounded-lg border ${
//           error
//             ? 'border-red-500'
//             : theme === 'dark'
//               ? 'bg-gray-800 border-gray-700'
//               : 'bg-white border-gray-300'
//         } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${themeClasses.text.primary}`}
//       >
//         <option value="">Select...</option>
//         {options.map(option => (
//           <option key={option.value} value={option.value}>
//             {option.label}
//           </option>
//         ))}
//       </select>
//       {error && (
//         <p className="text-xs text-red-500 mt-1">{error}</p>
//       )}
//     </div>
//   );
// };

// /**
//  * Toggle Switch Component
//  */
// const ToggleSwitch = ({ enabled, onChange, label, description, theme }) => {
//   const themeClasses = getThemeClasses(theme);
  
//   return (
//     <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
//       <div>
//         <p className={`text-sm font-medium ${themeClasses.text.primary}`}>{label}</p>
//         {description && (
//           <p className={`text-xs mt-1 ${themeClasses.text.secondary}`}>{description}</p>
//         )}
//       </div>
//       <button
//         type="button"
//         onClick={() => onChange(!enabled)}
//         className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
//           enabled ? 'bg-indigo-600' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
//         }`}
//       >
//         <span
//           className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
//             enabled ? 'translate-x-6' : 'translate-x-1'
//           }`}
//         />
//       </button>
//     </div>
//   );
// };

// /**
//  * Tier Row Component
//  */
// const TierRow = ({ tier, index, onUpdate, onRemove, theme, currency = 'KES' }) => {
//   const themeClasses = getThemeClasses(theme);
  
//   return (
//     <div className="flex items-center gap-2">
//       <div className="flex-1">
//         <input
//           type="number"
//           min="1"
//           value={tier.min_qty}
//           onChange={(e) => onUpdate(index, 'min_qty', parseInt(e.target.value) || 1)}
//           className={`w-full px-3 py-2 rounded-lg border ${
//             theme === 'dark'
//               ? 'bg-gray-800 border-gray-700'
//               : 'bg-white border-gray-300'
//           } ${themeClasses.text.primary}`}
//           placeholder="Min Qty"
//         />
//       </div>
//       <div className="flex-1">
//         <div className="relative">
//           <span className="absolute left-3 top-2 text-sm text-gray-500">KES</span>
//           <input
//             type="number"
//             min="0"
//             step="0.01"
//             value={tier.price}
//             onChange={(e) => onUpdate(index, 'price', e.target.value)}
//             className={`w-full pl-12 pr-3 py-2 rounded-lg border ${
//               theme === 'dark'
//                 ? 'bg-gray-800 border-gray-700'
//                 : 'bg-white border-gray-300'
//             } ${themeClasses.text.primary}`}
//             placeholder="Price"
//           />
//         </div>
//       </div>
//       <button
//         onClick={() => onRemove(index)}
//         className="p-2 text-red-600 hover:text-red-800 dark:text-red-400"
//       >
//         <Trash2 className="w-4 h-4" />
//       </button>
//     </div>
//   );
// };

// /**
//  * Volume Discount Tier Component
//  */
// const VolumeTierRow = ({ tier, index, onUpdate, onRemove, theme }) => {
//   const themeClasses = getThemeClasses(theme);
  
//   return (
//     <div className="flex items-center gap-2">
//       <div className="flex-1">
//         <input
//           type="number"
//           min="1"
//           value={tier.min_qty}
//           onChange={(e) => onUpdate(index, 'min_qty', parseInt(e.target.value) || 1)}
//           className={`w-full px-3 py-2 rounded-lg border ${
//             theme === 'dark'
//               ? 'bg-gray-800 border-gray-700'
//               : 'bg-white border-gray-300'
//           } ${themeClasses.text.primary}`}
//           placeholder="Min Qty"
//         />
//       </div>
//       <div className="flex-1">
//         <div className="relative">
//           <input
//             type="number"
//             min="0"
//             max="100"
//             step="0.1"
//             value={tier.discount_percentage}
//             onChange={(e) => onUpdate(index, 'discount_percentage', parseFloat(e.target.value) || 0)}
//             className={`w-full pr-8 pl-3 py-2 rounded-lg border ${
//               theme === 'dark'
//                 ? 'bg-gray-800 border-gray-700'
//                 : 'bg-white border-gray-300'
//             } ${themeClasses.text.primary}`}
//             placeholder="Discount %"
//           />
//           <span className="absolute right-3 top-2 text-sm text-gray-500">%</span>
//         </div>
//       </div>
//       <button
//         onClick={() => onRemove(index)}
//         className="p-2 text-red-600 hover:text-red-800 dark:text-red-400"
//       >
//         <Trash2 className="w-4 h-4" />
//       </button>
//     </div>
//   );
// };

// /**
//  * Price Calculation Card Component
//  */
// const PriceCalculationCard = ({ calculation, theme }) => {
//   const themeClasses = getThemeClasses(theme);
  
//   if (!calculation) return null;
  
//   return (
//     <div className={`p-4 rounded-xl border ${
//       theme === 'dark'
//         ? 'bg-gray-800/50 border-gray-700'
//         : 'bg-white border-gray-200'
//     }`}>
//       <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${themeClasses.text.primary}`}>
//         <Calculator className="w-4 h-4" />
//         Price Breakdown
//       </h4>
      
//       <div className="space-y-3">
//         <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
//           <span className={`text-sm ${themeClasses.text.secondary}`}>Quantity</span>
//           <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
//             {calculation.quantity}
//           </span>
//         </div>
        
//         <div className="flex justify-between items-center">
//           <span className={`text-sm ${themeClasses.text.secondary}`}>Base Price (per unit)</span>
//           <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
//             {formatCurrency(calculation.base_price_per_unit)}
//           </span>
//         </div>
        
//         <div className="flex justify-between items-center">
//           <span className={`text-sm ${themeClasses.text.secondary}`}>Total Base Price</span>
//           <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
//             {formatCurrency(calculation.total_base_price)}
//           </span>
//         </div>
        
//         <div className="flex justify-between items-center text-green-600 dark:text-green-400">
//           <span className="text-sm font-medium">Discount</span>
//           <span className="text-sm font-medium">
//             -{formatCurrency(calculation.total_discount)}
//           </span>
//         </div>
        
//         <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
//           <span className={`text-base font-bold ${themeClasses.text.primary}`}>Final Price</span>
//           <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
//             {formatCurrency(calculation.final_price)}
//           </span>
//         </div>
        
//         <div className="flex justify-between items-center text-xs text-gray-500">
//           <span>Price per unit</span>
//           <span>{formatCurrency(calculation.final_price_per_unit)}</span>
//         </div>
        
//         {calculation.tax_amount > 0 && (
//           <div className="flex justify-between items-center text-xs text-gray-500">
//             <span>Tax ({calculation.tax_rate}%)</span>
//             <span>{formatCurrency(calculation.tax_amount)}</span>
//           </div>
//         )}
        
//         {calculation.applied_discounts && calculation.applied_discounts.length > 0 && (
//           <div className="mt-3">
//             <p className={`text-xs font-medium mb-2 ${themeClasses.text.secondary}`}>
//               Applied Discounts:
//             </p>
//             <div className="space-y-1">
//               {calculation.applied_discounts.map((discount, idx) => (
//                 <div key={idx} className="flex items-center gap-2 text-xs">
//                   <Check className="w-3 h-3 text-green-600" />
//                   <span className={themeClasses.text.secondary}>{discount.description}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// /**
//  * Bulk Calculation Table Component
//  */
// const BulkCalculationTable = ({ calculations, theme }) => {
//   const themeClasses = getThemeClasses(theme);
  
//   if (!calculations || calculations.length === 0) return null;
  
//   return (
//     <div className="overflow-x-auto">
//       <table className="w-full text-sm">
//         <thead>
//           <tr className={`border-b ${themeClasses.border.light}`}>
//             <th className={`py-2 text-left font-medium ${themeClasses.text.secondary}`}>Qty</th>
//             <th className={`py-2 text-right font-medium ${themeClasses.text.secondary}`}>Total Price</th>
//             <th className={`py-2 text-right font-medium ${themeClasses.text.secondary}`}>Per Unit</th>
//             <th className={`py-2 text-right font-medium ${themeClasses.text.secondary}`}>Savings</th>
//             <th className={`py-2 text-right font-medium ${themeClasses.text.secondary}`}>Discount</th>
//           </tr>
//         </thead>
//         <tbody>
//           {calculations.map((calc, idx) => (
//             <tr key={idx} className={`border-b ${themeClasses.border.light}`}>
//               <td className={`py-2 font-medium ${themeClasses.text.primary}`}>{calc.quantity}</td>
//               <td className={`py-2 text-right font-medium ${themeClasses.text.primary}`}>
//                 {formatCurrency(calc.total_price)}
//               </td>
//               <td className={`py-2 text-right ${themeClasses.text.secondary}`}>
//                 {formatCurrency(calc.unit_price)}
//               </td>
//               <td className={`py-2 text-right text-green-600 dark:text-green-400`}>
//                 {formatCurrency(calc.savings)}
//               </td>
//               <td className={`py-2 text-right text-indigo-600 dark:text-indigo-400`}>
//                 {calc.discount_percentage.toFixed(1)}%
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// // ============================================================================
// // MAIN COMPONENT
// // ============================================================================

// const PricingConfiguration = ({
//   form,
//   errors: externalErrors = {},
//   theme = 'light',
//   isMobile = false,
//   priceMatrices = [],
//   discountRules = [],
//   onChange,
//   onCalculatePrice,
//   priceCalculationResult,
//   pricingState,
//   pricingErrors,
//   onPricingChange,
//   onCalculatePricing
// }) => {
//   const themeClasses = getThemeClasses(theme);
  
//   // Use the pricing hook for all pricing logic
//   const {
//     pricing,
//     setPricing,
//     errors: internalErrors,
//     priceCalculations,
//     isCalculating,
//     handleChange,
//     handleNestedChange,
//     handleTierChange,
//     addTier,
//     removeTier,
//     formattedTiers,
//     handleVolumeTierChange,
//     addVolumeTier,
//     removeVolumeTier,
//     toggleVolumeDiscounts,
//     togglePromotionalPricing,
//     handlePromotionalDateChange,
//     isPromotionalPriceActive,
//     handlePriceMatrixSelect,
//     loadPriceMatrix,
//     handleDiscountRuleSelect,
//     loadDiscountRules,
//     validateField,
//     validatePricing,
//     isFormValid,
//     calculatePriceForQuantity,
//     calculateBulkPrices,
//     calculatePriceBreakdown,
//     calculateWithBackend,
//     convertCurrency,
//     priceSummary,
//     resetPricing,
//     formatCurrency: formatCurrencyUtil
//   } = usePricing(pricingState || {});

//   // Local UI state
//   const [activeTab, setActiveTab] = useState('basic');
//   const [calculationQuantity, setCalculationQuantity] = useState(1);
//   const [bulkCalculations, setBulkCalculations] = useState([]);
//   const [showBulkTable, setShowBulkTable] = useState(false);
//   const [selectedMatrixId, setSelectedMatrixId] = useState(null);
//   const [selectedRuleIds, setSelectedRuleIds] = useState([]);

//   // Combine errors
//   const errors = { ...internalErrors, ...pricingErrors, ...externalErrors };

//   // Sync with external pricing state
//   useEffect(() => {
//     if (pricingState) {
//       setPricing(pricingState);
//     }
//   }, [pricingState, setPricing]);

//   // Notify parent of changes
//   useEffect(() => {
//     if (onPricingChange) {
//       onPricingChange(pricing);
//     }
//   }, [pricing, onPricingChange]);

//   // Handle quantity calculation
//   const handleCalculateQuantity = useCallback(() => {
//     if (!pricing.price) {
//       toast.error('Please enter a base price first');
//       return;
//     }
    
//     const breakdown = calculatePriceBreakdown(calculationQuantity);
//     if (onCalculatePricing) {
//       onCalculatePricing(breakdown);
//     }
//   }, [pricing.price, calculationQuantity, calculatePriceBreakdown, onCalculatePricing]);

//   // Handle bulk calculation
//   const handleCalculateBulk = useCallback(() => {
//     if (!pricing.price) {
//       toast.error('Please enter a base price first');
//       return;
//     }
    
//     const calculations = calculateBulkPrices(QUANTITY_PRESETS);
//     setBulkCalculations(calculations);
//     setShowBulkTable(true);
//   }, [pricing.price, calculateBulkPrices]);

//   // Handle price matrix selection
//   const handleMatrixSelect = useCallback((matrixId) => {
//     setSelectedMatrixId(matrixId);
//     const matrix = priceMatrices.find(m => m.id === matrixId);
//     if (matrix) {
//       handlePriceMatrixSelect(matrixId, matrix);
//       toast.success(`Applied matrix: ${matrix.name}`);
//     }
//   }, [priceMatrices, handlePriceMatrixSelect]);

//   // Handle discount rule selection
//   const handleRuleSelect = useCallback((ruleId) => {
//     const newSelected = selectedRuleIds.includes(ruleId)
//       ? selectedRuleIds.filter(id => id !== ruleId)
//       : [...selectedRuleIds, ruleId];
    
//     setSelectedRuleIds(newSelected);
//     const rules = discountRules.filter(r => newSelected.includes(r.id));
//     handleDiscountRuleSelect(newSelected, rules);
//   }, [discountRules, handleDiscountRuleSelect, selectedRuleIds]);

//   // Mobile navigation tabs
//   const tabs = [
//     { id: 'basic', label: 'Basic Pricing', icon: DollarSign },
//     { id: 'discounts', label: 'Discounts', icon: Percent },
//     { id: 'tiers', label: 'Tiered Pricing', icon: Layers },
//     { id: 'volume', label: 'Volume Discounts', icon: TrendingDown },
//     { id: 'promo', label: 'Promotions', icon: Gift },
//     { id: 'calculator', label: 'Calculator', icon: Calculator }
//   ];

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h2 className={`text-xl font-bold flex items-center ${themeClasses.text.primary}`}>
//             <DollarSign className="w-5 h-5 mr-2 text-green-600" />
//             Pricing Configuration
//           </h2>
//           <p className={`text-sm mt-1 ${themeClasses.text.secondary}`}>
//             Configure pricing, discounts, and promotional offers
//           </p>
//         </div>
//       </div>

//       {/* Price Summary Card */}
//       {priceSummary && priceSummary.base_price > 0 && (
//         <div className={`p-4 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <div>
//               <p className={`text-xs ${themeClasses.text.secondary}`}>Base Price</p>
//               <p className={`text-lg font-bold ${themeClasses.text.primary}`}>
//                 {priceSummary.base_price_formatted}
//               </p>
//             </div>
            
//             <div>
//               <p className={`text-xs ${themeClasses.text.secondary}`}>Discount Type</p>
//               <p className={`text-sm font-medium ${themeClasses.text.primary}`}>
//                 {priceSummary.has_discount ? priceSummary.discount_type : 'None'}
//               </p>
//             </div>
            
//             {priceSummary.has_discount && (
//               <div>
//                 <p className={`text-xs ${themeClasses.text.secondary}`}>Discount Value</p>
//                 <p className={`text-sm font-medium text-green-600`}>
//                   {priceSummary.discount_type === 'percentage'
//                     ? `${priceSummary.discount_value}%`
//                     : formatCurrency(priceSummary.discount_value)
//                   }
//                 </p>
//               </div>
//             )}
            
//             <div>
//               <p className={`text-xs ${themeClasses.text.secondary}`}>Promo Active</p>
//               <p className={`text-sm font-medium ${priceSummary.promotional_active ? 'text-green-600' : themeClasses.text.secondary}`}>
//                 {priceSummary.promotional_active ? 'Yes' : 'No'}
//               </p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Mobile Navigation */}
//       {isMobile && (
//         <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b dark:border-gray-800 overflow-x-auto">
//           <div className="flex space-x-1 p-2">
//             {tabs.map(tab => {
//               const Icon = tab.icon;
//               const isActive = activeTab === tab.id;
              
//               return (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`flex flex-col items-center px-3 py-2 rounded-lg min-w-[60px] transition-colors ${
//                     isActive
//                       ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
//                       : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
//                   }`}
//                 >
//                   <Icon className="w-4 h-4 mb-1" />
//                   <span className="text-xs font-medium">{tab.label}</span>
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       )}

//       {/* Content */}
//       <div className="space-y-6">
//         {isMobile ? (
//           // Mobile: Show only active tab
//           <div className={`p-4 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
//             {activeTab === 'basic' && (
//               <div className="space-y-4">
//                 <SectionHeader
//                   icon={DollarSign}
//                   title="Basic Pricing"
//                   description="Set the base price for this plan"
//                   theme={theme}
//                 />
                
//                 <InputField
//                   label="Base Price (KES)"
//                   type="number"
//                   min="0"
//                   step="0.01"
//                   value={pricing.price}
//                   onChange={(value) => handleChange('price', value)}
//                   error={errors.price}
//                   theme={theme}
//                   icon={DollarSign}
//                   required
//                   helperText="The standard price for this plan"
//                 />
                
//                 <SelectField
//                   label="Plan Type"
//                   value={pricing.plan_type}
//                   onChange={(value) => handleChange('plan_type', value)}
//                   options={[
//                     { value: 'paid', label: 'Paid' },
//                     { value: 'free_trial', label: 'Free Trial' },
//                     { value: 'promotional', label: 'Promotional' }
//                   ]}
//                   error={errors.plan_type}
//                   theme={theme}
//                   required
//                 />
//               </div>
//             )}

//             {activeTab === 'discounts' && (
//               <div className="space-y-4">
//                 <SectionHeader
//                   icon={Percent}
//                   title="Discounts"
//                   description="Configure direct discounts"
//                   theme={theme}
//                 />
                
//                 <SelectField
//                   label="Discount Type"
//                   value={pricing.discount_type}
//                   onChange={(value) => handleChange('discount_type', value)}
//                   options={DISCOUNT_TYPES}
//                   theme={theme}
//                 />
                
//                 {pricing.discount_type !== 'none' && (
//                   <InputField
//                     label={pricing.discount_type === 'percentage' ? 'Percentage (%)' : 'Fixed Amount (KES)'}
//                     type="number"
//                     min="0"
//                     max={pricing.discount_type === 'percentage' ? 100 : undefined}
//                     step="0.01"
//                     value={pricing.discount_value}
//                     onChange={(value) => handleChange('discount_value', value)}
//                     error={errors.discount_value}
//                     theme={theme}
//                     icon={pricing.discount_type === 'percentage' ? Percent : DollarSign}
//                     required
//                   />
//                 )}
                
//                 {pricing.discount_type === 'percentage' && (
//                   <p className={`text-xs ${themeClasses.text.secondary}`}>
//                     Percentage discount applied to total price
//                   </p>
//                 )}
                
//                 {pricing.discount_type === 'fixed' && (
//                   <p className={`text-xs ${themeClasses.text.secondary}`}>
//                     Fixed amount discount per unit
//                   </p>
//                 )}
//               </div>
//             )}

//             {activeTab === 'tiers' && (
//               <div className="space-y-4">
//                 <SectionHeader
//                   icon={Layers}
//                   title="Tiered Pricing"
//                   description="Different prices for different quantities"
//                   theme={theme}
//                 />
                
//                 <div className="space-y-3">
//                   {pricing.tier_config.map((tier, index) => (
//                     <TierRow
//                       key={index}
//                       tier={tier}
//                       index={index}
//                       onUpdate={handleTierChange}
//                       onRemove={removeTier}
//                       theme={theme}
//                     />
//                   ))}
//                 </div>
                
//                 <button
//                   onClick={addTier}
//                   className="w-full px-4 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
//                 >
//                   <Plus className="w-4 h-4 inline mr-2" />
//                   Add Tier
//                 </button>
                
//                 {formattedTiers.length > 0 && (
//                   <div className={`mt-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
//                     <p className={`text-xs font-medium mb-2 ${themeClasses.text.secondary}`}>
//                       Preview:
//                     </p>
//                     {formattedTiers.map((tier, idx) => (
//                       <div key={idx} className="flex justify-between text-sm py-1">
//                         <span>{tier.min_qty}+ units</span>
//                         <span className="font-medium">{tier.price_formatted} each</span>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}

//             {activeTab === 'volume' && (
//               <div className="space-y-4">
//                 <SectionHeader
//                   icon={TrendingDown}
//                   title="Volume Discounts"
//                   description="Percentage discounts for bulk purchases"
//                   theme={theme}
//                 />
                
//                 <ToggleSwitch
//                   enabled={pricing.volume_discounts.enabled}
//                   onChange={toggleVolumeDiscounts}
//                   label="Enable Volume Discounts"
//                   description="Apply percentage discounts based on quantity"
//                   theme={theme}
//                 />
                
//                 {pricing.volume_discounts.enabled && (
//                   <>
//                     <div className="space-y-3 mt-4">
//                       {pricing.volume_discounts.tiers.map((tier, index) => (
//                         <VolumeTierRow
//                           key={index}
//                           tier={tier}
//                           index={index}
//                           onUpdate={handleVolumeTierChange}
//                           onRemove={removeVolumeTier}
//                           theme={theme}
//                         />
//                       ))}
//                     </div>
                    
//                     <button
//                       onClick={addVolumeTier}
//                       className="w-full px-4 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
//                     >
//                       <Plus className="w-4 h-4 inline mr-2" />
//                       Add Volume Tier
//                     </button>
//                   </>
//                 )}
//               </div>
//             )}

//             {activeTab === 'promo' && (
//               <div className="space-y-4">
//                 <SectionHeader
//                   icon={Gift}
//                   title="Promotional Pricing"
//                   description="Time-limited promotional offers"
//                   theme={theme}
//                 />
                
//                 <ToggleSwitch
//                   enabled={pricing.promotional_pricing.enabled}
//                   onChange={togglePromotionalPricing}
//                   label="Enable Promotional Pricing"
//                   description="Set a temporary promotional price"
//                   theme={theme}
//                 />
                
//                 {pricing.promotional_pricing.enabled && (
//                   <>
//                     <InputField
//                       label="Original Price (KES)"
//                       type="number"
//                       min="0"
//                       step="0.01"
//                       value={pricing.promotional_pricing.original_price}
//                       onChange={(value) => handleNestedChange('promotional_pricing', 'original_price', value)}
//                       error={errors.promotional_original_price}
//                       theme={theme}
//                       icon={DollarSign}
//                       required
//                     />
                    
//                     <InputField
//                       label="Promotional Price (KES)"
//                       type="number"
//                       min="0"
//                       step="0.01"
//                       value={pricing.promotional_pricing.promotional_price}
//                       onChange={(value) => handleNestedChange('promotional_pricing', 'promotional_price', value)}
//                       error={errors.promotional_price}
//                       theme={theme}
//                       icon={Tag}
//                       required
//                     />
                    
//                     <InputField
//                       label="Start Date"
//                       type="datetime-local"
//                       value={pricing.promotional_pricing.start_date?.slice(0, 16)}
//                       onChange={(value) => handlePromotionalDateChange('start_date', value)}
//                       theme={theme}
//                     />
                    
//                     <InputField
//                       label="End Date"
//                       type="datetime-local"
//                       value={pricing.promotional_pricing.end_date?.slice(0, 16)}
//                       onChange={(value) => handlePromotionalDateChange('end_date', value)}
//                       theme={theme}
//                     />
                    
//                     {errors.promotional_dates && (
//                       <p className="text-xs text-red-500">{errors.promotional_dates}</p>
//                     )}
                    
//                     {isPromotionalPriceActive() && (
//                       <div className={`p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800`}>
//                         <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
//                           <CheckCircle className="w-4 h-4" />
//                           Promotional price is currently active
//                         </p>
//                       </div>
//                     )}
//                   </>
//                 )}
//               </div>
//             )}

//             {activeTab === 'calculator' && (
//               <div className="space-y-4">
//                 <SectionHeader
//                   icon={Calculator}
//                   title="Price Calculator"
//                   description="Calculate prices with current discounts"
//                   theme={theme}
//                 />
                
//                 <div className="flex gap-2">
//                   <InputField
//                     label="Quantity"
//                     type="number"
//                     min="1"
//                     value={calculationQuantity}
//                     onChange={(value) => setCalculationQuantity(parseInt(value) || 1)}
//                     theme={theme}
//                   />
                  
//                   <button
//                     onClick={handleCalculateQuantity}
//                     disabled={!pricing.price || isCalculating}
//                     className={`self-end px-4 py-2 rounded-lg ${
//                       theme === 'dark'
//                         ? 'bg-indigo-600 hover:bg-indigo-700'
//                         : 'bg-indigo-500 hover:bg-indigo-600'
//                     } text-white disabled:opacity-50`}
//                   >
//                     {isCalculating ? (
//                       <FaSpinner className="w-4 h-4 animate-spin" />
//                     ) : (
//                       'Calculate'
//                     )}
//                   </button>
//                 </div>
                
//                 <button
//                   onClick={handleCalculateBulk}
//                   disabled={!pricing.price}
//                   className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
//                 >
//                   <BarChart3 className="w-4 h-4 inline mr-2" />
//                   Show Bulk Prices
//                 </button>
                
//                 {priceCalculations.last_calculation && (
//                   <PriceCalculationCard
//                     calculation={priceCalculations.last_calculation}
//                     theme={theme}
//                   />
//                 )}
                
//                 {showBulkTable && bulkCalculations.length > 0 && (
//                   <div className="mt-4">
//                     <BulkCalculationTable
//                       calculations={bulkCalculations}
//                       theme={theme}
//                     />
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         ) : (
//           // Desktop: Grid layout
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {/* Basic Pricing */}
//             <div className={`p-4 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
//               <SectionHeader
//                 icon={DollarSign}
//                 title="Basic Pricing"
//                 description="Set the base price for this plan"
//                 theme={theme}
//               />
              
//               <div className="space-y-4">
//                 <InputField
//                   label="Base Price (KES)"
//                   type="number"
//                   min="0"
//                   step="0.01"
//                   value={pricing.price}
//                   onChange={(value) => handleChange('price', value)}
//                   error={errors.price}
//                   theme={theme}
//                   icon={DollarSign}
//                   required
//                   helperText="The standard price for this plan"
//                 />
                
//                 <SelectField
//                   label="Plan Type"
//                   value={pricing.plan_type}
//                   onChange={(value) => handleChange('plan_type', value)}
//                   options={[
//                     { value: 'paid', label: 'Paid' },
//                     { value: 'free_trial', label: 'Free Trial' },
//                     { value: 'promotional', label: 'Promotional' }
//                   ]}
//                   error={errors.plan_type}
//                   theme={theme}
//                   required
//                 />
//               </div>
//             </div>

//             {/* Discounts */}
//             <div className={`p-4 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
//               <SectionHeader
//                 icon={Percent}
//                 title="Discounts"
//                 description="Configure direct discounts"
//                 theme={theme}
//               />
              
//               <div className="space-y-4">
//                 <SelectField
//                   label="Discount Type"
//                   value={pricing.discount_type}
//                   onChange={(value) => handleChange('discount_type', value)}
//                   options={DISCOUNT_TYPES}
//                   theme={theme}
//                 />
                
//                 {pricing.discount_type !== 'none' && (
//                   <InputField
//                     label={pricing.discount_type === 'percentage' ? 'Percentage (%)' : 'Fixed Amount (KES)'}
//                     type="number"
//                     min="0"
//                     max={pricing.discount_type === 'percentage' ? 100 : undefined}
//                     step="0.01"
//                     value={pricing.discount_value}
//                     onChange={(value) => handleChange('discount_value', value)}
//                     error={errors.discount_value}
//                     theme={theme}
//                     icon={pricing.discount_type === 'percentage' ? Percent : DollarSign}
//                     required
//                   />
//                 )}
//               </div>
//             </div>

//             {/* Tiered Pricing */}
//             <div className={`p-4 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
//               <SectionHeader
//                 icon={Layers}
//                 title="Tiered Pricing"
//                 description="Different prices for different quantities"
//                 theme={theme}
//               />
              
//               <div className="space-y-3">
//                 {pricing.tier_config.map((tier, index) => (
//                   <TierRow
//                     key={index}
//                     tier={tier}
//                     index={index}
//                     onUpdate={handleTierChange}
//                     onRemove={removeTier}
//                     theme={theme}
//                   />
//                 ))}
//               </div>
              
//               <button
//                 onClick={addTier}
//                 className="mt-4 w-full px-4 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
//               >
//                 <Plus className="w-4 h-4 inline mr-2" />
//                 Add Tier
//               </button>
              
//               {formattedTiers.length > 0 && (
//                 <div className={`mt-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
//                   <p className={`text-xs font-medium mb-2 ${themeClasses.text.secondary}`}>
//                     Preview:
//                   </p>
//                   {formattedTiers.map((tier, idx) => (
//                     <div key={idx} className="flex justify-between text-sm py-1">
//                       <span>{tier.min_qty}+ units</span>
//                       <span className="font-medium">{tier.price_formatted} each</span>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Volume Discounts */}
//             <div className={`p-4 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
//               <SectionHeader
//                 icon={TrendingDown}
//                 title="Volume Discounts"
//                 description="Percentage discounts for bulk purchases"
//                 theme={theme}
//               />
              
//               <ToggleSwitch
//                 enabled={pricing.volume_discounts.enabled}
//                 onChange={toggleVolumeDiscounts}
//                 label="Enable Volume Discounts"
//                 description="Apply percentage discounts based on quantity"
//                 theme={theme}
//               />
              
//               {pricing.volume_discounts.enabled && (
//                 <>
//                   <div className="mt-4 space-y-3">
//                     {pricing.volume_discounts.tiers.map((tier, index) => (
//                       <VolumeTierRow
//                         key={index}
//                         tier={tier}
//                         index={index}
//                         onUpdate={handleVolumeTierChange}
//                         onRemove={removeVolumeTier}
//                         theme={theme}
//                       />
//                     ))}
//                   </div>
                  
//                   <button
//                     onClick={addVolumeTier}
//                     className="mt-4 w-full px-4 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
//                   >
//                     <Plus className="w-4 h-4 inline mr-2" />
//                     Add Volume Tier
//                   </button>
//                 </>
//               )}
//             </div>

//             {/* Promotional Pricing */}
//             <div className={`p-4 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
//               <SectionHeader
//                 icon={Gift}
//                 title="Promotional Pricing"
//                 description="Time-limited promotional offers"
//                 theme={theme}
//               />
              
//               <ToggleSwitch
//                 enabled={pricing.promotional_pricing.enabled}
//                 onChange={togglePromotionalPricing}
//                 label="Enable Promotional Pricing"
//                 description="Set a temporary promotional price"
//                 theme={theme}
//               />
              
//               {pricing.promotional_pricing.enabled && (
//                 <div className="mt-4 space-y-4">
//                   <InputField
//                     label="Original Price (KES)"
//                     type="number"
//                     min="0"
//                     step="0.01"
//                     value={pricing.promotional_pricing.original_price}
//                     onChange={(value) => handleNestedChange('promotional_pricing', 'original_price', value)}
//                     error={errors.promotional_original_price}
//                     theme={theme}
//                     icon={DollarSign}
//                     required
//                   />
                  
//                   <InputField
//                     label="Promotional Price (KES)"
//                     type="number"
//                     min="0"
//                     step="0.01"
//                     value={pricing.promotional_pricing.promotional_price}
//                     onChange={(value) => handleNestedChange('promotional_pricing', 'promotional_price', value)}
//                     error={errors.promotional_price}
//                     theme={theme}
//                     icon={Tag}
//                     required
//                   />
                  
//                   <InputField
//                     label="Start Date"
//                     type="datetime-local"
//                     value={pricing.promotional_pricing.start_date?.slice(0, 16)}
//                     onChange={(value) => handlePromotionalDateChange('start_date', value)}
//                     theme={theme}
//                   />
                  
//                   <InputField
//                     label="End Date"
//                     type="datetime-local"
//                     value={pricing.promotional_pricing.end_date?.slice(0, 16)}
//                     onChange={(value) => handlePromotionalDateChange('end_date', value)}
//                     theme={theme}
//                   />
                  
//                   {errors.promotional_dates && (
//                     <p className="text-xs text-red-500">{errors.promotional_dates}</p>
//                   )}
                  
//                   {isPromotionalPriceActive() && (
//                     <div className={`p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800`}>
//                       <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
//                         <CheckCircle className="w-4 h-4" />
//                         Promotional price is currently active
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* Price Calculator */}
//             <div className={`p-4 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
//               <SectionHeader
//                 icon={Calculator}
//                 title="Price Calculator"
//                 description="Calculate prices with current discounts"
//                 theme={theme}
//               />
              
//               <div className="space-y-4">
//                 <div className="flex gap-2">
//                   <div className="flex-1">
//                     <InputField
//                       label="Quantity"
//                       type="number"
//                       min="1"
//                       value={calculationQuantity}
//                       onChange={(value) => setCalculationQuantity(parseInt(value) || 1)}
//                       theme={theme}
//                     />
//                   </div>
                  
//                   <button
//                     onClick={handleCalculateQuantity}
//                     disabled={!pricing.price || isCalculating}
//                     className={`self-end px-4 py-2 rounded-lg ${
//                       theme === 'dark'
//                         ? 'bg-indigo-600 hover:bg-indigo-700'
//                         : 'bg-indigo-500 hover:bg-indigo-600'
//                     } text-white disabled:opacity-50`}
//                   >
//                     {isCalculating ? (
//                       <FaSpinner className="w-4 h-4 animate-spin" />
//                     ) : (
//                       'Calculate'
//                     )}
//                   </button>
//                 </div>
                
//                 <button
//                   onClick={handleCalculateBulk}
//                   disabled={!pricing.price}
//                   className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
//                 >
//                   <BarChart3 className="w-4 h-4 inline mr-2" />
//                   Show Bulk Prices
//                 </button>
                
//                 {priceCalculations.last_calculation && (
//                   <PriceCalculationCard
//                     calculation={priceCalculations.last_calculation}
//                     theme={theme}
//                   />
//                 )}
                
//                 {showBulkTable && bulkCalculations.length > 0 && (
//                   <div className="mt-4">
//                     <BulkCalculationTable
//                       calculations={bulkCalculations}
//                       theme={theme}
//                     />
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Price Matrices Section (if available) */}
//       {priceMatrices.length > 0 && (
//         <div className={`p-4 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
//           <SectionHeader
//             icon={Layers}
//             title="Available Price Matrices"
//             description="Select from existing price matrices"
//             theme={theme}
//           />
          
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
//             {priceMatrices.map(matrix => (
//               <button
//                 key={matrix.id}
//                 onClick={() => handleMatrixSelect(matrix.id)}
//                 className={`p-3 rounded-lg border text-left transition-colors ${
//                   selectedMatrixId === matrix.id
//                     ? theme === 'dark'
//                       ? 'border-indigo-500 bg-indigo-900/20'
//                       : 'border-indigo-500 bg-indigo-50'
//                     : theme === 'dark'
//                       ? 'border-gray-700 hover:border-gray-600'
//                       : 'border-gray-200 hover:border-gray-300'
//                 }`}
//               >
//                 <div className="flex items-start justify-between">
//                   <div>
//                     <h4 className={`font-medium ${themeClasses.text.primary}`}>{matrix.name}</h4>
//                     <p className={`text-xs mt-1 ${themeClasses.text.secondary}`}>
//                       {matrix.description || 'No description'}
//                     </p>
//                   </div>
//                   {selectedMatrixId === matrix.id && (
//                     <CheckCircle className="w-4 h-4 text-indigo-600" />
//                   )}
//                 </div>
                
//                 <div className="flex items-center gap-2 mt-2">
//                   <span className={`text-xs px-2 py-1 rounded-full ${
//                     matrix.discount_type === 'percentage'
//                       ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
//                       : matrix.discount_type === 'fixed'
//                         ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
//                         : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
//                   }`}>
//                     {matrix.discount_type}
//                   </span>
                  
//                   {matrix.percentage > 0 && (
//                     <span className={`text-xs font-medium ${themeClasses.text.primary}`}>
//                       {matrix.percentage}%
//                     </span>
//                   )}
                  
//                   {matrix.fixed_amount > 0 && (
//                     <span className={`text-xs font-medium ${themeClasses.text.primary}`}>
//                       KES {formatNumber(matrix.fixed_amount)}
//                     </span>
//                   )}
//                 </div>
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Discount Rules Section (if available) */}
//       {discountRules.length > 0 && (
//         <div className={`p-4 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
//           <SectionHeader
//             icon={Award}
//             title="Discount Rules"
//             description="Apply business rules for discounts"
//             theme={theme}
//           />
          
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
//             {discountRules.map(rule => {
//               const isSelected = selectedRuleIds.includes(rule.id);
//               const ruleType = RULE_TYPES.find(r => r.value === rule.rule_type) || RULE_TYPES[0];
              
//               return (
//                 <button
//                   key={rule.id}
//                   onClick={() => handleRuleSelect(rule.id)}
//                   className={`p-3 rounded-lg border text-left transition-colors ${
//                     isSelected
//                       ? theme === 'dark'
//                         ? 'border-green-500 bg-green-900/20'
//                         : 'border-green-500 bg-green-50'
//                       : theme === 'dark'
//                         ? 'border-gray-700 hover:border-gray-600'
//                         : 'border-gray-200 hover:border-gray-300'
//                   }`}
//                 >
//                   <div className="flex items-start justify-between">
//                     <div>
//                       <h4 className={`font-medium ${themeClasses.text.primary}`}>{rule.name}</h4>
//                       <p className={`text-xs mt-1 ${themeClasses.text.secondary}`}>
//                         {rule.description || 'No description'}
//                       </p>
//                     </div>
//                     {isSelected && (
//                       <CheckCircle className="w-4 h-4 text-green-600" />
//                     )}
//                   </div>
                  
//                   <div className="flex items-center gap-2 mt-2">
//                     <span className={`text-xs px-2 py-1 rounded-full bg-${ruleType.color}-100 text-${ruleType.color}-700 dark:bg-${ruleType.color}-900/30 dark:text-${ruleType.color}-400`}>
//                       {ruleType.label}
//                     </span>
                    
//                     <span className={`text-xs ${themeClasses.text.secondary}`}>
//                       Priority: {rule.priority}
//                     </span>
//                   </div>
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       )}

//       {/* Validation Errors Summary */}
//       {Object.keys(errors).length > 0 && (
//         <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
//           <div className="flex items-start gap-3">
//             <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
//             <div>
//               <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
//                 Please fix the following errors:
//               </h4>
//               <ul className="space-y-1">
//                 {Object.entries(errors).map(([field, error]) => (
//                   <li key={field} className="text-xs text-red-700 dark:text-red-300">
//                     • {error}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Reset Button */}
//       <div className="flex justify-end">
//         <button
//           onClick={resetPricing}
//           className="px-4 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
//         >
//           <RefreshCw className="w-4 h-4 inline mr-2" />
//           Reset Pricing
//         </button>
//       </div>
//     </div>
//   );
// };

// export default PricingConfiguration;





import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, Percent, Layers, TrendingDown, Gift, Calculator,
  Plus, Trash2, CheckCircle, AlertCircle, RefreshCw, BarChart3,
  Tag, Clock, Calendar, Info, ChevronDown, X, Eye, EyeOff,
  Save, Download, Upload, Copy, Settings, Shield, Zap, Award
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import shared components
import {
  getThemeClasses,
  EnhancedSelect,
  EnhancedDatePicker,
  ConfirmationModal,
  EmptyState,
  LoadingOverlay
} from '../Shared/components';

// Import formatters (except currency which comes from hook)
import {
  formatNumber,
  formatDate,
  formatDateTime,
  formatDiscount,
  formatPercentage,
  formatPlanType,
  formatPriceMatrixType,
  formatDiscountRuleType,
  formatDurationForDisplay,
  formatValidityPeriod
} from '../Shared/formatters';

import usePricing from './hooks/usePricing';

// ============================================================================
// CONSTANTS
// ============================================================================

const PLAN_TYPES = [
  { value: 'paid', label: 'Paid' },
  { value: 'free_trial', label: 'Free Trial' },
  { value: 'promotional', label: 'Promotional' }
];

const DISCOUNT_TYPES = [
  { value: 'none', label: 'No Discount' },
  { value: 'percentage', label: 'Percentage Discount' },
  { value: 'fixed', label: 'Fixed Amount' }
];

const CURRENCIES = [
  { value: 'KES', label: 'KES - Kenyan Shilling' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'UGX', label: 'UGX - Ugandan Shilling' },
  { value: 'TZS', label: 'TZS - Tanzanian Shilling' },
  { value: 'RWF', label: 'RWF - Rwandan Franc' }
];

const QUANTITY_PRESETS = [1, 5, 10, 20, 50, 100];

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const SectionHeader = ({ icon: Icon, title, description, theme, error }) => {
  const themeClasses = getThemeClasses(theme);
  
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className={`p-2 rounded-lg ${error ? 'bg-red-100 dark:bg-red-900/30' : theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <Icon className={`w-5 h-5 ${error ? 'text-red-600 dark:text-red-400' : themeClasses.text.primary}`} />
      </div>
      <div className="flex-1">
        <h3 className={`font-semibold ${themeClasses.text.primary}`}>{title}</h3>
        {description && (
          <p className={`text-sm mt-1 ${themeClasses.text.secondary}`}>{description}</p>
        )}
      </div>
    </div>
  );
};

const InputField = ({
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  min,
  max,
  step,
  disabled,
  theme,
  icon: Icon,
  required,
  helperText,
  currency = 'KES'
}) => {
  const themeClasses = getThemeClasses(theme);
  const [showPassword, setShowPassword] = useState(false);
  
  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;
  
  return (
    <div className="space-y-1">
      {label && (
        <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Icon className={`w-4 h-4 ${themeClasses.text.secondary}`} />
          </div>
        )}
        {currency && type === 'number' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <span className={`text-sm font-medium ${themeClasses.text.secondary}`}>{currency}</span>
          </div>
        )}
        <input
          type={inputType}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={`
            w-full px-3 py-2 rounded-lg border text-sm
            transition-all duration-200
            ${Icon ? 'pl-10' : ''}
            ${currency && type === 'number' ? 'pl-12' : ''}
            ${error 
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
              : theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white focus:ring-indigo-500 focus:border-indigo-500'
                : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            placeholder:${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}
          `}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff className={`w-4 h-4 ${themeClasses.text.secondary}`} />
            ) : (
              <Eye className={`w-4 h-4 ${themeClasses.text.secondary}`} />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className={`text-xs ${themeClasses.text.secondary} flex items-center gap-1`}>
          <Info className="w-3 h-3" />
          {helperText}
        </p>
      )}
    </div>
  );
};

const TierRow = ({ tier, index, onUpdate, onRemove, theme, currency = 'KES', error }) => {
  const themeClasses = getThemeClasses(theme);
  
  return (
    <div className="flex items-center gap-2 group">
      <div className="flex-1">
        <input
          type="number"
          min="1"
          value={tier.min_qty}
          onChange={(e) => onUpdate(index, 'min_qty', parseInt(e.target.value) || 1)}
          className={`
            w-full px-3 py-2 rounded-lg border text-sm
            ${theme === 'dark'
              ? 'bg-gray-800 border-gray-700 text-white'
              : 'bg-white border-gray-300 text-gray-900'
            }
            focus:ring-indigo-500 focus:border-indigo-500
          `}
          placeholder="Min Qty"
        />
      </div>
      <div className="flex-1">
        <div className="relative">
          <span className="absolute left-3 top-2 text-sm text-gray-500">{currency}</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={tier.price}
            onChange={(e) => onUpdate(index, 'price', e.target.value)}
            className={`
              w-full pl-12 pr-3 py-2 rounded-lg border text-sm
              ${error ? 'border-red-500' : theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-900'
              }
              focus:ring-indigo-500 focus:border-indigo-500
            `}
            placeholder="Price"
          />
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(index)}
        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

const VolumeTierRow = ({ tier, index, onUpdate, onRemove, theme, error }) => {
  const themeClasses = getThemeClasses(theme);
  
  return (
    <div className="flex items-center gap-2 group">
      <div className="flex-1">
        <input
          type="number"
          min="1"
          value={tier.min_qty}
          onChange={(e) => onUpdate(index, 'min_qty', parseInt(e.target.value) || 1)}
          className={`
            w-full px-3 py-2 rounded-lg border text-sm
            ${theme === 'dark'
              ? 'bg-gray-800 border-gray-700 text-white'
              : 'bg-white border-gray-300 text-gray-900'
            }
            focus:ring-indigo-500 focus:border-indigo-500
          `}
          placeholder="Min Qty"
        />
      </div>
      <div className="flex-1">
        <div className="relative">
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={tier.discount_percentage}
            onChange={(e) => onUpdate(index, 'discount_percentage', parseFloat(e.target.value) || 0)}
            className={`
              w-full pr-8 pl-3 py-2 rounded-lg border text-sm
              ${error ? 'border-red-500' : theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-900'
              }
              focus:ring-indigo-500 focus:border-indigo-500
            `}
            placeholder="Discount %"
          />
          <span className="absolute right-3 top-2 text-sm text-gray-500">%</span>
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(index)}
        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

const PriceCalculationCard = ({ calculation, theme, formatCurrency }) => {
  const themeClasses = getThemeClasses(theme);
  
  if (!calculation) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border ${
        theme === 'dark'
          ? 'bg-gray-800/50 border-gray-700'
          : 'bg-white border-gray-200'
      }`}
    >
      <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${themeClasses.text.primary}`}>
        <Calculator className="w-4 h-4" />
        Price Breakdown
      </h4>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
          <span className={`text-sm ${themeClasses.text.secondary}`}>Quantity</span>
          <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
            {formatNumber(calculation.quantity)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className={`text-sm ${themeClasses.text.secondary}`}>Base Price (per unit)</span>
          <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
            {formatCurrency(calculation.base_price_per_unit, true, 2)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className={`text-sm ${themeClasses.text.secondary}`}>Total Base Price</span>
          <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
            {formatCurrency(calculation.total_base_price, true, 2)}
          </span>
        </div>
        
        {calculation.total_discount > 0 && (
          <div className="flex justify-between items-center text-green-600 dark:text-green-400">
            <span className="text-sm font-medium">Discount</span>
            <span className="text-sm font-medium">
              -{formatCurrency(calculation.total_discount, true, 2)}
            </span>
          </div>
        )}
        
        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className={`text-base font-bold ${themeClasses.text.primary}`}>Final Price</span>
          <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            {formatCurrency(calculation.final_price, true, 2)}
          </span>
        </div>
        
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Price per unit</span>
          <span>{formatCurrency(calculation.final_price_per_unit, true, 2)}</span>
        </div>
        
        {calculation.tax_amount > 0 && (
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Tax ({formatPercentage(calculation.tax_rate)})</span>
            <span>{formatCurrency(calculation.tax_amount, true, 2)}</span>
          </div>
        )}
        
        {calculation.applied_discounts && calculation.applied_discounts.length > 0 && (
          <div className="mt-3">
            <p className={`text-xs font-medium mb-2 ${themeClasses.text.secondary}`}>
              Applied Discounts:
            </p>
            <div className="space-y-1">
              {calculation.applied_discounts.map((discount, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                  <span className={themeClasses.text.secondary}>
                    {discount.type === 'percentage' 
                      ? formatPercentage(discount.value)
                      : discount.type === 'fixed'
                        ? formatCurrency(discount.value, true, 2)
                        : discount.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {calculation.discount_percentage > 0 && (
          <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-xs text-green-700 dark:text-green-300 text-center">
              You save {formatPercentage(calculation.discount_percentage)} compared to base price
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const BulkCalculationTable = ({ calculations, theme, formatCurrency }) => {
  const themeClasses = getThemeClasses(theme);
  
  if (!calculations || calculations.length === 0) return null;
  
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm">
        <thead className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}>
          <tr>
            <th className={`px-4 py-2 text-left font-medium ${themeClasses.text.secondary}`}>Quantity</th>
            <th className={`px-4 py-2 text-right font-medium ${themeClasses.text.secondary}`}>Total Price</th>
            <th className={`px-4 py-2 text-right font-medium ${themeClasses.text.secondary}`}>Per Unit</th>
            <th className={`px-4 py-2 text-right font-medium ${themeClasses.text.secondary}`}>Savings</th>
            <th className={`px-4 py-2 text-right font-medium ${themeClasses.text.secondary}`}>Discount</th>
          </tr>
        </thead>
        <tbody>
          {calculations.map((calc, idx) => (
            <tr key={idx} className={`border-t ${themeClasses.border.light}`}>
              <td className={`px-4 py-2 font-medium ${themeClasses.text.primary}`}>{formatNumber(calc.quantity)}</td>
              <td className={`px-4 py-2 text-right font-medium ${themeClasses.text.primary}`}>
                {formatCurrency(calc.total_price, true, 2)}
              </td>
              <td className={`px-4 py-2 text-right ${themeClasses.text.secondary}`}>
                {formatCurrency(calc.unit_price, true, 2)}
              </td>
              <td className={`px-4 py-2 text-right text-green-600 dark:text-green-400`}>
                {formatCurrency(calc.savings, true, 2)}
              </td>
              <td className={`px-4 py-2 text-right text-indigo-600 dark:text-indigo-400`}>
                {formatPercentage(calc.discount_percentage)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PricingConfiguration = ({
  initialData = {},
  theme = 'light',
  isMobile = false,
  onChange,
  onSave,
  readOnly = false
}) => {
  const themeClasses = getThemeClasses(theme);
  
  // Use the pricing hook
  const {
    pricing,
    errors,
    touched,
    priceCalculations,
    isCalculating,
    handleChange,
    handleNestedChange,
    handleFieldBlur,
    handleTierChange,
    addTier,
    removeTier,
    formattedTiers,
    handleVolumeTierChange,
    addVolumeTier,
    removeVolumeTier,
    toggleVolumeDiscounts,
    togglePromotionalPricing,
    handlePromotionalDateChange,
    calculatePriceForQuantity,
    calculateBulkPrices,
    calculatePriceBreakdown,
    formatCurrency,
    priceSummary,
    resetPricing,
    validatePricing,
    isFormValid,
    prepareForBackend
  } = usePricing(initialData);

  // Local UI state
  const [activeTab, setActiveTab] = useState('basic');
  const [calculationQuantity, setCalculationQuantity] = useState(1);
  const [bulkCalculations, setBulkCalculations] = useState([]);
  const [showBulkTable, setShowBulkTable] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Notify parent of changes
  useEffect(() => {
    if (onChange) {
      onChange(pricing, isFormValid);
    }
  }, [pricing, isFormValid, onChange]);

  // Handle quantity calculation
  const handleCalculateQuantity = useCallback(() => {
    if (!pricing.price) {
      toast.error('Please enter a base price first');
      return;
    }
    
    const breakdown = calculatePriceBreakdown(calculationQuantity);
    if (!breakdown) {
      toast.error('Failed to calculate price');
    }
  }, [pricing.price, calculationQuantity, calculatePriceBreakdown]);

  // Handle bulk calculation
  const handleCalculateBulk = useCallback(() => {
    if (!pricing.price) {
      toast.error('Please enter a base price first');
      return;
    }
    
    const calculations = calculateBulkPrices(QUANTITY_PRESETS);
    setBulkCalculations(calculations);
    setShowBulkTable(true);
  }, [pricing.price, calculateBulkPrices]);

  // Handle save
  const handleSave = useCallback(() => {
    if (!validatePricing()) {
      toast.error('Please fix validation errors before saving');
      return;
    }
    
    const backendData = prepareForBackend();
    
    if (onSave) {
      onSave(backendData);
    } else {
      toast.success('Pricing configuration saved');
      console.log('Pricing data:', backendData);
    }
  }, [validatePricing, prepareForBackend, onSave]);

  // Handle reset confirmation
  const handleResetConfirm = useCallback(() => {
    resetPricing();
    setShowResetConfirm(false);
    toast.info('Pricing has been reset');
  }, [resetPricing]);

  // Mobile navigation tabs
  const tabs = useMemo(() => [
    { id: 'basic', label: 'Basic', icon: DollarSign },
    { id: 'discounts', label: 'Discounts', icon: Percent },
    { id: 'tiers', label: 'Tiers', icon: Layers },
    { id: 'volume', label: 'Volume', icon: TrendingDown },
    { id: 'promo', label: 'Promo', icon: Gift },
    { id: 'calculator', label: 'Calc', icon: Calculator }
  ], []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-bold flex items-center ${themeClasses.text.primary}`}>
            <DollarSign className="w-5 h-5 mr-2 text-indigo-600" />
            Pricing Configuration
          </h2>
          <p className={`text-sm mt-1 ${themeClasses.text.secondary}`}>
            Configure pricing, discounts, and promotional offers
          </p>
        </div>
        
        {!readOnly && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-3 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={!isFormValid}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                isFormValid
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              } transition-colors`}
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Price Summary Card */}
      {priceSummary && priceSummary.base_price > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card}`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className={`text-xs ${themeClasses.text.secondary}`}>Base Price</p>
              <p className={`text-lg font-bold ${themeClasses.text.primary}`}>
                {formatCurrency(priceSummary.base_price, true, 2)}
              </p>
            </div>
            
            <div>
              <p className={`text-xs ${themeClasses.text.secondary}`}>Discount Type</p>
              <p className={`text-sm font-medium ${themeClasses.text.primary} capitalize`}>
                {formatPriceMatrixType(priceSummary.discount_type)}
              </p>
            </div>
            
            {priceSummary.has_discount && (
              <div>
                <p className={`text-xs ${themeClasses.text.secondary}`}>Discount Value</p>
                <p className={`text-sm font-medium text-green-600 dark:text-green-400`}>
                  {priceSummary.discount_type === 'percentage'
                    ? formatPercentage(priceSummary.discount_value)
                    : formatCurrency(priceSummary.discount_value, true, 2)
                  }
                </p>
              </div>
            )}
            
            <div>
              <p className={`text-xs ${themeClasses.text.secondary}`}>Promo Active</p>
              <p className={`text-sm font-medium ${priceSummary.promotional_active ? 'text-green-600 dark:text-green-400' : themeClasses.text.secondary}`}>
                {priceSummary.promotional_active ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Mobile Navigation */}
      {isMobile && (
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b dark:border-gray-800 overflow-x-auto">
          <div className="flex space-x-1 p-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const hasError = Object.keys(errors).some(key => 
                (tab.id === 'basic' && ['price', 'currency', 'plan_type'].includes(key)) ||
                (tab.id === 'discounts' && ['discount_type', 'discount_value'].includes(key)) ||
                (tab.id === 'promo' && key.includes('promotional'))
              );
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center px-3 py-2 rounded-lg min-w-[60px] transition-colors relative ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span className="text-xs font-medium">{tab.label}</span>
                  {hasError && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-6">
        {isMobile ? (
          // Mobile: Show only active tab
          <div className={`p-4 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <SectionHeader
                  icon={DollarSign}
                  title="Basic Pricing"
                  description="Set the base price for this plan"
                  theme={theme}
                  error={errors.price}
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    label="Base Price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={pricing.price}
                    onChange={(value) => handleChange('price', value)}
                    onBlur={() => handleFieldBlur('price')}
                    error={errors.price}
                    theme={theme}
                    currency={pricing.currency}
                    required
                    helperText="Standard price for this plan"
                    disabled={readOnly}
                  />
                  
                  <EnhancedSelect
                    value={pricing.currency}
                    onChange={(value) => handleChange('currency', value)}
                    options={CURRENCIES}
                    placeholder="Select Currency"
                    theme={theme}
                    disabled={readOnly}
                  />
                </div>
                
                <EnhancedSelect
                  value={pricing.plan_type}
                  onChange={(value) => handleChange('plan_type', value)}
                  options={PLAN_TYPES}
                  placeholder="Select Plan Type"
                  theme={theme}
                  disabled={readOnly}
                />
                
                {pricing.plan_type && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Selected: {formatPlanType(pricing.plan_type)}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'discounts' && (
              <div className="space-y-4">
                <SectionHeader
                  icon={Percent}
                  title="Discounts"
                  description="Configure direct discounts"
                  theme={theme}
                />
                
                <EnhancedSelect
                  value={pricing.discount_type}
                  onChange={(value) => handleChange('discount_type', value)}
                  options={DISCOUNT_TYPES}
                  placeholder="Select Discount Type"
                  theme={theme}
                  disabled={readOnly}
                />
                
                {pricing.discount_type !== 'none' && (
                  <InputField
                    label={pricing.discount_type === 'percentage' ? 'Percentage (%)' : 'Fixed Amount'}
                    type="number"
                    min="0"
                    max={pricing.discount_type === 'percentage' ? 100 : undefined}
                    step="0.01"
                    value={pricing.discount_value}
                    onChange={(value) => handleChange('discount_value', value)}
                    onBlur={() => handleFieldBlur('discount_value')}
                    error={errors.discount_value}
                    theme={theme}
                    currency={pricing.discount_type === 'percentage' ? '%' : pricing.currency}
                    required
                    disabled={readOnly}
                  />
                )}
                
                {pricing.discount_type !== 'none' && pricing.discount_value && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatDiscount({
                      type: pricing.discount_type,
                      value: pricing.discount_value
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tiers' && (
              <div className="space-y-4">
                <SectionHeader
                  icon={Layers}
                  title="Tiered Pricing"
                  description="Different prices for different quantities"
                  theme={theme}
                />
                
                <div className="space-y-3">
                  {pricing.tier_config.map((tier, index) => (
                    <TierRow
                      key={index}
                      tier={tier}
                      index={index}
                      onUpdate={handleTierChange}
                      onRemove={removeTier}
                      theme={theme}
                      currency={pricing.currency}
                      error={errors[`tier_${index}_price`] || errors[`tier_${index}_quantity`]}
                    />
                  ))}
                </div>
                
                {!readOnly && (
                  <button
                    onClick={addTier}
                    className="w-full px-4 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Tier
                  </button>
                )}
                
                {errors.tiers && (
                  <p className="text-xs text-red-500 mt-2">{errors.tiers}</p>
                )}
                
                {formattedTiers.length > 0 && (
                  <div className={`mt-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <p className={`text-xs font-medium mb-2 ${themeClasses.text.secondary}`}>
                      Preview:
                    </p>
                    {formattedTiers.map((tier, idx) => (
                      <div key={idx} className="flex justify-between text-sm py-1">
                        <span>{tier.min_qty}+ units</span>
                        <span className="font-medium">{formatCurrency(tier.price, true, 2)} each</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'volume' && (
              <div className="space-y-4">
                <SectionHeader
                  icon={TrendingDown}
                  title="Volume Discounts"
                  description="Percentage discounts for bulk purchases"
                  theme={theme}
                />
                
                <div className={`p-3 rounded-lg border ${themeClasses.border.light}`}>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
                      Enable Volume Discounts
                    </span>
                    <button
                      type="button"
                      onClick={() => !readOnly && toggleVolumeDiscounts(!pricing.volume_discounts.enabled)}
                      disabled={readOnly}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${pricing.volume_discounts.enabled ? 'bg-indigo-600' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}
                        ${readOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${pricing.volume_discounts.enabled ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                  </label>
                </div>
                
                {pricing.volume_discounts.enabled && (
                  <>
                    <div className="space-y-3 mt-4">
                      {pricing.volume_discounts.tiers.map((tier, index) => (
                        <VolumeTierRow
                          key={index}
                          tier={tier}
                          index={index}
                          onUpdate={handleVolumeTierChange}
                          onRemove={removeVolumeTier}
                          theme={theme}
                          error={errors[`volume_tier_${index}`]}
                        />
                      ))}
                    </div>
                    
                    {!readOnly && (
                      <button
                        onClick={addVolumeTier}
                        className="w-full px-4 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Volume Tier
                      </button>
                    )}
                    
                    {errors.volume_tiers && (
                      <p className="text-xs text-red-500 mt-2">{errors.volume_tiers}</p>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'promo' && (
              <div className="space-y-4">
                <SectionHeader
                  icon={Gift}
                  title="Promotional Pricing"
                  description="Time-limited promotional offers"
                  theme={theme}
                />
                
                <div className={`p-3 rounded-lg border ${themeClasses.border.light}`}>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
                      Enable Promotional Pricing
                    </span>
                    <button
                      type="button"
                      onClick={() => !readOnly && togglePromotionalPricing(!pricing.promotional_pricing.enabled)}
                      disabled={readOnly}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${pricing.promotional_pricing.enabled ? 'bg-indigo-600' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}
                        ${readOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${pricing.promotional_pricing.enabled ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                  </label>
                </div>
                
                {pricing.promotional_pricing.enabled && (
                  <div className="space-y-4 mt-4">
                    <InputField
                      label="Original Price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={pricing.promotional_pricing.original_price || pricing.price}
                      onChange={(value) => handleNestedChange('promotional_pricing', 'original_price', value)}
                      error={errors.promotional_original_price}
                      theme={theme}
                      currency={pricing.currency}
                      required
                      disabled={readOnly}
                    />
                    
                    <InputField
                      label="Promotional Price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={pricing.promotional_pricing.promotional_price}
                      onChange={(value) => handleNestedChange('promotional_pricing', 'promotional_price', value)}
                      error={errors.promotional_price}
                      theme={theme}
                      currency={pricing.currency}
                      required
                      disabled={readOnly}
                      helperText="Must be less than original price"
                    />
                    
                    <div className="grid grid-cols-2 gap-3">
                      <EnhancedDatePicker
                        selected={pricing.promotional_pricing.start_date ? new Date(pricing.promotional_pricing.start_date) : null}
                        onChange={(date) => handlePromotionalDateChange('start_date', date)}
                        placeholderText="Start Date"
                        theme={theme}
                        disabled={readOnly}
                      />
                      
                      <EnhancedDatePicker
                        selected={pricing.promotional_pricing.end_date ? new Date(pricing.promotional_pricing.end_date) : null}
                        onChange={(date) => handlePromotionalDateChange('end_date', date)}
                        placeholderText="End Date"
                        theme={theme}
                        disabled={readOnly}
                        minDate={pricing.promotional_pricing.start_date ? new Date(pricing.promotional_pricing.start_date) : null}
                      />
                    </div>
                    
                    {errors.promotional_dates && (
                      <p className="text-xs text-red-500">{errors.promotional_dates}</p>
                    )}
                    
                    {pricing.promotional_pricing.start_date && pricing.promotional_pricing.end_date && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          Promotion runs from {formatDate(pricing.promotional_pricing.start_date)} 
                          to {formatDate(pricing.promotional_pricing.end_date)}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          {formatValidityPeriod({
                            value: Math.ceil((new Date(pricing.promotional_pricing.end_date) - new Date(pricing.promotional_pricing.start_date)) / (1000 * 60 * 60 * 24)),
                            unit: 'Days'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'calculator' && (
              <div className="space-y-4">
                <SectionHeader
                  icon={Calculator}
                  title="Price Calculator"
                  description="Calculate prices with current discounts"
                  theme={theme}
                />
                
                <div className="flex gap-2">
                  <div className="flex-1">
                    <InputField
                      label="Quantity"
                      type="number"
                      min="1"
                      value={calculationQuantity}
                      onChange={(value) => setCalculationQuantity(parseInt(value) || 1)}
                      theme={theme}
                      disabled={readOnly}
                    />
                  </div>
                  
                  <button
                    onClick={handleCalculateQuantity}
                    disabled={!pricing.price || isCalculating || readOnly}
                    className={`self-end px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-indigo-600 hover:bg-indigo-700'
                        : 'bg-indigo-500 hover:bg-indigo-600'
                    } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isCalculating ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Calculate'
                    )}
                  </button>
                </div>
                
                <button
                  onClick={handleCalculateBulk}
                  disabled={!pricing.price || readOnly}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Show Bulk Prices
                </button>
                
                {priceCalculations.last_calculation && (
                  <PriceCalculationCard
                    calculation={priceCalculations.last_calculation}
                    theme={theme}
                    formatCurrency={formatCurrency}
                  />
                )}
                
                {showBulkTable && bulkCalculations.length > 0 && (
                  <div className="mt-4">
                    <BulkCalculationTable
                      calculations={bulkCalculations}
                      theme={theme}
                      formatCurrency={formatCurrency}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          // Desktop: Grid layout
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Pricing */}
            <div className={`p-4 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
              <SectionHeader
                icon={DollarSign}
                title="Basic Pricing"
                description="Set the base price for this plan"
                theme={theme}
                error={errors.price}
              />
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    label="Base Price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={pricing.price}
                    onChange={(value) => handleChange('price', value)}
                    onBlur={() => handleFieldBlur('price')}
                    error={errors.price}
                    theme={theme}
                    currency={pricing.currency}
                    required
                    helperText="Standard price for this plan"
                    disabled={readOnly}
                  />
                  
                  <EnhancedSelect
                    value={pricing.currency}
                    onChange={(value) => handleChange('currency', value)}
                    options={CURRENCIES}
                    placeholder="Select Currency"
                    theme={theme}
                    disabled={readOnly}
                  />
                </div>
                
                <EnhancedSelect
                  value={pricing.plan_type}
                  onChange={(value) => handleChange('plan_type', value)}
                  options={PLAN_TYPES}
                  placeholder="Select Plan Type"
                  theme={theme}
                  disabled={readOnly}
                />
                
                {pricing.plan_type && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Selected: {formatPlanType(pricing.plan_type)}
                  </div>
                )}
              </div>
            </div>

            {/* Discounts */}
            <div className={`p-4 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
              <SectionHeader
                icon={Percent}
                title="Discounts"
                description="Configure direct discounts"
                theme={theme}
              />
              
              <div className="space-y-4">
                <EnhancedSelect
                  value={pricing.discount_type}
                  onChange={(value) => handleChange('discount_type', value)}
                  options={DISCOUNT_TYPES}
                  placeholder="Select Discount Type"
                  theme={theme}
                  disabled={readOnly}
                />
                
                {pricing.discount_type !== 'none' && (
                  <InputField
                    label={pricing.discount_type === 'percentage' ? 'Percentage (%)' : 'Fixed Amount'}
                    type="number"
                    min="0"
                    max={pricing.discount_type === 'percentage' ? 100 : undefined}
                    step="0.01"
                    value={pricing.discount_value}
                    onChange={(value) => handleChange('discount_value', value)}
                    onBlur={() => handleFieldBlur('discount_value')}
                    error={errors.discount_value}
                    theme={theme}
                    currency={pricing.discount_type === 'percentage' ? '%' : pricing.currency}
                    required
                    disabled={readOnly}
                  />
                )}
                
                {pricing.discount_type !== 'none' && pricing.discount_value && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatDiscount({
                      type: pricing.discount_type,
                      value: pricing.discount_value
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Tiered Pricing */}
            <div className={`p-4 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
              <SectionHeader
                icon={Layers}
                title="Tiered Pricing"
                description="Different prices for different quantities"
                theme={theme}
              />
              
              <div className="space-y-3">
                {pricing.tier_config.map((tier, index) => (
                  <TierRow
                    key={index}
                    tier={tier}
                    index={index}
                    onUpdate={handleTierChange}
                    onRemove={removeTier}
                    theme={theme}
                    currency={pricing.currency}
                    error={errors[`tier_${index}_price`] || errors[`tier_${index}_quantity`]}
                  />
                ))}
              </div>
              
              {!readOnly && (
                <button
                  onClick={addTier}
                  className="mt-4 w-full px-4 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Tier
                </button>
              )}
              
              {errors.tiers && (
                <p className="text-xs text-red-500 mt-2">{errors.tiers}</p>
              )}
              
              {formattedTiers.length > 0 && (
                <div className={`mt-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <p className={`text-xs font-medium mb-2 ${themeClasses.text.secondary}`}>
                    Preview:
                  </p>
                  {formattedTiers.map((tier, idx) => (
                    <div key={idx} className="flex justify-between text-sm py-1">
                      <span>{tier.min_qty}+ units</span>
                      <span className="font-medium">{formatCurrency(tier.price, true, 2)} each</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Volume Discounts */}
            <div className={`p-4 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
              <SectionHeader
                icon={TrendingDown}
                title="Volume Discounts"
                description="Percentage discounts for bulk purchases"
                theme={theme}
              />
              
              <div className={`p-3 rounded-lg border ${themeClasses.border.light} mb-4`}>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
                    Enable Volume Discounts
                  </span>
                  <button
                    type="button"
                    onClick={() => !readOnly && toggleVolumeDiscounts(!pricing.volume_discounts.enabled)}
                    disabled={readOnly}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${pricing.volume_discounts.enabled ? 'bg-indigo-600' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}
                      ${readOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${pricing.volume_discounts.enabled ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </label>
              </div>
              
              {pricing.volume_discounts.enabled && (
                <>
                  <div className="space-y-3">
                    {pricing.volume_discounts.tiers.map((tier, index) => (
                      <VolumeTierRow
                        key={index}
                        tier={tier}
                        index={index}
                        onUpdate={handleVolumeTierChange}
                        onRemove={removeVolumeTier}
                        theme={theme}
                        error={errors[`volume_tier_${index}`]}
                      />
                    ))}
                  </div>
                  
                  {!readOnly && (
                    <button
                      onClick={addVolumeTier}
                      className="mt-4 w-full px-4 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Volume Tier
                    </button>
                  )}
                  
                  {errors.volume_tiers && (
                    <p className="text-xs text-red-500 mt-2">{errors.volume_tiers}</p>
                  )}
                </>
              )}
            </div>

            {/* Promotional Pricing */}
            <div className={`p-4 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
              <SectionHeader
                icon={Gift}
                title="Promotional Pricing"
                description="Time-limited promotional offers"
                theme={theme}
              />
              
              <div className={`p-3 rounded-lg border ${themeClasses.border.light} mb-4`}>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
                    Enable Promotional Pricing
                  </span>
                  <button
                    type="button"
                    onClick={() => !readOnly && togglePromotionalPricing(!pricing.promotional_pricing.enabled)}
                    disabled={readOnly}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${pricing.promotional_pricing.enabled ? 'bg-indigo-600' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}
                      ${readOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${pricing.promotional_pricing.enabled ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </label>
              </div>
              
              {pricing.promotional_pricing.enabled && (
                <div className="space-y-4">
                  <InputField
                    label="Original Price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={pricing.promotional_pricing.original_price || pricing.price}
                    onChange={(value) => handleNestedChange('promotional_pricing', 'original_price', value)}
                    error={errors.promotional_original_price}
                    theme={theme}
                    currency={pricing.currency}
                    required
                    disabled={readOnly}
                  />
                  
                  <InputField
                    label="Promotional Price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={pricing.promotional_pricing.promotional_price}
                    onChange={(value) => handleNestedChange('promotional_pricing', 'promotional_price', value)}
                    error={errors.promotional_price}
                    theme={theme}
                    currency={pricing.currency}
                    required
                    disabled={readOnly}
                    helperText="Must be less than original price"
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <EnhancedDatePicker
                      selected={pricing.promotional_pricing.start_date ? new Date(pricing.promotional_pricing.start_date) : null}
                      onChange={(date) => handlePromotionalDateChange('start_date', date)}
                      placeholderText="Start Date"
                      theme={theme}
                      disabled={readOnly}
                    />
                    
                    <EnhancedDatePicker
                      selected={pricing.promotional_pricing.end_date ? new Date(pricing.promotional_pricing.end_date) : null}
                      onChange={(date) => handlePromotionalDateChange('end_date', date)}
                      placeholderText="End Date"
                      theme={theme}
                      disabled={readOnly}
                      minDate={pricing.promotional_pricing.start_date ? new Date(pricing.promotional_pricing.start_date) : null}
                    />
                  </div>
                  
                  {errors.promotional_dates && (
                    <p className="text-xs text-red-500">{errors.promotional_dates}</p>
                  )}
                  
                  {pricing.promotional_pricing.start_date && pricing.promotional_pricing.end_date && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        Promotion runs from {formatDate(pricing.promotional_pricing.start_date)} 
                        to {formatDate(pricing.promotional_pricing.end_date)}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {formatValidityPeriod({
                          value: Math.ceil((new Date(pricing.promotional_pricing.end_date) - new Date(pricing.promotional_pricing.start_date)) / (1000 * 60 * 60 * 24)),
                          unit: 'Days'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Price Calculator */}
            <div className={`p-4 rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card}`}>
              <SectionHeader
                icon={Calculator}
                title="Price Calculator"
                description="Calculate prices with current discounts"
                theme={theme}
              />
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <InputField
                      label="Quantity"
                      type="number"
                      min="1"
                      value={calculationQuantity}
                      onChange={(value) => setCalculationQuantity(parseInt(value) || 1)}
                      theme={theme}
                      disabled={readOnly}
                    />
                  </div>
                  
                  <button
                    onClick={handleCalculateQuantity}
                    disabled={!pricing.price || isCalculating || readOnly}
                    className={`self-end px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-indigo-600 hover:bg-indigo-700'
                        : 'bg-indigo-500 hover:bg-indigo-600'
                    } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isCalculating ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Calculate'
                    )}
                  </button>
                </div>
                
                <button
                  onClick={handleCalculateBulk}
                  disabled={!pricing.price || readOnly}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Show Bulk Prices
                </button>
                
                {priceCalculations.last_calculation && (
                  <PriceCalculationCard
                    calculation={priceCalculations.last_calculation}
                    theme={theme}
                    formatCurrency={formatCurrency}
                  />
                )}
                
                {showBulkTable && bulkCalculations.length > 0 && (
                  <div className="mt-4">
                    <BulkCalculationTable
                      calculations={bulkCalculations}
                      theme={theme}
                      formatCurrency={formatCurrency}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Validation Errors Summary */}
      {Object.keys(errors).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                Please fix the following errors:
              </h4>
              <ul className="space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field} className="text-xs text-red-700 dark:text-red-300">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetConfirm}
        title="Reset Pricing Configuration"
        message="Are you sure you want to reset all pricing settings? This action cannot be undone."
        confirmText="Reset"
        cancelText="Cancel"
        type="warning"
        theme={theme}
        isMobile={isMobile}
      />
    </div>
  );
};

export default PricingConfiguration;