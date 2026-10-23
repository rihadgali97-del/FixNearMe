import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wrench,
  Lock,
  Unlock,
  Edit,
  ExternalLink,
  Merge,
  Save,
  X,
  FileSpreadsheet,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { getAdminReports, updateAdminReport, mergeReport, getAdminToken, setAdminToken, clearAdminToken } from '../api/admin.js';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import CategoryBadge from '../components/CategoryBadge.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import AdminAuthModal from '../components/AdminAuthModal.jsx';
import { formatDate } from '../utils/formatDate.js';
import { CATEGORIES } from '../utils/categoryLabels.js';

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing Modal State
  const [activeReport, setActiveReport] = useState(null);
  const [editFormData, setEditFormData] = useState({
    status: '',
    priority: '',
    resolutionNote: '',
    resolutionEvidence: '',
    internalNote: '',
    statusNote: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Merge State
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [mergeSourceReport, setMergeSourceReport] = useState(null);
  const [mergeCanonicalId, setMergeCanonicalId] = useState('');
  const [mergeReason, setMergeReason] = useState('Duplicate resident submission for same physical defect');
  const [isMerging, setIsMerging] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      setUnauthorized(false);

      const token = getAdminToken();
      if (!token) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      const data = await getAdminReports({
        status: statusFilter,
        priority: priorityFilter,
        category: categoryFilter,
        search: searchQuery
      });

      setReports(data.reports || []);
    } catch (err) {
      console.error('Admin API error:', err);
      if (err.status === 401 || err.status === 403) {
        setUnauthorized(true);
      } else {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter, priorityFilter, categoryFilter, searchQuery]);

  // Open Edit Modal
  const handleOpenEdit = (report) => {
    setActiveReport(report);
    setEditFormData({
      status: report.status,
      priority: report.priority,
      resolutionNote: report.resolutionNote || '',
      resolutionEvidence: report.resolutionEvidence || '',
      internalNote: report.internalNote || '',
      statusNote: ''
    });
    setSaveSuccess(false);
  };

  // Submit Edit Form
  const handleSaveReportUpdates = async (e) => {
    e.preventDefault();
    if (!activeReport) return;

    try {
      setIsSaving(true);
      const res = await updateAdminReport(activeReport.id, editFormData);
      
      // Update local state
      setReports(prev =>
        prev.map(r => (r.id === activeReport.id ? { ...r, ...res.report } : r))
      );

      setSaveSuccess(true);
      setTimeout(() => {
        setActiveReport(null);
        setSaveSuccess(false);
      }, 1200);
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Open Merge Modal
  const handleOpenMerge = (report) => {
    setMergeSourceReport(report);
    setMergeCanonicalId('');
    setMergeModalOpen(true);
  };

  // Submit Merge
  const handleExecuteMerge = async (e) => {
    e.preventDefault();
    if (!mergeSourceReport || !mergeCanonicalId.trim()) return;

    try {
      setIsMerging(true);
      await mergeReport(mergeSourceReport.id, mergeCanonicalId.trim(), mergeReason);
      setMergeModalOpen(false);
      fetchReports();
      alert(`Successfully merged #${mergeSourceReport.id} into #${mergeCanonicalId}`);
    } catch (err) {
      alert(`Merge failed: ${err.message}`);
    } finally {
      setIsMerging(false);
    }
  };

  // Quick logout
  const handleLogout = () => {
    clearAdminToken();
    setUnauthorized(true);
    setReports([]);
  };

  // Export CSV Summary
  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Category', 'Neighborhood', 'Status', 'Priority', 'Confirmations', 'Created'];
    const rows = reports.map(r => [
      r.id,
      `"${r.title.replace(/"/g, '""')}"`,
      r.category,
      `"${r.neighborhood}"`,
      r.status,
      r.priority,
      r.confirmationsCount,
      r.createdAt
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fixnearme-bahirdar-reports-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Safe Access-Denied Screen
  if (unauthorized) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            Municipality Admin Access Restricted
          </h2>

          <p className="text-xs text-slate-600 leading-relaxed">
            The administrator dashboard requires a valid authorization passkey. Only authorized city liaisons and maintenance dispatchers can update reports or merge duplicates.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md transition-colors"
            >
              <Unlock className="w-4 h-4 text-emerald-400" />
              <span>Enter Municipality Admin Passkey</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            Hackathon demo passkey: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">bdu-admin-2026</code>
          </p>
        </div>

        <AdminAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {
            setIsAuthModalOpen(false);
            setUnauthorized(false);
            fetchReports();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Admin Auth Modal (when triggered via button) */}
      <AdminAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          setUnauthorized(false);
          fetchReports();
        }}
      />

      {/* Top Admin Header Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              City Administration Portal
            </span>
            <span className="text-xs text-slate-400">Bahir Dar Municipal Council</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Infrastructure Problem Triage & Dispatch
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Review resident tickets, assign field repair priority, record utility dispatch notes, verify resolution photos, and merge duplicate reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Admin</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by ID (#REP-...), title, or neighborhood..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-xs">
            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="reported">Reported</option>
              <option value="under_review">Under Review</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected / Duplicate</option>
            </select>

            {/* Priority */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="py-2 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Category */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-2 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORIES).map(([k, c]) => (
                <option key={k} value={k}>{c.shortLabel || c.label}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={fetchReports}
              className="p-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600"
              title="Refresh reports"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      {loading ? (
        <LoadingState message="Fetching administration registry..." />
      ) : error ? (
        <ErrorState
          title="Admin Query Failed"
          message={error.message}
          details={error.details || error.raw}
          onRetry={fetchReports}
        />
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
          <p className="text-sm font-semibold text-slate-700">No reports found matching admin query.</p>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('all');
              setPriorityFilter('all');
              setCategoryFilter('all');
              setSearchQuery('');
            }}
            className="mt-3 text-xs text-emerald-700 font-semibold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Title & Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Neighborhood</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4 text-center">Confirmations</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {report.id}
                      {report.isDuplicate && (
                        <span className="block text-[10px] text-amber-600 font-sans font-medium">
                          Dup &rarr; #{report.canonicalId}
                        </span>
                      )}
                    </td>

                    {/* Title */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 line-clamp-1">{report.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {report.landmark || report.description}
                      </div>
                      {report.internalNote && (
                        <div className="mt-1 text-[10px] font-mono bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200 inline-block line-clamp-1">
                          Note: {report.internalNote}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <CategoryBadge category={report.category} />
                    </td>

                    {/* Neighborhood */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-800">
                      {report.neighborhood}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={report.status} />
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={report.priority} />
                    </td>

                    {/* Confirmations */}
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {report.confirmationsCount || 1}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(report)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                        title="Triage & Edit Report"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Manage</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenMerge(report)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 font-medium transition-colors border border-amber-200"
                        title="Merge as Duplicate"
                      >
                        <Merge className="w-3 h-3" />
                        <span>Merge</span>
                      </button>

                      <Link
                        to={`/reports/${report.id}`}
                        target="_blank"
                        className="inline-flex items-center p-1 rounded text-slate-400 hover:text-slate-700"
                        title="Open public view"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Triage & Edit Report */}
      {activeReport && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-dialog-title"
            className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  Managing Report #{activeReport.id}
                </span>
                <h3 id="edit-dialog-title" className="text-lg font-bold text-white mt-1">
                  {activeReport.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeReport.neighborhood} • {activeReport.landmark || 'No landmark specified'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveReport(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveReportUpdates} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {saveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Report updated successfully! Audit history updated.</span>
                </div>
              )}

              {/* Status & Priority Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lifecycle Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full p-2 text-xs rounded-lg border border-slate-300 font-semibold"
                  >
                    <option value="reported">Reported (Pending)</option>
                    <option value="under_review">Under Review</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected / Duplicate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Triage Priority
                  </label>
                  <select
                    value={editFormData.priority}
                    onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })}
                    className="w-full p-2 text-xs rounded-lg border border-slate-300 font-semibold"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Hazard</option>
                  </select>
                </div>
              </div>

              {/* Public Status Transition Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Public Status Transition Note
                </label>
                <input
                  type="text"
                  value={editFormData.statusNote}
                  onChange={(e) => setEditFormData({ ...editFormData, statusNote: e.target.value })}
                  placeholder="e.g. Utility team dispatched to Kebele 03 for underground repair..."
                  className="w-full p-2 text-xs rounded-lg border border-slate-300"
                />
                <span className="text-[11px] text-slate-400">
                  Visible to residents on public timeline history.
                </span>
              </div>

              {/* Internal Administration Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Internal Municipality Note (Confidential)
                </label>
                <textarea
                  rows={2}
                  value={editFormData.internalNote}
                  onChange={(e) => setEditFormData({ ...editFormData, internalNote: e.target.value })}
                  placeholder="Internal notes, contractor dispatch numbers, purchase orders..."
                  className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-amber-50/30"
                />
                <span className="text-[11px] text-amber-700">
                  Protected: never exposed to resident-facing API responses.
                </span>
              </div>

              {/* Resolution Details (Visible when resolved or marking resolved) */}
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  Resolution Verification (For Resolved Status)
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Public Resolution Description Note
                  </label>
                  <textarea
                    rows={2}
                    value={editFormData.resolutionNote}
                    onChange={(e) => setEditFormData({ ...editFormData, resolutionNote: e.target.value })}
                    placeholder="Details of the repairs completed, replacement parts used, and inspection verification..."
                    className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Resolution Photographic Evidence URL
                  </label>
                  <input
                    type="url"
                    value={editFormData.resolutionEvidence}
                    onChange={(e) => setEditFormData({ ...editFormData, resolutionEvidence: e.target.value })}
                    placeholder="https://... photo link of completed repair"
                    className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveReport(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving Changes...' : 'Save & Update Ticket'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Merge Duplicate Reports */}
      {mergeModalOpen && mergeSourceReport && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="merge-dialog-title"
            className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="p-6 bg-amber-500 text-amber-950 flex items-start justify-between gap-4">
              <div>
                <h3 id="merge-dialog-title" className="text-base font-bold">
                  Merge Duplicate Report #{mergeSourceReport.id}
                </h3>
                <p className="text-xs text-amber-900 mt-0.5">
                  Consolidate duplicate report votes and link into the primary ticket.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMergeModalOpen(false)}
                className="p-1 text-amber-900 hover:text-black rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteMerge} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <div className="font-semibold text-slate-800">Source Report to be merged:</div>
                <div className="text-slate-600 font-mono">#{mergeSourceReport.id} - {mergeSourceReport.title}</div>
                <div className="text-slate-500">{mergeSourceReport.neighborhood} • {mergeSourceReport.confirmationsCount} confirmations</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Canonical Primary Report ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={mergeCanonicalId}
                  onChange={(e) => setMergeCanonicalId(e.target.value)}
                  placeholder="e.g. REP-2026-001"
                  className="w-full p-2 text-xs rounded-lg border border-slate-300 font-mono font-bold"
                />
                <span className="text-[11px] text-slate-400">
                  Target ticket that will absorb confirmation count and remain active.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Merge Reason / Notes
                </label>
                <input
                  type="text"
                  value={mergeReason}
                  onChange={(e) => setMergeReason(e.target.value)}
                  className="w-full p-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setMergeModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isMerging}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <Merge className="w-3.5 h-3.5" />
                  <span>{isMerging ? 'Merging...' : 'Confirm Merge'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
