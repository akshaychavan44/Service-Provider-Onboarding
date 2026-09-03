import React from 'react';
import {
  FileEdit,
  Send,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';

const statusConfig = {
  Draft: {
    bg: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: FileEdit,
    label: 'Draft',
    dot: 'bg-slate-400',
  },
  Submitted: {
    bg: 'bg-amber-50 text-amber-800 border-amber-300',
    icon: Send,
    label: 'Submitted',
    dot: 'bg-amber-500',
  },
  'Under Review': {
    bg: 'bg-sky-50 text-sky-800 border-sky-300',
    icon: Search,
    label: 'Under Review',
    dot: 'bg-sky-500 animate-pulse',
  },
  Approved: {
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    icon: CheckCircle2,
    label: 'Approved',
    dot: 'bg-emerald-500',
  },
  Rejected: {
    bg: 'bg-rose-50 text-rose-800 border-rose-300',
    icon: XCircle,
    label: 'Rejected',
    dot: 'bg-rose-500',
  },
};

export default function StatusBadge({ status, size = 'md', showIcon = true }) {
  const config = statusConfig[status] || {
    bg: 'bg-gray-100 text-gray-700 border-gray-300',
    icon: AlertCircle,
    label: status || 'Unknown',
    dot: 'bg-gray-400',
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm ${config.bg} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {showIcon && <Icon size={iconSizes[size]} className="shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
}
