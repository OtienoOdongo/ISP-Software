export const menuItems = [
    { title: "Dashboard Overview" },

    // Keep existing structure but modify where necessary
    {
        title: "User Management",
        icon: <FaUserCircle className="h-8 w-8 text-slate-500" />,
        submenu: true,
        submenuItems: [
            { title: "Admin Profile" },
            { title: "User Profile" },
            { title: "User Activity Log" },
            { title: "Plan Assignment", path: "/plan-assignment" }, // Ensure this path reflects MikroTik user plan management
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

    // Update Network Management to reflect MikroTik specifics
    {
        title: "Network Management",
        icon: <BsFillRouterFill className="h-8 w-8 text-slate-500" />,
        submenu: true,
        submenuItems: [
            { title: "Router Management", path: "/router-management" }, // For MikroTik router config
            { title: "Bandwidth Allocation", path: "/bandwidth-allocation" }, // For QoS settings with MikroTik
            { title: "IP Address Management" }, // If this remains relevant with MikroTik
            { title: "Network Diagnostics", path: "/network-diagnostics" }, // Keep but ensure it works with MikroTik
            { title: "Security Settings", path: "/security-settings" }, // Ensure it's for MikroTik security
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
            { title: "Usage Reports", path: "/usage-reports" }, // Ensure this pulls data from MikroTik
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
            { title: "Remote Support Access", path: "/remote-support" }, // For MikroTik remote access if needed
            { title: "Firmware Updates", path: "/firmware-updates" }, // For MikroTik updates
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