

// // ============================================================================
// // PLAN MANAGEMENT CONSTANTS
// // ============================================================================

// // Plan types and categories
// export const planTypes = Object.freeze(["paid", "free_trial", "promotional", "enterprise"]);
// export const categories = Object.freeze(["Residential", "Business", "Promotional", "Enterprise", "Student", "Public", "Custom"]);

// // Client type restrictions
// export const clientTypeRestrictions = Object.freeze([
//   { value: "any", label: "Any Client Type" },
//   { value: "hotspot", label: "Hotspot Only" },
//   { value: "pppoe", label: "PPPoE Only" }
// ]);

// // Speed units
// export const speedUnits = Object.freeze(["Kbps", "Mbps", "Gbps"]);
// export const expiryUnits = Object.freeze(["Hours", "Days", "Weeks", "Months"]);
// export const dataUnits = Object.freeze(["MB", "GB", "TB", "Unlimited"]);
// export const usageUnits = Object.freeze(["Hours", "Unlimited"]);

// // Time units for time variant
// export const timeUnits = Object.freeze([
//   { value: "hours", label: "Hours" },
//   { value: "days", label: "Days" },
//   { value: "weeks", label: "Weeks" },
//   { value: "months", label: "Months" }
// ]);

// // Days of week for availability
// export const daysOfWeek = Object.freeze([
//   { value: "monday", label: "Monday" },
//   { value: "tuesday", label: "Tuesday" },
//   { value: "wednesday", label: "Wednesday" },
//   { value: "thursday", label: "Thursday" },
//   { value: "friday", label: "Friday" },
//   { value: "saturday", label: "Saturday" },
//   { value: "sunday", label: "Sunday" }
// ]);

// // Timezone options
// export const timeZoneOptions = Object.freeze([
//   { value: "Africa/Nairobi", label: "EAT (Nairobi)" },
//   { value: "UTC", label: "UTC" },
//   { value: "America/New_York", label: "EST (New York)" },
//   { value: "Europe/London", label: "GMT (London)" },
//   { value: "Asia/Dubai", label: "GST (Dubai)" },
//   { value: "Asia/Singapore", label: "SGT (Singapore)" }
// ]);

// // FUP (Fair Usage Policy) thresholds
// export const FUPThresholds = Object.freeze([
//   { value: 50, label: "50% - Light Usage" },
//   { value: 60, label: "60% - Moderate Usage" },
//   { value: 70, label: "70% - Heavy Usage" },
//   { value: 80, label: "80% - Very Heavy Usage" },
//   { value: 90, label: "90% - Extreme Usage" },
//   { value: 95, label: "95% - Critical Usage" }
// ]);

// // Device limits
// export const deviceLimitOptions = Object.freeze([
//   { value: 1, label: "1 Device" },
//   { value: 2, label: "2 Devices" },
//   { value: 3, label: "3 Devices" },
//   { value: 5, label: "5 Devices" },
//   { value: 10, label: "10 Devices" },
//   { value: 20, label: "20 Devices" },
//   { value: 50, label: "50 Devices" },
//   { value: 100, label: "100 Devices" },
//   { value: 0, label: "Unlimited Devices" }
// ]);

// // Timeout options
// export const sessionTimeoutOptions = Object.freeze([
//   { value: 3600, label: "1 Hour" },
//   { value: 7200, label: "2 Hours" },
//   { value: 14400, label: "4 Hours" },
//   { value: 28800, label: "8 Hours" },
//   { value: 43200, label: "12 Hours" },
//   { value: 86400, label: "24 Hours" },
//   { value: 172800, label: "48 Hours" },
//   { value: 259200, label: "3 Days" },
//   { value: 604800, label: "1 Week" },
//   { value: 0, label: "No Limit" }
// ]);

// export const idleTimeoutOptions = Object.freeze([
//   { value: 60, label: "1 Minute" },
//   { value: 300, label: "5 Minutes" },
//   { value: 600, label: "10 Minutes" },
//   { value: 900, label: "15 Minutes" },
//   { value: 1800, label: "30 Minutes" },
//   { value: 3600, label: "1 Hour" },
//   { value: 7200, label: "2 Hours" },
//   { value: 0, label: "No Timeout" }
// ]);

// // Validity period options
// export const validityPeriodOptions = Object.freeze([
//   { value: 1, unit: "Hours", label: "1 Hour" },
//   { value: 2, unit: "Hours", label: "2 Hours" },
//   { value: 4, unit: "Hours", label: "4 Hours" },
//   { value: 8, unit: "Hours", label: "8 Hours" },
//   { value: 24, unit: "Hours", label: "24 Hours" },
//   { value: 168, unit: "Hours", label: "1 Week" },
//   { value: 336, unit: "Hours", label: "2 Weeks" },
//   { value: 720, unit: "Hours", label: "1 Month" },
//   { value: 2160, unit: "Hours", label: "3 Months" },
//   { value: 4320, unit: "Hours", label: "6 Months" },
//   { value: 8760, unit: "Hours", label: "1 Year" },
//   { value: 0, unit: "Hours", label: "No Expiry" }
// ]);

