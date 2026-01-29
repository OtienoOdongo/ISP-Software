// // PricingConfiguration.jsx
// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   DollarSign, Percent, Tag, TrendingUp, TrendingDown,
//   Calendar, Users, Package, Layers, Award, Target,
//   Clock, CheckCircle, XCircle, Info, ChevronDown,
//   ChevronUp, Plus, Trash2, Edit, Copy, RefreshCw,
//   Calculator, Filter, Search, ArrowRight, Sparkles,
//   BadgePercent, CreditCard, Shield, Star, AlertCircle,
//   Zap, Activity, PieChart, BarChart3, Download,
//   Upload, Eye, EyeOff, Save, X, ArrowLeft
// } from 'lucide-react';
// import { FaSpinner } from 'react-icons/fa';
// import { toast } from 'react-toastify';

// // API Service
// import api from "../../../api";

// // Shared components and utilities
// import { 
//   getThemeClasses, 
//   EnhancedSelect,
//   LoadingOverlay,
//   EmptyState,
//   ConfirmationModal
// } from "../Shared/components"
// import { 
//   formatNumber,
//   deepClone,
//   debounce,
//   validatePrice,
//   calculatePercentageChange,
//   calculateTieredPrice,
//   formatDate,
//   formatTime,
//   groupBy,
//   sortByProperty,
//   filterByPriceRange,
//   searchInArray,
//   validateDiscountCode,
//   calculateEffectivePrice
// } from "../Shared/utils";
// import { formatCurrency }  from '../Shared/formatters.js';

// // Pricing constants
// const discountTypes = [
//   { value: 'percentage', label: 'Percentage Discount', icon: Percent },
//   { value: 'fixed', label: 'Fixed Amount', icon: DollarSign },
//   { value: 'tiered', label: 'Tiered Pricing', icon: Layers },
//   { value: 'volume', label: 'Volume Discount', icon: TrendingDown }
// ];

// const appliesToOptions = [
//   { value: 'plan', label: 'Specific Plan' },
//   { value: 'category', label: 'Plan Category' },
//   { value: 'all', label: 'All Plans' }
// ];

// const ruleTypes = [
//   { value: 'first_time', label: 'First Time Purchase', icon: Star },
//   { value: 'loyalty', label: 'Loyalty Discount', icon: Award },
//   { value: 'seasonal', label: 'Seasonal Promotion', icon: Calendar },
//   { value: 'referral', label: 'Referral Bonus', icon: Users },
//   { value: 'bulk', label: 'Bulk Purchase', icon: Package }
// ];

// // Custom hooks
// const usePriceCalculation = () => {
//   const [isCalculating, setIsCalculating] = useState(false);
//   const [calculationResult, setCalculationResult] = useState(null);

//   const calculate = useCallback(async (planId, quantity = 1, discountCode = null, clientData = {}) => {
//     setIsCalculating(true);
//     try {
//       const response = await api.post('/api/internet_plans/pricing/calculate/', {
//         plan_id: planId,
//         quantity,
//         discount_code: discountCode,
//         client_data: clientData
//       });
//       setCalculationResult(response.data);
//       return response.data;
//     } catch (error) {
//       console.error('Price calculation error:', error);
//       throw error;
//     } finally {
//       setIsCalculating(false);
//     }
//   }, []);

//   const clearResult = useCallback(() => {
//     setCalculationResult(null);
//   }, []);

//   return {
//     isCalculating,
//     calculationResult,
//     calculate,
//     clearResult
//   };
// };

// const usePriceMatrixManagement = () => {
//   const [priceMatrices, setPriceMatrices] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [editingMatrix, setEditingMatrix] = useState(null);

//   const fetchPriceMatrices = useCallback(async (params = {}) => {
//     setLoading(true);
//     try {
//       const response = await api.get('/api/internet_plans/pricing/matrices/', { params });
//       setPriceMatrices(response.data.results || response.data);
//     } catch (error) {
//       console.error('Error fetching price matrices:', error);
//       toast.error('Failed to load price matrices');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const createPriceMatrix = useCallback(async (matrixData) => {
//     try {
//       const response = await api.post('/api/internet_plans/pricing/matrices/', matrixData);
//       setPriceMatrices(prev => [response.data, ...prev]);
//       return response.data;
//     } catch (error) {
//       console.error('Error creating price matrix:', error);
//       throw error;
//     }
//   }, []);

//   const updatePriceMatrix = useCallback(async (id, matrixData) => {
//     try {
//       const response = await api.put(`/api/internet_plans/pricing/matrices/${id}/`, matrixData);
//       setPriceMatrices(prev => prev.map(m => m.id === id ? response.data : m));
//       return response.data;
//     } catch (error) {
//       console.error('Error updating price matrix:', error);
//       throw error;
//     }
//   }, []);

//   const deletePriceMatrix = useCallback(async (id) => {
//     try {
//       await api.delete(`/api/internet_plans/pricing/matrices/${id}/`);
//       setPriceMatrices(prev => prev.filter(m => m.id !== id));
//     } catch (error) {
//       console.error('Error deleting price matrix:', error);
//       throw error;
//     }
//   }, []);

//   return {
//     priceMatrices,
//     loading,
//     editingMatrix,
//     setEditingMatrix,
//     fetchPriceMatrices,
//     createPriceMatrix,
//     updatePriceMatrix,
//     deletePriceMatrix
//   };
// };

// const useDiscountRuleManagement = () => {
//   const [discountRules, setDiscountRules] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [editingRule, setEditingRule] = useState(null);

//   const fetchDiscountRules = useCallback(async (params = {}) => {
//     setLoading(true);
//     try {
//       const response = await api.get('/api/internet_plans/pricing/rules/', { params });
//       setDiscountRules(response.data.results || response.data);
//     } catch (error) {
//       console.error('Error fetching discount rules:', error);
//       toast.error('Failed to load discount rules');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const createDiscountRule = useCallback(async (ruleData) => {
//     try {
//       const response = await api.post('/api/internet_plans/pricing/rules/', ruleData);
//       setDiscountRules(prev => [response.data, ...prev]);
//       return response.data;
//     } catch (error) {
//       console.error('Error creating discount rule:', error);
//       throw error;
//     }
//   }, []);

//   const updateDiscountRule = useCallback(async (id, ruleData) => {
//     try {
//       const response = await api.put(`/api/internet_plans/pricing/rules/${id}/`, ruleData);
//       setDiscountRules(prev => prev.map(r => r.id === id ? response.data : r));
//       return response.data;
//     } catch (error) {
//       console.error('Error updating discount rule:', error);
//       throw error;
//     }
//   }, []);

//   const deleteDiscountRule = useCallback(async (id) => {
//     try {
//       await api.delete(`/api/internet_plans/pricing/rules/${id}/`);
//       setDiscountRules(prev => prev.filter(r => r.id !== id));
//     } catch (error) {
//       console.error('Error deleting discount rule:', error);
//       throw error;
//     }
//   }, []);

//   return {
//     discountRules,
//     loading,
//     editingRule,
//     setEditingRule,
//     fetchDiscountRules,
//     createDiscountRule,
//     updateDiscountRule,
//     deleteDiscountRule
//   };
// };

// // Data structures for optimized pricing operations
// class PricingDataStructure {
//   constructor() {
//     this.matrices = [];
//     this.rules = [];
//     this.indexes = {
//       matricesByType: new Map(),
//       matricesByPlan: new Map(),
//       matricesByCategory: new Map(),
//       rulesByType: new Map(),
//       activeRules: new Set(),
//       expiringSoon: new Set()
//     };
//   }

//   addPriceMatrix(matrix) {
//     this.matrices.push(matrix);
//     this.updateMatrixIndexes(matrix);
//   }

//   updatePriceMatrix(matrix) {
//     const index = this.matrices.findIndex(m => m.id === matrix.id);
//     if (index !== -1) {
//       // Remove old indexes
//       this.removeMatrixFromIndexes(this.matrices[index]);
      
//       // Update matrix
//       this.matrices[index] = matrix;
//       this.updateMatrixIndexes(matrix);
//     }
//   }

//   removePriceMatrix(matrixId) {
//     const index = this.matrices.findIndex(m => m.id === matrixId);
//     if (index !== -1) {
//       const matrix = this.matrices[index];
//       this.removeMatrixFromIndexes(matrix);
//       this.matrices.splice(index, 1);
//     }
//   }

//   updateMatrixIndexes(matrix) {
//     // Index by discount type
//     if (!this.indexes.matricesByType.has(matrix.discount_type)) {
//       this.indexes.matricesByType.set(matrix.discount_type, []);
//     }
//     this.indexes.matricesByType.get(matrix.discount_type).push(matrix);

//     // Index by target plan
//     if (matrix.applies_to === 'plan' && matrix.target_plan) {
//       if (!this.indexes.matricesByPlan.has(matrix.target_plan)) {
//         this.indexes.matricesByPlan.set(matrix.target_plan, []);
//       }
//       this.indexes.matricesByPlan.get(matrix.target_plan).push(matrix);
//     }

//     // Index by category
//     if (matrix.applies_to === 'category' && matrix.target_category) {
//       if (!this.indexes.matricesByCategory.has(matrix.target_category)) {
//         this.indexes.matricesByCategory.set(matrix.target_category, []);
//       }
//       this.indexes.matricesByCategory.get(matrix.target_category).push(matrix);
//     }

//     // Track expiring matrices
//     if (matrix.valid_to) {
//       const expiresIn = new Date(matrix.valid_to) - new Date();
//       if (expiresIn < 7 * 24 * 60 * 60 * 1000) { // 7 days
//         this.indexes.expiringSoon.add(matrix.id);
//       }
//     }
//   }

//   removeMatrixFromIndexes(matrix) {
//     // Remove from all indexes
//     // Implementation similar to PlanDataStructure
//   }

//   // Similar methods for discount rules...
// }

// // Main PricingConfiguration Component
// const PricingConfiguration = ({
//   form,
//   errors,
//   theme,
//   isMobile,
//   priceMatrices: propPriceMatrices,
//   discountRules: propDiscountRules,
//   onChange,
//   onCalculatePrice,
//   priceCalculationResult
// }) => {
//   const themeClasses = getThemeClasses(theme);
  
//   // Local state
//   const [activeSection, setActiveSection] = useState('overview');
//   const [expandedMatrices, setExpandedMatrices] = useState(new Set());
//   const [expandedRules, setExpandedRules] = useState(new Set());
//   const [selectedMatrix, setSelectedMatrix] = useState(null);
//   const [selectedRules, setSelectedRules] = useState([]);
//   const [showMatrixForm, setShowMatrixForm] = useState(false);
//   const [showRuleForm, setShowRuleForm] = useState(false);
//   const [calculationQuantity, setCalculationQuantity] = useState(1);
//   const [calculationDiscount, setCalculationDiscount] = useState('');
//   const [isCalculating, setIsCalculating] = useState(false);
//   const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: null, id: null });

//   // Initialize with prop data or fetch if not provided
//   const {
//     priceMatrices: localMatrices,
//     loading: matricesLoading,
//     editingMatrix,
//     setEditingMatrix,
//     fetchPriceMatrices,
//     createPriceMatrix,
//     updatePriceMatrix,
//     deletePriceMatrix
//   } = usePriceMatrixManagement();

//   const {
//     discountRules: localRules,
//     loading: rulesLoading,
//     editingRule,
//     setEditingRule,
//     fetchDiscountRules,
//     createDiscountRule,
//     updateDiscountRule,
//     deleteDiscountRule
//   } = useDiscountRuleManagement();

//   // Use prop data if provided, otherwise use local data
//   const priceMatrices = propPriceMatrices || localMatrices;
//   const discountRules = propDiscountRules || localRules;

//   // Fetch data if props not provided
//   useEffect(() => {
//     if (!propPriceMatrices) {
//       fetchPriceMatrices({ is_active: true });
//     }
//     if (!propDiscountRules) {
//       fetchDiscountRules({ is_active: true });
//     }
//   }, [propPriceMatrices, propDiscountRules, fetchPriceMatrices, fetchDiscountRules]);

//   // Form state for matrix
//   const [matrixForm, setMatrixForm] = useState({
//     name: '',
//     description: '',
//     discount_type: 'percentage',
//     applies_to: 'plan',
//     target_plan: null,
//     target_category: '',
//     percentage: 0,
//     fixed_amount: 0,
//     tier_config: [],
//     min_quantity: 1,
//     max_quantity: null,
//     valid_from: new Date().toISOString().split('T')[0],
//     valid_to: null,
//     is_active: true
//   });

//   // Form state for rule
//   const [ruleForm, setRuleForm] = useState({
//     name: '',
//     rule_type: 'first_time',
//     description: '',
//     price_matrix: null,
//     eligibility_criteria: {},
//     priority: 1,
//     max_uses_per_client: null,
//     total_usage_limit: null,
//     is_active: true
//   });

//   // Optimized data structure
//   const pricingData = useMemo(() => {
//     const data = new PricingDataStructure();
//     priceMatrices.forEach(matrix => data.addPriceMatrix(matrix));
//     return data;
//   }, [priceMatrices]);

//   // Filter active and applicable matrices
//   const applicableMatrices = useMemo(() => {
//     const now = new Date();
//     return priceMatrices.filter(matrix => {
//       if (!matrix.is_active) return false;
      
//       // Check validity dates
//       if (matrix.valid_from && new Date(matrix.valid_from) > now) return false;
//       if (matrix.valid_to && new Date(matrix.valid_to) < now) return false;
      
//       // Check if applies to current plan
//       if (matrix.applies_to === 'plan' && form.id && matrix.target_plan !== form.id) {
//         return false;
//       }
      
//       // Check category match
//       if (matrix.applies_to === 'category' && matrix.target_category !== form.category) {
//         return false;
//       }
      
//       return true;
//     });
//   }, [priceMatrices, form.id, form.category]);

//   // Calculate statistics
//   const pricingStats = useMemo(() => {
//     const stats = {
//       totalMatrices: priceMatrices.length,
//       activeMatrices: priceMatrices.filter(m => m.is_active).length,
//       totalRules: discountRules.length,
//       activeRules: discountRules.filter(r => r.is_active).length,
//       averageDiscount: 0,
//       totalSavings: 0
//     };

//     // Calculate average discount percentage
//     const activeMatrices = priceMatrices.filter(m => m.is_active);
//     if (activeMatrices.length > 0) {
//       const totalPercentage = activeMatrices.reduce((sum, matrix) => {
//         return sum + (matrix.percentage || 0);
//       }, 0);
//       stats.averageDiscount = totalPercentage / activeMatrices.length;
//     }

