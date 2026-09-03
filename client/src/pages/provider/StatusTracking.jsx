import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { providerAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Card3D from '../../components/3d/Card3D';
import ShieldBadge3D from '../../components/3d/ShieldBadge3D';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  RefreshCw,
  FileEdit,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  Calendar,
} from 'lucide-react';

export default function StatusTracking() {
  const navigate = useNavigate();
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchStatus = async () => {
    try {
      setRefreshing(true);
      const res = await providerAPI.getStatus();
      if (res.data.success) {
        setStatusData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching status:', err);
      setError('Unable to load application status.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Fetching application status timeline..." />;
  }

  const status = statusData?.status || 'Draft';
  const remarks = statusData?.rejectionRemarks;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in relative">
      {/* Ambient background light orbs */}
      <div className="absolute top-10 left-1/4 w-80 h-80 bg-brand-400/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl pointer-events-none -z-10 animate-float" />

      {/* Header Bar with 3D Shield Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xs">
        <div className="flex items-center gap-5">
          <ShieldBadge3D status={status} size={85} />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Application Review Status
              </h1>
              <StatusBadge status={status} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Real-time milestone tracking of your credentials, KYC checks, and onboarding verification
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchStatus}
          disabled={refreshing}
          className="self-start sm:self-center px-4 py-2 rounded-xl glass-card hover:bg-white text-slate-700 text-xs font-bold flex items-center gap-1.5 transition border border-slate-200"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Decision Alerts */}
      {status === 'Rejected' && (
        <Card3D className="p-6 rounded-3xl bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 shadow-xs space-y-3">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-rose-500 text-white shrink-0 mt-0.5 shadow-sm">
              <XCircle size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-950">
                Application Requires Revisions
              </h3>
              <p className="text-sm text-rose-800/90 mt-1">
                Our verification team reviewed your application and noted the following remarks:
              </p>
              <div className="mt-3 p-3.5 rounded-xl bg-white/90 border border-rose-200 text-xs text-rose-950 font-medium">
                "{remarks || 'Please upload a clearer copy of your ID proof and verify experience details.'}"
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-rose-200/60 flex justify-end">
            <Link
              to="/provider/onboarding"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition"
            >
              <FileEdit size={16} />
              <span>Modify & Resubmit Application</span>
            </Link>
          </div>
        </Card3D>
      )}

      {status === 'Approved' && (
        <Card3D className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 shadow-xs space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-emerald-600 text-white shrink-0 shadow-md shadow-emerald-600/20">
              <Award size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-emerald-950">
                  Congratulations! You are a Certified Partner
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                  Active
                </span>
              </div>
              <p className="text-xs text-emerald-800/90 mt-1">
                Your credentials and identity documents have been authenticated by the Trizen compliance team. Your profile is now live in the customer search directory.
              </p>
              <div className="mt-4 flex flex-wrap gap-5 text-xs text-emerald-950">
                <span className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  ID & Background Verified
                </span>
                <span className="flex items-center gap-1.5 font-bold">
                  <Calendar size={16} className="text-emerald-600" />
                  Approved on:{' '}
                  {statusData?.reviewedAt
                    ? new Date(statusData.reviewedAt).toLocaleDateString()
                    : 'Recently'}
                </span>
              </div>
            </div>
          </div>
        </Card3D>
      )}

      {/* Stepper Timeline Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xs space-y-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h2 className="text-lg font-black text-slate-900">Verification Stages</h2>
          <span className="text-xs font-bold text-slate-400">Step Progression</span>
        </div>

        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {/* Milestone 1: Registration */}
          <div className="relative">
            <div className="absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-xs">
              <CheckCircle2 size={14} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Account Registered</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Initial provider credentials created and validated on portal.
              </p>
            </div>
          </div>

          {/* Milestone 2: Profile & Documents */}
          <div className="relative">
            <div
              className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-xs ${
                statusData?.completionPercentage >= 80
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {statusData?.completionPercentage >= 80 ? (
                <CheckCircle2 size={14} />
              ) : (
                <Clock size={14} />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Profile & Verification Documents ({statusData?.completionPercentage || 0}%)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Personal, trade skills, service areas, and verification documents completed.
              </p>
            </div>
          </div>

          {/* Milestone 3: Submission */}
          <div className="relative">
            <div
              className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-xs ${
                status !== 'Draft'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {status !== 'Draft' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Application Submitted for Review
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {statusData?.submittedAt
                  ? `Submitted on ${new Date(statusData.submittedAt).toLocaleString()}`
                  : 'Pending final review and dispatch by provider.'}
              </p>
            </div>
          </div>

          {/* Milestone 4: Admin Background Verification */}
          <div className="relative">
            <div
              className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-xs ${
                status === 'Approved'
                  ? 'bg-emerald-500 text-white'
                  : status === 'Rejected'
                  ? 'bg-rose-500 text-white'
                  : status === 'Submitted' || status === 'Under Review'
                  ? 'bg-amber-500 text-white animate-pulse'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {status === 'Approved' ? (
                <CheckCircle2 size={14} />
              ) : status === 'Rejected' ? (
                <XCircle size={14} />
              ) : (
                <Clock size={14} />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Compliance & KYC Review</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Verification officers inspect identity credentials, certificates, and operational jurisdiction.
              </p>
            </div>
          </div>

          {/* Milestone 5: Final Decision */}
          <div className="relative">
            <div
              className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-xs ${
                status === 'Approved'
                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                  : status === 'Rejected'
                  ? 'bg-rose-600 text-white ring-4 ring-rose-100'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {status === 'Approved' ? (
                <Award size={14} />
              ) : status === 'Rejected' ? (
                <XCircle size={14} />
              ) : (
                <Sparkles size={14} />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Final Verification Decision</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {status === 'Approved'
                  ? 'Application Approved - Partner active in customer search listings.'
                  : status === 'Rejected'
                  ? `Application Rejected - Reason: ${remarks || 'Review required'}`
                  : 'Awaiting review decision by Trizen team.'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick link to application form */}
        <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
          <Link
            to="/provider/dashboard"
            className="text-slate-500 hover:text-slate-800 font-semibold"
          >
            ← Back to Dashboard
          </Link>
          <Link
            to="/provider/onboarding"
            className="font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View Full Onboarding Form</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