// // IP Pool options
// export const ipPoolOptions = Object.freeze([
//   { value: "pppoe-pool-1", label: "PPPoE Pool 1" },
//   { value: "pppoe-pool-2", label: "PPPoE Pool 2" },
//   { value: "dynamic-pool", label: "Dynamic Pool" },
//   { value: "static-pool", label: "Static IP Pool" },
//   { value: "business-pool", label: "Business Pool" },
//   { value: "residential-pool", label: "Residential Pool" },
//   { value: "guest-pool", label: "Guest Pool" }
// ]);



// // Access methods
// export const accessMethods = Object.freeze(["hotspot", "pppoe", "both"]);

// // Template types with enhanced features
// export const templateTypes = Object.freeze([
//   {
//     id: "residential-basic",
//     name: "Residential Basic",
//     description: "Affordable home internet with standard speeds",
//     basePrice: 1499,
//     category: "Residential",
//     accessType: "hotspot",
//     client_type_restriction: "any",
//     accessMethods: {
//       hotspot: {
//         enabled: true,
//         downloadSpeed: { value: "10", unit: "Mbps" },
//         uploadSpeed: { value: "2", unit: "Mbps" },
//         dataLimit: { value: "100", unit: "GB" },
//         usageLimit: { value: "720", unit: "Hours" },
//         bandwidthLimit: 5120,
//         maxDevices: 3,
//         sessionTimeout: 86400,
//         idleTimeout: 300,
//         validityPeriod: { value: "30", unit: "Days" },
//         macBinding: false,
        
       
      
//       },
//       pppoe: {
//         enabled: false
//       }
//     },
//     time_variant: {
//       is_active: false
//     }
//   },
//   {
//     id: "business-pro",
//     name: "Business Pro",
//     description: "High-speed plan for business users with priority support",
//     basePrice: 7999,
//     category: "Business",
//     accessType: "pppoe",
//     client_type_restriction: "pppoe",
//     accessMethods: {
//       pppoe: {
//         enabled: true,
//         downloadSpeed: { value: "100", unit: "Mbps" },
//         uploadSpeed: { value: "50", unit: "Mbps" },
//         dataLimit: { value: "Unlimited", unit: "Unlimited" },
//         usageLimit: { value: "Unlimited", unit: "Unlimited" },
//         bandwidthLimit: 102400,
//         maxDevices: 50,
//         sessionTimeout: 259200,
//         idleTimeout: 3600,
//         validityPeriod: { value: "30", unit: "Days" },
//         ipPool: "business-pool",
//         macBinding: true,
//         mtu: 1492,
        
//       },
//       hotspot: {
//         enabled: false
//       }
//     },
//     time_variant: {
//       is_active: false
//     }
//   },
//   {
//     id: "student-night",
//     name: "Student Night Plan",
//     description: "Unlimited data during off-peak hours for students",
//     basePrice: 999,
//     category: "Student",
//     accessType: "hotspot",
//     client_type_restriction: "hotspot",
//     accessMethods: {
//       hotspot: {
//         enabled: true,
//         downloadSpeed: { value: "20", unit: "Mbps" },
//         uploadSpeed: { value: "5", unit: "Mbps" },
//         dataLimit: { value: "Unlimited", unit: "Unlimited" },
//         usageLimit: { value: "480", unit: "Hours" },
//         bandwidthLimit: 20480,
//         maxDevices: 2,
//         sessionTimeout: 28800,
//         idleTimeout: 600,
//         validityPeriod: { value: "30", unit: "Days" },
//         macBinding: false,
        
//       },
//       pppoe: {
//         enabled: false
//       }
//     },
//     time_variant: {
//       is_active: true,
//       start_time: "22:00",
//       end_time: "06:00",
//       available_days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
//       schedule_active: true,
//       schedule_start_date: null,
//       schedule_end_date: null,
//       duration_active: false,
//       timezone: "Africa/Nairobi"
//     }
//   },
//   {
//     id: "public-wifi",
//     name: "Public WiFi Basic",
//     description: "Basic public WiFi access for cafes and public spaces",
//     basePrice: 0,
//     category: "Public",
//     accessType: "hotspot",
//     client_type_restriction: "hotspot",
//     accessMethods: {
//       hotspot: {
//         enabled: true,
//         downloadSpeed: { value: "5", unit: "Mbps" },
//         uploadSpeed: { value: "1", unit: "Mbps" },
//         dataLimit: { value: "1", unit: "GB" },
//         usageLimit: { value: "2", unit: "Hours" },
//         bandwidthLimit: 5120,
//         maxDevices: 1,
//         sessionTimeout: 7200,
//         idleTimeout: 300,
//         validityPeriod: { value: "1", unit: "Days" },
//         macBinding: false,
//         concurrentConnections: 1,
//         captivePortalEnabled: true,
//         splashPage: "branded",
//         authenticationType: "social_login"
//       },
//       pppoe: {
//         enabled: false
//       }
//     },
//     time_variant: {
//       is_active: true,
//       start_time: "08:00",
//       end_time: "22:00",
//       available_days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
//       duration_active: true,
//       duration_value: 2,
//       duration_unit: "hours"
//     }
//   }
// ]);

