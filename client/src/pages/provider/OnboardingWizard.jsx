import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { providerAPI } from '../../services/api';
import FileUpload from '../../components/FileUpload';
import Modal from '../../components/Modal';
import ProgressBar from '../../components/ProgressBar';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Card3D from '../../components/3d/Card3D';
import ProgressOrb3D from '../../components/3d/ProgressOrb3D';
import {
  User,
  Briefcase,
  Wrench,
  MapPin,
  FileCheck2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  Trash2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Camera,
  Info,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';

const SERVICE_OPTIONS = [
  { id: 'Electrician', name: 'Electrician', icon: '⚡', desc: 'Wiring, fixtures, appliances' },
  { id: 'Plumber', name: 'Plumber', icon: '🔧', desc: 'Pipes, leaks, drainage' },
  { id: 'Carpenter', name: 'Carpenter', icon: '🪚', desc: 'Furniture, doors, cabinetry' },
  { id: 'Cleaning', name: 'Deep Cleaning', icon: '🧹', desc: 'Home, office, sanitization' },
  { id: 'Painting', name: 'Painting & Waterproofing', icon: '🎨', desc: 'Interior & exterior walls' },
  { id: 'AC Repair', name: 'AC & HVAC Technician', icon: '❄️', desc: 'Servicing, gas recharge' },
  { id: 'Appliance Repair', name: 'Appliance Repair', icon: '🧺', desc: 'Washing machines, fridges' },
  { id: 'Pest Control', name: 'Pest Control', icon: '🐜', desc: 'Termite, bedbug treatment' },
  { id: 'Home Automation', name: 'Home Automation / CCTV', icon: '📹', desc: 'Smart security & IoT' },
  { id: 'Other', name: 'Other General Contractor', icon: '🛠️', desc: 'Handyman & custom services' },
];

const STEPS = [
  { id: 1, label: 'Personal Details', icon: User },
  { id: 2, label: 'Experience & Skills', icon: Briefcase },
  { id: 3, label: 'Service Selection', icon: Wrench },
  { id: 4, label: 'Service Location', icon: MapPin },
  { id: 5, label: 'Document Uploads', icon: FileCheck2 },
  { id: 6, label: 'Review & Submit', icon: ShieldCheck },
];

export default function OnboardingWizard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Profile Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Male',
    bio: '',
    experience: 0,
    previousExperience: '',
    skills: [],
    serviceCategories: [],
    address: '',
    city: '',
    state: '',
    pincode: '',
    serviceRadius: 15,
  });

  const [profilePhoto, setProfilePhoto] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [documents, setDocuments] = useState([]);
  const [docUploading, setDocUploading] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('id_proof');
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [applicationStatus, setApplicationStatus] = useState('Draft');
  const [rejectionRemarks, setRejectionRemarks] = useState('');

  // Fetch initial profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await providerAPI.getProfile();
      if (res.data.success) {
        const { profile, documents: docs, completionPercentage: comp } = res.data.data;
        setFormData({
          name: profile.userId?.name || user?.name || '',
          phone: profile.userId?.phone || user?.phone || '',
          dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.substring(0, 10) : '',
          gender: profile.gender || 'Male',
          bio: profile.bio || '',
          experience: profile.experience || 0,
          previousExperience: profile.previousExperience || '',
          skills: profile.skills || [],
          serviceCategories: profile.serviceCategories || [],
          address: profile.address || '',
          city: profile.city || '',
          state: profile.state || '',
          pincode: profile.pincode || '',
          serviceRadius: profile.serviceRadius || 15,
        });
        setProfilePhoto(profile.profilePhoto || '');
        setDocuments(docs || []);
        setCompletionPercentage(comp || 0);
        setApplicationStatus(profile.applicationStatus || 'Draft');
        setRejectionRemarks(profile.rejectionRemarks || '');
      }
    } catch (err) {
      console.error('Error fetching onboarding profile:', err);
      addToast('Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const isLocked = applicationStatus === 'Submitted' || applicationStatus === 'Under Review';

  // Handle generic input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add a skill chip
  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmed],
      }));
      setSkillInput('');
    }
  };

  // Remove a skill chip
  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  // Toggle service selection
  const handleToggleService = (serviceId) => {
    setFormData((prev) => {
      const exists = prev.serviceCategories.includes(serviceId);
      const nextCategories = exists
        ? prev.serviceCategories.filter((s) => s !== serviceId)
        : [...prev.serviceCategories, serviceId];
      return { ...prev, serviceCategories: nextCategories };
    });
  };

  // Save current step data to server
  const saveProgress = async () => {
    if (isLocked) return;
    try {
      setSaving(true);
      const res = await providerAPI.updateProfile(formData);
      if (res.data.success) {
        setCompletionPercentage(res.data.data.completionPercentage);
      }
    } catch (err) {
      console.error('Error saving progress:', err);
      addToast(err.response?.data?.message || 'Error saving progress', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Profile photo upload handler
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);

    setPhotoUploading(true);
    try {
      const res = await providerAPI.uploadPhoto(data);
      if (res.data.success) {
        setProfilePhoto(res.data.data.profilePhoto);
        setCompletionPercentage(res.data.data.completionPercentage);
        addToast('Profile photo updated!', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to upload photo', 'error');
    } finally {
      setPhotoUploading(false);
    }
  };

  // Document upload handler
  const handleDocumentUpload = async (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('documentType', selectedDocType);

    setDocUploading(true);
    try {
      const res = await providerAPI.uploadDocument(data);
      if (res.data.success) {
        setDocuments((prev) => [res.data.data.document, ...prev]);
        setCompletionPercentage(res.data.data.completionPercentage);
        addToast('Document uploaded successfully!', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to upload document', 'error');
    } finally {
      setDocUploading(false);
    }
  };

  // Delete document handler
  const handleDeleteDocument = async (id) => {
    if (isLocked) return;
    try {
      const res = await providerAPI.deleteDocument(id);
      if (res.data.success) {
        setDocuments((prev) => prev.filter((d) => d._id !== id));
        setCompletionPercentage(res.data.data.completionPercentage);
        addToast('Document deleted.', 'info');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete document', 'error');
    }
  };

  // Navigation between steps
  const handleNext = async () => {
    await saveProgress();
    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Check required fields before final submit
  const getValidationErrors = () => {
    const missing = [];
    if (!formData.name.trim()) missing.push('Full Name');
    if (!formData.phone.trim()) missing.push('Phone Number');
    if (!formData.dateOfBirth) missing.push('Date of Birth');
    if (formData.skills.length === 0) missing.push('At least 1 Skill');
    if (formData.serviceCategories.length === 0) missing.push('At least 1 Service Category');
    if (!formData.address.trim()) missing.push('Street Address');
    if (!formData.city.trim()) missing.push('City');
    if (!formData.state.trim()) missing.push('State');
    if (!formData.pincode.trim()) missing.push('Pincode');
    if (!profilePhoto) missing.push('Profile Photo');
    if (documents.length < 2) missing.push('At least 2 Verification Documents');
    return missing;
  };

  // Submit Final Application
  const handleFinalSubmit = async () => {
    const missing = getValidationErrors();
    if (missing.length > 0) {
      addToast(`Please complete: ${missing.join(', ')}`, 'error');
      setShowSubmitModal(false);
      return;
    }

    setSubmitting(true);
    try {
      // Save any pending edits first
      await providerAPI.updateProfile(formData);
      // Submit
      const res = await providerAPI.submitApplication();
      if (res.data.success) {
        addToast('Application submitted successfully!', 'success');
        setApplicationStatus('Submitted');
        setShowSubmitModal(false);
        navigate('/provider/status');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit application', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading onboarding portal..." />;
  }

  const missingFields = getValidationErrors();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in relative">
      {/* Ambient background light orbs */}
      <div className="absolute top-10 left-1/4 w-80 h-80 bg-brand-400/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl pointer-events-none -z-10 animate-float" />

      {/* Top Banner: Status & 3D Progress Orb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xs">
        <div className="flex items-center gap-4">
          <ProgressOrb3D percentage={completionPercentage} status={applicationStatus} size={80} />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Service Partner Onboarding
              </h1>
              <StatusBadge status={applicationStatus} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Complete the 6-step verification to activate your service business profile
            </p>
          </div>
        </div>

        <div className="w-full sm:w-56">
          <ProgressBar percentage={completionPercentage} label="Form Progress" />
        </div>
      </div>

      {/* Lock Notice if Submitted */}
      {isLocked && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3">
          <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <span className="font-bold">Application Under Review: </span>
            Your submission is currently locked for review by Trizen Administrators. You may view your entered details below. If changes are needed, you can modify once an admin reviews or unlocks it.
          </div>
        </div>
      )}

      {/* Rejection Notice if rejected */}
      {applicationStatus === 'Rejected' && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <AlertCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="text-sm text-rose-900">
            <span className="font-bold">Corrections Requested: </span>
            {rejectionRemarks || 'Please review your uploaded documents and details.'}
            <div className="mt-1 text-xs text-rose-700">
              You can make edits in any step below and click "Submit Application" when finished.
            </div>
          </div>
        </div>
      )}

      {/* Step Navigation Pill Stepper */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[650px] gap-1">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <button
                key={step.id}
                type="button"
                onClick={async () => {
                  if (!isLocked) await saveProgress();
                  setCurrentStep(step.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-xs'
                    : isCompleted
                    ? 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : isCompleted
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? <Check size={12} /> : step.id}
                </div>
                <span className="truncate">{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Wizard Step Body */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* ========================================================
            STEP 1: PERSONAL DETAILS
        ======================================================== */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
              <p className="text-xs text-slate-500">
                Provide your basic contact identity as registered with local authorities
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name / Legal Entity *
                </label>
                <input
                  type="text"
                  name="name"
                  disabled={isLocked}
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-100"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  disabled={isLocked}
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-100"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  disabled={isLocked}
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-100"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Gender *
                </label>
                <select
                  name="gender"
                  disabled={isLocked}
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-100"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              {/* Professional Bio */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Professional Bio / Introduction
                </label>
                <textarea
                  name="bio"
                  rows={3}
                  disabled={isLocked}
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Introduce your craftsmanship, background, and work ethic to prospective clients..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-100"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 2: EXPERIENCE & SKILLS
        ======================================================== */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Experience & Technical Skills</h2>
              <p className="text-xs text-slate-500">
                Detail your field experience and tag your specific trade skills
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Total Years Experience */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Total Years of Experience *
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  name="experience"
                  disabled={isLocked}
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-100"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Indicate verified hands-on industry work experience.
                </span>
              </div>

              {/* Previous Experience / Notable Projects */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Past Companies / Contracts
                </label>
                <input
                  type="text"
                  name="previousExperience"
                  disabled={isLocked}
                  value={formData.previousExperience}
                  onChange={handleChange}
                  placeholder="e.g. UrbanClap 2 yrs, Freelance 3 yrs"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-100"
                />
              </div>

              {/* Skills Tag Input */}
              <div className="sm:col-span-2 space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Specific Skills & Tools (Add at least 1) *
                </label>

                {!isLocked && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      placeholder="Type a skill (e.g. MCB Installation, Inverter Wiring, Pipe Threading) and press Add"
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition shadow-2xs"
                    >
                      Add Skill
                    </button>
                  </div>
                )}

                {/* Skill Chips List */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 min-h-[70px] flex flex-wrap gap-2 items-center">
                  {formData.skills.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">
                      No skills added yet. Add skills to highlight your strengths.
                    </span>
                  ) : (
                    formData.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs"
                      >
                        <span>{skill}</span>
                        {!isLocked && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-slate-400 hover:text-rose-600 rounded p-0.5 transition"
                          >
                            <X size={13} />
                          </button>
                        )}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 3: SERVICE SELECTION
        ======================================================== */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Service Categories</h2>
              <p className="text-xs text-slate-500">
                Choose all categories where you are qualified to accept service bookings
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {SERVICE_OPTIONS.map((cat) => {
                const isSelected = formData.serviceCategories.includes(cat.id);
                return (
                  <div
                    key={cat.id}
                    onClick={() => !isLocked && handleToggleService(cat.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3 select-none ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/50 shadow-xs ring-1 ring-brand-500'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    } ${isLocked ? 'cursor-not-allowed opacity-80' : ''}`}
                  >
                    <div className="text-2xl mt-0.5 shrink-0">{cat.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900">{cat.name}</h4>
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                            isSelected
                              ? 'bg-brand-600 border-brand-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check size={11} />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{cat.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              Selected <span className="font-bold text-brand-700">{formData.serviceCategories.length}</span> categories. You can offer services across multiple domains if verified.
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 4: SERVICE LOCATION & RADIUS
        ======================================================== */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Operating Area & Radius</h2>
              <p className="text-xs text-slate-500">
                Set your primary base location and customer dispatch radius
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Street Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Base Street Address / Workshop Location *
                </label>
                <input
                  type="text"
                  name="address"
                  disabled={isLocked}
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. 104, Sunrise Industrial Estate, Sector 18"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-100"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  disabled={isLocked}
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. New Delhi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-100"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  State / Territory *
                </label>
                <input
                  type="text"
                  name="state"
                  disabled={isLocked}
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. Delhi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-100"
                />
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Postal Pincode *
                </label>
                <input
                  type="text"
                  name="pincode"
                  disabled={isLocked}
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="e.g. 110001"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-100"
                />
              </div>

              {/* Service Radius Slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Service Travel Radius
                  </label>
                  <span className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-xs font-bold">
                    {formData.serviceRadius} km
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  name="serviceRadius"
                  disabled={isLocked}
                  value={formData.serviceRadius}
                  onChange={handleChange}
                  className="w-full accent-brand-600 h-2 bg-slate-200 rounded-lg cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>5 km (Local)</span>
                  <span>50 km (Metro)</span>
                  <span>100 km (Regional)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 5: DOCUMENT UPLOADS & PHOTO
        ======================================================== */}
        {currentStep === 5 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Verification Files & Photo</h2>
              <p className="text-xs text-slate-500">
                Upload your official documents and a clear headshot for partner identity verification
              </p>
            </div>

            {/* Profile Photo Section */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile Headshot"
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-brand-500 shadow-xs"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-3xl">
                    {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                {photoUploading && (
                  <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center text-white text-xs font-bold">
                    Uploading...
                  </div>
                )}
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <h4 className="text-sm font-bold text-slate-900">Profile Photo *</h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  Upload a clear, front-facing professional headshot (JPG, PNG up to 5MB).
                </p>
                {!isLocked && (
                  <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs transition">
                    <Camera size={14} />
                    <span>Choose Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Document Uploader */}
            {!isLocked && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Select Document Category to Upload:
                  </label>
                  <select
                    value={selectedDocType}
                    onChange={(e) => setSelectedDocType(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="id_proof">Government ID Proof (Aadhaar, Passport, DL)</option>
                    <option value="address_proof">Address Proof (Utility Bill, Rental Agt)</option>
                    <option value="certificate">Trade / Technical Certification</option>
                    <option value="experience_cert">Past Work / Experience Letter</option>
                    <option value="other">Other Supporting Proof</option>
                  </select>
                </div>

                <FileUpload
                  onUpload={handleDocumentUpload}
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  maxSizeMB={5}
                />
              </div>
            )}

            {/* Uploaded Documents Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                Uploaded Verification Files ({documents.length})
              </h3>

              {documents.length === 0 ? (
                <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 text-center text-xs text-slate-400">
                  No verification documents uploaded yet. Upload at least 2 documents to qualify.
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc._id}
                      className="p-3.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                          <FileCheck2 size={18} />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {doc.originalName}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span className="uppercase font-semibold text-brand-600">
                              {doc.documentType.replace('_', ' ')}
                            </span>
                            <span>•</span>
                            <span>{(doc.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={doc.filePath}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-50 transition"
                          title="View document"
                        >
                          <ExternalLink size={16} />
                        </a>
                        {!isLocked && (
                          <button
                            type="button"
                            onClick={() => handleDeleteDocument(doc._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete file"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 6: REVIEW & FINAL SUBMIT
        ======================================================== */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Application Dossier Review</h2>
              <p className="text-xs text-slate-500">
                Inspect your entered data before final dispatch to our verification administrators
              </p>
            </div>

            {/* Submission Requirements Checklist */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3">
                Pre-Submission Verification Checklist
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  {formData.name && formData.phone && formData.dateOfBirth ? (
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  ) : (
                    <AlertCircle size={16} className="text-rose-500" />
                  )}
                  <span className={formData.name ? 'text-slate-800' : 'text-rose-600 font-bold'}>
                    Personal Information Completed
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {formData.skills.length > 0 ? (
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  ) : (
                    <AlertCircle size={16} className="text-rose-500" />
                  )}
                  <span className={formData.skills.length > 0 ? 'text-slate-800' : 'text-rose-600 font-bold'}>
                    Skills Added ({formData.skills.length})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {formData.serviceCategories.length > 0 ? (
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  ) : (
                    <AlertCircle size={16} className="text-rose-500" />
                  )}
                  <span className={formData.serviceCategories.length > 0 ? 'text-slate-800' : 'text-rose-600 font-bold'}>
                    Services Selected ({formData.serviceCategories.length})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {formData.address && formData.city && formData.pincode ? (
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  ) : (
                    <AlertCircle size={16} className="text-rose-500" />
                  )}
                  <span className={formData.city ? 'text-slate-800' : 'text-rose-600 font-bold'}>
                    Location & Coverage Set
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {profilePhoto ? (
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  ) : (
                    <AlertCircle size={16} className="text-rose-500" />
                  )}
                  <span className={profilePhoto ? 'text-slate-800' : 'text-rose-600 font-bold'}>
                    Profile Photo Uploaded
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {documents.length >= 2 ? (
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  ) : (
                    <AlertCircle size={16} className="text-rose-500" />
                  )}
                  <span className={documents.length >= 2 ? 'text-slate-800' : 'text-rose-600 font-bold'}>
                    Min 2 Documents Uploaded ({documents.length}/2)
                  </span>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Card 1: Personal & Experience */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h4 className="font-bold text-slate-900">Personal & Experience</h4>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-brand-600 hover:underline font-semibold"
                  >
                    Edit
                  </button>
                </div>
                <p><span className="text-slate-500">Name:</span> <strong>{formData.name}</strong></p>
                <p><span className="text-slate-500">Phone:</span> <strong>{formData.phone}</strong></p>
                <p><span className="text-slate-500">Experience:</span> <strong>{formData.experience} Years</strong></p>
                <div>
                  <span className="text-slate-500">Skills:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.skills.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 2: Services & Coverage */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h4 className="font-bold text-slate-900">Services & Location</h4>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-brand-600 hover:underline font-semibold"
                  >
                    Edit
                  </button>
                </div>
                <p><span className="text-slate-500">City / State:</span> <strong>{formData.city}, {formData.state}</strong></p>
                <p><span className="text-slate-500">Radius:</span> <strong>{formData.serviceRadius} km</strong></p>
                <div>
                  <span className="text-slate-500">Categories:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.serviceCategories.map((c, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-brand-50 text-brand-700 rounded text-[11px] font-semibold">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Action Box */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                {missingFields.length > 0 ? (
                  <p className="text-xs font-bold text-rose-600">
                    Missing required information: {missingFields.join(', ')}.
                  </p>
                ) : (
                  <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    <span>All requirements met! Ready for submission.</span>
                  </p>
                )}
              </div>

              {!isLocked && (
                <button
                  type="button"
                  disabled={missingFields.length > 0 || submitting}
                  onClick={() => setShowSubmitModal(true)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={18} />
                  <span>Submit Application for Review</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Wizard Footer Nav Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={handlePrev}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition"
          >
            <ArrowLeft size={15} />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-3">
            {!isLocked && (
              <button
                type="button"
                disabled={saving}
                onClick={saveProgress}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition"
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
            )}

            {currentStep < 6 && (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
              >
                <span>Continue</span>
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Final Submission Confirmation Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Confirm Application Submission"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to submit your application for administrator verification?
          </p>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
            <p className="font-bold">Important Notice:</p>
            <p>Once submitted, your application fields will be locked while the compliance team conducts background verification and document review.</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowSubmitModal(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleFinalSubmit}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs flex items-center gap-1.5"
            >
              {submitting ? 'Submitting...' : 'Yes, Submit Application'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
