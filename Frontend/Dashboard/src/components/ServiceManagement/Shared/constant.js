




// Plan types and categories
export const planTypes = Object.freeze(["Paid", "Free Trial"]);
export const categories = Object.freeze(["Residential", "Business", "Promotional", "Enterprise"]);

// Speed units
export const speedUnits = Object.freeze(["Kbps", "Mbps", "Gbps"]);
export const expiryUnits = Object.freeze(["Hours", "Days", "Weeks", "Months"]);
export const dataUnits = Object.freeze(["MB", "GB", "TB", "Unlimited"]);
export const usageUnits = Object.freeze(["Hours", "Unlimited"]);

// Device limits
export const deviceLimitOptions = Object.freeze([
  { value: 1, label: "1 Device" },
  { value: 2, label: "2 Devices" },
  { value: 3, label: "3 Devices" },
  { value: 5, label: "5 Devices" },
  { value: 10, label: "10 Devices" },
  { value: 0, label: "Unlimited Devices" }
]);

// Timeout options
export const sessionTimeoutOptions = Object.freeze([
  { value: 3600, label: "1 Hour" },
  { value: 7200, label: "2 Hours" },
  { value: 14400, label: "4 Hours" },
  { value: 28800, label: "8 Hours" },
  { value: 43200, label: "12 Hours" },
  { value: 86400, label: "24 Hours" },
  { value: 0, label: "No Limit" }
]);

export const idleTimeoutOptions = Object.freeze([
  { value: 300, label: "5 Minutes" },
  { value: 600, label: "10 Minutes" },
  { value: 900, label: "15 Minutes" },
  { value: 1800, label: "30 Minutes" },
  { value: 3600, label: "1 Hour" },
  { value: 0, label: "No Timeout" }
]);

// Validity period options
export const validityPeriodOptions = Object.freeze([
  { value: 1, unit: "Hours", label: "1 Hour" },
  { value: 24, unit: "Hours", label: "24 Hours" },
  { value: 168, unit: "Hours", label: "1 Week" },
  { value: 720, unit: "Hours", label: "1 Month" },
  { value: 2160, unit: "Hours", label: "3 Months" },
  { value: 4320, unit: "Hours", label: "6 Months" },
  { value: 8760, unit: "Hours", label: "1 Year" },
  { value: 0, unit: "Hours", label: "No Expiry" }
]);

// IP Pool options
export const ipPoolOptions = Object.freeze([
  { value: "pppoe-pool-1", label: "PPPoE Pool 1" },
  { value: "pppoe-pool-2", label: "PPPoE Pool 2" },
  { value: "dynamic-pool", label: "Dynamic Pool" },
  { value: "static-pool", label: "Static IP Pool" }
]);

// Access methods
export const accessMethods = Object.freeze(["hotspot", "pppoe"]);

// Template types
export const templateTypes = Object.freeze([
  {
    id: "residential",
    name: "Residential Starter",
    description: "Perfect for home internet with balanced speeds",
    basePrice: 1999,
    category: "Residential",
    accessType: "hotspot",
    accessMethods: {
      hotspot: {
        downloadSpeed: { value: "10", unit: "Mbps" },
        uploadSpeed: { value: "2", unit: "Mbps" },
        dataLimit: { value: "100", unit: "GB" },
        usageLimit: { value: "720", unit: "Hours" },
        bandwidthLimit: 5120,
        maxDevices: 3,
        sessionTimeout: 86400,
        idleTimeout: 300,
        validityPeriod: { value: 720, unit: "Hours" },
        macBinding: false
      }
    }
  },
  {
    id: "business",
    name: "Business Pro",
    description: "High-speed plan for business users with priority support",
    basePrice: 4999,
    category: "Business",
    accessType: "pppoe",
    accessMethods: {
      pppoe: {
        downloadSpeed: { value: "50", unit: "Mbps" },
        uploadSpeed: { value: "10", unit: "Mbps" },
        dataLimit: { value: "Unlimited", unit: "Unlimited" },
        usageLimit: { value: "Unlimited", unit: "Unlimited" },
        bandwidthLimit: 51200,
        maxDevices: 15,
        sessionTimeout: 86400,
        idleTimeout: 600,
        validityPeriod: { value: 720, unit: "Hours" },
        ipPool: "pppoe-pool-1",
        macBinding: true
      }
    }
  }
]);

// Priority levels
export const priorityOptions = Object.freeze([
  { value: 1, label: "Lowest", icon: "CloudOff", color: "text-gray-500" },
  { value: 2, label: "Low", icon: "CloudDrizzle", color: "text-blue-500" },
  { value: 3, label: "Medium", icon: "CloudRain", color: "text-green-500" },
  { value: 4, label: "High", icon: "Cloud", color: "text-yellow-500" },
  { value: 5, label: "Highest", icon: "CloudSnow", color: "text-orange-500" },
  { value: 6, label: "Critical", icon: "CloudLightning", color: "text-red-500" },
  { value: 7, label: "Premium", icon: "Server", color: "text-purple-500" },
  { value: 8, label: "VIP", icon: "Crown", color: "text-pink-500" },
]);

