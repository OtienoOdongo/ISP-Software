


// // React & Routing
// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";

// // Context
// import { AuthProvider } from "./context/AuthContext";

// // Components
// import ProtectedRoute from "./components/ProtectedRoute";
// import Layout from "./Pages/Layout/Layout";
// import NoMatch from "./Pages/NotFound/NoMatch";

// // Auth Components
// import Login from "./components/auth/Login";
// import Signup from "./components/auth/Signup";
// import Activate from "./components/auth/Activate";
// import VerifyEmail from "./components/auth/VerifyEmail";
// import ResetPassword from "./components/auth/ResetPassword";
// import ResetPasswordConfirm from "./components/auth/ResetPasswordConfirm";

// // Dashboard & User Management
// import DashboardOverview from "./Pages/DashBoard/DashboardOverview";
// import ClientDashboard from "./Pages/UserManagement/ClientDashboard";
// import SmsAutomation from "./Pages/UserManagement/SmsAutomation";
// import BulkActions from "./Pages/UserManagement/BulkActions";

// // Internet Plans
// import CreatePlans from "./Pages/InternetPlans/CreatePlans";
// import PlanAnalytics from "./Pages/InternetPlans/PlanAnalytics";

// // Network Management
// import RouterManagement from "./Pages/NetworkManagement/RouterManagement";
// import BandwidthAllocation from "./Pages/NetworkManagement/BandwidthAllocation";
// import IPAddressManagement from "./Pages/NetworkManagement/IPAddressManagement";
// import NetworkDiagnostics from "./Pages/NetworkManagement/NetworkDiagnostics";

// // Payment Processing
// import TransactionLog from "./Pages/PaymentProcessing/TransactionLog";
// import PaymentConfiguration from "./Pages/PaymentProcessing/PaymentConfiguration";
// import PaymentReconciliation from "./Pages/PaymentProcessing/PaymentReconciliation";

// // Support & Maintenance
// import UserSupportTickets from "./Pages/SupportMaintenance/UserSupportTickets";
// import KnowledgeBase from "./Pages/SupportMaintenance/KnowledgeBase";

// // Account Management
// import AdminProfile from "./Pages/Account/AdminProfile";



// const App = () => {
//   return (
//     <AuthProvider>
//       <Routes>
//         {/* Public Routes */}
//         <Route path="/" element={<Navigate to="/login" replace />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/verify-email" element={<VerifyEmail />} />
//         <Route path="/activate/:uid/:token" element={<Activate />} />
//         <Route path="/forgot-password" element={<ResetPassword />} />
//         <Route path="/password/reset/confirm/:uid/:token" element={<ResetPasswordConfirm />} />

//         {/* Protected Routes with Layout */}
//         <Route
//           path="/dashboard"
//           element={
//             <ProtectedRoute>
//               <Layout />
//             </ProtectedRoute>
//           }
//         >
//           <Route index element={<DashboardOverview />} />
          
//           {/* Client Management Routes - Note the path="clients/*" */}
//           <Route path="clients/*">
//             <Route index element={<Navigate to="client-dashboard" replace />} />
//             <Route path="client-dashboard" element={<ClientDashboard />} />
//             <Route path="sms-automation" element={<SmsAutomation />} />
//             <Route path="bulk-actions" element={<BulkActions />} />
//           </Route>
          
//           {/* Internet Plan Routes */}
//           <Route path="internet/*">
//             <Route index element={<Navigate to="plan-management" replace />} />
//             <Route path="plan-management" element={<CreatePlans />} />
//             <Route path="usage-analytics" element={<PlanAnalytics />} />
//           </Route>
          
//           {/* Network Management Routes */}
//           <Route path="network/*">
//             <Route index element={<Navigate to="routers" replace />} />
//             <Route path="routers" element={<RouterManagement />} />
//             <Route path="bandwidth" element={<BandwidthAllocation />} />
//             <Route path="ip-management" element={<IPAddressManagement />} />
//             <Route path="diagnostics" element={<NetworkDiagnostics />} />
//           </Route>
          
//           {/* Payment Routes */}
//           <Route path="payments/*">
//             <Route index element={<Navigate to="transactions" replace />} />
//             <Route path="transactions" element={<TransactionLog />} />
//             <Route path="configuration" element={<PaymentConfiguration />} />
//             <Route path="reconciliation" element={<PaymentReconciliation />} />
//           </Route>
          
