import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ThumbsUp, Calendar, ArrowRight, ShieldCheck, Copy } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';
import PriorityBadge from './PriorityBadge.jsx';
import CategoryBadge from './CategoryBadge.jsx';
import { formatRelativeTime } from '../utils/formatDate.js';

export default function ReportCard({ report, onConfirm, isConfirming = false }) {
  if (!report) return null;

  return (
    <article className="group bg-white rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all overflow-hidden flex flex-col justify-between">
      <div>
        {/* Optional Photo Thumbnail or Category Pattern Header */}
        {report.photoUrl ? (
          <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
            <img
              src={report.photoUrl}
              alt={report.title}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
              <CategoryBadge category={report.category} />
            </div>
            <div className="absolute top-3 right-3 z-10">
              <PriorityBadge priority={report.priority} />
            </div>
            {report.status === 'resolved' && (
              <div className="absolute bottom-3 left-3 bg-emerald-600/90 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 shadow">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Resolved & Verified</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-5 pb-0 flex items-center justify-between gap-2">
            <CategoryBadge category={report.category} />
            <PriorityBadge priority={report.priority} />
          </div>
        )}

        {/* Card Body */}
        <div className="p-5">
          {/* Duplicate / Canonical Notice */}
          {report.isDuplicate && (
            <div className="mb-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
              <Copy className="w-3.5 h-3.5" />
              <span>Merged Duplicate {report.canonicalId ? `into #${report.canonicalId}` : ''}</span>
            </div>
          )}

          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-slate-900 text-base leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
              <Link to={`/reports/${report.id}`}>
                {report.title}
              </Link>
            </h3>
          </div>

          <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
            {report.description}
          </p>

          {/* Location / Landmark */}
          <div className="flex items-start gap-1.5 text-xs text-slate-500 mb-3">
            <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
            <span className="line-clamp-1">
              <strong className="font-medium text-slate-700">{report.neighborhood}</strong>
              {report.landmark ? ` • ${report.landmark}` : ''}
            </span>
          </div>

          {/* Date & Status */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatRelativeTime(report.createdAt)}</span>
            </div>
            <StatusBadge status={report.status} />
          </div>
        </div>
      </div>

      {/* Card Footer: Confirm Button & View Details */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
          <button
            type="button"
            onClick={() => onConfirm && onConfirm(report.id)}
            disabled={isConfirming || report.status === 'resolved' || report.status === 'rejected'}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50/50 text-slate-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-95 shadow-2xs"
            title="Confirm you have seen this neighborhood problem"
          >
            <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>{report.confirmationsCount || 1} Confirmations</span>
          </button>
        </div>

        <Link
          to={`/reports/${report.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}