//     // Calculate total savings (estimated)
//     stats.totalSavings = activeMatrices.reduce((sum, matrix) => {
//       return sum + (matrix.total_discount_amount || 0);
//     }, 0);

//     return stats;
//   }, [priceMatrices, discountRules]);

//   // Handle matrix selection
//   const handleMatrixSelect = useCallback((matrixId) => {
//     if (selectedMatrix === matrixId) {
//       setSelectedMatrix(null);
//       onChange('pricing_matrix_id', null);
//     } else {
//       setSelectedMatrix(matrixId);
//       onChange('pricing_matrix_id', matrixId);
      
//       // Expand the selected matrix
//       setExpandedMatrices(prev => new Set(prev).add(matrixId));
//     }
//   }, [selectedMatrix, onChange]);

//   // Handle rule selection
//   const handleRuleSelect = useCallback((ruleId) => {
//     const newSelectedRules = selectedRules.includes(ruleId)
//       ? selectedRules.filter(id => id !== ruleId)
//       : [...selectedRules, ruleId];
    
//     setSelectedRules(newSelectedRules);
//     onChange('discount_rule_ids', newSelectedRules);
    
//     // Expand the selected rule
//     setExpandedRules(prev => new Set(prev).add(ruleId));
//   }, [selectedRules, onChange]);

//   // Toggle matrix expansion
//   const toggleMatrixExpansion = useCallback((matrixId) => {
//     setExpandedMatrices(prev => {
//       const newSet = new Set(prev);
//       if (newSet.has(matrixId)) {
//         newSet.delete(matrixId);
//       } else {
//         newSet.add(matrixId);
//       }
//       return newSet;
//     });
//   }, []);

//   // Toggle rule expansion
//   const toggleRuleExpansion = useCallback((ruleId) => {
//     setExpandedRules(prev => {
//       const newSet = new Set(prev);
//       if (newSet.has(ruleId)) {
//         newSet.delete(ruleId);
//       } else {
//         newSet.add(ruleId);
//       }
//       return newSet;
//     });
//   }, []);

//   // Calculate price with current configuration
//   const calculateCurrentPrice = useCallback(async () => {
//     if (!form.id) {
//       toast.error('Please save the plan first before calculating price');
//       return;
//     }

//     setIsCalculating(true);
//     try {
//       const result = await api.post('/api/internet_plans/pricing/calculate/', {
//         plan_id: form.id,
//         quantity: calculationQuantity,
//         discount_code: calculationDiscount || null,
//         client_data: {}
//       });
      
//       if (onCalculatePrice) {
//         onCalculatePrice(result);
//       }
      
//       toast.success('Price calculated successfully');
//     } catch (error) {
//       console.error('Price calculation error:', error);
//       toast.error(error.response?.data?.error || 'Failed to calculate price');
//     } finally {
//       setIsCalculating(false);
//     }
//   }, [form.id, calculationQuantity, calculationDiscount, onCalculatePrice]);

//   // Save matrix
//   const saveMatrix = useCallback(async () => {
//     try {
//       if (editingMatrix) {
//         await updatePriceMatrix(editingMatrix.id, matrixForm);
//         toast.success('Price matrix updated successfully');
//       } else {
//         await createPriceMatrix(matrixForm);
//         toast.success('Price matrix created successfully');
//       }
      
//       setShowMatrixForm(false);
//       setEditingMatrix(null);
//       setMatrixForm({
//         name: '',
//         description: '',
//         discount_type: 'percentage',
//         applies_to: 'plan',
//         target_plan: null,
//         target_category: '',
//         percentage: 0,
//         fixed_amount: 0,
//         tier_config: [],
//         min_quantity: 1,
//         max_quantity: null,
//         valid_from: new Date().toISOString().split('T')[0],
//         valid_to: null,
//         is_active: true
//       });
//     } catch (error) {
//       console.error('Error saving price matrix:', error);
//       toast.error(error.response?.data?.error || 'Failed to save price matrix');
//     }
//   }, [editingMatrix, matrixForm, createPriceMatrix, updatePriceMatrix]);

//   // Save rule
//   const saveRule = useCallback(async () => {
//     try {
//       if (editingRule) {
//         await updateDiscountRule(editingRule.id, ruleForm);
//         toast.success('Discount rule updated successfully');
//       } else {
//         await createDiscountRule(ruleForm);
//         toast.success('Discount rule created successfully');
//       }
      
//       setShowRuleForm(false);
//       setEditingRule(null);
//       setRuleForm({
//         name: '',
//         rule_type: 'first_time',
//         description: '',
//         price_matrix: null,
//         eligibility_criteria: {},
//         priority: 1,
//         max_uses_per_client: null,
//         total_usage_limit: null,
//         is_active: true
//       });
//     } catch (error) {
//       console.error('Error saving discount rule:', error);
//       toast.error(error.response?.data?.error || 'Failed to save discount rule');
//     }
//   }, [editingRule, ruleForm, createDiscountRule, updateDiscountRule]);

//   // Delete confirmation
//   const confirmDelete = useCallback((type, id, name) => {
//     setDeleteConfirm({
//       open: true,
//       type,
//       id,
//       name
//     });
//   }, []);

//   const handleDelete = useCallback(async () => {
//     const { type, id } = deleteConfirm;
    
//     try {
//       if (type === 'matrix') {
//         await deletePriceMatrix(id);
//         toast.success('Price matrix deleted successfully');
//       } else if (type === 'rule') {
//         await deleteDiscountRule(id);
//         toast.success('Discount rule deleted successfully');
//       }
      
//       // Remove from selections if deleted
//       if (type === 'matrix' && selectedMatrix === id) {
//         setSelectedMatrix(null);
//         onChange('pricing_matrix_id', null);
//       }
//       if (type === 'rule' && selectedRules.includes(id)) {
//         const newRules = selectedRules.filter(ruleId => ruleId !== id);
//         setSelectedRules(newRules);
//         onChange('discount_rule_ids', newRules);
//       }
//     } catch (error) {
//       console.error('Error deleting:', error);
//       toast.error(error.response?.data?.error || 'Failed to delete');
//     } finally {
//       setDeleteConfirm({ open: false, type: null, id: null, name: null });
//     }
//   }, [deleteConfirm, deletePriceMatrix, deleteDiscountRule, selectedMatrix, selectedRules, onChange]);

//   // Format matrix details for display
//   const getMatrixDetails = useCallback((matrix) => {
//     const details = {
//       type: matrix.discount_type,
//       value: matrix.discount_type === 'percentage' 
//         ? `${matrix.percentage}%`
//         : `KES ${formatNumber(matrix.fixed_amount)}`,
//       appliesTo: matrix.applies_to,
//       target: matrix.applies_to === 'plan' 
//         ? `Plan: ${matrix.target_plan?.name || 'N/A'}`
//         : matrix.applies_to === 'category'
//           ? `Category: ${matrix.target_category}`
//           : 'All Plans',
//       quantity: `Min: ${matrix.min_quantity}${matrix.max_quantity ? `, Max: ${matrix.max_quantity}` : ''}`,
//       validity: matrix.valid_to 
//         ? `Until ${formatDate(matrix.valid_to)}`
//         : 'No expiration',
//       usage: matrix.usage_count || 0,
//       totalDiscount: matrix.total_discount_amount || 0
//     };
    
//     return details;
//   }, []);

//   // Format rule details for display
//   const getRuleDetails = useCallback((rule) => {
//     const details = {
//       type: rule.rule_type,
//       priority: rule.priority,
//       matrix: rule.price_matrix?.name || 'N/A',
//       eligibility: Object.keys(rule.eligibility_criteria || {}).length > 0
//         ? `${Object.keys(rule.eligibility_criteria).length} criteria`
//         : 'No criteria',
//       usage: `${rule.current_usage || 0}/${rule.total_usage_limit || '∞'}`,
//       status: rule.is_active ? 'Active' : 'Inactive'
//     };
    
//     return details;
//   }, []);

//   // Render matrix card
//   const renderMatrixCard = useCallback((matrix) => {
//     const isSelected = selectedMatrix === matrix.id;
//     const isExpanded = expandedMatrices.has(matrix.id);
//     const details = getMatrixDetails(matrix);
    
//     return (
//       <motion.div
//         key={matrix.id}
//         initial={{ opacity: 0, y: 10 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0, y: -10 }}
//         className={`rounded-xl border transition-all duration-200 ${
//           isSelected 
//             ? theme === 'dark' 
//               ? 'border-blue-500 bg-blue-900/20' 
//               : 'border-blue-500 bg-blue-50'
//             : theme === 'dark'
//               ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
//               : 'border-gray-200 bg-white hover:bg-gray-50'
//         }`}
//       >
//         <div className="p-4">
//           <div className="flex items-start justify-between">
//             <div className="flex-1 min-w-0">
//               <div className="flex items-center gap-3 mb-2">
//                 <button
//                   onClick={() => toggleMatrixExpansion(matrix.id)}
//                   className={`p-1 rounded-md ${
//                     theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
//                   }`}
//                 >
//                   {isExpanded ? (
//                     <ChevronUp className="w-4 h-4" />
//                   ) : (
//                     <ChevronDown className="w-4 h-4" />
//                   )}
//                 </button>
                
//                 <div className="flex-1">
//                   <h4 className={`font-semibold truncate ${themeClasses.text.primary}`}>
//                     {matrix.name}
//                   </h4>
//                   <p className={`text-xs mt-1 truncate ${themeClasses.text.secondary}`}>
//                     {matrix.description || 'No description'}
//                   </p>
//                 </div>
                
//                 <div className="flex items-center gap-2">
//                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                     matrix.is_active
//                       ? theme === 'dark'
//                         ? 'bg-green-900/30 text-green-400'
//                         : 'bg-green-100 text-green-700'
//                       : theme === 'dark'
//                         ? 'bg-red-900/30 text-red-400'
//                         : 'bg-red-100 text-red-700'
//                   }`}>
//                     {matrix.is_active ? 'Active' : 'Inactive'}
//                   </span>
                  
//                   <button
//                     onClick={() => handleMatrixSelect(matrix.id)}
//                     className={`p-2 rounded-lg transition-colors ${
//                       isSelected
//                         ? theme === 'dark'
//                           ? 'bg-blue-600 text-white'
//                           : 'bg-blue-500 text-white'
//                         : theme === 'dark'
//                           ? 'hover:bg-gray-700'
//                           : 'hover:bg-gray-100'
//                     }`}
//                   >
//                     {isSelected ? <CheckCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
//                   </button>
//                 </div>
//               </div>
              
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
//                 <div className="space-y-1">
//                   <span className={`text-xs ${themeClasses.text.secondary}`}>Type</span>
//                   <div className={`text-sm font-medium flex items-center gap-1 ${
//                     themeClasses.text.primary
//                   }`}>
//                     {discountTypes.find(t => t.value === details.type)?.icon && 
//                       React.createElement(discountTypes.find(t => t.value === details.type).icon, {
//                         className: "w-3 h-3"
//                       })
//                     }
//                     {discountTypes.find(t => t.value === details.type)?.label || details.type}
//                   </div>
//                 </div>
                
//                 <div className="space-y-1">
//                   <span className={`text-xs ${themeClasses.text.secondary}`}>Discount</span>
//                   <div className={`text-sm font-bold ${
//                     details.type === 'percentage' ? 'text-green-600' : 'text-blue-600'
//                   }`}>
//                     {details.value}
//                   </div>
//                 </div>
                
//                 <div className="space-y-1">
//                   <span className={`text-xs ${themeClasses.text.secondary}`}>Applies To</span>
//                   <div className={`text-sm ${themeClasses.text.primary}`}>
//                     {details.target}
//                   </div>
//                 </div>
                
