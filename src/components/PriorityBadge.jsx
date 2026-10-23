import React from 'react';
import { PRIORITY_META } from '../utils/categoryLabels.js';

export default function PriorityBadge({ priority, className = '' }) {
  const meta = PRIORITY_META[priority] || {
    label: priority || 'Normal',
    badgeClass: 'text-slate-600 bg-slate-100 border-slate-200'
  };

  const isUrgent = priority === 'urgent';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded border ${meta.badgeClass} ${className}`}
    >
      {isUrgent && <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping inline-block" />}
      <span>{meta.label}</span>
    </span>
  );
}
