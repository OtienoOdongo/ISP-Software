




// import { useState, useCallback, useEffect, useMemo } from "react";
// import { validatePrice, validateNumber } from '../../Shared/utils.js';
// import { formatCurrency } from '../../Shared/formatters.js';
// import { toast } from 'react-toastify';

// // Initial pricing state - MATCHES BACKEND PRICING MODELS EXACTLY
// export const getInitialPricingState = () => ({
//   // Basic pricing
//   price: "",
//   currency: "KES",
//   plan_type: "paid", // "paid", "free_trial", "promotional"
  
//   // Price Matrix selection - for backend integration
//   selected_price_matrix_id: null,
//   selected_price_matrix: null,
  
//   // Discount rules selection - for backend integration
//   selected_discount_rule_ids: [],
//   selected_discount_rules: [],
  
//   // Discount configuration - matches backend PriceMatrix.discount_type
//   discount_type: "none", // "percentage", "fixed", "tiered", "volume", "none"
//   discount_value: "", // For percentage or fixed
//   discount_matrix_id: null, // Reference to backend PriceMatrix
  
//   // Tiered pricing - matches backend tier_config structure EXACTLY
//   // Backend expects: [{"min_qty": 1, "price": 1000}, {"min_qty": 5, "price": 950}, ...]
//   tier_config: [
//     { min_qty: 1, price: "" },
//     { min_qty: 5, price: "" },
//     { min_qty: 10, price: "" }
//   ],
  
//   // Volume discounts - matches backend volume discount structure
//   volume_discounts: {
//     enabled: false,
//     tiers: [
//       { min_qty: 5, discount_percentage: 5 },
//       { min_qty: 10, discount_percentage: 10 },
//       { min_qty: 20, discount_percentage: 15 }
//     ]
//   },
  
//   // Promotional pricing - matches backend seasonal DiscountRule
//   promotional_pricing: {
//     enabled: false,
//     start_date: null, // ISO string for backend datetime field
//     end_date: null,   // ISO string for backend datetime field
//     original_price: "",
//     promotional_price: "",
//     rule_id: null     // Reference to backend DiscountRule
//   },
  
//   // Tax configuration
//   tax_inclusive: true,
//   tax_rate: 16, // Default 16% VAT for Kenya
  
//   // Currency conversion
//   currency_conversion: {
//     enabled: false,
//     base_currency: "KES",
//     conversion_rates: {
//       USD: 0.0067,
//       EUR: 0.0062,
//       GBP: 0.0053
//     }
//   },
  
//   // Calculation results cache
//   calculation_cache: {
//     last_calculation: null,
//     bulk_calculations: {}
//   }
// });

// /**
//  * Custom hook for managing pricing state and calculations
//  * Optimized for backend integration with proper data structures
//  */
// const usePricing = (initialState = getInitialPricingState()) => {
//   const [pricing, setPricing] = useState(initialState);
//   const [errors, setErrors] = useState({});
//   const [touched, setTouched] = useState({});
//   const [priceCalculations, setPriceCalculations] = useState({});
//   const [isCalculating, setIsCalculating] = useState(false);

//   // ==========================================================================
//   // HELPER FUNCTIONS
//   // ==========================================================================

//   /**
//    * Convert value to safe number
//    */
//   const toSafeNumber = (value, defaultValue = 0) => {
//     if (value === null || value === undefined || value === '') return defaultValue;
//     const num = Number(value);
//     return isNaN(num) ? defaultValue : num;
//   };

//   /**
//    * Format tier config for backend - ensures proper structure
//    */
//   const formatTierConfigForBackend = useCallback((tiers) => {
//     return tiers
//       .filter(tier => tier.price && tier.price.toString().trim() !== '')
//       .map(tier => ({
//         min_qty: toSafeNumber(tier.min_qty, 1),
//         price: toSafeNumber(tier.price, 0)
//       }))
//       .sort((a, b) => a.min_qty - b.min_qty);
//   }, []);

//   /**
//    * Format volume tiers for backend
//    */
//   const formatVolumeTiersForBackend = useCallback((tiers) => {
//     return tiers
//       .filter(tier => tier.discount_percentage && tier.discount_percentage > 0)
//       .map(tier => ({
//         min_qty: toSafeNumber(tier.min_qty, 1),
//         discount_percentage: toSafeNumber(tier.discount_percentage, 0)
//       }))
//       .sort((a, b) => a.min_qty - b.min_qty);
//   }, []);

//   /**
//    * Prepare pricing data for backend submission
//    * Matches backend PriceMatrix and DiscountRule structures
//    */
//   const prepareForBackend = useCallback(() => {
//     const basePrice = toSafeNumber(pricing.price, 0);
    
//     // Prepare price matrix data if needed
//     let priceMatrixData = null;
//     if (pricing.discount_type !== 'none' && pricing.discount_value) {
//       priceMatrixData = {
//         name: `${pricing.plan_type}_matrix_${Date.now()}`,
//         discount_type: pricing.discount_type,
//         percentage: pricing.discount_type === 'percentage' ? toSafeNumber(pricing.discount_value, 0) : 0,
//         fixed_amount: pricing.discount_type === 'fixed' ? toSafeNumber(pricing.discount_value, 0) : 0,
//         tier_config: pricing.discount_type === 'tiered' ? formatTierConfigForBackend(pricing.tier_config) : [],
//         min_quantity: 1,
//         is_active: true
//       };
//     }

//     // Prepare discount rule data if promotional pricing enabled
//     let discountRuleData = null;
//     if (pricing.promotional_pricing.enabled && pricing.promotional_pricing.promotional_price) {
//       discountRuleData = {
//         name: `promo_${pricing.plan_type}_${Date.now()}`,
//         rule_type: 'seasonal',
//         priority: 5,
//         eligibility_criteria: {},
//         is_active: true
//       };

//       // Add date range if provided
//       if (pricing.promotional_pricing.start_date) {
//         discountRuleData.eligibility_criteria.start_date = pricing.promotional_pricing.start_date;
//       }
//       if (pricing.promotional_pricing.end_date) {
//         discountRuleData.eligibility_criteria.end_date = pricing.promotional_pricing.end_date;
//       }
//     }

//     return {
//       price: basePrice,
//       plan_type: pricing.plan_type,
//       price_matrix_data: priceMatrixData,
//       discount_rule_data: discountRuleData,
//       selected_price_matrix_id: pricing.selected_price_matrix_id,
//       selected_discount_rule_ids: pricing.selected_discount_rule_ids
//     };
//   }, [pricing, formatTierConfigForBackend]);

//   // ==========================================================================
//   // FIELD CHANGE HANDLERS
//   // ==========================================================================

//   /**
//    * Handle basic field changes
//    */
//   const handleChange = useCallback((field, value) => {
//     setPricing(prev => ({ 
//       ...prev, 
//       [field]: value 
//     }));
    
