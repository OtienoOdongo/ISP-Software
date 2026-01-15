
// // ============================================================================
// // UTILITY FUNCTIONS
// // ============================================================================

// import { formatBytes, formatTime, formatDate, formatDuration, formatCurrency } from "./formatters";
// import { popularityLevels } from "./constants";

// // Deep clone utility
// export const deepClone = (obj) => {
//   if (!obj || typeof obj !== 'object') return obj;
//   if (obj instanceof Date) return new Date(obj.getTime());
  
//   return JSON.parse(JSON.stringify(obj));
// };

// // Debounce function
// export const debounce = (func, wait) => {
//   let timeout;
//   return function executedFunction(...args) {
//     const later = () => {
//       clearTimeout(timeout);
//       func(...args);
//     };
//     clearTimeout(timeout);
//     timeout = setTimeout(later, wait);
//   };
// };

// // Throttle function
// export const throttle = (func, limit) => {
//   let inThrottle;
//   return function(...args) {
//     if (!inThrottle) {
//       func.apply(this, args);
//       inThrottle = true;
//       setTimeout(() => (inThrottle = false), limit);
//     }
//   };
// };

// // Format number with decimals
// export const formatNumber = (value, decimals = 2) => {
//   if (value === null || value === undefined || value === "") return "0";
  
//   const num = typeof value === "number" ? value : parseFloat(value);
//   if (isNaN(num)) return "0";
  
//   return num.toLocaleString('en-US', {
//     minimumFractionDigits: decimals,
//     maximumFractionDigits: decimals
//   });
// };

// // Calculate rating based on purchases with enhanced algorithm
// export const calculateRating = (purchases, totalSubscribers = 0, reviews = []) => {
//   if (!purchases || purchases === 0) return 0;
  
//   // Base rating from purchases (logarithmic scale)
//   const baseRating = Math.min(5, Math.log10(purchases + 1) * 1.2);
  
//   // Factor in reviews if available
//   let reviewBonus = 0;
//   if (reviews.length > 0) {
//     const avgReview = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
//     reviewBonus = Math.min(1, (avgReview - 3) * 0.5); // Up to 1 star bonus from reviews
//   }
  
//   // Factor in market share
//   let marketShareBonus = 0;
//   if (totalSubscribers > 0) {
//     const marketShare = purchases / totalSubscribers;
//     marketShareBonus = Math.min(0.5, marketShare * 5); // Up to 0.5 stars from market share
//   }
  
//   return Math.min(5, baseRating + reviewBonus + marketShareBonus);
// };

// // Calculate popularity level based on subscriber count
// export const calculatePopularity = (subscriberCount) => {
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

// // Calculate category popularity metrics
// export const calculateCategoryMetrics = (plans) => {
//   const categoryMetrics = {};
//   let totalSubscribers = 0;
//   let totalRevenue = 0;

//   // Calculate totals
//   plans.forEach(plan => {
//     const subscribers = plan.purchases || 0;
//     const revenue = (plan.price || 0) * subscribers;
    
//     totalSubscribers += subscribers;
//     totalRevenue += revenue;
    
//     const category = plan.category || "Uncategorized";
    
//     if (!categoryMetrics[category]) {
//       categoryMetrics[category] = {
//         subscribers: 0,
//         plans: 0,
//         revenue: 0,
//         avgRating: 0,
//         activePlans: 0,
//         totalPlans: 0
//       };
//     }
    
//     categoryMetrics[category].subscribers += subscribers;
//     categoryMetrics[category].plans += 1;
//     categoryMetrics[category].revenue += revenue;
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
//     metrics.planShare = plans.length > 0 ? (metrics.plans / plans.length) * 100 : 0;
//     metrics.activeRate = metrics.totalPlans > 0 ? (metrics.activePlans / metrics.totalPlans) * 100 : 0;
//   });

//   return {
//     categoryMetrics,
//     totalSubscribers,
//     totalRevenue,
//     averageRating: totalSubscribers > 0 ? calculateRating(totalSubscribers, totalSubscribers) : 0,
//     mostPopularCategory: Object.keys(categoryMetrics).reduce((a, b) => 
//       categoryMetrics[a].subscribers > categoryMetrics[b].subscribers ? a : b, ''
//     )
//   };
// };

// // Calculate plan performance metrics
// export const calculatePlanPerformance = (plan, totalSubscribers, totalRevenue) => {
//   const subscribers = plan.purchases || 0;
//   const revenue = (plan.price || 0) * subscribers;
  
//   const rating = calculateRating(subscribers, totalSubscribers, plan.customer_feedback || []);
//   const popularity = calculatePopularity(subscribers);
//   const marketShare = totalSubscribers > 0 ? (subscribers / totalSubscribers) * 100 : 0;
//   const revenueShare = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
  
//   // Calculate conversion rate if views data is available
//   const conversionRate = plan.views > 0 ? (subscribers / plan.views) * 100 : 0;
  
