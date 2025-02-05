// import React from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import Layout from './Pages/Layout/Layout'; 



// // Importing the Dashboard Overview page
// import DashboardOverview from './Pages/DashBoard/DashboardOverview';

// // User Management Routes
// import UserActivityLog from './Pages/UserManagement/UserActivityLog';
// import PlanAssignment from './Pages/UserManagement/PlanAssignment';
// import PaymentHistory from './Pages/UserManagement/PaymentHistory';
// import UserProfile from './Pages/UserManagement/UserProfile';

// // Internet Plans Routes
// import CreatePlans from './Pages/InternetPlans/CreatePlans';
// import PlanAnalytics from './Pages/InternetPlans/PlanAnalytics';

// // Network Management Routes
// import BandwidthAllocation from './Pages/NetworkManagement/BandwidthAllocation';
// import IPAddressManagement from './Pages/NetworkManagement/IPAddressManagement';
// import NetworkDiagnostics from './Pages/NetworkManagement/NetworkDiagnostics';
// import SecuritySettings from './Pages/NetworkManagement/SecuritySettings';
// import RouterManagement from './Pages/NetworkManagement/RouterManagement';

// // Payment Processing
// import MpesaTransactionLog from './Pages/PaymentProcessing/MpesaTransactionLog';
// import MpesaConfiguration from './Pages/PaymentProcessing/MpesaConfiguration';
// import MpesaCallbackSettings from './Pages/PaymentProcessing/MpesaCallbackSettings';
// import PaymentReconciliation from './Pages/PaymentProcessing/PaymentReconciliation';

// // Reporting & Analytics Routes
// import UsageReports from './Pages/ReportingAnalytics/UsageReports';
// import FinancialReports from './Pages/ReportingAnalytics/FinancialReports';

// // Support & Maintenance Routes
// import UserSupportTickets from './Pages/SupportMaintenance/UserSupportTickets';
// import KnowledgeBase from './Pages/SupportMaintenance/KnowledgeBase';

// // account and admin profile
// import AdminProfile from './Pages/Account/AdminProfile';
// import AccountSettings from './Pages/Account/AccountSettings';

// // Signup
// import LogIn from './Pages/SignUp/LogIn';
// import LogOut from './Pages/SignUp/LogOut';

// // Page Not Found
// import NoMatch from './Pages/NotFound/NoMatch';


// /**
//  * App Component
//  * Defines all application routes and uses Layout as the main container
//  */

// const App = () => {
//   return (
//     <Routes>
//       {/* Main layout wrapping all nested routes */}
//       <Route path="/" element={<Layout />}>
     
//         <Route index element={<DashboardOverview />} />
        

//         {/* User Management Routes */}
//         <Route path="user-management/user-activity-log" element={<UserActivityLog />} />
//         <Route path="user-management/plan-assignment" element={<PlanAssignment />} />
//         <Route path="user-management/billing-&-payment-history" element={<PaymentHistory />} />
//         <Route path="user-management/user-profile" element={<UserProfile />} />


//         {/* Internet Plans Routes */}
//         <Route path="internet-plans/create-plans" element={<CreatePlans />} />
//         <Route path="internet-plans/plan-analytics" element={<PlanAnalytics />} />
        
//         {/* Network Management Routes */}
//         <Route path="network-management/bandwidth-allocation" element={<BandwidthAllocation />} />
//         <Route path="network-management/ip-address-management" element={<IPAddressManagement />} />
//         <Route path="network-management/network-diagnostics" element={<NetworkDiagnostics />} />
//         <Route path="network-management/security-settings" element={<SecuritySettings />} />
//         <Route path="network-management/router-management" element={<RouterManagement />} />


//         {/* Payment Processing Routes */}
//         <Route path="payment-processing/m-pesa-transaction-log" element={<MpesaTransactionLog />} />
//         <Route path="payment-processing/m-pesa-configuration" element={<MpesaConfiguration />} />
//         <Route path="payment-processing/m-pesa-callback-settings" element={<MpesaCallbackSettings />} />
//         <Route path="payment-processing/payment-reconciliation" element={<PaymentReconciliation />} />
        


//         {/* Reporting & Analytics Routes */}
//         <Route path="reporting-&-analytics/usage-reports" element={<UsageReports />} />
//         <Route path="reporting-&-analytics/financial-reports" element={<FinancialReports />} />
        

//         {/* Support & Maintenance Routes */}
//         <Route path="support-&-maintenance/user-support-tickets" element={<UserSupportTickets />} />
//         <Route path="support-&-maintenance/knowledge-base" element={<KnowledgeBase />} />
        

        

//         {/*Admin profile and account settings*/}
//         <Route path="account/admin-profile" element={<AdminProfile />} />
//         <Route path="account/settings" element={<AccountSettings />} />

//         {/*Signup */}
//         <Route path="login" element={<LogIn />} />
//         <Route path="logout" element={<LogOut />} />

//         {/* Page Not Found */}
//         <Route path="*" element={<NoMatch />} />
//       </Route>
//     </Routes>
//   );
// };

// export default App;




















