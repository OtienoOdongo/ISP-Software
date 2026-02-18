



// // ============================================================================
// // UTILITY FUNCTIONS
// // ALIGNED WITH DJANGO BACKEND LOGIC
// // FULLY FIXED - WITH COMPLETE NULL SAFETY
// // ============================================================================

// import { 
//   formatBytes, 
//   formatTime, 
//   formatDate, 
//   formatDuration, 
//   formatCurrency,
//   formatDaysOfWeek 
// } from "./formatters";
// import { popularityLevels, daysOfWeek } from "./constant";

// // ============================================================================
// // DEEP CLONE UTILITY
// // ============================================================================
// export const deepClone = (obj) => {
//   if (!obj || typeof obj !== 'object') return obj;
//   if (obj instanceof Date) return new Date(obj.getTime());
//   if (Array.isArray(obj)) return obj.map(item => deepClone(item));
  
//   const cloned = {};
//   for (const key in obj) {
//     if (obj.hasOwnProperty(key)) {
//       cloned[key] = deepClone(obj[key]);
//     }
//   }
//   return cloned;
// };

// // ============================================================================
// // DEBOUNCE & THROTTLE
// // ============================================================================
// export const debounce = (func, wait, immediate = false) => {
//   let timeout;
//   return function executedFunction(...args) {
//     const context = this;
//     const later = () => {
//       timeout = null;
//       if (!immediate) func.apply(context, args);
//     };
//     const callNow = immediate && !timeout;
//     clearTimeout(timeout);
//     timeout = setTimeout(later, wait);
//     if (callNow) func.apply(context, args);
//   };
// };

// export const throttle = (func, limit) => {
//   let inThrottle;
//   return function(...args) {
//     const context = this;
//     if (!inThrottle) {
//       func.apply(context, args);
//       inThrottle = true;
//       setTimeout(() => (inThrottle = false), limit);
//     }
//   };
// };

// // ============================================================================
// // FORMATTING UTILITIES
// // ============================================================================
// export const formatNumber = (value, decimals = 2) => {
//   if (value === null || value === undefined || value === "") return '0';
  
//   const num = typeof value === "number" ? value : parseFloat(value);
//   if (isNaN(num)) return '0';
  
//   return num.toLocaleString('en-US', {
//     minimumFractionDigits: decimals,
//     maximumFractionDigits: decimals
//   });
// };

// // ============================================================================
// // RATING & POPULARITY CALCULATIONS
// // ============================================================================
// export const calculateRating = (purchases, totalSubscribers = 0) => {
//   if (!purchases || purchases === 0) return 0;
  
//   // Logarithmic scale: more purchases = higher rating, but caps at 5
//   const baseRating = Math.min(5, Math.log10(purchases + 1) * 2);
  
//   // Factor in market share if total subscribers provided
//   let marketShareBonus = 0;
//   if (totalSubscribers > 0) {
//     const marketShare = purchases / totalSubscribers;
//     marketShareBonus = Math.min(0.5, marketShare * 2.5); // Up to 0.5 stars from market share
//   }
  
//   const finalRating = Math.min(5, baseRating + marketShareBonus);
  
//   // Round to nearest 0.5
//   return Math.round(finalRating * 2) / 2;
// };

// export const calculatePopularity = (subscriberCount) => {
//   if (!subscriberCount || subscriberCount === 0) {
//     return popularityLevels.LOW;
//   }
  
//   if (subscriberCount >= popularityLevels.EXTREME.threshold) {
//     return popularityLevels.EXTREME;
//   } else if (subscriberCount >= popularityLevels.VERY_HIGH.threshold) {
//     return popularityLevels.VERY_HIGH;
//   } else if (subscriberCount >= popularityLevels.HIGH.threshold) {
//     return popularityLevels.HIGH;
//   } else if (subscriberCount >= popularityLevels.MEDIUM.threshold) {
//     return popularityLevels.MEDIUM;
//   } else {
//     return popularityLevels.LOW;
//   }
// };

// // ============================================================================
// // CATEGORY & PLAN METRICS
// // ============================================================================
// export const calculateCategoryMetrics = (plans) => {
//   // Guard against null/undefined plans
//   if (!plans || !Array.isArray(plans)) {
//     return {
//       categoryMetrics: {},
//       totalSubscribers: 0,
//       totalRevenue: 0,
//       totalPlans: 0,
//       averageRating: 0,
//       mostPopularCategory: '',
//       averageSubscribersPerPlan: 0,
//       averageRevenuePerPlan: 0
//     };
//   }

//   const categoryMetrics = {};
//   let totalSubscribers = 0;
//   let totalRevenue = 0;
//   let totalPlans = 0;

//   // Calculate totals
//   plans.forEach(plan => {
//     if (!plan) return; // Skip null/undefined plans
    
//     const subscribers = plan.purchases || 0;
//     const revenue = (plan.price || 0) * subscribers;
//     const category = plan.category || "Uncategorized";
    
//     totalSubscribers += subscribers;
//     totalRevenue += revenue;
//     totalPlans += 1;
    
//     if (!categoryMetrics[category]) {
//       categoryMetrics[category] = {
//         subscribers: 0,
//         plans: 0,
//         revenue: 0,
//         activePlans: 0,
//         totalPlans: 0,
//         avgPrice: 0,
//         priceSum: 0
//       };
//     }
    
//     categoryMetrics[category].subscribers += subscribers;
//     categoryMetrics[category].plans += 1;
//     categoryMetrics[category].revenue += revenue;
//     categoryMetrics[category].priceSum += (plan.price || 0);
//     categoryMetrics[category].activePlans += (plan.active ? 1 : 0);
//     categoryMetrics[category].totalPlans += 1;
//   });

//   // Calculate averages and percentages
//   Object.keys(categoryMetrics).forEach(category => {
//     const metrics = categoryMetrics[category];
    
//     metrics.avgRating = calculateRating(metrics.subscribers, totalSubscribers);
//     metrics.popularity = calculatePopularity(metrics.subscribers);
//     metrics.marketShare = totalSubscribers > 0 ? (metrics.subscribers / totalSubscribers) * 100 : 0;
//     metrics.revenueShare = totalRevenue > 0 ? (metrics.revenue / totalRevenue) * 100 : 0;
//     metrics.planShare = totalPlans > 0 ? (metrics.plans / totalPlans) * 100 : 0;
//     metrics.activeRate = metrics.totalPlans > 0 ? (metrics.activePlans / metrics.totalPlans) * 100 : 0;
//     metrics.avgPrice = metrics.plans > 0 ? metrics.priceSum / metrics.plans : 0;
//   });

//   // Find most popular category
//   let mostPopularCategory = '';
//   let highestSubscribers = 0;
  
//   Object.keys(categoryMetrics).forEach(category => {
//     if (categoryMetrics[category].subscribers > highestSubscribers) {
//       highestSubscribers = categoryMetrics[category].subscribers;
//       mostPopularCategory = category;
//     }
//   });

//   return {
//     categoryMetrics,
//     totalSubscribers,
//     totalRevenue,
//     totalPlans,
//     averageRating: totalSubscribers > 0 ? calculateRating(totalSubscribers, totalSubscribers) : 0,
//     mostPopularCategory,
//     averageSubscribersPerPlan: totalPlans > 0 ? totalSubscribers / totalPlans : 0,
//     averageRevenuePerPlan: totalPlans > 0 ? totalRevenue / totalPlans : 0
//   };
// };

// export const calculatePlanPerformance = (plan, totalSubscribers, totalRevenue) => {
//   // Guard against null/undefined plan
//   if (!plan) {
//     return {
//       rating: 0,
//       popularity: popularityLevels.LOW,
//       marketShare: 0,
//       revenueShare: 0,
//       revenue: 0,
//       performanceScore: 0,
//       performanceLevel: 'Very Poor'
//     };
//   }

//   const subscribers = plan.purchases || 0;
//   const revenue = (plan.price || 0) * subscribers;
  
//   const rating = calculateRating(subscribers, totalSubscribers);
//   const popularity = calculatePopularity(subscribers);
//   const marketShare = totalSubscribers > 0 ? (subscribers / totalSubscribers) * 100 : 0;
//   const revenueShare = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
  
//   // Calculate performance score (0-100)
//   const performanceScore = Math.min(100,
//     (rating * 10) + // Rating contributes up to 50 points
//     (popularity.label === 'Extreme' ? 20 : 
//      popularity.label === 'Very High' ? 15 :
//      popularity.label === 'High' ? 10 :
//      popularity.label === 'Medium' ? 5 : 0) + // Popularity contributes up to 20 points
//     (marketShare * 0.5) + // Market share contributes up to 50 points
//     (plan.active ? 10 : 0) // Active plans get bonus
//   );

//   return {
//     rating,
//     popularity,
//     marketShare: parseFloat(marketShare.toFixed(2)),
//     revenueShare: parseFloat(revenueShare.toFixed(2)),
//     revenue: parseFloat(revenue.toFixed(2)),
//     performanceScore: parseFloat(performanceScore.toFixed(1)),
//     performanceLevel: performanceScore >= 80 ? 'Excellent' :
//                      performanceScore >= 60 ? 'Good' :
//                      performanceScore >= 40 ? 'Average' :
//                      performanceScore >= 20 ? 'Poor' : 'Very Poor'
//   };
// };

// // ============================================================================
// // PRICING & DISCOUNT CALCULATIONS
// // ============================================================================
// export const calculateEffectivePrice = (price, discountInfo) => {
//   if (!price) return 0;
  
//   const basePrice = parseFloat(price);
//   if (isNaN(basePrice)) return 0;
  
//   if (!discountInfo) return basePrice;
  
//   if (discountInfo.type === 'percentage') {
//     const discount = (basePrice * discountInfo.value) / 100;
//     return Math.max(0, basePrice - discount);
//   } else if (discountInfo.type === 'fixed') {
//     return Math.max(0, basePrice - discountInfo.value);
//   }
  
//   return basePrice;
// };

// export const validateDiscountCode = (code, discountRules) => {
//   if (!code || typeof code !== 'string' || code.trim() === '') {
//     return { valid: false, message: "Discount code is required" };
//   }
  
//   if (!discountRules || !Array.isArray(discountRules)) {
//     return { valid: false, message: "No discount rules available" };
//   }
  
//   const trimmedCode = code.trim();
//   const rule = discountRules.find(r => 
//     r?.code === trimmedCode.toUpperCase() || 
//     r?.name?.toLowerCase() === trimmedCode.toLowerCase()
//   );
  
//   if (!rule) {
//     return { valid: false, message: "Invalid discount code" };
//   }
  
//   if (!rule.is_active) {
//     return { valid: false, message: "Discount code is not active" };
//   }
  
//   const now = new Date();
  
//   // Check validity dates
//   if (rule.valid_from && new Date(rule.valid_from) > now) {
//     return { valid: false, message: "Discount code not yet active" };
//   }
  
//   if (rule.valid_to && new Date(rule.valid_to) < now) {
//     return { valid: false, message: "Discount code has expired" };
//   }
  
//   // Check usage limits
//   if (rule.total_usage_limit && rule.current_usage >= rule.total_usage_limit) {
//     return { valid: false, message: "Discount code usage limit reached" };
//   }
  
//   return { 
//     valid: true, 
//     rule, 
//     message: "Discount code applied successfully" 
//   };
// };

// export const applyDiscountRules = (price, discountRules, quantity = 1, clientData = {}) => {
//   let finalPrice = parseFloat(price) || 0;
//   let appliedDiscounts = [];
  
//   if (isNaN(finalPrice) || finalPrice <= 0) {
//     return { 
//       finalPrice: 0, 
//       appliedDiscounts, 
//       totalDiscount: 0, 
//       discountPercentage: 0 
//     };
//   }
  
//   // Guard against null/undefined discountRules
//   if (!discountRules || !Array.isArray(discountRules)) {
//     return { 
//       finalPrice, 
//       appliedDiscounts, 
//       totalDiscount: 0, 
//       discountPercentage: 0 
//     };
//   }
  
//   // Sort discount rules by priority (highest first)
//   const sortedRules = [...discountRules]
//     .filter(rule => rule && rule.is_active)
//     .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  
//   sortedRules.forEach(rule => {
//     // Check if rule can apply to this client
//     if (rule.rule_type === 'first_time' && clientData.purchase_count > 0) {
//       return;
//     }
    
//     if (rule.rule_type === 'loyalty') {
//       const minPurchases = rule.eligibility_criteria?.min_purchases || 3;
//       if (clientData.purchase_count < minPurchases) {
//         return;
//       }
//     }
    
//     if (rule.rule_type === 'bulk') {
//       const minQuantity = rule.eligibility_criteria?.min_quantity || 5;
//       if (quantity < minQuantity) {
//         return;
//       }
//     }
    
//     // Check quantity limits from price matrix
//     const priceMatrix = rule.price_matrix;
//     if (priceMatrix) {
//       if (priceMatrix.min_quantity && quantity < priceMatrix.min_quantity) {
//         return;
//       }
//       if (priceMatrix.max_quantity && quantity > priceMatrix.max_quantity) {
//         return;
//       }
//     }
    
//     let discountAmount = 0;
    
//     if (priceMatrix) {
//       if (priceMatrix.discount_type === 'percentage') {
//         discountAmount = (finalPrice * priceMatrix.percentage) / 100;
//       } else if (priceMatrix.discount_type === 'fixed') {
//         discountAmount = Math.min(finalPrice, priceMatrix.fixed_amount);
//       } else if (priceMatrix.discount_type === 'tiered' && priceMatrix.tier_config) {
//         // Find appropriate tier
//         const tier = priceMatrix.tier_config
//           .filter(Boolean)
//           .sort((a, b) => (b.min_qty || 0) - (a.min_qty || 0))
//           .find(t => quantity >= (t.min_qty || 0));
        
//         if (tier) {
//           const tierPrice = (tier.price || 0) * quantity;
//           discountAmount = finalPrice - tierPrice;
//         }
//       }
//     }
    
//     if (discountAmount > 0) {
//       finalPrice -= discountAmount;
//       appliedDiscounts.push({
//         name: rule.name || 'Discount',
//         ruleType: rule.rule_type || 'standard',
//         discountType: priceMatrix?.discount_type,
//         value: priceMatrix?.percentage || priceMatrix?.fixed_amount || 0,
//         amount: discountAmount,
//         ruleId: rule.id,
//         priceMatrixId: priceMatrix?.id
//       });
//     }
//   });
  