// // Priority levels with enhanced descriptions
// export const priorityOptions = Object.freeze([
//   { 
//     value: 1, 
//     label: "Lowest", 
//     description: "Background tasks only",
//     color: "text-gray-500",
//     bgColor: "bg-gray-100 dark:bg-gray-800"
//   },
//   { 
//     value: 2, 
//     label: "Low", 
//     description: "Basic browsing",
//     color: "text-blue-500",
//     bgColor: "bg-blue-100 dark:bg-blue-900/30"
//   },
//   { 
//     value: 3, 
//     label: "Medium", 
//     description: "Standard usage",
//     color: "text-green-500",
//     bgColor: "bg-green-100 dark:bg-green-900/30"
//   },
//   { 
//     value: 4, 
//     label: "High", 
//     description: "Streaming & gaming",
//     color: "text-yellow-500",
//     bgColor: "bg-yellow-100 dark:bg-yellow-900/30"
//   },
//   { 
//     value: 5, 
//     label: "Highest", 
//     description: "Business critical",
//     color: "text-orange-500",
//     bgColor: "bg-orange-100 dark:bg-orange-900/30"
//   },
//   { 
//     value: 6, 
//     label: "Critical", 
//     description: "Emergency services",
//     color: "text-red-500",
//     bgColor: "bg-red-100 dark:bg-red-900/30"
//   },
//   { 
//     value: 7, 
//     label: "Premium", 
//     description: "VIP customers",
//     color: "text-purple-500",
//     bgColor: "bg-purple-100 dark:bg-purple-900/30"
//   },
//   { 
//     value: 8, 
//     label: "VIP", 
//     description: "Executive priority",
//     color: "text-pink-500",
//     bgColor: "bg-pink-100 dark:bg-pink-900/30"
//   },
// ]);

// // Enhanced Bandwidth presets
// export const bandwidthPresets = Object.freeze([
//   { value: 256, label: "0.25 Mbps", description: "Very basic", category: "Basic" },
//   { value: 512, label: "0.5 Mbps", description: "Basic browsing", category: "Basic" },
//   { value: 1024, label: "1 Mbps", description: "Light usage", category: "Basic" },
//   { value: 2048, label: "2 Mbps", description: "Basic streaming", category: "Basic" },
//   { value: 3072, label: "3 Mbps", description: "SD video", category: "Standard" },
//   { value: 4096, label: "4 Mbps", description: "Good browsing", category: "Standard" },
//   { value: 5120, label: "5 Mbps", description: "Standard usage", category: "Standard" },
//   { value: 6144, label: "6 Mbps", description: "Better streaming", category: "Standard" },
//   { value: 7168, label: "7 Mbps", description: "HD ready", category: "Premium" },
//   { value: 8192, label: "8 Mbps", description: "HD streaming", category: "Premium" },
//   { value: 10240, label: "10 Mbps", description: "Good HD", category: "Premium" },
//   { value: 20480, label: "20 Mbps", description: "Multiple devices", category: "Premium" },
//   { value: 51200, label: "50 Mbps", description: "Heavy usage", category: "Business" },
//   { value: 102400, label: "100 Mbps", description: "Premium experience", category: "Business" },
//   { value: 204800, label: "200 Mbps", description: "Ultra-fast", category: "Enterprise" },
//   { value: 0, label: "Unlimited", description: "No restrictions", category: "Enterprise" }
// ]);

// // Analytics constants
// export const analyticsTimeRanges = Object.freeze([
//   { value: "today", label: "Today" },
//   { value: "yesterday", label: "Yesterday" },
//   { value: "7d", label: "Last 7 Days" },
//   { value: "30d", label: "Last 30 Days" },
//   { value: "90d", label: "Last 90 Days" },
//   { value: "1y", label: "Last Year" },
//   { value: "custom", label: "Custom Range" }
// ]);

// export const analyticsTypes = Object.freeze([
//   { value: "revenue", label: "Revenue Analytics", icon: "DollarSign" },
//   { value: "usage", label: "Usage Analytics", icon: "Activity" },
//   { value: "popularity", label: "Popularity Analytics", icon: "TrendingUp" },
//   { value: "availability", label: "Availability Analytics", icon: "Clock" },
//   { value: "conversion", label: "Conversion Analytics", icon: "Target" }
// ]);

// export const popularityLevels = Object.freeze({
//   LOW: { 
//     threshold: 10, 
//     color: "text-gray-500", 
//     bgColor: "bg-gray-100 dark:bg-gray-800",
//     label: "Low" 
//   },
//   MEDIUM: { 
//     threshold: 50, 
//     color: "text-yellow-500", 
//     bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
//     label: "Medium" 
//   },
//   HIGH: { 
//     threshold: 100, 
//     color: "text-orange-500", 
//     bgColor: "bg-orange-100 dark:bg-orange-900/30",
//     label: "High" 
//   },
//   VERY_HIGH: { 
//     threshold: 200, 
//     color: "text-red-500", 
//     bgColor: "bg-red-100 dark:bg-red-900/30",
//     label: "Very High" 
//   },
//   EXTREME: { 
//     threshold: 500, 
//     color: "text-purple-500", 
//     bgColor: "bg-purple-100 dark:bg-purple-900/30",
//     label: "Extreme" 
//   }
// });