//     // Clear error when user starts typing
//     if (errors[field]) {
//       setErrors(prev => ({ ...prev, [field]: '' }));
//     }
    
//     // Clear calculation cache on price change
//     if (field === 'price') {
//       setPriceCalculations({});
//     }
//   }, [errors]);

//   /**
//    * Handle nested field changes
//    */
//   const handleNestedChange = useCallback((parent, field, value) => {
//     setPricing(prev => ({ 
//       ...prev, 
//       [parent]: { 
//         ...prev[parent], 
//         [field]: value 
//       } 
//     }));
//   }, []);

//   /**
//    * Handle tier changes - matches backend tier_config structure
//    */
//   const handleTierChange = useCallback((index, field, value) => {
//     setPricing(prev => {
//       const newTiers = [...prev.tier_config];
//       newTiers[index] = { ...newTiers[index], [field]: value };
      
//       // Sort tiers by min_qty (matches backend expectation)
//       newTiers.sort((a, b) => (a.min_qty || 0) - (b.min_qty || 0));
      
//       return { ...prev, tier_config: newTiers };
//     });
//   }, []);

//   /**
//    * Add new tier
//    */
//   const addTier = useCallback(() => {
//     setPricing(prev => {
//       const lastTier = prev.tier_config[prev.tier_config.length - 1];
//       const newMinQty = lastTier ? (lastTier.min_qty || 0) + 5 : 1;
      
//       return {
//         ...prev,
//         tier_config: [
//           ...prev.tier_config,
//           { min_qty: newMinQty, price: "" }
//         ]
//       };
//     });
//   }, []);

//   /**
//    * Remove tier
//    */
//   const removeTier = useCallback((index) => {
//     setPricing(prev => {
//       const newTiers = [...prev.tier_config];
//       newTiers.splice(index, 1);
//       return { ...prev, tier_config: newTiers };
//     });
//   }, []);

//   /**
//    * Handle volume discount tier changes
//    */
//   const handleVolumeTierChange = useCallback((index, field, value) => {
//     setPricing(prev => {
//       const newTiers = [...prev.volume_discounts.tiers];
//       newTiers[index] = { ...newTiers[index], [field]: value };
      
//       // Sort tiers by min_qty
//       newTiers.sort((a, b) => (a.min_qty || 0) - (b.min_qty || 0));
      
//       return { 
//         ...prev, 
//         volume_discounts: { 
//           ...prev.volume_discounts, 
//           tiers: newTiers 
//         } 
//       };
//     });
//   }, []);

//   /**
//    * Add volume discount tier
//    */
//   const addVolumeTier = useCallback(() => {
//     setPricing(prev => {
//       const lastTier = prev.volume_discounts.tiers[prev.volume_discounts.tiers.length - 1];
//       const newMinQty = lastTier ? (lastTier.min_qty || 0) + 5 : 5;
//       const newDiscountPercentage = lastTier ? (lastTier.discount_percentage || 0) + 5 : 5;
      
//       return {
//         ...prev,
//         volume_discounts: {
//           ...prev.volume_discounts,
//           tiers: [
//             ...prev.volume_discounts.tiers,
//             { min_qty: newMinQty, discount_percentage: newDiscountPercentage }
//           ]
//         }
//       };
//     });
//   }, []);

//   /**
//    * Remove volume discount tier
//    */
//   const removeVolumeTier = useCallback((index) => {
//     setPricing(prev => {
//       const newTiers = [...prev.volume_discounts.tiers];
//       newTiers.splice(index, 1);
      
//       return { 
//         ...prev, 
//         volume_discounts: { 
//           ...prev.volume_discounts, 
//           tiers: newTiers 
//         } 
//       };
//     });
//   }, []);

//   /**
//    * Toggle volume discounts
//    */
//   const toggleVolumeDiscounts = useCallback((enabled) => {
//     setPricing(prev => ({
//       ...prev,
//       volume_discounts: {
//         ...prev.volume_discounts,
//         enabled
//       }
//     }));
//   }, []);

//   /**
//    * Toggle promotional pricing
//    */
//   const togglePromotionalPricing = useCallback((enabled) => {
//     setPricing(prev => ({
//       ...prev,
//       promotional_pricing: {
//         ...prev.promotional_pricing,
//         enabled,
//         // Set original price when enabling
//         original_price: enabled && !prev.promotional_pricing.original_price 
//           ? prev.price 
//           : prev.promotional_pricing.original_price
//       }
//     }));
//   }, []);

//   /**
//    * Handle promotional date changes - matches backend datetime format
//    */
//   const handlePromotionalDateChange = useCallback((field, dateString) => {
//     if (!dateString) {
//       handleNestedChange('promotional_pricing', field, null);
//       return;
//     }

//     try {
//       // Convert to ISO string for backend datetime fields
//       const date = new Date(dateString);
//       handleNestedChange('promotional_pricing', field, date.toISOString());
//     } catch (error) {
//       console.error('Error parsing date:', error);
//     }
//   }, [handleNestedChange]);

//   /**
//    * Handle price matrix selection
//    */
//   const handlePriceMatrixSelect = useCallback((matrixId, matrix) => {
//     setPricing(prev => ({
//       ...prev,
//       selected_price_matrix_id: matrixId,
//       selected_price_matrix: matrix,
//       discount_type: matrix?.discount_type || 'none',
//       discount_value: matrix?.percentage || matrix?.fixed_amount || '',
//       tier_config: matrix?.tier_config || prev.tier_config
//     }));
//   }, []);

//   /**
//    * Handle discount rule selection
//    */
//   const handleDiscountRuleSelect = useCallback((ruleIds, rules) => {
//     setPricing(prev => ({
//       ...prev,
//       selected_discount_rule_ids: ruleIds,
//       selected_discount_rules: rules
//     }));
//   }, []);

//   /**
//    * Handle field blur
//    */
//   const handleFieldBlur = useCallback((field) => {
//     if (!touched[field]) {
//       setTouched(prev => ({ ...prev, [field]: true }));
//     }
//   }, [touched]);

//   // ==========================================================================
//   // VALIDATION
//   // ==========================================================================

//   /**
//    * Validate a specific field
//    */
//   const validateField = useCallback((field, value) => {
//     let error = '';
    
//     switch (field) {
//       case 'price':
//         error = validatePrice(value, pricing.plan_type);
//         break;
//       case 'discount_value':
//         if (pricing.discount_type === 'percentage') {
//           error = validateNumber(value, 'Discount percentage', 0, 100);
//         } else if (pricing.discount_type === 'fixed') {
//           error = validateNumber(value, 'Discount amount', 0);
//         }
//         break;
//       default:
//         break;
//     }
    
