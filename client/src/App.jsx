import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { useAuth } from './hooks/useAuth';
import { Toaster } from 'react-hot-toast';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import PublicLayout from './layouts/PublicLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import DocumentDetail from './pages/DocumentDetail';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Verifications from './pages/Verifications';
import AdminUsers from './pages/AdminUsers';
import AdminAudit from './pages/AdminAudit';
import AdminAnalytics from './pages/AdminAnalytics';
import Neobank from './pages/Neobank';
import NotFound from './pages/NotFound';
import BlockchainHealth from './pages/BlockchainHealth';
import IdentityVerification from './pages/IdentityVerification';
import PublicVerify from './pages/PublicVerify';

/**
 * ProtectedRoute — Redirects to /login if user is not authenticated, or /verify-identity if face 2FA pending.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, needsVerification, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F4]">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-[#2D6A4F] border-t-transparent" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (needsVerification) return <Navigate to="/verify-identity" replace />;
  return children;
};

/**
 * AuthGuard — Requires basic login authentication or pending verification session so /verify-identity can render.
 */
const AuthGuard = ({ children }) => {
  const { isAuthenticated, needsVerification, isLoading } = useAuth();
  const hasPendingAuth = typeof window !== 'undefined' && !!sessionStorage.getItem('pending_google_auth');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F4]">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-[#2D6A4F] border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated || hasPendingAuth || needsVerification) {
    return children;
  }

  return <Navigate to="/login" replace />;
};

/**
 * RoleRoute — Restricts access to specific roles. Redirects to /dashboard if unauthorized.
 */
const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return allowedRoles.includes(user.role) ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* 1. BEAUTIFUL LANDING PAGE (Application Start & Post-Logout Landing) */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/verify-hash" element={<PublicVerify />} />
            </Route>

            {/* Standalone Neobank Route (Protected) */}
            <Route path="/neobank" element={<ProtectedRoute><Neobank /></ProtectedRoute>} />

            {/* 2. AUTHENTICATION PAGES (Sign In & Create Account Forms) */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />
            </Route>

            {/* Identity Verification Page (Protected by AuthGuard) */}
            <Route path="/verify-identity" element={<AuthGuard><IdentityVerification /></AuthGuard>} />

            {/* 3. PROTECTED DASHBOARD ROUTES (Product Dashboard) */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/documents/:id" element={<DocumentDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/verifications" element={<Verifications />} />
              <Route path="/blockchain-health" element={<BlockchainHealth />} />

              <Route path="/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />

              {/* Admin-only routes */}
              <Route path="/admin/users" element={<RoleRoute allowedRoles={['admin']}><AdminUsers /></RoleRoute>} />
              <Route path="/admin/audit" element={<AdminAudit />} />
            </Route>

            {/* 404 Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          {/* Global Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#FFFFFF',
                color: '#2E2A26',
                border: '1px solid #E8E2DA',
                boxShadow: '0 4px 12px 0 rgba(46, 42, 38, 0.10)',
                borderRadius: '14px',
                fontSize: '13px',
                fontWeight: '500',
              },
              success: {
                iconTheme: { primary: '#2D6A4F', secondary: '#FFFFFF' },
              },
              error: {
                iconTheme: { primary: '#DC2626', secondary: '#FFFFFF' },
              },
            }}
          />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