//   // Calculate performance score (0-100)
//   const performanceScore = Math.min(100,
//     (rating * 10) + // Rating contributes up to 50 points
//     (popularity.label === 'Extreme' ? 20 : 
//      popularity.label === 'Very High' ? 15 :
//      popularity.label === 'High' ? 10 :
//      popularity.label === 'Medium' ? 5 : 0) + // Popularity contributes up to 20 points
//     (marketShare * 0.3) + // Market share contributes up to 30 points
//     (conversionRate * 0.5) // Conversion rate contributes up to 50 points
//   );

//   return {
//     rating,
//     popularity,
//     marketShare,
//     revenueShare,
//     revenue,
//     conversionRate,
//     performanceScore,
//     performanceLevel: performanceScore >= 80 ? 'Excellent' :
//                      performanceScore >= 60 ? 'Good' :
//                      performanceScore >= 40 ? 'Average' :
//                      performanceScore >= 20 ? 'Poor' : 'Very Poor'
//   };
// };

// // Calculate effective price with discounts
// export const calculateEffectivePrice = (price, discountInfo) => {
//   if (!discountInfo || !price) return parseFloat(price) || 0;
  
//   const basePrice = parseFloat(price);
//   if (isNaN(basePrice)) return 0;
  
//   if (discountInfo.type === 'percentage') {
//     const discount = (basePrice * discountInfo.value) / 100;
//     return Math.max(0, basePrice - discount);
//   } else if (discountInfo.type === 'fixed') {
//     return Math.max(0, basePrice - discountInfo.value);
//   }
  
//   return basePrice;
// };

// // Validate discount code
// export const validateDiscountCode = (code, discountRules) => {
//   if (!code) return { valid: false, message: "Discount code is required" };
  
//   const rule = discountRules.find(r => 
//     r.code === code.toUpperCase() || 
//     r.name.toLowerCase() === code.toLowerCase()
//   );
  
//   if (!rule) {
//     return { valid: false, message: "Invalid discount code" };
//   }
  
//   const now = new Date();
//   const startDate = rule.start_date ? new Date(rule.start_date) : null;
//   const endDate = rule.end_date ? new Date(rule.end_date) : null;
  
//   if (startDate && now < startDate) {
//     return { valid: false, message: "Discount code not yet active" };
//   }
  
//   if (endDate && now > endDate) {
//     return { valid: false, message: "Discount code has expired" };
//   }
  
//   if (rule.max_uses !== null && rule.uses >= rule.max_uses) {
//     return { valid: false, message: "Discount code usage limit reached" };
//   }
  
//   return { valid: true, rule, message: "Discount code applied successfully" };
// };

// // Apply discount rules to price
// export const applyDiscountRules = (price, discountRules, quantity = 1) => {
//   let finalPrice = parseFloat(price);
//   let appliedDiscounts = [];
  
//   if (isNaN(finalPrice) || finalPrice <= 0) return { finalPrice, appliedDiscounts };
  
//   // Sort discount rules by priority (highest first)
//   const sortedRules = [...discountRules].sort((a, b) => (b.priority || 0) - (a.priority || 0));
  
//   sortedRules.forEach(rule => {
//     if (!rule.active) return;
    
//     // Check quantity requirements
//     if (rule.min_quantity && quantity < rule.min_quantity) return;
//     if (rule.max_quantity && quantity > rule.max_quantity) return;
    
//     let discountAmount = 0;
    
//     if (rule.type === 'percentage') {
//       discountAmount = (finalPrice * rule.value) / 100;
//     } else if (rule.type === 'fixed') {
//       discountAmount = Math.min(finalPrice, rule.value);
//     }
    
//     if (discountAmount > 0) {
//       finalPrice -= discountAmount;
//       appliedDiscounts.push({
//         name: rule.name,
//         type: rule.type,
//         value: rule.value,
//         amount: discountAmount,
//         ruleId: rule.id
//       });
//     }
//   });
  
//   return {
//     finalPrice: Math.max(0, finalPrice),
//     appliedDiscounts,
//     totalDiscount: appliedDiscounts.reduce((sum, d) => sum + d.amount, 0),
//     discountPercentage: price > 0 ? ((price - finalPrice) / price) * 100 : 0
//   };
// };

// // Calculate bulk pricing
// export const calculateBulkPricing = (basePrice, quantity, bulkDiscounts = []) => {
//   if (!basePrice || quantity <= 0) return basePrice;
  
//   const sortedDiscounts = [...bulkDiscounts].sort((a, b) => b.min_quantity - a.min_quantity);
//   const applicableDiscount = sortedDiscounts.find(d => quantity >= d.min_quantity);
  
//   if (!applicableDiscount) return basePrice * quantity;
  
//   const discountMultiplier = (100 - applicableDiscount.discount_percentage) / 100;
//   return (basePrice * quantity) * discountMultiplier;
// };

// // Get best discount from multiple rules
// export const getBestDiscount = (price, discountRules, quantity = 1) => {
//   if (!discountRules || discountRules.length === 0) return null;
  
//   let bestDiscount = null;
//   let bestPrice = price;
  