//   finalPrice = Math.max(0, finalPrice);
//   const totalDiscount = (parseFloat(price) || 0) - finalPrice;
//   const discountPercentage = price > 0 ? (totalDiscount / (parseFloat(price) || 1)) * 100 : 0;
  
//   return {
//     finalPrice,
//     appliedDiscounts,
//     totalDiscount,
//     discountPercentage: parseFloat(discountPercentage.toFixed(2))
//   };
// };

// export const calculateBulkPricing = (basePrice, quantity, bulkDiscounts = []) => {
//   if (!basePrice || quantity <= 0) return basePrice * quantity;
  
//   if (!bulkDiscounts || !Array.isArray(bulkDiscounts)) {
//     return basePrice * quantity;
//   }
  
//   const sortedDiscounts = [...bulkDiscounts]
//     .filter(d => d && d.is_active)
//     .sort((a, b) => (b.min_quantity || 0) - (a.min_quantity || 0));
  
//   const applicableDiscount = sortedDiscounts.find(d => quantity >= (d.min_quantity || 0));
  
//   if (!applicableDiscount) return basePrice * quantity;
  
//   let finalPrice = basePrice * quantity;
  
//   if (applicableDiscount.discount_type === 'percentage') {
//     finalPrice = finalPrice * (1 - (applicableDiscount.percentage || 0) / 100);
//   } else if (applicableDiscount.discount_type === 'fixed') {
//     finalPrice = Math.max(0, finalPrice - (applicableDiscount.fixed_amount || 0));
//   }
  
//   return finalPrice;
// };

// export const getBestDiscount = (price, discountRules, quantity = 1, clientData = {}) => {
//   if (!discountRules || !Array.isArray(discountRules) || discountRules.length === 0) {
//     return null;
//   }
  
//   let bestDiscount = null;
//   let bestPrice = price;
  
//   discountRules.forEach(rule => {
//     if (!rule || !rule.is_active) return;
    
//     const result = applyDiscountRules(price, [rule], quantity, clientData);
//     if (result.finalPrice < bestPrice) {
//       bestPrice = result.finalPrice;
//       bestDiscount = {
//         rule,
//         finalPrice: result.finalPrice,
//         discountAmount: price - result.finalPrice,
//         discountPercentage: ((price - result.finalPrice) / (price || 1)) * 100,
//         appliedDiscounts: result.appliedDiscounts
//       };
//     }
//   });
  
//   return bestDiscount;
// };

// // ============================================================================
// // TIERED PRICING CALCULATIONS
// // ============================================================================
// export const calculateTieredPrice = (quantity, tiers, tierType = 'volume') => {
//   if (!quantity || quantity <= 0) return 0;
//   if (!tiers || !Array.isArray(tiers) || tiers.length === 0) {
//     return 0;
//   }
  
//   // Sort tiers by min_qty in ascending order
//   const sortedTiers = [...tiers]
//     .filter(Boolean)
//     .sort((a, b) => (a.min_qty || 0) - (b.min_qty || 0));
  
//   // Find the applicable tier
//   let applicableTier = sortedTiers[sortedTiers.length - 1]; // Default to highest tier
  
//   for (let i = sortedTiers.length - 1; i >= 0; i--) {
//     if (quantity >= (sortedTiers[i].min_qty || 0)) {
//       applicableTier = sortedTiers[i];
//       break;
//     }
//   }
  
//   if (tierType === 'volume') {
//     // Volume pricing: price per unit
//     return (applicableTier.price || 0) * quantity;
//   } else {
//     // Tiered pricing: fixed price for the tier
//     return applicableTier.price || 0;
//   }
// };

// export const calculatePercentageChange = (oldValue, newValue, decimals = 1) => {
//   if (oldValue === 0 || oldValue === null || oldValue === undefined) {
//     return newValue > 0 ? 100 : 0;
//   }
  
//   const change = ((newValue - oldValue) / oldValue) * 100;
//   return parseFloat(change.toFixed(decimals));
// };

// export const calculateProgressiveTieredPrice = (quantity, tiers) => {
//   if (!quantity || quantity <= 0) return 0;
//   if (!tiers || !Array.isArray(tiers) || tiers.length === 0) {
//     return 0;
//   }
  
//   // Sort tiers by min_qty
//   const sortedTiers = [...tiers]
//     .filter(Boolean)
//     .sort((a, b) => (a.min_qty || 0) - (b.min_qty || 0));
  
//   let totalPrice = 0;
//   let remainingQuantity = quantity;
  
//   for (let i = 0; i < sortedTiers.length && remainingQuantity > 0; i++) {
//     const tier = sortedTiers[i];
//     const nextTier = sortedTiers[i + 1];
    
//     const tierMax = tier.max_qty || (nextTier ? (nextTier.min_qty || 0) - 1 : Infinity);
//     const tierQuantity = Math.min(remainingQuantity, tierMax - (tier.min_qty || 0) + 1);
    
//     if (tierQuantity > 0) {
//       totalPrice += (tier.price || 0) * tierQuantity;
//       remainingQuantity -= tierQuantity;
//     }
//   }
  
//   return totalPrice;
// };

// export const calculateTieredDiscount = (basePrice, quantity, discountTiers, discountType = 'percentage') => {
//   const totalBasePrice = (basePrice || 0) * (quantity || 0);
  
//   if (!discountTiers || !Array.isArray(discountTiers) || discountTiers.length === 0) {
//     return {
//       discountedPrice: totalBasePrice,
//       discountAmount: 0,
//       discountPercentage: 0,
//       appliedTier: null
//     };
//   }
  
//   // Sort discount tiers by min_qty
//   const sortedTiers = [...discountTiers]
//     .filter(Boolean)
//     .sort((a, b) => (b.min_qty || 0) - (a.min_qty || 0)); // Descending for easier matching
  
//   let appliedTier = null;
  
//   for (const tier of sortedTiers) {
//     if (quantity >= (tier.min_qty || 0)) {
//       appliedTier = tier;
//       break;
//     }
//   }
  
//   if (!appliedTier) {
//     return {
//       discountedPrice: totalBasePrice,
//       discountAmount: 0,
//       discountPercentage: 0,
//       appliedTier: null
//     };
//   }
  
//   let discountAmount = 0;
  
//   if (discountType === 'percentage') {
//     discountAmount = totalBasePrice * ((appliedTier.discount || 0) / 100);
//   } else if (discountType === 'fixed') {
//     discountAmount = Math.min(totalBasePrice, appliedTier.discount || 0);
//   }
  
//   const discountedPrice = totalBasePrice - discountAmount;
//   const discountPercentage = totalBasePrice > 0 ? (discountAmount / totalBasePrice) * 100 : 0;
  
//   return {
//     discountedPrice,
//     discountAmount,
//     discountPercentage: parseFloat(discountPercentage.toFixed(2)),
//     appliedTier
//   };
// };

// // ============================================================================
// // PRICE FILTERING & STATISTICS
// // ============================================================================
// export const filterByPriceRange = (items, minPrice, maxPrice, priceField = 'price') => {
//   if (!items || !Array.isArray(items)) {
//     return [];
//   }
  
//   return items.filter(item => {
//     if (!item) return false;
    
//     const price = parseFloat(item[priceField] || 0);
    
//     // Handle min price
//     const minValid = minPrice === null || minPrice === undefined || price >= parseFloat(minPrice);
    
//     // Handle max price
//     const maxValid = maxPrice === null || maxPrice === undefined || price <= parseFloat(maxPrice);
    
//     return minValid && maxValid;
//   });
// };

// export const calculateAveragePrice = (items, priceField = 'price') => {
//   if (!items || !Array.isArray(items) || items.length === 0) {
//     return 0;
//   }
  
//   const validItems = items.filter(Boolean);
//   if (validItems.length === 0) return 0;
  
//   const sum = validItems.reduce((total, item) => {
//     return total + parseFloat(item[priceField] || 0);
//   }, 0);
  
//   return parseFloat((sum / validItems.length).toFixed(2));
// };

// export const calculateMedianPrice = (items, priceField = 'price') => {
//   if (!items || !Array.isArray(items) || items.length === 0) {
//     return 0;
//   }
  
//   const validItems = items.filter(Boolean);
//   if (validItems.length === 0) return 0;
  
//   const prices = validItems
//     .map(item => parseFloat(item[priceField] || 0))
//     .sort((a, b) => a - b);
  
//   const middle = Math.floor(prices.length / 2);
  
//   if (prices.length % 2 === 0) {
//     return parseFloat(((prices[middle - 1] + prices[middle]) / 2).toFixed(2));
//   } else {
//     return parseFloat(prices[middle].toFixed(2));
//   }
// };

// export const calculatePriceStatistics = (items, priceField = 'price') => {
//   if (!items || !Array.isArray(items) || items.length === 0) {
//     return {
//       min: 0,
//       max: 0,
//       avg: 0,
//       median: 0,
//       total: 0,
//       count: 0
//     };
//   }
  
//   const validItems = items.filter(Boolean);
//   if (validItems.length === 0) {
//     return {
//       min: 0,
//       max: 0,
//       avg: 0,
//       median: 0,
//       total: 0,
//       count: 0
//     };
//   }
  
//   const prices = validItems.map(item => parseFloat(item[priceField] || 0));
//   const min = Math.min(...prices);
//   const max = Math.max(...prices);
//   const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
//   const total = prices.reduce((sum, price) => sum + price, 0);
  
//   // Calculate median
//   const sortedPrices = [...prices].sort((a, b) => a - b);
//   const middle = Math.floor(sortedPrices.length / 2);
//   const median = sortedPrices.length % 2 === 0
//     ? (sortedPrices[middle - 1] + sortedPrices[middle]) / 2
//     : sortedPrices[middle];
  
//   return {
//     min: parseFloat(min.toFixed(2)),
//     max: parseFloat(max.toFixed(2)),
//     avg: parseFloat(avg.toFixed(2)),
//     median: parseFloat(median.toFixed(2)),
//     total: parseFloat(total.toFixed(2)),
//     count: validItems.length
//   };
// };

// export const groupByPriceRange = (items, ranges, priceField = 'price') => {
//   if (!items || !Array.isArray(items) || !ranges || !Array.isArray(ranges)) {
//     return {};
//   }
  
//   const result = {};
  
//   // Initialize all ranges
//   ranges.forEach(range => {
//     if (range && range.label) {
//       result[range.label] = [];
//     }
//   });
  
//   // Add "other" category for items outside ranges
//   result.other = [];
  
//   // Categorize items
//   items.filter(Boolean).forEach(item => {
//     const price = parseFloat(item[priceField] || 0);
//     let placed = false;
    
//     for (const range of ranges) {
//       if (!range) continue;
      
//       const min = range.min !== undefined ? parseFloat(range.min) : -Infinity;
//       const max = range.max !== undefined ? parseFloat(range.max) : Infinity;
      
//       if (price >= min && price <= max) {
//         if (range.label) {
//           result[range.label].push(item);
//         }
//         placed = true;
//         break;
//       }
//     }
    
//     if (!placed) {
//       result.other.push(item);
//     }
//   });
  
//   return result;
// };

// export const sortByPrice = (items, order = 'asc', priceField = 'price') => {
//   if (!items || !Array.isArray(items)) {
//     return [];
//   }
  
//   return [...items]
//     .filter(Boolean)
//     .sort((a, b) => {
//       const priceA = parseFloat(a[priceField] || 0);
//       const priceB = parseFloat(b[priceField] || 0);
      
//       return order === 'asc' ? priceA - priceB : priceB - priceA;
//     });
// };

// export const findPriceOutliers = (items, priceField = 'price') => {
//   if (!items || !Array.isArray(items) || items.length < 4) {
//     return { 
//       outliers: [], 
//       nonOutliers: items || [],
//       stats: {
//         q1: 0,
//         q3: 0,
//         iqr: 0,
//         lowerBound: 0,
//         upperBound: 0
//       }
//     };
//   }
  
//   const validItems = items.filter(Boolean);
//   if (validItems.length < 4) {
//     return { 
//       outliers: [], 
//       nonOutliers: validItems,
//       stats: {
//         q1: 0,
//         q3: 0,
//         iqr: 0,
//         lowerBound: 0,
//         upperBound: 0
//       }
//     };
//   }
  
//   const prices = validItems.map(item => ({
//     item,
//     price: parseFloat(item[priceField] || 0)
//   })).sort((a, b) => a.price - b.price);
  
//   // Calculate Q1, Q3, and IQR
//   const q1Index = Math.floor(prices.length * 0.25);
//   const q3Index = Math.floor(prices.length * 0.75);
  
//   const q1 = prices[q1Index].price;
//   const q3 = prices[q3Index].price;
//   const iqr = q3 - q1;
  
//   const lowerBound = q1 - (1.5 * iqr);
//   const upperBound = q3 + (1.5 * iqr);
  
//   const outliers = prices.filter(p => p.price < lowerBound || p.price > upperBound);
//   const nonOutliers = prices.filter(p => p.price >= lowerBound && p.price <= upperBound);
  
//   return {
//     outliers: outliers.map(o => o.item),
//     nonOutliers: nonOutliers.map(o => o.item),
//     stats: {
//       q1: parseFloat(q1.toFixed(2)),
//       q3: parseFloat(q3.toFixed(2)),
//       iqr: parseFloat(iqr.toFixed(2)),
//       lowerBound: parseFloat(lowerBound.toFixed(2)),
//       upperBound: parseFloat(upperBound.toFixed(2))
//     }
//   };
// };

// // ============================================================================
// // VALIDATION UTILITIES
// // ============================================================================
// export const validateRequired = (value, fieldName) => {
//   if (value === null || value === undefined || value === '') {
//     return `${fieldName} is required`;
//   }
  
//   if (typeof value === 'string' && value.trim() === '') {
//     return `${fieldName} is required`;
//   }
  
//   if (Array.isArray(value) && value.length === 0) {
//     return `${fieldName} is required`;
//   }
  
//   return '';
// };

// export const validateNumber = (value, fieldName, options = {}) => {
//   const { min, max, required = true, integer = false } = options;
  
//   if (required && (value === null || value === undefined || value === '')) {
//     return `${fieldName} is required`;
//   }
  
//   if (value === null || value === undefined || value === '') {
//     return ''; // Not required and empty
//   }
  
//   const num = typeof value === 'number' ? value : parseFloat(value);
//   if (isNaN(num)) {
//     return `${fieldName} must be a valid number`;
//   }
  
//   if (integer && !Number.isInteger(num)) {
//     return `${fieldName} must be an integer`;
//   }
  