//           {/* Support Routes */}
//           <Route path="support/*">
//             <Route index element={<Navigate to="tickets" replace />} />
//             <Route path="tickets" element={<UserSupportTickets />} />
//             <Route path="resources" element={<KnowledgeBase />} />
//           </Route>
          
//           {/* Account Routes */}
//           <Route path="account/*">
//             <Route index element={<Navigate to="profile" replace />} />
//             <Route path="profile" element={<AdminProfile />} />
           
//           </Route>
//         </Route>

//         {/* Catch-All Route */}
//         <Route path="*" element={<NoMatch />} />
//       </Routes>
//     </AuthProvider>
//   );
// };

// export default App;







// // React & Routing
// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";

// // Context
// import { AuthProvider } from "./context/AuthContext";
// import { ThemeProvider } from "./context/ThemeContext"; 

// // Components
// import ProtectedRoute from "./components/ProtectedRoute";
// import Layout from "./Pages/Layout/Layout";
// import NoMatch from "./Pages/NotFound/NoMatch";

// // Auth Components
// import Login from "./components/auth/Login";
// import Signup from "./components/auth/Signup";
// import Activate from "./components/auth/Activate";
// import VerifyEmail from "./components/auth/VerifyEmail";
// import ResetPassword from "./components/auth/ResetPassword";
// import ResetPasswordConfirm from "./components/auth/ResetPasswordConfirm";

// // Dashboard & User Management
// import DashboardOverview from "./Pages/DashBoard/DashboardOverview";
// import ClientDashboard from "./Pages/UserManagement/ClientDashboard";
// import SmsAutomation from "./Pages/UserManagement/SmsAutomation";
// import BulkActions from "./Pages/UserManagement/BulkActions";

// // // Internet Plans
// // import CreatePlans from "./Pages/InternetPlans/CreatePlans";
// import PlanAnalytics from "./Pages/InternetPlans/PlanAnalytics";

// // Service Plans
// import PlanManagement from "./Pages/ServiceManagement/PlanManagement"
// import PlanTemplates from "./Pages/ServiceManagement/PlanTemplates"

// // Network Management
// import RouterManagement from "./Pages/NetworkManagement/RouterManagement";
// import BandwidthAllocation from "./Pages/NetworkManagement/BandwidthAllocation";
// import IPAddressManagement from "./Pages/NetworkManagement/IPAddressManagement";
// import NetworkDiagnostics from "./Pages/NetworkManagement/NetworkDiagnostics";

// // Payment Processing
// import TransactionLog from "./Pages/PaymentProcessing/TransactionLog";
// import PaymentConfiguration from "./Pages/PaymentProcessing/PaymentConfiguration";
// import PaymentReconciliation from "./Pages/PaymentProcessing/PaymentReconciliation";

// // Support & Maintenance
// import UserSupportTickets from "./Pages/SupportMaintenance/UserSupportTickets";
// import KnowledgeBase from "./Pages/SupportMaintenance/KnowledgeBase";

// // Account Management
// import AdminProfile from "./Pages/Account/AdminProfile";

// // Route configuration for better maintainability
// const routeConfig = {
//   public: [
//     { path: "/", element: <Navigate to="/login" replace /> },
//     { path: "/login", element: <Login /> },
//     { path: "/signup", element: <Signup /> },
//     { path: "/verify-email", element: <VerifyEmail /> },
//     { path: "/activate/:uid/:token", element: <Activate /> },
//     { path: "/forgot-password", element: <ResetPassword /> },
//     { path: "/password/reset/confirm/:uid/:token", element: <ResetPasswordConfirm /> },
//   ],
//   protected: {
//     dashboard: { index: true, element: <DashboardOverview /> },
//     clients: {
//       path: "clients/*",
//       children: [
//         { index: true, element: <Navigate to="client-dashboard" replace /> },
//         { path: "client-dashboard", element: <ClientDashboard /> },
//         { path: "sms-automation", element: <SmsAutomation /> },
//         { path: "bulk-actions", element: <BulkActions /> },
//       ],
//     },
//     internet: {
//       path: "internet/*",
//       children: [
//         { index: true, element: <Navigate to="plan-management" replace /> },
//         { path: "plan-management", element: <PlanMangement /> },
//         { path: "plan-templates", element: <PlanTemplates />},
//         { path: "usage-analytics", element: <PlanAnalytics /> },
//       ],
//     },
//     network: {
//       path: "network/*",
//       children: [
//         { index: true, element: <Navigate to="routers" replace /> },
//         { path: "routers", element: <RouterManagement /> },
//         { path: "bandwidth", element: <BandwidthAllocation /> },
//         { path: "ip-management", element: <IPAddressManagement /> },
//         { path: "diagnostics", element: <NetworkDiagnostics /> },
//       ],
//     },
//     payments: {
//       path: "payments/*",
//       children: [
//         { index: true, element: <Navigate to="transactions" replace /> },
//         { path: "transactions", element: <TransactionLog /> },
//         { path: "configuration", element: <PaymentConfiguration /> },
//         { path: "reconciliation", element: <PaymentReconciliation /> },
//       ],
//     },
//     support: {
//       path: "support/*",
//       children: [
//         { index: true, element: <Navigate to="tickets" replace /> },
//         { path: "tickets", element: <UserSupportTickets /> },
//         { path: "resources", element: <KnowledgeBase /> },
//       ],
//     },
//     account: {
//       path: "account/*",
//       children: [
//         { index: true, element: <Navigate to="profile" replace /> },
//         { path: "profile", element: <AdminProfile /> },
//       ],
//     },
//   },
// };

