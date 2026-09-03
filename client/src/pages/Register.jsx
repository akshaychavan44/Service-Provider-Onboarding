import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProgressOrb3D from '../components/3d/ProgressOrb3D';
import {
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
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

    // Front-end sanity checks
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await register(formData);
      addToast(res.message || 'Account registered successfully!', 'success');
      navigate('/provider/onboarding');
    } catch (err) {
      console.error('Registration error:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please review your details.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-50">
      {/* Ambient background light orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-brand-400/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-purple-400/15 rounded-full blur-3xl pointer-events-none -z-10 animate-float" />

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 glass-panel rounded-3xl border border-white/80 shadow-2xl overflow-hidden animate-fade-in">
        {/* Left Side: 3D Visual & Partner Benefits */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-8 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center font-black text-sm shadow-glow-brand">
                T
              </div>
              <span className="text-base font-black tracking-tight text-white">Trizen Onboarding</span>
            </div>

            <div className="pt-4">
              <h2 className="text-2xl font-black tracking-tight leading-snug">
                Join India's Top Verified Service Network
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Unlock instant digital onboarding, transparent weekly settlements, and verified dispatch bookings.
              </p>
            </div>
          </div>

          <div className="py-6 flex flex-col items-center justify-center relative z-10">
            <ProgressOrb3D percentage={25} size={150} status="Draft" />
            <span className="text-[11px] font-bold text-slate-300 mt-2 tracking-wide flex items-center gap-1.5">
              <Sparkles size={13} className="text-brand-400" />
              Step 1 of 6: Instant Account Setup
            </span>
          </div>

          <div className="space-y-2 border-t border-white/10 pt-4 relative z-10 text-[11px] text-slate-400">
            <p className="flex items-center gap-2 font-medium">
              <ShieldCheck size={14} className="text-emerald-400" />
              Direct Customer Routing
            </p>
            <p className="flex items-center gap-2 font-medium">
              <CheckCircle2 size={14} className="text-brand-400" />
              Zero Joining Fee for Early Partners
            </p>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 bg-white/90 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Create Provider Account
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Fill in your initial credentials to unlock the 6-step onboarding wizard
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name / Business Name *
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Email & Phone grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address *
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
                      placeholder="ramesh@example.com"
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Password *
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
                      placeholder="Min. 6 chars"
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat password"
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-700 hover:from-brand-500 hover:to-indigo-600 text-white font-bold text-xs shadow-glow-brand transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Proceed to Onboarding Form</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have a registered account?{' '}
            <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