//   if (min !== undefined && num < min) {
//     return `${fieldName} must be at least ${min}`;
//   }
  
//   if (max !== undefined && num > max) {
//     return `${fieldName} must be at most ${max}`;
//   }
  
//   return '';
// };

// export const validatePrice = (value, planType) => {
//   if (!planType) return '';
  
//   if (planType === "free_trial") {
//     const price = parseFloat(value);
//     if (price !== 0) {
//       return "Free Trial plans must have price set to 0";
//     }
//   } else if (planType === "paid" || planType === "promotional") {
//     const price = parseFloat(value);
//     if (isNaN(price) || price < 0) {
//       return "Price must be a positive number";
//     }
//   }
//   return '';
// };

// export const validateEmail = (email) => {
//   if (!email) return "Email is required";
  
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(email.trim())) {
//     return "Please enter a valid email address";
//   }
  
//   return '';
// };

// export const validatePhone = (phone) => {
//   if (!phone) return "Phone number is required";
  
//   const cleaned = phone.replace(/\D/g, '');
//   if (cleaned.length < 9 || cleaned.length > 13) {
//     return "Please enter a valid phone number";
//   }
  
//   return '';
// };

// // ============================================================================
// // TIME VARIANT UTILITIES - COMPLETELY FIXED WITH NULL SAFETY
// // ============================================================================

// /**
//  * Parse time string to seconds
//  */
// const parseTimeToSeconds = (timeStr) => {
//   if (!timeStr) return 0;
  
//   if (typeof timeStr === 'number') return timeStr;
  
//   if (typeof timeStr === 'string') {
//     const parts = timeStr.split(':');
//     if (parts.length >= 2) {
//       const hours = parseInt(parts[0], 10) || 0;
//       const minutes = parseInt(parts[1], 10) || 0;
//       return (hours * 3600) + (minutes * 60);
//     }
//   }
  
//   return 0;
// };

// /**
//  * FIXED: Check if plan is available now - WITH COMPLETE NULL SAFETY
//  */
// export const isPlanAvailableNow = (plan) => {
//   // CRITICAL: Guard against null/undefined plan
//   if (!plan) {
//     console.warn('isPlanAvailableNow called with null/undefined plan');
//     return false;
//   }
  
//   // Check if time_variant exists and is active
//   if (!plan.time_variant || typeof plan.time_variant !== 'object') {
//     return true; // No time variant, always available
//   }
  
//   const timeVariant = plan.time_variant;
  
//   // Check if time variant is active
//   if (!timeVariant.is_active) {
//     return true; // Time variant not active
//   }
  
//   if (timeVariant.force_available) {
//     return true; // Override enabled
//   }
  
//   const now = new Date();
//   const currentTime = now.getHours() * 3600 + now.getMinutes() * 60;
//   const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
  
//   // Check time of day availability
//   if (timeVariant.start_time && timeVariant.end_time) {
//     const startSeconds = parseTimeToSeconds(timeVariant.start_time);
//     const endSeconds = parseTimeToSeconds(timeVariant.end_time);
    
//     if (currentTime < startSeconds || currentTime > endSeconds) {
//       return false;
//     }
//   }
  
//   // Check day of week availability
//   if (timeVariant.available_days && Array.isArray(timeVariant.available_days) && timeVariant.available_days.length > 0) {
//     if (!timeVariant.available_days.includes(currentDay)) {
//       return false;
//     }
//   }
  
//   // Check scheduled availability
//   if (timeVariant.schedule_active && timeVariant.schedule_start_date && timeVariant.schedule_end_date) {
//     const startDate = new Date(timeVariant.schedule_start_date);
//     const endDate = new Date(timeVariant.schedule_end_date);
    
//     if (now < startDate || now > endDate) {
//       return false;
//     }
//   }
  
//   // Check duration-based availability
//   if (timeVariant.duration_active && timeVariant.duration_start_date) {
//     const startDate = new Date(timeVariant.duration_start_date);
//     let endDate = new Date(startDate);
    
//     if (timeVariant.duration_unit === 'hours') {
//       endDate.setHours(endDate.getHours() + (timeVariant.duration_value || 0));
//     } else if (timeVariant.duration_unit === 'days') {
//       endDate.setDate(endDate.getDate() + (timeVariant.duration_value || 0));
//     } else if (timeVariant.duration_unit === 'weeks') {
//       endDate.setDate(endDate.getDate() + ((timeVariant.duration_value || 0) * 7));
//     } else if (timeVariant.duration_unit === 'months') {
//       endDate.setMonth(endDate.getMonth() + (timeVariant.duration_value || 0));
//     }
    
//     if (now > endDate) {
//       return false;
//     }
//   }
  
//   // Check exclusion dates
//   if (timeVariant.exclusion_dates && Array.isArray(timeVariant.exclusion_dates)) {
//     const todayStr = now.toISOString().split('T')[0];
//     if (timeVariant.exclusion_dates.includes(todayStr)) {
//       return false;
//     }
//   }
  
//   return true;
// };

// export const validateTimeVariant = (timeVariant) => {
//   const errors = {};
  
//   // Guard against null/undefined
//   if (!timeVariant) {
//     return errors; // No validation needed if not provided
//   }
  
//   if (!timeVariant.is_active) {
//     return errors; // No validation needed if not active
//   }
  
//   // Validate time range
//   if (timeVariant.start_time && timeVariant.end_time) {
//     const startSeconds = parseTimeToSeconds(timeVariant.start_time);
//     const endSeconds = parseTimeToSeconds(timeVariant.end_time);
    
//     if (startSeconds >= endSeconds) {
//       errors.end_time = "End time must be after start time";
//     }
//   }
  
//   // Validate available days
//   if (timeVariant.available_days && Array.isArray(timeVariant.available_days)) {
//     const validDays = daysOfWeek.map(day => day.value);
//     const invalidDays = timeVariant.available_days.filter(day => !validDays.includes(day));
//     if (invalidDays.length > 0) {
//       errors.available_days = `Invalid day(s): ${invalidDays.join(', ')}. Must be one of ${validDays.join(', ')}`;
//     }
//   }
  
//   // Validate schedule dates
//   if (timeVariant.schedule_active) {
//     if (!timeVariant.schedule_start_date) {
//       errors.schedule_start_date = "Schedule start date is required when schedule is active";
//     }
//     if (!timeVariant.schedule_end_date) {
//       errors.schedule_end_date = "Schedule end date is required when schedule is active";
//     } else if (timeVariant.schedule_start_date && timeVariant.schedule_end_date) {
//       const start = new Date(timeVariant.schedule_start_date);
//       const end = new Date(timeVariant.schedule_end_date);
//       if (end <= start) {
//         errors.schedule_end_date = "Schedule end date must be after start date";
//       }
//     }
//   }
  
//   // Validate duration
//   if (timeVariant.duration_active) {
//     if (!timeVariant.duration_value || timeVariant.duration_value <= 0) {
//       errors.duration_value = "Duration value must be greater than 0";
//     }
//     if (!timeVariant.duration_start_date) {
//       errors.duration_start_date = "Duration start date is required when duration is active";
//     }
//   }
  
//   // Validate exclusion dates
//   if (timeVariant.exclusion_dates && !Array.isArray(timeVariant.exclusion_dates)) {
//     errors.exclusion_dates = "Exclusion dates must be an array";
//   }
  
//   return errors;
// };

// export const calculateNextAvailableTime = (timeVariant) => {
//   // Guard against null/undefined
//   if (!timeVariant || !timeVariant.is_active) return null;
  
//   const now = new Date();
  
//   // Check time of day restrictions
//   if (timeVariant.start_time && timeVariant.end_time) {
//     const currentTime = now.getHours() * 3600 + now.getMinutes() * 60;
//     const startSeconds = parseTimeToSeconds(timeVariant.start_time);
    
//     if (currentTime < startSeconds) {
//       const hours = Math.floor(startSeconds / 3600);
//       const minutes = Math.floor((startSeconds % 3600) / 60);
//       return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
//     } else {
//       // Will be available tomorrow
//       const tomorrow = new Date(now);
//       tomorrow.setDate(tomorrow.getDate() + 1);
//       const hours = Math.floor(startSeconds / 3600);
//       const minutes = Math.floor((startSeconds % 3600) / 60);
//       return `${tomorrow.toLocaleDateString()} at ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
//     }
//   }
  
//   // Check scheduled availability
//   if (timeVariant.schedule_active && timeVariant.schedule_start_date) {
//     const startDate = new Date(timeVariant.schedule_start_date);
//     if (now < startDate) {
//       return formatDate(startDate, true);
//     }
//   }
  
//   return null;
// };

// export const getAvailabilitySummary = (timeVariant) => {
//   // Guard against null/undefined
//   if (!timeVariant || !timeVariant.is_active) {
//     return { status: 'always_available', message: 'Available at all times', restrictions: [] };
//   }
  
//   const parts = [];
  
//   if (timeVariant.start_time && timeVariant.end_time) {
//     parts.push(`${formatTime(timeVariant.start_time)}-${formatTime(timeVariant.end_time)}`);
//   }
  
//   if (timeVariant.available_days && Array.isArray(timeVariant.available_days) && timeVariant.available_days.length > 0) {
//     parts.push(`on ${formatDaysOfWeek(timeVariant.available_days)}`);
//   }
  
//   if (timeVariant.schedule_active && timeVariant.schedule_start_date && timeVariant.schedule_end_date) {
//     parts.push(`from ${formatDate(timeVariant.schedule_start_date)} to ${formatDate(timeVariant.schedule_end_date)}`);
//   }
  
//   if (timeVariant.duration_active && timeVariant.duration_start_date) {
//     const durationText = `${timeVariant.duration_value || 0} ${timeVariant.duration_unit || 'days'}`;
//     parts.push(`for ${durationText} from ${formatDate(timeVariant.duration_start_date)}`);
//   }
  
//   const message = parts.length > 0 
//     ? `Available ${parts.join(' ')}`
//     : 'Available with time restrictions';
  
//   return { 
//     status: 'time_restricted', 
//     message,
//     restrictions: parts 
//   };
// };

// export const validateAccessMethods = (accessMethods) => {
//   const errors = {};
  
//   if (!accessMethods || typeof accessMethods !== 'object') {
//     return { valid: false, errors: { general: 'Access methods must be an object' } };
//   }
  
//   // Check for required methods
//   if (!accessMethods.hotspot && !accessMethods.pppoe) {
//     errors.general = 'At least one access method must be configured';
//   }
  
//   // Validate hotspot configuration if enabled
//   if (accessMethods.hotspot?.enabled) {
//     const hotspot = accessMethods.hotspot;
//     const requiredFields = ['downloadSpeed', 'uploadSpeed', 'dataLimit', 'usageLimit'];
    
//     requiredFields.forEach(field => {
//       if (!hotspot[field] || !hotspot[field].value) {
//         errors[`hotspot_${field}`] = `${field} is required for hotspot`;
//       }
//     });
    
//     if (hotspot.maxDevices && (hotspot.maxDevices < 1 || hotspot.maxDevices > 100)) {
//       errors.hotspot_maxDevices = 'Max devices must be between 1 and 100';
//     }
//   }
  
//   // Validate PPPoE configuration if enabled
//   if (accessMethods.pppoe?.enabled) {
//     const pppoe = accessMethods.pppoe;
//     const requiredFields = ['downloadSpeed', 'uploadSpeed', 'dataLimit', 'usageLimit'];
    
//     requiredFields.forEach(field => {
//       if (!pppoe[field] || !pppoe[field].value) {
//         errors[`pppoe_${field}`] = `${field} is required for PPPoE`;
//       }
//     });
    
//     if (pppoe.mtu && (pppoe.mtu < 576 || pppoe.mtu > 1500)) {
//       errors.pppoe_mtu = 'MTU must be between 576 and 1500';
//     }
//   }
  
//   return {
//     valid: Object.keys(errors).length === 0,
//     errors
//   };
// };

// // ============================================================================
// // DATA MANIPULATION UTILITIES
// // ============================================================================
// export const safeObjectEntries = (obj) => {
//   if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
//     return [];
//   }
//   return Object.entries(obj);
// };

// export const safeObjectKeys = (obj) => {
//   if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
//     return [];
//   }
//   return Object.keys(obj);
// };

// export const safeObjectValues = (obj) => {
//   if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
//     return [];
//   }
//   return Object.values(obj);
// };

// export const generateId = (prefix = '') => {
//   const timestamp = Date.now().toString(36);
//   const randomStr = Math.random().toString(36).substr(2, 9);
//   return `${prefix}${timestamp}-${randomStr}`;
// };

// export const truncateText = (text, maxLength = 100, ellipsis = '...') => {
//   if (!text || typeof text !== 'string') return '';
//   if (text.length <= maxLength) return text;
//   return text.substr(0, maxLength - ellipsis.length) + ellipsis;
// };

// export const capitalize = (text) => {
//   if (!text || typeof text !== 'string') return '';
//   return text.charAt(0).toUpperCase() + text.slice(1);
// };

// export const generateRandomColor = () => {
//   const colors = [
//     '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
//     '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
//   ];
//   return colors[Math.floor(Math.random() * colors.length)];
// };

// export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// export const formatBandwidthDisplay = (kbps) => {
//   return formatBytes((kbps || 0) * 1024); // Convert Kbps to bytes
// };

// // ============================================================================
// // ANALYTICS & TRENDS
// // ============================================================================
// export const processAnalyticsData = (plans, timeRange = '30d') => {
//   // Guard against null/undefined plans
//   if (!plans || !Array.isArray(plans)) {
//     return {
//       timeRange,
//       totalPlans: 0,
//       activePlans: 0,
//       totalSubscribers: 0,
//       totalRevenue: 0,
//       avgSubscribersPerPlan: 0,
//       avgRevenuePerPlan: 0,
//       categoryStats: [],
//       topCategories: [],
//       trends: {
//         subscriberGrowth: 0,
//         revenueGrowth: 0,
//         subscriberTrend: 'stable',
//         revenueTrend: 'stable',
//         previousSubscribers: 0,
//         previousRevenue: 0
//       },
//       timestamp: new Date().toISOString()
//     };
//   }

//   const now = new Date();
//   let startDate = new Date();
  
//   // Calculate start date based on time range
//   switch (timeRange) {
//     case 'today':
//       startDate.setHours(0, 0, 0, 0);
//       break;
//     case 'yesterday':
//       startDate.setDate(now.getDate() - 1);
//       startDate.setHours(0, 0, 0, 0);
//       break;
//     case '7d':
//       startDate.setDate(now.getDate() - 7);
//       break;
//     case '30d':
//       startDate.setDate(now.getDate() - 30);
//       break;
//     case '90d':
//       startDate.setDate(now.getDate() - 90);
//       break;
//     case '1y':
//       startDate.setFullYear(now.getFullYear() - 1);
//       break;
//     default:
//       startDate = new Date(0);
//   }

//   // Filter plans created within the time range
//   const filteredPlans = plans.filter(plan => {
//     if (!plan) return false;
//     const planDate = new Date(plan.created_at || plan.createdAt || Date.now());
//     return planDate >= startDate;
//   });

//   // Calculate statistics
//   const categoryStats = {};
//   let totalSubscribers = 0;
//   let totalRevenue = 0;
//   let activePlans = 0;

//   filteredPlans.forEach(plan => {
//     if (!plan) return;
    
//     const subscribers = plan.purchases || 0;
//     const revenue = (plan.price || 0) * subscribers;
//     const category = plan.category || "Uncategorized";
    
//     totalSubscribers += subscribers;
//     totalRevenue += revenue;
//     if (plan.active) activePlans++;

//     if (!categoryStats[category]) {
//       categoryStats[category] = {
//         plans: 0,
//         subscribers: 0,
//         revenue: 0,
//         activePlans: 0
//       };
//     }

//     categoryStats[category].plans++;
//     categoryStats[category].subscribers += subscribers;
//     categoryStats[category].revenue += revenue;
//     if (plan.active) categoryStats[category].activePlans++;
//   });

//   // Convert category stats to array
//   const categoryStatsArray = Object.entries(categoryStats).map(([category, stats]) => ({
//     category,
//     ...stats,
//     avgSubscribersPerPlan: stats.plans > 0 ? stats.subscribers / stats.plans : 0,
//     avgRevenuePerPlan: stats.plans > 0 ? stats.revenue / stats.plans : 0
//   })).sort((a, b) => b.subscribers - a.subscribers);

//   // Calculate trends
//   const previousStartDate = new Date(startDate);
//   const previousEndDate = new Date(startDate);
//   previousStartDate.setDate(previousStartDate.getDate() - (timeRange === 'today' ? 1 : 
//                                                          timeRange === '7d' ? 7 : 
//                                                          timeRange === '30d' ? 30 : 0));
  
//   const previousPlans = plans.filter(plan => {
//     if (!plan) return false;
//     const planDate = new Date(plan.created_at || plan.createdAt || Date.now());
//     return planDate >= previousStartDate && planDate < previousEndDate;
//   });

//   const previousSubscribers = previousPlans.reduce((sum, plan) => sum + (plan?.purchases || 0), 0);
//   const previousRevenue = previousPlans.reduce((sum, plan) => sum + ((plan?.price || 0) * (plan?.purchases || 0)), 0);
  
//   const subscriberGrowth = previousSubscribers > 0 
//     ? ((totalSubscribers - previousSubscribers) / previousSubscribers) * 100 
//     : totalSubscribers > 0 ? 100 : 0;
  
//   const revenueGrowth = previousRevenue > 0 
//     ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
//     : totalRevenue > 0 ? 100 : 0;

//   return {
//     timeRange,
//     totalPlans: filteredPlans.length,
//     activePlans,
//     totalSubscribers,
//     totalRevenue,
//     avgSubscribersPerPlan: filteredPlans.length > 0 ? totalSubscribers / filteredPlans.length : 0,
//     avgRevenuePerPlan: filteredPlans.length > 0 ? totalRevenue / filteredPlans.length : 0,
//     categoryStats: categoryStatsArray,
//     topCategories: categoryStatsArray.slice(0, 5),
//     trends: {
//       subscriberGrowth: parseFloat(subscriberGrowth.toFixed(1)),
//       revenueGrowth: parseFloat(revenueGrowth.toFixed(1)),
//       subscriberTrend: subscriberGrowth > 0 ? 'up' : subscriberGrowth < 0 ? 'down' : 'stable',
//       revenueTrend: revenueGrowth > 0 ? 'up' : revenueGrowth < 0 ? 'down' : 'stable',
//       previousSubscribers,
//       previousRevenue
//     },
//     timestamp: now.toISOString()
//   };
// };

// export const calculateTrends = (dataPoints, key = 'value') => {
//   if (!dataPoints || !Array.isArray(dataPoints) || dataPoints.length < 2) {
//     return { growthRate: 0, trend: 'stable', average: 0 };
//   }

//   const validPoints = dataPoints.filter(Boolean);
//   if (validPoints.length < 2) {
//     return { growthRate: 0, trend: 'stable', average: 0 };
//   }

//   const recent = validPoints.slice(-7);
//   const previous = validPoints.slice(-14, -7);
  
//   const recentAvg = recent.reduce((sum, point) => sum + (point?.[key] || 0), 0) / recent.length;
//   const previousAvg = previous.reduce((sum, point) => sum + (point?.[key] || 0), 0) / previous.length;
  
//   const growthRate = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 100;
  
//   return {
//     growthRate: parseFloat(growthRate.toFixed(1)),
//     trend: growthRate > 5 ? 'up' : growthRate < -5 ? 'down' : 'stable',
//     recentAverage: parseFloat(recentAvg.toFixed(1)),
//     previousAverage: parseFloat(previousAvg.toFixed(1))
//   };
// };

// // ============================================================================
// // ERROR HANDLING
// // ============================================================================
// export const formatError = (error) => {
//   if (!error) return "An unknown error occurred";
  
//   if (typeof error === 'string') return error;
  
//   if (error.message) return error.message;
  
//   if (error.response?.data?.error) return error.response.data.error;
  
//   if (error.response?.data?.message) return error.response.data.message;
  
//   if (error.response?.statusText) return `${error.response.status}: ${error.response.statusText}`;
  
//   return "An error occurred. Please try again.";
// };

// export const formatSuccess = (message, data = null) => {
//   return {
//     success: true,
//     message,
//     data,
//     timestamp: new Date().toISOString()
//   };
// };

// export const formatApiError = (error, statusCode = 400) => {
//   return {
//     success: false,
//     error: formatError(error),
//     statusCode,
//     timestamp: new Date().toISOString()
//   };
// };

// // ============================================================================
// // UTILITY FUNCTIONS
// // ============================================================================
// export const parseTimeString = (timeStr) => {
//   if (!timeStr) return null;
  
//   if (typeof timeStr === 'string' && timeStr.includes(':')) {
//     const [hours, minutes] = timeStr.split(':').map(Number);
//     const date = new Date();
//     date.setHours(hours || 0, minutes || 0, 0, 0);
//     return date;
//   }
  
//   // If it's already a number (seconds), convert to Date
//   if (typeof timeStr === 'number') {
//     const date = new Date();
//     const hours = Math.floor(timeStr / 3600);
//     const minutes = Math.floor((timeStr % 3600) / 60);
//     date.setHours(hours, minutes, 0, 0);
//     return date;
//   }
  
//   return null;
// };

// export const isEmpty = (value) => {
//   if (value === null || value === undefined) return true;
//   if (typeof value === 'string' && value.trim() === '') return true;
//   if (Array.isArray(value) && value.length === 0) return true;
//   if (typeof value === 'object' && Object.keys(value).length === 0) return true;
//   return false;
// };

// export const deepMerge = (target, source) => {
//   const output = Object.assign({}, target);
  
//   if (isObject(target) && isObject(source)) {
//     Object.keys(source).forEach(key => {
//       if (isObject(source[key])) {
//         if (!(key in target)) {
//           Object.assign(output, { [key]: source[key] });
//         } else {
//           output[key] = deepMerge(target[key], source[key]);
//         }
//       } else {
//         Object.assign(output, { [key]: source[key] });
//       }
//     });
//   }
  
//   return output;
// };

// const isObject = (item) => {
//   return item && typeof item === 'object' && !Array.isArray(item);
// };

// export const groupBy = (array, key) => {
//   if (!array || !Array.isArray(array)) return {};
  
//   return array.filter(Boolean).reduce((result, item) => {
//     const keyValue = item[key];
//     if (!result[keyValue]) {
//       result[keyValue] = [];
//     }
//     result[keyValue].push(item);
//     return result;
//   }, {});
// };

// export const filterByCriteria = (array, criteria) => {
//   if (!array || !Array.isArray(array)) return [];
  
//   return array.filter(Boolean).filter(item => {
//     return Object.keys(criteria || {}).every(key => {
//       if (criteria[key] === undefined || criteria[key] === null) return true;
      
//       const itemValue = item[key];
//       const criteriaValue = criteria[key];
      
//       if (typeof criteriaValue === 'function') {
//         return criteriaValue(itemValue);
//       }
      
//       if (Array.isArray(criteriaValue)) {
//         return criteriaValue.includes(itemValue);
//       }
      
//       return itemValue === criteriaValue;
//     });
//   });
// };

// export const sortByKey = (array, key, order = 'asc') => {
//   if (!array || !Array.isArray(array)) return [];
  
//   return [...array]
//     .filter(Boolean)
//     .sort((a, b) => {
//       const aValue = a[key];
//       const bValue = b[key];
      
//       if (typeof aValue === 'string' && typeof bValue === 'string') {
//         return order === 'asc' 
//           ? aValue.localeCompare(bValue)
//           : bValue.localeCompare(aValue);
//       }
      
//       return order === 'asc' ? aValue - bValue : bValue - aValue;
//     });
// };

// export const removeDuplicates = (array, key = null) => {
//   if (!array || !Array.isArray(array)) return [];
  
//   if (!key) {
//     return [...new Set(array.filter(v => v !== null && v !== undefined))];
//   }
  
//   const seen = new Set();
//   return array.filter(Boolean).filter(item => {
//     const value = item[key];
//     if (seen.has(value)) {
//       return false;
//     }
//     seen.add(value);
//     return true;
//   });
// };

// export const paginate = (array, page = 1, pageSize = 10) => {
//   if (!array || !Array.isArray(array)) {
//     return {
//       data: [],
//       page,
//       pageSize,
//       total: 0,
//       totalPages: 0
//     };
//   }
  
//   const start = (page - 1) * pageSize;
//   const end = start + pageSize;
//   return {
//     data: array.slice(start, end),
//     page,
//     pageSize,
//     total: array.length,
//     totalPages: Math.ceil(array.length / pageSize)
//   };
// };

// export const chunkArray = (array, size) => {
//   if (!array || !Array.isArray(array)) return [];
  
//   const chunks = [];
//   for (let i = 0; i < array.length; i += size) {
//     chunks.push(array.slice(i, i + size));
//   }
//   return chunks;
// };

// export const waitFor = (condition, timeout = 10000, interval = 100) => {
//   return new Promise((resolve, reject) => {
//     const startTime = Date.now();
    
//     const checkCondition = () => {
//       if (condition()) {
//         resolve(true);
//       } else if (Date.now() - startTime > timeout) {
//         reject(new Error('Condition timeout'));
//       } else {
//         setTimeout(checkCondition, interval);
//       }
//     };
    
//     checkCondition();
//   });
// };

// export const retry = async (fn, retries = 3, delay = 1000) => {
//   try {
//     return await fn();
//   } catch (error) {
//     if (retries === 0) throw error;
    
//     await sleep(delay);
//     return retry(fn, retries - 1, delay * 2);
//   }
// };

// export const measureTime = async (fn, label = 'Execution') => {
//   const start = performance.now();
//   const result = await fn();
//   const end = performance.now();
//   console.log(`${label} took ${(end - start).toFixed(2)}ms`);
//   return result;
// };

// export const memoize = (fn) => {
//   const cache = new Map();
//   return (...args) => {
//     const key = JSON.stringify(args);
//     if (cache.has(key)) {
//       return cache.get(key);
//     }
//     const result = fn(...args);
//     cache.set(key, result);
//     return result;
//   };
// };

// export const pipe = (...fns) => {
//   return (initialValue) => {
//     return fns.reduce((value, fn) => fn(value), initialValue);
//   };
// };

// export const compose = (...fns) => {
//   return (initialValue) => {
//     return fns.reduceRight((value, fn) => fn(value), initialValue);
//   };
// };

// export const curry = (fn) => {
//   return function curried(...args) {
//     if (args.length >= fn.length) {
//       return fn.apply(this, args);
//     } else {
//       return function(...moreArgs) {
//         return curried.apply(this, args.concat(moreArgs));
//       };
//     }
//   };
// };

// export const throttleAdvanced = (func, limit, options = {}) => {
//   let timeout;
//   let previous = 0;
//   const { leading = true, trailing = true } = options;

//   return function(...args) {
//     const context = this;
//     const now = Date.now();

//     if (!previous && !leading) previous = now;

//     const remaining = limit - (now - previous);

//     if (remaining <= 0 || remaining > limit) {
//       if (timeout) {
//         clearTimeout(timeout);
//         timeout = null;
//       }
//       previous = now;
//       func.apply(context, args);
//     } else if (!timeout && trailing) {
//       timeout = setTimeout(() => {
//         previous = !leading ? 0 : Date.now();
//         timeout = null;
//         func.apply(context, args);
//       }, remaining);
//     }
//   };
// };

// export const debounceAdvanced = (func, wait, options = {}) => {
//   let timeout;
//   const { leading = false, maxWait } = options;
//   let lastCallTime;
//   let lastInvokeTime = 0;
//   let result;

//   function invokeFunc(time) {
//     const args = arguments;
//     lastInvokeTime = time;
//     result = func.apply(this, args);
//     return result;
//   }

//   function leadingEdge(time) {
//     lastInvokeTime = time;
//     timeout = setTimeout(timerExpired, wait);
//     return leading ? invokeFunc(time) : result;
//   }

//   function remainingWait(time) {
//     const timeSinceLastCall = time - lastCallTime;
//     const timeSinceLastInvoke = time - lastInvokeTime;
//     const timeWaiting = wait - timeSinceLastCall;

//     return maxWait !== undefined
//       ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
//       : timeWaiting;
//   }

//   function shouldInvoke(time) {
//     const timeSinceLastCall = time - lastCallTime;
//     const timeSinceLastInvoke = time - lastInvokeTime;

//     return (
//       lastCallTime === undefined ||
//       timeSinceLastCall >= wait ||
//       timeSinceLastCall < 0 ||
//       (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
//     );
//   }

//   function timerExpired() {
//     const time = Date.now();
//     if (shouldInvoke(time)) {
//       return trailingEdge(time);
//     }
//     timeout = setTimeout(timerExpired, remainingWait(time));
//   }

//   function trailingEdge(time) {
//     timeout = undefined;
//     if (trailing) {
//       return invokeFunc(time);
//     }
//     return result;
//   }

//   function cancel() {
//     if (timeout !== undefined) {
//       clearTimeout(timeout);
//     }
//     lastInvokeTime = 0;
//     lastCallTime = 0;
//     timeout = undefined;
//   }

//   function flush() {
//     return timeout === undefined ? result : trailingEdge(Date.now());
//   }

//   function debounced() {
//     const time = Date.now();
//     const isInvoking = shouldInvoke(time);

//     lastCallTime = time;

//     if (isInvoking) {
//       if (timeout === undefined) {
//         return leadingEdge(lastCallTime);
//       }
//       if (maxWait !== undefined) {
//         clearTimeout(timeout);
//         timeout = setTimeout(timerExpired, wait);
//         return invokeFunc(lastCallTime);
//       }
//     }
//     if (timeout === undefined) {
//       timeout = setTimeout(timerExpired, wait);
//     }
//     return result;
//   }

//   debounced.cancel = cancel;
//   debounced.flush = flush;
//   return debounced;
// };

// // ============================================================================
// // UI UTILITIES
// // ============================================================================
// export const getAccessTypeColor = (accessType) => {
//   const colorSchemes = {
//     hotspot: {
//       light: { bg: 'bg-blue-100', text: 'text-blue-800' },
//       dark: { bg: 'bg-blue-800', text: 'text-blue-200' }
//     },
//     pppoe: {
//       light: { bg: 'bg-green-100', text: 'text-green-800' },
//       dark: { bg: 'bg-green-800', text: 'text-green-200' }
//     },
//     dual: {
//       light: { bg: 'bg-purple-100', text: 'text-purple-800' },
//       dark: { bg: 'bg-purple-800', text: 'text-purple-200' }
//     }
//   };

//   return colorSchemes[accessType] || {
//     light: { bg: 'bg-gray-100', text: 'text-gray-800' },
//     dark: { bg: 'bg-gray-800', text: 'text-gray-200' }
//   };
// };

// export const calculatePlanStatistics = (plans) => {
//   if (!plans || !Array.isArray(plans)) {
//     return {
//       totalPlans: 0,
//       totalPurchases: 0,
//       totalActivePlans: 0,
//       highPriorityPlans: 0,
//       freeTrialPlans: 0,
//       paidPlans: 0,
//       inactivePlans: 0,
//       totalRevenue: 0,
//       filteredCount: 0
//     };
//   }

//   const validPlans = plans.filter(Boolean);
  
//   // Calculate basic statistics
//   const totalPlans = validPlans.length;
//   const totalPurchases = validPlans.reduce((sum, plan) => sum + (plan.purchases || 0), 0);
//   const totalActivePlans = validPlans.filter(plan => plan.active).length;
//   const highPriorityPlans = validPlans.filter(plan => plan.priority === 'high').length;
//   const freeTrialPlans = validPlans.filter(plan => plan.plan_type === 'free_trial').length;
//   const paidPlans = validPlans.filter(plan => plan.plan_type === 'paid').length;
//   const inactivePlans = validPlans.filter(plan => !plan.active).length;
//   const totalRevenue = validPlans.reduce((sum, plan) => {
//     return sum + ((plan.price || 0) * (plan.purchases || 0));
//   }, 0);

//   return {
//     totalPlans,
//     totalPurchases,
//     totalActivePlans,
//     highPriorityPlans,
//     freeTrialPlans,
//     paidPlans,
//     inactivePlans,
//     totalRevenue,
//     filteredCount: totalPlans
//   };
// };

// // ============================================================================
// // DEFAULT EXPORT
// // ============================================================================
// export default {
//   deepClone,
//   debounce,
//   throttle,
//   formatNumber,
//   calculateRating,
//   calculatePopularity,
//   calculateCategoryMetrics,
//   calculatePlanPerformance,
//   calculateEffectivePrice,
//   validateDiscountCode,
//   applyDiscountRules,
//   calculateBulkPricing,
//   getBestDiscount,
  
//   // Pricing and calculation utilities
//   calculateTieredPrice,
//   calculatePercentageChange,
//   calculateProgressiveTieredPrice,
//   calculateTieredDiscount,
//   filterByPriceRange,
//   calculateAveragePrice,
//   calculateMedianPrice,
//   calculatePriceStatistics,
//   groupByPriceRange,
//   sortByPrice,
//   findPriceOutliers,
  
//   // Validation utilities
//   validateRequired,
//   validateNumber,
//   validatePrice,
//   validateEmail,
//   validatePhone,
//   validateTimeVariant,
//   isPlanAvailableNow,
//   calculateNextAvailableTime,
//   getAvailabilitySummary,
//   validateAccessMethods,
  
//   // Data manipulation utilities
//   safeObjectEntries,
//   safeObjectKeys,
//   safeObjectValues,
//   generateId,
//   truncateText,
//   capitalize,
//   generateRandomColor,
//   sleep,
//   formatBandwidthDisplay,
//   processAnalyticsData,
//   calculateTrends,
//   parseTimeString,
//   isEmpty,
//   deepMerge,
//   groupBy,
//   filterByCriteria,
//   sortByKey,
//   removeDuplicates,
//   paginate,
//   chunkArray,
//   waitFor,
//   retry,
//   measureTime,
//   memoize,
//   pipe,
//   compose,
//   curry,
//   throttleAdvanced,
//   debounceAdvanced,
  
//   // UI utilities
//   getAccessTypeColor,
//   calculatePlanStatistics,
  
//   // Error handling
//   formatError,
//   formatSuccess,
//   formatApiError
// };







// ============================================================================
// UTILITY FUNCTIONS
// ALIGNED WITH DJANGO BACKEND LOGIC
// FULLY FIXED - WITH COMPLETE NULL SAFETY
// ============================================================================

import { 
  formatBytes, 
  formatTime, 
  formatDate, 
  formatDuration, 
  formatCurrency,
  formatDaysOfWeek 
} from "./formatters";
import { popularityLevels, daysOfWeek } from "./constant";

// ============================================================================
// DEEP CLONE UTILITY
// ============================================================================
export const deepClone = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (Array.isArray(obj)) return obj.map(item => deepClone(item));
  
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
};

