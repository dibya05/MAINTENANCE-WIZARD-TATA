import { useState, useEffect } from 'react';
import { ArrowLeft, Edit, AlertTriangle, CheckCircle2, ChevronRight, Activity, Thermometer, Droplet, Settings, RefreshCw } from 'lucide-react';
import { getEquipmentById } from '../services/api';

// Default static data for when no equipment is selected
const DEFAULT_EQ = {
  tag: 'P-102',
  name: 'Centrifugal Pump',
  area: 'North Plant',
  sector: 'Sector 4',
  description: 'Primary cooling loop circulation pump. Rated 150kW.',
  status: 'Critical',
  healthScore: 32,
  criticality: 'Safety-Critical',
  manufacturer: 'Grundfos',
  installedDate: '2021-10-12',
  lastMaintenance: '2023-09-01',
  sensors: {
    vibration: 14.2,
    temperature: 84.5,
    pressure: 1240,
    flowRate: 1240,
  },
};

export function EquipmentDetail({ onNavigate, selectedEquipmentId }) {
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usingDefault, setUsingDefault] = useState(false);

  useEffect(() => {
    if (!selectedEquipmentId) {
      setEquipment(DEFAULT_EQ);
      setUsingDefault(true);
      return;
    }
    setLoading(true);
    setUsingDefault(false);
    getEquipmentById(selectedEquipmentId)
      .then(data => setEquipment(data))
      .catch(() => {
        setEquipment(DEFAULT_EQ);
        setUsingDefault(true);
      })
      .finally(() => setLoading(false));
  }, [selectedEquipmentId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-text-muted text-sm">Loading equipment data…</p>
        </div>
      </div>
    );
  }

  const eq = equipment ?? DEFAULT_EQ;
  const isCritical = eq.status === 'Critical' || eq.healthScore < 50;
  const isWarning  = eq.status === 'Warning'  || (eq.healthScore >= 50 && eq.healthScore < 70);

  const statusLabel = isCritical ? 'Critical Anomaly' : isWarning ? 'Warning' : 'Healthy';
  const statusClass = isCritical
    ? 'bg-critical/15 text-critical border-critical/30'
    : isWarning
    ? 'bg-warning/15 text-warning border-warning/30'
    : 'bg-success/15 text-success border-success/30';

  const v  = eq.sensors?.vibration   ?? 14.2;
  const t  = eq.sensors?.temperature ?? 84.5;
  const fr = eq.sensors?.flowRate    ?? 1240;
  const ll = eq.sensors?.pressure    ?? 15;

  const vitals = [
    { title: 'Vibration (Axial)', value: v.toFixed(1),   unit: 'mm/s', icon: Activity,     status: v > 10 ? 'critical' : v > 7 ? 'warning' : 'success', trend: '+2.1/hr' },
    { title: 'Temperature',       value: t.toFixed(1),   unit: '°C',   icon: Thermometer,  status: t > 90 ? 'critical' : t > 75 ? 'warning' : 'success', trend: '+2.5/hr' },
    { title: 'Flow Rate',         value: fr.toLocaleString(), unit: 'L/min', icon: Settings, status: 'success', trend: '-5.0/hr' },
    { title: 'Lube Level',        value: ll.toFixed(0),  unit: '%',    icon: Droplet,      status: ll < 20 ? 'critical' : ll < 40 ? 'warning' : 'success', trend: '-2.0/day' },
  ];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-y-auto">
      {/* Header */}
      <div className="bg-surface border-b border-border-subtle p-6 md:p-8 shrink-0 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-[0.03] pointer-events-none">
          <svg width="400" height="200" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 0L350 200M0 50L400 50M100 0V200M200 0V200M300 0V200" stroke="white" strokeWidth="2" fill="none" />
          </svg>
        </div>

        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[12px] text-text-muted mb-4 uppercase tracking-wider font-semibold">
              <button onClick={() => onNavigate('explorer')} className="hover:text-primary transition-colors flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Explorer
              </button>
              <ChevronRight className="w-3 h-3" />
              <span>{eq.area}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-text-main">{eq.tag}</span>
            </div>

            {usingDefault && !selectedEquipmentId && (
              <p className="text-[11px] font-mono text-warning bg-warning/10 border border-warning/20 px-3 py-1 rounded-full mb-3 inline-block">
                Demo mode — select an equipment row from Explorer to load real data
              </p>
            )}

            <div className="flex items-end gap-4 flex-wrap">
              <h1 className="text-3xl font-bold text-text-main tracking-tight">
                {eq.name}
                <span className="font-mono text-2xl text-text-muted font-light ml-3">{eq.tag}</span>
              </h1>
              <span className={`border px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5 ${statusClass}`}>
                {isCritical && <AlertTriangle className="w-3 h-3" />}
                {!isCritical && !isWarning && <CheckCircle2 className="w-3 h-3" />}
                {statusLabel}
              </span>
            </div>

            <p className="text-[14px] text-text-muted mt-2">{eq.description || `${eq.type} — ${eq.criticality} criticality`}</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none justify-center bg-background border border-border-subtle text-text-main hover:bg-white/5 transition-colors px-4 py-2 rounded-lg text-[13px] font-semibold flex items-center gap-2">
              <Edit className="w-4 h-4" /> Edit Details
            </button>
            <button className="flex-1 md:flex-none justify-center bg-primary text-white hover:bg-primary/90 transition-colors px-4 py-2 rounded-lg text-[13px] font-semibold">
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-8 max-w-[1600px] mx-auto w-full grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* Left Column */}
        <div className="xl:col-span-8 space-y-6">
          {/* Live Telemetry Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {vitals.map(v => <MetricCard key={v.title} {...v} />)}
          </div>

          {/* Time Series Chart */}
          <div className="bg-surface border border-border-subtle rounded-xl p-6 flex flex-col min-h-[360px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[16px] font-semibold text-text-main flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> Vibration Trends
              </h3>
              <div className="flex bg-background border border-border-subtle rounded p-0.5">
                {['1H', '6H', '24H', '7D'].map((label, i) => (
                  <TimeTab key={label} label={label} active={i === 1} />
                ))}
              </div>
            </div>

            <div className="flex-1 relative border-l border-b border-border-subtle ml-10 mb-6 mt-4">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[20, 16, 12, 8, 4].map(val => (
                  <div key={val} className="w-full h-px bg-border-subtle/50 relative">
                    <span className="absolute -left-9 -top-2.5 text-[10px] text-text-muted font-mono">{val}</span>
                  </div>
                ))}
              </div>

              {/* Threshold line */}
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,80 Q10,78 20,75 T40,65 T60,50 T75,30 T90,20 L100,10" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M0,80 Q10,78 20,75 T40,65 T60,50 T75,30 T90,20 L100,10 L100,100 L0,100Z" fill="url(#lineGrad)" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="#EF4444" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
                <text x="2" y="48" fill="#EF4444" fontSize="5" opacity="0.8">LIMIT</text>
              </svg>

              {/* X Axis Labels */}
              <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[10px] text-text-muted font-mono">
                {['10:00', '11:00', '12:00', '13:00', '14:00'].map(t => <span key={t}>{t}</span>)}
              </div>
            </div>

            <div className="flex gap-6 justify-center mt-2">
              <ChartLegend color="bg-primary" label="Axial (mm/s)" />
              <ChartLegend color="bg-border-subtle" label="Radial (mm/s)" />
              <ChartLegend color="bg-critical" label="Threshold (10 mm/s)" />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="xl:col-span-4 space-y-6">
          {/* Status Panel */}
          <div className="bg-surface border border-border-subtle rounded-xl p-6">
            <h3 className="text-[16px] font-semibold text-text-main mb-4 border-b border-border-subtle pb-4">Current Status</h3>

            {/* Health Score Ring */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative w-16 h-16 shrink-0">
                <svg viewBox="0 0 36 36" className="w-16 h-16 transform -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#26344F" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15" fill="none"
                    stroke={isCritical ? '#EF4444' : isWarning ? '#F59E0B' : '#22C55E'}
                    strokeWidth="3"
                    strokeDasharray={`${(eq.healthScore / 100) * 94.2} 94.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center font-mono text-[14px] font-bold ${
                  isCritical ? 'text-critical' : isWarning ? 'text-warning' : 'text-success'
                }`}>
                  {eq.healthScore}
                </span>
              </div>
              <div>
                <div className="text-[14px] font-medium text-text-main">Overall Health Score</div>
                <div className={`text-[12px] flex items-center gap-1 mt-1 ${isCritical ? 'text-critical' : 'text-warning'}`}>
                  {(isCritical || isWarning) && <AlertTriangle className="w-3 h-3" />}
                  {isCritical ? 'Drops by 15 pts in 24h' : isWarning ? 'Declining trend' : 'Stable'}
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-[13px]">
              <DetailRow label="Asset ID"         value={eq.tag}           mono />
              <DetailRow label="Area"             value={`${eq.area}${eq.sector ? ' › ' + eq.sector : ''}`} />
              <DetailRow label="Criticality"      value={eq.criticality}   />
              <DetailRow label="Manufacturer"     value={eq.manufacturer || '—'} />
              <DetailRow label="Installed"        value={eq.installedDate ? new Date(eq.installedDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'} mono />
              <DetailRow label="Last Maintenance" value={eq.lastMaintenance ? new Date(eq.lastMaintenance).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'} mono />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-surface border border-border-subtle rounded-xl flex flex-col h-[340px]">
            <div className="p-5 border-b border-border-subtle bg-background/30 shrink-0">
              <h3 className="text-[16px] font-semibold text-text-main">Recent Activity</h3>
            </div>
            <div className="p-5 overflow-y-auto space-y-5 flex-1 relative">
              <div className="absolute left-[29px] top-5 bottom-5 w-px bg-border-subtle z-0" />
              <ActivityItem type="alert"   title="Vibration Threshold Exceeded" time="Today, 13:45" desc="Axial vibration reached 14.2 mm/s." />
              <ActivityItem type="info"    title="AI Analysis Completed"         time="Today, 14:02" desc="Likely bearing fault identified." />
              <ActivityItem type="success" title="Routine Maintenance"           time="Sep 01, 2023" desc="Lubrication topped up, visual inspection clear." />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, unit, icon: Icon, status, trend }) {
  const colors = { critical: 'text-critical border-critical/50 bg-critical/5', warning: 'text-warning border-warning/50 bg-warning/5', success: 'text-success border-success/20 bg-surface' };
  const c = colors[status] ?? colors.success;
  return (
    <div className={`${c.split(' ').slice(2).join(' ')} border ${c.split(' ')[1]} rounded-xl p-4 flex flex-col justify-between h-[120px]`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider leading-tight">{title}</span>
        <Icon className={`w-4 h-4 shrink-0 ${c.split(' ')[0]}`} />
      </div>
      <div className="flex items-end justify-between">
        <div className={`text-2xl font-bold font-mono ${c.split(' ')[0]}`}>
          {value}<span className="text-sm font-sans font-normal ml-1 opacity-60">{unit}</span>
        </div>
        <div className="text-[11px] font-mono text-text-muted bg-background px-1.5 py-0.5 rounded border border-border-subtle">{trend}</div>
      </div>
    </div>
  );
}

function TimeTab({ label, active }) {
  return (
    <button className={`px-3 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-sm transition-colors ${active ? 'bg-surface text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'}`}>
      {label}
    </button>
  );
}

function ChartLegend({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-0.5 ${color}`} />
      <span className="text-[11px] font-medium text-text-muted">{label}</span>
    </div>
  );
}

function DetailRow({ label, value, mono }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border-subtle/50 last:border-0">
      <span className="text-text-muted">{label}</span>
      <span className={`text-text-main ${mono ? 'font-mono text-[12px]' : ''}`}>{value}</span>
    </div>
  );
}

function ActivityItem({ type, title, time, desc }) {
  const configs = {
    alert:   { icon: <AlertTriangle  className="w-3 h-3 text-critical" />, ring: 'border-critical' },
    info:    { icon: <Activity       className="w-3 h-3 text-info"     />, ring: 'border-info'     },
    success: { icon: <CheckCircle2   className="w-3 h-3 text-success"  />, ring: 'border-success'  },
  };
  const { icon, ring } = configs[type] ?? configs.success;
  return (
    <div className="relative z-10 flex gap-4">
      <div className="mt-0.5 shrink-0">
        <div className={`w-6 h-6 rounded-full bg-surface border-2 flex items-center justify-center ${ring}`}>{icon}</div>
      </div>
      <div className="pb-1">
        <div className="text-[13px] font-semibold text-text-main mb-0.5">{title}</div>
        <div className="text-[11px] font-mono text-text-muted mb-1">{time}</div>
        <div className="text-[13px] text-text-muted leading-relaxed">{desc}</div>
      </div>
    </div>
  );
}
