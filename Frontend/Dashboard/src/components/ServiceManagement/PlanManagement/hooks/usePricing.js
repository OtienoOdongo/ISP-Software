import { useState, useCallback, useEffect } from "react";
import { validatePrice, validateNumber } from '../../Shared/utils.js'
import { formatCurrency } from '../../Shared/formatters.js'; 

// Initial pricing state
export const getInitialPricingState = () => ({
  // Basic pricing
  price: "",
  currency: "KES",
  plan_type: "paid", // "paid", "free_trial", "promotional"
  
  // Discount configuration
  discount_type: "none", // "none", "percentage", "fixed", "tiered"
  discount_value: "",
  discount_matrix_id: null,
  
  // Tiered pricing
  tiers: [
    { min_quantity: 1, price: "" },
    { min_quantity: 5, price: "" },
    { min_quantity: 10, price: "" }
  ],
  
  // Volume discounts
  volume_discounts: {
    enabled: false,
    tiers: [
      { min_quantity: 5, discount_percentage: 5 },
      { min_quantity: 10, discount_percentage: 10 },
      { min_quantity: 20, discount_percentage: 15 }
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
  tax_rate: 16, // Default 16% VAT for Kenya
  
  // Currency conversion
  currency_conversion: {
    enabled: false,
    base_currency: "KES",
    conversion_rates: {
      USD: 0.0067,
      EUR: 0.0062,
      GBP: 0.0053
    }
  }
});

const usePricing = (initialState = getInitialPricingState()) => {
  const [pricing, setPricing] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [priceCalculations, setPriceCalculations] = useState({});

  // Handle basic field changes
  const handleChange = useCallback((field, value) => {
    setPricing(prev => ({ 
      ...prev, 
      [field]: value 
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // Handle nested field changes
  const handleNestedChange = useCallback((parent, field, value) => {
    setPricing(prev => ({ 
      ...prev, 
      [parent]: { 
        ...prev[parent], 
        [field]: value 
      } 
    }));
  }, []);

  // Handle tier changes
  const handleTierChange = useCallback((index, field, value) => {
    setPricing(prev => {
      const newTiers = [...prev.tiers];
      newTiers[index] = { ...newTiers[index], [field]: value };
      
      // Sort tiers by min_quantity
      newTiers.sort((a, b) => a.min_quantity - b.min_quantity);
      
      return { ...prev, tiers: newTiers };
    });
  }, []);

  // Add new tier
  const addTier = useCallback(() => {
    setPricing(prev => {
      const lastTier = prev.tiers[prev.tiers.length - 1];
      const newMinQuantity = lastTier ? lastTier.min_quantity + 5 : 1;
      
      return {
        ...prev,
        tiers: [
          ...prev.tiers,
          { min_quantity: newMinQuantity, price: "" }
        ]
      };
    });
  }, []);

  // Remove tier
  const removeTier = useCallback((index) => {
    setPricing(prev => {
      const newTiers = [...prev.tiers];
      newTiers.splice(index, 1);
      return { ...prev, tiers: newTiers };
    });
  }, []);

  // Handle volume discount tier changes
  const handleVolumeTierChange = useCallback((index, field, value) => {
    setPricing(prev => {
      const newTiers = [...prev.volume_discounts.tiers];
      newTiers[index] = { ...newTiers[index], [field]: value };
      
      // Sort tiers by min_quantity
      newTiers.sort((a, b) => a.min_quantity - b.min_quantity);
      
      return { 
        ...prev, 
        volume_discounts: { 
          ...prev.volume_discounts, 
          tiers: newTiers 
        } 
      };
    });
  }, []);

  // Add volume discount tier
  const addVolumeTier = useCallback(() => {
    setPricing(prev => {
      const lastTier = prev.volume_discounts.tiers[prev.volume_discounts.tiers.length - 1];
      const newMinQuantity = lastTier ? lastTier.min_quantity + 5 : 5;
      const newDiscountPercentage = lastTier ? lastTier.discount_percentage + 5 : 5;
      
      return {
        ...prev,
        volume_discounts: {
          ...prev.volume_discounts,
          tiers: [
            ...prev.volume_discounts.tiers,
            { min_quantity: newMinQuantity, discount_percentage: newDiscountPercentage }
          ]
        }
      };
    });
  }, []);

  // Remove volume discount tier
  const removeVolumeTier = useCallback((index) => {
    setPricing(prev => {
      const newTiers = [...prev.volume_discounts.tiers];
      newTiers.splice(index, 1);
      
      return { 
        ...prev, 
        volume_discounts: { 
          ...prev.volume_discounts, 
          tiers: newTiers 
        } 
      };
    });
  }, []);

  // Toggle volume discounts
  const toggleVolumeDiscounts = useCallback((enabled) => {
    setPricing(prev => ({
      ...prev,
      volume_discounts: {
        ...prev.volume_discounts,
        enabled
      }
    }));
  }, []);

  // Toggle promotional pricing
  const togglePromotionalPricing = useCallback((enabled) => {
    setPricing(prev => ({
      ...prev,
      promotional_pricing: {
        ...prev.promotional_pricing,
        enabled,
        // Set original price when enabling
        original_price: enabled && !prev.promotional_pricing.original_price 
          ? prev.price 
          : prev.promotional_pricing.original_price
      }
    }));
  }, []);

  // Handle promotional date changes
  const handlePromotionalDateChange = useCallback((field, dateString) => {
    if (!dateString) {
      handleNestedChange('promotional_pricing', field, null);
      return;
    }

    try {
      const date = new Date(dateString);
      handleNestedChange('promotional_pricing', field, date);
    } catch (error) {
      console.error('Error parsing date:', error);
    }
  }, [handleNestedChange]);

  // Handle field blur
  const handleFieldBlur = useCallback((field) => {
    if (!touched[field]) {
      setTouched(prev => ({ ...prev, [field]: true }));
    }
  }, [touched]);

  // Validate a specific field
  const validateField = useCallback((field, value) => {
    let error = '';
    
    switch (field) {
      case 'price':
        error = validatePrice(value, pricing.plan_type);
        break;
      case 'discount_value':
        if (pricing.discount_type === 'percentage') {
          error = validateNumber(value, 'Discount percentage', 0, 100);
        } else if (pricing.discount_type === 'fixed') {
          error = validateNumber(value, 'Discount amount', 0);
        }
        break;
      default:
        break;
    }
    
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
      return false;
    }
    
    // Clear error if validation passes
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    return true;
  }, [errors, pricing.plan_type, pricing.discount_type]);

  // Validate entire pricing configuration
  const validatePricing = useCallback(() => {
    const newErrors = {};
    
    // Validate base price
    newErrors.price = validatePrice(pricing.price, pricing.plan_type);
    
    // Validate discount value if discount is enabled
    if (pricing.discount_type !== 'none' && pricing.discount_value) {
      if (pricing.discount_type === 'percentage') {
        newErrors.discount_value = validateNumber(pricing.discount_value, 'Discount percentage', 0, 100);
      } else if (pricing.discount_type === 'fixed') {
        newErrors.discount_value = validateNumber(pricing.discount_value, 'Discount amount', 0);
      }
    }
    
    // Validate tiers
    pricing.tiers.forEach((tier, index) => {
      if (tier.price) {
        const priceError = validatePrice(tier.price, pricing.plan_type);
        if (priceError) {
          newErrors[`tier_${index}_price`] = priceError;
        }
      }
      
      if (tier.min_quantity <= 0) {
        newErrors[`tier_${index}_quantity`] = 'Minimum quantity must be greater than 0';
      }
    });
    
    // Validate promotional pricing
    if (pricing.promotional_pricing.enabled) {
      if (pricing.promotional_pricing.original_price) {
        newErrors.promotional_original_price = validatePrice(
          pricing.promotional_pricing.original_price, 
          pricing.plan_type
        );
      }
      
      if (pricing.promotional_pricing.promotional_price) {
        newErrors.promotional_price = validatePrice(
          pricing.promotional_pricing.promotional_price, 
          pricing.plan_type
        );
      }
      
      if (pricing.promotional_pricing.start_date && pricing.promotional_pricing.end_date) {
        const startDate = new Date(pricing.promotional_pricing.start_date);
        const endDate = new Date(pricing.promotional_pricing.end_date);
        
        if (endDate <= startDate) {
          newErrors.promotional_dates = 'End date must be after start date';
        }
      }
    }
    
    // Remove empty errors
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [pricing]);

  // Calculate price for a given quantity
  const calculatePriceForQuantity = useCallback((quantity = 1) => {
    if (!pricing.price || isNaN(parseFloat(pricing.price))) {
      return null;
    }

    const basePrice = parseFloat(pricing.price);
    let finalPrice = basePrice * quantity;
    
    // Apply tiered pricing
    if (pricing.discount_type === 'tiered' && pricing.tiers.length > 0) {
      // Find applicable tier (highest min_quantity <= quantity)
      const applicableTier = [...pricing.tiers]
        .sort((a, b) => b.min_quantity - a.min_quantity)
        .find(tier => tier.min_quantity <= quantity);
      
      if (applicableTier && applicableTier.price) {
        finalPrice = parseFloat(applicableTier.price) * quantity;
      }
    }
    
    // Apply volume discounts
    if (pricing.volume_discounts.enabled && pricing.volume_discounts.tiers.length > 0) {
      const applicableVolumeTier = [...pricing.volume_discounts.tiers]
        .sort((a, b) => b.min_quantity - a.min_quantity)
        .find(tier => tier.min_quantity <= quantity);
      
      if (applicableVolumeTier) {
        const discount = (applicableVolumeTier.discount_percentage / 100) * finalPrice;
        finalPrice -= discount;
      }
    }
    
    // Apply percentage discount
    if (pricing.discount_type === 'percentage' && pricing.discount_value) {
      const discountPercentage = parseFloat(pricing.discount_value) / 100;
      finalPrice -= finalPrice * discountPercentage;
    }
    
    // Apply fixed discount
    if (pricing.discount_type === 'fixed' && pricing.discount_value) {
      const discountAmount = parseFloat(pricing.discount_value) * quantity;
      finalPrice -= discountAmount;
    }
    
    // Apply promotional pricing
    if (pricing.promotional_pricing.enabled && 
        pricing.promotional_pricing.promotional_price &&
        isPromotionalPriceActive()) {
      finalPrice = parseFloat(pricing.promotional_pricing.promotional_price) * quantity;
    }
    
    // Ensure price doesn't go below 0
    if (finalPrice < 0) finalPrice = 0;
    
    return finalPrice;
  }, [pricing]);

  // Check if promotional price is currently active
  const isPromotionalPriceActive = useCallback(() => {
    if (!pricing.promotional_pricing.enabled) {
      return false;
    }
    
    const now = new Date();
    const startDate = pricing.promotional_pricing.start_date ? new Date(pricing.promotional_pricing.start_date) : null;
    const endDate = pricing.promotional_pricing.end_date ? new Date(pricing.promotional_pricing.end_date) : null;
    
    if (!startDate || !endDate) {
      return true; // If no dates specified, always active
    }
    
    return now >= startDate && now <= endDate;
  }, [pricing.promotional_pricing]);

  // Calculate bulk prices for multiple quantities
  const calculateBulkPrices = useCallback((quantities = [1, 5, 10, 20, 50]) => {
    const results = quantities.map(quantity => {
      const price = calculatePriceForQuantity(quantity);
      const unitPrice = price ? price / quantity : 0;
      
      return {
        quantity,
        total_price: price,
        unit_price: unitPrice,
        discount_per_unit: pricing.price ? (parseFloat(pricing.price) - unitPrice) : 0,
        discount_percentage: pricing.price ? ((parseFloat(pricing.price) - unitPrice) / parseFloat(pricing.price) * 100) : 0
      };
    });
    
    setPriceCalculations(prev => ({ ...prev, bulk: results }));
    return results;
  }, [calculatePriceForQuantity, pricing.price]);

  // Calculate price breakdown for a specific quantity
  const calculatePriceBreakdown = useCallback((quantity = 1) => {
    const basePrice = parseFloat(pricing.price) || 0;
    const totalBasePrice = basePrice * quantity;
    const finalPrice = calculatePriceForQuantity(quantity);
    
    if (!finalPrice) {
      return null;
    }
    
    const breakdown = {
      quantity,
      base_price_per_unit: basePrice,
      total_base_price: totalBasePrice,
      final_price: finalPrice,
      final_price_per_unit: finalPrice / quantity,
      total_discount: totalBasePrice - finalPrice,
      discount_percentage: totalBasePrice > 0 ? ((totalBasePrice - finalPrice) / totalBasePrice * 100) : 0,
      breakdown: []
    };
    
    // Add tax if applicable
    if (pricing.tax_rate && pricing.tax_rate > 0) {
      const taxAmount = finalPrice * (pricing.tax_rate / 100);
      breakdown.tax_rate = pricing.tax_rate;
      breakdown.tax_amount = taxAmount;
      breakdown.total_with_tax = finalPrice + taxAmount;
    }
    
    return breakdown;
  }, [pricing, calculatePriceForQuantity]);

  // Convert price to different currencies
  const convertCurrency = useCallback((amount, targetCurrency = "USD") => {
    if (!amount || !pricing.currency_conversion.enabled) {
      return amount;
    }
    
    const conversionRate = pricing.currency_conversion.conversion_rates[targetCurrency];
    if (!conversionRate) {
      return amount;
    }
    
    return amount * conversionRate;
  }, [pricing.currency_conversion]);

  // Reset pricing
  const resetPricing = useCallback(() => {
    setPricing(getInitialPricingState());
    setErrors({});
    setTouched({});
    setPriceCalculations({});
  }, []);

  // Load pricing from data
  const loadPricing = useCallback((data) => {
    if (!data) {
      resetPricing();
      return;
    }

    setPricing(data);
    setErrors({});
    setTouched({});
  }, [resetPricing]);

  // Effect to validate when pricing changes
  useEffect(() => {
    if (pricing.price) {
      const validationErrors = validatePricing();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
      }
    }
  }, [pricing, validatePricing]);

  return {
    pricing,
    setPricing: loadPricing,
    errors,
    touched,
    priceCalculations,
    handleChange,
    handleNestedChange,
    handleTierChange,
    addTier,
    removeTier,
    handleVolumeTierChange,
    addVolumeTier,
    removeVolumeTier,
    toggleVolumeDiscounts,
    togglePromotionalPricing,
    handlePromotionalDateChange,
    handleFieldBlur,
    validateField,
    validatePricing,
    calculatePriceForQuantity,
    calculateBulkPrices,
    calculatePriceBreakdown,
    isPromotionalPriceActive,
    convertCurrency,
    resetPricing,
    formatCurrency
  };
};

export default usePricing;