// // Enhanced Usage limit presets
// export const usageLimitPresets = Object.freeze([
//   { value: "1", unit: "Hours", label: "1 Hour", description: "Short session", category: "Short" },
//   { value: "2", unit: "Hours", label: "2 Hours", description: "Quick access", category: "Short" },
//   { value: "3", unit: "Hours", label: "3 Hours", description: "Brief usage", category: "Short" },
//   { value: "4", unit: "Hours", label: "4 Hours", description: "Half day", category: "Standard" },
//   { value: "5", unit: "Hours", label: "5 Hours", description: "Extended session", category: "Standard" },
//   { value: "8", unit: "Hours", label: "8 Hours", description: "Work day", category: "Standard" },
//   { value: "12", unit: "Hours", label: "12 Hours", description: "Half day access", category: "Extended" },
//   { value: "24", unit: "Hours", label: "24 Hours", description: "Daily reset", category: "Extended" },
//   { value: "48", unit: "Hours", label: "48 Hours", description: "Weekend access", category: "Extended" },
//   { value: "168", unit: "Hours", label: "1 Week", description: "Weekly access", category: "Extended" },
//   { value: "Unlimited", unit: "Unlimited", label: "Unlimited", description: "No time restrictions", category: "Unlimited" }
// ]);

// // Enhanced Data limit presets
// export const dataLimitPresets = Object.freeze([
//   { value: "0.5", unit: "GB", label: "500 MB", description: "Light browsing", category: "Basic" },
//   { value: "1", unit: "GB", label: "1 GB", description: "Light usage", category: "Basic" },
//   { value: "2", unit: "GB", label: "2 GB", description: "Basic browsing", category: "Basic" },
//   { value: "3", unit: "GB", label: "3 GB", description: "Casual usage", category: "Standard" },
//   { value: "5", unit: "GB", label: "5 GB", description: "Standard usage", category: "Standard" },
//   { value: "10", unit: "GB", label: "10 GB", description: "Good allowance", category: "Standard" },
//   { value: "20", unit: "GB", label: "20 GB", description: "Heavy browsing", category: "Premium" },
//   { value: "50", unit: "GB", label: "50 GB", description: "Heavy usage", category: "Premium" },
//   { value: "100", unit: "GB", label: "100 GB", description: "Premium usage", category: "Premium" },
//   { value: "200", unit: "GB", label: "200 GB", description: "Extreme usage", category: "Business" },
//   { value: "500", unit: "GB", label: "500 GB", description: "Business usage", category: "Business" },
//   { value: "1000", unit: "GB", label: "1 TB", description: "Enterprise usage", category: "Enterprise" },
//   { value: "Unlimited", unit: "Unlimited", label: "Unlimited", description: "No data caps", category: "Unlimited" }
// ]);

// // Enhanced Validity period presets
// export const validityPeriodPresets = Object.freeze([
//   { value: "1", unit: "Hours", label: "1 Hour", description: "Trial access", category: "Short" },
//   { value: "2", unit: "Hours", label: "2 Hours", description: "Quick trial", category: "Short" },
//   { value: "4", unit: "Hours", label: "4 Hours", description: "Half day trial", category: "Short" },
//   { value: "8", unit: "Hours", label: "8 Hours", description: "Work session", category: "Short" },
//   { value: "1", unit: "Days", label: "1 Day", description: "24-hour plan", category: "Daily" },
//   { value: "2", unit: "Days", label: "2 Days", description: "48-hour plan", category: "Daily" },
//   { value: "3", unit: "Days", label: "3 Days", description: "3-day access", category: "Daily" },
//   { value: "7", unit: "Days", label: "1 Week", description: "Weekly plan", category: "Weekly" },
//   { value: "14", unit: "Days", label: "2 Weeks", description: "Bi-weekly plan", category: "Weekly" },
//   { value: "30", unit: "Days", label: "1 Month", description: "Monthly plan", category: "Monthly" },
//   { value: "90", unit: "Days", label: "3 Months", description: "Quarterly plan", category: "Monthly" },
//   { value: "180", unit: "Days", label: "6 Months", description: "Semi-annual", category: "Long" },
//   { value: "365", unit: "Days", label: "1 Year", description: "Annual plan", category: "Long" },
//   { value: "0", unit: "Days", label: "No Expiry", description: "Never expires", category: "Permanent" }
// ]);

// // Pricing matrix types
// export const pricingMatrixTypes = Object.freeze([
//   { value: "fixed", label: "Fixed Price" },
//   { value: "tiered", label: "Tiered Pricing" },
//   { value: "volume", label: "Volume Based" },
//   { value: "time_based", label: "Time Based" },
//   { value: "dynamic", label: "Dynamic Pricing" }
// ]);

// // Discount types
// export const discountTypes = Object.freeze([
//   { value: "percentage", label: "Percentage Off" },
//   { value: "fixed_amount", label: "Fixed Amount Off" },
//   { value: "free_trial", label: "Free Trial" },
//   { value: "bulk_discount", label: "Bulk Discount" },
//   { value: "seasonal", label: "Seasonal Discount" }
// ]);

// // Recurrence patterns for time variant
// export const recurrencePatterns = Object.freeze([
//   { value: "daily", label: "Daily" },
//   { value: "weekly", label: "Weekly" },
//   { value: "monthly", label: "Monthly" },
//   { value: "yearly", label: "Yearly" },
//   { value: "custom", label: "Custom Pattern" }
// ]);

