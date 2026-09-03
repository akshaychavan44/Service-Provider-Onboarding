import React from 'react';
import { Link } from 'react-router-dom';
import Hero3DCanvas from '../components/3d/Hero3DCanvas';
import Card3D from '../components/3d/Card3D';
import {
  ShieldCheck,
  Zap,
  Award,
  Users,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Clock,
  ChevronRight,
  Shield,
  Layers,
  BarChart3,
} from 'lucide-react';

export default function Landing() {
  const steps = [
    {
      step: '01',
      title: 'Digital Registration',
      desc: 'Create your partner account with your mobile & email in under 60 seconds.',
    },
    {
      step: '02',
      title: 'Profile & Trade Skills',
      desc: 'Showcase your service specialties, operational radius, and professional experience.',
    },
    {
      step: '03',
      title: 'KYC Document Verification',
      desc: 'Upload government-issued IDs, address proof, and certifications securely.',
    },
    {
      step: '04',
      title: 'Dispatch & Earn',
      desc: 'Receive customer bookings, execute high-value jobs, and unlock weekly payouts.',
    },
  ];

  const features = [
    {
      icon: ShieldCheck,
      title: 'Military-Grade KYC Verification',
      desc: 'Multi-layer document inspection, automated fraud checks, and verified credentials.',
      tag: 'Security First',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      icon: Zap,
      title: 'Instant Dispatch Engine',
      desc: 'Geo-fenced customer routing brings high-ticket inquiries directly to your coverage area.',
      tag: 'Zero Latency',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      icon: TrendingUp,
      title: 'Guaranteed Weekly Payouts',
      desc: 'Direct bank transfers with transparent commission rates and zero hidden charges.',
      tag: 'Financial Growth',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      icon: BarChart3,
      title: 'Partner Analytics Suite',
      desc: 'Live KPI tracking, customer reviews, booking retention, and performance diagnostics.',
      tag: 'Smart Insights',
      color: 'text-sky-600 bg-sky-50 border-sky-200',
    },
  ];

  return (
    <div className="relative overflow-hidden bg-slate-50 min-h-screen">
      {/* Ambient background light orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-400/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl pointer-events-none -z-10 animate-float" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-sky-400/15 rounded-full blur-3xl pointer-events-none -z-10 animate-float-reverse" />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-8 animate-fade-in">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-brand-200/80 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600"></span>
              </span>
              <span className="text-xs font-bold text-brand-900 tracking-wide">
                Trizen Partner Network 2026
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-500">
                Join 15,000+ Certified Professionals
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Empowering India's Best{' '}
                <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Service Experts
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
                Streamline your onboarding, verify credentials with our instant KYC system, and connect with thousands of local homeowners and commercial enterprises.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/register"
                className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-700 hover:from-brand-500 hover:to-indigo-600 text-white font-black text-sm shadow-glow-brand transition-all hover:scale-[1.02] flex items-center gap-2 group"
              >
                <span>Register as a Service Provider</span>
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                to="/login"
                className="px-6 py-3.5 rounded-2xl glass-panel hover:bg-white/90 text-slate-700 font-bold text-sm border border-slate-200/80 shadow-xs transition hover:text-slate-900"
              >
                Sign In to Portal
              </Link>
            </div>

            {/* Micro Stats Counter */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200/60 max-w-lg">
              <div>
                <span className="text-2xl sm:text-3xl font-black text-slate-900">₹45k+</span>
                <span className="block text-xs font-semibold text-slate-500 mt-0.5">
                  Avg. Monthly Earnings
                </span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-slate-900">4.9/5</span>
                <span className="block text-xs font-semibold text-slate-500 mt-0.5">
                  Partner Satisfaction
                </span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-slate-900">24 Hrs</span>
                <span className="block text-xs font-semibold text-slate-500 mt-0.5">
                  Verification Turnaround
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 3D Hologram Scene */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* 3D Canvas Background Orb */}
            <div className="w-full h-[420px] sm:h-[480px] relative flex items-center justify-center">
              <Hero3DCanvas />

              {/* Floating 3D Depth Card 1: Verified Partner */}
              <div className="absolute -top-4 -left-4 sm:left-2 p-3.5 rounded-2xl glass-panel shadow-glass-3d border border-white/80 animate-float flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900">Instant KYC Verified</p>
                  <p className="text-[10px] text-slate-500 font-medium">Auto Fraud Validation</p>
                </div>
              </div>

              {/* Floating 3D Depth Card 2: Dispatch Active */}
              <div className="absolute -bottom-4 right-0 sm:right-4 p-3.5 rounded-2xl glass-panel shadow-glass-3d border border-white/80 animate-float-reverse flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-xs">
                  <Zap size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900">Smart Lead Routing</p>
                  <p className="text-[10px] text-emerald-600 font-bold">12 High-Value Jobs Nearby</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive 3D Features Grid */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Engineered For Excellence
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Why Professionals Partner With Trizen
          </h2>
          <p className="text-sm text-slate-600">
            A comprehensive infrastructure built to streamline operations, eliminate paperwork, and amplify your service revenue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card3D
                key={idx}
                className="p-6 rounded-3xl glass-card hover:border-brand-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${item.color} shadow-xs`}
                    >
                      <Icon size={24} />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                      {item.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-6 border-t border-slate-100 flex items-center text-xs font-bold text-brand-600 group cursor-pointer">
                  <span>Learn workflow</span>
                  <ChevronRight
                    size={14}
                    className="transition-transform group-hover:translate-x-1 ml-0.5"
                  />
                </div>
              </Card3D>
            );
          })}
        </div>
      </section>

      {/* 4-Step Interactive Roadmap */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white shadow-2xl relative overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl mb-12 space-y-2">
            <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">
              Simple 4-Step Journey
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight">
              From Registration to First Dispatch
            </h2>
            <p className="text-xs text-slate-400">
              Our intuitive 6-step digital wizard ensures seamless KYC submission without paper bureaucracy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((st, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3 hover:bg-white/10 transition"
              >
                <span className="text-2xl font-black text-brand-400">{st.step}</span>
                <h4 className="text-sm font-bold text-white">{st.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">{st.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="text-brand-400" />
              <span className="text-xs text-slate-300 font-medium">
                Ready to accelerate your service contracting business?
              </span>
            </div>
            <Link
              to="/register"
              className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-xs font-bold transition shadow-glow-brand"
            >
              Start Free Onboarding Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