// Enhanced Bandwidth presets with all requested values
export const bandwidthPresets = Object.freeze([
  { value: 512, label: "0.5 Mbps", description: "Basic browsing" },
  { value: 1024, label: "1 Mbps", description: "Light usage" },
  { value: 2048, label: "2 Mbps", description: "Basic streaming" },
  { value: 3072, label: "3 Mbps", description: "SD video" },
  { value: 4096, label: "4 Mbps", description: "Good browsing" },
  { value: 5120, label: "5 Mbps", description: "Standard usage" },
  { value: 6144, label: "6 Mbps", description: "Better streaming" },
  { value: 7168, label: "7 Mbps", description: "HD ready" },
  { value: 8192, label: "8 Mbps", description: "HD streaming" },
  { value: 9216, label: "9 Mbps", description: "Smooth HD" },
  { value: 10240, label: "10 Mbps", description: "HD streaming" },
  { value: 20480, label: "20 Mbps", description: "Multiple devices" },
  { value: 51200, label: "50 Mbps", description: "Heavy usage" },
  { value: 102400, label: "100 Mbps", description: "Premium experience" },
  { value: 0, label: "Unlimited", description: "No restrictions" }
]);

// Analytics constants
export const analyticsTimeRanges = Object.freeze([
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "1y", label: "Last Year" },
  { value: "all", label: "All Time" }
]);

export const popularityLevels = Object.freeze({
  LOW: { threshold: 10, color: "text-gray-500", label: "Low" },
  MEDIUM: { threshold: 50, color: "text-yellow-500", label: "Medium" },
  HIGH: { threshold: 100, color: "text-orange-500", label: "High" },
  VERY_HIGH: { threshold: 200, color: "text-red-500", label: "Very High" },
  EXTREME: { threshold: 500, color: "text-purple-500", label: "Extreme" }
});

// Enhanced Usage limit presets with all requested values
export const usageLimitPresets = Object.freeze([
  { value: "1", unit: "Hours", label: "1 Hour", description: "Short session" },
  { value: "2", unit: "Hours", label: "2 Hours", description: "Quick access" },
  { value: "3", unit: "Hours", label: "3 Hours", description: "Brief usage" },
  { value: "4", unit: "Hours", label: "4 Hours", description: "Half day" },
  { value: "5", unit: "Hours", label: "5 Hours", description: "Extended session" },
  { value: "7", unit: "Hours", label: "7 Hours", description: "Work day" },
  { value: "8", unit: "Hours", label: "8 Hours", description: "Full work day" },
  { value: "9", unit: "Hours", label: "9 Hours", description: "Long session" },
  { value: "10", unit: "Hours", label: "10 Hours", description: "Extended access" },
  { value: "12", unit: "Hours", label: "12 Hours", description: "Half day access" },
  { value: "24", unit: "Hours", label: "24 Hours", description: "Daily reset" },
  { value: "Unlimited", unit: "Unlimited", label: "Unlimited", description: "No time restrictions" }
]);

// Enhanced Data limit presets with all requested values
export const dataLimitPresets = Object.freeze([
  { value: "1", unit: "GB", label: "1 GB", description: "Light usage" },
  { value: "2", unit: "GB", label: "2 GB", description: "Basic browsing" },
  { value: "3", unit: "GB", label: "3 GB", description: "Casual usage" },
  { value: "4", unit: "GB", label: "4 GB", description: "Moderate browsing" },
  { value: "5", unit: "GB", label: "5 GB", description: "Standard usage" },
  { value: "6", unit: "GB", label: "6 GB", description: "Good allowance" },
  { value: "7", unit: "GB", label: "7 GB", description: "Extended usage" },
  { value: "8", unit: "GB", label: "8 GB", description: "Heavy browsing" },
  { value: "9", unit: "GB", label: "9 GB", description: "Premium browsing" },
  { value: "10", unit: "GB", label: "10 GB", description: "Standard usage" },
  { value: "50", unit: "GB", label: "50 GB", description: "Heavy usage" },
  { value: "100", unit: "GB", label: "100 GB", description: "Premium usage" },
  { value: "Unlimited", unit: "Unlimited", label: "Unlimited", description: "No data caps" }
]);

// Enhanced Validity period presets with all requested values
export const validityPeriodPresets = Object.freeze([
  { value: "1", unit: "Days", label: "1 Day", description: "24-hour plan" },
  { value: "2", unit: "Days", label: "2 Days", description: "48-hour plan" },
  { value: "3", unit: "Days", label: "3 Days", description: "3-day access" },
  { value: "4", unit: "Days", label: "4 Days", description: "4-day plan" },
  { value: "5", unit: "Days", label: "5 Days", description: "5-day access" },
  { value: "6", unit: "Days", label: "6 Days", description: "6-day plan" },
  { value: "7", unit: "Days", label: "1 Week", description: "Weekly plan" },
  { value: "14", unit: "Days", label: "2 Weeks", description: "Bi-weekly plan" },
  { value: "21", unit: "Days", label: "3 Weeks", description: "Three weeks" },
  { value: "30", unit: "Days", label: "1 Month", description: "Monthly plan" },
  { value: "90", unit: "Days", label: "3 Months", description: "Quarterly plan" },
  { value: "180", unit: "Days", label: "6 Months", description: "Semi-annual" },
  { value: "365", unit: "Days", label: "1 Year", description: "Annual plan" },
  { value: "0", unit: "Days", label: "No Expiry", description: "Never expires" }
]);