//   discountRules.forEach(rule => {
//     if (!rule.active) return;
    
//     const result = applyDiscountRules(price, [rule], quantity);
//     if (result.finalPrice < bestPrice) {
//       bestPrice = result.finalPrice;
//       bestDiscount = {
//         rule,
//         finalPrice: result.finalPrice,
//         discountAmount: price - result.finalPrice,
//         discountPercentage: ((price - result.finalPrice) / price) * 100
//       };
//     }
//   });
  
//   return bestDiscount;
// };

// // Validate required fields
// export const validateRequired = (value, fieldName) => {
//   if (value === null || value === undefined || value === '') {
//     return `${fieldName} is required`;
//   }
  
//   if (typeof value === 'string' && value.trim() === '') {
//     return `${fieldName} is required`;
//   }
  
//   return '';
// };

// // Validate number
// export const validateNumber = (value, fieldName, options = {}) => {
//   const { min, max, required = true } = options;
  
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
  
//   if (min !== undefined && num < min) {
//     return `${fieldName} must be at least ${min}`;
//   }
  
//   if (max !== undefined && num > max) {
//     return `${fieldName} must be at most ${max}`;
//   }
  
//   return '';
// };

// // Validate price
// export const validatePrice = (value, planType) => {
//   if (planType === "paid" || planType === "promotional") {
//     const price = parseFloat(value);
//     if (!value || isNaN(price) || price < 0) {
//       return "Price must be a positive number for paid plans";
//     }
//   }
//   return '';
// };

