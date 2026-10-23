import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Loading report data...', height = 'h-64' }) {
  return (
    <div className={`w-full ${height} flex flex-col items-center justify-center p-6 text-slate-500`} role="status" aria-live="polite">
      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
      <p className="text-sm font-medium text-slate-600">{message}</p>
      <span className="sr-only">Loading</span>
    </div>
  );
}
