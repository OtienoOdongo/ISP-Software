// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import ProtectedRoute from "./components/ProtectedRoute";
// import Login from "./components/auth/Login";
// import Signup from "./components/auth/Signup";
// import DashboardOverview from "./Pages/DashBoard/DashboardOverview";
// import UserActivityLog from "./Pages/UserManagement/UserActivityLog";
// import PlanAssignment from "./Pages/UserManagement/PlanAssignment";
// import PaymentHistory from "./Pages/UserManagement/PaymentHistory";
// import UserProfile from "./Pages/UserManagement/UserProfile";
// import CreatePlans from "./Pages/InternetPlans/CreatePlans";
// import PlanAnalytics from "./Pages/InternetPlans/PlanAnalytics";
// import BandwidthAllocation from "./Pages/NetworkManagement/BandwidthAllocation";
// import IPAddressManagement from "./Pages/NetworkManagement/IPAddressManagement";
// import NetworkDiagnostics from "./Pages/NetworkManagement/NetworkDiagnostics";
// import SecuritySettings from "./Pages/NetworkManagement/SecuritySettings";
// import RouterManagement from "./Pages/NetworkManagement/RouterManagement";
// import MpesaTransactionLog from "./Pages/PaymentProcessing/MpesaTransactionLog";
// import MpesaConfiguration from "./Pages/PaymentProcessing/MpesaConfiguration";
// import MpesaCallbackSettings from "./Pages/PaymentProcessing/MpesaCallbackSettings";
// import PaymentReconciliation from "./Pages/PaymentProcessing/PaymentReconciliation";
// import UsageReports from "./Pages/ReportingAnalytics/UsageReports";
// import FinancialReports from "./Pages/ReportingAnalytics/FinancialReports";
// import UserSupportTickets from "./Pages/SupportMaintenance/UserSupportTickets";
// import KnowledgeBase from "./Pages/SupportMaintenance/KnowledgeBase";
// import AdminProfile from "./Pages/Account/AdminProfile";
// import AccountSettings from "./Pages/Account/AccountSettings";
// import NoMatch from "./Pages/NotFound/NoMatch";
// import Layout from "./Pages/Layout/Layout";

// const App = () => {
//     return (
//         <Routes>
//             {/* Redirect root to login */}
//             <Route path="/" element={<Navigate to="/login" replace />} />

//             {/* Public Routes */}
//             <Route path="/login" element={<Login />} />
//             <Route path="/signup" element={<Signup />} />

//             {/* Protected Routes */}
//             <Route
//                 path="/dashboard"
//                 element={
//                     <ProtectedRoute>
//                         <Layout>
//                             <DashboardOverview />
//                         </Layout>
//                     </ProtectedRoute>
//                 }
//             />

//             {/* User Management Routes */}
//             <Route
//                 path="/user-management/user-activity-log"
//                 element={
//                     <ProtectedRoute permission="CAN_MANAGE_USERS">
//                         <Layout>
//                             <UserActivityLog />
//                         </Layout>
//                     </ProtectedRoute>
//                 }
//             />
//             <Route
//                 path="/user-management/plan-assignment"
//                 element={
//                     <ProtectedRoute permission="CAN_MANAGE_USERS">
//                         <Layout>
//                             <PlanAssignment />
//                         </Layout>
//                     </ProtectedRoute>
//                 }
//             />
//             <Route
//                 path="/user-management/billing-payment-history"
//                 element={
//                     <ProtectedRoute permission="CAN_MANAGE_USERS">
//                         <Layout>
//                             <PaymentHistory />
//                         </Layout>
//                     </ProtectedRoute>
//                 }
//             />
//             <Route
//                 path="/user-management/user-profile"
//                 element={
//                     <ProtectedRoute permission="CAN_MANAGE_USERS">
//                         <Layout>
//                             <UserProfile />
//                         </Layout>
//                     </ProtectedRoute>
//                 }
//             />

//             {/* Internet Plans Routes */}
//             <Route
//                 path="/internet-plans/create-plans"
//                 element={
//                     <ProtectedRoute permission="CAN_MANAGE_PLANS">
//                         <Layout>
//                             <CreatePlans />
//                         </Layout>
//                     </ProtectedRoute>
//                 }
//             />
//             <Route
//                 path="/internet-plans/plan-analytics"
//                 element={
//                     <ProtectedRoute permission="CAN_VIEW_ANALYTICS">
//                         <Layout>
//                             <PlanAnalytics />
//                         </Layout>
//                     </ProtectedRoute>
//                 }
//             />