// ============================================================================
// DEBOUNCE & THROTTLE
// ============================================================================
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const context = this;
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================
export const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || value === "") return '0';
  
  const num = typeof value === "number" ? value : parseFloat(value);
  if (isNaN(num)) return '0';
  
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

// ============================================================================
// RATING & POPULARITY CALCULATIONS
// ============================================================================
export const calculateRating = (purchases, totalSubscribers = 0) => {
  if (!purchases || purchases === 0) return 0;
  
  // Logarithmic scale: more purchases = higher rating, but caps at 5
  const baseRating = Math.min(5, Math.log10(purchases + 1) * 2);
  
  // Factor in market share if total subscribers provided
  let marketShareBonus = 0;
  if (totalSubscribers > 0) {
    const marketShare = purchases / totalSubscribers;
    marketShareBonus = Math.min(0.5, marketShare * 2.5); // Up to 0.5 stars from market share
  }
  
  const finalRating = Math.min(5, baseRating + marketShareBonus);
  
  // Round to nearest 0.5
  return Math.round(finalRating * 2) / 2;
};

export const calculatePopularity = (subscriberCount) => {
  if (!subscriberCount || subscriberCount === 0) {
    return popularityLevels.LOW;
  }
  
  if (subscriberCount >= popularityLevels.EXTREME.threshold) {
    return popularityLevels.EXTREME;
  } else if (subscriberCount >= popularityLevels.VERY_HIGH.threshold) {
    return popularityLevels.VERY_HIGH;
  } else if (subscriberCount >= popularityLevels.HIGH.threshold) {
    return popularityLevels.HIGH;
  } else if (subscriberCount >= popularityLevels.MEDIUM.threshold) {
    return popularityLevels.MEDIUM;
  } else {
    return popularityLevels.LOW;
  }
};

