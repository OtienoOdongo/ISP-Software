import { FaUserCircle } from "react-icons/fa";
import { BsFillRouterFill } from "react-icons/bs";
import { TfiWorld } from "react-icons/tfi";
import { RiSecurePaymentLine } from "react-icons/ri";
import { HiDocumentReport } from "react-icons/hi";
import { FcSupport } from "react-icons/fc";
import { TbSettingsAutomation } from "react-icons/tb";
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
      { title: "Super Admin Profile" },
      { title: "User Profile" },
      { title: "User Activity Log" },
      { title: "Plan Assignment" },
      { title: "Billing & Payment History" },
    ],
  },
  {
    title: "Internet Plans",
    icon: <TfiWorld className="h-8 w-8 text-slate-500" />,
    submenu: true,
    submenuItems: [
      { title: "Create Plans" },
      { title: "Plan Analytics" },
      { title: "Auto-Renewal Settings" },
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
      { title: "Security Settings" },
    ],
  },
  {
    title: "Payment Processing",
    icon: <RiSecurePaymentLine className="h-8 w-8 text-slate-500" />,
    submenu: true,
    submenuItems: [
      { title: "Transaction Monitoring" },
      { title: "Payment Gateway Settings" },
    ],
  },
  {
    title: "Reporting & Analytics",
    icon: <HiDocumentReport className="h-8 w-8 text-slate-500" />,
    submenu: true,
    submenuItems: [
      { title: "Usage Reports" },
      { title: "Financial Reports" },
    ],
  },
  {
    title: "Support & Maintenance",
    icon: <FcSupport className="h-8 w-8 text-slate-500" />,
    submenu: true,
    submenuItems: [
      { title: "User Support Tickets" },
      { title: "Knowledge Base" },
      { title: "Remote Support Access" },
      { title: "Firmware Updates" },
    ],
  },
  {
    title: "Automation & Alerts",
    icon: <TbSettingsAutomation className="h-8 w-8 text-slate-500" />,
    submenu: true,
    submenuItems: [
      { title: "Automated Alerts" },
      { title: "Scheduled Maintenance" },
      { title: "Task Automation" },
    ],
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