//             {/* Network Management Routes */}
//             <Route
//                 path="/network-management/bandwidth-allocation"
//                 element={
//                     <ProtectedRoute permission="CAN_MANAGE_NETWORK">
//                         <Layout>
//                             <BandwidthAllocation />
//                         </Layout>
//                     </ProtectedRoute>
//                 }
//             />
//             <Route
//                 path="/network-management/ip-address-management"
//                 element={
//                     <ProtectedRoute permission="CAN_MANAGE_NETWORK">
//                         <Layout>
//                             <IPAddressManagement />
//                         </Layout>
//                     </ProtectedRoute>
//                 }
//             />
//             <Route
//                 path="/network-management/network-diagnostics"
//                 element={
//                     <ProtectedRoute permission="CAN_MANAGE_NETWORK">
//                         <Layout>
//                             <NetworkDiagnostics />
//                         </Layout>
//                     </ProtectedRoute>
//                 }
//             />
//             <Route
//                 path="/network-management/security-settings"
//                 element={
//                     <ProtectedRoute permission="CAN_MANAGE_NETWORK">
//                         <Layout>
//                             <SecuritySettings />
//                         </Layout>
//                     </ProtectedRoute>
//                 }
//             />
//             <Route
//                 path="/network-management/router-management"
//                 element={
//                     <ProtectedRoute permission="CAN_MANAGE_NETWORK">
//                         <Layout>
//                             <RouterManagement />
//                         </Layout>
//                     </ProtectedRoute>
//                 }
//             />

//             {/* Payment Processing Routes */}
//             <Route
//                 path="/payment-processing/mpesa-transaction-log"
//                 element={
//                     <ProtectedRoute permission="CAN_CONFIGURE_Mpesa">
//                         <Layout>
//                             <MpesaTransactionLog />
//                         </Layout>
//                     </ProtectedRoute>
//                 }
//             />
//             <Route
//                 path="/payment-processing/mpesa-configuration"
//                 element={
//                     <ProtectedRoute permission="CAN_CONFIGURE_Mpesa">
//                         <Layout>
//                             <MpesaConfiguration />
//                         </Layout>
//                     </ProtectedRoute>
//                 }
//             />
//             <Route
//                 path="/payment-processing/mpesa-callback-settings"
//                 element={
//                     <ProtectedRoute permission="CAN_CONFIGURE_Mpesa">
//                         <Layout>
//                             <MpesaCallbackSettings />
//                         </Layout>
//                     </ProtectedRoute>
//                 }
//             />
//             <Route
//                 path="/payment-processing/payment-reconciliation"
//                 element={
//                     <ProtectedRoute permission="CAN_CONFIGURE_Mpesa">
//                         <Layout>
//                             <PaymentReconciliation />
//                         </Layout>
//                     </ProtectedRoute>
//                 }
//             />

//             {/* Reporting & Analytics Routes */}
//             <Route
//                 path="/reporting-analytics/usage-reports"
//                 element={
//                     <ProtectedRoute permission="CAN_VIEW_ANALYTICS">
//                         <Layout>
//                             <UsageReports />
//                         </Layout>
//                     </ProtectedRoute>
//                 }
//             />
//             <Route
//                 path="/reporting-analytics/financial-reports"
//                 element={
//                     <ProtectedRoute permission="CAN_VIEW_ANALYTICS">
//                         <Layout>
//                             <FinancialReports />
//                         </Layout>
//                     </ProtectedRoute>
//                 }
//             />

//             {/* Support & Maintenance Routes */}
//             <Route
//                 path="/support-maintenance/user-support-tickets"
//                 element={
//                     <ProtectedRoute permission="CAN_MANAGE_SUPPORT">
//                         <Layout>
//                             <UserSupportTickets />
//                         </Layout>
//                     </ProtectedRoute>
//                 }
//             />
//             <Route
//                 path="/support-maintenance/knowledge-base"
//                 element={
//                     <ProtectedRoute permission="CAN_VIEW_KNOWLEDGE_BASE">
//                         <Layout>
//                             <KnowledgeBase />
//                         </Layout>
//                     </ProtectedRoute>
//                 }
//             />

//             {/* Account and Admin Profile Routes */}
//             <Route
//                 path="/account/admin-profile"
//                 element={
//                     <ProtectedRoute permission="CAN_VIEW_PROFILE">
//                         <Layout>
//                             <AdminProfile />
//                         </Layout>
//                     </ProtectedRoute>
//                 }
//             />
//             <Route
//                 path="/account/settings"
//                 element={
//                     <ProtectedRoute permission="CAN_MANAGE_ACCOUNT">
//                         <Layout>
//                             <AccountSettings />
//                         </Layout>
//                     </ProtectedRoute>
//                 }
//             />

//             {/* Catch-all route for 404 */}
//             <Route path="*" element={<NoMatch />} />
//         </Routes>
//     );
// };

// export default App;












