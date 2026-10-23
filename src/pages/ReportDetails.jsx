import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  ThumbsUp,
  Share2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Copy,
  ExternalLink,
  Info
} from 'lucide-react';
import { getReportById, confirmReport, getReportUpdates } from '../api/reports.js';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import CategoryBadge from '../components/CategoryBadge.jsx';
import TimelineView from '../components/TimelineView.jsx';
import InteractiveMap from '../components/InteractiveMap.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { formatDate } from '../utils/formatDate.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function ReportDetails() {
  const { id } = useParams();
  const { t } = useLanguage();

  const [report, setReport] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmFeedback, setConfirmFeedback] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [reportRes, updatesRes] = await Promise.all([
        getReportById(id),
        getReportUpdates(id).catch(() => ({ updates: [] }))
      ]);

      setReport(reportRes.report);
      setUpdates(updatesRes.updates || reportRes.report.updates || []);
    } catch (err) {
      console.error('Failed to load report:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [id]);

  const handleConfirm = async () => {
    try {
      setIsConfirming(true);
      const res = await confirmReport(id);
      setReport(prev => ({ ...prev, confirmationsCount: res.confirmationsCount }));
      setConfirmFeedback({ type: 'success', message: res.message || 'Issue confirmed!' });
    } catch (err) {
      const msg = err.details?.message || err.message || 'Failed to confirm report';
      setConfirmFeedback({ type: 'warning', message: msg });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (loading) {
    return <LoadingState message={`Fetching issue dossier #${id}...`} />;
  }

  if (error || !report) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <ErrorState
          title={`Problem report #${id} could not be retrieved`}
          message={error?.message || 'Report does not exist or has been archived.'}
          details={error?.details || error?.raw}
          onRetry={fetchReportData}
        />
        <div className="text-center mt-6">
          <Link
            to="/reports"
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to reports directory</span>
          </Link>
        </div>
      </div>
    );
  }

  const isResolved = report.status === 'resolved';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Breadcrumb & Share Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/reports"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backToList')}</span>
        </Link>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 shadow-2xs transition-colors"
        >
          <Share2 className="w-3.5 h-3.5 text-slate-500" />
          <span>{copiedLink ? 'Link Copied!' : 'Share Issue'}</span>
        </button>
      </div>

      {/* Main Issue Header Card */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Banner if duplicate merged */}
        {report.isDuplicate && (
          <div className="bg-amber-500 text-amber-950 px-6 py-2.5 text-xs font-medium flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Copy className="w-4 h-4" />
              <span>This report was marked as a duplicate and merged into canonical report</span>
            </span>
            {report.canonicalId && (
              <Link
                to={`/reports/${report.canonicalId}`}
                className="underline font-bold flex items-center gap-1"
              >
                <span>View Primary Report #{report.canonicalId}</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-5">
          {/* Status & Priority Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge category={report.category} size="lg" />
              <StatusBadge status={report.status} showDescription />
              <PriorityBadge priority={report.priority} />
            </div>

            <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
              #{report.id}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {report.title}
          </h1>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Reported on {formatDate(report.createdAt)}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Last active: {formatDate(report.updatedAt)}</span>
            </div>
          </div>

          {/* Description */}
          <div className="text-sm sm:text-base text-slate-700 leading-relaxed space-y-2">
            <p className="whitespace-pre-line">{report.description}</p>
          </div>

          {/* Photographic Evidence if provided */}
          {report.photoUrl && (
            <div className="pt-2">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Problem Photographic Evidence
              </h3>
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-w-xl">
                <img
                  src={report.photoUrl}
                  alt={report.title}
                  className="w-full max-h-96 object-cover"
                />
              </div>
            </div>
          )}

          {/* Community Confirmations Action Box */}
          <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900">
                  {report.confirmationsCount || 1}
                </span>
                <span className="text-xs font-medium text-slate-600">
                  community confirmation{report.confirmationsCount !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Have you seen or been affected by this hazard in your Kebele?
              </p>
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isConfirming || isResolved || report.isDuplicate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>
                {isConfirming
                  ? 'Confirming...'
                  : isResolved
                  ? 'Issue Resolved'
                  : 'Confirm This Problem'}
              </span>
            </button>
          </div>

          {/* Confirmation Toast Alert */}
          {confirmFeedback && (
            <div
              role="status"
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
                confirmFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}
            >
              <Info className="w-4 h-4 shrink-0" />
              <span>{confirmFeedback.message}</span>
            </div>
          )}
        </div>
      </section>

      {/* Resolution Details Section (Only if status is resolved) */}
      {isResolved && (
        <section className="bg-emerald-50/70 border-2 border-emerald-200 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-emerald-950">Official Resolution Record</h2>
              <p className="text-xs text-emerald-700">Verified and closed by municipal authorities</p>
            </div>
          </div>

          {report.resolutionNote ? (
            <div className="bg-white p-4 rounded-xl border border-emerald-200/80 text-sm text-slate-800">
              <p className="leading-relaxed">{report.resolutionNote}</p>
            </div>
          ) : (
            <p className="text-xs text-emerald-800 italic">
              Repair operations successfully executed and approved by district inspector.
            </p>
          )}

          {report.resolutionEvidence && (
            <div className="pt-2">
              <h4 className="text-xs font-semibold text-emerald-900 mb-2">Resolution Proof Photo:</h4>
              <img
                src={report.resolutionEvidence}
                alt="Verified Resolution Proof"
                className="max-h-64 rounded-xl border border-emerald-200 object-cover shadow-xs"
              />
            </div>
          )}
        </section>
      )}

      {/* Two-Column Grid: Location Details vs Audit Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Location & Map Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-slate-900 text-base">Location & Landmarks</h2>
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <div>
              <span className="font-semibold text-slate-500 block mb-0.5">Neighborhood / Kebele:</span>
              <p className="font-bold text-slate-800 text-sm">{report.neighborhood}</p>
            </div>

            <div>
              <span className="font-semibold text-slate-500 block mb-0.5">Landmark Reference:</span>
              <p className="text-slate-800 font-medium">{report.landmark || 'No specific landmark recorded'}</p>
            </div>

            {report.latitude && report.longitude && (
              <div>
                <span className="font-semibold text-slate-500 block mb-0.5">GPS Coordinates:</span>
                <p className="font-mono text-slate-800">{report.latitude}, {report.longitude}</p>
              </div>
            )}
          </div>

          {/* Interactive Map or Location Banner */}
          {report.latitude && report.longitude ? (
            <div className="pt-2">
              <InteractiveMap
                selectedReport={report}
                height="h-56"
              />
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 italic text-center">
              No GPS coordinates were logged during submission. Maintenance dispatch will rely on the neighborhood and landmark description above.
            </div>
          )}
        </div>

        {/* Resolution History / Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-slate-900 text-base">Official Progress Timeline</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">{updates.length} event{updates.length !== 1 ? 's' : ''}</span>
          </div>

          <TimelineView updates={updates} />
        </div>

      </div>
    </div>
  );
}