// ============================================================================
// CATEGORY & PLAN METRICS
// ============================================================================
export const calculateCategoryMetrics = (plans) => {
  // Guard against null/undefined plans
  if (!plans || !Array.isArray(plans)) {
    return {
      categoryMetrics: {},
      totalSubscribers: 0,
      totalRevenue: 0,
      totalPlans: 0,
      averageRating: 0,
      mostPopularCategory: '',
      averageSubscribersPerPlan: 0,
      averageRevenuePerPlan: 0
    };
  }

  const categoryMetrics = {};
  let totalSubscribers = 0;
  let totalRevenue = 0;
  let totalPlans = 0;

  // Calculate totals
  plans.forEach(plan => {
    if (!plan) return; // Skip null/undefined plans
    
    const subscribers = plan.purchases || 0;
    const revenue = (plan.price || 0) * subscribers;
    const category = plan.category || "Uncategorized";
    
    totalSubscribers += subscribers;
    totalRevenue += revenue;
    totalPlans += 1;
    
    if (!categoryMetrics[category]) {
      categoryMetrics[category] = {
        subscribers: 0,
        plans: 0,
        revenue: 0,
        activePlans: 0,
        totalPlans: 0,
        avgPrice: 0,
        priceSum: 0
      };
    }
    
    categoryMetrics[category].subscribers += subscribers;
    categoryMetrics[category].plans += 1;
    categoryMetrics[category].revenue += revenue;
    categoryMetrics[category].priceSum += (plan.price || 0);
    categoryMetrics[category].activePlans += (plan.active ? 1 : 0);
    categoryMetrics[category].totalPlans += 1;
  });

  // Calculate averages and percentages
  Object.keys(categoryMetrics).forEach(category => {
    const metrics = categoryMetrics[category];
    
    metrics.avgRating = calculateRating(metrics.subscribers, totalSubscribers);
    metrics.popularity = calculatePopularity(metrics.subscribers);
    metrics.marketShare = totalSubscribers > 0 ? (metrics.subscribers / totalSubscribers) * 100 : 0;
    metrics.revenueShare = totalRevenue > 0 ? (metrics.revenue / totalRevenue) * 100 : 0;
    metrics.planShare = totalPlans > 0 ? (metrics.plans / totalPlans) * 100 : 0;
    metrics.activeRate = metrics.totalPlans > 0 ? (metrics.activePlans / metrics.totalPlans) * 100 : 0;
    metrics.avgPrice = metrics.plans > 0 ? metrics.priceSum / metrics.plans : 0;
  });

  // Find most popular category
  let mostPopularCategory = '';
  let highestSubscribers = 0;
  
  Object.keys(categoryMetrics).forEach(category => {
    if (categoryMetrics[category].subscribers > highestSubscribers) {
      highestSubscribers = categoryMetrics[category].subscribers;
      mostPopularCategory = category;
    }
  });

  return {
    categoryMetrics,
    totalSubscribers,
    totalRevenue,
    totalPlans,
    averageRating: totalSubscribers > 0 ? calculateRating(totalSubscribers, totalSubscribers) : 0,
    mostPopularCategory,
    averageSubscribersPerPlan: totalPlans > 0 ? totalSubscribers / totalPlans : 0,
    averageRevenuePerPlan: totalPlans > 0 ? totalRevenue / totalPlans : 0
  };
};

export const calculatePlanPerformance = (plan, totalSubscribers, totalRevenue) => {
  // Guard against null/undefined plan
  if (!plan) {
    return {
      rating: 0,
      popularity: popularityLevels.LOW,
      marketShare: 0,
      revenueShare: 0,
      revenue: 0,
      performanceScore: 0,
      performanceLevel: 'Very Poor'
    };
  }

  const subscribers = plan.purchases || 0;
  const revenue = (plan.price || 0) * subscribers;
  
  const rating = calculateRating(subscribers, totalSubscribers);
  const popularity = calculatePopularity(subscribers);
  const marketShare = totalSubscribers > 0 ? (subscribers / totalSubscribers) * 100 : 0;
  const revenueShare = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
  
  // Calculate performance score (0-100)
  const performanceScore = Math.min(100,
    (rating * 10) + // Rating contributes up to 50 points
    (popularity.label === 'Extreme' ? 20 : 
     popularity.label === 'Very High' ? 15 :
     popularity.label === 'High' ? 10 :
     popularity.label === 'Medium' ? 5 : 0) + // Popularity contributes up to 20 points
    (marketShare * 0.5) + // Market share contributes up to 50 points
    (plan.active ? 10 : 0) // Active plans get bonus
  );

  return {
    rating,
    popularity,
    marketShare: parseFloat(marketShare.toFixed(2)),
    revenueShare: parseFloat(revenueShare.toFixed(2)),
    revenue: parseFloat(revenue.toFixed(2)),
    performanceScore: parseFloat(performanceScore.toFixed(1)),
    performanceLevel: performanceScore >= 80 ? 'Excellent' :
                     performanceScore >= 60 ? 'Good' :
                     performanceScore >= 40 ? 'Average' :
                     performanceScore >= 20 ? 'Poor' : 'Very Poor'
  };
};

// ============================================================================
// PRICING & DISCOUNT CALCULATIONS
// ============================================================================
export const calculateEffectivePrice = (price, discountInfo) => {
  if (!price) return 0;
  
  const basePrice = parseFloat(price);
  if (isNaN(basePrice)) return 0;
  
  if (!discountInfo) return basePrice;
  
  if (discountInfo.type === 'percentage') {
    const discount = (basePrice * discountInfo.value) / 100;
    return Math.max(0, basePrice - discount);
  } else if (discountInfo.type === 'fixed') {
    return Math.max(0, basePrice - discountInfo.value);
  }
  
  return basePrice;
};

export const validateDiscountCode = (code, discountRules) => {
  if (!code || typeof code !== 'string' || code.trim() === '') {
    return { valid: false, message: "Discount code is required" };
  }
  
  if (!discountRules || !Array.isArray(discountRules)) {
    return { valid: false, message: "No discount rules available" };
  }
  
  const trimmedCode = code.trim();
  const rule = discountRules.find(r => 
    r?.code === trimmedCode.toUpperCase() || 
    r?.name?.toLowerCase() === trimmedCode.toLowerCase()
  );
  
  if (!rule) {
    return { valid: false, message: "Invalid discount code" };
  }
  
  if (!rule.is_active) {
    return { valid: false, message: "Discount code is not active" };
  }
  
  const now = new Date();
  
  // Check validity dates
  if (rule.valid_from && new Date(rule.valid_from) > now) {
    return { valid: false, message: "Discount code not yet active" };
  }
  
  if (rule.valid_to && new Date(rule.valid_to) < now) {
    return { valid: false, message: "Discount code has expired" };
  }
  
  // Check usage limits
  if (rule.total_usage_limit && rule.current_usage >= rule.total_usage_limit) {
    return { valid: false, message: "Discount code usage limit reached" };
  }
  
  return { 
    valid: true, 
    rule, 
    message: "Discount code applied successfully" 
  };
};

