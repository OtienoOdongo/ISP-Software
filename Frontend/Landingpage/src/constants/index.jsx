// // Navigation items
// export const navItems = [
//   { label: "Offers", href: "#offers" },
//   { label: "Features", href: "#features" },
//   { label: "Support", href: "#support" },
// ];

// // Internet offers with detailed info
// export const offers = [
//   {
//     category: "Basic",
//     description: "Perfect for light users needing daily connectivity.",
//     plans: [
//       { data: "25 MB", price: "KES 5", validity: "24h", speed: "5 Mbps", devices: 2 },
//       { data: "100 MB", price: "KES 10", validity: "24h", speed: "5 Mbps", devices: 2 },
//       { data: "250 MB", price: "KES 20", validity: "24h", speed: "10 Mbps", devices: 3 },
//       { data: "1 GB", price: "KES 50", validity: "24h", speed: "10 Mbps", devices: 3 },
//       { data: "2 GB", price: "KES 90", validity: "24h", speed: "15 Mbps", devices: 4 },
//     ],
//   },
//   {
//     category: "Standard",
//     description: "Ideal for regular users with weekly needs.",
//     plans: [
//       { data: "500 MB", price: "KES 45", validity: "7d", speed: "20 Mbps", devices: 3 },
//       { data: "1.5 GB", price: "KES 95", validity: "7d", speed: "25 Mbps", devices: 4 },
//       { data: "3 GB", price: "KES 200", validity: "7d", speed: "30 Mbps", devices: 5 },
//       { data: "5 GB", price: "KES 400", validity: "7d", speed: "40 Mbps", devices: "Unlimited" },
//     ],
//   },
//   {
//     category: "Premium",
//     description: "Best for heavy users and long-term usage.",
//     plans: [
//       { data: "2 GB", price: "KES 200", validity: "30d", speed: "50 Mbps", devices: 3 },
//       { data: "5 GB", price: "KES 400", validity: "30d", speed: "60 Mbps", devices: 4 },
//       { data: "10 GB", price: "KES 700", validity: "30d", speed: "80 Mbps", devices: 5 },
//       { data: "20 GB", price: "KES 1000", validity: "30d", speed: "100 Mbps", devices: "Unlimited" },
//     ],
//   },
// ];

// // Features (unchanged)
// export const features = [
//   { title: "Blazing Fast Speeds", description: "Up to 100 Mbps with Starlink tech.", icon: "🚀" },
//   { title: "Instant Activation", description: "Pay via M-Pesa and connect instantly.", icon: "⚡" },
//   { title: "No Contracts", description: "Flexible plans, cancel anytime.", icon: "🔓" },
//   { title: "Multi-Device Support", description: "Connect all your gadgets seamlessly.", icon: "📱" },
//   { title: "24/7 Support", description: "Help whenever you need it.", icon: "📞" },
// ];


// Navigation items
export const navItems = [
  { label: "Plans", href: "#offers" },
  { label: "Benefits", href: "#features" },
  { label: "Help", href: "#support" },
];

// Internet plans with varied validity and relatable details
export const offers = [
  {
    category: "Basic",
    description: "Great for quick browsing and chats.",
    plans: [
      { data: "50 MB", price: "KES 5", validity: "1 Hour", use: "Social Media" },
      { data: "200 MB", price: "KES 10", validity: "3 Hours", use: "Emails & Browsing" },
      { data: "500 MB", price: "KES 20", validity: "12 Hours", use: "Music Streaming" },
      { data: "1 GB", price: "KES 50", validity: "1 Day", use: "Video Calls" },
      
    ],
  },
  {
    category: "Standard",
    description: "Perfect for regular use and small families.",
    plans: [
      { data: "1 GB", price: "KES 70", validity: "3 Days", use: "Daily Browsing" },
      { data: "2 GB", price: "KES 150", validity: "7 Days", use: "Streaming Shows" },
      { data: "5 GB", price: "KES 300", validity: "10 Days", use: "Work & Play" },
      { data: "10 GB", price: "KES 500", validity: "15 Days", use: "Family Sharing" },
    ],
  },
  {
    category: "Premium",
    description: "Best for heavy users and long-term needs.",
    plans: [
      { data: "5 GB", price: "KES 400", validity: "15 Days", use: "HD Streaming" },
      { data: "10 GB", price: "KES 700", validity: "30 Days", use: "Downloads" },
      { data: "20 GB", price: "KES 1000", validity: "30 Days", use: "Everything" },
      { data: "50 GB", price: "KES 2000", validity: "45 Days", use: "Non-Stop Use" },
    ],
  },
];

// Features (simplified for non-tech-savvy users)
export const features = [
  { title: "Super Fast", description: "Stream and browse without waiting.", icon: "⚡" },
  { title: "Easy Pay", description: "Use M-Pesa to start right away.", icon: "💸" },
  { title: "No Hassle", description: "No forms, just connect.", icon: "✅" },
  { title: "Anytime Help", description: "We’re here if you need us.", icon: "📞" },
];