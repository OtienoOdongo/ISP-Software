import { FaUserCircle } from "react-icons/fa";
import { BsFillRouterFill } from "react-icons/bs";
import { TfiWorld } from "react-icons/tfi";
import { RiSecurePaymentLine } from "react-icons/ri";
import { HiDocumentReport } from "react-icons/hi";
import { FcSupport } from "react-icons/fc";
import { Settings, Space } from 'lucide-react';
import { LogOut } from 'lucide-react';
import ActiveUsers  from "../assets/ActiveUsers.png"
import WifiSignal from "../assets/WifiSignal.png"
import customers from  "../assets/customers.png"
import customersGroup from  "../assets/customersGroup.png"
import income from "../assets/income.png"
import networth from "../assets/networth.png"
import wifiRouter from "../assets/wifiRouter.png"
import networking from "../assets/networking.png"

/**
 * Menu Items Configuration
 * Each menu item includes a title, optional icon, submenu flag, and submenu items (if any).
 */


export const menuItems = [
  { title: "Dashboard Overview" },
  {
    title: "User Management",
    icon: <FaUserCircle className="h-8 w-8 text-slate-500" />,
    submenu: true,
    submenuItems: [
      { title: "User Profile" },
      { title: "Plan Overview" },
    ],
  },
  {
    title: "Internet Plans",
    icon: <TfiWorld className="h-8 w-8 text-slate-500" />,
    submenu: true,
    submenuItems: [
      { title: "Create Plans" },
      { title: "Plan Analytics" },
    ],
  },
  {
    title: "Network Management",
    icon: <BsFillRouterFill className="h-8 w-8 text-slate-500" />,
    submenu: true,
    submenuItems: [
      {title: "Router Management"},
      { title: "Bandwidth Allocation" },
      { title: "IP Address Management" },
      { title: "Network Diagnostics" },
    ],
  },
  {
    title: "Payment Processing",
    icon: <RiSecurePaymentLine className="h-8 w-8 text-slate-500" />,
    submenu: true,
    submenuItems: [
      { title: "MPesa Transaction Log" },
      { title: "MPesa Configuration" },
      { title: "MPesa Callback Settings" },
      { title: "Payment Reconciliation" },
    ],
  },
  {
    title: "Reporting and Analytics",
    icon: <HiDocumentReport className="h-8 w-8 text-slate-500" />,
    submenu: true,
    submenuItems: [
      { title: "Usage Reports" },
      { title: "Financial Reports" },
    ],
  },
  {
    title: "Support and Maintenance",
    icon: <FcSupport className="h-8 w-8 text-slate-500" />,
    submenu: true,
    submenuItems: [
      { title: "User Support Tickets" },
      { title: "Knowledge Base" },
      
    ],
    
    
  },
 
  

  {
    title: "Account",
    icon: <Settings className="h-8 w-8 text-slate-500" />,
    submenu: true,
    spacing: true,
    submenuItems: [
      { title: "Admin Profile" },
      { title: "Settings" },
    ],
    
  },
  {
    title: "LogOut",
    icon: <LogOut className="h-8 w-8 text-slate-500" />,
    submenu: false,
    action: "LogOut"
  },
];








export const gridData = [
  {
    userIcon: <img src={ActiveUsers} alt="Active Users Icon"/>,
    userLabel: "Active Users",
    totalUsers: "12",
    signalIcon: <img src={WifiSignal} alt="Wifi Signal Icon"/>,
    userRate: -12.7,
  },
  {
    customersIcon: <img src={customers} alt="Customers Icon"/>,
    customerLabel: "Total Clients",
    totalClients: "78",
    customerGroupIcon: <img src={customersGroup} alt="Customers Group Icon"/>,
    customerRate: 34,
  },
  {
    incomeIcon: <img src={income} alt="Income Icon"/>,
    incomeLabel: "Today's Income",
    totalIncome: "KES 10,000",
    networthIcon: <img src={networth} alt="Networth Icon"/>,
    incomeRate: "45.6",
  },
  {
    connectIcon: <img src={networking} alt="Networking Icon"/>,
    connectLabel: "Connectivity Hubs",
    totalConnect: "3",
    otherConnectIcon: <img src={wifiRouter} alt="WiFi Router Icon"/>,
    connectRate:-3.4,
  }

]



//using local stoarge to store the access token and refresg token in the browser

export const ACCESS_TOKEN = "access";
export const REFRESH_TOKEN = "refresh"