//                 <div className="space-y-1">
//                   <span className={`text-xs ${themeClasses.text.secondary}`}>Usage</span>
//                   <div className={`text-sm ${themeClasses.text.primary}`}>
//                     {details.usage} times
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           {/* Expanded Details */}
//           <AnimatePresence>
//             {isExpanded && (
//               <motion.div
//                 initial={{ height: 0, opacity: 0 }}
//                 animate={{ height: 'auto', opacity: 1 }}
//                 exit={{ height: 0, opacity: 0 }}
//                 className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
//               >
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <h5 className={`text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                       Configuration Details
//                     </h5>
//                     <div className="space-y-2">
//                       <DetailRow label="Min Quantity" value={matrix.min_quantity} theme={theme} />
//                       {matrix.max_quantity && (
//                         <DetailRow label="Max Quantity" value={matrix.max_quantity} theme={theme} />
//                       )}
//                       <DetailRow label="Valid From" value={formatDate(matrix.valid_from)} theme={theme} />
//                       {matrix.valid_to && (
//                         <DetailRow label="Valid To" value={formatDate(matrix.valid_to)} theme={theme} />
//                       )}
//                     </div>
//                   </div>
                  
//                   <div>
//                     <h5 className={`text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                       Statistics
//                     </h5>
//                     <div className="space-y-2">
//                       <DetailRow 
//                         label="Total Discount Given" 
//                         value={`KES ${formatNumber(matrix.total_discount_amount || 0)}`} 
//                         theme={theme} 
//                       />
//                       <DetailRow 
//                         label="Average Discount" 
//                         value={`KES ${formatNumber(
//                           matrix.total_discount_amount && matrix.usage_count
//                             ? matrix.total_discount_amount / matrix.usage_count
//                             : 0
//                         )}`} 
//                         theme={theme} 
//                       />
//                     </div>
//                   </div>
//                 </div>
                
//                 {/* Action Buttons */}
//                 <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
//                   <button
//                     onClick={() => {
//                       setEditingMatrix(matrix);
//                       setMatrixForm(matrix);
//                       setShowMatrixForm(true);
//                     }}
//                     className={`px-3 py-1.5 rounded-lg text-sm ${
//                       theme === 'dark'
//                         ? 'bg-gray-700 hover:bg-gray-600'
//                         : 'bg-gray-100 hover:bg-gray-200'
//                     }`}
//                   >
//                     <Edit className="w-4 h-4 inline mr-2" />
//                     Edit
//                   </button>
                  
//                   <button
//                     onClick={() => confirmDelete('matrix', matrix.id, matrix.name)}
//                     className={`px-3 py-1.5 rounded-lg text-sm ${
//                       theme === 'dark'
//                         ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400'
//                         : 'bg-red-100 hover:bg-red-200 text-red-700'
//                     }`}
//                   >
//                     <Trash2 className="w-4 h-4 inline mr-2" />
//                     Delete
//                   </button>
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </motion.div>
//     );
//   }, [theme, themeClasses, selectedMatrix, expandedMatrices, handleMatrixSelect, confirmDelete]);

//   // Render rule card
//   const renderRuleCard = useCallback((rule) => {
//     const isSelected = selectedRules.includes(rule.id);
//     const isExpanded = expandedRules.has(rule.id);
//     const details = getRuleDetails(rule);
    
//     return (
//       <motion.div
//         key={rule.id}
//         initial={{ opacity: 0, y: 10 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0, y: -10 }}
//         className={`rounded-xl border transition-all duration-200 ${
//           isSelected 
//             ? theme === 'dark' 
//               ? 'border-green-500 bg-green-900/20' 
//               : 'border-green-500 bg-green-50'
//             : theme === 'dark'
//               ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
//               : 'border-gray-200 bg-white hover:bg-gray-50'
//         }`}
//       >
//         <div className="p-4">
//           <div className="flex items-start justify-between">
//             <div className="flex-1 min-w-0">
//               <div className="flex items-center gap-3 mb-2">
//                 <button
//                   onClick={() => toggleRuleExpansion(rule.id)}
//                   className={`p-1 rounded-md ${
//                     theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
//                   }`}
//                 >
//                   {isExpanded ? (
//                     <ChevronUp className="w-4 h-4" />
//                   ) : (
//                     <ChevronDown className="w-4 h-4" />
//                   )}
//                 </button>
                
//                 <div className="flex-1">
//                   <h4 className={`font-semibold truncate ${themeClasses.text.primary}`}>
//                     {rule.name}
//                   </h4>
//                   <p className={`text-xs mt-1 truncate ${themeClasses.text.secondary}`}>
//                     {rule.description || 'No description'}
//                   </p>
//                 </div>
                
//                 <div className="flex items-center gap-2">
//                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                     rule.is_active
//                       ? theme === 'dark'
//                         ? 'bg-green-900/30 text-green-400'
//                         : 'bg-green-100 text-green-700'
//                       : theme === 'dark'
//                         ? 'bg-red-900/30 text-red-400'
//                         : 'bg-red-100 text-red-700'
//                   }`}>
//                     {details.status}
//                   </span>
                  
//                   <button
//                     onClick={() => handleRuleSelect(rule.id)}
//                     className={`p-2 rounded-lg transition-colors ${
//                       isSelected
//                         ? theme === 'dark'
//                           ? 'bg-green-600 text-white'
//                           : 'bg-green-500 text-white'
//                         : theme === 'dark'
//                           ? 'hover:bg-gray-700'
//                           : 'hover:bg-gray-100'
//                     }`}
//                   >
//                     {isSelected ? <CheckCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
//                   </button>
//                 </div>
//               </div>
              
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
//                 <div className="space-y-1">
//                   <span className={`text-xs ${themeClasses.text.secondary}`}>Type</span>
//                   <div className={`text-sm font-medium flex items-center gap-1 ${
//                     themeClasses.text.primary
//                   }`}>
//                     {ruleTypes.find(t => t.value === details.type)?.icon && 
//                       React.createElement(ruleTypes.find(t => t.value === details.type).icon, {
//                         className: "w-3 h-3"
//                       })
//                     }
//                     {ruleTypes.find(t => t.value === details.type)?.label || details.type}
//                   </div>
//                 </div>
                
//                 <div className="space-y-1">
//                   <span className={`text-xs ${themeClasses.text.secondary}`}>Priority</span>
//                   <div className={`text-sm font-bold ${
//                     theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
//                   }`}>
//                     {details.priority}
//                   </div>
//                 </div>
                
//                 <div className="space-y-1">
//                   <span className={`text-xs ${themeClasses.text.secondary}`}>Matrix</span>
//                   <div className={`text-sm ${themeClasses.text.primary} truncate`}>
//                     {details.matrix}
//                   </div>
//                 </div>
                
//                 <div className="space-y-1">
//                   <span className={`text-xs ${themeClasses.text.secondary}`}>Usage</span>
//                   <div className={`text-sm ${themeClasses.text.primary}`}>
//                     {details.usage}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           {/* Expanded Details */}
//           <AnimatePresence>
//             {isExpanded && (
//               <motion.div
//                 initial={{ height: 0, opacity: 0 }}
//                 animate={{ height: 'auto', opacity: 1 }}
//                 exit={{ height: 0, opacity: 0 }}
//                 className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
//               >
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <h5 className={`text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                       Rule Details
//                     </h5>
//                     <div className="space-y-2">
//                       <DetailRow label="Rule Type" value={details.type} theme={theme} />
//                       <DetailRow label="Eligibility Criteria" value={details.eligibility} theme={theme} />
//                       <DetailRow label="Max Uses Per Client" value={rule.max_uses_per_client || 'Unlimited'} theme={theme} />
//                     </div>
//                   </div>
                  
//                   <div>
//                     <h5 className={`text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                       Associated Matrix
//                     </h5>
//                     {rule.price_matrix && (
//                       <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
//                         <div className="font-medium">{rule.price_matrix.name}</div>
//                         <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
//                           {rule.price_matrix.description || 'No description'}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
                
//                 {/* Action Buttons */}
//                 <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
//                   <button
//                     onClick={() => {
//                       setEditingRule(rule);
//                       setRuleForm(rule);
//                       setShowRuleForm(true);
//                     }}
//                     className={`px-3 py-1.5 rounded-lg text-sm ${
//                       theme === 'dark'
//                         ? 'bg-gray-700 hover:bg-gray-600'
//                         : 'bg-gray-100 hover:bg-gray-200'
//                     }`}
//                   >
//                     <Edit className="w-4 h-4 inline mr-2" />
//                     Edit
//                   </button>
                  
//                   <button
//                     onClick={() => confirmDelete('rule', rule.id, rule.name)}
//                     className={`px-3 py-1.5 rounded-lg text-sm ${
//                       theme === 'dark'
//                         ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400'
//                         : 'bg-red-100 hover:bg-red-200 text-red-700'
//                     }`}
//                   >
//                     <Trash2 className="w-4 h-4 inline mr-2" />
//                     Delete
//                   </button>
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </motion.div>
//     );
//   }, [theme, themeClasses, selectedRules, expandedRules, handleRuleSelect, confirmDelete]);

//   // Detail row component
//   const DetailRow = ({ label, value, theme }) => (
//     <div className="flex justify-between items-center">
//       <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
//         {label}:
//       </span>
//       <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
//         {value}
//       </span>
//     </div>
//   );

//   // Responsive layout classes
//   const getResponsiveClasses = () => ({
//     container: isMobile 
//       ? 'p-3 space-y-4' 
//       : isMobile === false 
//         ? 'p-6 space-y-6' 
//         : 'p-4 space-y-5',
//     gridCols: isMobile 
//       ? 'grid-cols-1' 
//       : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
//     buttonSize: isMobile 
//       ? 'px-3 py-2 text-sm' 
//       : 'px-4 py-3 text-base',
//     header: isMobile 
//       ? 'text-xl font-bold' 
//       : 'text-2xl font-bold'
//   });

//   const responsiveClasses = getResponsiveClasses();

//   return (
//     <div className={`${responsiveClasses.container} ${themeClasses.bg.primary}`}>
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//         <div>
//           <h2 className={`${responsiveClasses.header} ${themeClasses.text.primary}`}>
//             Pricing Configuration
//           </h2>
//           <p className={`mt-1 ${themeClasses.text.secondary}`}>
//             Configure price matrices and discount rules for this plan
//           </p>
//         </div>
        
//         <div className="flex gap-2">
//           <button
//             onClick={() => setShowMatrixForm(true)}
//             className={`${responsiveClasses.buttonSize} rounded-lg flex items-center gap-2 ${
//               theme === 'dark'
//                 ? 'bg-blue-600 hover:bg-blue-700 text-white'
//                 : 'bg-blue-500 hover:bg-blue-600 text-white'
//             }`}
//           >
//             <Plus className="w-4 h-4" />
//             <span className="hidden sm:inline">Add Price Matrix</span>
//           </button>
          
//           <button
//             onClick={() => setShowRuleForm(true)}
//             className={`${responsiveClasses.buttonSize} rounded-lg flex items-center gap-2 ${
//               theme === 'dark'
//                 ? 'bg-green-600 hover:bg-green-700 text-white'
//                 : 'bg-green-500 hover:bg-green-600 text-white'
//             }`}
//           >
//             <Plus className="w-4 h-4" />
//             <span className="hidden sm:inline">Add Discount Rule</span>
//           </button>
//         </div>
//       </div>

//       {/* Statistics Overview */}
//       <div className={`grid ${responsiveClasses.gridCols} gap-4`}>
//         <StatisticsCard
//           title="Active Matrices"
//           value={pricingStats.activeMatrices}
//           icon={Layers}
//           color="blue"
//           theme={theme}
//           change={pricingStats.activeMatrices > 0 ? 'positive' : 'neutral'}
//           description="Price matrices currently active"
//         />
        
//         <StatisticsCard
//           title="Active Rules"
//           value={pricingStats.activeRules}
//           icon={Award}
//           color="green"
//           theme={theme}
//           change={pricingStats.activeRules > 0 ? 'positive' : 'neutral'}
//           description="Discount rules currently active"
//         />
        
//         <StatisticsCard
//           title="Average Discount"
//           value={`${pricingStats.averageDiscount.toFixed(1)}%`}
//           icon={Percent}
//           color="purple"
//           theme={theme}
//           change={pricingStats.averageDiscount > 0 ? 'positive' : 'neutral'}
//           description="Average discount percentage"
//         />
        
//         {!isMobile && (
//           <>
//             <StatisticsCard
//               title="Total Savings"
//               value={`KES ${formatNumber(pricingStats.totalSavings)}`}
//               icon={DollarSign}
//               color="green"
//               theme={theme}
//               change="positive"
//               description="Total discount amount given"
//             />
            
//             <StatisticsCard
//               title="Plan Price"
//               value={`KES ${formatNumber(form.price || 0)}`}
//               icon={Tag}
//               color="orange"
//               theme={theme}
//               change="neutral"
//               description="Base price of this plan"
//             />
            
//             <StatisticsCard
//               title="Selected Rules"
//               value={selectedRules.length}
//               icon={Target}
//               color="red"
//               theme={theme}
//               change={selectedRules.length > 0 ? 'positive' : 'neutral'}
//               description="Discount rules applied"
//             />
//           </>
//         )}
//       </div>

//       {/* Price Calculator */}
//       <div className={`rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card} p-4 sm:p-6`}>
//         <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${themeClasses.text.primary}`}>
//           <Calculator className="w-5 h-5" />
//           Price Calculator
//         </h3>
        
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div>
//             <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//               Quantity
//             </label>
//             <input
//               type="number"
//               min="1"
//               value={calculationQuantity}
//               onChange={(e) => setCalculationQuantity(Math.max(1, parseInt(e.target.value) || 1))}
//               className={`w-full px-3 py-2 rounded-lg border ${
//                 theme === 'dark'
//                   ? 'bg-gray-800 border-gray-700 text-white'
//                   : 'bg-white border-gray-300 text-gray-900'
//               }`}
//             />
//           </div>
          
//           <div>
//             <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//               Discount Code (Optional)
//             </label>
//             <input
//               type="text"
//               value={calculationDiscount}
//               onChange={(e) => setCalculationDiscount(e.target.value)}
//               className={`w-full px-3 py-2 rounded-lg border ${
//                 theme === 'dark'
//                   ? 'bg-gray-800 border-gray-700 text-white'
//                   : 'bg-white border-gray-300 text-gray-900'
//               }`}
//               placeholder="Enter discount code"
//             />
//           </div>
          
//           <div className="flex items-end">
//             <button
//               onClick={calculateCurrentPrice}
//               disabled={isCalculating || !form.id}
//               className={`${responsiveClasses.buttonSize} rounded-lg flex items-center justify-center gap-2 w-full ${
//                 isCalculating || !form.id
//                   ? 'bg-gray-400 cursor-not-allowed'
//                   : theme === 'dark'
//                     ? 'bg-indigo-600 hover:bg-indigo-700'
//                     : 'bg-indigo-500 hover:bg-indigo-600'
//               } text-white`}
//             >
//               {isCalculating ? (
//                 <>
//                   <FaSpinner className="w-4 h-4 animate-spin" />
//                   Calculating...
//                 </>
//               ) : (
//                 <>
//                   <Calculator className="w-4 h-4" />
//                   Calculate Price
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
        
//         {/* Calculation Result */}
//         {priceCalculationResult && (
//           <motion.div
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="mt-6 p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20"
//           >
//             <h4 className={`text-lg font-semibold mb-3 ${themeClasses.text.primary}`}>
//               Price Calculation Result
//             </h4>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               <div>
//                 <span className={`text-sm ${themeClasses.text.secondary}`}>Original Price</span>
//                 <div className={`text-xl font-bold ${themeClasses.text.primary}`}>
//                   KES {formatNumber(priceCalculationResult.original_price)}
//                 </div>
//               </div>
              
//               <div>
//                 <span className={`text-sm ${themeClasses.text.secondary}`}>Discounted Price</span>
//                 <div className={`text-xl font-bold text-green-600`}>
//                   KES {formatNumber(priceCalculationResult.discounted_price)}
//                 </div>
//               </div>
              
//               <div>
//                 <span className={`text-sm ${themeClasses.text.secondary}`}>Savings</span>
//                 <div className={`text-xl font-bold text-blue-600`}>
//                   KES {formatNumber(priceCalculationResult.discount_amount)}
//                 </div>
//               </div>
              
//               <div>
//                 <span className={`text-sm ${themeClasses.text.secondary}`}>Discount</span>
//                 <div className={`text-xl font-bold text-purple-600`}>
//                   {priceCalculationResult.discount_percentage}%
//                 </div>
//               </div>
//             </div>
            
//             {priceCalculationResult.applied_discounts?.length > 0 && (
//               <div className="mt-4">
//                 <span className={`text-sm ${themeClasses.text.secondary}`}>Applied Discounts:</span>
//                 <div className="flex flex-wrap gap-2 mt-2">
//                   {priceCalculationResult.applied_discounts.map((discount, index) => (
//                     <span
//                       key={index}
//                       className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm"
//                     >
//                       {discount.name}: {discount.percentage}%
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </motion.div>
//         )}
//       </div>

//       {/* Tabs for Matrices and Rules */}
//       <div className="flex border-b border-gray-200 dark:border-gray-700">
//         <button
//           onClick={() => setActiveSection('matrices')}
//           className={`px-4 py-3 font-medium text-sm md:text-base ${
//             activeSection === 'matrices'
//               ? theme === 'dark'
//                 ? 'text-white border-b-2 border-blue-500'
//                 : 'text-blue-600 border-b-2 border-blue-500'
//               : themeClasses.text.secondary
//           }`}
//         >
//           <Layers className="w-4 h-4 inline mr-2" />
//           Price Matrices
//         </button>
        
//         <button
//           onClick={() => setActiveSection('rules')}
//           className={`px-4 py-3 font-medium text-sm md:text-base ${
//             activeSection === 'rules'
//               ? theme === 'dark'
//                 ? 'text-white border-b-2 border-green-500'
//                 : 'text-green-600 border-b-2 border-green-500'
//               : themeClasses.text.secondary
//           }`}
//         >
//           <Award className="w-4 h-4 inline mr-2" />
//           Discount Rules
//         </button>
//       </div>

//       {/* Content Area */}
//       <div className="min-h-[400px]">
//         {activeSection === 'matrices' ? (
//           <div className="space-y-4">
//             <div className="flex justify-between items-center">
//               <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
//                 Available Price Matrices
//               </h3>
//               <div className="text-sm">
//                 <span className={themeClasses.text.secondary}>
//                   {applicableMatrices.length} matrices available
//                 </span>
//               </div>
//             </div>
            
//             {matricesLoading ? (
//               <div className="text-center py-12">
//                 <FaSpinner className="w-8 h-8 animate-spin mx-auto text-gray-400" />
//                 <p className="mt-2 text-gray-500">Loading price matrices...</p>
//               </div>
//             ) : applicableMatrices.length === 0 ? (
//               <EmptyState
//                 title="No Price Matrices Available"
//                 description="Create a price matrix to start applying discounts to this plan"
//                 icon={Layers}
//                 theme={theme}
//                 action={{
//                   label: 'Create Price Matrix',
//                   onClick: () => setShowMatrixForm(true)
//                 }}
//               />
//             ) : (
//               <div className="space-y-3">
//                 {applicableMatrices.map(renderMatrixCard)}
//               </div>
//             )}
//           </div>
//         ) : (
//           <div className="space-y-4">
//             <div className="flex justify-between items-center">
//               <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
//                 Available Discount Rules
//               </h3>
//               <div className="text-sm">
//                 <span className={themeClasses.text.secondary}>
//                   {discountRules.length} rules available
//                 </span>
//               </div>
//             </div>
            
//             {rulesLoading ? (
//               <div className="text-center py-12">
//                 <FaSpinner className="w-8 h-8 animate-spin mx-auto text-gray-400" />
//                 <p className="mt-2 text-gray-500">Loading discount rules...</p>
//               </div>
//             ) : discountRules.length === 0 ? (
//               <EmptyState
//                 title="No Discount Rules Available"
//                 description="Create a discount rule to apply business logic to discounts"
//                 icon={Award}
//                 theme={theme}
//                 action={{
//                   label: 'Create Discount Rule',
//                   onClick: () => setShowRuleForm(true)
//                 }}
//               />
//             ) : (
//               <div className="space-y-3">
//                 {discountRules.map(renderRuleCard)}
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Modals */}
//       <AnimatePresence>
//         {showMatrixForm && (
//           <PriceMatrixFormModal
//             form={matrixForm}
//             editing={editingMatrix}
//             onClose={() => {
//               setShowMatrixForm(false);
//               setEditingMatrix(null);
//               setMatrixForm({
//                 name: '',
//                 description: '',
//                 discount_type: 'percentage',
//                 applies_to: 'plan',
//                 target_plan: null,
//                 target_category: '',
//                 percentage: 0,
//                 fixed_amount: 0,
//                 tier_config: [],
//                 min_quantity: 1,
//                 max_quantity: null,
//                 valid_from: new Date().toISOString().split('T')[0],
//                 valid_to: null,
//                 is_active: true
//               });
//             }}
//             onSave={saveMatrix}
//             theme={theme}
//             isMobile={isMobile}
//           />
//         )}
//       </AnimatePresence>

//       <AnimatePresence>
//         {showRuleForm && (
//           <DiscountRuleFormModal
//             form={ruleForm}
//             editing={editingRule}
//             priceMatrices={priceMatrices}
//             onClose={() => {
//               setShowRuleForm(false);
//               setEditingRule(null);
//               setRuleForm({
//                 name: '',
//                 rule_type: 'first_time',
//                 description: '',
//                 price_matrix: null,
//                 eligibility_criteria: {},
//                 priority: 1,
//                 max_uses_per_client: null,
//                 total_usage_limit: null,
//                 is_active: true
//               });
//             }}
//             onSave={saveRule}
//             theme={theme}
//             isMobile={isMobile}
//           />
//         )}
//       </AnimatePresence>

//       {/* Delete Confirmation Modal */}
//       <ConfirmationModal
//         isOpen={deleteConfirm.open}
//         onClose={() => setDeleteConfirm({ open: false, type: null, id: null, name: null })}
//         onConfirm={handleDelete}
//         title={`Delete ${deleteConfirm.type === 'matrix' ? 'Price Matrix' : 'Discount Rule'}`}
//         message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
//         confirmText="Delete"
//         cancelText="Cancel"
//         type="danger"
//         theme={theme}
//         isMobile={isMobile}
//       />
//     </div>
//   );
// };

// // Price Matrix Form Modal Component
// const PriceMatrixFormModal = ({ form, editing, onClose, onSave, theme, isMobile }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [localForm, setLocalForm] = React.useState(form);
//   const [errors, setErrors] = React.useState({});
//   const [tierRows, setTierRows] = React.useState(form.tier_config || []);

//   const handleChange = (field, value) => {
//     setLocalForm(prev => ({ ...prev, [field]: value }));
//     if (errors[field]) {
//       setErrors(prev => ({ ...prev, [field]: null }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
    
//     if (!localForm.name?.trim()) {
//       newErrors.name = 'Name is required';
//     }
    
//     if (localForm.discount_type === 'percentage') {
//       if (localForm.percentage < 0 || localForm.percentage > 100) {
//         newErrors.percentage = 'Percentage must be between 0 and 100';
//       }
//     }
    
//     if (localForm.discount_type === 'fixed') {
//       if (localForm.fixed_amount < 0) {
//         newErrors.fixed_amount = 'Fixed amount cannot be negative';
//       }
//     }
    
//     if (localForm.discount_type === 'tiered' && tierRows.length === 0) {
//       newErrors.tier_config = 'At least one tier is required for tiered pricing';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = () => {
//     if (validateForm()) {
//       const finalForm = {
//         ...localForm,
//         tier_config: tierRows
//       };
//       onSave(finalForm);
//     }
//   };

//   const addTierRow = () => {
//     setTierRows([...tierRows, { min_qty: tierRows.length + 1, price: 0 }]);
//   };

//   const updateTierRow = (index, field, value) => {
//     const newRows = [...tierRows];
//     newRows[index][field] = value;
//     setTierRows(newRows);
//   };

//   const removeTierRow = (index) => {
//     setTierRows(tierRows.filter((_, i) => i !== index));
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.9 }}
//         className={`rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden ${
//           theme === 'dark' ? 'bg-gray-900' : 'bg-white'
//         }`}
//       >
//         <div className="p-6 border-b border-gray-200 dark:border-gray-700">
//           <div className="flex items-center justify-between">
//             <h2 className={`text-xl font-bold ${themeClasses.text.primary}`}>
//               {editing ? 'Edit Price Matrix' : 'Create Price Matrix'}
//             </h2>
//             <button
//               onClick={onClose}
//               className={`p-2 rounded-lg ${
//                 theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
//               }`}
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>
//         </div>

