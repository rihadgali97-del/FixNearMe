import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MapPin,
  PlusCircle,
  ShieldAlert,
  Compass,
  LayoutDashboard,
  Menu,
  X,
  Globe,
  Radio
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { checkApiHealth } from '../api/reports.js';

export default function Navbar() {
  const location = useLocation();
  const { language, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiOnline, setApiOnline] = useState(true);

  useEffect(() => {
    let isMounted = true;
    checkApiHealth()
      .then(() => {
        if (isMounted) setApiOnline(true);
      })
      .catch(() => {
        if (isMounted) setApiOnline(false);
      });

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: t('navDashboard'), icon: LayoutDashboard },
    { to: '/reports', label: t('navExplore'), icon: Compass },
    { to: '/admin', label: t('navAdmin'), icon: ShieldAlert }
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Civic Branding */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-950/40 group-hover:scale-105 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                    FixNearMe
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Bahir Dar
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-normal hidden sm:block">
                  Civic Resolution Platform
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Status, Language & CTA */}
          <div className="hidden md:flex items-center gap-3">
            {/* API Health indicator */}
            <div
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
                apiOnline
                  ? 'bg-emerald-950/70 border-emerald-800 text-emerald-400'
                  : 'bg-rose-950/70 border-rose-800 text-rose-300'
              }`}
              title={apiOnline ? 'Backend API connected and responding' : 'Backend connection unavailable'}
            >
              <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-400' : 'bg-rose-500 animate-pulse'}`} />
              <span className="font-mono text-[11px]">{apiOnline ? 'API LIVE' : 'API ERR'}</span>
            </div>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
              title="Toggle English / አማርኛ"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'en' ? 'አማርኛ' : 'English'}</span>
            </button>

            {/* Primary Action Button */}
            <Link
              to="/reports/new"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-950/50 hover:shadow-lg transition-all active:scale-98"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('navReportProblem')}</span>
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleLanguage}
              type="button"
              className="p-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-emerald-400"
              aria-label="Toggle language"
            >
              {language === 'en' ? 'አማ' : 'EN'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur px-4 pt-3 pb-6 space-y-3">
          <div className="flex items-center justify-between py-1 text-xs text-slate-400 border-b border-slate-800 pb-2">
            <span>Bahir Dar Institute of Technology Hackathon</span>
            <span className={`inline-flex items-center gap-1 ${apiOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
              <Radio className="w-3 h-3" />
              {apiOnline ? 'API Connected' : 'Disconnected'}
            </span>
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    active
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5 text-emerald-400" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2">
            <Link
              to="/reports/new"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              <span>{t('navReportProblem')}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