// // Plan statuses
// export const planStatuses = Object.freeze([
//   { value: "draft", label: "Draft", color: "text-gray-600", bgColor: "bg-gray-100" },
//   { value: "active", label: "Active", color: "text-green-600", bgColor: "bg-green-100" },
//   { value: "inactive", label: "Inactive", color: "text-red-600", bgColor: "bg-red-100" },
//   { value: "scheduled", label: "Scheduled", color: "text-blue-600", bgColor: "bg-blue-100" },
//   { value: "expired", label: "Expired", color: "text-orange-600", bgColor: "bg-orange-100" },
//   { value: "archived", label: "Archived", color: "text-purple-600", bgColor: "bg-purple-100" }
// ]);

// // Validation statuses
// export const validationStatuses = Object.freeze([
//   { value: "draft", label: "Draft" },
//   { value: "pending", label: "Pending Review" },
//   { value: "approved", label: "Approved" },
//   { value: "rejected", label: "Rejected" },
//   { value: "needs_revision", label: "Needs Revision" }
// ]);

// // Approval statuses
// export const approvalStatuses = Object.freeze([
//   { value: "pending", label: "Pending" },
//   { value: "approved", label: "Approved" },
//   { value: "rejected", label: "Rejected" },
//   { value: "under_review", label: "Under Review" }
// ]);

// // Target audience options
// export const targetAudienceOptions = Object.freeze([
//   { value: "students", label: "Students" },
//   { value: "professionals", label: "Professionals" },
//   { value: "businesses", label: "Businesses" },
//   { value: "families", label: "Families" },
//   { value: "travelers", label: "Travelers" },
//   { value: "gamers", label: "Gamers" },
//   { value: "seniors", label: "Seniors" },
//   { value: "everyone", label: "Everyone" }
// ]);

// // Technical compatibility levels
// export const compatibilityLevels = Object.freeze([
//   { value: "basic", label: "Basic", description: "Works with most routers" },
//   { value: "standard", label: "Standard", description: "Works with modern routers" },
//   { value: "advanced", label: "Advanced", description: "Requires specific router features" },
//   { value: "enterprise", label: "Enterprise", description: "Requires enterprise-grade equipment" }
// ]);

// // Default plan features
// export const defaultPlanFeatures = Object.freeze([
//   "24/7 Customer Support",
//   "99.9% Uptime Guarantee",
//   "Free Setup",
//   "Monthly Billing",
//   "No Contract Required",
//   "Money Back Guarantee",
//   "Priority Support",
//   "Advanced Security",
//   "Parental Controls",
//   "Multiple Device Support"
// ]);

// // Default plan limitations
// export const defaultPlanLimitations = Object.freeze([
//   "Fair Usage Policy applies",
//   "Speed may vary during peak hours",
//   "Geographic restrictions may apply",
//   "Subject to network availability",
//   "Additional charges for excess usage",
//   "Terms and conditions apply"
// ]);









// ============================================================================
// PLAN MANAGEMENT CONSTANTS
// ALIGNED WITH DJANGO BACKEND MODELS
// ============================================================================

// Plan types (matches InternetPlan.PLAN_TYPES)
export const planTypes = Object.freeze([
  { value: "paid", label: "Paid Plan" },
  { value: "free_trial", label: "Free Trial" },
  { value: "promotional", label: "Promotional" }
]);

// Plan categories (matches InternetPlan.CATEGORIES)
export const categories = Object.freeze([
  { value: "Residential", label: "Residential" },
  { value: "Business", label: "Business" },
  { value: "Promotional", label: "Promotional" },
  { value: "Enterprise", label: "Enterprise" },
  { value: "Hotspot", label: "Hotspot Only" },
  { value: "PPPoE", label: "PPPoE Only" },
  { value: "Dual", label: "Hotspot & PPPoE" }
]);

// Access methods (simplified - only technical specs)
export const accessMethods = Object.freeze([
  { value: "hotspot", label: "Hotspot Only", icon: "Wifi" },
  { value: "pppoe", label: "PPPoE Only", icon: "Cable" },
  { value: "both", label: "Both Methods", icon: "Server" }
]);

// Days of week for availability (matches TimeVariantConfig.DAYS_OF_WEEK)
export const daysOfWeek = Object.freeze([
  { value: "mon", label: "Monday" },
  { value: "tue", label: "Tuesday" },
  { value: "wed", label: "Wednesday" },
  { value: "thu", label: "Thursday" },
  { value: "fri", label: "Friday" },
  { value: "sat", label: "Saturday" },
  { value: "sun", label: "Sunday" }
]);

// Time units for duration (matches TimeVariantConfig.TIME_UNITS)
export const timeUnits = Object.freeze([
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days" },
  { value: "weeks", label: "Weeks" },
  { value: "months", label: "Months" }
]);

// Timezone options for time variant (IANA format)
export const timeZoneOptions = Object.freeze([
  { value: "Africa/Nairobi", label: "EAT (Nairobi)" },
  { value: "Africa/Cairo", label: "EET (Cairo)" },
  { value: "Africa/Johannesburg", label: "SAST (Johannesburg)" },
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "EST (New York)" },
  { value: "Europe/London", label: "GMT (London)" },
  { value: "Asia/Dubai", label: "GST (Dubai)" },
  { value: "Asia/Singapore", label: "SGT (Singapore)" },
  { value: "Asia/Tokyo", label: "JST (Tokyo)" }
]);

