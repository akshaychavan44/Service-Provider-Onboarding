import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Card3D from '../../components/3d/Card3D';
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  FileEdit,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Search,
  ExternalLink,
  Activity,
  Layers,
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getDashboardStats();
      if (res.data.success) {
        setStats(res.data.data.stats);
        setRecentApplications(res.data.data.recentApplications || []);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError('Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading admin analytics & metrics..." />;
  }

  const total = stats?.totalProviders || 0;
  const pending = stats?.pendingApplications || 0;
  const approved = stats?.approvedProviders || 0;
  const rejected = stats?.rejectedApplications || 0;
  const drafts = stats?.draftApplications || 0;

  const calcPct = (count) => (total > 0 ? Math.round((count / total) * 100) : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in relative">
      {/* Ambient background light orbs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl pointer-events-none -z-10 animate-float" />

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-glow-brand">
              <ShieldCheck size={22} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Administrator Command Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-2">
            <span>Real-time verification pipeline, KYC compliance & dispatch approvals</span>
            <span>•</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              Live System Active
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/providers"
            className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-700 hover:from-brand-500 hover:to-indigo-600 rounded-2xl shadow-glow-brand transition flex items-center gap-2"
          >
            <Users size={16} />
            <span>Manage All Providers</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* 3D KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Total */}
        <Card3D className="glass-card p-5 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Providers
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">{total}</span>
            <span className="text-xs text-slate-400 block mt-0.5">Registered partners</span>
          </div>
        </Card3D>

        {/* Metric 2: Pending */}
        <Card3D className="p-5 rounded-3xl bg-amber-50/50 border border-amber-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
              Pending Review
            </span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shadow-xs">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-amber-900">{pending}</span>
            <span className="text-xs text-amber-700/80 block mt-0.5">Awaiting decision</span>
          </div>
        </Card3D>

        {/* Metric 3: Approved */}
        <Card3D className="p-5 rounded-3xl bg-emerald-50/50 border border-emerald-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              Approved
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shadow-xs">
              <CheckCircle size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-emerald-900">{approved}</span>
            <span className="text-xs text-emerald-700/80 block mt-0.5">Active partners</span>
          </div>
        </Card3D>

        {/* Metric 4: Rejected */}
        <Card3D className="p-5 rounded-3xl bg-rose-50/50 border border-rose-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
              Rejected
            </span>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shadow-xs">
              <XCircle size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-rose-900">{rejected}</span>
            <span className="text-xs text-rose-700/80 block mt-0.5">Needs revisions</span>
          </div>
        </Card3D>

        {/* Metric 5: Drafts */}
        <Card3D className="glass-card p-5 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              In Draft
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-500">
              <FileEdit size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-700">{drafts}</span>
            <span className="text-xs text-slate-400 block mt-0.5">Incomplete forms</span>
          </div>
        </Card3D>
      </div>

      {/* Distribution Status Bar */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-brand-600" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Application Pipeline Distribution
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-400">Total: {total} Providers</span>
        </div>

        {/* Multi-segment progress bar */}
        <div className="w-full h-4 bg-slate-100 rounded-full flex overflow-hidden p-0.5 shadow-inner">
          {pending > 0 && (
            <div
              style={{ width: `${calcPct(pending)}%` }}
              className="bg-amber-500 h-full rounded-l-full transition-all duration-500"
              title={`Pending: ${pending} (${calcPct(pending)}%)`}
            />
          )}
          {approved > 0 && (
            <div
              style={{ width: `${calcPct(approved)}%` }}
              className="bg-emerald-500 h-full transition-all duration-500"
              title={`Approved: ${approved} (${calcPct(approved)}%)`}
            />
          )}
          {rejected > 0 && (
            <div
              style={{ width: `${calcPct(rejected)}%` }}
              className="bg-rose-500 h-full transition-all duration-500"
              title={`Rejected: ${rejected} (${calcPct(rejected)}%)`}
            />
          )}
          {drafts > 0 && (
            <div
              style={{ width: `${calcPct(drafts)}%` }}
              className="bg-slate-300 h-full rounded-r-full transition-all duration-500"
              title={`Drafts: ${drafts} (${calcPct(drafts)}%)`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 pt-1 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Pending Review ({pending})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Approved ({approved})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Rejected ({rejected})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span>Draft ({drafts})</span>
          </div>
        </div>
      </div>

      {/* Recent Applications Section */}
      <div className="glass-panel rounded-3xl border border-white/80 shadow-xs overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Recent Provider Applications
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest partner profiles submitted or updated across the onboarding funnel
            </p>
          </div>
          <Link
            to="/admin/providers"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View All Applications</span>
            <ChevronRight size={15} />
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No provider applications found. Run the seeder or register a new provider to see data.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-4 px-6">Provider</th>
                  <th className="py-4 px-6">Primary Service</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Submitted / Updated</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentApplications.map((app) => (
                  <tr key={app._id} className="hover:bg-brand-50/30 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-brand-50 border border-brand-100 text-brand-700 flex items-center justify-center font-bold">
                          {app.userId?.name?.charAt(0).toUpperCase() || 'P'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{app.userId?.name || 'Unnamed'}</p>
                          <p className="text-[11px] text-slate-400">{app.userId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {app.serviceCategories?.length > 0 ? (
                        <span className="px-2.5 py-1 rounded-xl bg-slate-100 font-semibold text-slate-700">
                          {app.serviceCategories[0]}
                          {app.serviceCategories.length > 1 && ` +${app.serviceCategories.length - 1}`}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">None selected</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {app.city ? `${app.city}, ${app.state || ''}` : '-'}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={app.applicationStatus} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-medium">
                      {app.submittedAt
                        ? new Date(app.submittedAt).toLocaleDateString()
                        : new Date(app.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/admin/providers/${app._id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-glow-brand transition"
                      >
                        <span>Review</span>
                        <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
