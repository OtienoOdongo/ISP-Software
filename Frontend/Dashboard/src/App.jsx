



// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import { AuthProvider } from "./context/AuthContext";
// import ProtectedRoute from "./components/ProtectedRoute";
// import Login from "./components/auth/Login";
// import Signup from "./components/auth/Signup";
// import Activate from "./components/auth/Activate";
// import VerifyEmail from "./components/auth/VerifyEmail";
// import ResetPassword from "./components/auth/ResetPassword";
// import ResetPasswordConfirm from "./components/auth/ResetPasswordConfirm";
// import DashboardOverview from "./Pages/DashBoard/DashboardOverview";
// import ClientDashboard from "./Pages/UserManagement/ClientDashboard"; 
// import SmsAutomation from "./Pages/UserManagement/SmsAutomation";
// import BulkActions from "./Pages/UserManagement/BulkActions";
// import CreatePlans from "./Pages/InternetPlans/CreatePlans"; // Plan Management
// import PlanAnalytics from "./Pages/InternetPlans/PlanAnalytics"; // Usage Analytics
// import RouterManagement from "./Pages/NetworkManagement/RouterManagement"; // Routers
// import BandwidthAllocation from "./Pages/NetworkManagement/BandwidthAllocation"; // Bandwidth
// import IPAddressManagement from "./Pages/NetworkManagement/IPAddressManagement"; // IP Management
// import NetworkDiagnostics from "./Pages/NetworkManagement/NetworkDiagnostics"; // Diagnostics
// import TransactionLog from "./Pages/PaymentProcessing/TransactionLog"; // Transactions
// import PaymentConfiguration from "./Pages/PaymentProcessing/PaymentConfiguration"; // Configuration
// import MpesaCallbackSettings from "./Pages/PaymentProcessing/MpesaCallbackSettings"; // MPesa Settings
// import PaymentReconciliation from "./Pages/PaymentProcessing/PaymentReconciliation"; // Reconciliation
// import UserSupportTickets from "./Pages/SupportMaintenance/UserSupportTickets"; // Tickets
// import KnowledgeBase from "./Pages/SupportMaintenance/KnowledgeBase"; // Resources
// import AdminProfile from "./Pages/Account/AdminProfile"; // Profile
// import AccountSettings from "./Pages/Account/AccountSettings"; // Preferences
// import NoMatch from "./Pages/NotFound/NoMatch";
// import Layout from "./Pages/Layout/Layout";

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

//           {/* Client */}
//           <Route path="client">
//             <Route path="client-dashboard" element={<ClientDashboard />} />
//             <Route path="sms-automation" element={<SmsAutomation />} />
//             <Route path="bulk-actions" element={<BulkActions />} />
//           </Route>

//           {/* Internet */}
//           <Route path="internet">
//             <Route path="plan-management" element={<CreatePlans />} />
//             <Route path="usage-analytics" element={<PlanAnalytics />} />
//           </Route>

//           {/* Network */}
//           <Route path="network">
//             <Route path="routers" element={<RouterManagement />} />
//             <Route path="bandwidth" element={<BandwidthAllocation />} />
//             <Route path="ip-management" element={<IPAddressManagement />} />
//             <Route path="diagnostics" element={<NetworkDiagnostics />} />
//           </Route>

//           {/* Payments */}
//           <Route path="payments">
//             <Route path="transactions" element={<TransactionLog />} />
//             <Route path="configuration" element={<PaymentConfiguration />} />
//             <Route path="mpesa-settings" element={<MpesaCallbackSettings />} />
//             <Route path="reconciliation" element={<PaymentReconciliation />} />
//           </Route>

//           {/* Support */}
//           <Route path="support">
//             <Route path="tickets" element={<UserSupportTickets />} />
//             <Route path="resources" element={<KnowledgeBase />} />
//           </Route>

//           {/* Account */}
//           <Route path="account">
//             <Route path="profile" element={<AdminProfile />} />
//             <Route path="preferences" element={<AccountSettings />} />
//           </Route>
//         </Route>

//         {/* Catch-All Route */}
//         <Route path="*" element={<NoMatch />} />
//       </Routes>
//     </AuthProvider>
//   );
// };

// export default App;







// React & Routing
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Context
import { AuthProvider } from "./context/AuthContext";

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
import ClientDashboard from "./Pages/UserManagement/ClientDashboard";
import SmsAutomation from "./Pages/UserManagement/SmsAutomation";
import BulkActions from "./Pages/UserManagement/BulkActions";

// Internet Plans
import CreatePlans from "./Pages/InternetPlans/CreatePlans";
import PlanAnalytics from "./Pages/InternetPlans/PlanAnalytics";

// Network Management
import RouterManagement from "./Pages/NetworkManagement/RouterManagement";
import BandwidthAllocation from "./Pages/NetworkManagement/BandwidthAllocation";
import IPAddressManagement from "./Pages/NetworkManagement/IPAddressManagement";
import NetworkDiagnostics from "./Pages/NetworkManagement/NetworkDiagnostics";

// Payment Processing
import TransactionLog from "./Pages/PaymentProcessing/TransactionLog";
import PaymentConfiguration from "./Pages/PaymentProcessing/PaymentConfiguration";
import PaymentReconciliation from "./Pages/PaymentProcessing/PaymentReconciliation";

// Support & Maintenance
import UserSupportTickets from "./Pages/SupportMaintenance/UserSupportTickets";
import KnowledgeBase from "./Pages/SupportMaintenance/KnowledgeBase";

// Account Management
import AdminProfile from "./Pages/Account/AdminProfile";



const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/activate/:uid/:token" element={<Activate />} />
        <Route path="/forgot-password" element={<ResetPassword />} />
        <Route path="/password/reset/confirm/:uid/:token" element={<ResetPasswordConfirm />} />

        {/* Protected Routes with Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardOverview />} />
          
          {/* Client Management Routes - Note the path="clients/*" */}
          <Route path="clients/*">
            <Route index element={<Navigate to="client-dashboard" replace />} />
            <Route path="client-dashboard" element={<ClientDashboard />} />
            <Route path="sms-automation" element={<SmsAutomation />} />
            <Route path="bulk-actions" element={<BulkActions />} />
          </Route>
          
          {/* Internet Plan Routes */}
          <Route path="internet/*">
            <Route index element={<Navigate to="plan-management" replace />} />
            <Route path="plan-management" element={<CreatePlans />} />
            <Route path="usage-analytics" element={<PlanAnalytics />} />
          </Route>
          
          {/* Network Management Routes */}
          <Route path="network/*">
            <Route index element={<Navigate to="routers" replace />} />
            <Route path="routers" element={<RouterManagement />} />
            <Route path="bandwidth" element={<BandwidthAllocation />} />
            <Route path="ip-management" element={<IPAddressManagement />} />
            <Route path="diagnostics" element={<NetworkDiagnostics />} />
          </Route>
          
          {/* Payment Routes */}
          <Route path="payments/*">
            <Route index element={<Navigate to="transactions" replace />} />
            <Route path="transactions" element={<TransactionLog />} />
            <Route path="configuration" element={<PaymentConfiguration />} />
            <Route path="reconciliation" element={<PaymentReconciliation />} />
          </Route>
          
          {/* Support Routes */}
          <Route path="support/*">
            <Route index element={<Navigate to="tickets" replace />} />
            <Route path="tickets" element={<UserSupportTickets />} />
            <Route path="resources" element={<KnowledgeBase />} />
          </Route>
          
          {/* Account Routes */}
          <Route path="account/*">
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<AdminProfile />} />
           
          </Route>
        </Route>

        {/* Catch-All Route */}
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;