// Speed units (for technical specs)
export const speedUnits = Object.freeze([
  { value: "Kbps", label: "Kbps" },
  { value: "Mbps", label: "Mbps" },
  { value: "Gbps", label: "Gbps" }
]);

// Data units (for data limits)
export const dataUnits = Object.freeze([
  { value: "MB", label: "MB" },
  { value: "GB", label: "GB" },
  { value: "TB", label: "TB" }
]);

// Usage limit units
export const usageUnits = Object.freeze([
  { value: "Minutes", label: "Minutes" },
  { value: "Hours", label: "Hours" },
  { value: "Days", label: "Days" }
]);

// Validity period units
export const validityUnits = Object.freeze([
  { value: "Hours", label: "Hours" },
  { value: "Days", label: "Days" },
  { value: "Weeks", label: "Weeks" },
  { value: "Months", label: "Months" }
]);

// Priority levels (matches InternetPlan.PRIORITY_LEVELS)
export const priorityOptions = Object.freeze([
  { value: 1, label: "Lowest", description: "Background tasks" },
  { value: 2, label: "Low", description: "Basic browsing" },
  { value: 3, label: "Medium", description: "Standard usage" },
  { value: 4, label: "High", description: "Streaming & gaming" },
  { value: 5, label: "Highest", description: "Business critical" },
  { value: 6, label: "Critical", description: "Emergency services" },
  { value: 7, label: "Premium", description: "VIP customers" },
  { value: 8, label: "VIP", description: "Executive priority" }
]);

// FUP (Fair Usage Policy) thresholds (matches InternetPlan.FUP_threshold)
export const FUPThresholds = Object.freeze([
  { value: 50, label: "50% - Light Usage" },
  { value: 60, label: "60% - Moderate Usage" },
  { value: 70, label: "70% - Heavy Usage" },
  { value: 80, label: "80% - Very Heavy Usage" },
  { value: 90, label: "90% - Extreme Usage" },
  { value: 95, label: "95% - Critical Usage" }
]);

// Device limit options
export const deviceLimitOptions = Object.freeze([
  { value: 1, label: "1 Device" },
  { value: 2, label: "2 Devices" },
  { value: 3, label: "3 Devices" },
  { value: 5, label: "5 Devices" },
  { value: 10, label: "10 Devices" },
  { value: 20, label: "20 Devices" },
  { value: 50, label: "50 Devices" },
  { value: 100, label: "100 Devices" }
]);

// Session timeout options (seconds)
export const sessionTimeoutOptions = Object.freeze([
  { value: 3600, label: "1 Hour" },
  { value: 7200, label: "2 Hours" },
  { value: 14400, label: "4 Hours" },
  { value: 28800, label: "8 Hours" },
  { value: 43200, label: "12 Hours" },
  { value: 86400, label: "24 Hours" },
  { value: 172800, label: "48 Hours" },
  { value: 259200, label: "3 Days" },
  { value: 604800, label: "1 Week" }
]);

// Idle timeout options (seconds)
export const idleTimeoutOptions = Object.freeze([
  { value: 60, label: "1 Minute" },
  { value: 300, label: "5 Minutes" },
  { value: 600, label: "10 Minutes" },
  { value: 900, label: "15 Minutes" },
  { value: 1800, label: "30 Minutes" },
  { value: 3600, label: "1 Hour" },
  { value: 7200, label: "2 Hours" }
]);

// IP Pool options for PPPoE
export const ipPoolOptions = Object.freeze([
  { value: "pppoe-pool-1", label: "PPPoE Pool 1" },
  { value: "pppoe-pool-2", label: "PPPoE Pool 2" },
  { value: "dynamic-pool", label: "Dynamic Pool" },
  { value: "static-pool", label: "Static IP Pool" }
]);