// // Validate email
// export const validateEmail = (email) => {
//   if (!email) return "Email is required";
  
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(email)) {
//     return "Please enter a valid email address";
//   }
  
//   return '';
// };

// // Validate phone number
// export const validatePhone = (phone) => {
//   if (!phone) return "Phone number is required";
  
//   const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
//   if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
//     return "Please enter a valid phone number";
//   }
  
//   return '';
// };

// // Validate time variant configuration
// export const validateTimeVariant = (timeVariant) => {
//   const errors = {};
  
//   if (!timeVariant.is_active) {
//     return errors; // No validation needed if not active
//   }
  
//   if (timeVariant.schedule_active) {
//     if (!timeVariant.schedule_start_date) {
//       errors.schedule_start_date = "Schedule start date is required";
//     }
//     if (!timeVariant.schedule_end_date) {
//       errors.schedule_end_date = "Schedule end date is required";
//     }
//     if (timeVariant.schedule_start_date && timeVariant.schedule_end_date) {
//       const start = new Date(timeVariant.schedule_start_date);
//       const end = new Date(timeVariant.schedule_end_date);
//       if (end < start) {
//         errors.schedule_end_date = "End date must be after start date";
//       }
//     }
//   }
  
//   if (timeVariant.duration_active) {
//     if (!timeVariant.duration_value || timeVariant.duration_value <= 0) {
//       errors.duration_value = "Duration value must be greater than 0";
//     }
//     if (!timeVariant.duration_unit) {
//       errors.duration_unit = "Duration unit is required";
//     }
//   }
  
//   return errors;
// };

// // Check if plan is available now
// export const isPlanAvailableNow = (plan) => {
//   if (!plan.time_variant?.is_active) return true;
  
//   const now = new Date();
//   const currentTime = now.getHours() * 3600 + now.getMinutes() * 60;
//   const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
//   // Check time restrictions
//   if (plan.time_variant.start_time && plan.time_variant.end_time) {
//     if (currentTime < plan.time_variant.start_time || currentTime > plan.time_variant.end_time) {
//       return false;
//     }
//   }
  
//   // Check day restrictions
//   if (plan.time_variant.available_days?.length > 0) {
//     if (!plan.time_variant.available_days.includes(currentDay)) {
//       return false;
//     }
//   }
  
//   // Check schedule restrictions
//   if (plan.time_variant.schedule_active) {
//     const scheduleStart = new Date(plan.time_variant.schedule_start_date);
//     const scheduleEnd = new Date(plan.time_variant.schedule_end_date);
    
//     if (now < scheduleStart || now > scheduleEnd) {
//       return false;
//     }
//   }
  
//   // Check exclusion dates
//   if (plan.time_variant.exclusion_dates?.length > 0) {
//     const todayStr = now.toISOString().split('T')[0];
//     if (plan.time_variant.exclusion_dates.includes(todayStr)) {
//       return false;
//     }
//   }
  
//   return true;
// };

// // Calculate next available time
// export const calculateNextAvailableTime = (timeVariant) => {
//   if (!timeVariant.is_active) return null;
  
//   const now = new Date();
//   const currentTime = now.getHours() * 3600 + now.getMinutes() * 60;
  
//   // If there's a time restriction, calculate next available time today
//   if (timeVariant.start_time && timeVariant.end_time) {
//     if (currentTime < timeVariant.start_time) {
//       const hours = Math.floor(timeVariant.start_time / 3600);
//       const minutes = Math.floor((timeVariant.start_time % 3600) / 60);
//       return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
//     }
//   }
  
//   // If there's a schedule restriction, calculate next available date
//   if (timeVariant.schedule_active && timeVariant.schedule_start_date) {
//     const scheduleStart = new Date(timeVariant.schedule_start_date);
//     if (now < scheduleStart) {
//       return formatDate(scheduleStart, true);
//     }
//   }
  
//   return null;
// };

// // Get availability summary
// export const getAvailabilitySummary = (timeVariant) => {
//   if (!timeVariant.is_active) {
//     return { status: 'always_available', message: 'Available at all times' };
//   }
  
//   const parts = [];
  
//   if (timeVariant.start_time && timeVariant.end_time) {
//     parts.push(`${formatTime(timeVariant.start_time)}-${formatTime(timeVariant.end_time)}`);
//   }
  
//   if (timeVariant.available_days?.length > 0) {
//     if (timeVariant.available_days.length === 7) {
//       parts.push("every day");
//     } else if (timeVariant.available_days.length === 5 && 
//                timeVariant.available_days.includes('monday') && 
//                timeVariant.available_days.includes('friday')) {
//       parts.push("weekdays only");
//     } else {
//       parts.push(`on ${timeVariant.available_days.map(d => 
//         d.charAt(0).toUpperCase() + d.slice(1)
//       ).join(', ')}`);
//     }
//   }
  
//   if (timeVariant.schedule_active) {
//     if (timeVariant.schedule_start_date && timeVariant.schedule_end_date) {
//       parts.push(`from ${formatDate(timeVariant.schedule_start_date)} to ${formatDate(timeVariant.schedule_end_date)}`);
//     }
//   }
  
//   const message = parts.length > 0 
//     ? `Available ${parts.join(' ')}`
//     : 'Available with restrictions';
  
//   return { status: 'restricted', message };
// };

// // Safe object entries
// export const safeObjectEntries = (obj) => {
//   if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
//     return [];
//   }
//   return Object.entries(obj);
// };

// // Safe object keys
// export const safeObjectKeys = (obj) => {
//   if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
//     return [];
//   }
//   return Object.keys(obj);
// };

// // Safe object values
// export const safeObjectValues = (obj) => {
//   if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
//     return [];
//   }
//   return Object.values(obj);
// };

// // Format bandwidth display (alias for backward compatibility)
// export const formatBandwidthDisplay = (kbps) => formatBandwidth(kbps, true);

// // Re-export formatters
// export { 
//   formatBytes, 
//   formatTime, 
//   formatDate, 
//   formatDuration, 
//   formatCurrency 
// };

// // Analytics data processing
// export const processAnalyticsData = (subscriptions, plans, timeRange = '30d') => {
//   const now = new Date();
//   let startDate = new Date();
  
//   switch (timeRange) {
//     case 'today':
//       startDate.setHours(0, 0, 0, 0);
//       break;
//     case 'yesterday':
//       startDate.setDate(now.getDate() - 1);
//       startDate.setHours(0, 0, 0, 0);
//       const yesterdayEnd = new Date(startDate);
//       yesterdayEnd.setHours(23, 59, 59, 999);
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

//   const filteredSubscriptions = subscriptions.filter(sub => {
//     const subDate = new Date(sub.created_at || sub.start_date || sub.subscription_date);
//     return subDate >= startDate;
//   });

//   const categoryStats = {};
//   const planStats = {};
//   const dailyStats = {};
//   let totalRevenue = 0;
//   let activeSubscriptions = 0;

//   filteredSubscriptions.forEach(sub => {
//     const plan = plans.find(p => p.id === sub.plan_id);
//     if (!plan) return;

//     const category = plan.category || "Uncategorized";
//     const revenue = plan.price || 0;
//     const subDate = new Date(sub.created_at || sub.start_date);
//     const dateKey = subDate.toISOString().split('T')[0];

//     // Daily stats
//     if (!dailyStats[dateKey]) {
//       dailyStats[dateKey] = {
//         date: dateKey,
//         subscriptions: 0,
//         revenue: 0,
//         active: 0
//       };
//     }
//     dailyStats[dateKey].subscriptions++;
//     dailyStats[dateKey].revenue += revenue;
//     if (sub.status === 'active') {
//       dailyStats[dateKey].active++;
//     }

//     // Category stats
//     if (!categoryStats[category]) {
//       categoryStats[category] = {
//         subscriptions: 0,
//         revenue: 0,
//         active: 0,
//         plans: new Set()
//       };
//     }
//     categoryStats[category].subscriptions++;
//     categoryStats[category].revenue += revenue;
//     categoryStats[category].plans.add(plan.id);
//     if (sub.status === 'active') {
//       categoryStats[category].active++;
//       activeSubscriptions++;
//     }

//     // Plan stats
//     if (!planStats[plan.id]) {
//       planStats[plan.id] = {
//         id: plan.id,
//         name: plan.name,
//         category: plan.category,
//         subscriptions: 0,
//         revenue: 0,
//         active: 0,
//         price: plan.price || 0
//       };
//     }
//     planStats[plan.id].subscriptions++;
//     planStats[plan.id].revenue += revenue;
//     if (sub.status === 'active') {
//       planStats[plan.id].active++;
//     }

//     totalRevenue += revenue;
//   });

//   // Convert daily stats to array and sort
//   const dailyStatsArray = Object.values(dailyStats).sort((a, b) => 
//     new Date(a.date) - new Date(b.date)
//   );

//   // Calculate conversion rates
//   const planStatsArray = Object.values(planStats).map(stat => ({
//     ...stat,
//     conversionRate: stat.subscriptions / (plan.views || 100) * 100,
//     avgRevenuePerUser: stat.subscriptions > 0 ? stat.revenue / stat.subscriptions : 0
//   })).sort((a, b) => b.subscriptions - a.subscriptions);

//   // Enhance category stats
//   const enhancedCategoryStats = Object.entries(categoryStats).map(([category, stats]) => ({
//     category,
//     subscriptions: stats.subscriptions,
//     revenue: stats.revenue,
//     active: stats.active,
//     planCount: stats.plans.size,
//     avgRevenuePerSubscription: stats.subscriptions > 0 ? stats.revenue / stats.subscriptions : 0,
//     popularity: calculatePopularity(stats.subscriptions)
//   })).sort((a, b) => b.subscriptions - a.subscriptions);

//   return {
//     timeRange,
//     totalSubscriptions: filteredSubscriptions.length,
//     activeSubscriptions,
//     totalRevenue,
//     avgRevenuePerSubscription: filteredSubscriptions.length > 0 ? totalRevenue / filteredSubscriptions.length : 0,
//     categoryStats: enhancedCategoryStats,
//     planStats: planStatsArray,
//     topCategories: enhancedCategoryStats.slice(0, 5),
//     topPlans: planStatsArray.slice(0, 10),
//     dailyStats: dailyStatsArray,
//     trends: calculateTrends(dailyStatsArray)
//   };
// };

// // Calculate trends from daily stats
// export const calculateTrends = (dailyStats) => {
//   if (dailyStats.length < 2) return {};
  
//   const recent = dailyStats.slice(-7);
//   const previous = dailyStats.slice(-14, -7);
  
//   const recentAvg = recent.reduce((sum, day) => sum + day.subscriptions, 0) / recent.length;
//   const previousAvg = previous.reduce((sum, day) => sum + day.subscriptions, 0) / previous.length;
  
//   const growthRate = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 100;
  
//   return {
//     growthRate,
//     trend: growthRate > 0 ? 'up' : growthRate < 0 ? 'down' : 'stable',
//     recentAverage: recentAvg,
//     previousAverage: previousAvg
//   };
// };

// // Generate unique ID
// export const generateId = (prefix = '') => {
//   return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
// };

// // Calculate age (for date comparisons)
// export const calculateAge = (dateString) => {
//   if (!dateString) return 0;
  
//   const birthDate = new Date(dateString);
//   const today = new Date();
  
//   let age = today.getFullYear() - birthDate.getFullYear();
//   const monthDiff = today.getMonth() - birthDate.getMonth();
  
//   if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
//     age--;
//   }
  
//   return age;
// };

// // Truncate text with ellipsis
// export const truncateText = (text, maxLength = 100) => {
//   if (!text || text.length <= maxLength) return text;
  
//   return text.substr(0, maxLength) + '...';
// };

// // Capitalize first letter
// export const capitalize = (text) => {
//   if (!text) return '';
//   return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
// };

// // Generate random color
// export const generateRandomColor = () => {
//   const colors = [
//     '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
//     '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
//   ];
//   return colors[Math.floor(Math.random() * colors.length)];
// };

// // Sleep utility (for async operations)
// export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));










// ============================================================================
// UTILITY FUNCTIONS
// ALIGNED WITH DJANGO BACKEND LOGIC
// ============================================================================

import { 
  formatBytes, 
  formatTime, 
  formatDate, 
  formatDuration, 
  formatCurrency,
  formatDaysOfWeek 
} from "./formatters";
import { popularityLevels, daysOfWeek } from "./constants";

// Deep clone utility
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

// Debounce function
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

// Throttle function
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

// Format number with decimals
export const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || value === "") return '0';
  
  const num = typeof value === "number" ? value : parseFloat(value);
  if (isNaN(num)) return '0';
  
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