// // Helper function to render nested routes
// const renderNestedRoutes = (config) => {
//   return Object.values(config).map((route, index) => {
//     if (route.children) {
//       return (
//         <Route key={index} path={route.path}>
//           {route.children.map((child, childIndex) => (
//             <Route 
//               key={childIndex} 
//               index={child.index} 
//               path={child.path} 
//               element={child.element} 
//             />
//           ))}
//         </Route>
//       );
//     }
//     return (
//       <Route 
//         key={index} 
//         index={route.index} 
//         path={route.path} 
//         element={route.element} 
//       />
//     );
//   });
// };

// const App = () => {
//   return (
//     <ThemeProvider> {/* Wrap entire app with ThemeProvider */}
//       <AuthProvider>
//         <Routes>
//           {/* Public Routes */}
//           {routeConfig.public.map((route, index) => (
//             <Route 
//               key={index} 
//               path={route.path} 
//               element={route.element} 
//             />
//           ))}

//           {/* Protected Routes with Layout */}
//           <Route
//             path="/dashboard"
//             element={
//               <ProtectedRoute>
//                 <Layout />
//               </ProtectedRoute>
//             }
//           >
//             {renderNestedRoutes(routeConfig.protected)}
//           </Route>

//           {/* Catch-All Route */}
//           <Route path="*" element={<NoMatch />} />
//         </Routes>
//       </AuthProvider>
//     </ThemeProvider>
//   );
// };

// export default App;











// // React & Routing
// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";

// // Context
// import { AuthProvider } from "./context/AuthContext";
// import { ThemeProvider } from "./context/ThemeContext"; 

// // Components
// import ProtectedRoute from "./components/ProtectedRoute";
// import Layout from "./Pages/Layout/Layout";
// import NoMatch from "./Pages/NotFound/NoMatch";

// // Auth Components
// import Login from "./components/auth/Login";
// import Signup from "./components/auth/Signup";
// import Activate from "./components/auth/Activate";
// import VerifyEmail from "./components/auth/VerifyEmail";
// import ResetPassword from "./components/auth/ResetPassword";
// import ResetPasswordConfirm from "./components/auth/ResetPasswordConfirm";

// // Dashboard & User Management
// import DashboardOverview from "./Pages/DashBoard/DashboardOverview";
// import ClientDashboard from "./Pages/UserManagement/ClientDashboard";
// import SmsAutomation from "./Pages/UserManagement/SmsAutomation";
// import BulkActions from "./Pages/UserManagement/BulkActions";

// // Service Plans
// import PlanManagement from "./Pages/ServiceManagement/PlanManagement"; 


// // Network Management
// import RouterManagement from "./Pages/NetworkManagement/RouterManagement";
// import BandwidthAllocation from "./Pages/NetworkManagement/BandwidthAllocation";
// import IPAddressManagement from "./Pages/NetworkManagement/IPAddressManagement";
// import NetworkDiagnostics from "./Pages/NetworkManagement/NetworkDiagnostics";

// // Payment Processing
// import TransactionLog from "./Pages/PaymentProcessing/TransactionLog";
// import PaymentConfiguration from "./Pages/PaymentProcessing/PaymentConfiguration";
// import PaymentReconciliation from "./Pages/PaymentProcessing/PaymentReconciliation";

// // Support & Maintenance
// import UserSupportTickets from "./Pages/SupportMaintenance/UserSupportTickets";
// import KnowledgeBase from "./Pages/SupportMaintenance/KnowledgeBase";

// // Account Management
// import AdminProfile from "./Pages/Account/AdminProfile";