// Plan templates (SIMPLIFIED - only technical specs)
export const templateTypes = Object.freeze([
  {
    id: "residential-basic",
    name: "Residential Basic",
    description: "Affordable home internet with standard speeds",
    category: "Residential",
    basePrice: 1499,
    accessMethods: {
      hotspot: {
        enabled: true,
        downloadSpeed: { value: "10", unit: "Mbps" },
        uploadSpeed: { value: "5", unit: "Mbps" },
        dataLimit: { value: "100", unit: "GB" },
        usageLimit: { value: "720", unit: "Hours" },
        maxDevices: 3,
        sessionTimeout: 86400,
        idleTimeout: 300,
        validityPeriod: { value: "30", unit: "Days" },
        macBinding: false
      },
      pppoe: {
        enabled: false,
        downloadSpeed: { value: "10", unit: "Mbps" },
        uploadSpeed: { value: "5", unit: "Mbps" },
        dataLimit: { value: "100", unit: "GB" },
        usageLimit: { value: "720", unit: "Hours" },
        maxDevices: 3,
        sessionTimeout: 86400,
        idleTimeout: 300,
        validityPeriod: { value: "30", unit: "Days" },
        macBinding: false,
        ipPool: "pppoe-pool-1",
        mtu: 1492
      }
    },
    time_variant: {
      is_active: false
    }
  },
  {
    id: "business-pro",
    name: "Business Pro",
    description: "High-speed plan for business users",
    category: "Business",
    basePrice: 7999,
    accessMethods: {
      hotspot: {
        enabled: false
      },
      pppoe: {
        enabled: true,
        downloadSpeed: { value: "100", unit: "Mbps" },
        uploadSpeed: { value: "50", unit: "Mbps" },
        dataLimit: { value: "Unlimited", unit: "Unlimited" },
        usageLimit: { value: "Unlimited", unit: "Unlimited" },
        maxDevices: 50,
        sessionTimeout: 259200,
        idleTimeout: 3600,
        validityPeriod: { value: "30", unit: "Days" },
        macBinding: true,
        ipPool: "business-pool",
        mtu: 1492
      }
    },
    time_variant: {
      is_active: false
    }
  },
  {
    id: "student-night",
    name: "Student Night Plan",
    description: "Affordable plan for students during off-peak hours",
    category: "Promotional",
    basePrice: 999,
    accessMethods: {
      hotspot: {
        enabled: true,
        downloadSpeed: { value: "20", unit: "Mbps" },
        uploadSpeed: { value: "5", unit: "Mbps" },
        dataLimit: { value: "Unlimited", unit: "Unlimited" },
        usageLimit: { value: "480", unit: "Hours" },
        maxDevices: 2,
        sessionTimeout: 28800,
        idleTimeout: 600,
        validityPeriod: { value: "30", unit: "Days" },
        macBinding: false
      },
      pppoe: {
        enabled: false
      }
    },
    time_variant: {
      is_active: true,
      start_time: "22:00",
      end_time: "06:00",
      available_days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
      schedule_active: false,
      timezone: "Africa/Nairobi"
    }
  },
  {
    id: "public-wifi",
    name: "Public WiFi",
    description: "Basic public WiFi access",
    category: "Public",
    basePrice: 0,
    accessMethods: {
      hotspot: {
        enabled: true,
        downloadSpeed: { value: "5", unit: "Mbps" },
        uploadSpeed: { value: "1", unit: "Mbps" },
        dataLimit: { value: "1", unit: "GB" },
        usageLimit: { value: "2", unit: "Hours" },
        maxDevices: 1,
        sessionTimeout: 7200,
        idleTimeout: 300,
        validityPeriod: { value: "1", unit: "Days" },
        macBinding: false
      },
      pppoe: {
        enabled: false
      }
    },
    time_variant: {
      is_active: false
    }
  }
]);

// Bandwidth presets (Kbps)
export const bandwidthPresets = Object.freeze([
  { value: 256, label: "0.25 Mbps", category: "Basic" },
  { value: 512, label: "0.5 Mbps", category: "Basic" },
  { value: 1024, label: "1 Mbps", category: "Basic" },
  { value: 2048, label: "2 Mbps", category: "Standard" },
  { value: 5120, label: "5 Mbps", category: "Standard" },
  { value: 10240, label: "10 Mbps", category: "Premium" },
  { value: 20480, label: "20 Mbps", category: "Premium" },
  { value: 51200, label: "50 Mbps", category: "Business" },
  { value: 102400, label: "100 Mbps", category: "Business" },
  { value: 204800, label: "200 Mbps", category: "Enterprise" }
]);

// Data limit presets
export const dataLimitPresets = Object.freeze([
  { value: "1", unit: "GB", label: "1 GB", category: "Basic" },
  { value: "5", unit: "GB", label: "5 GB", category: "Basic" },
  { value: "10", unit: "GB", label: "10 GB", category: "Standard" },
  { value: "20", unit: "GB", label: "20 GB", category: "Standard" },
  { value: "50", unit: "GB", label: "50 GB", category: "Premium" },
  { value: "100", unit: "GB", label: "100 GB", category: "Premium" },
  { value: "200", unit: "GB", label: "200 GB", category: "Business" },
  { value: "500", unit: "GB", label: "500 GB", category: "Business" },
  { value: "1000", unit: "GB", label: "1 TB", category: "Enterprise" },
  { value: "Unlimited", unit: "Unlimited", label: "Unlimited", category: "Enterprise" }
]);

// Usage limit presets
export const usageLimitPresets = Object.freeze([
  { value: "1", unit: "Hours", label: "1 Hour", category: "Short" },
  { value: "2", unit: "Hours", label: "2 Hours", category: "Short" },
  { value: "4", unit: "Hours", label: "4 Hours", category: "Standard" },
  { value: "8", unit: "Hours", label: "8 Hours", category: "Standard" },
  { value: "12", unit: "Hours", label: "12 Hours", category: "Extended" },
  { value: "24", unit: "Hours", label: "24 Hours", category: "Extended" },
  { value: "168", unit: "Hours", label: "1 Week", category: "Extended" },
  { value: "Unlimited", unit: "Unlimited", label: "Unlimited", category: "Unlimited" }
]);

// Validity period presets
export const validityPeriodPresets = Object.freeze([
  { value: "1", unit: "Hours", label: "1 Hour", category: "Short" },
  { value: "24", unit: "Hours", label: "1 Day", category: "Daily" },
  { value: "168", unit: "Hours", label: "1 Week", category: "Weekly" },
  { value: "720", unit: "Hours", label: "1 Month", category: "Monthly" },
  { value: "2160", unit: "Hours", label: "3 Months", category: "Quarterly" },
  { value: "4320", unit: "Hours", label: "6 Months", category: "Semi-Annual" },
  { value: "8760", unit: "Hours", label: "1 Year", category: "Annual" }
]);

