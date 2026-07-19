import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ToastProvider } from './components/ui/Toast';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import HomePage from './pages/HomePage';
import YoloEmailForm from './pages/YoloEmailForm';
import DetailedEmailForm from './pages/DetailedEmailForm';
import EmailResult from './pages/EmailResult';
import EmailPreviewPage from './pages/EmailPreviewPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminEmailHistoryPage from './pages/admin/AdminEmailHistoryPage';
import AdminRequestLogsPage from './pages/admin/AdminRequestLogsPage';
import AdminStatsPage from './pages/admin/AdminStatsPage';
import PricingPage from './pages/PricingPage';
import { AdminProtectedRoute } from './components/admin/AdminProtectedRoute';

function RedirectHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const redirectPath = sessionStorage.getItem('redirect');
    if (redirectPath) {
      sessionStorage.removeItem('redirect');
      navigate(redirectPath, { replace: true });
    }
  }, [navigate]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <RedirectHandler />
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider />
          <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Landing Page */}
          <Route path="/features" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />

          {/* Email Preview Page */}
          <Route path="/preview" element={<EmailPreviewPage />} />

          {/* Root: redirect based on auth status */}
          <Route path="/" element={<Navigate to="/features" replace />} />

          {/* Protected Routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/send/yolo"
            element={
              <ProtectedRoute>
                <YoloEmailForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/send/detailed"
            element={
              <ProtectedRoute>
                <DetailedEmailForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/result"
            element={
              <ProtectedRoute>
                <EmailResult />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="email-history" element={<AdminEmailHistoryPage />} />
            <Route path="requests" element={<AdminRequestLogsPage />} />
            <Route path="stats" element={<AdminStatsPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/features" replace />} />
        </Routes>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
