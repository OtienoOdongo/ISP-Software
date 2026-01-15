export const CLIENT_TIERS = {
  new: 'New Client',
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
  diamond: 'Diamond',
  vip: 'VIP'
};

export const CLIENT_STATUS = {
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended',
  trial: 'Trial',
  at_risk: 'At Risk',
  churned: 'Churned'
};

export const CLIENT_TYPES = {
  residential: 'Residential',
  business: 'Business',
  student: 'Student',
  tourist: 'Tourist',
  freelancer: 'Freelancer',
  corporate: 'Corporate'
};

export const CONNECTION_TYPES = {
  pppoe: 'PPPoE',
  hotspot: 'Hotspot'
};

export const REVENUE_SEGMENTS = {
  low: 'Low Value',
  medium: 'Medium Value',
  high: 'High Value',
  premium: 'Premium'
};

export const USAGE_PATTERNS = {
  casual: 'Casual',
  regular: 'Regular',
  heavy: 'Heavy',
  extreme: 'Extreme'
};

export const MARKETER_TIERS = {
  novice: 'Novice',
  intermediate: 'Intermediate',
  expert: 'Expert',
  master: 'Master'
};

export const PAYMENT_METHODS = {
  mpesa: 'M-Pesa',
  paypal: 'PayPal',
  bank: 'Bank Transfer'
};

export const DEVICE_TYPES = {
  android: 'Android',
  ios: 'iOS',
  windows: 'Windows',
  mac: 'Mac',
  linux: 'Linux',
  other: 'Other'
};

export const RISK_LEVELS = {
  low: { label: 'Low', color: 'green', threshold: 4 },
  medium: { label: 'Medium', color: 'yellow', threshold: 7 },
  high: { label: 'High', color: 'red', threshold: 10 }
};

export const CHART_COLORS = {
  tiers: {
    new: '#94a3b8',
    bronze: '#92400e',
    silver: '#64748b',
    gold: '#f59e0b',
    platinum: '#10b981',
    diamond: '#3b82f6',
    vip: '#8b5cf6'
  },
  status: {
    active: '#10b981',
    inactive: '#94a3b8',
    suspended: '#ef4444',
    trial: '#f59e0b',
    at_risk: '#f97316',
    churned: '#64748b'
  },
  revenue: {
    low: '#94a3b8',
    medium: '#3b82f6',
    high: '#8b5cf6',
    premium: '#f59e0b'
  }
};

export const SORT_OPTIONS = [
  { value: '-created_at', label: 'Newest First' },
  { value: 'created_at', label: 'Oldest First' },
  { value: '-lifetime_value', label: 'Highest Revenue' },
  { value: 'lifetime_value', label: 'Lowest Revenue' },
  { value: '-churn_risk_score', label: 'Highest Risk' },
  { value: 'churn_risk_score', label: 'Lowest Risk' },
  { value: 'username', label: 'Username A-Z' },
  { value: '-username', label: 'Username Z-A' }
];

export const PAGE_SIZES = [10, 20, 50, 100];