// Pricing matrix types (matches PriceMatrix.DISCOUNT_TYPES)
export const pricingMatrixTypes = Object.freeze([
  { value: "percentage", label: "Percentage Discount" },
  { value: "fixed", label: "Fixed Amount" },
  { value: "tiered", label: "Tiered Pricing" },
  { value: "volume", label: "Volume Discount" }
]);

// Price matrix applies to (matches PriceMatrix.APPLIES_TO)
export const pricingAppliesTo = Object.freeze([
  { value: "plan", label: "Specific Plan" },
  { value: "category", label: "Plan Category" },
  { value: "all", label: "All Plans" }
]);

// Discount rule types (matches DiscountRule.RULE_TYPES)
export const discountRuleTypes = Object.freeze([
  { value: "first_time", label: "First Time Purchase" },
  { value: "loyalty", label: "Loyalty Discount" },
  { value: "seasonal", label: "Seasonal Promotion" },
  { value: "referral", label: "Referral Bonus" },
  { value: "bulk", label: "Bulk Purchase" }
]);

// Plan statuses
export const planStatuses = Object.freeze([
  { value: "active", label: "Active", color: "text-green-600", bgColor: "bg-green-100" },
  { value: "inactive", label: "Inactive", color: "text-red-600", bgColor: "bg-red-100" },
  { value: "draft", label: "Draft", color: "text-yellow-600", bgColor: "bg-yellow-100" },
  { value: "archived", label: "Archived", color: "text-gray-600", bgColor: "bg-gray-100" }
]);

// Availability statuses (matches backend availability codes)
export const availabilityStatuses = Object.freeze([
  { value: "available", label: "Available Now", color: "green" },
  { value: "time_restricted", label: "Time Restricted", color: "yellow" },
  { value: "scheduled", label: "Scheduled", color: "blue" },
  { value: "unavailable", label: "Unavailable", color: "red" },
  { value: "always_available", label: "Always Available", color: "green" }
]);

// Analytics types
export const analyticsTypes = Object.freeze([
  { value: "revenue", label: "Revenue Analytics", icon: "DollarSign" },
  { value: "usage", label: "Usage Analytics", icon: "Activity" },
  { value: "popularity", label: "Popularity Analytics", icon: "TrendingUp" },
  { value: "availability", label: "Availability Analytics", icon: "Clock" }
]);

// Analytics time ranges
export const analyticsTimeRanges = Object.freeze([
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" }
]);

// Popularity levels based on purchase count
export const popularityLevels = Object.freeze({
  LOW: { 
    threshold: 10, 
    color: "text-gray-500", 
    bgColor: "bg-gray-100 dark:bg-gray-800",
    label: "Low" 
  },
  MEDIUM: { 
    threshold: 50, 
    color: "text-yellow-500", 
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    label: "Medium" 
  },
  HIGH: { 
    threshold: 100, 
    color: "text-orange-500", 
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    label: "High" 
  },
  VERY_HIGH: { 
    threshold: 200, 
    color: "text-red-500", 
    bgColor: "bg-red-100 dark:bg-red-900/30",
    label: "Very High" 
  },
  EXTREME: { 
    threshold: 500, 
    color: "text-purple-500", 
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    label: "Extreme" 
  }
});

// Default plan features (for display purposes)
export const defaultPlanFeatures = Object.freeze([
  "24/7 Customer Support",
  "99.9% Uptime Guarantee",
  "Monthly Billing",
  "No Contract Required",
  "Advanced Security"
]);

// Default plan limitations
export const defaultPlanLimitations = Object.freeze([
  "Fair Usage Policy applies",
  "Speed may vary during peak hours",
  "Subject to network availability"
]);

// MTU options for PPPoE
export const mtuOptions = Object.freeze([
  { value: 1492, label: "1492 (Default)" },
  { value: 1500, label: "1500 (Standard)" },
  { value: 1454, label: "1454 (PPPoEoA)" },
  { value: 1480, label: "1480 (Reduced)" }
]);

// Plan sort options
export const planSortOptions = Object.freeze([
  { value: "name", label: "Name (A-Z)" },
  { value: "-name", label: "Name (Z-A)" },
  { value: "price", label: "Price (Low to High)" },
  { value: "-price", label: "Price (High to Low)" },
  { value: "purchases", label: "Popularity (Low to High)" },
  { value: "-purchases", label: "Popularity (High to Low)" },
  { value: "priority_level", label: "Priority (Low to High)" },
  { value: "-priority_level", label: "Priority (High to Low)" },
  { value: "created_at", label: "Date Created (Oldest)" },
  { value: "-created_at", label: "Date Created (Newest)" }
]);

// Plan filter options
export const planFilterOptions = Object.freeze({
  category: categories,
  planType: planTypes,
  accessType: accessMethods,
  hasTimeVariant: [
    { value: true, label: "With Time Restrictions" },
    { value: false, label: "Without Time Restrictions" }
  ],
  availability: [
    { value: true, label: "Available Now" },
    { value: false, label: "Currently Unavailable" }
  ]
});