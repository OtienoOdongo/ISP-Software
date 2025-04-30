import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Activate from "./components/auth/Activate";
import VerifyEmail from "./components/auth/VerifyEmail";
import ResetPassword from "./components/auth/ResetPassword";
import ResetPasswordConfirm from "./components/auth/ResetPasswordConfirm";
import DashboardOverview from "./Pages/DashBoard/DashboardOverview";
import PlanOverview from "./Pages/UserManagement/PlanOverview";
import UserProfile from "./Pages/UserManagement/UserProfile";
import CreatePlans from "./Pages/InternetPlans/CreatePlans";
import PlanAnalytics from "./Pages/InternetPlans/PlanAnalytics";
import BandwidthAllocation from "./Pages/NetworkManagement/BandwidthAllocation";
import IPAddressManagement from "./Pages/NetworkManagement/IPAddressManagement";
import NetworkDiagnostics from "./Pages/NetworkManagement/NetworkDiagnostics";
import SecuritySettings from "./Pages/NetworkManagement/SecuritySettings";
import RouterManagement from "./Pages/NetworkManagement/RouterManagement";
import MpesaTransactionLog from "./Pages/PaymentProcessing/MpesaTransactionLog";
import MpesaConfiguration from "./Pages/PaymentProcessing/MpesaConfiguration";
import MpesaCallbackSettings from "./Pages/PaymentProcessing/MpesaCallbackSettings";
import PaymentReconciliation from "./Pages/PaymentProcessing/PaymentReconciliation";
import UsageReports from "./Pages/ReportingAnalytics/UsageReports";
import FinancialReports from "./Pages/ReportingAnalytics/FinancialReports";
import UserSupportTickets from "./Pages/SupportMaintenance/UserSupportTickets";
import KnowledgeBase from "./Pages/SupportMaintenance/KnowledgeBase";
import AdminProfile from "./Pages/Account/AdminProfile";
import AccountSettings from "./Pages/Account/AccountSettings";
import NoMatch from "./Pages/NotFound/NoMatch";
import Layout from "./Pages/Layout/Layout";

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
          <Route path="user-management">
            <Route path="plan-overview" element={<PlanOverview />} />
            <Route path="user-profile" element={<UserProfile />} />
          </Route>
          <Route path="internet-plans">
            <Route path="create-plans" element={<CreatePlans />} />
            <Route path="plan-analytics" element={<PlanAnalytics />} />
          </Route>
          <Route path="network-management">
            <Route path="bandwidth-allocation" element={<BandwidthAllocation />} />
            <Route path="ip-address-management" element={<IPAddressManagement />} />
            <Route path="network-diagnostics" element={<NetworkDiagnostics />} />
            <Route path="security-settings" element={<SecuritySettings />} />
            <Route path="router-management" element={<RouterManagement />} />
          </Route>
          <Route path="payment-processing">
            <Route path="mpesa-transaction-log" element={<MpesaTransactionLog />} />
            <Route path="mpesa-configuration" element={<MpesaConfiguration />} />
            <Route path="mpesa-callback-settings" element={<MpesaCallbackSettings />} />
            <Route path="payment-reconciliation" element={<PaymentReconciliation />} />
          </Route>
          <Route path="reporting-and-analytics">
            <Route path="usage-reports" element={<UsageReports />} />
            <Route path="financial-reports" element={<FinancialReports />} />
          </Route>
          <Route path="support-and-maintenance">
            <Route path="user-support-tickets" element={<UserSupportTickets />} /> {/* Updated */}
            <Route path="knowledge-base" element={<KnowledgeBase />} /> {/* Updated */}
          </Route>
          <Route path="account">
            <Route path="admin-profile" element={<AdminProfile />} />
            <Route path="settings" element={<AccountSettings />} />
          </Route>
        </Route>

        {/* Catch-All Route */}
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;