// import React, { useState, useEffect } from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import Layout from './Pages/Layout/Layout';

// // Importing the Dashboard Overview page
// import DashboardOverview from './Pages/DashBoard/DashboardOverview';

// // User Management Routes
// import UserActivityLog from './Pages/UserManagement/UserActivityLog';
// import PlanAssignment from './Pages/UserManagement/PlanAssignment';
// import PaymentHistory from './Pages/UserManagement/PaymentHistory';
// import UserProfile from './Pages/UserManagement/UserProfile';

// // Internet Plans Routes
// import CreatePlans from './Pages/InternetPlans/CreatePlans';
// import PlanAnalytics from './Pages/InternetPlans/PlanAnalytics';

// // Network Management Routes
// import BandwidthAllocation from './Pages/NetworkManagement/BandwidthAllocation';
// import IPAddressManagement from './Pages/NetworkManagement/IPAddressManagement';
// import NetworkDiagnostics from './Pages/NetworkManagement/NetworkDiagnostics';
// import SecuritySettings from './Pages/NetworkManagement/SecuritySettings';
// import RouterManagement from './Pages/NetworkManagement/RouterManagement';

// // Payment Processing
// import MpesaTransactionLog from './Pages/PaymentProcessing/MpesaTransactionLog';
// import MpesaConfiguration from './Pages/PaymentProcessing/MpesaConfiguration';
// import MpesaCallbackSettings from './Pages/PaymentProcessing/MpesaCallbackSettings';
// import PaymentReconciliation from './Pages/PaymentProcessing/PaymentReconciliation';

// // Reporting & Analytics Routes
// import UsageReports from './Pages/ReportingAnalytics/UsageReports';
// import FinancialReports from './Pages/ReportingAnalytics/FinancialReports';

// // Support & Maintenance Routes
// import UserSupportTickets from './Pages/SupportMaintenance/UserSupportTickets';
// import KnowledgeBase from './Pages/SupportMaintenance/KnowledgeBase';

// // Account and Admin Profile
// import AdminProfile from './Pages/Account/AdminProfile';
// import AccountSettings from './Pages/Account/AccountSettings';

// // authentication
// import LoginPage from './Pages/SignUp/LoginPage'

// // Page Not Found
// import NoMatch from './Pages/NotFound/NoMatch';

// const App = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(
//     localStorage.getItem('isAuthenticated') === 'true'
//   );

//   useEffect(() => {
//     localStorage.setItem('isAuthenticated', isAuthenticated);
//   }, [isAuthenticated]);

//   const handleLogin = () => setIsAuthenticated(true);
//   const handleLogout = () => {
//     setIsAuthenticated(false);
//     localStorage.removeItem('isAuthenticated');
//   };

//   const ProtectedRoute = ({ children }) => {
//     return isAuthenticated ? children : <Navigate to="/login" replace />;
//   };

//   return (
//     <Routes>
//       <Route path="/login" element={<LoginPage handleLogin={handleLogin} />} />

//       <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
//         <Route index element={<DashboardOverview />} />

//         {/* User Management Routes */}
//         <Route path="user-management/user-activity-log" element={<UserActivityLog />} />
//         <Route path="user-management/plan-assignment" element={<PlanAssignment />} />
//         <Route path="user-management/billing-payment-history" element={<PaymentHistory />} />
//         <Route path="user-management/user-profile" element={<UserProfile />} />

//         {/* Internet Plans Routes */}
//         <Route path="internet-plans/create-plans" element={<CreatePlans />} />
//         <Route path="internet-plans/plan-analytics" element={<PlanAnalytics />} />

//         {/* Network Management Routes */}
//         <Route path="network-management/bandwidth-allocation" element={<BandwidthAllocation />} />
//         <Route path="network-management/ip-address-management" element={<IPAddressManagement />} />
//         <Route path="network-management/network-diagnostics" element={<NetworkDiagnostics />} />
//         <Route path="network-management/security-settings" element={<SecuritySettings />} />
//         <Route path="network-management/router-management" element={<RouterManagement />} />

//         {/* Payment Processing Routes */}
//         <Route path="payment-processing/mpesa-transaction-log" element={<MpesaTransactionLog />} />
//         <Route path="payment-processing/mpesa-configuration" element={<MpesaConfiguration />} />
//         <Route path="payment-processing/mpesa-callback-settings" element={<MpesaCallbackSettings />} />
//         <Route path="payment-processing/payment-reconciliation" element={<PaymentReconciliation />} />

//         {/* Reporting & Analytics Routes */}
//         <Route path="reporting-analytics/usage-reports" element={<UsageReports />} />
//         <Route path="reporting-analytics/financial-reports" element={<FinancialReports />} />

//         {/* Support & Maintenance Routes */}
//         <Route path="support-maintenance/user-support-tickets" element={<UserSupportTickets />} />
//         <Route path="support-maintenance/knowledge-base" element={<KnowledgeBase />} />

//         {/* Admin Profile and Account Settings */}
//         <Route path="account/admin-profile" element={<AdminProfile />} />
//         <Route path="account/settings" element={<AccountSettings />} />

