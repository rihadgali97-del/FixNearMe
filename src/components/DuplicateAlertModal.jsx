import React, { useState } from 'react';
import { AlertTriangle, ThumbsUp, ArrowRight, X, ExternalLink } from 'lucide-react';
import CategoryBadge from './CategoryBadge.jsx';
import StatusBadge from './StatusBadge.jsx';
import { formatRelativeTime } from '../utils/formatDate.js';

export default function DuplicateAlertModal({
  duplicates = [],
  onConfirmExisting,
  onProceedAnyway,
  onCancel,
  isConfirming = false
}) {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="duplicate-modal-title"
        className="relative bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 bg-amber-50/80 border-b border-amber-200/80 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 id="duplicate-modal-title" className="text-base font-bold text-amber-900">
              Potential Existing Reports Found
            </h3>
            <p className="text-xs text-amber-800 mt-1">
              Residents have already reported similar problems nearby. Instead of submitting a duplicate, you can confirm an existing report to increase its urgency!
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/80"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Potential Duplicates */}
        <div className="p-6 max-h-80 overflow-y-auto space-y-3">
          {duplicates.map((dup) => (
            <div
              key={dup.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div className="space-y-1 max-w-md">
                <div className="flex items-center gap-2">
                  <CategoryBadge category={dup.category} />
                  <StatusBadge status={dup.status} />
                  <span className="text-[11px] text-slate-400 font-mono">#{dup.id}</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">
                  {dup.title}
                </h4>
                <p className="text-xs text-slate-500">
                  {dup.neighborhood} • {dup.landmark || 'No landmark specified'} • {formatRelativeTime(dup.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                <a
                  href={`/reports/${dup.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg inline-flex items-center gap-1"
                  title="Open report in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="sm:hidden">Inspect</span>
                </a>

                <button
                  type="button"
                  onClick={() => onConfirmExisting(dup.id)}
                  disabled={isConfirming}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Support (#{dup.confirmationsCount || 1})</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Checkbox Acknowledgment and Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-xs text-slate-600 leading-snug">
              I have checked the above issues and confirmed that my problem is a distinct, separate hazard.
            </span>
          </label>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200/70 rounded-lg transition-colors"
            >
              Cancel & Edit Report
            </button>

            <button
              type="button"
              onClick={onProceedAnyway}
              disabled={!acknowledged}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
            >
              <span>Submit as Distinct Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
