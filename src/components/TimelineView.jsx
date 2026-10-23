import React from 'react';
import { formatDate } from '../utils/formatDate.js';
import StatusBadge from './StatusBadge.jsx';
import { CheckCircle2, AlertCircle, ArrowUpRight, MessageSquare, ShieldCheck, Merge } from 'lucide-react';

export default function TimelineView({ updates = [] }) {
  if (!updates || updates.length === 0) {
    return (
      <p className="text-sm text-slate-500 italic py-4">
        No formal updates or status transitions recorded yet.
      </p>
    );
  }

  // Chronological order: newest at top or oldest at top. In civic workflows, oldest at top shows journey, or reverse. Let's show newest first with step indicators.
  const sortedUpdates = [...updates].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getActionIcon = (action) => {
    switch (action) {
      case 'resolved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'status_change':
        return <ArrowUpRight className="w-4 h-4 text-blue-600" />;
      case 'merged':
        return <Merge className="w-4 h-4 text-purple-600" />;
      case 'priority_change':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'note_added':
        return <MessageSquare className="w-4 h-4 text-slate-600" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {sortedUpdates.map((update, idx) => {
          const isLast = idx === sortedUpdates.length - 1;

          return (
            <li key={update.id || idx}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3 items-start">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 ring-4 ring-white border border-slate-200 shadow-2xs">
                    {getActionIcon(update.action)}
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-slate-500 mb-1">
                      <span className="font-semibold text-slate-800">
                        {update.author || 'Municipality Authority'}
                      </span>
                      <time dateTime={update.timestamp} className="text-slate-400 font-mono text-[11px]">
                        {formatDate(update.timestamp)}
                      </time>
                    </div>

                    {update.toStatus && (
                      <div className="mb-2 flex items-center gap-1.5 text-xs text-slate-600">
                        <span>Status transitioned to:</span>
                        <StatusBadge status={update.toStatus} />
                      </div>
                    )}

                    <div className="text-sm text-slate-700 bg-slate-50/80 p-3 rounded-lg border border-slate-200/80">
                      <p className="leading-relaxed">{update.note}</p>

                      {update.resolutionEvidence && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-emerald-800 mb-1">
                            Resolution Photographic Evidence:
                          </p>
                          <img
                            src={update.resolutionEvidence}
                            alt="Resolution Evidence"
                            className="h-36 rounded-md object-cover border border-slate-200"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
