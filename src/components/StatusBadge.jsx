import React from 'react';
import { STATUS_META } from '../utils/categoryLabels.js';

export default function StatusBadge({ status, showDescription = false, className = '' }) {
  const meta = STATUS_META[status] || {
    label: status || 'Unknown',
    color: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    dotColor: 'bg-zinc-400'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border shadow-2xs transition-colors ${meta.color} ${className}`}
      title={showDescription ? meta.description : meta.label}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dotColor}`} aria-hidden="true" />
      <span>{meta.label}</span>
    </span>
  );
}