// // Route configuration for better maintainability
// const routeConfig = {
//   public: [
//     { path: "/", element: <Navigate to="/login" replace /> },
//     { path: "/login", element: <Login /> },
//     { path: "/signup", element: <Signup /> },
//     { path: "/verify-email", element: <VerifyEmail /> },
//     { path: "/activate/:uid/:token", element: <Activate /> },
//     { path: "/forgot-password", element: <ResetPassword /> },
//     { path: "/password/reset/confirm/:uid/:token", element: <ResetPasswordConfirm /> },
//   ],
//   protected: {
//     dashboard: { index: true, element: <DashboardOverview /> },
//     clients: {
//       path: "clients/*",
//       children: [
//         { index: true, element: <Navigate to="client-dashboard" replace /> },
//         { path: "client-dashboard", element: <ClientDashboard /> },
//         { path: "sms-automation", element: <SmsAutomation /> },
//         { path: "bulk-actions", element: <BulkActions /> },
//       ],
//     },
//     internet: {
//       path: "service-plans/*",
//       children: [
//         { index: true, element: <Navigate to="plan-management" replace /> },
//         { path: "plan-management", element: <PlanManagement /> }, 
//       ],
//     },
//     network: {
//       path: "network/*",
//       children: [
//         { index: true, element: <Navigate to="routers" replace /> },
//         { path: "routers", element: <RouterManagement /> },
//         { path: "bandwidth", element: <BandwidthAllocation /> },
//         { path: "ip-management", element: <IPAddressManagement /> },
//         { path: "diagnostics", element: <NetworkDiagnostics /> },
//       ],
//     },
//     payments: {
//       path: "payments/*",
//       children: [
//         { index: true, element: <Navigate to="transactions" replace /> },
//         { path: "transactions", element: <TransactionLog /> },
//         { path: "configuration", element: <PaymentConfiguration /> },
//         { path: "reconciliation", element: <PaymentReconciliation /> },
//       ],
//     },
//     support: {
//       path: "support/*",
//       children: [
//         { index: true, element: <Navigate to="tickets" replace /> },
//         { path: "tickets", element: <UserSupportTickets /> },
//         { path: "resources", element: <KnowledgeBase /> },
//       ],
//     },
//     account: {
//       path: "account/*",
//       children: [
//         { index: true, element: <Navigate to="profile" replace /> },
//         { path: "profile", element: <AdminProfile /> },
//       ],
//     },
//   },
// };

// // Helper function to render nested routes
// const renderNestedRoutes = (config) => {
//   return Object.values(config).map((route, index) => {
//     if (route.children) {
//       return (
//         <Route key={index} path={route.path}>
//           {route.children.map((child, childIndex) => (
//             <Route 
//               key={childIndex} 
//               index={child.index} 
//               path={child.path} 
//               element={child.element} 
//             />
//           ))}
//         </Route>
//       );
//     }
//     return (
//       <Route 
//         key={index} 
//         index={route.index} 
//         path={route.path} 
//         element={route.element} 
//       />
//     );
//   });
// };

// const App = () => {
//   return (
//     <ThemeProvider>
//       <AuthProvider>
//         <Routes>
//           {/* Public Routes */}
//           {routeConfig.public.map((route, index) => (
//             <Route 
//               key={index} 
//               path={route.path} 
//               element={route.element} 
//             />
//           ))}

//           {/* Protected Routes with Layout */}
//           <Route
//             path="/dashboard/*"
//             element={
//               <ProtectedRoute>
//                 <Layout />
//               </ProtectedRoute>
//             }
//           >
//             {renderNestedRoutes(routeConfig.protected)}
//           </Route>

//           {/* Catch-All Route */}
//           <Route path="*" element={<NoMatch />} />
//         </Routes>
//       </AuthProvider>
//     </ThemeProvider>
//   );
// };

// export default App;








// React & Routing
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Context
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext"; 

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./Pages/Layout/Layout";
import NoMatch from "./Pages/NotFound/NoMatch";

// Auth Components
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Activate from "./components/auth/Activate";
import VerifyEmail from "./components/auth/VerifyEmail";
import ResetPassword from "./components/auth/ResetPassword";
import ResetPasswordConfirm from "./components/auth/ResetPasswordConfirm";

// Dashboard & User Management
import DashboardOverview from "./Pages/DashBoard/DashboardOverview";
import Subscribers from "./Pages/UserManagement/Subscribers";
import SmsAutomation from "./Pages/UserManagement/SmsAutomation";


