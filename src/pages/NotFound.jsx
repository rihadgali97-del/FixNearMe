import React from 'react';
import { Link } from 'react-router-dom';
import { MapPinOff, ArrowLeft, Home, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto py-16 px-4 text-center space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-500 shadow-xs">
        <MapPinOff className="w-8 h-8" />
      </div>

      <div className="space-y-1.5">
        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
          404 - Page Not Found
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight pt-2">
          Lost in Bahir Dar?
        </h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          The requested page or municipal report reference does not exist or may have been consolidated.
        </p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>

        <Link
          to="/reports"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
        >
          <Compass className="w-4 h-4" />
          <span>Explore Reports</span>
        </Link>
      </div>
    </div>
  );
}