//     if (error) {
//       setErrors(prev => ({ ...prev, [field]: error }));
//       return false;
//     }
    
//     // Clear error if validation passes
//     if (errors[field]) {
//       setErrors(prev => ({ ...prev, [field]: '' }));
//     }
    
//     return true;
//   }, [errors, pricing.plan_type, pricing.discount_type]);

//   /**
//    * Validate entire pricing configuration - matches backend validation
//    */
//   const validatePricing = useCallback(() => {
//     const newErrors = {};
    
//     // Validate base price
//     const priceError = validatePrice(pricing.price, pricing.plan_type);
//     if (priceError) {
//       newErrors.price = priceError;
//     }
    
//     // Validate discount value if discount is enabled
//     if (pricing.discount_type !== 'none' && pricing.discount_value) {
//       if (pricing.discount_type === 'percentage') {
//         const discountError = validateNumber(pricing.discount_value, 'Discount percentage', 0, 100);
//         if (discountError) newErrors.discount_value = discountError;
//       } else if (pricing.discount_type === 'fixed') {
//         const discountError = validateNumber(pricing.discount_value, 'Discount amount', 0);
//         if (discountError) newErrors.discount_value = discountError;
//       }
//     }
    
//     // Validate tiers - match backend tier_config validation
//     pricing.tier_config.forEach((tier, index) => {
//       if (tier.price) {
//         const priceError = validatePrice(tier.price, pricing.plan_type);
//         if (priceError) {
//           newErrors[`tier_${index}_price`] = priceError;
//         }
//       }
      
//       if (!tier.min_qty || tier.min_qty <= 0) {
//         newErrors[`tier_${index}_quantity`] = 'Minimum quantity must be greater than 0';
//       }
//     });
    
//     // Validate promotional pricing - matches backend seasonal rule validation
//     if (pricing.promotional_pricing.enabled) {
//       if (pricing.promotional_pricing.original_price) {
//         const priceError = validatePrice(
//           pricing.promotional_pricing.original_price, 
//           pricing.plan_type
//         );
//         if (priceError) newErrors.promotional_original_price = priceError;
//       }
      
//       if (pricing.promotional_pricing.promotional_price) {
//         const priceError = validatePrice(
//           pricing.promotional_pricing.promotional_price, 
//           pricing.plan_type
//         );
//         if (priceError) newErrors.promotional_price = priceError;
//       }
      
//       // Validate date range - matches backend validate_date_range
//       if (pricing.promotional_pricing.start_date && pricing.promotional_pricing.end_date) {
//         const startDate = new Date(pricing.promotional_pricing.start_date);
//         const endDate = new Date(pricing.promotional_pricing.end_date);
        
//         if (endDate <= startDate) {
//           newErrors.promotional_dates = 'End date must be after start date';
//         }
//       }
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   }, [pricing]);

//   // ==========================================================================
//   // PRICE CALCULATIONS - MATCHES BACKEND PRICINGSERVICE
//   // ==========================================================================

//   /**
//    * Calculate price for a given quantity - matches backend PricingService.calculate_effective_price
//    */
//   const calculatePriceForQuantity = useCallback((quantity = 1) => {
//     if (!pricing.price || isNaN(parseFloat(pricing.price))) {
//       return null;
//     }

//     const basePrice = parseFloat(pricing.price);
//     let finalPrice = basePrice * quantity;
    
//     // Apply tiered pricing - matches backend tier_config logic
//     if (pricing.discount_type === 'tiered' && pricing.tier_config.length > 0) {
//       // Sort tiers by min_qty descending to find applicable tier
//       const sortedTiers = [...pricing.tier_config]
//         .filter(tier => tier.price && tier.price.toString().trim() !== '')
//         .sort((a, b) => (b.min_qty || 0) - (a.min_qty || 0));
      
//       const applicableTier = sortedTiers.find(tier => (tier.min_qty || 0) <= quantity);
      
//       if (applicableTier && applicableTier.price) {
//         finalPrice = parseFloat(applicableTier.price) * quantity;
//       }
//     }
    
//     // Apply volume discounts - matches backend volume discount logic
//     if (pricing.volume_discounts.enabled && pricing.volume_discounts.tiers.length > 0) {
//       const sortedTiers = [...pricing.volume_discounts.tiers]
//         .filter(tier => tier.discount_percentage && tier.discount_percentage > 0)
//         .sort((a, b) => (b.min_qty || 0) - (a.min_qty || 0));
      
//       const applicableVolumeTier = sortedTiers.find(tier => (tier.min_qty || 0) <= quantity);
      
//       if (applicableVolumeTier) {
//         const discount = (applicableVolumeTier.discount_percentage / 100) * finalPrice;
//         finalPrice -= discount;
//       }
//     }
    
//     // Apply percentage discount - matches backend percentage discount
//     if (pricing.discount_type === 'percentage' && pricing.discount_value) {
//       const discountPercentage = parseFloat(pricing.discount_value) / 100;
//       finalPrice -= finalPrice * discountPercentage;
//     }
    
//     // Apply fixed discount - matches backend fixed amount discount
//     if (pricing.discount_type === 'fixed' && pricing.discount_value) {
//       const discountAmount = parseFloat(pricing.discount_value) * quantity;
//       finalPrice -= discountAmount;
//     }
    
//     // Apply promotional pricing - matches backend seasonal discount
//     if (pricing.promotional_pricing.enabled && 
//         pricing.promotional_pricing.promotional_price &&
//         isPromotionalPriceActive()) {
//       finalPrice = parseFloat(pricing.promotional_pricing.promotional_price) * quantity;
//     }
    
//     // Ensure price doesn't go below 0
//     if (finalPrice < 0) finalPrice = 0;
    
//     // Round to 2 decimal places
//     return Math.round(finalPrice * 100) / 100;
//   }, [pricing]);

//   /**
//    * Check if promotional price is currently active
//    */
//   const isPromotionalPriceActive = useCallback(() => {
//     if (!pricing.promotional_pricing.enabled) {
//       return false;
//     }
    
//     const now = new Date();
//     const startDate = pricing.promotional_pricing.start_date ? new Date(pricing.promotional_pricing.start_date) : null;
//     const endDate = pricing.promotional_pricing.end_date ? new Date(pricing.promotional_pricing.end_date) : null;
    
//     if (!startDate || !endDate) {
//       return true; // If no dates specified, always active
//     }
    
//     return now >= startDate && now <= endDate;
//   }, [pricing.promotional_pricing]);

//   /**
//    * Calculate bulk prices for multiple quantities
//    */
//   const calculateBulkPrices = useCallback((quantities = [1, 5, 10, 20, 50]) => {
//     if (!pricing.price) return [];