export const applyDiscountRules = (price, discountRules, quantity = 1, clientData = {}) => {
  let finalPrice = parseFloat(price) || 0;
  let appliedDiscounts = [];
  
  if (isNaN(finalPrice) || finalPrice <= 0) {
    return { 
      finalPrice: 0, 
      appliedDiscounts, 
      totalDiscount: 0, 
      discountPercentage: 0 
    };
  }
  
  // Guard against null/undefined discountRules
  if (!discountRules || !Array.isArray(discountRules)) {
    return { 
      finalPrice, 
      appliedDiscounts, 
      totalDiscount: 0, 
      discountPercentage: 0 
    };
  }
  
  // Sort discount rules by priority (highest first)
  const sortedRules = [...discountRules]
    .filter(rule => rule && rule.is_active)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  
  sortedRules.forEach(rule => {
    // Check if rule can apply to this client
    if (rule.rule_type === 'first_time' && clientData.purchase_count > 0) {
      return;
    }
    
    if (rule.rule_type === 'loyalty') {
      const minPurchases = rule.eligibility_criteria?.min_purchases || 3;
      if (clientData.purchase_count < minPurchases) {
        return;
      }
    }
    
    if (rule.rule_type === 'bulk') {
      const minQuantity = rule.eligibility_criteria?.min_quantity || 5;
      if (quantity < minQuantity) {
        return;
      }
    }
    
    // Check quantity limits from price matrix
    const priceMatrix = rule.price_matrix;
    if (priceMatrix) {
      if (priceMatrix.min_quantity && quantity < priceMatrix.min_quantity) {
        return;
      }
      if (priceMatrix.max_quantity && quantity > priceMatrix.max_quantity) {
        return;
      }
    }
    
    let discountAmount = 0;
    
    if (priceMatrix) {
      if (priceMatrix.discount_type === 'percentage') {
        discountAmount = (finalPrice * priceMatrix.percentage) / 100;
      } else if (priceMatrix.discount_type === 'fixed') {
        discountAmount = Math.min(finalPrice, priceMatrix.fixed_amount);
      } else if (priceMatrix.discount_type === 'tiered' && priceMatrix.tier_config) {
        // Find appropriate tier
        const tier = priceMatrix.tier_config
          .filter(Boolean)
          .sort((a, b) => (b.min_qty || 0) - (a.min_qty || 0))
          .find(t => quantity >= (t.min_qty || 0));
        
        if (tier) {
          const tierPrice = (tier.price || 0) * quantity;
          discountAmount = finalPrice - tierPrice;
        }
      }
    }
    
    if (discountAmount > 0) {
      finalPrice -= discountAmount;
      appliedDiscounts.push({
        name: rule.name || 'Discount',
        ruleType: rule.rule_type || 'standard',
        discountType: priceMatrix?.discount_type,
        value: priceMatrix?.percentage || priceMatrix?.fixed_amount || 0,
        amount: discountAmount,
        ruleId: rule.id,
        priceMatrixId: priceMatrix?.id
      });
    }
  });
  
  finalPrice = Math.max(0, finalPrice);
  const totalDiscount = (parseFloat(price) || 0) - finalPrice;
  const discountPercentage = price > 0 ? (totalDiscount / (parseFloat(price) || 1)) * 100 : 0;
  
  return {
    finalPrice,
    appliedDiscounts,
    totalDiscount,
    discountPercentage: parseFloat(discountPercentage.toFixed(2))
  };
};

export const calculateBulkPricing = (basePrice, quantity, bulkDiscounts = []) => {
  if (!basePrice || quantity <= 0) return basePrice * quantity;
  
  if (!bulkDiscounts || !Array.isArray(bulkDiscounts)) {
    return basePrice * quantity;
  }
  
  const sortedDiscounts = [...bulkDiscounts]
    .filter(d => d && d.is_active)
    .sort((a, b) => (b.min_quantity || 0) - (a.min_quantity || 0));
  
  const applicableDiscount = sortedDiscounts.find(d => quantity >= (d.min_quantity || 0));
  
  if (!applicableDiscount) return basePrice * quantity;
  
  let finalPrice = basePrice * quantity;
  
  if (applicableDiscount.discount_type === 'percentage') {
    finalPrice = finalPrice * (1 - (applicableDiscount.percentage || 0) / 100);
  } else if (applicableDiscount.discount_type === 'fixed') {
    finalPrice = Math.max(0, finalPrice - (applicableDiscount.fixed_amount || 0));
  }
  
  return finalPrice;
};

export const getBestDiscount = (price, discountRules, quantity = 1, clientData = {}) => {
  if (!discountRules || !Array.isArray(discountRules) || discountRules.length === 0) {
    return null;
  }
  
  let bestDiscount = null;
  let bestPrice = price;
  
  discountRules.forEach(rule => {
    if (!rule || !rule.is_active) return;
    
    const result = applyDiscountRules(price, [rule], quantity, clientData);
    if (result.finalPrice < bestPrice) {
      bestPrice = result.finalPrice;
      bestDiscount = {
        rule,
        finalPrice: result.finalPrice,
        discountAmount: price - result.finalPrice,
        discountPercentage: ((price - result.finalPrice) / (price || 1)) * 100,
        appliedDiscounts: result.appliedDiscounts
      };
    }
  });
  
  return bestDiscount;
};

// ============================================================================
// TIERED PRICING CALCULATIONS
// ============================================================================
export const calculateTieredPrice = (quantity, tiers, tierType = 'volume') => {
  if (!quantity || quantity <= 0) return 0;
  if (!tiers || !Array.isArray(tiers) || tiers.length === 0) {
    return 0;
  }
  
  // Sort tiers by min_qty in ascending order
  const sortedTiers = [...tiers]
    .filter(Boolean)
    .sort((a, b) => (a.min_qty || 0) - (b.min_qty || 0));
  
  // Find the applicable tier
  let applicableTier = sortedTiers[sortedTiers.length - 1]; // Default to highest tier
  
  for (let i = sortedTiers.length - 1; i >= 0; i--) {
    if (quantity >= (sortedTiers[i].min_qty || 0)) {
      applicableTier = sortedTiers[i];
      break;
    }
  }
  
  if (tierType === 'volume') {
    // Volume pricing: price per unit
    return (applicableTier.price || 0) * quantity;
  } else {
    // Tiered pricing: fixed price for the tier
    return applicableTier.price || 0;
  }
};

export const calculatePercentageChange = (oldValue, newValue, decimals = 1) => {
  if (oldValue === 0 || oldValue === null || oldValue === undefined) {
    return newValue > 0 ? 100 : 0;
  }
  
  const change = ((newValue - oldValue) / oldValue) * 100;
  return parseFloat(change.toFixed(decimals));
};

export const calculateProgressiveTieredPrice = (quantity, tiers) => {
  if (!quantity || quantity <= 0) return 0;
  if (!tiers || !Array.isArray(tiers) || tiers.length === 0) {
    return 0;
  }
  
  // Sort tiers by min_qty
  const sortedTiers = [...tiers]
    .filter(Boolean)
    .sort((a, b) => (a.min_qty || 0) - (b.min_qty || 0));
  
  let totalPrice = 0;
  let remainingQuantity = quantity;
  
  for (let i = 0; i < sortedTiers.length && remainingQuantity > 0; i++) {
    const tier = sortedTiers[i];
    const nextTier = sortedTiers[i + 1];
    
    const tierMax = tier.max_qty || (nextTier ? (nextTier.min_qty || 0) - 1 : Infinity);
    const tierQuantity = Math.min(remainingQuantity, tierMax - (tier.min_qty || 0) + 1);
    
    if (tierQuantity > 0) {
      totalPrice += (tier.price || 0) * tierQuantity;
      remainingQuantity -= tierQuantity;
    }
  }
  
  return totalPrice;
};

export const calculateTieredDiscount = (basePrice, quantity, discountTiers, discountType = 'percentage') => {
  const totalBasePrice = (basePrice || 0) * (quantity || 0);
  
  if (!discountTiers || !Array.isArray(discountTiers) || discountTiers.length === 0) {
    return {
      discountedPrice: totalBasePrice,
      discountAmount: 0,
      discountPercentage: 0,
      appliedTier: null
    };
  }
  
  // Sort discount tiers by min_qty
  const sortedTiers = [...discountTiers]
    .filter(Boolean)
    .sort((a, b) => (b.min_qty || 0) - (a.min_qty || 0)); // Descending for easier matching
  
  let appliedTier = null;
  
  for (const tier of sortedTiers) {
    if (quantity >= (tier.min_qty || 0)) {
      appliedTier = tier;
      break;
    }
  }
  
  if (!appliedTier) {
    return {
      discountedPrice: totalBasePrice,
      discountAmount: 0,
      discountPercentage: 0,
      appliedTier: null
    };
  }
  
  let discountAmount = 0;
  
  if (discountType === 'percentage') {
    discountAmount = totalBasePrice * ((appliedTier.discount || 0) / 100);
  } else if (discountType === 'fixed') {
    discountAmount = Math.min(totalBasePrice, appliedTier.discount || 0);
  }
  
  const discountedPrice = totalBasePrice - discountAmount;
  const discountPercentage = totalBasePrice > 0 ? (discountAmount / totalBasePrice) * 100 : 0;
  
  return {
    discountedPrice,
    discountAmount,
    discountPercentage: parseFloat(discountPercentage.toFixed(2)),
    appliedTier
  };
};

// ============================================================================
// PRICE FILTERING & STATISTICS
// ============================================================================
export const filterByPriceRange = (items, minPrice, maxPrice, priceField = 'price') => {
  if (!items || !Array.isArray(items)) {
    return [];
  }
  
  return items.filter(item => {
    if (!item) return false;
    
    const price = parseFloat(item[priceField] || 0);
    
    // Handle min price
    const minValid = minPrice === null || minPrice === undefined || price >= parseFloat(minPrice);
    
    // Handle max price
    const maxValid = maxPrice === null || maxPrice === undefined || price <= parseFloat(maxPrice);
    
    return minValid && maxValid;
  });
};

export const calculateAveragePrice = (items, priceField = 'price') => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return 0;
  }
  
  const validItems = items.filter(Boolean);
  if (validItems.length === 0) return 0;
  
  const sum = validItems.reduce((total, item) => {
    return total + parseFloat(item[priceField] || 0);
  }, 0);
  
  return parseFloat((sum / validItems.length).toFixed(2));
};

export const calculateMedianPrice = (items, priceField = 'price') => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return 0;
  }
  
  const validItems = items.filter(Boolean);
  if (validItems.length === 0) return 0;
  
  const prices = validItems
    .map(item => parseFloat(item[priceField] || 0))
    .sort((a, b) => a - b);
  
  const middle = Math.floor(prices.length / 2);
  
  if (prices.length % 2 === 0) {
    return parseFloat(((prices[middle - 1] + prices[middle]) / 2).toFixed(2));
  } else {
    return parseFloat(prices[middle].toFixed(2));
  }
};

export const calculatePriceStatistics = (items, priceField = 'price') => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return {
      min: 0,
      max: 0,
      avg: 0,
      median: 0,
      total: 0,
      count: 0
    };
  }
  
  const validItems = items.filter(Boolean);
  if (validItems.length === 0) {
    return {
      min: 0,
      max: 0,
      avg: 0,
      median: 0,
      total: 0,
      count: 0
    };
  }
  
  const prices = validItems.map(item => parseFloat(item[priceField] || 0));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const total = prices.reduce((sum, price) => sum + price, 0);
  
  // Calculate median
  const sortedPrices = [...prices].sort((a, b) => a - b);
  const middle = Math.floor(sortedPrices.length / 2);
  const median = sortedPrices.length % 2 === 0
    ? (sortedPrices[middle - 1] + sortedPrices[middle]) / 2
    : sortedPrices[middle];
  
  return {
    min: parseFloat(min.toFixed(2)),
    max: parseFloat(max.toFixed(2)),
    avg: parseFloat(avg.toFixed(2)),
    median: parseFloat(median.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    count: validItems.length
  };
};

export const groupByPriceRange = (items, ranges, priceField = 'price') => {
  if (!items || !Array.isArray(items) || !ranges || !Array.isArray(ranges)) {
    return {};
  }
  
  const result = {};
  
  // Initialize all ranges
  ranges.forEach(range => {
    if (range && range.label) {
      result[range.label] = [];
    }
  });
  
  // Add "other" category for items outside ranges
  result.other = [];
  
  // Categorize items
  items.filter(Boolean).forEach(item => {
    const price = parseFloat(item[priceField] || 0);
    let placed = false;
    
    for (const range of ranges) {
      if (!range) continue;
      
      const min = range.min !== undefined ? parseFloat(range.min) : -Infinity;
      const max = range.max !== undefined ? parseFloat(range.max) : Infinity;
      
      if (price >= min && price <= max) {
        if (range.label) {
          result[range.label].push(item);
        }
        placed = true;
        break;
      }
    }
    
    if (!placed) {
      result.other.push(item);
    }
  });
  
  return result;
};

export const sortByPrice = (items, order = 'asc', priceField = 'price') => {
  if (!items || !Array.isArray(items)) {
    return [];
  }
  
  return [...items]
    .filter(Boolean)
    .sort((a, b) => {
      const priceA = parseFloat(a[priceField] || 0);
      const priceB = parseFloat(b[priceField] || 0);
      
      return order === 'asc' ? priceA - priceB : priceB - priceA;
    });
};

