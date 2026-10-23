import React from 'react';
import { AlertCircle, RefreshCw, ServerCrash } from 'lucide-react';

export default function ErrorState({
  title = 'Failed to load data',
  message = 'An unexpected error occurred while communicating with the FixNearMe service.',
  onRetry,
  details = null
}) {
  return (
    <div
      role="alert"
      className="p-6 my-4 rounded-xl border border-rose-200 bg-rose-50/70 text-rose-950 flex flex-col items-center text-center max-w-xl mx-auto shadow-xs"
    >
      <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-3">
        <ServerCrash className="w-6 h-6" />
      </div>
      <h3 className="font-semibold text-lg text-rose-900 mb-1">{title}</h3>
      <p className="text-sm text-rose-700 mb-4 max-w-md">{message}</p>

      {details && (
        <details className="w-full text-left bg-white/80 border border-rose-200 rounded-lg p-3 text-xs font-mono text-rose-800 mb-4 overflow-x-auto">
          <summary className="cursor-pointer font-sans font-medium text-rose-900 mb-1 select-none">
            Technical Diagnostics
          </summary>
          <pre className="whitespace-pre-wrap">{typeof details === 'object' ? JSON.stringify(details, null, 2) : details}</pre>
        </details>
      )}

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-xs transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Request</span>
        </button>
      )}
    </div>
  );
}
