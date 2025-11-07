

// import internet from "../assets/internet.png";
// import payment from "../assets/payment.png";
// import network from "../assets/network.png";
// import setting from "../assets/setting.png";
// import maintenance from "../assets/maintenance.png";
// import logout from "../assets/logout.png"; 
// import users from "../assets/users.png";

// export const menuItems = [
//   { 
//     title: "Dashboard",
    
//   },
//   {
//     title: "Subscriber Management",
//     icon: <img src={users} alt="client management icon" className="h-5 w-5" />,
//     submenu: true,
//     submenuItems: [
//       { title: "Subscribers" },
//       { title: "SMS Automation" },   
//       { title: "Bulk Actions" },
      
//     ],
//   },
//   {
//     title: "Service Plans",
//     icon: <img src={internet} alt="internet" className="h-5 w-5" />,
//     submenu: true,
//     submenuItems: [
//       { title: "Plan Management" },
//     ],
//   },
//   {
//     title: "Network Infrastructure",
//     icon: <img src={network} alt="network" className="h-5 w-5" />,
//     submenu: true,
//     submenuItems: [
//       { title: "Routers Management" },
//       { title: "Bandwidth" },
//       { title: "IP Management" },
//       { title: "Diagnostics" },
//     ],
//   },
//   {
//     title: "Payments System",
//     icon: <img src={payment} alt="payment" className="h-5 w-5" />,
//     submenu: true,
//     submenuItems: [
//       { title: "Payment Methods" },
//       { title: "Transactions" },
//       { title: "Revenue Reports" },
//     ],
//   },
//   {
//     title: "Support Center",
//     icon: <img src={maintenance} alt="maintenance" className="h-5 w-5" />,
//     submenu: true,
//     submenuItems: [
//       { title: "Support Tickets" },
//       { title: "System Status" },
//     ],
//   },
//   {
//     title: "System Settings",
//     icon: <img src={setting} alt="setting" className="h-5 w-5" />,
//     submenu: true,
//     spacing: true,
//     submenuItems: [
//       { title: "Admin Profile" },
      
//     ],
//   },
//   {
//     title: "Logout",
//     icon: <img src={logout} alt="logout" className="h-5 w-5" />,
//     submenu: false,
//     action: "Logout",
//   },
// ];





import { 
  HomeIcon,
  UsersIcon,
  Squares2X2Icon,
  WifiIcon,
  CreditCardIcon,
  LifebuoyIcon,
  Cog6ToothIcon,
  ArrowRightEndOnRectangleIcon 
} from "@heroicons/react/24/outline";

export const menuItems = [
  { 
    title: "Dashboard",
    icon: <HomeIcon className="h-5 w-5" />,
  },
  {
    title: "Subscriber Management",
    icon: <UsersIcon className="h-5 w-5" />,
    submenu: true,
    submenuItems: [
      { title: "Subscribers" },
      { title: "SMS Automation" },   
      { title: "Bulk Actions" },
    ],
  },
  {
    title: "Service Plans",
    icon: <Squares2X2Icon className="h-5 w-5" />,
    submenu: true,
    submenuItems: [
      { title: "Plan Management" },
    ],
  },
  {
    title: "Network Infrastructure",
    icon: <WifiIcon className="h-5 w-5" />,
    submenu: true,
    submenuItems: [
      { title: "Routers Management" },
      { title: "Bandwidth" },
      { title: "IP Management" },
      { title: "Diagnostics" },
    ],
  },
  {
    title: "Payments System",
    icon: <CreditCardIcon className="h-5 w-5" />,
    submenu: true,
    submenuItems: [
      { title: "Payment Methods" },
      { title: "Transactions" },
      { title: "Revenue Reports" },
    ],
  },
  {
    title: "Support Center",
    icon: <LifebuoyIcon className="h-5 w-5" />,
    submenu: true,
    submenuItems: [
      { title: "Support Tickets" },
      { title: "System Status" },
    ],
  },
  {
    title: "System Settings",
    icon: <Cog6ToothIcon className="h-5 w-5" />,
    submenu: true,
    spacing: true,
    submenuItems: [
      { title: "Admin Profile" },
    ],
  },
  {
    title: "Logout",
    icon: <ArrowRightEndOnRectangleIcon className="h-5 w-5" />, 
    submenu: false,
    action: "Logout",
  },
];





//using local stoarge to store the access token and refresg token in the browser

export const ACCESS_TOKEN = "access";
export const REFRESH_TOKEN = "refresh"






































// export const menuItems = [
//   { 
//     title: "Dashboard",
//   },
//   {
//     title: "Subscriber Management",
//     icon: <img src={users} alt="subscriber management" className="h-5 w-5" />,
//     submenu: true,
//     submenuItems: [
//       { title: "All Subscribers" },      // Unified view
//       { title: "Hotspot Users" },        // WiFi clients
//       { title: "PPPoE Users" },          // PPPoE clients
//       { title: "Bulk Operations" },
//     ],
//   },
//   {
//     title: "Service Plans",
//     icon: <img src={internet} alt="service plans" className="h-5 w-5" />,
//     submenu: true,
//     submenuItems: [
//       { title: "Plan Management" },
//       { title: "Plan Templates" },
//       { title: "Usage Analytics" },
//     ],
//   },
//   {
//     title: "Network Infrastructure", 
//     icon: <img src={network} alt="network infrastructure" className="h-5 w-5" />,
//     submenu: true,
//     submenuItems: [
//       { title: "Router Management" },
//       { title: "Hotspot Setup" },
//       { title: "PPPoE Server" },
//       { title: "Bandwidth Control" },
//       { title: "IP Management" },
//     ],
//   },
//   {
//     title: "Payment Systems",
//     icon: <img src={payment} alt="payment systems" className="h-5 w-5" />,
//     submenu: true,
//     submenuItems: [
//       { title: "Payment Methods" },
//       { title: "Transactions" },
//       { title: "Revenue Reports" },
//     ],
//   },
//   {
//     title: "Support Center",
//     icon: <img src={maintenance} alt="support center" className="h-5 w-5" />,
//     submenu: true,
//     submenuItems: [
//       { title: "Support Tickets" },
//       { title: "System Status" },
//     ],
//   },
//   {
//     title: "System Settings",
//     icon: <img src={setting} alt="system settings" className="h-5 w-5" />,
//     submenu: true,
//     spacing: true,
//     submenuItems: [
//       { title: "Admin Profile" },
//       { title: "Global Settings" },
//     ],
//   },
//   {
//     title: "Logout",
//     icon: <img src={logout} alt="logout" className="h-5 w-5" />,
//     submenu: false,
//     action: "Logout",
//   },
// ];