// Calculate rating based on purchases only (no customer_feedback in backend)
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

// Calculate popularity level based on subscriber count
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

// Calculate category metrics from plans
export const calculateCategoryMetrics = (plans) => {
  const categoryMetrics = {};
  let totalSubscribers = 0;
  let totalRevenue = 0;
  let totalPlans = 0;

  // Calculate totals
  plans.forEach(plan => {
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

// Calculate plan performance metrics
export const calculatePlanPerformance = (plan, totalSubscribers, totalRevenue) => {
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

// Calculate effective price with discounts
export const calculateEffectivePrice = (price, discountInfo) => {
  if (!discountInfo || !price) return parseFloat(price) || 0;
  
  const basePrice = parseFloat(price);
  if (isNaN(basePrice)) return 0;
  
  if (discountInfo.type === 'percentage') {
    const discount = (basePrice * discountInfo.value) / 100;
    return Math.max(0, basePrice - discount);
  } else if (discountInfo.type === 'fixed') {
    return Math.max(0, basePrice - discountInfo.value);
  }
  
  return basePrice;
};

// Validate discount code
export const validateDiscountCode = (code, discountRules) => {
  if (!code || typeof code !== 'string' || code.trim() === '') {
    return { valid: false, message: "Discount code is required" };
  }
  
  const trimmedCode = code.trim();
  const rule = discountRules.find(r => 
    r.code === trimmedCode.toUpperCase() || 
    r.name.toLowerCase() === trimmedCode.toLowerCase()
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

// Apply discount rules to price
export const applyDiscountRules = (price, discountRules, quantity = 1, clientData = {}) => {
  let finalPrice = parseFloat(price);
  let appliedDiscounts = [];
  
  if (isNaN(finalPrice) || finalPrice <= 0) {
    return { 
      finalPrice: 0, 
      appliedDiscounts, 
      totalDiscount: 0, 
      discountPercentage: 0 
    };
  }
  
  // Sort discount rules by priority (highest first)
  const sortedRules = [...discountRules]
    .filter(rule => rule.is_active)
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
          .sort((a, b) => b.min_qty - a.min_qty)
          .find(t => quantity >= t.min_qty);
        
        if (tier) {
          const tierPrice = tier.price * quantity;
          discountAmount = finalPrice - tierPrice;
        }
      }
    }
    
    if (discountAmount > 0) {
      finalPrice -= discountAmount;
      appliedDiscounts.push({
        name: rule.name,
        ruleType: rule.rule_type,
        discountType: priceMatrix?.discount_type,
        value: priceMatrix?.percentage || priceMatrix?.fixed_amount,
        amount: discountAmount,
        ruleId: rule.id,
        priceMatrixId: priceMatrix?.id
      });
    }
  });
  
  finalPrice = Math.max(0, finalPrice);
  const totalDiscount = price - finalPrice;
  const discountPercentage = price > 0 ? (totalDiscount / price) * 100 : 0;
  
  return {
    finalPrice,
    appliedDiscounts,
    totalDiscount,
    discountPercentage: parseFloat(discountPercentage.toFixed(2))
  };
};

// Calculate bulk pricing
export const calculateBulkPricing = (basePrice, quantity, bulkDiscounts = []) => {
  if (!basePrice || quantity <= 0) return basePrice * quantity;
  
  const sortedDiscounts = [...bulkDiscounts]
    .filter(d => d.is_active)
    .sort((a, b) => b.min_quantity - a.min_quantity);
  
  const applicableDiscount = sortedDiscounts.find(d => quantity >= d.min_quantity);
  
  if (!applicableDiscount) return basePrice * quantity;
  
  let finalPrice = basePrice * quantity;
  
  if (applicableDiscount.discount_type === 'percentage') {
    finalPrice = finalPrice * (1 - applicableDiscount.percentage / 100);
  } else if (applicableDiscount.discount_type === 'fixed') {
    finalPrice = Math.max(0, finalPrice - applicableDiscount.fixed_amount);
  }
  
  return finalPrice;
};

// Get best discount from multiple rules
export const getBestDiscount = (price, discountRules, quantity = 1, clientData = {}) => {
  if (!discountRules || discountRules.length === 0) return null;
  
  let bestDiscount = null;
  let bestPrice = price;
  
  discountRules.forEach(rule => {
    if (!rule.is_active) return;
    
    const result = applyDiscountRules(price, [rule], quantity, clientData);
    if (result.finalPrice < bestPrice) {
      bestPrice = result.finalPrice;
      bestDiscount = {
        rule,
        finalPrice: result.finalPrice,
        discountAmount: price - result.finalPrice,
        discountPercentage: ((price - result.finalPrice) / price) * 100,
        appliedDiscounts: result.appliedDiscounts
      };
    }
  });
  
  return bestDiscount;
};

// Validate required fields
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

// Validate number
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

// Validate price
export const validatePrice = (value, planType) => {
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

// Validate email
export const validateEmail = (email) => {
  if (!email) return "Email is required";
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return "Please enter a valid email address";
  }
  
  return '';
};

// Validate phone number (basic validation)
export const validatePhone = (phone) => {
  if (!phone) return "Phone number is required";
  
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 9 || cleaned.length > 13) {
    return "Please enter a valid phone number";
  }
  
  return '';
};

// Validate time variant configuration (matches backend validation)
export const validateTimeVariant = (timeVariant) => {
  const errors = {};
  
  if (!timeVariant || !timeVariant.is_active) {
    return errors; // No validation needed if not active
  }
  
  // Validate time range
  if (timeVariant.start_time && timeVariant.end_time) {
    const startSeconds = typeof timeVariant.start_time === 'string' 
      ? parseTimeToSeconds(timeVariant.start_time)
      : timeVariant.start_time;
    
    const endSeconds = typeof timeVariant.end_time === 'string'
      ? parseTimeToSeconds(timeVariant.end_time)
      : timeVariant.end_time;
    
    if (startSeconds >= endSeconds) {
      errors.end_time = "End time must be after start time";
    }
  }
  
  // Validate available days
  if (timeVariant.available_days && Array.isArray(timeVariant.available_days)) {
    const validDays = daysOfWeek.map(day => day.value);
    timeVariant.available_days.forEach((day, index) => {
      if (!validDays.includes(day)) {
        errors.available_days = `Invalid day: ${day}. Must be one of ${validDays.join(', ')}`;
      }
    });
  }
  
  // Validate schedule dates
  if (timeVariant.schedule_active) {
    if (!timeVariant.schedule_start_date) {
      errors.schedule_start_date = "Schedule start date is required when schedule is active";
    }
    if (!timeVariant.end_time) {
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

// Helper function to parse time string to seconds
const parseTimeToSeconds = (timeStr) => {
  if (!timeStr) return 0;
  
  if (typeof timeStr === 'number') return timeStr;
  
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours * 3600) + (minutes * 60);
};

// Check if plan is available now (matches backend logic)
export const isPlanAvailableNow = (plan) => {
  if (!plan.time_variant || !plan.time_variant.is_active) {
    return true; // No time variant or not active
  }
  
  const timeVariant = plan.time_variant;
  
  if (timeVariant.force_available) {
    return true; // Override enabled
  }
  
  const now = new Date();
  const currentTime = now.getHours() * 3600 + now.getMinutes() * 60;
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
  
  // Check time of day availability
  if (timeVariant.start_time && timeVariant.end_time) {
    const startSeconds = typeof timeVariant.start_time === 'string'
      ? parseTimeToSeconds(timeVariant.start_time)
      : timeVariant.start_time;
    
    const endSeconds = typeof timeVariant.end_time === 'string'
      ? parseTimeToSeconds(timeVariant.end_time)
      : timeVariant.end_time;
    
    if (currentTime < startSeconds || currentTime > endSeconds) {
      return false;
    }
  }
  
  // Check day of week availability
  if (timeVariant.available_days && timeVariant.available_days.length > 0) {
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
    
    if (timeVariant.duration_unit === 'hours') {
      endDate.setHours(endDate.getHours() + timeVariant.duration_value);
    } else if (timeVariant.duration_unit === 'days') {
      endDate.setDate(endDate.getDate() + timeVariant.duration_value);
    } else if (timeVariant.duration_unit === 'weeks') {
      endDate.setDate(endDate.getDate() + (timeVariant.duration_value * 7));
    } else if (timeVariant.duration_unit === 'months') {
      endDate.setMonth(endDate.getMonth() + timeVariant.duration_value);
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

// Calculate next available time
export const calculateNextAvailableTime = (timeVariant) => {
  if (!timeVariant || !timeVariant.is_active) return null;
  
  const now = new Date();
  
  // Check time of day restrictions
  if (timeVariant.start_time && timeVariant.end_time) {
    const currentTime = now.getHours() * 3600 + now.getMinutes() * 60;
    const startSeconds = typeof timeVariant.start_time === 'string'
      ? parseTimeToSeconds(timeVariant.start_time)
      : timeVariant.start_time;
    
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

// Get availability summary
export const getAvailabilitySummary = (timeVariant) => {
  if (!timeVariant || !timeVariant.is_active) {
    return { status: 'always_available', message: 'Available at all times' };
  }
  
  const parts = [];
  
  if (timeVariant.start_time && timeVariant.end_time) {
    parts.push(`${formatTime(timeVariant.start_time)}-${formatTime(timeVariant.end_time)}`);
  }
  
  if (timeVariant.available_days && timeVariant.available_days.length > 0) {
    parts.push(`on ${formatDaysOfWeek(timeVariant.available_days)}`);
  }
  
  if (timeVariant.schedule_active && timeVariant.schedule_start_date && timeVariant.schedule_end_date) {
    parts.push(`from ${formatDate(timeVariant.schedule_start_date)} to ${formatDate(timeVariant.schedule_end_date)}`);
  }
  
  if (timeVariant.duration_active && timeVariant.duration_start_date) {
    const durationText = `${timeVariant.duration_value} ${timeVariant.duration_unit}`;
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

// Safe object entries
export const safeObjectEntries = (obj) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return [];
  }
  return Object.entries(obj);
};

// Safe object keys
export const safeObjectKeys = (obj) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return [];
  }
  return Object.keys(obj);
};

// Safe object values
export const safeObjectValues = (obj) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return [];
  }
  return Object.values(obj);
};

// Generate unique ID
export const generateId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 9);
  return `${prefix}${timestamp}-${randomStr}`;
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 100, ellipsis = '...') => {
  if (!text || text.length <= maxLength) return text;
  return text.substr(0, maxLength - ellipsis.length) + ellipsis;
};

// Capitalize first letter
export const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// Generate random color from a predefined palette
export const generateRandomColor = () => {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Sleep utility for async operations
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Format bandwidth display (alias)
export const formatBandwidthDisplay = (kbps) => {
  return formatBytes(kbps * 1024); // Convert Kbps to bytes
};

// Process analytics data (simplified - actual implementation would use backend API)
export const processAnalyticsData = (plans, timeRange = '30d') => {
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
    const planDate = new Date(plan.created_at || plan.createdAt || Date.now());
    return planDate >= startDate;
  });

  // Calculate statistics
  const categoryStats = {};
  let totalSubscribers = 0;
  let totalRevenue = 0;
  let activePlans = 0;

  filteredPlans.forEach(plan => {
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
    const planDate = new Date(plan.created_at || plan.createdAt || Date.now());
    return planDate >= previousStartDate && planDate < previousEndDate;
  });

  const previousSubscribers = previousPlans.reduce((sum, plan) => sum + (plan.purchases || 0), 0);
  const previousRevenue = previousPlans.reduce((sum, plan) => sum + ((plan.price || 0) * (plan.purchases || 0)), 0);
  
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

// Calculate trends from data points
export const calculateTrends = (dataPoints, key = 'value') => {
  if (!dataPoints || dataPoints.length < 2) {
    return { growthRate: 0, trend: 'stable', average: 0 };
  }

  const recent = dataPoints.slice(-7);
  const previous = dataPoints.slice(-14, -7);
  
  const recentAvg = recent.reduce((sum, point) => sum + (point[key] || 0), 0) / recent.length;
  const previousAvg = previous.reduce((sum, point) => sum + (point[key] || 0), 0) / previous.length;
  
  const growthRate = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 100;
  
  return {
    growthRate: parseFloat(growthRate.toFixed(1)),
    trend: growthRate > 5 ? 'up' : growthRate < -5 ? 'down' : 'stable',
    recentAverage: parseFloat(recentAvg.toFixed(1)),
    previousAverage: parseFloat(previousAvg.toFixed(1))
  };
};

// Format error messages
export const formatError = (error) => {
  if (!error) return "An unknown error occurred";
  
  if (typeof error === 'string') return error;
  
  if (error.message) return error.message;
  
  if (error.response?.data?.error) return error.response.data.error;
  
  if (error.response?.data?.message) return error.response.data.message;
  
  if (error.response?.statusText) return `${error.response.status}: ${error.response.statusText}`;
  
  return "An error occurred. Please try again.";
};

// Format success messages
export const formatSuccess = (message, data = null) => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

// Format API error response
export const formatApiError = (error, statusCode = 400) => {
  return {
    success: false,
    error: formatError(error),
    statusCode,
    timestamp: new Date().toISOString()
  };
};

// Validate access methods configuration
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

// Parse time string to Date object
export const parseTimeString = (timeStr) => {
  if (!timeStr) return null;
  
  if (typeof timeStr === 'string' && timeStr.includes(':')) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
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

// Check if value is empty
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
};

// Merge objects deeply
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

// Group array by key
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const keyValue = item[key];
    if (!result[keyValue]) {
      result[keyValue] = [];
    }
    result[keyValue].push(item);
    return result;
  }, {});
};