//         {/* Logout */}
//         {/* <Route path="logout" element={<LogOut handleLogout={handleLogout} />} /> */}

//         {/* Catch all for protected routes */}
//         <Route path="*" element={<NoMatch />} />
//       </Route>
//     </Routes>
//   );
// };

// export default App;











import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Layout from './Pages/Layout/Layout';


import DashboardOverview from './Pages/DashBoard/DashboardOverview';
import ProtectedRoute from './components/ProtectedRoute';

// User Management Routes
import UserActivityLog from './Pages/UserManagement/UserActivityLog';
import PlanAssignment from './Pages/UserManagement/PlanAssignment';
import PaymentHistory from './Pages/UserManagement/PaymentHistory';
import UserProfile from './Pages/UserManagement/UserProfile';

// Internet Plans Routes
import CreatePlans from './Pages/InternetPlans/CreatePlans';
import PlanAnalytics from './Pages/InternetPlans/PlanAnalytics';

// Network Management Routes
import BandwidthAllocation from './Pages/NetworkManagement/BandwidthAllocation';
import IPAddressManagement from './Pages/NetworkManagement/IPAddressManagement';
import NetworkDiagnostics from './Pages/NetworkManagement/NetworkDiagnostics';
import SecuritySettings from './Pages/NetworkManagement/SecuritySettings';
import RouterManagement from './Pages/NetworkManagement/RouterManagement';

// Payment Processing Routes
import MpesaTransactionLog from './Pages/PaymentProcessing/MpesaTransactionLog';
import MpesaConfiguration from './Pages/PaymentProcessing/MpesaConfiguration';
import MpesaCallbackSettings from './Pages/PaymentProcessing/MpesaCallbackSettings';
import PaymentReconciliation from './Pages/PaymentProcessing/PaymentReconciliation';

// Reporting & Analytics Routes
import UsageReports from './Pages/ReportingAnalytics/UsageReports';
import FinancialReports from './Pages/ReportingAnalytics/FinancialReports';

// Support & Maintenance Routes
import UserSupportTickets from './Pages/SupportMaintenance/UserSupportTickets';
import KnowledgeBase from './Pages/SupportMaintenance/KnowledgeBase';

// Account and Admin Profile Routes
import AdminProfile from './Pages/Account/AdminProfile';
import AccountSettings from './Pages/Account/AccountSettings';

// Authentication Routes
import LoginSignup from './Pages/SignUp/LoginPage';

import NoMatch from './Pages/NotFound/NoMatch';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );

  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated);
  }, [isAuthenticated]);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const navigate = useNavigate();

  return (
    <Routes>
      {/* Authentication Routes */}
      <Route
        path="/login"
        element={<LoginSignup isLogin={true} navigate={navigate} onLogin={handleLogin} />}
      />
      <Route
        path="/signup"
        element={<LoginSignup isLogin={false} navigate={navigate} onLogin={handleLogin} />}
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout onLogout={handleLogout} />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardOverview />} />

        {/* User Management Routes */}
        <Route path="user-management/user-activity-log" element={<UserActivityLog />} />
        <Route path="user-management/plan-assignment" element={<PlanAssignment />} />
        <Route path="user-management/billing-payment-history" element={<PaymentHistory />} />
        <Route path="user-management/user-profile" element={<UserProfile />} />

        {/* Internet Plans Routes */}
        <Route path="internet-plans/create-plans" element={<CreatePlans />} />
        <Route path="internet-plans/plan-analytics" element={<PlanAnalytics />} />

        {/* Network Management Routes */}
        <Route path="network-management/bandwidth-allocation" element={<BandwidthAllocation />} />
        <Route path="network-management/ip-address-management" element={<IPAddressManagement />} />
        <Route path="network-management/network-diagnostics" element={<NetworkDiagnostics />} />
        <Route path="network-management/security-settings" element={<SecuritySettings />} />
        <Route path="network-management/router-management" element={<RouterManagement />} />

        {/* Payment Processing Routes */}
        <Route path="payment-processing/mpesa-transaction-log" element={<MpesaTransactionLog />} />
        <Route path="payment-processing/mpesa-configuration" element={<MpesaConfiguration />} />
        <Route path="payment-processing/mpesa-callback-settings" element={<MpesaCallbackSettings />} />
        <Route path="payment-processing/payment-reconciliation" element={<PaymentReconciliation />} />

        {/* Reporting & Analytics Routes */}
        <Route path="reporting-analytics/usage-reports" element={<UsageReports />} />
        <Route path="reporting-analytics/financial-reports" element={<FinancialReports />} />

        {/* Support & Maintenance Routes */}
        <Route path="support-maintenance/user-support-tickets" element={<UserSupportTickets />} />
        <Route path="support-maintenance/knowledge-base" element={<KnowledgeBase />} />

        {/* Admin Profile and Account Settings */}
        <Route path="account/admin-profile" element={<AdminProfile />} />
        <Route path="account/settings" element={<AccountSettings />} />

        {/* Catch all for protected routes */}
        <Route path="*" element={<NoMatch />} />
      </Route>
    </Routes>
  );
};

export default App;
