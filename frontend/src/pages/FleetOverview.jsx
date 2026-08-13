import { useState, useEffect } from 'react';
import { ArrowDownRight, ArrowRight, CheckCircle2, History, AlertTriangle, MonitorPlay, RefreshCw } from 'lucide-react';
import { getFleetStats } from '../services/api';
import { actionRequiredAlerts, equipmentList } from '../data';

// Static fallback stats if backend has no data yet
const FALLBACK_STATS = {
  total: 1248,
  avgHealth: 84,
  openAlerts: 12,
  stale: 4,
  distribution: { healthy: 748, watch: 250, warning: 190, critical: 60 },
  actionRequired: actionRequiredAlerts,
};

export function FleetOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeAreaFilter, setActiveAreaFilter] = useState('All');
  const [activeCritFilter, setActiveCritFilter] = useState('All');

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFleetStats();
      // If DB is empty use fallback distribution, else use real data
      if (data.total === 0) {
        setStats({ ...FALLBACK_STATS });
      } else {
        setStats(data);
      }
    } catch (err) {
      // Backend not available — use static fallback gracefully
      setStats(FALLBACK_STATS);
      setError('Using cached data — backend offline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const dist = stats?.distribution ?? FALLBACK_STATS.distribution;
  const grand = dist.healthy + dist.watch + dist.warning + dist.critical;

  // Donut chart segments
  const R = 40, C = 2 * Math.PI * R;
  const segments = [
    { color: '#22C55E', value: dist.healthy, label: 'Healthy' },
    { color: '#06B6D4', value: dist.watch,   label: 'Watch'   },
    { color: '#F59E0B', value: dist.warning, label: 'Warning' },
    { color: '#EF4444', value: dist.critical,label: 'Critical'},
  ];
  let offset = 0;
  const arcs = segments.map(s => {
    const dash = grand > 0 ? (s.value / grand) * C : 0;
    const arc = { ...s, dash, gap: C - dash, offset };
    offset += dash;
    return arc;
  });

  const alertRows = stats?.actionRequired ?? FALLBACK_STATS.actionRequired;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {error && (
            <span className="text-[11px] font-mono text-warning bg-warning/10 border border-warning/20 px-2 py-1 rounded-full">
              ⚠ {error}
            </span>
          )}
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-1.5 text-[12px] text-text-muted hover:text-primary transition-colors font-mono disabled:opacity-40"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          title="Total Equipment"
          value={loading ? '—' : (stats?.total ?? FALLBACK_STATS.total).toLocaleString()}
          icon={MonitorPlay}
          trend={null}
        />
        <KPICard
          title="Avg Health Score"
          value={loading ? '—' : `${stats?.avgHealth ?? FALLBACK_STATS.avgHealth}%`}
          icon={CheckCircle2}
          trend={{ value: '+2%', positive: true }}
        />
        <KPICard
          title="Open Alerts"
          value={loading ? '—' : (stats?.openAlerts ?? FALLBACK_STATS.openAlerts).toString()}
          icon={AlertTriangle}
          trend={{ value: '+4', positive: false }}
          alert
        />
        <KPICard
          title="Stale Data"
          value={loading ? '—' : (stats?.stale ?? FALLBACK_STATS.stale).toString()}
          icon={History}
          trend={{ value: '-2', positive: true }}
          warning
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Donut Chart */}
        <div className="bg-surface border border-border-subtle rounded-xl p-6 lg:col-span-8 flex flex-col">
          <h3 className="text-[18px] font-semibold text-text-main mb-6">Health Status Distribution</h3>

          <div className="flex-1 flex flex-col md:flex-row items-center gap-8">
            {/* SVG Donut */}
            <div className="relative flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-56 h-56 transform -rotate-90">
                {/* Track */}
                <circle cx="50" cy="50" r={R} fill="none" stroke="#26344F" strokeWidth="12" />
                {/* Segments */}
                {!loading && arcs.map((arc, i) => (
                  <circle
                    key={i}
                    cx="50" cy="50" r={R}
                    fill="none"
                    stroke={arc.color}
                    strokeWidth="12"
                    strokeDasharray={`${arc.dash} ${arc.gap}`}
                    strokeDashoffset={-arc.offset}
                    className="transition-all duration-700"
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-mono text-2xl font-bold text-text-main">
                  {loading ? '…' : (stats?.total ?? FALLBACK_STATS.total).toLocaleString()}
                </span>
                <span className="text-xs text-text-muted uppercase tracking-wider mt-1">Assets</span>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 flex-1">
              {segments.map((s) => {
                const pct = grand > 0 ? Math.round((s.value / grand) * 100) : 0;
                return (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <div>
                      <div className="text-sm font-medium text-text-main">
                        {loading ? '—' : s.value.toLocaleString()}
                        <span className="text-text-muted font-normal text-xs ml-1">({pct}%)</span>
                      </div>
                      <div className="text-xs text-text-muted">{s.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="bg-surface border border-border-subtle rounded-xl p-6 lg:col-span-4 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[18px] font-semibold text-text-main">Filters</h3>
            <button
              onClick={() => { setActiveAreaFilter('All'); setActiveCritFilter('All'); }}
              className="text-primary text-sm hover:underline"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-3">Area</label>
              <div className="flex flex-wrap gap-2">
                {['All', 'North Plant', 'South Sector', 'East Wing'].map(a => (
                  <FilterChip
                    key={a}
                    label={a}
                    active={activeAreaFilter === a}
                    onClick={() => setActiveAreaFilter(a)}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-3">Criticality</label>
              <div className="flex flex-wrap gap-2">
                {['All', 'Critical', 'Warning', 'Watch'].map(c => (
                  <FilterChip
                    key={c}
                    label={c}
                    active={activeCritFilter === c}
                    color={c === 'Critical' ? 'critical' : c === 'Warning' ? 'warning' : undefined}
                    onClick={() => setActiveCritFilter(c)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Required Table */}
      <div className="bg-surface border border-border-subtle rounded-xl flex flex-col overflow-hidden">
        <div className="p-5 border-b border-border-subtle flex justify-between items-center bg-background/50">
          <h3 className="text-[18px] font-semibold text-text-main">
            Action Required
            {alertRows.length > 0 && (
              <span className="ml-2 text-[12px] font-mono text-critical bg-critical/10 px-2 py-0.5 rounded-full border border-critical/20">
                {alertRows.length}
              </span>
            )}
          </h3>
          <button className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/30 border-b border-border-subtle">
                {['Tag No', 'Equipment Name', 'Area', 'Status', 'Score', 'Last Updated', 'Trend'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider ${i === 6 ? 'text-right' : ''}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-text-muted text-sm">
                    <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                    Loading alerts…
                  </td>
                </tr>
              ) : alertRows.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-success text-sm">
                    <CheckCircle2 className="w-4 h-4 inline mr-2" />
                    No action required — all systems nominal
                  </td>
                </tr>
              ) : (
                alertRows.map((alert, i) => {
                  const isCrit = alert.status === 'Critical';
                  const score = alert.healthScore ?? alert.score;
                  const updated = alert.updatedAt
                    ? new Date(alert.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    : alert.lastUpdated;
                  return (
                    <tr
                      key={alert._id ?? alert.id ?? i}
                      className="hover:bg-white/5 transition-colors cursor-pointer group h-12"
                    >
                      <td className="px-5 font-mono text-[13px] text-text-main group-hover:text-primary">{alert.tag}</td>
                      <td className="px-5 text-[14px] text-text-muted">{alert.name}</td>
                      <td className="px-5 text-[14px] text-text-muted">{alert.area}</td>
                      <td className="px-5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          isCrit ? 'bg-critical/15 text-critical border border-critical/30' : 'bg-warning/15 text-warning border border-warning/30'
                        }`}>
                          {alert.status}
                        </span>
                      </td>
                      <td className="px-5">
                        <div className={`inline-flex px-2 py-0.5 rounded-full bg-background border border-border-subtle font-mono text-[12px] ${isCrit ? 'text-critical' : 'text-warning'}`}>
                          {score}
                        </div>
                      </td>
                      <td className="px-5 text-[13px] text-text-muted">{updated}</td>
                      <td className="px-5 text-right">
                        {isCrit
                          ? <ArrowDownRight className="w-4 h-4 text-critical inline-block" />
                          : <ArrowRight className="w-4 h-4 text-warning inline-block" />}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, trend, alert, warning }) {
  let valueColor = 'text-text-main';
  if (alert) valueColor = 'text-critical';
  if (warning) valueColor = 'text-warning';

  return (
    <div className={`bg-surface border rounded-xl p-5 flex flex-col justify-between h-[120px] transition-all ${
      alert ? 'border-critical/50 shadow-sm shadow-critical/10' : 'border-border-subtle hover:border-primary/40'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{title}</span>
        <Icon className={`w-5 h-5 ${alert ? 'text-critical' : warning ? 'text-warning' : 'text-text-muted'}`} />
      </div>
      <div className="flex items-baseline gap-3">
        <div className={`text-3xl font-bold font-mono tracking-tight ${valueColor}`}>{value}</div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono ${
            trend.positive ? 'bg-success/15 text-success' : 'bg-critical/15 text-critical'
          }`}>
            {trend.value}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({ label, active, color, onClick }) {
  let classes = 'px-3 py-1.5 rounded-full text-[12px] font-medium border cursor-pointer transition-all ';
  if (active) {
    if (color === 'critical') classes += 'bg-critical/20 border-critical text-critical';
    else if (color === 'warning') classes += 'bg-warning/20 border-warning text-warning';
    else classes += 'bg-primary/20 border-primary text-primary';
  } else {
    classes += 'bg-background border-border-subtle text-text-muted hover:border-primary/50 hover:text-text-main';
  }
  return <button className={classes} onClick={onClick}>{label}</button>;
}
