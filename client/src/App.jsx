import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Provider Pages
import ProviderDashboard from './pages/provider/Dashboard';
import OnboardingWizard from './pages/provider/OnboardingWizard';
import StatusTracking from './pages/provider/StatusTracking';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ProviderList from './pages/admin/ProviderList';
import ProviderDetail from './pages/admin/ProviderDetail';

// 404 Component
function NotFound() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-16 px-4 text-center">
      <div className="max-w-md space-y-4">
        <span className="text-6xl font-black text-brand-600 block">404</span>
        <h1 className="text-2xl font-black text-slate-900">Page Not Found</h1>
        <p className="text-sm text-slate-600">
          The requested page does not exist or you may not have authorization to view it.
        </p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-xs hover:bg-brand-700 transition"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

// Global Footer Component
function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 Trizen Technologies Inc. All rights reserved.</p>
        <div className="flex items-center gap-4 text-slate-400 font-medium">
          <span>Privacy Policy</span>
          <span>•</span>
          <span>Terms of Service</span>
          <span>•</span>
          <span>Partner KYC Guidelines</span>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Provider Protected Routes */}
                <Route
                  path="/provider/dashboard"
                  element={
                    <ProtectedRoute allowedRole="provider">
                      <ProviderDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/provider/onboarding"
                  element={
                    <ProtectedRoute allowedRole="provider">
                      <OnboardingWizard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/provider/status"
                  element={
                    <ProtectedRoute allowedRole="provider">
                      <StatusTracking />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/providers"
                  element={
                    <ProtectedRoute allowedRole="admin">
                      <ProviderList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/providers/:id"
                  element={
                    <ProtectedRoute allowedRole="admin">
                      <ProviderDetail />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
