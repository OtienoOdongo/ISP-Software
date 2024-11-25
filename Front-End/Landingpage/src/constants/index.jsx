
import { CheckCircle, XCircle } from 'lucide-react';


// This are the navigation items
export const navItems = [
    {label: "Features", href: "#"},
    {label: "Pricing", href: "#"},
    {label: "Contacts", href: "#"},
    {label: "Testimonials", href: "#"},
];



//This are the internet plans and how the are divide into 3 i.e. Basic, Plus, Premium

/*basic internet prices*/
export const basicDataPrice =  [
    {
        title: "25 Mbs",
        Price: "KES 5",
        Validity: "24hrs",
    },
    {
        title: "100 Mbs",
        Price: "KES 10",
        Validity: "24hrs",
    },
    {
        title: "250 Mbs",
        Price: "KES 20",
        Validity: "24hrs",
    },
    {
        title: "1 GB",
        Price: "KES 50",
        Validity: "24hrs",
    },
    {
        title: "2 GB",
        Price: "KES 90",
        Validity: "24hrs",
    },
];

/*plus internet prices*/
export const plusDataPrices = [
    {
        title: "500 Mbs",
        Price: "KES 45",
        Validity: "7 Days",
    },
    {
        title: "1.5 GB",
        Price: "KES 95",
        Validity: "7 Days",
    },
    {
        title: "3 GB",
        Price: "KES 200",
        Validity: "7 Days",
    },
    {
        title: "5 GB",
        Price: "KES 400",
        Validity: "7 Days",
    },
];

/*Premium Internet prices*/
export const premiumDataPrices = [
    {
        title: "2 GB",
        Price: "KES 200",
        Validity: "30 Days",
    },
    {
        title: "5 GB",
        Price: "KES 400",
        Validity: "30 Days",
    },
    {
        title: "10 GB",
        Price: "KES 700",
        Validity: "30 Days",
    },
    {
        title: "20 GB",
        Price: "KES 1000",
        Validity: "30 Days",
    },
];

//features 

export const planFeatures = [
  {
    plan: "Basic Plan",
    dataLimit: "5GB Daily Bundle",
    speed: "Up to 10 Mbps",
    customerSupport: "Email Support",
    streamingQuality: "720p HD",
    numberOfDevices: "3 Devices",
    dataRollover: "No",
    freeTrial: "1-Day Trial",
    installationFees: "None",
    advancedFeatures: <XCircle className="text-red-500 inline" /> // No VPN
  },
  {
    plan: "Plus Plan",
    dataLimit: "15GB Weekly Bundle",
    speed: "Up to 50 Mbps",
    customerSupport: "24/7 Email & Chat",
    streamingQuality: "1080p Full HD",
    numberOfDevices: "5 Devices",
    dataRollover: "Yes (up to 5GB)",
    freeTrial: "3-Day Trial",
    installationFees: "None",
    advancedFeatures: <CheckCircle className="text-green-500 inline" /> // VPN Included
  },
  {
    plan: "Premium Plan",
    dataLimit: "100GB Monthly Bundle",
    speed: "Up to 100 Mbps",
    customerSupport: "24/7 Priority Support",
    streamingQuality: "4K UHD",
    numberOfDevices: "Unlimited Devices",
    dataRollover: "Yes (up to 20GB)",
    freeTrial: "7-Day Trial",
    installationFees: "Free Installation",
    advancedFeatures: <CheckCircle className="text-green-500 inline" /> // VPN & Security Suite
  }
];
