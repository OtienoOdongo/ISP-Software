// import users from "../assets/users.png";
// import internet from "../assets/internet.png";
// import payment from "../assets/payment.png";
// import network from "../assets/network.png";
// import setting from "../assets/setting.png";
// import maintenance from "../assets/maintenance.png";
// import logout from "../assets/logout.png"; 

// export const menuItems = [
//   { title: "Dashboard Overview", },
//   {
//     title: "User Management",
//     icon: <img src={users} alt="users" className="h-6 w-6" />,
//     submenu: true,
//     submenuItems: [
//       { title: "User Profile" },
//       { title: "Plan Overview" },
//     ],
//   },
//   {
//     title: "Internet Plans",
//     icon: <img src={internet} alt="internet" className="h-6 w-6" />,
//     submenu: true,
//     submenuItems: [
//       { title: "Create Plans" },
//       { title: "Plan Analytics" },
//     ],
//   },
//   {
//     title: "Network Management",
//     icon: <img src={network} alt="network" className="h-6 w-6" />,
//     submenu: true,
//     submenuItems: [
//       { title: "Router Management" },
//       { title: "Bandwidth Allocation" },
//       { title: "IP Address Management" },
//       { title: "Network Diagnostics" },
//     ],
//   },
//   {
//     title: "Payment Processing",
//     icon: <img src={payment} alt="payment" className="h-6 w-6" />,
//     submenu: true,
//     submenuItems: [
//       { title: "Payment Transaction Log" },
//       { title: "Payment Configuration" },
//       { title: "MPesa Callback Settings" },
//       { title: "Payment Reconciliation" },
//     ],
//   },
//   {
//     title: "Support and Maintenance",
//     icon: <img src={maintenance} alt="maintenance" className="h-6 w-6" />,
//     submenu: true,
//     submenuItems: [
//       { title: "User Support Tickets" },
//       { title: "Knowledge Base" },
//     ],
//   },
//   {
//     title: "Account",
//     icon: <img src={setting} alt="setting" className="h-6 w-6" />,
//     submenu: true,
//     spacing: true,
//     submenuItems: [
//       { title: "Admin Profile" },
//       { title: "Settings" },
//     ],
//   },
//   {
//     title: "LogOut",
//     icon: <img src={logout} alt="logout" className="h-6 w-6" />,
//     submenu: false,
//     action: "LogOut",
//   },
// ];



import internet from "../assets/internet.png";
import payment from "../assets/payment.png";
import network from "../assets/network.png";
import setting from "../assets/setting.png";
import maintenance from "../assets/maintenance.png";
import logout from "../assets/logout.png"; 
import users from "../assets/users.png";

export const menuItems = [
  { 
    title: "Dashboard",
    
  },
  {
    title: "Clients",
    icon: <img src={users} alt="client management icon" className="h-5 w-5" />,
    submenu: true,
    submenuItems: [
      { title: "Client Dashboard" },
      { title: "SMS Automation" },   
      { title: "Bulk Actions" },
      
    ],
  },
  {
    title: "Internet",
    icon: <img src={internet} alt="internet" className="h-5 w-5" />,
    submenu: true,
    submenuItems: [
      { title: "Plan Management" },
      { title: "Usage Analytics" },
    ],
  },
  {
    title: "Network",
    icon: <img src={network} alt="network" className="h-5 w-5" />,
    submenu: true,
    submenuItems: [
      { title: "Routers" },
      { title: "Bandwidth" },
      { title: "IP Management" },
      { title: "Diagnostics" },
    ],
  },
  {
    title: "Payments",
    icon: <img src={payment} alt="payment" className="h-5 w-5" />,
    submenu: true,
    submenuItems: [
      { title: "Transactions" },
      { title: "Configuration" },
      { title: "Reconciliation" },
    ],
  },
  {
    title: "Support",
    icon: <img src={maintenance} alt="maintenance" className="h-5 w-5" />,
    submenu: true,
    submenuItems: [
      { title: "Tickets" },
      { title: "Resources" },
    ],
  },
  {
    title: "Account",
    icon: <img src={setting} alt="setting" className="h-5 w-5" />,
    submenu: true,
    spacing: true,
    submenuItems: [
      { title: "Profile" },
      
    ],
  },
  {
    title: "Logout",
    icon: <img src={logout} alt="logout" className="h-5 w-5" />,
    submenu: false,
    action: "Logout",
  },
];





//using local stoarge to store the access token and refresg token in the browser

export const ACCESS_TOKEN = "access";
export const REFRESH_TOKEN = "refresh"




