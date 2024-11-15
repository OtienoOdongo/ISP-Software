import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Pages/Layout/Layout'; 



// Importing the Dashboard Overview page
import DashboardOverview from './Pages/DashBoard/DashboardOverview';

// User Management Routes
import UserProfile from './Pages/UserManagement/UserProfile';
import UserActivityLog from './Pages/UserManagement/UserActivityLog';
import PlanAssignment from './Pages/UserManagement/PlanAssignment';
import PaymentHistory from './Pages/UserManagement/PaymentHistory';

// Internet Plans Routes
import CreatePlans from './Pages/InternetPlans/CreatePlans';
import PlanAnalytics from './Pages/InternetPlans/PlanAnalytics';
import AutoRenewalSettings from './Pages/InternetPlans/AutoRenewalSettings';

// Network Management Routes
import BandwidthAllocation from './Pages/NetworkManagement/BandwidthAllocation';
import IPAddressManagement from './Pages/NetworkManagement/IPAddressManagement';
import NetworkDiagnostics from './Pages/NetworkManagement/NetworkDiagnostics';
import SecuritySettings from './Pages/NetworkManagement/SecuritySettings';

// Payment Processing Routes
import TransactionMonitoring from './Pages/PaymentProcessing/TransactionMonitoring';
import PaymentGatewaySettings from './Pages/PaymentProcessing/PaymentGatewaySettings';

// Reporting & Analytics Routes
import UsageReports from './Pages/ReportingAnalytics/UsageReports';
import FinancialReports from './Pages/ReportingAnalytics/FinancialReports';
import ExportData from './Pages/ReportingAnalytics/ExportData';

// Support & Maintenance Routes
import UserSupportTickets from './Pages/SupportMaintenance/UserSupportTickets';
import KnowledgeBase from './Pages/SupportMaintenance/KnowledgeBase';
import RemoteSupportAccess from './Pages/SupportMaintenance/RemoteSupportAccess';
import FirmwareUpdates from './Pages/SupportMaintenance/FirmwareUpdates';

// Automation & Alerts Routes
import AutomatedAlerts from './Pages/AutomationAlerts/AutomatedAlerts';
import ScheduledMaintenance from './Pages/AutomationAlerts/ScheduledMaintenance';
import TaskAutomation from './Pages/AutomationAlerts/TaskAutomation';

// Page Not Found
import NoMatch from './Pages/NotFound/NoMatch';

/**
 * App Component
 * Defines all application routes and uses Layout as the main container
 */

const App = () => {
  return (
    <Routes>
      {/* Main layout wrapping all nested routes */}
      <Route path="/" element={<Layout />}>
     
        <Route index element={<DashboardOverview />} />
        

        {/* User Management Routes */}
        <Route path="user-management/user-profile" element={<UserProfile />} />
        <Route path="user-management/user-activity-log" element={<UserActivityLog />} />
        <Route path="user-management/plan-assignment" element={<PlanAssignment />} />
        <Route path="user-management/billing-&-payment-history" element={<PaymentHistory />} />

        {/* Internet Plans Routes */}
        <Route path="internet-plans/create-plans" element={<CreatePlans />} />
        <Route path="internet-plans/plan-analytics" element={<PlanAnalytics />} />
        <Route path="internet-plans/auto-renewal-settings" element={<AutoRenewalSettings />} />

        {/* Network Management Routes */}
        <Route path="network-management/bandwidth-allocation" element={<BandwidthAllocation />} />
        <Route path="network-management/ip-address-management" element={<IPAddressManagement />} />
        <Route path="network-management/network-diagnostics" element={<NetworkDiagnostics />} />
        <Route path="network-management/security-settings" element={<SecuritySettings />} />

        {/* Payment Processing Routes */}
        <Route path="payment-processing/transaction-monitoring" element={<TransactionMonitoring />} />
        <Route path="payment-processing/payment-gateway-settings" element={<PaymentGatewaySettings />} />

        {/* Reporting & Analytics Routes */}
        <Route path="reporting-&-analytics/usage-reports" element={<UsageReports />} />
        <Route path="reporting-&-analytics/financial-reports" element={<FinancialReports />} />
        <Route path="reporting-&-analytics/export-data" element={<ExportData />} />

        {/* Support & Maintenance Routes */}
        <Route path="support-&-maintenance/user-support-tickets" element={<UserSupportTickets />} />
        <Route path="support-&-maintenance/knowledge-base" element={<KnowledgeBase />} />
        <Route path="support-&-maintenance/remote-support-access" element={<RemoteSupportAccess />} />
        <Route path="support-&-maintenance/firmware-updates" element={<FirmwareUpdates />} />

        {/* Automation & Alerts Routes */}
        <Route path="automation-&-alerts/automated-alerts" element={<AutomatedAlerts />} />
        <Route path="automation-&-alerts/scheduled-maintenance" element={<ScheduledMaintenance />} />
        <Route path="automation-&-alerts/task-automation" element={<TaskAutomation />} />

        {/* Page Not Found */}
        <Route path="*" element={<NoMatch />} />
      </Route>
    </Routes>
  );
};

export default App;

