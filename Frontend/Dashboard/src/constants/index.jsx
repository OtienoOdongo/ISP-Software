



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
    title: "Subscribers",
    icon: <UsersIcon className="h-5 w-5" />,
    submenu: true,
    submenuItems: [
      { title: "Client Portal" },
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
      { title: "Service Operations" },
    ],
  },
  {
    title: "Network",
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



