//         <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
//           <div className="space-y-4">
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                 Matrix Name *
//               </label>
//               <input
//                 type="text"
//                 value={localForm.name}
//                 onChange={(e) => handleChange('name', e.target.value)}
//                 className={`w-full px-3 py-2 rounded-lg border ${
//                   errors.name
//                     ? 'border-red-500'
//                     : theme === 'dark'
//                     ? 'bg-gray-800 border-gray-700'
//                     : 'bg-white border-gray-300'
//                 }`}
//                 placeholder="Enter matrix name"
//               />
//               {errors.name && (
//                 <p className="text-red-500 text-sm mt-1">{errors.name}</p>
//               )}
//             </div>

//             <div>
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                 Description
//               </label>
//               <textarea
//                 value={localForm.description}
//                 onChange={(e) => handleChange('description', e.target.value)}
//                 rows="2"
//                 className={`w-full px-3 py-2 rounded-lg border ${
//                   theme === 'dark'
//                     ? 'bg-gray-800 border-gray-700'
//                     : 'bg-white border-gray-300'
//                 }`}
//                 placeholder="Enter description"
//               />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                   Discount Type *
//                 </label>
//                 <select
//                   value={localForm.discount_type}
//                   onChange={(e) => handleChange('discount_type', e.target.value)}
//                   className={`w-full px-3 py-2 rounded-lg border ${
//                     theme === 'dark'
//                       ? 'bg-gray-800 border-gray-700'
//                       : 'bg-white border-gray-300'
//                   }`}
//                 >
//                   {discountTypes.map(type => (
//                     <option key={type.value} value={type.value}>
//                       {type.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                   Applies To *
//                 </label>
//                 <select
//                   value={localForm.applies_to}
//                   onChange={(e) => handleChange('applies_to', e.target.value)}
//                   className={`w-full px-3 py-2 rounded-lg border ${
//                     theme === 'dark'
//                       ? 'bg-gray-800 border-gray-700'
//                       : 'bg-white border-gray-300'
//                   }`}
//                 >
//                   {appliesToOptions.map(option => (
//                     <option key={option.value} value={option.value}>
//                       {option.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             {localForm.discount_type === 'percentage' && (
//               <div>
//                 <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                   Percentage (%) *
//                 </label>
//                 <input
//                   type="number"
//                   min="0"
//                   max="100"
//                   step="0.01"
//                   value={localForm.percentage}
//                   onChange={(e) => handleChange('percentage', parseFloat(e.target.value))}
//                   className={`w-full px-3 py-2 rounded-lg border ${
//                     errors.percentage
//                       ? 'border-red-500'
//                       : theme === 'dark'
//                       ? 'bg-gray-800 border-gray-700'
//                       : 'bg-white border-gray-300'
//                   }`}
//                 />
//                 {errors.percentage && (
//                   <p className="text-red-500 text-sm mt-1">{errors.percentage}</p>
//                 )}
//               </div>
//             )}

//             {localForm.discount_type === 'fixed' && (
//               <div>
//                 <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                   Fixed Amount (KES) *
//                 </label>
//                 <input
//                   type="number"
//                   min="0"
//                   step="0.01"
//                   value={localForm.fixed_amount}
//                   onChange={(e) => handleChange('fixed_amount', parseFloat(e.target.value))}
//                   className={`w-full px-3 py-2 rounded-lg border ${
//                     errors.fixed_amount
//                       ? 'border-red-500'
//                       : theme === 'dark'
//                       ? 'bg-gray-800 border-gray-700'
//                       : 'bg-white border-gray-300'
//                   }`}
//                 />
//                 {errors.fixed_amount && (
//                   <p className="text-red-500 text-sm mt-1">{errors.fixed_amount}</p>
//                 )}
//               </div>
//             )}

//             {localForm.discount_type === 'tiered' && (
//               <div>
//                 <div className="flex justify-between items-center mb-2">
//                   <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
//                     Tier Configuration *
//                   </label>
//                   <button
//                     type="button"
//                     onClick={addTierRow}
//                     className="text-sm text-blue-600 hover:text-blue-800"
//                   >
//                     + Add Tier
//                   </button>
//                 </div>
                
//                 {errors.tier_config && (
//                   <p className="text-red-500 text-sm mb-2">{errors.tier_config}</p>
//                 )}
                
//                 <div className="space-y-2">
//                   {tierRows.map((tier, index) => (
//                     <div key={index} className="flex items-center gap-2">
//                       <input
//                         type="number"
//                         min="1"
//                         value={tier.min_qty}
//                         onChange={(e) => updateTierRow(index, 'min_qty', parseInt(e.target.value))}
//                         className="flex-1 px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-800"
//                         placeholder="Min Quantity"
//                       />
//                       <input
//                         type="number"
//                         min="0"
//                         step="0.01"
//                         value={tier.price}
//                         onChange={(e) => updateTierRow(index, 'price', parseFloat(e.target.value))}
//                         className="flex-1 px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-800"
//                         placeholder="Price"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => removeTierRow(index)}
//                         className="p-2 text-red-500 hover:text-red-700"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                   Min Quantity
//                 </label>
//                 <input
//                   type="number"
//                   min="1"
//                   value={localForm.min_quantity}
//                   onChange={(e) => handleChange('min_quantity', parseInt(e.target.value))}
//                   className={`w-full px-3 py-2 rounded-lg border ${
//                     theme === 'dark'
//                       ? 'bg-gray-800 border-gray-700'
//                       : 'bg-white border-gray-300'
//                   }`}
//                 />
//               </div>

//               <div>
//                 <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                   Max Quantity (Optional)
//                 </label>
//                 <input
//                   type="number"
//                   min="1"
//                   value={localForm.max_quantity || ''}
//                   onChange={(e) => handleChange('max_quantity', e.target.value ? parseInt(e.target.value) : null)}
//                   className={`w-full px-3 py-2 rounded-lg border ${
//                     theme === 'dark'
//                       ? 'bg-gray-800 border-gray-700'
//                       : 'bg-white border-gray-300'
//                   }`}
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                   Valid From
//                 </label>
//                 <input
//                   type="date"
//                   value={localForm.valid_from}
//                   onChange={(e) => handleChange('valid_from', e.target.value)}
//                   className={`w-full px-3 py-2 rounded-lg border ${
//                     theme === 'dark'
//                       ? 'bg-gray-800 border-gray-700'
//                       : 'bg-white border-gray-300'
//                   }`}
//                 />
//               </div>

