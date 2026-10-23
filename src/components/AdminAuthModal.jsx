import React, { useState } from 'react';
import { ShieldAlert, Key, X, Check, Lock } from 'lucide-react';
import { setAdminToken } from '../api/client.js';

export default function AdminAuthModal({ isOpen, onClose, onSuccess }) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('Please enter the administrator access passkey.');
      return;
    }

    // Save token and trigger verification
    setAdminToken(passcode.trim());
    onSuccess(passcode.trim());
  };

  const handleUseDemoPasskey = () => {
    setPasscode('bdu-admin-2026');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-auth-title"
        className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden"
      >
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 id="admin-auth-title" className="text-base font-bold text-white">
                Municipality Admin Login
              </h3>
              <p className="text-xs text-slate-400">
                Authorized City Administration & Departmental Staff Only
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            The administrator portal permits status transitions, triage priority assignments, and duplicate report mergers. Passkeys are checked via HTTP Bearer token headers.
          </p>

          <div>
            <label htmlFor="admin-token" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Admin Access Token / Secret Passkey
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="admin-token"
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError('');
                }}
                placeholder="Enter admin token..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-rose-600 mt-1.5 font-medium">{error}</p>}
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600">Student Demo Passkey:</span>
            <button
              type="button"
              onClick={handleUseDemoPasskey}
              className="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 font-mono text-[11px] font-semibold text-slate-800 transition-colors"
            >
              Use "bdu-admin-2026"
            </button>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Verify & Unlock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
