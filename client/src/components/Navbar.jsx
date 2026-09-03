import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  LogOut,
  User,
  Shield,
  Menu,
  X,
  FileCheck2,
  LayoutDashboard,
  Users,
  ChevronRight,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isProvider, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/60 bg-white/75 backdrop-blur-2xl shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-glow-brand group-hover:scale-105 transition transform">
                <Layers className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-brand-950 to-brand-800 bg-clip-text text-transparent">
                  Trizen
                </span>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase -mt-1">
                  Partner Portal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {isAuthenticated && isProvider && (
                <>
                  <Link
                    to="/provider/dashboard"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/provider/dashboard')
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/provider/onboarding"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/provider/onboarding')
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Onboarding Form
                  </Link>
                  <Link
                    to="/provider/status"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/provider/status')
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Application Status
                  </Link>
                </>
              )}

              {isAuthenticated && isAdmin && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/admin/dashboard')
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Admin Overview
                  </Link>
                  <Link
                    to="/admin/providers"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/admin/providers')
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Provider Management
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* User & Role Badge */}
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/80 text-sm">
                  <div className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-700 font-bold text-xs border border-slate-200">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      {user?.name}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-brand-600 tracking-wider">
                      {isAdmin ? 'Admin' : 'Service Provider'}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Logout"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-700 hover:from-brand-500 hover:to-indigo-600 rounded-xl shadow-glow-brand transition transform active:scale-95"
                >
                  Register as Provider
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2 animate-fade-in">
          {isAuthenticated && (
            <div className="p-3 mb-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{user?.name}</p>
                <p className="text-xs text-brand-600 font-semibold uppercase">
                  {isAdmin ? 'Admin' : 'Provider'}
                </p>
              </div>
            </div>
          )}

          {isAuthenticated && isProvider && (
            <>
              <Link
                to="/provider/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Dashboard
              </Link>
              <Link
                to="/provider/onboarding"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Onboarding Form
              </Link>
              <Link
                to="/provider/status"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Application Status
              </Link>
            </>
          )}

          {isAuthenticated && isAdmin && (
            <>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Admin Overview
              </Link>
              <Link
                to="/admin/providers"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Provider Management
              </Link>
            </>
          )}

          <div className="pt-4 border-t border-slate-100">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-rose-600 bg-rose-50 font-semibold text-sm"
              >
                <LogOut size={16} /> Logout
              </button>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold text-sm"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center px-4 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm shadow"
                >
                  Register as Provider
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
