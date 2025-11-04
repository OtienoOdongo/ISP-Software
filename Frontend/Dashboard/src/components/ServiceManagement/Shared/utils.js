

import { formatBytes as fb, formatTime as ft } from "./formatters";
import { popularityLevels } from "../Shared/constant"

// Deep clone utility
export const deepClone = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  return JSON.parse(JSON.stringify(obj));
};

// Format number with decimals
export const formatNumber = (value, decimals = 2) => {
  const num = typeof value === "number" ? value : parseFloat(value) || 0;
  return num.toLocaleString(undefined, { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  });
};

// Calculate rating based on purchases with enhanced algorithm
export const calculateRating = (purchases, totalSubscribers = 0) => {
  const baseRating = Math.min(5, Math.log10((purchases || 0) + 1) * 1.5);
  
  // Adjust rating based on popularity relative to total subscribers
  if (totalSubscribers > 0) {
    const popularityRatio = purchases / totalSubscribers;
    const popularityBonus = Math.min(1, popularityRatio * 10); // Max 1 star bonus
    return Math.min(5, baseRating + popularityBonus);
  }
  
  return baseRating;
};

// Calculate popularity level based on subscriber count
export const calculatePopularity = (subscriberCount) => {
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

// Calculate category popularity metrics
export const calculateCategoryMetrics = (plans) => {
  const categoryMetrics = {};
  let totalSubscribers = 0;

  // Calculate total subscribers and per-category counts
  plans.forEach(plan => {
    const subscribers = plan.purchases || 0;
    totalSubscribers += subscribers;
    
    if (!categoryMetrics[plan.category]) {
      categoryMetrics[plan.category] = {
        subscribers: 0,
        plans: 0,
        totalRevenue: 0,
        averageRating: 0
      };
    }
    
    categoryMetrics[plan.category].subscribers += subscribers;
    categoryMetrics[plan.category].plans += 1;
    categoryMetrics[plan.category].totalRevenue += (plan.price || 0) * subscribers;
  });

  // Calculate average ratings and popularity
  Object.keys(categoryMetrics).forEach(category => {
    const metrics = categoryMetrics[category];
    metrics.averageRating = calculateRating(metrics.subscribers, totalSubscribers);
    metrics.popularity = calculatePopularity(metrics.subscribers);
    metrics.marketShare = totalSubscribers > 0 ? (metrics.subscribers / totalSubscribers) * 100 : 0;
  });

  return {
    categoryMetrics,
    totalSubscribers,
    averageRating: totalSubscribers > 0 ? calculateRating(totalSubscribers, totalSubscribers) : 0
  };
};

// Calculate plan performance metrics
export const calculatePlanPerformance = (plan, totalSubscribers) => {
  const subscribers = plan.purchases || 0;
  const rating = calculateRating(subscribers, totalSubscribers);
  const popularity = calculatePopularity(subscribers);
  const marketShare = totalSubscribers > 0 ? (subscribers / totalSubscribers) * 100 : 0;
  
  return {
    rating,
    popularity,
    marketShare,
    revenue: (plan.price || 0) * subscribers
  };
};

// Safe object entries
export const safeObjectEntries = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return [];
  }
  return Object.entries(obj);
};

// Format bandwidth - ADDED: alias for formatBandwidthDisplay for backward compatibility
export const formatBandwidth = (kbps) => {
  if (kbps === 0) return "Unlimited";
  if (kbps >= 1000) {
    return `${(kbps / 1000).toFixed(1)} Mbps`;
  }
  return `${kbps} Kbps`;
};

// ADDED: formatBandwidthDisplay as an alias to maintain compatibility
export const formatBandwidthDisplay = formatBandwidth;

// Re-export formatters
export { fb as formatBytes, ft as formatTime };

// Validation utilities
export const validateRequired = (value, fieldName) => {
  if (!value || value.toString().trim() === '') {
    return `${fieldName} is required`;
  }
  return '';
};

export const validateNumber = (value, fieldName, min = 0) => {
  const num = parseFloat(value);
  if (isNaN(num) || num < min) {
    return `${fieldName} must be a number greater than ${min}`;
  }
  return '';
};

export const validatePrice = (value, planType) => {
  if (planType === "Paid") {
    const price = parseFloat(value);
    if (!value || isNaN(price) || price <= 0) {
      return "Price must be a positive number for paid plans";
    }
  }
  return '';
};

// Analytics data processing
export const processAnalyticsData = (subscriptions, plans, timeRange = '30d') => {
  const now = new Date();
  let startDate = new Date();
  
  switch (timeRange) {
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
      startDate = new Date(0); // All time
  }

  const filteredSubscriptions = subscriptions.filter(sub => 
    new Date(sub.created_at || sub.start_date) >= startDate
  );

  const categoryStats = {};
  const planStats = {};
  let totalRevenue = 0;
  let activeSubscriptions = 0;

  filteredSubscriptions.forEach(sub => {
    const plan = plans.find(p => p.id === sub.plan_id);
    if (!plan) return;

    const category = plan.category;
    const revenue = plan.price || 0;

    // Category stats
    if (!categoryStats[category]) {
      categoryStats[category] = {
        subscriptions: 0,
        revenue: 0,
        active: 0
      };
    }
    categoryStats[category].subscriptions++;
    categoryStats[category].revenue += revenue;
    if (sub.status === 'active') {
      categoryStats[category].active++;
      activeSubscriptions++;
    }

    // Plan stats
    if (!planStats[plan.id]) {
      planStats[plan.id] = {
        name: plan.name,
        subscriptions: 0,
        revenue: 0,
        active: 0
      };
    }
    planStats[plan.id].subscriptions++;
    planStats[plan.id].revenue += revenue;
    if (sub.status === 'active') {
      planStats[plan.id].active++;
    }

    totalRevenue += revenue;
  });

  return {
    timeRange,
    totalSubscriptions: filteredSubscriptions.length,
    activeSubscriptions,
    totalRevenue,
    categoryStats,
    planStats: Object.values(planStats).sort((a, b) => b.subscriptions - a.subscriptions),
    topCategories: Object.entries(categoryStats)
      .map(([category, stats]) => ({
        category,
        ...stats,
        popularity: calculatePopularity(stats.subscriptions)
      }))
      .sort((a, b) => b.subscriptions - a.subscriptions)
  };
};