// Filter array by multiple criteria
export const filterByCriteria = (array, criteria) => {
  return array.filter(item => {
    return Object.keys(criteria).every(key => {
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

// Sort array by key
export const sortByKey = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
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

// Remove duplicates from array
export const removeDuplicates = (array, key = null) => {
  if (!key) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

// Paginate array
export const paginate = (array, page = 1, pageSize = 10) => {
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

// Chunk array into smaller arrays
export const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// Wait for condition to be true
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

// Retry async function
export const retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    
    await sleep(delay);
    return retry(fn, retries - 1, delay * 2);
  }
};

// Measure execution time
export const measureTime = async (fn, label = 'Execution') => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  console.log(`${label} took ${(end - start).toFixed(2)}ms`);
  return result;
};

// Create a memoized function
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

// Create a pipeline of functions
export const pipe = (...fns) => {
  return (initialValue) => {
    return fns.reduce((value, fn) => fn(value), initialValue);
  };
};

// Create a compose function (right-to-left)
export const compose = (...fns) => {
  return (initialValue) => {
    return fns.reduceRight((value, fn) => fn(value), initialValue);
  };
};

// Create a curry function
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

// Create a throttle with leading and trailing options
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

// Create a debounce with immediate option
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

// Export all utility functions
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
  validateRequired,
  validateNumber,
  validatePrice,
  validateEmail,
  validatePhone,
  validateTimeVariant,
  isPlanAvailableNow,
  calculateNextAvailableTime,
  getAvailabilitySummary,
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
  formatError,
  formatSuccess,
  formatApiError,
  validateAccessMethods,
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
  debounceAdvanced
};