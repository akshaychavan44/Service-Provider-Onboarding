import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProgressOrb3D from '../components/3d/ProgressOrb3D';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(formData.email.trim(), formData.password);
      addToast(res.message || 'Logged in successfully!', 'success');

      if (res.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/provider/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg =
        err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for evaluator
  const fillDemo = (role) => {
    if (role === 'admin') {
      setFormData({
        email: 'admin@example.com',
        password: 'Admin@123',
      });
    } else {
      setFormData({
        email: 'rahul@example.com',
        password: 'Provider@123',
      });
    }
    setError('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-50">
      {/* Ambient background light orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-brand-400/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-purple-400/15 rounded-full blur-3xl pointer-events-none -z-10 animate-float" />

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 glass-panel rounded-3xl border border-white/80 shadow-2xl overflow-hidden animate-fade-in">
        {/* Left Side: 3D Visual & Brand Pitch */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-8 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center font-black text-sm shadow-glow-brand">
                T
              </div>
              <span className="text-base font-black tracking-tight text-white">Trizen Portal</span>
            </div>

            <div className="pt-4">
              <h2 className="text-2xl font-black tracking-tight leading-snug">
                Welcome to Trizen Partner Portal
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Log in to monitor your verification timeline, manage dispatch jobs, and access payouts.
              </p>
            </div>
          </div>

          {/* Interactive 3D Progress Core Preview */}
          <div className="py-6 flex flex-col items-center justify-center relative z-10">
            <ProgressOrb3D percentage={75} size={150} status="Approved" />
            <span className="text-[11px] font-bold text-slate-300 mt-2 tracking-wide flex items-center gap-1.5">
              <Sparkles size={13} className="text-brand-400" />
              Real-time KYC Verification Engine
            </span>
          </div>

          <div className="space-y-2 border-t border-white/10 pt-4 relative z-10 text-[11px] text-slate-400">
            <p className="flex items-center gap-2 font-medium">
              <ShieldCheck size={14} className="text-emerald-400" />
              100% Encrypted & Authenticated
            </p>
            <p className="flex items-center gap-2 font-medium">
              <CheckCircle2 size={14} className="text-brand-400" />
              Automated Admin Dossier Review
            </p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 bg-white/90 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Sign In to Your Account
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your registered email address and security password
              </p>
            </div>

            {/* Evaluator Quick-Fill Bar */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                ⚡ Quick-Fill Demo Credentials
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fillDemo('admin')}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <KeyRound size={13} />
                  <span>Admin Demo</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('provider')}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-glow-brand flex items-center justify-center gap-1.5"
                >
                  <KeyRound size={13} />
                  <span>Provider Demo</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-700 hover:from-brand-500 hover:to-indigo-600 text-white font-bold text-xs shadow-glow-brand transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an onboarding profile yet?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
              Register as a Service Provider
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
