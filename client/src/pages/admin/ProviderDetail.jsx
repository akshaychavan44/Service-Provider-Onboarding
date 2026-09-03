import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import ProgressBar from '../../components/ProgressBar';
import LoadingSpinner from '../../components/LoadingSpinner';
import Card3D from '../../components/3d/Card3D';
import ShieldBadge3D from '../../components/3d/ShieldBadge3D';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  FileCheck2,
  ExternalLink,
  MapPin,
  Briefcase,
  User,
  Calendar,
  Phone,
  Mail,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Info,
  Sparkles,
} from 'lucide-react';

export default function ProviderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [providerData, setProviderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionRemarks, setRejectionRemarks] = useState('');

  const fetchProviderDetail = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getProviderById(id);
      if (res.data.success) {
        setProviderData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching provider detail:', err);
      addToast('Failed to load provider profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderDetail();
  }, [id]);

  // Handle Approve Action
  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const res = await adminAPI.approveProvider(id);
      if (res.data.success) {
        addToast('Provider application approved successfully!', 'success');
        setShowApproveModal(false);
        fetchProviderDetail();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to approve provider', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reject Action
  const handleReject = async () => {
    if (!rejectionRemarks.trim()) {
      addToast('Rejection remarks are required to explain the decision.', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const res = await adminAPI.rejectProvider(id, rejectionRemarks.trim());
      if (res.data.success) {
        addToast('Application rejected with remarks.', 'info');
        setShowRejectModal(false);
        setRejectionRemarks('');
        fetchProviderDetail();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to reject application', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving comprehensive provider dossier..." />;
  }

  if (!providerData?.profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Provider Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">
          The requested provider record does not exist or has been removed.
        </p>
        <Link
          to="/admin/providers"
          className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
        >
          Back to Providers Directory
        </Link>
      </div>
    );
  }

  const profile = providerData.profile;
  const user = profile.userId || {};
  const documents = providerData.documents || [];
  const completion = providerData.completionPercentage || 0;
  const status = profile.applicationStatus;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in relative">
      {/* Ambient background light orbs */}
      <div className="absolute top-10 left-1/4 w-80 h-80 bg-brand-400/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl pointer-events-none -z-10 animate-float" />

      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/providers')}
            className="p-2.5 rounded-2xl glass-card hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200 transition"
            title="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {user.name || 'Provider Dossier'}
              </h1>
              <StatusBadge status={status} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Registration ID: <span className="font-mono text-slate-600">{profile._id}</span> • Applied on{' '}
              {profile.submittedAt
                ? new Date(profile.submittedAt).toLocaleString()
                : 'Draft Mode'}
            </p>
          </div>
        </div>

        {/* Action Decision Buttons */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setShowRejectModal(true)}
            className="px-4 py-2.5 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
          >
            <XCircle size={16} />
            <span>Reject / Request Edits</span>
          </button>

          <button
            type="button"
            onClick={() => setShowApproveModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-glow-emerald"
          >
            <CheckCircle size={16} />
            <span>Approve Provider</span>
          </button>
        </div>
      </div>

      {/* Prior Rejection Banner if rejected */}
      {status === 'Rejected' && profile.rejectionRemarks && (
        <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 flex items-start gap-3 shadow-xs">
          <AlertTriangle size={20} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-900">
            <span className="font-bold">Prior Rejection Remarks: </span>
            <span>"{profile.rejectionRemarks}"</span>
          </div>
        </div>
      )}

      {/* Dossier Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Identity Snapshot & Verification Files */}
        <div className="space-y-6">
          {/* Card: Identity Headshot with 3D Shield Badge */}
          <Card3D className="glass-panel rounded-3xl border border-white/80 shadow-xs p-6 text-center space-y-4">
            <div className="relative inline-block mx-auto">
              {profile.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt={user.name}
                  className="w-28 h-28 rounded-2xl object-cover border-2 border-brand-500 shadow-md"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-black text-4xl shadow-glow-brand">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'P'}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900">{user.name}</h2>
              <p className="text-xs font-bold text-brand-600 uppercase tracking-wider mt-0.5">
                {user.role}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs text-left space-y-2.5 font-medium">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail size={14} className="text-slate-400 shrink-0" />
                <span className="truncate">{user.email || 'No email provided'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone size={14} className="text-slate-400 shrink-0" />
                <span>{user.phone || 'No phone provided'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar size={14} className="text-slate-400 shrink-0" />
                <span>
                  DOB:{' '}
                  {profile.dateOfBirth
                    ? new Date(profile.dateOfBirth).toLocaleDateString()
                    : 'Not specified'}
                </span>
              </div>
            </div>

            {/* Completeness Bar */}
            <div className="pt-4 border-t border-slate-100 text-left">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-bold text-slate-600">Dossier Completeness</span>
                <span className="font-extrabold text-brand-600">{completion}%</span>
              </div>
              <ProgressBar percentage={completion} showLabel={false} height="h-2.5" />
            </div>

            {/* 3D Verification Badge */}
            <div className="pt-2 flex flex-col items-center">
              <ShieldBadge3D status={status} size={80} />
              <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                Cryptographic KYC Seal
              </span>
            </div>
          </Card3D>

          {/* Card: Verification Documents */}
          <div className="glass-panel rounded-3xl border border-white/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">
                KYC Verification Files ({documents.length})
              </h3>
              <span className="text-[11px] font-bold text-brand-600">Encrypted</span>
            </div>

            {documents.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No documents uploaded by this applicant yet.
              </p>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <Card3D
                    key={doc._id}
                    className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 flex items-center justify-between gap-3 text-xs shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                        <FileCheck2 size={18} />
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-slate-900 truncate">
                          {doc.originalName}
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">
                          {doc.documentType.replace('_', ' ')}
                        </p>
                      </div>
                    </div>

                    <a
                      href={doc.filePath}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-50 text-brand-600 font-bold text-[11px] flex items-center gap-1 transition"
                    >
                      <span>Preview</span>
                      <ExternalLink size={12} />
                    </a>
                  </Card3D>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 2 Columns: Full Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Professional Skills & Experience */}
          <div className="glass-panel rounded-3xl border border-white/80 shadow-xs p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <Briefcase size={20} className="text-brand-600" />
              <h3 className="text-base font-black text-slate-900">
                Professional Expertise & Services
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                  Experience Level
                </span>
                <span className="text-xl font-black text-slate-900 mt-1 block">
                  {profile.experience ? `${profile.experience} Years` : '0 Years'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                  Prior Experience / Background
                </span>
                <span className="text-sm font-semibold text-slate-800 mt-1 block">
                  {profile.previousExperience || 'None specified'}
                </span>
              </div>
            </div>

            {/* Service Categories */}
            <div>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2.5">
                Offered Service Categories
              </span>
              <div className="flex flex-wrap gap-2">
                {profile.serviceCategories?.length > 0 ? (
                  profile.serviceCategories.map((cat, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-200/60 text-brand-700 text-xs font-bold"
                    >
                      {cat}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No categories selected</span>
                )}
              </div>
            </div>

            {/* Skills chips */}
            <div>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2.5">
                Technical Skills & Tools
              </span>
              <div className="flex flex-wrap gap-2">
                {profile.skills?.length > 0 ? (
                  profile.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No skills listed</span>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                  Professional Summary
                </span>
                <p className="text-xs text-slate-700 leading-relaxed p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  {profile.bio}
                </p>
              </div>
            )}
          </div>

          {/* Section: Operational Coverage & Jurisdiction */}
          <div className="glass-panel rounded-3xl border border-white/80 shadow-xs p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <MapPin size={20} className="text-brand-600" />
              <h3 className="text-base font-black text-slate-900">
                Service Location & Operational Coverage
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">
                  Workshop / Base Address
                </span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {profile.address || 'Not provided'}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">
                  City & State
                </span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {profile.city ? `${profile.city}, ${profile.state || ''}` : 'Not set'}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">
                  Pincode
                </span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {profile.pincode || 'Not set'}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">
                  Dispatch Service Radius
                </span>
                <p className="font-bold text-brand-700 mt-0.5">
                  {profile.serviceRadius ? `${profile.serviceRadius} km coverage` : '15 km'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Approve Confirmation Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Confirm Provider Approval"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to approve <strong className="text-slate-900">{user.name}</strong> as an active service partner?
          </p>
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
            Once approved, the provider's status will switch to <strong>Approved</strong> and their profile will be immediately visible to dispatch customers.
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowApproveModal(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleApprove}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-glow-emerald"
            >
              {actionLoading ? 'Approving...' : 'Confirm Approval'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal with Mandatory Remarks */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Application with Remarks"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Specify the precise reason for rejection so the provider can revise their documents or details and resubmit:
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Rejection Remarks (Mandatory) *
            </label>
            <textarea
              rows={4}
              value={rejectionRemarks}
              onChange={(e) => setRejectionRemarks(e.target.value)}
              placeholder="e.g. Government ID proof document is blurry. Please upload a clear color scan of Aadhaar or Passport."
              className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowRejectModal(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={actionLoading || !rejectionRemarks.trim()}
              onClick={handleReject}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs disabled:opacity-50"
            >
              {actionLoading ? 'Rejecting...' : 'Reject with Remarks'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