export const findPriceOutliers = (items, priceField = 'price') => {
  if (!items || !Array.isArray(items) || items.length < 4) {
    return { 
      outliers: [], 
      nonOutliers: items || [],
      stats: {
        q1: 0,
        q3: 0,
        iqr: 0,
        lowerBound: 0,
        upperBound: 0
      }
    };
  }
  
  const validItems = items.filter(Boolean);
  if (validItems.length < 4) {
    return { 
      outliers: [], 
      nonOutliers: validItems,
      stats: {
        q1: 0,
        q3: 0,
        iqr: 0,
        lowerBound: 0,
        upperBound: 0
      }
    };
  }
  
  const prices = validItems.map(item => ({
    item,
    price: parseFloat(item[priceField] || 0)
  })).sort((a, b) => a.price - b.price);
  
  // Calculate Q1, Q3, and IQR
  const q1Index = Math.floor(prices.length * 0.25);
  const q3Index = Math.floor(prices.length * 0.75);
  
  const q1 = prices[q1Index].price;
  const q3 = prices[q3Index].price;
  const iqr = q3 - q1;
  
  const lowerBound = q1 - (1.5 * iqr);
  const upperBound = q3 + (1.5 * iqr);
  
  const outliers = prices.filter(p => p.price < lowerBound || p.price > upperBound);
  const nonOutliers = prices.filter(p => p.price >= lowerBound && p.price <= upperBound);
  
  return {
    outliers: outliers.map(o => o.item),
    nonOutliers: nonOutliers.map(o => o.item),
    stats: {
      q1: parseFloat(q1.toFixed(2)),
      q3: parseFloat(q3.toFixed(2)),
      iqr: parseFloat(iqr.toFixed(2)),
      lowerBound: parseFloat(lowerBound.toFixed(2)),
      upperBound: parseFloat(upperBound.toFixed(2))
    }
  };
};

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================
export const validateRequired = (value, fieldName) => {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`;
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return `${fieldName} is required`;
  }
  
  if (Array.isArray(value) && value.length === 0) {
    return `${fieldName} is required`;
  }
  
  return '';
};

export const validateNumber = (value, fieldName, options = {}) => {
  const { min, max, required = true, integer = false } = options;
  
  if (required && (value === null || value === undefined || value === '')) {
    return `${fieldName} is required`;
  }
  
  if (value === null || value === undefined || value === '') {
    return ''; // Not required and empty
  }
  
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }
  
  if (integer && !Number.isInteger(num)) {
    return `${fieldName} must be an integer`;
  }
  
  if (min !== undefined && num < min) {
    return `${fieldName} must be at least ${min}`;
  }
  
  if (max !== undefined && num > max) {
    return `${fieldName} must be at most ${max}`;
  }
  
  return '';
};

export const validatePrice = (value, planType) => {
  if (!planType) return '';
  
  if (planType === "free_trial") {
    const price = parseFloat(value);
    if (price !== 0) {
      return "Free Trial plans must have price set to 0";
    }
  } else if (planType === "paid" || planType === "promotional") {
    const price = parseFloat(value);
    if (isNaN(price) || price < 0) {
      return "Price must be a positive number";
    }
  }
  return '';
};

export const validateEmail = (email) => {
  if (!email) return "Email is required";
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return "Please enter a valid email address";
  }
  
  return '';
};

export const validatePhone = (phone) => {
  if (!phone) return "Phone number is required";
  
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 9 || cleaned.length > 13) {
    return "Please enter a valid phone number";
  }
  
  return '';
};

// ============================================================================
// TIME VARIANT UTILITIES - COMPLETELY FIXED WITH NULL SAFETY
// ============================================================================

/**
 * Parse time string to seconds
 */
const parseTimeToSeconds = (timeStr) => {
  if (!timeStr) return 0;
  
  if (typeof timeStr === 'number') return timeStr;
  
  if (typeof timeStr === 'string') {
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      const hours = parseInt(parts[0], 10) || 0;
      const minutes = parseInt(parts[1], 10) || 0;
      return (hours * 3600) + (minutes * 60);
    }
  }
  
  return 0;
};

/**
 * FIXED: Check if plan is available now - WITH COMPLETE NULL SAFETY
 */
export const isPlanAvailableNow = (plan) => {
  // CRITICAL: Guard against null/undefined plan
  if (!plan) {
    console.warn('isPlanAvailableNow called with null/undefined plan');
    return false;
  }
  
  // Check if time_variant exists and is active
  if (!plan.time_variant || typeof plan.time_variant !== 'object') {
    return true; // No time variant, always available
  }
  
  const timeVariant = plan.time_variant;
  
  // Check if time variant is active
  if (!timeVariant.is_active) {
    return true; // Time variant not active
  }
  
  if (timeVariant.force_available) {
    return true; // Override enabled
  }
  
  const now = new Date();
  const currentTime = now.getHours() * 3600 + now.getMinutes() * 60;
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase().slice(0, 3);
  
  // Check time of day availability
  if (timeVariant.start_time && timeVariant.end_time) {
    const startSeconds = parseTimeToSeconds(timeVariant.start_time);
    const endSeconds = parseTimeToSeconds(timeVariant.end_time);
    
    if (currentTime < startSeconds || currentTime > endSeconds) {
      return false;
    }
  }
  
  // Check day of week availability
  if (timeVariant.available_days && Array.isArray(timeVariant.available_days) && timeVariant.available_days.length > 0) {
    if (!timeVariant.available_days.includes(currentDay)) {
      return false;
    }
  }
  
  // Check scheduled availability
  if (timeVariant.schedule_active && timeVariant.schedule_start_date && timeVariant.schedule_end_date) {
    const startDate = new Date(timeVariant.schedule_start_date);
    const endDate = new Date(timeVariant.schedule_end_date);
    
    if (now < startDate || now > endDate) {
      return false;
    }
  }
  
  // Check duration-based availability
  if (timeVariant.duration_active && timeVariant.duration_start_date) {
    const startDate = new Date(timeVariant.duration_start_date);
    let endDate = new Date(startDate);
    
    const durationValue = timeVariant.duration_value || 0;
    
    if (timeVariant.duration_unit === 'hours') {
      endDate.setHours(endDate.getHours() + durationValue);
    } else if (timeVariant.duration_unit === 'days') {
      endDate.setDate(endDate.getDate() + durationValue);
    } else if (timeVariant.duration_unit === 'weeks') {
      endDate.setDate(endDate.getDate() + (durationValue * 7));
    } else if (timeVariant.duration_unit === 'months') {
      endDate.setMonth(endDate.getMonth() + durationValue);
    }
    
    if (now > endDate) {
      return false;
    }
  }
  
  // Check exclusion dates
  if (timeVariant.exclusion_dates && Array.isArray(timeVariant.exclusion_dates)) {
    const todayStr = now.toISOString().split('T')[0];
    if (timeVariant.exclusion_dates.includes(todayStr)) {
      return false;
    }
  }
  
  return true;
};

/**
 * FIXED: Validate time variant configuration
 */
export const validateTimeVariant = (timeVariant) => {
  const errors = {};
  
  // Guard against null/undefined
  if (!timeVariant) {
    return errors; // No validation needed if not provided
  }
  
  if (!timeVariant.is_active) {
    return errors; // No validation needed if not active
  }
  
  // Validate time range
  if (timeVariant.start_time && timeVariant.end_time) {
    const startSeconds = parseTimeToSeconds(timeVariant.start_time);
    const endSeconds = parseTimeToSeconds(timeVariant.end_time);
    
    if (startSeconds >= endSeconds) {
      errors.end_time = "End time must be after start time";
    }
  }
  
  // Validate available days
  if (timeVariant.available_days && Array.isArray(timeVariant.available_days)) {
    const validDays = daysOfWeek.map(day => day.value);
    const invalidDays = timeVariant.available_days.filter(day => !validDays.includes(day));
    if (invalidDays.length > 0) {
      errors.available_days = `Invalid day(s): ${invalidDays.join(', ')}. Must be one of ${validDays.join(', ')}`;
    }
  }
  
  // Validate schedule dates
  if (timeVariant.schedule_active) {
    if (!timeVariant.schedule_start_date) {
      errors.schedule_start_date = "Schedule start date is required when schedule is active";
    }
    if (!timeVariant.schedule_end_date) {
      errors.schedule_end_date = "Schedule end date is required when schedule is active";
    } else if (timeVariant.schedule_start_date && timeVariant.schedule_end_date) {
      const start = new Date(timeVariant.schedule_start_date);
      const end = new Date(timeVariant.schedule_end_date);
      if (end <= start) {
        errors.schedule_end_date = "Schedule end date must be after start date";
      }
    }
  }
  
  // Validate duration
  if (timeVariant.duration_active) {
    if (!timeVariant.duration_value || timeVariant.duration_value <= 0) {
      errors.duration_value = "Duration value must be greater than 0";
    }
    if (!timeVariant.duration_start_date) {
      errors.duration_start_date = "Duration start date is required when duration is active";
    }
  }
  
  // Validate exclusion dates
  if (timeVariant.exclusion_dates && !Array.isArray(timeVariant.exclusion_dates)) {
    errors.exclusion_dates = "Exclusion dates must be an array";
  }
  
  return errors;
};

/**
 * Calculate next available time
 */
export const calculateNextAvailableTime = (timeVariant) => {
  // Guard against null/undefined
  if (!timeVariant || !timeVariant.is_active) return null;
  
  const now = new Date();
  
  // Check time of day restrictions
  if (timeVariant.start_time && timeVariant.end_time) {
    const currentTime = now.getHours() * 3600 + now.getMinutes() * 60;
    const startSeconds = parseTimeToSeconds(timeVariant.start_time);
    
    if (currentTime < startSeconds) {
      const hours = Math.floor(startSeconds / 3600);
      const minutes = Math.floor((startSeconds % 3600) / 60);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } else {
      // Will be available tomorrow
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const hours = Math.floor(startSeconds / 3600);
      const minutes = Math.floor((startSeconds % 3600) / 60);
      return `${tomorrow.toLocaleDateString()} at ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  }
  
  // Check scheduled availability
  if (timeVariant.schedule_active && timeVariant.schedule_start_date) {
    const startDate = new Date(timeVariant.schedule_start_date);
    if (now < startDate) {
      return formatDate(startDate, true);
    }
  }
  
  return null;
};

/**
 * Get availability summary
 */
export const getAvailabilitySummary = (timeVariant) => {
  // Guard against null/undefined
  if (!timeVariant || !timeVariant.is_active) {
    return { status: 'always_available', message: 'Available at all times', restrictions: [] };
  }
  
  const parts = [];
  
  if (timeVariant.start_time && timeVariant.end_time) {
    parts.push(`${formatTime(timeVariant.start_time)}-${formatTime(timeVariant.end_time)}`);
  }
  
  if (timeVariant.available_days && Array.isArray(timeVariant.available_days) && timeVariant.available_days.length > 0) {
    parts.push(`on ${formatDaysOfWeek(timeVariant.available_days)}`);
  }
  
  if (timeVariant.schedule_active && timeVariant.schedule_start_date && timeVariant.schedule_end_date) {
    parts.push(`from ${formatDate(timeVariant.schedule_start_date)} to ${formatDate(timeVariant.schedule_end_date)}`);
  }
  
  if (timeVariant.duration_active && timeVariant.duration_start_date) {
    const durationText = `${timeVariant.duration_value || 0} ${timeVariant.duration_unit || 'days'}`;
    parts.push(`for ${durationText} from ${formatDate(timeVariant.duration_start_date)}`);
  }
  
  const message = parts.length > 0 
    ? `Available ${parts.join(' ')}`
    : 'Available with time restrictions';
  
  return { 
    status: 'time_restricted', 
    message,
    restrictions: parts 
  };
};

export const validateAccessMethods = (accessMethods) => {
  const errors = {};
  
  if (!accessMethods || typeof accessMethods !== 'object') {
    return { valid: false, errors: { general: 'Access methods must be an object' } };
  }
  
  // Check for required methods
  if (!accessMethods.hotspot && !accessMethods.pppoe) {
    errors.general = 'At least one access method must be configured';
  }
  
  // Validate hotspot configuration if enabled
  if (accessMethods.hotspot?.enabled) {
    const hotspot = accessMethods.hotspot;
    const requiredFields = ['downloadSpeed', 'uploadSpeed', 'dataLimit', 'usageLimit'];
    
    requiredFields.forEach(field => {
      if (!hotspot[field] || !hotspot[field].value) {
        errors[`hotspot_${field}`] = `${field} is required for hotspot`;
      }
    });
    
    if (hotspot.maxDevices && (hotspot.maxDevices < 1 || hotspot.maxDevices > 100)) {
      errors.hotspot_maxDevices = 'Max devices must be between 1 and 100';
    }
  }
  
  // Validate PPPoE configuration if enabled
  if (accessMethods.pppoe?.enabled) {
    const pppoe = accessMethods.pppoe;
    const requiredFields = ['downloadSpeed', 'uploadSpeed', 'dataLimit', 'usageLimit'];
    
    requiredFields.forEach(field => {
      if (!pppoe[field] || !pppoe[field].value) {
        errors[`pppoe_${field}`] = `${field} is required for PPPoE`;
      }
    });
    
    if (pppoe.mtu && (pppoe.mtu < 576 || pppoe.mtu > 1500)) {
      errors.pppoe_mtu = 'MTU must be between 576 and 1500';
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

// ============================================================================
// DATA MANIPULATION UTILITIES
// ============================================================================
export const safeObjectEntries = (obj) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return [];
  }
  return Object.entries(obj);
};

export const safeObjectKeys = (obj) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return [];
  }
  return Object.keys(obj);
};

export const safeObjectValues = (obj) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return [];
  }
  return Object.values(obj);
};

export const generateId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 9);
  return `${prefix}${timestamp}-${randomStr}`;
};

export const truncateText = (text, maxLength = 100, ellipsis = '...') => {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength - ellipsis.length) + ellipsis;
};

