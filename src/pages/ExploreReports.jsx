import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Map,
  List,
  RotateCcw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  ThumbsUp
} from 'lucide-react';
import { getReports, confirmReport } from '../api/reports.js';
import ReportCard from '../components/ReportCard.jsx';
import InteractiveMap from '../components/InteractiveMap.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { CATEGORIES } from '../utils/categoryLabels.js';
import { BAHIR_DAR_NEIGHBORHOODS } from '../utils/neighborhoods.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function ExploreReports() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search and filter states from URL search params for bookmarkable states
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'all';
  const status = searchParams.get('status') || 'all';
  const priority = searchParams.get('priority') || 'all';
  const neighborhood = searchParams.get('neighborhood') || 'all';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [feedbackToast, setFeedbackToast] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReports({
        search,
        category,
        status,
        priority,
        neighborhood,
        sort,
        page,
        limit: 9
      });
      setReports(data.reports || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [search, category, status, priority, neighborhood, sort, page]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    // Reset to page 1 on filter changes
    if (key !== 'page') {
      next.delete('page');
    }
    setSearchParams(next);
  };

  const handleResetFilters = () => {
    setSearchParams({});
  };

  const handleConfirm = async (reportId) => {
    try {
      setConfirmingId(reportId);
      const res = await confirmReport(reportId);
      // Update count locally in reports state
      setReports(prev =>
        prev.map(r => (r.id === reportId ? { ...r, confirmationsCount: res.confirmationsCount } : r))
      );
      setFeedbackToast({ type: 'success', message: res.message || 'Report confirmed!' });
      setTimeout(() => setFeedbackToast(null), 4000);
    } catch (err) {
      const msg = err.details?.message || err.message || 'Failed to confirm report';
      setFeedbackToast({ type: 'warning', message: msg });
      setTimeout(() => setFeedbackToast(null), 4000);
    } finally {
      setConfirmingId(null);
    }
  };

  const hasActiveFilters = search || (category && category !== 'all') || (status && status !== 'all') || (priority && priority !== 'all') || (neighborhood && neighborhood !== 'all');

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {feedbackToast && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-xl border text-sm flex items-center gap-3 transition-all animate-bounce ${
            feedbackToast.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
              : 'bg-amber-900 text-amber-100 border-amber-700'
          }`}
        >
          <ThumbsUp className="w-5 h-5 text-emerald-400" />
          <span>{feedbackToast.message}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Explore Neighborhood Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse, search, and verify community reports across Bahir Dar Kebeles. Showing {total} report{total !== 1 ? 's' : ''}.
          </p>
        </div>

        {/* View mode toggle (List vs Map) */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="p-1 rounded-xl bg-slate-200/80 border border-slate-300 flex items-center">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span>List View</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'map'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>Map View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="search"
            value={search}
            onChange={(e) => updateParam('search', e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
          />
        </div>

        {/* Filter Selects */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1 text-xs">
          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => updateParam('category', e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORIES).map(([k, cat]) => (
                <option key={k} value={k}>{cat.shortLabel || cat.label}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => updateParam('status', e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value="reported">Reported</option>
              <option value="under_review">Under Review</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Closed / Duplicate</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => updateParam('priority', e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Neighborhood Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Neighborhood / Kebele
            </label>
            <select
              value={neighborhood}
              onChange={(e) => updateParam('neighborhood', e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Neighborhoods</option>
              {BAHIR_DAR_NEIGHBORHOODS.map((n) => (
                <option key={n.name} value={n.name}>{n.name}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Sort By
            </label>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="newest">Newest First</option>
              <option value="priority">Highest Priority</option>
              <option value="confirmations">Most Confirmed</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Reset button if filters active */}
        {hasActiveFilters && (
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs text-slate-500">
            <span>Filtered results active</span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingState message="Fetching neighborhood reports from server..." />
      ) : error ? (
        <ErrorState
          title="Could not load reports"
          message={error.message}
          details={error.details || error.raw}
          onRetry={fetchReports}
        />
      ) : reports.length === 0 ? (
        <EmptyState
          title="No problem reports found"
          description={
            hasActiveFilters
              ? 'No issues match your active search terms and filters. Try adjusting your filter parameters.'
              : 'No reports exist yet in this area. Be the first to flag a hazard.'
          }
          actionLabel="Submit New Report"
          actionLink="/reports/new"
          onReset={hasActiveFilters ? handleResetFilters : null}
        />
      ) : (
        <>
          {/* Map View */}
          {viewMode === 'map' && (
            <div className="space-y-4">
              <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs flex items-center justify-between">
                <span>Displaying coordinates for {reports.filter(r => r.latitude && r.longitude).length} mapped reports</span>
                <span className="text-emerald-400 font-medium">Click any pin to inspect details</span>
              </div>
              <InteractiveMap reports={reports} height="h-[550px]" />
            </div>
          )}

          {/* List / Cards View */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onConfirm={handleConfirm}
                isConfirming={confirmingId === report.id}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div>
                Page <span className="font-semibold text-slate-900">{page}</span> of{' '}
                <span className="font-semibold text-slate-900">{totalPages}</span> ({total} total reports)
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => updateParam('page', page - 1)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => updateParam('page', page + 1)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium shadow-2xs"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
