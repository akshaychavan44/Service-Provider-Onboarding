import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { providerAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import ProgressBar from '../../components/ProgressBar';
import LoadingSpinner from '../../components/LoadingSpinner';
import Card3D from '../../components/3d/Card3D';
import ProgressOrb3D from '../../components/3d/ProgressOrb3D';
import ShieldBadge3D from '../../components/3d/ShieldBadge3D';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  ShieldCheck,
  User,
  Wrench,
  FileCheck2,
  MapPin,
  TrendingUp,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function ProviderDashboard() {
  const { user, profile: authProfile } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, docsRes] = await Promise.all([
        providerAPI.getProfile(),
        providerAPI.getDocuments(),
      ]);

      if (profileRes.data.success) {
        setProfileData(profileRes.data.data.profile);
      }
      if (docsRes.data.success) {
        setDocuments(docsRes.data.data.documents || []);
      }
    } catch (err) {
      console.error('Error loading provider dashboard data:', err);
      setError('Unable to load onboarding dashboard details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Synchronizing your partner dashboard..." />;
  }

  const profile = profileData || authProfile || {};
  const status = profile.applicationStatus || 'Draft';
  const percentage = profile.completionPercentage || 0;
  const remarks = profile.rejectionRemarks;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in relative">
      {/* Ambient background light orbs */}
      <div className="absolute top-10 left-1/3 w-80 h-80 bg-brand-400/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl pointer-events-none -z-10 animate-float" />

      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Welcome back, {user?.name || 'Partner'}!
            </h1>
            <StatusBadge status={status} />
          </div>
          <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-2">
            <span>Registered as Verified Service Provider</span>
            <span>•</span>
            <span className="font-mono text-slate-400">ID: {user?.id?.slice(-6) || 'TRZ-01'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/provider/status"
            className="px-4 py-2.5 rounded-2xl glass-card hover:bg-white text-slate-700 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200"
          >
            <Clock size={15} className="text-brand-600" />
            <span>Timeline</span>
          </Link>

          <Link
            to="/provider/onboarding"
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-700 hover:from-brand-500 hover:to-indigo-600 text-white text-xs font-bold shadow-glow-brand transition flex items-center gap-2"
          >
            <span>{status === 'Draft' ? 'Continue Form' : 'View Onboarding'}</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* Status Alert Banners */}
      {status === 'Approved' && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-4">
            <ShieldBadge3D status="Approved" size={90} />
            <div>
              <h3 className="text-base font-black text-emerald-950">
                Congratulations! You are a Certified Trizen Partner
              </h3>
              <p className="text-xs text-emerald-800/90 mt-0.5">
                Your KYC credentials and background check have been verified. Your profile is now visible in the live customer directory.
              </p>
            </div>
          </div>
          <Link
            to="/provider/status"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 transition"
          >
            View Certificate
          </Link>
        </div>
      )}

      {status === 'Rejected' && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 flex flex-col sm:flex-row items-start justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-rose-500 text-white shrink-0 mt-0.5 shadow-sm">
              <XCircle size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-950">
                Application Requires Edits Before Approval
              </h3>
              <p className="text-xs text-rose-800/90 mt-1">
                Our verification team reviewed your application and left the following remarks:
              </p>
              <div className="mt-2.5 p-3 rounded-xl bg-white/80 border border-rose-200 text-xs font-medium text-rose-900">
                "{remarks || 'Please re-upload a clearer copy of your Government ID proof.'}"
              </div>
            </div>
          </div>
          <Link
            to="/provider/onboarding"
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 transition shadow-xs"
          >
            Modify & Resubmit
          </Link>
        </div>
      )}

      {/* Main Completeness & 3D Interactive Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 3D Holographic Completion Pod */}
        <div className="lg:col-span-8 glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
                Application Health
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-2">
                Dossier Completeness Score
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete all 6 onboarding sections to expedite review approval.
              </p>
            </div>

            {/* 3D Progress Orb Module */}
            <div className="flex items-center gap-3">
              <ProgressOrb3D percentage={percentage} status={status} size={110} />
              <div className="text-right">
                <span className="text-3xl font-black text-slate-900">{percentage}%</span>
                <span className="block text-[11px] font-semibold text-slate-400">
                  {percentage >= 80 ? 'Ready to Submit' : 'Form Incomplete'}
                </span>
              </div>
            </div>
          </div>

          <div className="py-6 space-y-3">
            <ProgressBar percentage={percentage} height="h-3" />
            <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
              <span>Personal Info</span>
              <span>Professional</span>
              <span>Services</span>
              <span>Location</span>
              <span>KYC Documents</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 font-medium">
              {status === 'Draft'
                ? 'Your form draft is auto-saved. You can finish at any time.'
                : 'Application is currently locked under administrative evaluation.'}
            </span>
            <Link
              to="/provider/onboarding"
              className="font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 self-end sm:self-auto"
            >
              <span>{status === 'Draft' ? 'Continue Wizard' : 'Review Form Data'}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Right 3D Verification Snapshot */}
        <div className="lg:col-span-4 glass-card p-6 sm:p-8 rounded-3xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Verification Stage
              </span>
              <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                <ShieldCheck size={18} />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900">{status}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {status === 'Approved'
                  ? 'Active and listed in customer search.'
                  : status === 'Submitted'
                  ? 'Verification officers reviewing documents.'
                  : status === 'Rejected'
                  ? 'Awaiting revisions from provider.'
                  : 'Form draft awaiting submission.'}
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400">KYC Documents:</span>
              <span className="font-bold text-slate-800">{documents.length} Uploaded</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Coverage Radius:</span>
              <span className="font-bold text-slate-800">
                {profile.serviceRadius ? `${profile.serviceRadius} km` : 'Not configured'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Primary Trade:</span>
              <span className="font-bold text-slate-800">
                {profile.serviceCategories?.[0] || 'Not specified'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Interactive Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card3D className="p-6 rounded-3xl glass-card hover:border-brand-300 transition flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shadow-xs">
              <User size={20} />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Personal & Bio</h4>
            <p className="text-xs text-slate-500 font-normal">
              Keep your contact information, phone, and professional summary up to date.
            </p>
          </div>
          <Link
            to="/provider/onboarding"
            className="pt-4 mt-4 border-t border-slate-100 text-xs font-bold text-brand-600 flex items-center gap-1 hover:underline"
          >
            <span>Edit Profile</span>
            <ArrowRight size={13} />
          </Link>
        </Card3D>

        <Card3D className="p-6 rounded-3xl glass-card hover:border-brand-300 transition flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-xs">
              <Wrench size={20} />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Services & Skills</h4>
            <p className="text-xs text-slate-500 font-normal">
              Select trade categories (Electrician, Plumber, AC Repair) and tool proficiencies.
            </p>
          </div>
          <Link
            to="/provider/onboarding"
            className="pt-4 mt-4 border-t border-slate-100 text-xs font-bold text-brand-600 flex items-center gap-1 hover:underline"
          >
            <span>Manage Skills</span>
            <ArrowRight size={13} />
          </Link>
        </Card3D>

        <Card3D className="p-6 rounded-3xl glass-card hover:border-brand-300 transition flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-xs">
              <FileCheck2 size={20} />
            </div>
            <h4 className="text-sm font-bold text-slate-900">KYC Documents</h4>
            <p className="text-xs text-slate-500 font-normal">
              Upload National ID, Address Proof, and Trade Certifications (PDF/JPG).
            </p>
          </div>
          <Link
            to="/provider/onboarding"
            className="pt-4 mt-4 border-t border-slate-100 text-xs font-bold text-brand-600 flex items-center gap-1 hover:underline"
          >
            <span>Upload Documents</span>
            <ArrowRight size={13} />
          </Link>
        </Card3D>

        <Card3D className="p-6 rounded-3xl glass-card hover:border-brand-300 transition flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shadow-xs">
              <MapPin size={20} />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Coverage Radius</h4>
            <p className="text-xs text-slate-500 font-normal">
              Adjust your operational dispatch perimeter to receive local job notifications.
            </p>
          </div>
          <Link
            to="/provider/onboarding"
            className="pt-4 mt-4 border-t border-slate-100 text-xs font-bold text-brand-600 flex items-center gap-1 hover:underline"
          >
            <span>Set Radius</span>
            <ArrowRight size={13} />
          </Link>
        </Card3D>
      </div>
    </div>
  );
}