//     const results = quantities.map(quantity => {
//       const totalPrice = calculatePriceForQuantity(quantity);
//       const unitPrice = totalPrice ? totalPrice / quantity : 0;
//       const baseUnitPrice = parseFloat(pricing.price) || 0;
      
//       return {
//         quantity,
//         total_price: totalPrice,
//         unit_price: unitPrice,
//         discount_per_unit: baseUnitPrice - unitPrice,
//         discount_percentage: baseUnitPrice > 0 ? ((baseUnitPrice - unitPrice) / baseUnitPrice * 100) : 0,
//         savings: baseUnitPrice * quantity - totalPrice
//       };
//     });
    
//     setPriceCalculations(prev => ({ ...prev, bulk: results }));
//     return results;
//   }, [pricing.price, calculatePriceForQuantity]);

//   /**
//    * Calculate price breakdown for a specific quantity - matches backend calculate_final_price
//    */
//   const calculatePriceBreakdown = useCallback((quantity = 1) => {
//     const basePrice = parseFloat(pricing.price) || 0;
//     const totalBasePrice = basePrice * quantity;
//     const finalPrice = calculatePriceForQuantity(quantity);
    
//     if (!finalPrice) {
//       return null;
//     }
    
//     const breakdown = {
//       quantity,
//       base_price_per_unit: basePrice,
//       total_base_price: totalBasePrice,
//       final_price: finalPrice,
//       final_price_per_unit: finalPrice / quantity,
//       total_discount: totalBasePrice - finalPrice,
//       discount_percentage: totalBasePrice > 0 ? ((totalBasePrice - finalPrice) / totalBasePrice * 100) : 0,
//       savings_per_unit: (totalBasePrice - finalPrice) / quantity,
//       breakdown: []
//     };
    
//     // Add tax if applicable - matches backend tax calculation
//     if (pricing.tax_rate && pricing.tax_rate > 0) {
//       const taxAmount = finalPrice * (pricing.tax_rate / 100);
//       breakdown.tax_rate = pricing.tax_rate;
//       breakdown.tax_amount = taxAmount;
//       breakdown.total_with_tax = finalPrice + taxAmount;
//       breakdown.tax_per_unit = taxAmount / quantity;
//     }
    
//     // Add applied discounts breakdown
//     const appliedDiscounts = [];
    
//     if (pricing.discount_type === 'tiered' && pricing.tier_config.length > 0) {
//       appliedDiscounts.push({
//         type: 'tiered',
//         description: 'Tiered pricing applied'
//       });
//     }
    
//     if (pricing.volume_discounts.enabled && pricing.volume_discounts.tiers.length > 0) {
//       appliedDiscounts.push({
//         type: 'volume',
//         description: 'Volume discount applied'
//       });
//     }
    
//     if (pricing.discount_type === 'percentage' && pricing.discount_value) {
//       appliedDiscounts.push({
//         type: 'percentage',
//         value: pricing.discount_value,
//         description: `${pricing.discount_value}% discount applied`
//       });
//     }
    
//     if (pricing.discount_type === 'fixed' && pricing.discount_value) {
//       appliedDiscounts.push({
//         type: 'fixed',
//         value: pricing.discount_value,
//         description: `KES ${pricing.discount_value} fixed discount applied`
//       });
//     }
    
//     if (pricing.promotional_pricing.enabled && isPromotionalPriceActive()) {
//       appliedDiscounts.push({
//         type: 'promotional',
//         description: 'Promotional pricing active'
//       });
//     }
    
//     breakdown.applied_discounts = appliedDiscounts;
    
//     // Cache the calculation
//     setPriceCalculations(prev => ({ 
//       ...prev, 
//       last_calculation: breakdown 
//     }));
    
//     return breakdown;
//   }, [pricing, calculatePriceForQuantity, isPromotionalPriceActive]);

//   /**
//    * Convert price to different currencies
//    */
//   const convertCurrency = useCallback((amount, targetCurrency = "USD") => {
//     if (!amount || !pricing.currency_conversion.enabled) {
//       return amount;
//     }
    
//     const conversionRate = pricing.currency_conversion.conversion_rates[targetCurrency];
//     if (!conversionRate) {
//       return amount;
//     }
    
//     return amount * conversionRate;
//   }, [pricing.currency_conversion]);

//   // ==========================================================================
//   // BACKEND INTEGRATION
//   // ==========================================================================

//   /**
//    * Load price matrix from backend
//    */
//   const loadPriceMatrix = useCallback((matrix) => {
//     if (!matrix) return;
    
//     setPricing(prev => ({
//       ...prev,
//       selected_price_matrix_id: matrix.id,
//       selected_price_matrix: matrix,
//       discount_type: matrix.discount_type,
//       discount_value: matrix.percentage || matrix.fixed_amount || '',
//       tier_config: matrix.tier_config || prev.tier_config
//     }));
//   }, []);

//   /**
//    * Load discount rules from backend
//    */
//   const loadDiscountRules = useCallback((rules) => {
//     if (!rules || !Array.isArray(rules)) return;
    
//     setPricing(prev => ({
//       ...prev,
//       selected_discount_rule_ids: rules.map(r => r.id),
//       selected_discount_rules: rules
//     }));
//   }, []);

//   /**
//    * Load pricing data from backend plan
//    */
//   const loadPricing = useCallback((data) => {
//     if (!data) {
//       resetPricing();
//       return;
//     }

//     setPricing({
//       ...getInitialPricingState(),
//       price: data.price || "",
//       plan_type: data.plan_type || "paid",
//       selected_price_matrix_id: data.price_matrix_id || null,
//       selected_price_matrix: data.price_matrix || null,
//       ...data
//     });
    
//     setErrors({});
//     setTouched({});
//     setPriceCalculations({});
//   }, []);

//   /**
//    * Reset pricing to initial state
//    */
//   const resetPricing = useCallback(() => {
//     setPricing(getInitialPricingState());
//     setErrors({});
//     setTouched({});
//     setPriceCalculations({});
//   }, []);

//   /**
//    * Calculate price using backend API
//    */
//   const calculateWithBackend = useCallback(async (planId, quantity = 1, discountCode = null) => {
//     if (!planId) {
//       toast.error('Plan ID is required for backend calculation');
//       return null;
//     }

//     setIsCalculating(true);
    
//     try {
//       // This would be replaced with actual API call
//       // const result = await PlanApiService.calculatePrice(planId, quantity, discountCode);
      
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 800));
      
//       const localResult = calculatePriceBreakdown(quantity);
      
//       setPriceCalculations(prev => ({
//         ...prev,
//         last_backend_calculation: localResult,
//         timestamp: new Date().toISOString()
//       }));
      
//       return localResult;
//     } catch (error) {
//       console.error('Backend price calculation failed:', error);
//       toast.error('Failed to calculate price with backend');
//       return null;
//     } finally {
//       setIsCalculating(false);
//     }
//   }, [calculatePriceBreakdown]);

