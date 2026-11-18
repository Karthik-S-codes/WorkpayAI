import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import AboutPage from './pages/public/AboutPage';
import FeaturesPage from './pages/public/FeaturesPage';
import HowItWorksPage from './pages/public/HowItWorksPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Customer Pages
import FindWorkersPage from './pages/customer/FindWorkersPage';
import WorkerDetailsPage from './pages/customer/WorkerDetailsPage';
import CompareWorkersPage from './pages/customer/CompareWorkersPage';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import PostJobPage from './pages/customer/PostJobPage';
import MyJobsPage from './pages/customer/MyJobsPage';
import HiringRequestsPage from './pages/customer/HiringRequestsPage';
import CustomerPaymentsPage from './pages/customer/CustomerPaymentsPage';
import CustomerTransactionsPage from './pages/customer/CustomerTransactionsPage';
import CustomerProfilePage from './pages/customer/CustomerProfilePage';

// Worker Pages
import FindJobsPage from './pages/worker/FindJobsPage';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import EditWorkerProfilePage from './pages/worker/EditWorkerProfilePage';
import WorkerApplicationsPage from './pages/worker/WorkerApplicationsPage';
import WorkerHiringRequestsPage from './pages/worker/WorkerHiringRequestsPage';
import MyWorkPage from './pages/worker/MyWorkPage';
import WorkerEarningsPage from './pages/worker/WorkerEarningsPage';
import WorkerWalletPage from './pages/worker/WorkerWalletPage';
import AIIncomeInsightsPage from './pages/worker/AIIncomeInsightsPage';
import WorkerReviewsPage from './pages/worker/WorkerReviewsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagementPage';
import WorkerVerificationPage from './pages/admin/WorkerVerificationPage';
import JobManagementPage from './pages/admin/JobManagementPage';
import CategoryManagementPage from './pages/admin/CategoryManagementPage';
import PayoutManagementPage from './pages/admin/PayoutManagementPage';
import DisputeManagementPage from './pages/admin/DisputeManagementPage';
import FraudAlertsPage from './pages/admin/FraudAlertsPage';

// Route Guard Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 text-sm">
        Authenticating session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to proper role dashboard
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'worker') return <Navigate to="/worker/dashboard" replace />;
    return <Navigate to="/customer/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Layout Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/find-workers" element={<FindWorkersPage />} />
              <Route path="/find-jobs" element={<FindJobsPage />} />
              <Route path="/workers/:id" element={<WorkerDetailsPage />} />
              <Route path="/compare-workers" element={<CompareWorkersPage />} />
            </Route>

            {/* Customer Dashboard Routes */}
            <Route
              path="/customer"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<CustomerDashboard />} />
              <Route path="post-job" element={<PostJobPage />} />
              <Route path="my-jobs" element={<MyJobsPage />} />
              <Route path="hiring-requests" element={<HiringRequestsPage />} />
              <Route path="payments" element={<CustomerPaymentsPage />} />
              <Route path="transactions" element={<CustomerTransactionsPage />} />
              <Route path="profile" element={<CustomerProfilePage />} />
            </Route>

            {/* Worker Dashboard Routes */}
            <Route
              path="/worker"
              element={
                <ProtectedRoute allowedRoles={['worker']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<WorkerDashboard />} />
              <Route path="edit-profile" element={<EditWorkerProfilePage />} />
              <Route path="profile" element={<WorkerDetailsPage />} />
              <Route path="applications" element={<WorkerApplicationsPage />} />
              <Route path="hiring-requests" element={<WorkerHiringRequestsPage />} />
              <Route path="my-work" element={<MyWorkPage />} />
              <Route path="earnings" element={<WorkerEarningsPage />} />
              <Route path="wallet" element={<WorkerWalletPage />} />
              <Route path="ai-income" element={<AIIncomeInsightsPage />} />
              <Route path="reviews" element={<WorkerReviewsPage />} />
            </Route>

            {/* Admin Dashboard Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="verifications" element={<WorkerVerificationPage />} />
              <Route path="jobs" element={<JobManagementPage />} />
              <Route path="categories" element={<CategoryManagementPage />} />
              <Route path="transactions" element={<CustomerTransactionsPage />} />
              <Route path="payouts" element={<PayoutManagementPage />} />
              <Route path="disputes" element={<DisputeManagementPage />} />
              <Route path="fraud-alerts" element={<FraudAlertsPage />} />
              <Route path="analytics" element={<AdminDashboard />} />
            </Route>

            {/* Fallback Catch-All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