import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Activate from "./components/auth/Activate";
import ResetPassword from "./components/auth/ResetPassword";
import ResetPasswordConfirm from "./components/auth/ResetPasswordConfirm";
import DashboardOverview from "./Pages/DashBoard/DashboardOverview";
import UserActivityLog from "./Pages/UserManagement/UserActivityLog";
import PlanAssignment from "./Pages/UserManagement/PlanAssignment";
import PaymentHistory from "./Pages/UserManagement/PaymentHistory";
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
                {/* Redirect root to login */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/activate/:uid/:token" element={<Activate />} />
                <Route path="/forgot-password" element={<ResetPassword />} />
                <Route path="/password/reset/confirm/:uid/:token" element={<ResetPasswordConfirm />} />

                {/* Protected Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <DashboardOverview />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* User Management Routes */}
                <Route
                    path="/user-management/user-activity-log"
                    element={
                        <ProtectedRoute permission="CAN_MANAGE_USERS">
                            <Layout>
                                <UserActivityLog />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/user-management/plan-assignment"
                    element={
                        <ProtectedRoute permission="CAN_MANAGE_USERS">
                            <Layout>
                                <PlanAssignment />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/user-management/billing-payment-history"
                    element={
                        <ProtectedRoute permission="CAN_MANAGE_USERS">
                            <Layout>
                                <PaymentHistory />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/user-management/user-profile"
                    element={
                        <ProtectedRoute permission="CAN_MANAGE_USERS">
                            <Layout>
                                <UserProfile />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* Internet Plans Routes */}
                <Route
                    path="/internet-plans/create-plans"
                    element={
                        <ProtectedRoute permission="CAN_MANAGE_PLANS">
                            <Layout>
                                <CreatePlans />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/internet-plans/plan-analytics"
                    element={
                        <ProtectedRoute permission="CAN_VIEW_ANALYTICS">
                            <Layout>
                                <PlanAnalytics />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* Network Management Routes */}
                <Route
                    path="/network-management/bandwidth-allocation"
                    element={
                        <ProtectedRoute permission="CAN_MANAGE_NETWORK">
                            <Layout>
                                <BandwidthAllocation />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/network-management/ip-address-management"
                    element={
                        <ProtectedRoute permission="CAN_MANAGE_NETWORK">
                            <Layout>
                                <IPAddressManagement />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/network-management/network-diagnostics"
                    element={
                        <ProtectedRoute permission="CAN_MANAGE_NETWORK">
                            <Layout>
                                <NetworkDiagnostics />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/network-management/security-settings"
                    element={
                        <ProtectedRoute permission="CAN_MANAGE_NETWORK">
                            <Layout>
                                <SecuritySettings />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/network-management/router-management"
                    element={
                        <ProtectedRoute permission="CAN_MANAGE_NETWORK">
                            <Layout>
                                <RouterManagement />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* Payment Processing Routes */}
                <Route
                    path="/payment-processing/mpesa-transaction-log"
                    element={
                        <ProtectedRoute permission="CAN_CONFIGURE_Mpesa">
                            <Layout>
                                <MpesaTransactionLog />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/payment-processing/mpesa-configuration"
                    element={
                        <ProtectedRoute permission="CAN_CONFIGURE_Mpesa">
                            <Layout>
                                <MpesaConfiguration />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/payment-processing/mpesa-callback-settings"
                    element={
                        <ProtectedRoute permission="CAN_CONFIGURE_Mpesa">
                            <Layout>
                                <MpesaCallbackSettings />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/payment-processing/payment-reconciliation"
                    element={
                        <ProtectedRoute permission="CAN_CONFIGURE_Mpesa">
                            <Layout>
                                <PaymentReconciliation />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* Reporting & Analytics Routes */}
                <Route
                    path="/reporting-analytics/usage-reports"
                    element={
                        <ProtectedRoute permission="CAN_VIEW_ANALYTICS">
                            <Layout>
                                <UsageReports />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/reporting-analytics/financial-reports"
                    element={
                        <ProtectedRoute permission="CAN_VIEW_ANALYTICS">
                            <Layout>
                                <FinancialReports />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* Support & Maintenance Routes */}
                <Route
                    path="/support-maintenance/user-support-tickets"
                    element={
                        <ProtectedRoute permission="CAN_MANAGE_SUPPORT">
                            <Layout>
                                <UserSupportTickets />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/support-maintenance/knowledge-base"
                    element={
                        <ProtectedRoute permission="CAN_VIEW_KNOWLEDGE_BASE">
                            <Layout>
                                <KnowledgeBase />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* Account and Admin Profile Routes */}
                <Route
                    path="/account/admin-profile"
                    element={
                        <ProtectedRoute permission="CAN_VIEW_PROFILE">
                            <Layout>
                                <AdminProfile />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/account/settings"
                    element={
                        <ProtectedRoute permission="CAN_MANAGE_ACCOUNT">
                            <Layout>
                                <AccountSettings />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* Catch-all route for 404 */}
                <Route path="*" element={<NoMatch />} />
            </Routes>
        </AuthProvider>
    );
};

export default App;