//   // ==========================================================================
//   // MEMOIZED VALUES
//   // ==========================================================================

//   /**
//    * Get formatted tier config for display
//    */
//   const formattedTiers = useMemo(() => {
//     return pricing.tier_config
//       .filter(tier => tier.price && tier.price.toString().trim() !== '')
//       .map(tier => ({
//         min_qty: tier.min_qty,
//         price: toSafeNumber(tier.price, 0),
//         price_formatted: formatCurrency(tier.price, pricing.currency)
//       }));
//   }, [pricing.tier_config, pricing.currency]);

//   /**
//    * Check if form is valid
//    */
//   const isFormValid = useMemo(() => {
//     return validatePricing();
//   }, [validatePricing]);

//   /**
//    * Get price summary
//    */
//   const priceSummary = useMemo(() => {
//     if (!pricing.price) return null;
    
//     return {
//       base_price: toSafeNumber(pricing.price, 0),
//       base_price_formatted: formatCurrency(pricing.price, pricing.currency),
//       has_discount: pricing.discount_type !== 'none' && pricing.discount_value,
//       discount_type: pricing.discount_type,
//       discount_value: pricing.discount_value,
//       promotional_active: isPromotionalPriceActive()
//     };
//   }, [pricing, isPromotionalPriceActive]);

//   // ==========================================================================
//   // EFFECTS
//   // ==========================================================================

//   // Validate when pricing changes
//   useEffect(() => {
//     if (pricing.price) {
//       validatePricing();
//     }
//   }, [pricing, validatePricing]);

//   // Auto-calculate when quantity changes if price exists
//   useEffect(() => {
//     if (pricing.price && priceCalculations.last_calculation) {
//       // Re-calculate if needed
//     }
//   }, [pricing.price, priceCalculations.last_calculation]);

//   // ==========================================================================
//   // RETURN
//   // ==========================================================================

//   return {
//     // State
//     pricing,
//     setPricing: loadPricing,
//     errors,
//     touched,
//     priceCalculations,
//     isCalculating,
    
//     // Basic handlers
//     handleChange,
//     handleNestedChange,
//     handleFieldBlur,
    
//     // Tier handlers
//     handleTierChange,
//     addTier,
//     removeTier,
//     formattedTiers,
    
//     // Volume discount handlers
//     handleVolumeTierChange,
//     addVolumeTier,
//     removeVolumeTier,
//     toggleVolumeDiscounts,
    
//     // Promotional handlers
//     togglePromotionalPricing,
//     handlePromotionalDateChange,
//     isPromotionalPriceActive,
    
//     // Price matrix handlers
//     handlePriceMatrixSelect,
//     loadPriceMatrix,
    
//     // Discount rule handlers
//     handleDiscountRuleSelect,
//     loadDiscountRules,
    
//     // Validation
//     validateField,
//     validatePricing,
//     isFormValid,
    
//     // Price calculations
//     calculatePriceForQuantity,
//     calculateBulkPrices,
//     calculatePriceBreakdown,
//     calculateWithBackend,
    
//     // Currency conversion
//     convertCurrency,
    
//     // Backend preparation
//     prepareForBackend,
    
//     // Utility
//     priceSummary,
//     resetPricing,
//     formatCurrency
//   };
// };

// export default usePricing;








import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { toast } from 'react-toastify';

// Import formatters
import {
  formatCurrency as formatCurrencyUtil,
  formatNumber as formatNumberUtil
} from '../../Shared/formatters';

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

const validatePrice = (price, planType = 'paid') => {
  const numPrice = parseFloat(price);
  if (!price || price === '') return 'Price is required';
  if (isNaN(numPrice)) return 'Price must be a valid number';
  if (numPrice < 0) return 'Price must be positive';
  if (planType === 'paid' && numPrice <= 0) return 'Paid plans require a price greater than 0';
  return '';
};

const validateNumber = (value, field, min = 0, max = null) => {
  const num = parseFloat(value);
  if (!value && value !== 0) return `${field} is required`;
  if (isNaN(num)) return `${field} must be a valid number`;
  if (num < min) return `${field} must be at least ${min}`;
  if (max !== null && num > max) return `${field} must be at most ${max}`;
  return '';
};

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_CONVERSION_RATES = {
  KES: 1,
  USD: 0.0067,
  EUR: 0.0062,
  GBP: 0.0053,
  UGX: 24.5,
  TZS: 15.6,
  RWF: 7.2
};

// ============================================================================
// INITIAL STATE
// ============================================================================

export const getInitialPricingState = (overrides = {}) => ({
  // Basic pricing
  price: "",
  currency: "KES",
  plan_type: "paid", // "paid", "free_trial", "promotional"
  
  // Direct discount
  discount_type: "none", // "percentage", "fixed", "none"
  discount_value: "",
  
  // Tiered pricing
  tier_config: [
    { min_qty: 1, price: "" },
    { min_qty: 5, price: "" },
    { min_qty: 10, price: "" }
  ],
  
  // Volume discounts
  volume_discounts: {
    enabled: false,
    tiers: [
      { min_qty: 5, discount_percentage: 5 },
      { min_qty: 10, discount_percentage: 10 },
      { min_qty: 20, discount_percentage: 15 }
    ]
  },
  
  // Promotional pricing
  promotional_pricing: {
    enabled: false,
    start_date: null,
    end_date: null,
    original_price: "",
    promotional_price: ""
  },
  
  // Tax configuration
  tax_inclusive: true,
  tax_rate: 16, // Kenya VAT
  
  // Currency conversion
  currency_conversion: {
    enabled: false,
    base_currency: "KES",
    conversion_rates: DEFAULT_CONVERSION_RATES
  },
  
  ...overrides
});

// ============================================================================
// MAIN HOOK
// ============================================================================

