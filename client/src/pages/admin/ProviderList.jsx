import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Search,
  Filter,
  Users,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
  MapPin,
  Briefcase,
  SlidersHorizontal,
} from 'lucide-react';

const STATUS_OPTIONS = [
  'All',
  'Submitted',
  'Under Review',
  'Approved',
  'Rejected',
  'Draft',
];

const SERVICE_OPTIONS = [
  'All',
  'Electrician',
  'Plumber',
  'Carpenter',
  'Cleaning',
  'Painting',
  'AC Repair',
  'Appliance Repair',
  'Pest Control',
  'Home Automation',
  'Other',
];

export default function ProviderList() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        ...(search.trim() && { search: search.trim() }),
        ...(statusFilter !== 'All' && { status: statusFilter }),
        ...(serviceFilter !== 'All' && { service: serviceFilter }),
        ...(cityFilter.trim() && { city: cityFilter.trim() }),
        ...(experienceFilter && { experience: experienceFilter }),
      };

      const res = await adminAPI.getProviders(params);
      if (res.data.success) {
        setProviders(res.data.data.providers || []);
        setPage(res.data.data.page);
        setLimit(res.data.data.limit);
        setTotalPages(res.data.data.totalPages);
        setTotalCount(res.data.data.total);
      }
    } catch (err) {
      console.error('Error fetching providers list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [page, limit, statusFilter, serviceFilter]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProviders();
  };

  // Clear all filters
  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setServiceFilter('All');
    setCityFilter('');
    setExperienceFilter('');
    setPage(1);
    // Directly fetch with clean state
    setTimeout(() => {
      fetchProviders();
    }, 0);
  };

  const hasActiveFilters =
    search.trim() ||
    statusFilter !== 'All' ||
    serviceFilter !== 'All' ||
    cityFilter.trim() ||
    experienceFilter;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in relative">
      {/* Ambient background light orbs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl pointer-events-none -z-10 animate-float" />

      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Provider Application Directory
            </h1>
            <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-extrabold border border-brand-100">
              {totalCount} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter by service or status, verify KYC documents and manage approvals
          </p>
        </div>

        <button
          type="button"
          onClick={fetchProviders}
          className="self-start sm:self-center px-4 py-2 rounded-xl glass-card hover:bg-white text-slate-700 text-xs font-bold flex items-center gap-1.5 transition border border-slate-200"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-white/80 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  Status: {st}
                </option>
              ))}
            </select>
          </div>

          {/* Service Category Filter */}
          <div>
            <select
              value={serviceFilter}
              onChange={(e) => {
                setServiceFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {SERVICE_OPTIONS.map((svc) => (
                <option key={svc} value={svc}>
                  Service: {svc}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="Filter by city..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-2xs"
            >
              Apply
            </button>
          </div>
        </form>

        {/* Filter Reset pill */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Active filters applied. Showing filtered results.
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-rose-600 font-bold hover:underline"
            >
              <X size={14} />
              <span>Clear All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Providers Table */}
      <div className="glass-panel rounded-3xl border border-white/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16">
            <LoadingSpinner text="Fetching matching providers..." />
          </div>
        ) : providers.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="No providers found"
              description="No service providers match your current search criteria or status filters."
              actionText={hasActiveFilters ? 'Clear Filters' : undefined}
              onAction={hasActiveFilters ? handleResetFilters : undefined}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-6">Provider Name & Contact</th>
                  <th className="py-3.5 px-6">Services Offered</th>
                  <th className="py-3.5 px-6">Location & Radius</th>
                  <th className="py-3.5 px-6">Experience</th>
                  <th className="py-3.5 px-6">Application Status</th>
                  <th className="py-3.5 px-6">Last Updated</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {providers.map((item) => {
                  const user = item.userId || {};
                  return (
                    <tr key={item._id} className="hover:bg-slate-50/70 transition">
                      {/* Name & Contact */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {item.profilePhoto ? (
                            <img
                              src={item.profilePhoto}
                              alt={user.name}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold shrink-0">
                              {user.name ? user.name.charAt(0).toUpperCase() : 'P'}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900">{user.name || 'Unnamed'}</p>
                            <p className="text-[11px] text-slate-400">{user.email || 'No email'}</p>
                            <p className="text-[10px] text-slate-400">{user.phone || 'No phone'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Services */}
                      <td className="py-4 px-6">
                        {item.serviceCategories?.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {item.serviceCategories.slice(0, 2).map((cat, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-[11px] text-slate-700"
                              >
                                {cat}
                              </span>
                            ))}
                            {item.serviceCategories.length > 2 && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-bold text-[10px]">
                                +{item.serviceCategories.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>

                      {/* Location & Radius */}
                      <td className="py-4 px-6 text-slate-600">
                        <div className="flex items-center gap-1 font-medium">
                          <span>{item.city ? `${item.city}, ${item.state || ''}` : 'Not set'}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {item.serviceRadius ? `${item.serviceRadius} km coverage` : ''}
                        </span>
                      </td>

                      {/* Experience */}
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-800">
                          {item.experience !== undefined ? `${item.experience} Yrs` : '-'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <StatusBadge status={item.applicationStatus} size="sm" />
                      </td>

                      {/* Updated Date */}
                      <td className="py-4 px-6 text-slate-500 text-[11px]">
                        {item.updatedAt
                          ? new Date(item.updatedAt).toLocaleDateString()
                          : '-'}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/admin/providers/${item._id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-700 hover:from-brand-500 hover:to-indigo-600 text-white font-bold text-xs shadow-glow-brand transition"
                        >
                          <span>Review Dossier</span>
                          <ArrowRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span>Show</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 rounded-lg border border-slate-300 font-semibold bg-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>entries per page (Showing {providers.length} of {totalCount})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              <span>Prev</span>
            </button>

            <span className="font-bold text-slate-800 px-2">
              Page {page} of {totalPages || 1}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
