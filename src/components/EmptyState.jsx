import React from 'react';
import { Link } from 'react-router-dom';
import { Inbox, PlusCircle, RotateCcw } from 'lucide-react';

export default function EmptyState({
  title = 'No reports found',
  description = 'There are currently no problem reports matching your criteria.',
  actionLabel = 'Submit a Report',
  actionLink = '/reports/new',
  onReset = null
}) {
  return (
    <div className="py-12 px-4 text-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 flex flex-col items-center justify-center my-6">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        <Inbox className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}

        {actionLink && (
          <Link
            to={actionLink}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{actionLabel}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