const usePricing = (initialState = {}) => {
  // Merge initial state with defaults
  const [pricing, setPricing] = useState(() => ({
    ...getInitialPricingState(),
    ...initialState
  }));
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [priceCalculations, setPriceCalculations] = useState({
    last_calculation: null,
    bulk_calculations: {}
  });
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Use ref to track mounted state for async operations
  const isMounted = useRef(true);
  
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ==========================================================================
  // HELPER FUNCTIONS
  // ==========================================================================

  const toSafeNumber = (value, defaultValue = 0) => {
    if (value === null || value === undefined || value === '') return defaultValue;
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  };

  const formatTiersForBackend = (tiers) => {
    return tiers
      .filter(tier => tier.price && tier.price.toString().trim() !== '')
      .map(tier => ({
        min_qty: toSafeNumber(tier.min_qty, 1),
        price: toSafeNumber(tier.price, 0)
      }))
      .sort((a, b) => a.min_qty - b.min_qty);
  };

  const formatVolumeTiersForBackend = (tiers) => {
    return tiers
      .filter(tier => tier.discount_percentage && tier.discount_percentage > 0)
      .map(tier => ({
        min_qty: toSafeNumber(tier.min_qty, 1),
        discount_percentage: toSafeNumber(tier.discount_percentage, 0)
      }))
      .sort((a, b) => a.min_qty - b.min_qty);
  };

  // ==========================================================================
  // CURRENCY FORMATTING (WRAPPER FOR IMPORTED FORMATTER)
  // ==========================================================================

  const formatCurrency = useCallback((amount, includeSymbol = true, decimals = 2) => {
    return formatCurrencyUtil(amount, includeSymbol, decimals);
  }, []);

  const formatNumber = useCallback((num, decimals = 0) => {
    return formatNumberUtil(num, decimals);
  }, []);

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  const validateField = useCallback((field, value, fullPricing = pricing) => {
    let error = '';
    
    switch (field) {
      case 'price':
        error = validatePrice(value, fullPricing.plan_type);
        break;
        
      case 'discount_value':
        if (fullPricing.discount_type === 'percentage') {
          error = validateNumber(value, 'Discount percentage', 0, 100);
        } else if (fullPricing.discount_type === 'fixed') {
          error = validateNumber(value, 'Discount amount', 0);
        }
        break;
        
      case 'promotional_original_price':
        error = validatePrice(value, fullPricing.plan_type);
        break;
        
      case 'promotional_price':
        error = validatePrice(value, fullPricing.plan_type);
        break;
        
      default:
        break;
    }
    
    return error;
  }, [pricing]);

  const validatePricing = useCallback(() => {
    const newErrors = {};
    
    // Basic price validation
    if (!pricing.price || pricing.price === '') {
      newErrors.price = 'Price is required';
    } else {
      const priceError = validatePrice(pricing.price, pricing.plan_type);
      if (priceError) newErrors.price = priceError;
    }
    
    // Discount validation
    if (pricing.discount_type !== 'none' && pricing.discount_value) {
      const discountError = validateField('discount_value', pricing.discount_value, pricing);
      if (discountError) newErrors.discount_value = discountError;
    }
    
    // Tier validation - check for gaps and overlaps
    const validTiers = pricing.tier_config.filter(t => t.price && t.price.toString().trim() !== '');
    if (validTiers.length > 0) {
      const sortedTiers = [...validTiers].sort((a, b) => a.min_qty - b.min_qty);
      
      // Check min quantities are positive
      sortedTiers.forEach((tier, index) => {
        if (tier.min_qty <= 0) {
          newErrors[`tier_${index}_quantity`] = 'Minimum quantity must be > 0';
        }
      });
      
      // Check for gaps (tiers should start at 1 and be continuous)
      if (sortedTiers[0].min_qty !== 1) {
        newErrors.tiers = 'Tiered pricing should start at quantity 1';
      }
      
      for (let i = 0; i < sortedTiers.length - 1; i++) {
        if (sortedTiers[i].min_qty >= sortedTiers[i + 1].min_qty) {
          newErrors.tiers = 'Tiers must have increasing minimum quantities';
          break;
        }
      }
    }
    
    // Volume discount validation
    if (pricing.volume_discounts.enabled) {
      const volumeTiers = pricing.volume_discounts.tiers.filter(t => t.discount_percentage > 0);
      
      if (volumeTiers.length > 0) {
        const sortedVolume = [...volumeTiers].sort((a, b) => a.min_qty - b.min_qty);
        
        // Check discount percentages are valid
        sortedVolume.forEach((tier, index) => {
          if (tier.discount_percentage <= 0 || tier.discount_percentage > 100) {
            newErrors[`volume_tier_${index}`] = 'Discount must be between 0 and 100%';
          }
        });
        
        // Check for increasing discounts
        for (let i = 0; i < sortedVolume.length - 1; i++) {
          if (sortedVolume[i].discount_percentage >= sortedVolume[i + 1].discount_percentage) {
            newErrors.volume_tiers = 'Volume discounts should increase with quantity';
            break;
          }
        }
      }
    }
    
    // Promotional pricing validation
    if (pricing.promotional_pricing.enabled) {
      if (!pricing.promotional_pricing.promotional_price) {
        newErrors.promotional_price = 'Promotional price is required';
      } else {
        const promoPrice = parseFloat(pricing.promotional_pricing.promotional_price);
        const originalPrice = parseFloat(pricing.promotional_pricing.original_price || pricing.price);
        
        if (promoPrice >= originalPrice) {
          newErrors.promotional_price = 'Promotional price must be less than original price';
        }
      }
      
      // Date validation
      if (pricing.promotional_pricing.start_date && pricing.promotional_pricing.end_date) {
        const start = new Date(pricing.promotional_pricing.start_date);
        const end = new Date(pricing.promotional_pricing.end_date);
        
        if (end <= start) {
          newErrors.promotional_dates = 'End date must be after start date';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [pricing, validateField]);

  // ==========================================================================
  // PRICE CALCULATIONS
  // ==========================================================================

  const calculatePriceForQuantity = useCallback((quantity = 1) => {
    if (!pricing.price || pricing.price === '') return null;
    
    try {
      const basePrice = parseFloat(pricing.price);
      if (isNaN(basePrice) || basePrice < 0) return null;
      
      let finalPrice = basePrice * quantity;
      
      // Apply tiered pricing
      if (pricing.tier_config.length > 0) {
        const validTiers = pricing.tier_config
          .filter(t => t.price && t.price.toString().trim() !== '')
          .map(t => ({
            min_qty: toSafeNumber(t.min_qty, 1),
            price: toSafeNumber(t.price, 0)
          }))
          .sort((a, b) => b.min_qty - a.min_qty); // Sort descending for lookup
        
        const applicableTier = validTiers.find(tier => tier.min_qty <= quantity);
        if (applicableTier) {
          finalPrice = applicableTier.price * quantity;
        }
      }
      
      // Apply volume discounts
      if (pricing.volume_discounts.enabled && pricing.volume_discounts.tiers.length > 0) {
        const validVolumeTiers = pricing.volume_discounts.tiers
          .filter(t => t.discount_percentage && t.discount_percentage > 0)
          .map(t => ({
            min_qty: toSafeNumber(t.min_qty, 1),
            discount_percentage: toSafeNumber(t.discount_percentage, 0)
          }))
          .sort((a, b) => b.min_qty - a.min_qty);
        
        const applicableVolume = validVolumeTiers.find(tier => tier.min_qty <= quantity);
        if (applicableVolume) {
          const discount = (applicableVolume.discount_percentage / 100) * finalPrice;
          finalPrice -= discount;
        }
      }
      
      // Apply percentage discount
      if (pricing.discount_type === 'percentage' && pricing.discount_value) {
        const discountPercent = parseFloat(pricing.discount_value) / 100;
        finalPrice -= finalPrice * discountPercent;
      }
      
      // Apply fixed discount
      if (pricing.discount_type === 'fixed' && pricing.discount_value) {
        const discountAmount = parseFloat(pricing.discount_value) * quantity;
        finalPrice -= discountAmount;
      }
      
      // Apply promotional pricing
      if (pricing.promotional_pricing.enabled && pricing.promotional_pricing.promotional_price) {
        const now = new Date();
        const start = pricing.promotional_pricing.start_date ? new Date(pricing.promotional_pricing.start_date) : null;
        const end = pricing.promotional_pricing.end_date ? new Date(pricing.promotional_pricing.end_date) : null;
        
        const isActive = (!start || now >= start) && (!end || now <= end);
        
        if (isActive) {
          const promoPrice = parseFloat(pricing.promotional_pricing.promotional_price);
          if (!isNaN(promoPrice)) {
            finalPrice = promoPrice * quantity;
          }
        }
      }
      
      // Ensure price doesn't go negative
      return Math.max(0, Math.round(finalPrice * 100) / 100);
      
    } catch (error) {
      console.error('Error calculating price:', error);
      return null;
    }
  }, [pricing]);

  const calculatePriceBreakdown = useCallback((quantity = 1) => {
    const basePrice = parseFloat(pricing.price) || 0;
    const finalPrice = calculatePriceForQuantity(quantity);
    
    if (finalPrice === null) return null;
    
    const totalBasePrice = basePrice * quantity;
    const totalDiscount = totalBasePrice - finalPrice;
    const discountPercentage = totalBasePrice > 0 ? (totalDiscount / totalBasePrice) * 100 : 0;
    
    const breakdown = {
      quantity,
      base_price_per_unit: basePrice,
      total_base_price: totalBasePrice,
      final_price: finalPrice,
      final_price_per_unit: finalPrice / quantity,
      total_discount: totalDiscount,
      discount_percentage: discountPercentage,
      savings_per_unit: totalDiscount / quantity,
      currency: pricing.currency,
      applied_discounts: []
    };
    
    // Track applied discounts for display
    if (pricing.discount_type !== 'none' && pricing.discount_value) {
      breakdown.applied_discounts.push({
        type: pricing.discount_type,
        value: pricing.discount_value,
        description: pricing.discount_type === 'percentage' 
          ? `${pricing.discount_value}% discount` 
          : `KES ${pricing.discount_value} fixed discount`
      });
    }
    
    if (pricing.volume_discounts.enabled && pricing.volume_discounts.tiers.length > 0) {
      breakdown.applied_discounts.push({
        type: 'volume',
        description: 'Volume discount applied'
      });
    }
    
    if (pricing.tier_config.some(t => t.price && t.price.toString().trim() !== '')) {
      breakdown.applied_discounts.push({
        type: 'tiered',
        description: 'Tiered pricing applied'
      });
    }
    
    if (pricing.promotional_pricing.enabled && pricing.promotional_pricing.promotional_price) {
      breakdown.applied_discounts.push({
        type: 'promotional',
        description: 'Promotional pricing active'
      });
    }
    
    // Tax calculation
    if (pricing.tax_rate && pricing.tax_rate > 0) {
      const taxAmount = finalPrice * (pricing.tax_rate / 100);
      breakdown.tax_rate = pricing.tax_rate;
      breakdown.tax_amount = taxAmount;
      breakdown.total_with_tax = finalPrice + taxAmount;
      breakdown.tax_per_unit = taxAmount / quantity;
    }
    
    // Update calculations state if mounted
    if (isMounted.current) {
      setPriceCalculations(prev => ({
        ...prev,
        last_calculation: breakdown
      }));
    }
    
    return breakdown;
  }, [pricing, calculatePriceForQuantity]);

  const calculateBulkPrices = useCallback((quantities = [1, 5, 10, 20, 50]) => {
    if (!pricing.price) return [];
    
    const basePrice = parseFloat(pricing.price) || 0;
    const results = quantities.map(quantity => {
      const totalPrice = calculatePriceForQuantity(quantity) || 0;
      const unitPrice = totalPrice / quantity;
      const discountPerUnit = basePrice - unitPrice;
      const discountPercentage = basePrice > 0 ? (discountPerUnit / basePrice) * 100 : 0;
      const savings = (basePrice * quantity) - totalPrice;
      
      return {
        quantity,
        total_price: totalPrice,
        unit_price: unitPrice,
        discount_per_unit: discountPerUnit,
        discount_percentage: discountPercentage,
        savings: savings
      };
    });
    
    if (isMounted.current) {
      setPriceCalculations(prev => ({
        ...prev,
        bulk_calculations: results
      }));
    }
    
    return results;
  }, [pricing, calculatePriceForQuantity]);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleChange = useCallback((field, value) => {
    setPricing(prev => {
      const newPricing = { ...prev, [field]: value };
      
      // Clear error for this field
      if (errors[field]) {
        setErrors(prevErrors => ({ ...prevErrors, [field]: '' }));
      }
      
      // Auto-validate if field was touched
      if (touched[field]) {
        const error = validateField(field, value, newPricing);
        if (error) {
          setErrors(prevErrors => ({ ...prevErrors, [field]: error }));
        }
      }
      
      return newPricing;
    });
  }, [errors, touched, validateField]);

  const handleNestedChange = useCallback((parent, field, value) => {
    setPricing(prev => {
      const newPricing = {
        ...prev,
        [parent]: {
          ...prev[parent],
          [field]: value
        }
      };
      
      // Clear related errors
      const errorKey = `${parent}_${field}`;
      if (errors[errorKey]) {
        setErrors(prevErrors => ({ ...prevErrors, [errorKey]: '' }));
      }
      
      return newPricing;
    });
  }, [errors]);

  const handleTierChange = useCallback((index, field, value) => {
    setPricing(prev => {
      const newTiers = [...prev.tier_config];
      newTiers[index] = { ...newTiers[index], [field]: value };
      
      // Sort by min_qty for consistency
      newTiers.sort((a, b) => (a.min_qty || 0) - (b.min_qty || 0));
      
      return { ...prev, tier_config: newTiers };
    });
    
    // Clear tier errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`tier_${index}_price`];
      delete newErrors[`tier_${index}_quantity`];
      delete newErrors.tiers;
      return newErrors;
    });
  }, []);

  const addTier = useCallback(() => {
    setPricing(prev => {
      const lastTier = prev.tier_config[prev.tier_config.length - 1];
      const newMinQty = lastTier?.min_qty ? lastTier.min_qty + 5 : 1;
      
      return {
        ...prev,
        tier_config: [
          ...prev.tier_config,
          { min_qty: newMinQty, price: "" }
        ]
      };
    });
  }, []);

  const removeTier = useCallback((index) => {
    setPricing(prev => {
      const newTiers = prev.tier_config.filter((_, i) => i !== index);
      return { ...prev, tier_config: newTiers };
    });
  }, []);

  const handleVolumeTierChange = useCallback((index, field, value) => {
    setPricing(prev => {
      const newTiers = [...prev.volume_discounts.tiers];
      newTiers[index] = { ...newTiers[index], [field]: parseFloat(value) || 0 };
      
      // Sort by min_qty
      newTiers.sort((a, b) => (a.min_qty || 0) - (b.min_qty || 0));
      
      return {
        ...prev,
        volume_discounts: {
          ...prev.volume_discounts,
          tiers: newTiers
        }
      };
    });
  }, []);

  const addVolumeTier = useCallback(() => {
    setPricing(prev => {
      const lastTier = prev.volume_discounts.tiers[prev.volume_discounts.tiers.length - 1];
      const newMinQty = lastTier ? lastTier.min_qty + 5 : 5;
      const newDiscount = lastTier ? lastTier.discount_percentage + 5 : 5;
      
      return {
        ...prev,
        volume_discounts: {
          ...prev.volume_discounts,
          tiers: [
            ...prev.volume_discounts.tiers,
            { min_qty: newMinQty, discount_percentage: newDiscount }
          ]
        }
      };
    });
  }, []);

  const removeVolumeTier = useCallback((index) => {
    setPricing(prev => ({
      ...prev,
      volume_discounts: {
        ...prev.volume_discounts,
        tiers: prev.volume_discounts.tiers.filter((_, i) => i !== index)
      }
    }));
  }, []);

  const toggleVolumeDiscounts = useCallback((enabled) => {
    setPricing(prev => ({
      ...prev,
      volume_discounts: {
        ...prev.volume_discounts,
        enabled
      }
    }));
  }, []);

  const togglePromotionalPricing = useCallback((enabled) => {
    setPricing(prev => ({
      ...prev,
      promotional_pricing: {
        ...prev.promotional_pricing,
        enabled,
        original_price: enabled && !prev.promotional_pricing.original_price 
          ? prev.price 
          : prev.promotional_pricing.original_price
      }
    }));
  }, []);

  const handlePromotionalDateChange = useCallback((field, date) => {
    setPricing(prev => ({
      ...prev,
      promotional_pricing: {
        ...prev.promotional_pricing,
        [field]: date ? date.toISOString() : null
      }
    }));
    
    // Clear date errors
    setErrors(prev => ({ ...prev, promotional_dates: '' }));
  }, []);

  const handleFieldBlur = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate on blur
    if (field === 'price' || field === 'discount_value') {
      const error = validateField(field, pricing[field], pricing);
      if (error) {
        setErrors(prev => ({ ...prev, [field]: error }));
      }
    }
  }, [pricing, validateField]);

  const resetPricing = useCallback(() => {
    setPricing(getInitialPricingState());
    setErrors({});
    setTouched({});
    setPriceCalculations({
      last_calculation: null,
      bulk_calculations: {}
    });
  }, []);

  // ==========================================================================
  // MEMOIZED VALUES
  // ==========================================================================

  const formattedTiers = useMemo(() => {
    return pricing.tier_config
      .filter(tier => tier.price && tier.price.toString().trim() !== '')
      .map(tier => ({
        min_qty: tier.min_qty,
        price: toSafeNumber(tier.price, 0),
        price_formatted: formatCurrency(tier.price, true, 2)
      }));
  }, [pricing.tier_config, formatCurrency]);

  const priceSummary = useMemo(() => {
    if (!pricing.price) return null;
    
    const basePrice = parseFloat(pricing.price);
    if (isNaN(basePrice)) return null;
    
    return {
      base_price: basePrice,
      base_price_formatted: formatCurrency(basePrice, true, 2),
      has_discount: pricing.discount_type !== 'none' && pricing.discount_value,
      discount_type: pricing.discount_type,
      discount_value: pricing.discount_value,
      promotional_active: pricing.promotional_pricing.enabled && 
        pricing.promotional_pricing.promotional_price
    };
  }, [pricing, formatCurrency]);

  const isFormValid = useMemo(() => {
    return validatePricing();
  }, [validatePricing]);

  // Auto-validate when pricing changes
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validatePricing();
    }
  }, [pricing, touched, validatePricing]);

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

  const convertCurrency = useCallback((amount, targetCurrency) => {
    if (!pricing.currency_conversion.enabled || !amount) return amount;
    
    const rate = pricing.currency_conversion.conversion_rates[targetCurrency];
    if (!rate) return amount;
    
    return amount * rate;
  }, [pricing.currency_conversion]);

  const prepareForBackend = useCallback(() => {
    return {
      price: parseFloat(pricing.price) || 0,
      currency: pricing.currency,
      plan_type: pricing.plan_type,
      discount_type: pricing.discount_type,
      discount_value: parseFloat(pricing.discount_value) || 0,
      tier_config: formatTiersForBackend(pricing.tier_config),
      volume_discounts: {
        enabled: pricing.volume_discounts.enabled,
        tiers: formatVolumeTiersForBackend(pricing.volume_discounts.tiers)
      },
      promotional_pricing: {
        enabled: pricing.promotional_pricing.enabled,
        start_date: pricing.promotional_pricing.start_date,
        end_date: pricing.promotional_pricing.end_date,
        original_price: parseFloat(pricing.promotional_pricing.original_price) || 0,
        promotional_price: parseFloat(pricing.promotional_pricing.promotional_price) || 0
      },
      tax_inclusive: pricing.tax_inclusive,
      tax_rate: pricing.tax_rate
    };
  }, [pricing]);

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    // State
    pricing,
    setPricing,
    errors,
    touched,
    priceCalculations,
    isCalculating,
    
    // Basic handlers
    handleChange,
    handleNestedChange,
    handleFieldBlur,
    
    // Tier handlers
    handleTierChange,
    addTier,
    removeTier,
    formattedTiers,
    
    // Volume discount handlers
    handleVolumeTierChange,
    addVolumeTier,
    removeVolumeTier,
    toggleVolumeDiscounts,
    
    // Promotional handlers
    togglePromotionalPricing,
    handlePromotionalDateChange,
    
    // Validation
    validateField,
    validatePricing,
    isFormValid,
    
    // Price calculations
    calculatePriceForQuantity,
    calculateBulkPrices,
    calculatePriceBreakdown,
    
    // Currency utilities
    formatCurrency,
    formatNumber,
    convertCurrency,
    
    // Backend preparation
    prepareForBackend,
    
    // Utility
    priceSummary,
    resetPricing
  };
};

export default usePricing;