export const capitalize = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const generateRandomColor = () => {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const formatBandwidthDisplay = (kbps) => {
  return formatBytes((kbps || 0) * 1024); // Convert Kbps to bytes
};

// ============================================================================
// ANALYTICS & TRENDS
// ============================================================================
export const processAnalyticsData = (plans, timeRange = '30d') => {
  // Guard against null/undefined plans
  if (!plans || !Array.isArray(plans)) {
    return {
      timeRange,
      totalPlans: 0,
      activePlans: 0,
      totalSubscribers: 0,
      totalRevenue: 0,
      avgSubscribersPerPlan: 0,
      avgRevenuePerPlan: 0,
      categoryStats: [],
      topCategories: [],
      trends: {
        subscriberGrowth: 0,
        revenueGrowth: 0,
        subscriberTrend: 'stable',
        revenueTrend: 'stable',
        previousSubscribers: 0,
        previousRevenue: 0
      },
      timestamp: new Date().toISOString()
    };
  }

  const now = new Date();
  let startDate = new Date();
  
  // Calculate start date based on time range
  switch (timeRange) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'yesterday':
      startDate.setDate(now.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case '7d':
      startDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(now.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(now.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate = new Date(0);
  }

  // Filter plans created within the time range
  const filteredPlans = plans.filter(plan => {
    if (!plan) return false;
    const planDate = new Date(plan.created_at || plan.createdAt || Date.now());
    return planDate >= startDate;
  });

  // Calculate statistics
  const categoryStats = {};
  let totalSubscribers = 0;
  let totalRevenue = 0;
  let activePlans = 0;

  filteredPlans.forEach(plan => {
    if (!plan) return;
    
    const subscribers = plan.purchases || 0;
    const revenue = (plan.price || 0) * subscribers;
    const category = plan.category || "Uncategorized";
    
    totalSubscribers += subscribers;
    totalRevenue += revenue;
    if (plan.active) activePlans++;

    if (!categoryStats[category]) {
      categoryStats[category] = {
        plans: 0,
        subscribers: 0,
        revenue: 0,
        activePlans: 0
      };
    }

    categoryStats[category].plans++;
    categoryStats[category].subscribers += subscribers;
    categoryStats[category].revenue += revenue;
    if (plan.active) categoryStats[category].activePlans++;
  });

  // Convert category stats to array
  const categoryStatsArray = Object.entries(categoryStats).map(([category, stats]) => ({
    category,
    ...stats,
    avgSubscribersPerPlan: stats.plans > 0 ? stats.subscribers / stats.plans : 0,
    avgRevenuePerPlan: stats.plans > 0 ? stats.revenue / stats.plans : 0
  })).sort((a, b) => b.subscribers - a.subscribers);

  // Calculate trends
  const previousStartDate = new Date(startDate);
  const previousEndDate = new Date(startDate);
  previousStartDate.setDate(previousStartDate.getDate() - (timeRange === 'today' ? 1 : 
                                                         timeRange === '7d' ? 7 : 
                                                         timeRange === '30d' ? 30 : 0));
  
  const previousPlans = plans.filter(plan => {
    if (!plan) return false;
    const planDate = new Date(plan.created_at || plan.createdAt || Date.now());
    return planDate >= previousStartDate && planDate < previousEndDate;
  });

  const previousSubscribers = previousPlans.reduce((sum, plan) => sum + (plan?.purchases || 0), 0);
  const previousRevenue = previousPlans.reduce((sum, plan) => sum + ((plan?.price || 0) * (plan?.purchases || 0)), 0);
  
  const subscriberGrowth = previousSubscribers > 0 
    ? ((totalSubscribers - previousSubscribers) / previousSubscribers) * 100 
    : totalSubscribers > 0 ? 100 : 0;
  
  const revenueGrowth = previousRevenue > 0 
    ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
    : totalRevenue > 0 ? 100 : 0;

  return {
    timeRange,
    totalPlans: filteredPlans.length,
    activePlans,
    totalSubscribers,
    totalRevenue,
    avgSubscribersPerPlan: filteredPlans.length > 0 ? totalSubscribers / filteredPlans.length : 0,
    avgRevenuePerPlan: filteredPlans.length > 0 ? totalRevenue / filteredPlans.length : 0,
    categoryStats: categoryStatsArray,
    topCategories: categoryStatsArray.slice(0, 5),
    trends: {
      subscriberGrowth: parseFloat(subscriberGrowth.toFixed(1)),
      revenueGrowth: parseFloat(revenueGrowth.toFixed(1)),
      subscriberTrend: subscriberGrowth > 0 ? 'up' : subscriberGrowth < 0 ? 'down' : 'stable',
      revenueTrend: revenueGrowth > 0 ? 'up' : revenueGrowth < 0 ? 'down' : 'stable',
      previousSubscribers,
      previousRevenue
    },
    timestamp: now.toISOString()
  };
};

export const calculateTrends = (dataPoints, key = 'value') => {
  if (!dataPoints || !Array.isArray(dataPoints) || dataPoints.length < 2) {
    return { growthRate: 0, trend: 'stable', average: 0 };
  }

  const validPoints = dataPoints.filter(Boolean);
  if (validPoints.length < 2) {
    return { growthRate: 0, trend: 'stable', average: 0 };
  }

  const recent = validPoints.slice(-7);
  const previous = validPoints.slice(-14, -7);
  
  const recentAvg = recent.reduce((sum, point) => sum + (point?.[key] || 0), 0) / recent.length;
  const previousAvg = previous.reduce((sum, point) => sum + (point?.[key] || 0), 0) / previous.length;
  
  const growthRate = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 100;
  
  return {
    growthRate: parseFloat(growthRate.toFixed(1)),
    trend: growthRate > 5 ? 'up' : growthRate < -5 ? 'down' : 'stable',
    recentAverage: parseFloat(recentAvg.toFixed(1)),
    previousAverage: parseFloat(previousAvg.toFixed(1))
  };
};

// ============================================================================
// ERROR HANDLING
// ============================================================================
export const formatError = (error) => {
  if (!error) return "An unknown error occurred";
  
  if (typeof error === 'string') return error;
  
  if (error.message) return error.message;
  
  if (error.response?.data?.error) return error.response.data.error;
  
  if (error.response?.data?.message) return error.response.data.message;
  
  if (error.response?.statusText) return `${error.response.status}: ${error.response.statusText}`;
  
  return "An error occurred. Please try again.";
};

export const formatSuccess = (message, data = null) => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

export const formatApiError = (error, statusCode = 400) => {
  return {
    success: false,
    error: formatError(error),
    statusCode,
    timestamp: new Date().toISOString()
  };
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
export const parseTimeString = (timeStr) => {
  if (!timeStr) return null;
  
  if (typeof timeStr === 'string' && timeStr.includes(':')) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours || 0, minutes || 0, 0, 0);
    return date;
  }
  
  // If it's already a number (seconds), convert to Date
  if (typeof timeStr === 'number') {
    const date = new Date();
    const hours = Math.floor(timeStr / 3600);
    const minutes = Math.floor((timeStr % 3600) / 60);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }
  
  return null;
};

export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
};

export const deepMerge = (target, source) => {
  const output = Object.assign({}, target);
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
};

const isObject = (item) => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

export const groupBy = (array, key) => {
  if (!array || !Array.isArray(array)) return {};
  
  return array.filter(Boolean).reduce((result, item) => {
    const keyValue = item[key];
    if (!result[keyValue]) {
      result[keyValue] = [];
    }
    result[keyValue].push(item);
    return result;
  }, {});
};

export const filterByCriteria = (array, criteria) => {
  if (!array || !Array.isArray(array)) return [];
  
  return array.filter(Boolean).filter(item => {
    return Object.keys(criteria || {}).every(key => {
      if (criteria[key] === undefined || criteria[key] === null) return true;
      
      const itemValue = item[key];
      const criteriaValue = criteria[key];
      
      if (typeof criteriaValue === 'function') {
        return criteriaValue(itemValue);
      }
      
      if (Array.isArray(criteriaValue)) {
        return criteriaValue.includes(itemValue);
      }
      
      return itemValue === criteriaValue;
    });
  });
};

export const sortByKey = (array, key, order = 'asc') => {
  if (!array || !Array.isArray(array)) return [];
  
  return [...array]
    .filter(Boolean)
    .sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    });
};

export const removeDuplicates = (array, key = null) => {
  if (!array || !Array.isArray(array)) return [];
  
  if (!key) {
    return [...new Set(array.filter(v => v !== null && v !== undefined))];
  }
  
  const seen = new Set();
  return array.filter(Boolean).filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

export const paginate = (array, page = 1, pageSize = 10) => {
  if (!array || !Array.isArray(array)) {
    return {
      data: [],
      page,
      pageSize,
      total: 0,
      totalPages: 0
    };
  }
  
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    data: array.slice(start, end),
    page,
    pageSize,
    total: array.length,
    totalPages: Math.ceil(array.length / pageSize)
  };
};

export const chunkArray = (array, size) => {
  if (!array || !Array.isArray(array)) return [];
  
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const waitFor = (condition, timeout = 10000, interval = 100) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkCondition = () => {
      if (condition()) {
        resolve(true);
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Condition timeout'));
      } else {
        setTimeout(checkCondition, interval);
      }
    };
    
    checkCondition();
  });
};

export const retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    
    await sleep(delay);
    return retry(fn, retries - 1, delay * 2);
  }
};

export const measureTime = async (fn, label = 'Execution') => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  console.log(`${label} took ${(end - start).toFixed(2)}ms`);
  return result;
};

export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

export const pipe = (...fns) => {
  return (initialValue) => {
    return fns.reduce((value, fn) => fn(value), initialValue);
  };
};

export const compose = (...fns) => {
  return (initialValue) => {
    return fns.reduceRight((value, fn) => fn(value), initialValue);
  };
};

export const curry = (fn) => {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return function(...moreArgs) {
        return curried.apply(this, args.concat(moreArgs));
      };
    }
  };
};

export const throttleAdvanced = (func, limit, options = {}) => {
  let timeout;
  let previous = 0;
  const { leading = true, trailing = true } = options;

  return function(...args) {
    const context = this;
    const now = Date.now();

    if (!previous && !leading) previous = now;

    const remaining = limit - (now - previous);

    if (remaining <= 0 || remaining > limit) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(context, args);
    } else if (!timeout && trailing) {
      timeout = setTimeout(() => {
        previous = !leading ? 0 : Date.now();
        timeout = null;
        func.apply(context, args);
      }, remaining);
    }
  };
};

export const debounceAdvanced = (func, wait, options = {}) => {
  let timeout;
  const { leading = false, maxWait } = options;
  let lastCallTime;
  let lastInvokeTime = 0;
  let result;

  function invokeFunc(time) {
    const args = arguments;
    lastInvokeTime = time;
    result = func.apply(this, args);
    return result;
  }

  function leadingEdge(time) {
    lastInvokeTime = time;
    timeout = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;

    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  }

  function timerExpired() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timeout = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timeout = undefined;
    if (trailing) {
      return invokeFunc(time);
    }
    return result;
  }

  function cancel() {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
    lastInvokeTime = 0;
    lastCallTime = 0;
    timeout = undefined;
  }

  function flush() {
    return timeout === undefined ? result : trailingEdge(Date.now());
  }

  function debounced() {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastCallTime = time;

    if (isInvoking) {
      if (timeout === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxWait !== undefined) {
        clearTimeout(timeout);
        timeout = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timeout === undefined) {
      timeout = setTimeout(timerExpired, wait);
    }
    return result;
  }

  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
};

// ============================================================================
// UI UTILITIES
// ============================================================================
export const getAccessTypeColor = (accessType) => {
  const colorSchemes = {
    hotspot: {
      light: { bg: 'bg-blue-100', text: 'text-blue-800' },
      dark: { bg: 'bg-blue-800', text: 'text-blue-200' }
    },
    pppoe: {
      light: { bg: 'bg-green-100', text: 'text-green-800' },
      dark: { bg: 'bg-green-800', text: 'text-green-200' }
    },
    dual: {
      light: { bg: 'bg-purple-100', text: 'text-purple-800' },
      dark: { bg: 'bg-purple-800', text: 'text-purple-200' }
    }
  };

  return colorSchemes[accessType] || {
    light: { bg: 'bg-gray-100', text: 'text-gray-800' },
    dark: { bg: 'bg-gray-800', text: 'text-gray-200' }
  };
};

export const calculatePlanStatistics = (plans) => {
  if (!plans || !Array.isArray(plans)) {
    return {
      totalPlans: 0,
      totalPurchases: 0,
      totalActivePlans: 0,
      highPriorityPlans: 0,
      freeTrialPlans: 0,
      paidPlans: 0,
      inactivePlans: 0,
      totalRevenue: 0,
      filteredCount: 0
    };
  }

  const validPlans = plans.filter(Boolean);
  
  // Calculate basic statistics
  const totalPlans = validPlans.length;
  const totalPurchases = validPlans.reduce((sum, plan) => sum + (plan.purchases || 0), 0);
  const totalActivePlans = validPlans.filter(plan => plan.active).length;
  const highPriorityPlans = validPlans.filter(plan => plan.priority === 'high').length;
  const freeTrialPlans = validPlans.filter(plan => plan.plan_type === 'free_trial').length;
  const paidPlans = validPlans.filter(plan => plan.plan_type === 'paid').length;
  const inactivePlans = validPlans.filter(plan => !plan.active).length;
  const totalRevenue = validPlans.reduce((sum, plan) => {
    return sum + ((plan.price || 0) * (plan.purchases || 0));
  }, 0);

  return {
    totalPlans,
    totalPurchases,
    totalActivePlans,
    highPriorityPlans,
    freeTrialPlans,
    paidPlans,
    inactivePlans,
    totalRevenue,
    filteredCount: totalPlans
  };
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================
export default {
  deepClone,
  debounce,
  throttle,
  formatNumber,
  calculateRating,
  calculatePopularity,
  calculateCategoryMetrics,
  calculatePlanPerformance,
  calculateEffectivePrice,
  validateDiscountCode,
  applyDiscountRules,
  calculateBulkPricing,
  getBestDiscount,
  
  // Pricing and calculation utilities
  calculateTieredPrice,
  calculatePercentageChange,
  calculateProgressiveTieredPrice,
  calculateTieredDiscount,
  filterByPriceRange,
  calculateAveragePrice,
  calculateMedianPrice,
  calculatePriceStatistics,
  groupByPriceRange,
  sortByPrice,
  findPriceOutliers,
  
  // Validation utilities
  validateRequired,
  validateNumber,
  validatePrice,
  validateEmail,
  validatePhone,
  validateTimeVariant,
  isPlanAvailableNow,
  calculateNextAvailableTime,
  getAvailabilitySummary,
  validateAccessMethods,
  
  // Data manipulation utilities
  safeObjectEntries,
  safeObjectKeys,
  safeObjectValues,
  generateId,
  truncateText,
  capitalize,
  generateRandomColor,
  sleep,
  formatBandwidthDisplay,
  processAnalyticsData,
  calculateTrends,
  parseTimeString,
  isEmpty,
  deepMerge,
  groupBy,
  filterByCriteria,
  sortByKey,
  removeDuplicates,
  paginate,
  chunkArray,
  waitFor,
  retry,
  measureTime,
  memoize,
  pipe,
  compose,
  curry,
  throttleAdvanced,
  debounceAdvanced,
  
  // UI utilities
  getAccessTypeColor,
  calculatePlanStatistics,
  
  // Error handling
  formatError,
  formatSuccess,
  formatApiError
};