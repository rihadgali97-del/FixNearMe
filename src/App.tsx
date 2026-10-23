import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ExploreReports from './pages/ExploreReports.jsx';
import CreateReport from './pages/CreateReport.jsx';
import ReportDetails from './pages/ReportDetails.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import NotFound from './pages/NotFound.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { ShieldCheck, Heart, MapPin, PhoneCall, Building2 } from 'lucide-react';

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white antialiased">
          {/* Top Shared Navbar */}
          <Navbar />

          {/* Main Viewport Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/reports" element={<ExploreReports />} />
              <Route path="/reports/new" element={<CreateReport />} />
              <Route path="/reports/:id" element={<ReportDetails />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Civic Footer */}
          <footer className="mt-auto border-t border-slate-200 bg-white text-slate-600 text-xs py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Brand and Mission */}
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      F
                    </div>
                    <span className="font-bold text-slate-900 text-sm">FixNearMe • Bahir Dar</span>
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed max-w-md">
                    A neighborhood problem reporting and resolution-tracking web application engineered for the Bahir Dar Institute of Technology (BiT) Student Hackathon, Ethiopia.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Empowering residents across Kebele 03, Poly Campus, Shimbit, Fasilo, Gish Abay, and Belay Zeleke.
                  </p>
                </div>

                {/* Quick Navigation */}
                <div className="space-y-2">
                  <div className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                    Platform Navigation
                  </div>
                  <ul className="space-y-1.5 text-slate-500">
                    <li><Link to="/" className="hover:text-emerald-700 transition-colors">Civic Dashboard</Link></li>
                    <li><Link to="/reports" className="hover:text-emerald-700 transition-colors">Explore All Reports</Link></li>
                    <li><Link to="/reports/new" className="hover:text-emerald-700 transition-colors">Report a Problem</Link></li>
                    <li><Link to="/admin" className="hover:text-emerald-700 transition-colors">Municipality Admin Portal</Link></li>
                  </ul>
                </div>

                {/* Bahir Dar Emergency Utilities Contacts */}
                <div className="space-y-2">
                  <div className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                    Emergency Dispatch
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-500 font-mono">
                    <li className="flex items-center gap-1.5">
                      <PhoneCall className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Water Utility: 904</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <PhoneCall className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>EEU Electric: 905</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <PhoneCall className="w-3 h-3 text-rose-600 shrink-0" />
                      <span>City Police / Fire: 991</span>
                    </li>
                  </ul>
                </div>

              </div>

              {/* Bottom Copyright & Hackathon Attribution */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
                <div className="flex items-center gap-1">
                  <span>FixNearMe &copy; 2026. Built with</span>
                  <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                  <span>at Bahir Dar Institute of Technology.</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono">Demo Admin: bdu-admin-2026</span>
                  <span>•</span>
                  <span>Open Civic Tech</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}