// Service Plans
import PlanManagement from "./Pages/ServiceManagement/PlanManagement"; 
import ServiceOperations from "./Pages/ServiceManagement/ServiceOperations"

// Network Management
import RouterManagement from "./Pages/NetworkManagement/RouterManagement";
import BandwidthAllocation from "./Pages/NetworkManagement/BandwidthAllocation";
import IPAddressManagement from "./Pages/NetworkManagement/IPAddressManagement";
import NetworkDiagnostics from "./Pages/NetworkManagement/NetworkDiagnostics";

// Payment Processing
import PaymentMethods from "./Pages/PaymentProcessing/PaymentMethods";
import TransactionLog from "./Pages/PaymentProcessing/TransactionLog";
import RevenueReports from "./Pages/PaymentProcessing/RevenueReports";

// Support & Maintenance
import SupportTickets from "./Pages/SupportMaintenance/SupportTickets";
import SystemStatus from "./Pages/SupportMaintenance/SystemStatus";

// Account Management
import AdminProfile from "./Pages/Account/AdminProfile";

// Route configuration for better maintainability
const routeConfig = {
  public: [
    { path: "/", element: <Navigate to="/login" replace /> },
    { path: "/login", element: <Login /> },
    { path: "/signup", element: <Signup /> },
    { path: "/verify-email", element: <VerifyEmail /> },
    { path: "/activate/:uid/:token", element: <Activate /> },
    { path: "/forgot-password", element: <ResetPassword /> },
    { path: "/password/reset/confirm/:uid/:token", element: <ResetPasswordConfirm /> },
  ],
  protected: {
    dashboard: { index: true, element: <DashboardOverview /> },
    // Updated to match "Subscriber Management" menu
    "subscribers": {
      path: "subscribers/*",
      children: [
        { index: true, element: <Navigate to="client-portal" replace /> },
        { path: "client-portal", element: <Subscribers /> },
        { path: "sms-automation", element: <SmsAutomation /> },
      
      ],
    },
    // Updated to match "Service Plans" menu
    "service-plans": {
      path: "service-plans/*",
      children: [
        { index: true, element: <Navigate to="plan-management" replace /> },
        { path: "plan-management", element: <PlanManagement /> }, 
        { path: "service-operations", element: <ServiceOperations /> },
      ],
    },
    // Updated to match "Network Infrastructure" menu
    "network": {
      path: "network/*",
      children: [
        { index: true, element: <Navigate to="routers-management" replace /> },
        { path: "routers-management", element: <RouterManagement /> },
        { path: "bandwidth", element: <BandwidthAllocation /> },
        { path: "ip-management", element: <IPAddressManagement /> },
        { path: "diagnostics", element: <NetworkDiagnostics /> },
      ],
    },
    // Updated to match "Payments System" menu
    "payments-system": {
      path: "payments-system/*",
      children: [
        { index: true, element: <Navigate to="payment-methods" replace /> },
        { path: "payment-methods", element: <PaymentMethods /> },
        { path: "transactions", element: <TransactionLog /> },
        { path: "revenue-reports", element: <RevenueReports /> },
      ],
    },
    // Updated to match "Support Center" menu
    "support-center": {
      path: "support-center/*",
      children: [
        { index: true, element: <Navigate to="support-tickets" replace /> },
        { path: "support-tickets", element: <SupportTickets /> },
        { path: "system-status", element: <SystemStatus /> },
      ],
    },
    // Updated to match "System Settings" menu
    "system-settings": {
      path: "system-settings/*",
      children: [
        { index: true, element: <Navigate to="admin-profile" replace /> },
        { path: "admin-profile", element: <AdminProfile /> },
      ],
    },
  },
};

// Helper function to render nested routes
const renderNestedRoutes = (config) => {
  return Object.values(config).map((route, index) => {
    if (route.children) {
      return (
        <Route key={index} path={route.path}>
          {route.children.map((child, childIndex) => (
            <Route 
              key={childIndex} 
              index={child.index} 
              path={child.path} 
              element={child.element} 
            />
          ))}
        </Route>
      );
    }
    return (
      <Route 
        key={index} 
        index={route.index} 
        path={route.path} 
        element={route.element} 
      />
    );
  });
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          {routeConfig.public.map((route, index) => (
            <Route 
              key={index} 
              path={route.path} 
              element={route.element} 
            />
          ))}

          {/* Protected Routes with Layout */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {renderNestedRoutes(routeConfig.protected)}
          </Route>

          {/* Catch-All Route */}
          <Route path="*" element={<NoMatch />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;