//               <div>
//                 <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                   Valid To (Optional)
//                 </label>
//                 <input
//                   type="date"
//                   value={localForm.valid_to || ''}
//                   onChange={(e) => handleChange('valid_to', e.target.value || null)}
//                   className={`w-full px-3 py-2 rounded-lg border ${
//                     theme === 'dark'
//                       ? 'bg-gray-800 border-gray-700'
//                       : 'bg-white border-gray-300'
//                   }`}
//                 />
//               </div>
//             </div>

//             <div className="flex items-center gap-2">
//               <input
//                 type="checkbox"
//                 id="is_active"
//                 checked={localForm.is_active}
//                 onChange={(e) => handleChange('is_active', e.target.checked)}
//                 className="w-4 h-4"
//               />
//               <label htmlFor="is_active" className={themeClasses.text.primary}>
//                 Active
//               </label>
//             </div>
//           </div>
//         </div>

//         <div className="p-6 border-t border-gray-200 dark:border-gray-700">
//           <div className="flex justify-end gap-3">
//             <button
//               onClick={onClose}
//               className={`px-4 py-2 rounded-lg ${
//                 theme === 'dark'
//                   ? 'bg-gray-800 hover:bg-gray-700'
//                   : 'bg-gray-100 hover:bg-gray-200'
//               }`}
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSubmit}
//               className={`px-4 py-2 rounded-lg text-white ${
//                 theme === 'dark'
//                   ? 'bg-blue-600 hover:bg-blue-700'
//                   : 'bg-blue-500 hover:bg-blue-600'
//               }`}
//             >
//               {editing ? 'Update Matrix' : 'Create Matrix'}
//             </button>
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// // Discount Rule Form Modal Component
// const DiscountRuleFormModal = ({ form, editing, priceMatrices, onClose, onSave, theme, isMobile }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [localForm, setLocalForm] = React.useState(form);
//   const [errors, setErrors] = React.useState({});

//   const handleChange = (field, value) => {
//     setLocalForm(prev => ({ ...prev, [field]: value }));
//     if (errors[field]) {
//       setErrors(prev => ({ ...prev, [field]: null }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
    
//     if (!localForm.name?.trim()) {
//       newErrors.name = 'Name is required';
//     }
    
//     if (!localForm.price_matrix) {
//       newErrors.price_matrix = 'Price matrix is required';
//     }
    
//     if (localForm.priority < 1 || localForm.priority > 100) {
//       newErrors.priority = 'Priority must be between 1 and 100';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = () => {
//     if (validateForm()) {
//       onSave(localForm);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.9 }}
//         className={`rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden ${
//           theme === 'dark' ? 'bg-gray-900' : 'bg-white'
//         }`}
//       >
//         <div className="p-6 border-b border-gray-200 dark:border-gray-700">
//           <div className="flex items-center justify-between">
//             <h2 className={`text-xl font-bold ${themeClasses.text.primary}`}>
//               {editing ? 'Edit Discount Rule' : 'Create Discount Rule'}
//             </h2>
//             <button
//               onClick={onClose}
//               className={`p-2 rounded-lg ${
//                 theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
//               }`}
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>
//         </div>

//         <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
//           <div className="space-y-4">
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                 Rule Name *
//               </label>
//               <input
//                 type="text"
//                 value={localForm.name}
//                 onChange={(e) => handleChange('name', e.target.value)}
//                 className={`w-full px-3 py-2 rounded-lg border ${
//                   errors.name
//                     ? 'border-red-500'
//                     : theme === 'dark'
//                     ? 'bg-gray-800 border-gray-700'
//                     : 'bg-white border-gray-300'
//                 }`}
//                 placeholder="Enter rule name"
//               />
//               {errors.name && (
//                 <p className="text-red-500 text-sm mt-1">{errors.name}</p>
//               )}
//             </div>

//             <div>
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                 Description
//               </label>
//               <textarea
//                 value={localForm.description}
//                 onChange={(e) => handleChange('description', e.target.value)}
//                 rows="2"
//                 className={`w-full px-3 py-2 rounded-lg border ${
//                   theme === 'dark'
//                     ? 'bg-gray-800 border-gray-700'
//                     : 'bg-white border-gray-300'
//                 }`}
//                 placeholder="Enter description"
//               />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                   Rule Type *
//                 </label>
//                 <select
//                   value={localForm.rule_type}
//                   onChange={(e) => handleChange('rule_type', e.target.value)}
//                   className={`w-full px-3 py-2 rounded-lg border ${
//                     theme === 'dark'
//                       ? 'bg-gray-800 border-gray-700'
//                       : 'bg-white border-gray-300'
//                   }`}
//                 >
//                   {ruleTypes.map(type => (
//                     <option key={type.value} value={type.value}>
//                       {type.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                   Priority *
//                 </label>
//                 <input
//                   type="number"
//                   min="1"
//                   max="100"
//                   value={localForm.priority}
//                   onChange={(e) => handleChange('priority', parseInt(e.target.value))}
//                   className={`w-full px-3 py-2 rounded-lg border ${
//                     errors.priority
//                       ? 'border-red-500'
//                       : theme === 'dark'
//                       ? 'bg-gray-800 border-gray-700'
//                       : 'bg-white border-gray-300'
//                   }`}
//                 />
//                 {errors.priority && (
//                   <p className="text-red-500 text-sm mt-1">{errors.priority}</p>
//                 )}
//                 <p className="text-xs text-gray-500 mt-1">
//                   Higher priority rules are applied first
//                 </p>
//               </div>
//             </div>

//             <div>
//               <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                 Price Matrix *
//               </label>
//               <select
//                 value={localForm.price_matrix}
//                 onChange={(e) => handleChange('price_matrix', e.target.value)}
//                 className={`w-full px-3 py-2 rounded-lg border ${
//                   errors.price_matrix
//                     ? 'border-red-500'
//                     : theme === 'dark'
//                     ? 'bg-gray-800 border-gray-700'
//                     : 'bg-white border-gray-300'
//                 }`}
//               >
//                 <option value="">Select a price matrix</option>
//                 {priceMatrices
//                   .filter(m => m.is_active)
//                   .map(matrix => (
//                     <option key={matrix.id} value={matrix.id}>
//                       {matrix.name}
//                     </option>
//                   ))
//                 }
//               </select>
//               {errors.price_matrix && (
//                 <p className="text-red-500 text-sm mt-1">{errors.price_matrix}</p>
//               )}
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                   Max Uses Per Client (Optional)
//                 </label>
//                 <input
//                   type="number"
//                   min="1"
//                   value={localForm.max_uses_per_client || ''}
//                   onChange={(e) => handleChange('max_uses_per_client', e.target.value ? parseInt(e.target.value) : null)}
//                   className={`w-full px-3 py-2 rounded-lg border ${
//                     theme === 'dark'
//                       ? 'bg-gray-800 border-gray-700'
//                       : 'bg-white border-gray-300'
//                   }`}
//                   placeholder="Unlimited if empty"
//                 />
//               </div>

//               <div>
//                 <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//                   Total Usage Limit (Optional)
//                 </label>
//                 <input
//                   type="number"
//                   min="1"
//                   value={localForm.total_usage_limit || ''}
//                   onChange={(e) => handleChange('total_usage_limit', e.target.value ? parseInt(e.target.value) : null)}
//                   className={`w-full px-3 py-2 rounded-lg border ${
//                     theme === 'dark'
//                       ? 'bg-gray-800 border-gray-700'
//                       : 'bg-white border-gray-300'
//                   }`}
//                   placeholder="Unlimited if empty"
//                 />
//               </div>
//             </div>

//             <div className="flex items-center gap-2">
//               <input
//                 type="checkbox"
//                 id="is_active"
//                 checked={localForm.is_active}
//                 onChange={(e) => handleChange('is_active', e.target.checked)}
//                 className="w-4 h-4"
//               />
//               <label htmlFor="is_active" className={themeClasses.text.primary}>
//                 Active
//               </label>
//             </div>
//           </div>
//         </div>

//         <div className="p-6 border-t border-gray-200 dark:border-gray-700">
//           <div className="flex justify-end gap-3">
//             <button
//               onClick={onClose}
//               className={`px-4 py-2 rounded-lg ${
//                 theme === 'dark'
//                   ? 'bg-gray-800 hover:bg-gray-700'
//                   : 'bg-gray-100 hover:bg-gray-200'
//               }`}
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSubmit}
//               className={`px-4 py-2 rounded-lg text-white ${
//                 theme === 'dark'
//                   ? 'bg-green-600 hover:bg-green-700'
//                   : 'bg-green-500 hover:bg-green-600'
//               }`}
//             >
//               {editing ? 'Update Rule' : 'Create Rule'}
//             </button>
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// // Statistics Card Component
// const StatisticsCard = ({ title, value, icon: Icon, color, theme, change, description }) => {
//   const colorClasses = {
//     blue: {
//       bg: theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50',
//       text: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
//       border: theme === 'dark' ? 'border-blue-700' : 'border-blue-200'
//     },
//     green: {
//       bg: theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50',
//       text: theme === 'dark' ? 'text-green-400' : 'text-green-600',
//       border: theme === 'dark' ? 'border-green-700' : 'border-green-200'
//     },
//     purple: {
//       bg: theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50',
//       text: theme === 'dark' ? 'text-purple-400' : 'text-purple-600',
//       border: theme === 'dark' ? 'border-purple-700' : 'border-purple-200'
//     },
//     orange: {
//       bg: theme === 'dark' ? 'bg-orange-900/20' : 'bg-orange-50',
//       text: theme === 'dark' ? 'text-orange-400' : 'text-orange-600',
//       border: theme === 'dark' ? 'border-orange-700' : 'border-orange-200'
//     },
//     red: {
//       bg: theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50',
//       text: theme === 'dark' ? 'text-red-400' : 'text-red-600',
//       border: theme === 'dark' ? 'border-red-700' : 'border-red-200'
//     }
//   };

//   const selectedColor = colorClasses[color] || colorClasses.blue;

//   return (
//     <div className={`p-4 rounded-xl border ${selectedColor.border} ${selectedColor.bg}`}>
//       <div className="flex items-center justify-between mb-2">
//         <div className="flex items-center gap-2">
//           <div className={`p-2 rounded-lg ${selectedColor.bg}`}>
//             <Icon className={`w-5 h-5 ${selectedColor.text}`} />
//           </div>
//           <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
//             {title}
//           </span>
//         </div>
        
//         {change && change !== 'neutral' && (
//           <div className={`flex items-center text-xs ${
//             change === 'positive' 
//               ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
//               : theme === 'dark' ? 'text-red-400' : 'text-red-600'
//           }`}>
//             {change === 'positive' ? (
//               <TrendingUp className="w-3 h-3 mr-1" />
//             ) : (
//               <TrendingDown className="w-3 h-3 mr-1" />
//             )}
//           </div>
//         )}
//       </div>
      
//       <div className={`text-2xl font-bold mb-1 ${selectedColor.text}`}>
//         {value}
//       </div>
      
//       {description && (
//         <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
//           {description}
//         </p>
//       )}
//     </div>
//   );
// };

// export default PricingConfiguration;







