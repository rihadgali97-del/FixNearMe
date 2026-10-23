import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Clock,
  Wrench,
  CheckCircle2,
  PlusCircle,
  Compass,
  ArrowRight,
  TrendingUp,
  MapPin,
  Flame,
  ShieldCheck,
  Building
} from 'lucide-react';
import { getDashboardStats } from '../api/reports.js';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ReportCard from '../components/ReportCard.jsx';
import { CATEGORIES } from '../utils/categoryLabels.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Dashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingState message="Loading city infrastructure health metrics..." />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ErrorState
          title="Could not connect to FixNearMe API"
          message={error.message || 'Unable to retrieve civic dashboard statistics.'}
          details={error.details || error.raw}
          onRetry={fetchStats}
        />
      </div>
    );
  }

  const statCards = [
    {
      label: t('statsTotal'),
      value: stats?.totalReports || 0,
      icon: TrendingUp,
      color: 'border-slate-200 bg-white text-slate-900',
      iconBg: 'bg-slate-100 text-slate-700',
      description: 'Logged civic issues'
    },
    {
      label: t('statsUnresolved'),
      value: stats?.unresolvedReports || 0,
      icon: Clock,
      color: 'border-sky-200 bg-sky-50/50 text-sky-900',
      iconBg: 'bg-sky-100 text-sky-700',
      description: 'Reported & queued for action'
    },
    {
      label: t('statsInProgress'),
      value: stats?.inProgressReports || 0,
      icon: Wrench,
      color: 'border-amber-200 bg-amber-50/50 text-amber-900',
      iconBg: 'bg-amber-100 text-amber-700',
      description: 'Utility crews on site'
    },
    {
      label: t('statsResolved'),
      value: stats?.resolvedReports || 0,
      icon: CheckCircle2,
      color: 'border-emerald-200 bg-emerald-50/50 text-emerald-900',
      iconBg: 'bg-emerald-100 text-emerald-700',
      description: 'Fixed and verified by city'
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Civic Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white shadow-xl p-6 sm:p-10 border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold tracking-wide">
            <Building className="w-3.5 h-3.5" />
            <span>Bahir Dar Institute of Technology (BiT) Civic Initiative</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Empowering Bahir Dar Residents to Report & Resolve Neighborhood Hazards
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Spot a pothole, leaking water main, dark streetlight, or uncollected trash? Report it in seconds. Track municipal responses from initial triage to verified resolution.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/reports/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold shadow-lg shadow-emerald-950/60 transition-all hover:scale-102 active:scale-98"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('navReportProblem')}</span>
            </Link>

            <Link
              to="/reports"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-sm font-semibold backdrop-blur-xs transition-colors"
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>{t('navExplore')}</span>
            </Link>
          </div>
        </div>

        {/* Decorative Watermark Grid */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none hidden lg:flex items-center justify-center">
          <MapPin className="w-80 h-80 text-emerald-300" />
        </div>
      </section>

      {/* KPI Stats Derived From Real API Data */}
      <section aria-labelledby="stats-heading">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 id="stats-heading" className="text-lg font-bold text-slate-900">
              City Infrastructure Overview
            </h2>
            <p className="text-xs text-slate-500">Live operational counts from municipal database</p>
          </div>
          {stats?.urgentReports > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span>{stats.urgentReports} Urgent Hazard{stats.urgentReports > 1 ? 's' : ''} Flagged</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`p-5 rounded-xl border shadow-xs transition-all hover:shadow-md ${card.color}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500">{card.label}</span>
                  <div className={`p-2 rounded-lg ${card.iconBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black tracking-tight">{card.value}</div>
                <p className="text-[11px] text-slate-500 mt-1">{card.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Category Breakdown & Neighborhood Highlights */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories Distribution */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Reports by Public Infrastructure Category</h3>
              <p className="text-xs text-slate-500">Breakdown across municipal service domains</p>
            </div>
            <Link to="/reports" className="text-xs font-semibold text-emerald-700 hover:underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(CATEGORIES).map(([key, cat]) => {
              const count = stats?.categoryCounts?.[key] || 0;
              return (
                <Link
                  key={key}
                  to={`/reports?category=${key}`}
                  className="p-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform" />
                    <div>
                      <div className="text-xs font-semibold text-slate-800 group-hover:text-emerald-800">
                        {cat.label}
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        {cat.amharicLabel}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700 px-2 py-0.5 rounded bg-slate-100 group-hover:bg-emerald-100 group-hover:text-emerald-800">
                    {count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Neighborhood Highlights */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Active Neighborhoods</h3>
            <p className="text-xs text-slate-500 mb-4">Bahir Dar sub-city and Kebele reports</p>

            <div className="space-y-2.5">
              {stats?.neighborhoodCounts && Object.keys(stats.neighborhoodCounts).length > 0 ? (
                Object.entries(stats.neighborhoodCounts).slice(0, 5).map(([neighbor, cnt]) => (
                  <Link
                    key={neighbor}
                    to={`/reports?neighborhood=${encodeURIComponent(neighbor)}`}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 hover:text-emerald-700 transition-colors"
                  >
                    <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {neighbor}
                    </span>
                    <span className="font-mono text-slate-500 font-semibold">{cnt} reports</span>
                  </Link>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No neighborhood data yet.</p>
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <Link
              to="/reports"
              className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              <span>Explore all areas on map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Recently Reported Issues Section */}
      <section aria-labelledby="recent-heading">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 id="recent-heading" className="text-lg font-bold text-slate-900">
              Recently Reported Community Issues
            </h2>
            <p className="text-xs text-slate-500">Latest problems flagged by Bahir Dar residents</p>
          </div>

          <Link
            to="/reports"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            <span>Browse All Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats?.recentReports && stats.recentReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {stats.recentReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No problem reports recorded"
            description="Be the first resident to report a neighborhood issue in your Kebele."
            actionLabel="Report First Problem"
            actionLink="/reports/new"
          />
        )}
      </section>

      {/* How It Works Civic Journey Guide */}
      <section className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8">
        <h3 className="text-base font-bold text-slate-900 mb-1 text-center">
          How FixNearMe Works in Bahir Dar
        </h3>
        <p className="text-xs text-slate-500 text-center max-w-md mx-auto mb-6">
          A transparent bridge connecting community residents with municipal maintenance crews.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center mx-auto text-sm">
              1
            </div>
            <h4 className="font-semibold text-sm text-slate-800">Spot & Report</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Capture a photo, pick your Kebele and landmark. Automated duplicate check ensures problems are not repeated.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center mx-auto text-sm">
              2
            </div>
            <h4 className="font-semibold text-sm text-slate-800">Community Confirmation</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Neighbors confirm the problem. Higher confirmation counts automatically elevate priority in the municipal queue.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center mx-auto text-sm">
              3
            </div>
            <h4 className="font-semibold text-sm text-slate-800">Triage & Verification</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              City administrators review reports, dispatch utility teams, and upload resolution notes and photographic evidence.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