// PricingConfiguration.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, Percent, Tag, TrendingUp, TrendingDown,
  Calendar, Users, Package, Layers, Award, CheckCircle,
  ChevronDown, ChevronUp, Plus, Trash2, Edit, Calculator, X
} from 'lucide-react';
import { FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

// API Service
import api from "../../../api";

// Shared components and utilities
import { 
  getThemeClasses, 
  EmptyState,
  ConfirmationModal
} from "../Shared/components"
import { 
  formatNumber,
  deepClone,
  debounce,
  validatePrice,
  calculatePercentageChange,
  calculateTieredPrice,
  groupBy,
  filterByPriceRange
} from "../Shared/utils";

// Import formatDate directly from formatters
import { formatDate } from "../Shared/formatters";

// Pricing constants
const discountTypes = [
  { value: 'percentage', label: 'Percentage Discount', icon: Percent },
  { value: 'fixed', label: 'Fixed Amount', icon: DollarSign },
  { value: 'tiered', label: 'Tiered Pricing', icon: Layers },
  { value: 'volume', label: 'Volume Discount', icon: TrendingDown }
];

const appliesToOptions = [
  { value: 'plan', label: 'Specific Plan' },
  { value: 'category', label: 'Plan Category' },
  { value: 'all', label: 'All Plans' }
];

const ruleTypes = [
  { value: 'first_time', label: 'First Time Purchase', icon: CheckCircle },
  { value: 'loyalty', label: 'Loyalty Discount', icon: Award },
  { value: 'seasonal', label: 'Seasonal Promotion', icon: Calendar },
  { value: 'referral', label: 'Referral Bonus', icon: Users },
  { value: 'bulk', label: 'Bulk Purchase', icon: Package }
];

// Custom hooks
const usePriceCalculation = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationResult, setCalculationResult] = useState(null);

  const calculate = useCallback(async (planId, quantity = 1, discountCode = null, clientData = {}) => {
    setIsCalculating(true);
    try {
      const response = await api.post('/api/internet_plans/pricing/calculate/', {
        plan_id: planId,
        quantity,
        discount_code: discountCode,
        client_data: clientData
      });
      setCalculationResult(response.data);
      return response.data;
    } catch (error) {
      console.error('Price calculation error:', error);
      throw error;
    } finally {
      setIsCalculating(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setCalculationResult(null);
  }, []);

  return {
    isCalculating,
    calculationResult,
    calculate,
    clearResult
  };
};

const usePriceMatrixManagement = () => {
  const [priceMatrices, setPriceMatrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingMatrix, setEditingMatrix] = useState(null);

  const fetchPriceMatrices = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await api.get('/api/internet_plans/pricing/matrices/', { params });
      setPriceMatrices(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching price matrices:', error);
      toast.error('Failed to load price matrices');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPriceMatrix = useCallback(async (matrixData) => {
    try {
      const response = await api.post('/api/internet_plans/pricing/matrices/', matrixData);
      setPriceMatrices(prev => [response.data, ...prev]);
      return response.data;
    } catch (error) {
      console.error('Error creating price matrix:', error);
      throw error;
    }
  }, []);

  const updatePriceMatrix = useCallback(async (id, matrixData) => {
    try {
      const response = await api.put(`/api/internet_plans/pricing/matrices/${id}/`, matrixData);
      setPriceMatrices(prev => prev.map(m => m.id === id ? response.data : m));
      return response.data;
    } catch (error) {
      console.error('Error updating price matrix:', error);
      throw error;
    }
  }, []);

  const deletePriceMatrix = useCallback(async (id) => {
    try {
      await api.delete(`/api/internet_plans/pricing/matrices/${id}/`);
      setPriceMatrices(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting price matrix:', error);
      throw error;
    }
  }, []);

  return {
    priceMatrices,
    loading,
    editingMatrix,
    setEditingMatrix,
    fetchPriceMatrices,
    createPriceMatrix,
    updatePriceMatrix,
    deletePriceMatrix
  };
};

const useDiscountRuleManagement = () => {
  const [discountRules, setDiscountRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const fetchDiscountRules = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await api.get('/api/internet_plans/pricing/rules/', { params });
      setDiscountRules(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching discount rules:', error);
      toast.error('Failed to load discount rules');
    } finally {
      setLoading(false);
    }
  }, []);

  const createDiscountRule = useCallback(async (ruleData) => {
    try {
      const response = await api.post('/api/internet_plans/pricing/rules/', ruleData);
      setDiscountRules(prev => [response.data, ...prev]);
      return response.data;
    } catch (error) {
      console.error('Error creating discount rule:', error);
      throw error;
    }
  }, []);

  const updateDiscountRule = useCallback(async (id, ruleData) => {
    try {
      const response = await api.put(`/api/internet_plans/pricing/rules/${id}/`, ruleData);
      setDiscountRules(prev => prev.map(r => r.id === id ? response.data : r));
      return response.data;
    } catch (error) {
      console.error('Error updating discount rule:', error);
      throw error;
    }
  }, []);

  const deleteDiscountRule = useCallback(async (id) => {
    try {
      await api.delete(`/api/internet_plans/pricing/rules/${id}/`);
      setDiscountRules(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting discount rule:', error);
      throw error;
    }
  }, []);

  return {
    discountRules,
    loading,
    editingRule,
    setEditingRule,
    fetchDiscountRules,
    createDiscountRule,
    updateDiscountRule,
    deleteDiscountRule
  };
};

// Data structures for optimized pricing operations
class PricingDataStructure {
  constructor() {
    this.matrices = [];
    this.rules = [];
    this.indexes = {
      matricesByType: new Map(),
      matricesByPlan: new Map(),
      matricesByCategory: new Map(),
      rulesByType: new Map(),
      activeRules: new Set(),
      expiringSoon: new Set()
    };
  }

  addPriceMatrix(matrix) {
    this.matrices.push(matrix);
    this.updateMatrixIndexes(matrix);
  }

  updatePriceMatrix(matrix) {
    const index = this.matrices.findIndex(m => m.id === matrix.id);
    if (index !== -1) {
      // Remove old indexes
      this.removeMatrixFromIndexes(this.matrices[index]);
      
      // Update matrix
      this.matrices[index] = matrix;
      this.updateMatrixIndexes(matrix);
    }
  }

  removePriceMatrix(matrixId) {
    const index = this.matrices.findIndex(m => m.id === matrixId);
    if (index !== -1) {
      const matrix = this.matrices[index];
      this.removeMatrixFromIndexes(matrix);
      this.matrices.splice(index, 1);
    }
  }

  updateMatrixIndexes(matrix) {
    // Index by discount type
    if (!this.indexes.matricesByType.has(matrix.discount_type)) {
      this.indexes.matricesByType.set(matrix.discount_type, []);
    }
    this.indexes.matricesByType.get(matrix.discount_type).push(matrix);

    // Index by target plan
    if (matrix.applies_to === 'plan' && matrix.target_plan) {
      if (!this.indexes.matricesByPlan.has(matrix.target_plan)) {
        this.indexes.matricesByPlan.set(matrix.target_plan, []);
      }
      this.indexes.matricesByPlan.get(matrix.target_plan).push(matrix);
    }

    // Index by category
    if (matrix.applies_to === 'category' && matrix.target_category) {
      if (!this.indexes.matricesByCategory.has(matrix.target_category)) {
        this.indexes.matricesByCategory.set(matrix.target_category, []);
      }
      this.indexes.matricesByCategory.get(matrix.target_category).push(matrix);
    }

    // Track expiring matrices
    if (matrix.valid_to) {
      const expiresIn = new Date(matrix.valid_to) - new Date();
      if (expiresIn < 7 * 24 * 60 * 60 * 1000) { // 7 days
        this.indexes.expiringSoon.add(matrix.id);
      }
    }
  }

  removeMatrixFromIndexes(matrix) {
    // Remove from all indexes
    // Implementation similar to PlanDataStructure
  }

  // Similar methods for discount rules...
}

// Main PricingConfiguration Component
const PricingConfiguration = ({
  form,
  errors,
  theme,
  isMobile,
  priceMatrices: propPriceMatrices,
  discountRules: propDiscountRules,
  onChange,
  onCalculatePrice,
  priceCalculationResult
}) => {
  const themeClasses = getThemeClasses(theme);
  
  // Local state
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedMatrices, setExpandedMatrices] = useState(new Set());
  const [expandedRules, setExpandedRules] = useState(new Set());
  const [selectedMatrix, setSelectedMatrix] = useState(null);
  const [selectedRules, setSelectedRules] = useState([]);
  const [showMatrixForm, setShowMatrixForm] = useState(false);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [calculationQuantity, setCalculationQuantity] = useState(1);
  const [calculationDiscount, setCalculationDiscount] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: null, id: null });

  // Initialize with prop data or fetch if not provided
  const {
    priceMatrices: localMatrices,
    loading: matricesLoading,
    editingMatrix,
    setEditingMatrix,
    fetchPriceMatrices,
    createPriceMatrix,
    updatePriceMatrix,
    deletePriceMatrix
  } = usePriceMatrixManagement();

  const {
    discountRules: localRules,
    loading: rulesLoading,
    editingRule,
    setEditingRule,
    fetchDiscountRules,
    createDiscountRule,
    updateDiscountRule,
    deleteDiscountRule
  } = useDiscountRuleManagement();

  // Use prop data if provided, otherwise use local data
  const priceMatrices = propPriceMatrices || localMatrices;
  const discountRules = propDiscountRules || localRules;

  // Fetch data if props not provided
  useEffect(() => {
    if (!propPriceMatrices) {
      fetchPriceMatrices({ is_active: true });
    }
    if (!propDiscountRules) {
      fetchDiscountRules({ is_active: true });
    }
  }, [propPriceMatrices, propDiscountRules, fetchPriceMatrices, fetchDiscountRules]);

  // Form state for matrix
  const [matrixForm, setMatrixForm] = useState({
    name: '',
    description: '',
    discount_type: 'percentage',
    applies_to: 'plan',
    target_plan: null,
    target_category: '',
    percentage: 0,
    fixed_amount: 0,
    tier_config: [],
    min_quantity: 1,
    max_quantity: null,
    valid_from: new Date().toISOString().split('T')[0],
    valid_to: null,
    is_active: true
  });

  // Form state for rule
  const [ruleForm, setRuleForm] = useState({
    name: '',
    rule_type: 'first_time',
    description: '',
    price_matrix: null,
    eligibility_criteria: {},
    priority: 1,
    max_uses_per_client: null,
    total_usage_limit: null,
    is_active: true
  });

  // Optimized data structure
  const pricingData = useMemo(() => {
    const data = new PricingDataStructure();
    priceMatrices.forEach(matrix => data.addPriceMatrix(matrix));
    return data;
  }, [priceMatrices]);

  // Filter active and applicable matrices
  const applicableMatrices = useMemo(() => {
    const now = new Date();
    return priceMatrices.filter(matrix => {
      if (!matrix.is_active) return false;
      
      // Check validity dates
      if (matrix.valid_from && new Date(matrix.valid_from) > now) return false;
      if (matrix.valid_to && new Date(matrix.valid_to) < now) return false;
      
      // Check if applies to current plan
      if (matrix.applies_to === 'plan' && form.id && matrix.target_plan !== form.id) {
        return false;
      }
      
      // Check category match
      if (matrix.applies_to === 'category' && matrix.target_category !== form.category) {
        return false;
      }
      
      return true;
    });
  }, [priceMatrices, form.id, form.category]);

  // Calculate statistics
  const pricingStats = useMemo(() => {
    const stats = {
      totalMatrices: priceMatrices.length,
      activeMatrices: priceMatrices.filter(m => m.is_active).length,
      totalRules: discountRules.length,
      activeRules: discountRules.filter(r => r.is_active).length,
      averageDiscount: 0,
      totalSavings: 0
    };

    // Calculate average discount percentage
    const activeMatrices = priceMatrices.filter(m => m.is_active);
    if (activeMatrices.length > 0) {
      const totalPercentage = activeMatrices.reduce((sum, matrix) => {
        return sum + (matrix.percentage || 0);
      }, 0);
      stats.averageDiscount = totalPercentage / activeMatrices.length;
    }

    // Calculate total savings (estimated)
    stats.totalSavings = activeMatrices.reduce((sum, matrix) => {
      return sum + (matrix.total_discount_amount || 0);
    }, 0);

    return stats;
  }, [priceMatrices, discountRules]);

  // Handle matrix selection
  const handleMatrixSelect = useCallback((matrixId) => {
    if (selectedMatrix === matrixId) {
      setSelectedMatrix(null);
      onChange('pricing_matrix_id', null);
    } else {
      setSelectedMatrix(matrixId);
      onChange('pricing_matrix_id', matrixId);
      
      // Expand the selected matrix
      setExpandedMatrices(prev => new Set(prev).add(matrixId));
    }
  }, [selectedMatrix, onChange]);

  // Handle rule selection
  const handleRuleSelect = useCallback((ruleId) => {
    const newSelectedRules = selectedRules.includes(ruleId)
      ? selectedRules.filter(id => id !== ruleId)
      : [...selectedRules, ruleId];
    
    setSelectedRules(newSelectedRules);
    onChange('discount_rule_ids', newSelectedRules);
    
    // Expand the selected rule
    setExpandedRules(prev => new Set(prev).add(ruleId));
  }, [selectedRules, onChange]);

  // Toggle matrix expansion
  const toggleMatrixExpansion = useCallback((matrixId) => {
    setExpandedMatrices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(matrixId)) {
        newSet.delete(matrixId);
      } else {
        newSet.add(matrixId);
      }
      return newSet;
    });
  }, []);

  // Toggle rule expansion
  const toggleRuleExpansion = useCallback((ruleId) => {
    setExpandedRules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ruleId)) {
        newSet.delete(ruleId);
      } else {
        newSet.add(ruleId);
      }
      return newSet;
    });
  }, []);

  // Calculate price with current configuration
  const calculateCurrentPrice = useCallback(async () => {
    if (!form.id) {
      toast.error('Please save the plan first before calculating price');
      return;
    }

    setIsCalculating(true);
    try {
      const result = await api.post('/api/internet_plans/pricing/calculate/', {
        plan_id: form.id,
        quantity: calculationQuantity,
        discount_code: calculationDiscount || null,
        client_data: {}
      });
      
      if (onCalculatePrice) {
        onCalculatePrice(result);
      }
      
      toast.success('Price calculated successfully');
    } catch (error) {
      console.error('Price calculation error:', error);
      toast.error(error.response?.data?.error || 'Failed to calculate price');
    } finally {
      setIsCalculating(false);
    }
  }, [form.id, calculationQuantity, calculationDiscount, onCalculatePrice]);

  // Save matrix
  const saveMatrix = useCallback(async () => {
    try {
      if (editingMatrix) {
        await updatePriceMatrix(editingMatrix.id, matrixForm);
        toast.success('Price matrix updated successfully');
      } else {
        await createPriceMatrix(matrixForm);
        toast.success('Price matrix created successfully');
      }
      
      setShowMatrixForm(false);
      setEditingMatrix(null);
      setMatrixForm({
        name: '',
        description: '',
        discount_type: 'percentage',
        applies_to: 'plan',
        target_plan: null,
        target_category: '',
        percentage: 0,
        fixed_amount: 0,
        tier_config: [],
        min_quantity: 1,
        max_quantity: null,
        valid_from: new Date().toISOString().split('T')[0],
        valid_to: null,
        is_active: true
      });
    } catch (error) {
      console.error('Error saving price matrix:', error);
      toast.error(error.response?.data?.error || 'Failed to save price matrix');
    }
  }, [editingMatrix, matrixForm, createPriceMatrix, updatePriceMatrix]);

  // Save rule
  const saveRule = useCallback(async () => {
    try {
      if (editingRule) {
        await updateDiscountRule(editingRule.id, ruleForm);
        toast.success('Discount rule updated successfully');
      } else {
        await createDiscountRule(ruleForm);
        toast.success('Discount rule created successfully');
      }
      
      setShowRuleForm(false);
      setEditingRule(null);
      setRuleForm({
        name: '',
        rule_type: 'first_time',
        description: '',
        price_matrix: null,
        eligibility_criteria: {},
        priority: 1,
        max_uses_per_client: null,
        total_usage_limit: null,
        is_active: true
      });
    } catch (error) {
      console.error('Error saving discount rule:', error);
      toast.error(error.response?.data?.error || 'Failed to save discount rule');
    }
  }, [editingRule, ruleForm, createDiscountRule, updateDiscountRule]);

  // Delete confirmation
  const confirmDelete = useCallback((type, id, name) => {
    setDeleteConfirm({
      open: true,
      type,
      id,
      name
    });
  }, []);

  const handleDelete = useCallback(async () => {
    const { type, id } = deleteConfirm;
    
    try {
      if (type === 'matrix') {
        await deletePriceMatrix(id);
        toast.success('Price matrix deleted successfully');
      } else if (type === 'rule') {
        await deleteDiscountRule(id);
        toast.success('Discount rule deleted successfully');
      }
      
      // Remove from selections if deleted
      if (type === 'matrix' && selectedMatrix === id) {
        setSelectedMatrix(null);
        onChange('pricing_matrix_id', null);
      }
      if (type === 'rule' && selectedRules.includes(id)) {
        const newRules = selectedRules.filter(ruleId => ruleId !== id);
        setSelectedRules(newRules);
        onChange('discount_rule_ids', newRules);
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error(error.response?.data?.error || 'Failed to delete');
    } finally {
      setDeleteConfirm({ open: false, type: null, id: null, name: null });
    }
  }, [deleteConfirm, deletePriceMatrix, deleteDiscountRule, selectedMatrix, selectedRules, onChange]);

  // Format matrix details for display
  const getMatrixDetails = useCallback((matrix) => {
    const details = {
      type: matrix.discount_type,
      value: matrix.discount_type === 'percentage' 
        ? `${matrix.percentage}%`
        : `KES ${formatNumber(matrix.fixed_amount)}`,
      appliesTo: matrix.applies_to,
      target: matrix.applies_to === 'plan' 
        ? `Plan: ${matrix.target_plan?.name || 'N/A'}`
        : matrix.applies_to === 'category'
          ? `Category: ${matrix.target_category}`
          : 'All Plans',
      quantity: `Min: ${matrix.min_quantity}${matrix.max_quantity ? `, Max: ${matrix.max_quantity}` : ''}`,
      validity: matrix.valid_to 
        ? `Until ${formatDate(matrix.valid_to)}`
        : 'No expiration',
      usage: matrix.usage_count || 0,
      totalDiscount: matrix.total_discount_amount || 0
    };
    
    return details;
  }, []);

  // Format rule details for display
  const getRuleDetails = useCallback((rule) => {
    const details = {
      type: rule.rule_type,
      priority: rule.priority,
      matrix: rule.price_matrix?.name || 'N/A',
      eligibility: Object.keys(rule.eligibility_criteria || {}).length > 0
        ? `${Object.keys(rule.eligibility_criteria).length} criteria`
        : 'No criteria',
      usage: `${rule.current_usage || 0}/${rule.total_usage_limit || '∞'}`,
      status: rule.is_active ? 'Active' : 'Inactive'
    };
    
    return details;
  }, []);

  // Render matrix card
  const renderMatrixCard = useCallback((matrix) => {
    const isSelected = selectedMatrix === matrix.id;
    const isExpanded = expandedMatrices.has(matrix.id);
    const details = getMatrixDetails(matrix);
    
    return (
      <motion.div
        key={matrix.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`rounded-xl border transition-all duration-200 ${
          isSelected 
            ? theme === 'dark' 
              ? 'border-blue-500 bg-blue-900/20' 
              : 'border-blue-500 bg-blue-50'
            : theme === 'dark'
              ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
              : 'border-gray-200 bg-white hover:bg-gray-50'
        }`}
      >
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => toggleMatrixExpansion(matrix.id)}
                  className={`p-1 rounded-md ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                
                <div className="flex-1">
                  <h4 className={`font-semibold truncate ${themeClasses.text.primary}`}>
                    {matrix.name}
                  </h4>
                  <p className={`text-xs mt-1 truncate ${themeClasses.text.secondary}`}>
                    {matrix.description || 'No description'}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    matrix.is_active
                      ? theme === 'dark'
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-green-100 text-green-700'
                      : theme === 'dark'
                        ? 'bg-red-900/30 text-red-400'
                        : 'bg-red-100 text-red-700'
                  }`}>
                    {matrix.is_active ? 'Active' : 'Inactive'}
                  </span>
                  
                  <button
                    onClick={() => handleMatrixSelect(matrix.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      isSelected
                        ? theme === 'dark'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-500 text-white'
                        : theme === 'dark'
                          ? 'hover:bg-gray-700'
                          : 'hover:bg-gray-100'
                    }`}
                  >
                    {isSelected ? <CheckCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                <div className="space-y-1">
                  <span className={`text-xs ${themeClasses.text.secondary}`}>Type</span>
                  <div className={`text-sm font-medium flex items-center gap-1 ${
                    themeClasses.text.primary
                  }`}>
                    {discountTypes.find(t => t.value === details.type)?.icon && 
                      React.createElement(discountTypes.find(t => t.value === details.type).icon, {
                        className: "w-3 h-3"
                      })
                    }
                    {discountTypes.find(t => t.value === details.type)?.label || details.type}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <span className={`text-xs ${themeClasses.text.secondary}`}>Discount</span>
                  <div className={`text-sm font-bold ${
                    details.type === 'percentage' ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {details.value}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <span className={`text-xs ${themeClasses.text.secondary}`}>Applies To</span>
                  <div className={`text-sm ${themeClasses.text.primary}`}>
                    {details.target}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <span className={`text-xs ${themeClasses.text.secondary}`}>Usage</span>
                  <div className={`text-sm ${themeClasses.text.primary}`}>
                    {details.usage} times
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Expanded Details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className={`text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                      Configuration Details
                    </h5>
                    <div className="space-y-2">
                      <DetailRow label="Min Quantity" value={matrix.min_quantity} theme={theme} />
                      {matrix.max_quantity && (
                        <DetailRow label="Max Quantity" value={matrix.max_quantity} theme={theme} />
                      )}
                      <DetailRow label="Valid From" value={formatDate(matrix.valid_from)} theme={theme} />
                      {matrix.valid_to && (
                        <DetailRow label="Valid To" value={formatDate(matrix.valid_to)} theme={theme} />
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className={`text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                      Statistics
                    </h5>
                    <div className="space-y-2">
                      <DetailRow 
                        label="Total Discount Given" 
                        value={`KES ${formatNumber(matrix.total_discount_amount || 0)}`} 
                        theme={theme} 
                      />
                      <DetailRow 
                        label="Average Discount" 
                        value={`KES ${formatNumber(
                          matrix.total_discount_amount && matrix.usage_count
                            ? matrix.total_discount_amount / matrix.usage_count
                            : 0
                        )}`} 
                        theme={theme} 
                      />
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setEditingMatrix(matrix);
                      setMatrixForm(matrix);
                      setShowMatrixForm(true);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <Edit className="w-4 h-4 inline mr-2" />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => confirmDelete('matrix', matrix.id, matrix.name)}
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      theme === 'dark'
                        ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400'
                        : 'bg-red-100 hover:bg-red-200 text-red-700'
                    }`}
                  >
                    <Trash2 className="w-4 h-4 inline mr-2" />
                    Delete
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }, [theme, themeClasses, selectedMatrix, expandedMatrices, handleMatrixSelect, confirmDelete]);

  // Render rule card
  const renderRuleCard = useCallback((rule) => {
    const isSelected = selectedRules.includes(rule.id);
    const isExpanded = expandedRules.has(rule.id);
    const details = getRuleDetails(rule);
    
    return (
      <motion.div
        key={rule.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`rounded-xl border transition-all duration-200 ${
          isSelected 
            ? theme === 'dark' 
              ? 'border-green-500 bg-green-900/20' 
              : 'border-green-500 bg-green-50'
            : theme === 'dark'
              ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
              : 'border-gray-200 bg-white hover:bg-gray-50'
        }`}
      >
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => toggleRuleExpansion(rule.id)}
                  className={`p-1 rounded-md ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                
                <div className="flex-1">
                  <h4 className={`font-semibold truncate ${themeClasses.text.primary}`}>
                    {rule.name}
                  </h4>
                  <p className={`text-xs mt-1 truncate ${themeClasses.text.secondary}`}>
                    {rule.description || 'No description'}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    rule.is_active
                      ? theme === 'dark'
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-green-100 text-green-700'
                      : theme === 'dark'
                        ? 'bg-red-900/30 text-red-400'
                        : 'bg-red-100 text-red-700'
                  }`}>
                    {details.status}
                  </span>
                  
                  <button
                    onClick={() => handleRuleSelect(rule.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      isSelected
                        ? theme === 'dark'
                          ? 'bg-green-600 text-white'
                          : 'bg-green-500 text-white'
                        : theme === 'dark'
                          ? 'hover:bg-gray-700'
                          : 'hover:bg-gray-100'
                    }`}
                  >
                    {isSelected ? <CheckCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                <div className="space-y-1">
                  <span className={`text-xs ${themeClasses.text.secondary}`}>Type</span>
                  <div className={`text-sm font-medium flex items-center gap-1 ${
                    themeClasses.text.primary
                  }`}>
                    {ruleTypes.find(t => t.value === details.type)?.icon && 
                      React.createElement(ruleTypes.find(t => t.value === details.type).icon, {
                        className: "w-3 h-3"
                      })
                    }
                    {ruleTypes.find(t => t.value === details.type)?.label || details.type}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <span className={`text-xs ${themeClasses.text.secondary}`}>Priority</span>
                  <div className={`text-sm font-bold ${
                    theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                  }`}>
                    {details.priority}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <span className={`text-xs ${themeClasses.text.secondary}`}>Matrix</span>
                  <div className={`text-sm ${themeClasses.text.primary} truncate`}>
                    {details.matrix}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <span className={`text-xs ${themeClasses.text.secondary}`}>Usage</span>
                  <div className={`text-sm ${themeClasses.text.primary}`}>
                    {details.usage}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Expanded Details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className={`text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                      Rule Details
                    </h5>
                    <div className="space-y-2">
                      <DetailRow label="Rule Type" value={details.type} theme={theme} />
                      <DetailRow label="Eligibility Criteria" value={details.eligibility} theme={theme} />
                      <DetailRow label="Max Uses Per Client" value={rule.max_uses_per_client || 'Unlimited'} theme={theme} />
                    </div>
                  </div>
                  
                  <div>
                    <h5 className={`text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                      Associated Matrix
                    </h5>
                    {rule.price_matrix && (
                      <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                        <div className="font-medium">{rule.price_matrix.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {rule.price_matrix.description || 'No description'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setEditingRule(rule);
                      setRuleForm(rule);
                      setShowRuleForm(true);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <Edit className="w-4 h-4 inline mr-2" />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => confirmDelete('rule', rule.id, rule.name)}
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      theme === 'dark'
                        ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400'
                        : 'bg-red-100 hover:bg-red-200 text-red-700'
                    }`}
                  >
                    <Trash2 className="w-4 h-4 inline mr-2" />
                    Delete
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }, [theme, themeClasses, selectedRules, expandedRules, handleRuleSelect, confirmDelete]);

  // Detail row component
  const DetailRow = ({ label, value, theme }) => (
    <div className="flex justify-between items-center">
      <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
        {label}:
      </span>
      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
        {value}
      </span>
    </div>
  );

  // Responsive layout classes
  const getResponsiveClasses = () => ({
    container: isMobile 
      ? 'p-3 space-y-4' 
      : isMobile === false 
        ? 'p-6 space-y-6' 
        : 'p-4 space-y-5',
    gridCols: isMobile 
      ? 'grid-cols-1' 
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    buttonSize: isMobile 
      ? 'px-3 py-2 text-sm' 
      : 'px-4 py-3 text-base',
    header: isMobile 
      ? 'text-xl font-bold' 
      : 'text-2xl font-bold'
  });

  const responsiveClasses = getResponsiveClasses();

  return (
    <div className={`${responsiveClasses.container} ${themeClasses.bg.primary}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className={`${responsiveClasses.header} ${themeClasses.text.primary}`}>
            Pricing Configuration
          </h2>
          <p className={`mt-1 ${themeClasses.text.secondary}`}>
            Configure price matrices and discount rules for this plan
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowMatrixForm(true)}
            className={`${responsiveClasses.buttonSize} rounded-lg flex items-center gap-2 ${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Price Matrix</span>
          </button>
          
          <button
            onClick={() => setShowRuleForm(true)}
            className={`${responsiveClasses.buttonSize} rounded-lg flex items-center gap-2 ${
              theme === 'dark'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Discount Rule</span>
          </button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className={`grid ${responsiveClasses.gridCols} gap-4`}>
        <StatisticsCard
          title="Active Matrices"
          value={pricingStats.activeMatrices}
          icon={Layers}
          color="blue"
          theme={theme}
          change={pricingStats.activeMatrices > 0 ? 'positive' : 'neutral'}
          description="Price matrices currently active"
        />
        
        <StatisticsCard
          title="Active Rules"
          value={pricingStats.activeRules}
          icon={Award}
          color="green"
          theme={theme}
          change={pricingStats.activeRules > 0 ? 'positive' : 'neutral'}
          description="Discount rules currently active"
        />
        
        <StatisticsCard
          title="Average Discount"
          value={`${pricingStats.averageDiscount.toFixed(1)}%`}
          icon={Percent}
          color="purple"
          theme={theme}
          change={pricingStats.averageDiscount > 0 ? 'positive' : 'neutral'}
          description="Average discount percentage"
        />
        
        {!isMobile && (
          <>
            <StatisticsCard
              title="Total Savings"
              value={`KES ${formatNumber(pricingStats.totalSavings)}`}
              icon={DollarSign}
              color="green"
              theme={theme}
              change="positive"
              description="Total discount amount given"
            />
            
            <StatisticsCard
              title="Plan Price"
              value={`KES ${formatNumber(form.price || 0)}`}
              icon={Tag}
              color="orange"
              theme={theme}
              change="neutral"
              description="Base price of this plan"
            />
            
            <StatisticsCard
              title="Selected Rules"
              value={selectedRules.length}
              icon={Award}
              color="red"
              theme={theme}
              change={selectedRules.length > 0 ? 'positive' : 'neutral'}
              description="Discount rules applied"
            />
          </>
        )}
      </div>

      {/* Price Calculator */}
      <div className={`rounded-xl border ${themeClasses.border.light} ${themeClasses.bg.card} p-4 sm:p-6`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${themeClasses.text.primary}`}>
          <Calculator className="w-5 h-5" />
          Price Calculator
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
              Quantity
            </label>
            <input
              type="number"
              min="1"
              value={calculationQuantity}
              onChange={(e) => setCalculationQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className={`w-full px-3 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
              Discount Code (Optional)
            </label>
            <input
              type="text"
              value={calculationDiscount}
              onChange={(e) => setCalculationDiscount(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Enter discount code"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={calculateCurrentPrice}
              disabled={isCalculating || !form.id}
              className={`${responsiveClasses.buttonSize} rounded-lg flex items-center justify-center gap-2 w-full ${
                isCalculating || !form.id
                  ? 'bg-gray-400 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-indigo-500 hover:bg-indigo-600'
              } text-white`}
            >
              {isCalculating ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4" />
                  Calculate Price
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Calculation Result */}
        {priceCalculationResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20"
          >
            <h4 className={`text-lg font-semibold mb-3 ${themeClasses.text.primary}`}>
              Price Calculation Result
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className={`text-sm ${themeClasses.text.secondary}`}>Original Price</span>
                <div className={`text-xl font-bold ${themeClasses.text.primary}`}>
                  KES {formatNumber(priceCalculationResult.original_price)}
                </div>
              </div>
              
              <div>
                <span className={`text-sm ${themeClasses.text.secondary}`}>Discounted Price</span>
                <div className={`text-xl font-bold text-green-600`}>
                  KES {formatNumber(priceCalculationResult.discounted_price)}
                </div>
              </div>
              
              <div>
                <span className={`text-sm ${themeClasses.text.secondary}`}>Savings</span>
                <div className={`text-xl font-bold text-blue-600`}>
                  KES {formatNumber(priceCalculationResult.discount_amount)}
                </div>
              </div>
              
              <div>
                <span className={`text-sm ${themeClasses.text.secondary}`}>Discount</span>
                <div className={`text-xl font-bold text-purple-600`}>
                  {priceCalculationResult.discount_percentage}%
                </div>
              </div>
            </div>
            
            {priceCalculationResult.applied_discounts?.length > 0 && (
              <div className="mt-4">
                <span className={`text-sm ${themeClasses.text.secondary}`}>Applied Discounts:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {priceCalculationResult.applied_discounts.map((discount, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm"
                    >
                      {discount.name}: {discount.percentage}%
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Tabs for Matrices and Rules */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveSection('matrices')}
          className={`px-4 py-3 font-medium text-sm md:text-base ${
            activeSection === 'matrices'
              ? theme === 'dark'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-blue-600 border-b-2 border-blue-500'
              : themeClasses.text.secondary
          }`}
        >
          <Layers className="w-4 h-4 inline mr-2" />
          Price Matrices
        </button>
        
        <button
          onClick={() => setActiveSection('rules')}
          className={`px-4 py-3 font-medium text-sm md:text-base ${
            activeSection === 'rules'
              ? theme === 'dark'
                ? 'text-white border-b-2 border-green-500'
                : 'text-green-600 border-b-2 border-green-500'
              : themeClasses.text.secondary
          }`}
        >
          <Award className="w-4 h-4 inline mr-2" />
          Discount Rules
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {activeSection === 'matrices' ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
                Available Price Matrices
              </h3>
              <div className="text-sm">
                <span className={themeClasses.text.secondary}>
                  {applicableMatrices.length} matrices available
                </span>
              </div>
            </div>
            
            {matricesLoading ? (
              <div className="text-center py-12">
                <FaSpinner className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">Loading price matrices...</p>
              </div>
            ) : applicableMatrices.length === 0 ? (
              <EmptyState
                title="No Price Matrices Available"
                description="Create a price matrix to start applying discounts to this plan"
                icon={Layers}
                theme={theme}
                action={{
                  label: 'Create Price Matrix',
                  onClick: () => setShowMatrixForm(true)
                }}
              />
            ) : (
              <div className="space-y-3">
                {applicableMatrices.map(renderMatrixCard)}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
                Available Discount Rules
              </h3>
              <div className="text-sm">
                <span className={themeClasses.text.secondary}>
                  {discountRules.length} rules available
                </span>
              </div>
            </div>
            
            {rulesLoading ? (
              <div className="text-center py-12">
                <FaSpinner className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">Loading discount rules...</p>
              </div>
            ) : discountRules.length === 0 ? (
              <EmptyState
                title="No Discount Rules Available"
                description="Create a discount rule to apply business logic to discounts"
                icon={Award}
                theme={theme}
                action={{
                  label: 'Create Discount Rule',
                  onClick: () => setShowRuleForm(true)
                }}
              />
            ) : (
              <div className="space-y-3">
                {discountRules.map(renderRuleCard)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showMatrixForm && (
          <PriceMatrixFormModal
            form={matrixForm}
            editing={editingMatrix}
            onClose={() => {
              setShowMatrixForm(false);
              setEditingMatrix(null);
              setMatrixForm({
                name: '',
                description: '',
                discount_type: 'percentage',
                applies_to: 'plan',
                target_plan: null,
                target_category: '',
                percentage: 0,
                fixed_amount: 0,
                tier_config: [],
                min_quantity: 1,
                max_quantity: null,
                valid_from: new Date().toISOString().split('T')[0],
                valid_to: null,
                is_active: true
              });
            }}
            onSave={saveMatrix}
            theme={theme}
            isMobile={isMobile}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRuleForm && (
          <DiscountRuleFormModal
            form={ruleForm}
            editing={editingRule}
            priceMatrices={priceMatrices}
            onClose={() => {
              setShowRuleForm(false);
              setEditingRule(null);
              setRuleForm({
                name: '',
                rule_type: 'first_time',
                description: '',
                price_matrix: null,
                eligibility_criteria: {},
                priority: 1,
                max_uses_per_client: null,
                total_usage_limit: null,
                is_active: true
              });
            }}
            onSave={saveRule}
            theme={theme}
            isMobile={isMobile}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, type: null, id: null, name: null })}
        onConfirm={handleDelete}
        title={`Delete ${deleteConfirm.type === 'matrix' ? 'Price Matrix' : 'Discount Rule'}`}
        message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        theme={theme}
        isMobile={isMobile}
      />
    </div>
  );
};

// Price Matrix Form Modal Component
const PriceMatrixFormModal = ({ form, editing, onClose, onSave, theme, isMobile }) => {
  const themeClasses = getThemeClasses(theme);
  const [localForm, setLocalForm] = React.useState(form);
  const [errors, setErrors] = React.useState({});
  const [tierRows, setTierRows] = React.useState(form.tier_config || []);

  const handleChange = (field, value) => {
    setLocalForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!localForm.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (localForm.discount_type === 'percentage') {
      if (localForm.percentage < 0 || localForm.percentage > 100) {
        newErrors.percentage = 'Percentage must be between 0 and 100';
      }
    }
    
    if (localForm.discount_type === 'fixed') {
      if (localForm.fixed_amount < 0) {
        newErrors.fixed_amount = 'Fixed amount cannot be negative';
      }
    }
    
    if (localForm.discount_type === 'tiered' && tierRows.length === 0) {
      newErrors.tier_config = 'At least one tier is required for tiered pricing';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const finalForm = {
        ...localForm,
        tier_config: tierRows
      };
      onSave(finalForm);
    }
  };

  const addTierRow = () => {
    setTierRows([...tierRows, { min_qty: tierRows.length + 1, price: 0 }]);
  };

  const updateTierRow = (index, field, value) => {
    const newRows = [...tierRows];
    newRows[index][field] = value;
    setTierRows(newRows);
  };

  const removeTierRow = (index) => {
    setTierRows(tierRows.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-white'
        }`}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-bold ${themeClasses.text.primary}`}>
              {editing ? 'Edit Price Matrix' : 'Create Price Matrix'}
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${
                theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                Matrix Name *
              </label>
              <input
                type="text"
                value={localForm.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.name
                    ? 'border-red-500'
                    : theme === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-300'
                }`}
                placeholder="Enter matrix name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                Description
              </label>
              <textarea
                value={localForm.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows="2"
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-300'
                }`}
                placeholder="Enter description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                  Discount Type *
                </label>
                <select
                  value={localForm.discount_type}
                  onChange={(e) => handleChange('discount_type', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {discountTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                  Applies To *
                </label>
                <select
                  value={localForm.applies_to}
                  onChange={(e) => handleChange('applies_to', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {appliesToOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {localForm.discount_type === 'percentage' && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                  Percentage (%) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={localForm.percentage}
                  onChange={(e) => handleChange('percentage', parseFloat(e.target.value))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    errors.percentage
                      ? 'border-red-500'
                      : theme === 'dark'
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-300'
                  }`}
                />
                {errors.percentage && (
                  <p className="text-red-500 text-sm mt-1">{errors.percentage}</p>
                )}
              </div>
            )}

            {localForm.discount_type === 'fixed' && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                  Fixed Amount (KES) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={localForm.fixed_amount}
                  onChange={(e) => handleChange('fixed_amount', parseFloat(e.target.value))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    errors.fixed_amount
                      ? 'border-red-500'
                      : theme === 'dark'
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-300'
                  }`}
                />
                {errors.fixed_amount && (
                  <p className="text-red-500 text-sm mt-1">{errors.fixed_amount}</p>
                )}
              </div>
            )}

            {localForm.discount_type === 'tiered' && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>
                    Tier Configuration *
                  </label>
                  <button
                    type="button"
                    onClick={addTierRow}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add Tier
                  </button>
                </div>
                
                {errors.tier_config && (
                  <p className="text-red-500 text-sm mb-2">{errors.tier_config}</p>
                )}
                
                <div className="space-y-2">
                  {tierRows.map((tier, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={tier.min_qty}
                        onChange={(e) => updateTierRow(index, 'min_qty', parseInt(e.target.value))}
                        className="flex-1 px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-800"
                        placeholder="Min Quantity"
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={tier.price}
                        onChange={(e) => updateTierRow(index, 'price', parseFloat(e.target.value))}
                        className="flex-1 px-3 py-2 rounded-lg border bg-gray-50 dark:bg-gray-800"
                        placeholder="Price"
                      />
                      <button
                        type="button"
                        onClick={() => removeTierRow(index)}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                  Min Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={localForm.min_quantity}
                  onChange={(e) => handleChange('min_quantity', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                  Max Quantity (Optional)
                </label>
                <input
                  type="number"
                  min="1"
                  value={localForm.max_quantity || ''}
                  onChange={(e) => handleChange('max_quantity', e.target.value ? parseInt(e.target.value) : null)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                  Valid From
                </label>
                <input
                  type="date"
                  value={localForm.valid_from}
                  onChange={(e) => handleChange('valid_from', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                  Valid To (Optional)
                </label>
                <input
                  type="date"
                  value={localForm.valid_to || ''}
                  onChange={(e) => handleChange('valid_to', e.target.value || null)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={localForm.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="is_active" className={themeClasses.text.primary}>
                Active
              </label>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${
                theme === 'dark'
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className={`px-4 py-2 rounded-lg text-white ${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {editing ? 'Update Matrix' : 'Create Matrix'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Discount Rule Form Modal Component
const DiscountRuleFormModal = ({ form, editing, priceMatrices, onClose, onSave, theme, isMobile }) => {
  const themeClasses = getThemeClasses(theme);
  const [localForm, setLocalForm] = React.useState(form);
  const [errors, setErrors] = React.useState({});

  const handleChange = (field, value) => {
    setLocalForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!localForm.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!localForm.price_matrix) {
      newErrors.price_matrix = 'Price matrix is required';
    }
    
    if (localForm.priority < 1 || localForm.priority > 100) {
      newErrors.priority = 'Priority must be between 1 and 100';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(localForm);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-white'
        }`}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-bold ${themeClasses.text.primary}`}>
              {editing ? 'Edit Discount Rule' : 'Create Discount Rule'}
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${
                theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                Rule Name *
              </label>
              <input
                type="text"
                value={localForm.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.name
                    ? 'border-red-500'
                    : theme === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-300'
                }`}
                placeholder="Enter rule name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                Description
              </label>
              <textarea
                value={localForm.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows="2"
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-300'
                }`}
                placeholder="Enter description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                  Rule Type *
                </label>
                <select
                  value={localForm.rule_type}
                  onChange={(e) => handleChange('rule_type', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {ruleTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                  Priority *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={localForm.priority}
                  onChange={(e) => handleChange('priority', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    errors.priority
                      ? 'border-red-500'
                      : theme === 'dark'
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-300'
                  }`}
                />
                {errors.priority && (
                  <p className="text-red-500 text-sm mt-1">{errors.priority}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Higher priority rules are applied first
                </p>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                Price Matrix *
              </label>
              <select
                value={localForm.price_matrix}
                onChange={(e) => handleChange('price_matrix', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.price_matrix
                    ? 'border-red-500'
                    : theme === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="">Select a price matrix</option>
                {priceMatrices
                  .filter(m => m.is_active)
                  .map(matrix => (
                    <option key={matrix.id} value={matrix.id}>
                      {matrix.name}
                    </option>
                  ))
                }
              </select>
              {errors.price_matrix && (
                <p className="text-red-500 text-sm mt-1">{errors.price_matrix}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                  Max Uses Per Client (Optional)
                </label>
                <input
                  type="number"
                  min="1"
                  value={localForm.max_uses_per_client || ''}
                  onChange={(e) => handleChange('max_uses_per_client', e.target.value ? parseInt(e.target.value) : null)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-300'
                  }`}
                  placeholder="Unlimited if empty"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                  Total Usage Limit (Optional)
                </label>
                <input
                  type="number"
                  min="1"
                  value={localForm.total_usage_limit || ''}
                  onChange={(e) => handleChange('total_usage_limit', e.target.value ? parseInt(e.target.value) : null)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-300'
                  }`}
                  placeholder="Unlimited if empty"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={localForm.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="is_active" className={themeClasses.text.primary}>
                Active
              </label>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${
                theme === 'dark'
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className={`px-4 py-2 rounded-lg text-white ${
                theme === 'dark'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {editing ? 'Update Rule' : 'Create Rule'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Statistics Card Component
const StatisticsCard = ({ title, value, icon: Icon, color, theme, change, description }) => {
  const colorClasses = {
    blue: {
      bg: theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50',
      text: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
      border: theme === 'dark' ? 'border-blue-700' : 'border-blue-200'
    },
    green: {
      bg: theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50',
      text: theme === 'dark' ? 'text-green-400' : 'text-green-600',
      border: theme === 'dark' ? 'border-green-700' : 'border-green-200'
    },
    purple: {
      bg: theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50',
      text: theme === 'dark' ? 'text-purple-400' : 'text-purple-600',
      border: theme === 'dark' ? 'border-purple-700' : 'border-purple-200'
    },
    orange: {
      bg: theme === 'dark' ? 'bg-orange-900/20' : 'bg-orange-50',
      text: theme === 'dark' ? 'text-orange-400' : 'text-orange-600',
      border: theme === 'dark' ? 'border-orange-700' : 'border-orange-200'
    },
    red: {
      bg: theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50',
      text: theme === 'dark' ? 'text-red-400' : 'text-red-600',
      border: theme === 'dark' ? 'border-red-700' : 'border-red-200'
    }
  };

  const selectedColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`p-4 rounded-xl border ${selectedColor.border} ${selectedColor.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${selectedColor.bg}`}>
            <Icon className={`w-5 h-5 ${selectedColor.text}`} />
          </div>
          <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {title}
          </span>
        </div>
        
        {change && change !== 'neutral' && (
          <div className={`flex items-center text-xs ${
            change === 'positive' 
              ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
              : theme === 'dark' ? 'text-red-400' : 'text-red-600'
          }`}>
            {change === 'positive' ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
          </div>
        )}
      </div>
      
      <div className={`text-2xl font-bold mb-1 ${selectedColor.text}`}>
        {value}
      </div>
      
      {description && (
        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {description}
        </p>
      )}
    </div>
  );
};

export default PricingConfiguration;