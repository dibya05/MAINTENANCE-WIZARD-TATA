import { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Wrench,
  ArrowRight,
  CheckCircle2,
  MapPin,
  BarChart3,
  Filter,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  Activity,
  Flame,
} from 'lucide-react';

// ─── Static Data ─────────────────────────────────────────────────────────────
const zones = [
  { id: 'A', name: 'Zone A – North Plant'   },
  { id: 'B', name: 'Zone B – South Sector'  },
  { id: 'C', name: 'Zone C – East Wing'     },
  { id: 'D', name: 'Zone D – West Corridor' },
  { id: 'E', name: 'Zone E – Central Hub'   },
];

const criticalityLevels = [
  { id: 'safety',  label: 'Safety-Critical', color: '#EF4444', bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.4)',  icon: ShieldAlert },
  { id: 'high',    label: 'High',            color: '#F97316', bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.4)', icon: AlertTriangle },
  { id: 'medium',  label: 'Medium',          color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', icon: Zap },
  { id: 'low',     label: 'Low',             color: '#22C55E', bg: 'rgba(34,197,94,0.15)',  border: 'rgba(34,197,94,0.4)',  icon: ShieldCheck },
];

const equipmentMatrix = {
  A: { safety: 4, high: 7, medium: 12, low: 9 },
  B: { safety: 2, high: 5, medium: 8,  low: 14 },
  C: { safety: 6, high: 9, medium: 6,  low: 5 },
  D: { safety: 1, high: 3, medium: 11, low: 18 },
  E: { safety: 5, high: 8, medium: 10, low: 7 },
};

const detailedEquipment = [
  { id: 1,  tag: 'PMP-104A',  name: 'Boiler Feed Water Pump',       zone: 'A', type: 'Pump',       criticality: 'safety', health: 32, issue: 'Cavitation detected, bearing vibration > 12 mm/s' },
  { id: 2,  tag: 'HX-302',    name: 'Primary Heat Exchanger',       zone: 'A', type: 'Heat Ex.',   criticality: 'high',   health: 68, issue: 'Fouling index 78%, heat transfer efficiency -22%' },
  { id: 3,  tag: 'VLV-101',   name: 'Main Steam Control Valve',     zone: 'A', type: 'Valve',      criticality: 'safety', health: 41, issue: 'Actuator hysteresis ±8%, seat erosion detected' },
  { id: 4,  tag: 'MTR-220A',  name: 'Cooling Tower Fan Motor',      zone: 'A', type: 'Motor',      criticality: 'medium', health: 74, issue: 'Winding insulation resistance declining' },
  { id: 5,  tag: 'COMP-820',  name: 'Main Air Compressor',          zone: 'B', type: 'Compressor', criticality: 'safety', health: 45, issue: 'Discharge pressure fluctuating ±15 PSI, valve leakage' },
  { id: 6,  tag: 'PMP-205B',  name: 'Condensate Return Pump',       zone: 'B', type: 'Pump',       criticality: 'high',   health: 55, issue: 'NPSH margin reduced, vibration trending up' },
  { id: 7,  tag: 'HX-410',    name: 'Lube Oil Cooler',              zone: 'B', type: 'Heat Ex.',   criticality: 'medium', health: 80, issue: 'Tube plugging 8%, ΔT deviation 3°C' },
  { id: 8,  tag: 'TURB-001',  name: 'Steam Turbine Generator',      zone: 'C', type: 'Turbine',    criticality: 'safety', health: 29, issue: 'Rotor imbalance 18 g, blade erosion stage 4-6' },
  { id: 9,  tag: 'COMP-310',  name: 'Hydrogen Recycle Compressor',  zone: 'C', type: 'Compressor', criticality: 'safety', health: 38, issue: 'Rod drop 0.9 mm, piston ring wear elevated' },
  { id: 10, tag: 'VLV-950',   name: 'Pressure Relief Valve PRV-1',  zone: 'C', type: 'Valve',      criticality: 'safety', health: 52, issue: 'Set pressure drift, last tested 18 months ago' },
  { id: 11, tag: 'MTR-445C',  name: 'Agitator Drive Motor',         zone: 'C', type: 'Motor',      criticality: 'high',   health: 61, issue: 'Stator temperature T3 > 115°C at load' },
  { id: 12, tag: 'PMP-712D',  name: 'Chemical Dosing Pump',         zone: 'D', type: 'Pump',       criticality: 'medium', health: 88, issue: 'Diaphragm wear indicator at 65% life' },
  { id: 13, tag: 'FAN-888D',  name: 'Induced Draft Fan',            zone: 'D', type: 'Fan',        criticality: 'high',   health: 57, issue: 'Blade erosion on 3 blades, unbalance rising' },
  { id: 14, tag: 'HX-618E',   name: 'Reactor Feed/Effluent HX',    zone: 'E', type: 'Heat Ex.',   criticality: 'safety', health: 36, issue: 'Inter-stream leakage suspected, ΔP elevated 40%' },
  { id: 15, tag: 'PUMP-920E', name: 'High-Pressure Charge Pump',    zone: 'E', type: 'Pump',       criticality: 'safety', health: 44, issue: 'Mechanical seal flush flow low, leakoff rate high' },
  { id: 16, tag: 'MTR-111E',  name: 'Compressor Drive Motor 2',     zone: 'E', type: 'Motor',      criticality: 'high',   health: 63, issue: 'Bearing temperatures rising 2°C/week trend' },
];

const solutionsLibrary = {
  safety: {
    title: 'Safety-Critical Equipment',
    color: '#EF4444',
    icon: ShieldAlert,
    urgency: 'Immediate Action Required',
    urgencyColor: '#EF4444',
    protocol: [
      { step: 1, action: 'Isolate & Lock-Out/Tag-Out (LOTO)', detail: 'Implement full LOTO procedure per OSHA 29 CFR 1910.147 before any intervention. Notify control room and area supervisor.', time: '0–30 min' },
      { step: 2, action: 'Risk Assessment & Permit-to-Work', detail: 'Conduct formal Hazard & Effects Management Process (HEMP). Issue PTW with JSA sign-off from authorized person.', time: '30–60 min' },
      { step: 3, action: 'Deploy Certified Maintenance Team', detail: 'Assign certified technicians with correct PPE. Ensure standby fire & rescue if handling flammable/toxic service.', time: '1–2 hrs' },
      { step: 4, action: 'Root Cause Analysis (RCA)', detail: 'Use Fault Tree Analysis or Fishbone method. Document all findings in CMMS. Prevent recurrence with corrective actions.', time: '24–72 hrs' },
      { step: 5, action: 'Return-to-Service Testing', detail: 'Conduct full functional test, pressure test, and sign-off by reliability engineer before restart.', time: 'After repair' },
    ],
    kpis: ['MTTR < 4 hrs', 'Zero injury target', 'Inspect: Monthly'],
    tools: ['Vibration Analyzer', 'Thermal Camera', 'Ultrasonic Leak Detector', 'Borescope'],
  },
  high: {
    title: 'High Criticality Equipment',
    color: '#F97316',
    icon: AlertTriangle,
    urgency: 'Urgent – Schedule Within 48 hrs',
    urgencyColor: '#F97316',
    protocol: [
      { step: 1, action: 'Condition Monitoring Deep-Dive', detail: 'Perform detailed vibration spectrum, oil analysis, and thermography. Compare against baseline trending data.', time: '0–4 hrs' },
      { step: 2, action: 'Short-Term Load Mitigation', detail: 'Reduce load to 70–80%, switch to standby equipment if available. Increase monitoring to every 2 hrs.', time: '4–8 hrs' },
      { step: 3, action: 'Plan Maintenance Window', detail: 'Coordinate with production planning for earliest shutdown. Procure spare parts or expedite order from warehouse.', time: '24–48 hrs' },
      { step: 4, action: 'Corrective Maintenance Execution', detail: 'Execute repairs with full CMMS documentation. Update PM schedule based on findings to prevent recurrence.', time: '48 hrs+' },
    ],
    kpis: ['MTTR < 8 hrs', 'OEE impact < 2%', 'Inspect: Bi-Weekly'],
    tools: ['Vibration Meter', 'Infrared Thermometer', 'Oil Analysis Kit', 'Alignment Tools'],
  },
  medium: {
    title: 'Medium Criticality Equipment',
    color: '#F59E0B',
    icon: Zap,
    urgency: 'Plan Within 2 Weeks',
    urgencyColor: '#F59E0B',
    protocol: [
      { step: 1, action: 'Schedule Predictive Inspection', detail: 'Add to next planned inspection round. Review trend data and set alert thresholds in condition monitoring system.', time: 'Next PM cycle' },
      { step: 2, action: 'Lubrication & Basic Care', detail: 'Verify lubrication schedule adherence. Check for leaks, unusual noise, abnormal temperatures. Tighten loose fasteners.', time: '2–4 hrs' },
      { step: 3, action: 'Planned Repair During Outage', detail: 'Schedule repair during next planned maintenance window. Order long-lead items proactively to minimize downtime.', time: '1–2 weeks' },
    ],
    kpis: ['MTTR < 24 hrs', 'PM compliance > 90%', 'Inspect: Monthly'],
    tools: ['Ultrasonic Stethoscope', 'Lubrication Cart', 'Torque Wrench', 'Digital Multimeter'],
  },
  low: {
    title: 'Low Criticality Equipment',
    color: '#22C55E',
    icon: ShieldCheck,
    urgency: 'Routine – Next Scheduled PM',
    urgencyColor: '#22C55E',
    protocol: [
      { step: 1, action: 'Routine Preventive Maintenance', detail: 'Follow standard PM checklist. Clean, lubricate, and inspect per manufacturer recommendations and history.', time: 'Scheduled PM' },
      { step: 2, action: 'Operator-Based Care (OBC)', detail: 'Train operators on daily walk-arounds, autonomous maintenance checks, and abnormality reporting procedures.', time: 'Daily/Weekly' },
      { step: 3, action: 'Update Equipment History', detail: 'Log all work orders, parts used, and findings in CMMS for future reliability analysis and planning.', time: 'After each job' },
    ],
    kpis: ['PM compliance > 95%', 'No unplanned failures', 'Inspect: Quarterly'],
    tools: ['Hand Tools', 'Grease Gun', 'Inspection Torch', 'Cleaning Kit'],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getTotalByZone(id) {
  const m = equipmentMatrix[id];
  return m.safety + m.high + m.medium + m.low;
}

function getRiskScore(id) {
  const m = equipmentMatrix[id];
  return ((m.safety * 10 + m.high * 6 + m.medium * 3 + m.low * 1) / getTotalByZone(id)).toFixed(1);
}

function getRiskLabel(score) {
  if (score >= 7) return { label: 'CRITICAL', color: '#EF4444' };
  if (score >= 5) return { label: 'HIGH',     color: '#F97316' };
  if (score >= 3) return { label: 'MEDIUM',   color: '#F59E0B' };
  return                 { label: 'LOW',      color: '#22C55E' };
}

function getCritInfo(id) {
  return criticalityLevels.find(c => c.id === id);
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function ZoneHeatCard({ zone, isSelected, onClick }) {
  const matrix = equipmentMatrix[zone.id];
  const total  = getTotalByZone(zone.id);
  const score  = parseFloat(getRiskScore(zone.id));
  const risk   = getRiskLabel(score);
  const maxVal = Math.max(matrix.safety, matrix.high, matrix.medium, matrix.low);

  return (
    <div
      onClick={onClick}
      style={isSelected ? { borderColor: '#3B82F6', boxShadow: '0 0 20px rgba(59,130,246,0.25)' } : {}}
      className={`bg-surface rounded-xl p-5 border cursor-pointer transition-all duration-200 group
        ${isSelected ? 'border-primary' : 'border-border-subtle hover:border-primary/40'}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <MapPin className="w-3 h-3 text-text-muted" />
            <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider">Zone {zone.id}</span>
          </div>
          <h3 className="text-[13px] font-semibold text-text-main leading-snug">{zone.name.split('–')[1]?.trim()}</h3>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-mono uppercase tracking-wider font-bold" style={{ color: risk.color }}>{risk.label}</div>
          <div className="text-[22px] font-bold font-mono text-text-main">{score}</div>
          <div className="text-[10px] text-text-muted">risk score</div>
        </div>
      </div>

      <div className="space-y-1.5">
        {criticalityLevels.map(cl => {
          const val = matrix[cl.id];
          const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
          return (
            <div key={cl.id} className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-text-muted w-12 shrink-0 truncate">{cl.label.split('-')[0]}</span>
              <div className="flex-1 bg-background rounded-full h-1.5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: cl.color }} />
              </div>
              <span className="text-[11px] font-mono w-4 text-right" style={{ color: cl.color }}>{val}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-border-subtle flex justify-between items-center">
        <span className="text-[11px] text-text-muted">{total} total assets</span>
        <ArrowRight className={`w-4 h-4 transition-colors ${isSelected ? 'text-primary' : 'text-text-muted group-hover:text-primary'}`} />
      </div>
    </div>
  );
}

function CriticalityBadge({ level }) {
  const info = getCritInfo(level);
  if (!info) return null;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border"
      style={{ background: info.bg, color: info.color, borderColor: info.border }}
    >
      <info.icon className="w-3 h-3" />
      {info.label}
    </span>
  );
}

function EquipmentRow({ eq }) {
  const healthColor = eq.health < 40 ? '#EF4444' : eq.health < 65 ? '#F59E0B' : '#22C55E';
  return (
    <tr className="border-b border-border-subtle hover:bg-white/5 transition-colors">
      <td className="px-4 py-3 font-mono text-[12px] text-text-main">{eq.tag}</td>
      <td className="px-4 py-3 text-[13px] text-text-muted">{eq.name}</td>
      <td className="px-4 py-3 text-[12px] text-text-muted">{eq.type}</td>
      <td className="px-4 py-3"><CriticalityBadge level={eq.criticality} /></td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-16 bg-background rounded-full h-1.5 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${eq.health}%`, backgroundColor: healthColor }} />
          </div>
          <span className="text-[12px] font-mono" style={{ color: healthColor }}>{eq.health}%</span>
        </div>
      </td>
      <td className="px-4 py-3 text-[11px] text-text-muted max-w-xs">{eq.issue}</td>
    </tr>
  );
}

function SolutionStep({ step, action, detail, time }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border-subtle rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
      >
        <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
          <span className="text-[11px] font-bold text-primary">{step}</span>
        </div>
        <span className="flex-1 text-[13px] font-semibold text-text-main">{action}</span>
        <span className="text-[11px] font-mono text-text-muted mr-2">{time}</span>
        {open ? <ChevronUp className="w-4 h-4 text-text-muted shrink-0" /> : <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 text-[13px] text-text-muted leading-relaxed border-t border-border-subtle bg-background/30">
          {detail}
        </div>
      )}
    </div>
  );
}

function SolutionPanel({ level }) {
  const sol = solutionsLibrary[level];
  const Icon = sol.icon;
  return (
    <div className="bg-surface border border-border-subtle rounded-xl overflow-hidden">
      <div
        className="px-6 py-4 border-b border-border-subtle flex items-center gap-3"
        style={{ background: `linear-gradient(90deg, ${sol.color}18 0%, transparent 100%)` }}
      >
        <div className="p-2 rounded-lg" style={{ background: `${sol.color}20`, border: `1px solid ${sol.color}40` }}>
          <Icon className="w-5 h-5" style={{ color: sol.color }} />
        </div>
        <div>
          <h4 className="text-[15px] font-bold text-text-main">{sol.title}</h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: sol.urgencyColor }} />
            <span className="text-[12px] font-semibold" style={{ color: sol.urgencyColor }}>{sol.urgency}</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h5 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
            <Wrench className="w-3.5 h-3.5" /> Response Protocol
          </h5>
          <div className="space-y-2">
            {sol.protocol.map(p => <SolutionStep key={p.step} {...p} />)}
          </div>
        </div>

        <div>
          <h5 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5" /> Target KPIs
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {sol.kpis.map((kpi, i) => (
              <div key={i} className="bg-background border border-border-subtle rounded-lg px-3 py-2 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: sol.color }} />
                <span className="text-[12px] text-text-muted">{kpi}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h5 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" /> Required Tools
          </h5>
          <div className="flex flex-wrap gap-2">
            {sol.tools.map((tool, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-background border border-border-subtle text-[12px] text-text-muted">
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export function EquipmentAnalysis() {
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedCrit, setSelectedCrit] = useState('safety');
  const [filterZone, setFilterZone] = useState('all');

  const filteredEquipment = detailedEquipment.filter(eq =>
    filterZone === 'all' || eq.zone === filterZone
  );

  const totalSafety = Object.values(equipmentMatrix).reduce((s, m) => s + m.safety, 0);
  const totalHigh   = Object.values(equipmentMatrix).reduce((s, m) => s + m.high,   0);
  const totalMedium = Object.values(equipmentMatrix).reduce((s, m) => s + m.medium, 0);
  const totalLow    = Object.values(equipmentMatrix).reduce((s, m) => s + m.low,    0);
  const grand       = totalSafety + totalHigh + totalMedium + totalLow;
  const counts      = { safety: totalSafety, high: totalHigh, medium: totalMedium, low: totalLow };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-critical" />
            <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider">Equipment Analysis</span>
          </div>
          <h2 className="text-[26px] font-bold text-text-main tracking-tight">Criticality Analysis by Plant Zone</h2>
          <p className="text-[13px] text-text-muted mt-1">
            Real-time breakdown of equipment criticality across all plant zones with guided remediation protocols.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-critical/15 border border-critical/30">
            <div className="w-1.5 h-1.5 rounded-full bg-critical animate-pulse" />
            <span className="text-[12px] font-semibold text-critical">{totalSafety} Safety-Critical</span>
          </div>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {criticalityLevels.map(cl => {
          const count = counts[cl.id];
          const pct   = ((count / grand) * 100).toFixed(0);
          const active = selectedCrit === cl.id;
          return (
            <button
              key={cl.id}
              onClick={() => setSelectedCrit(cl.id)}
              className="rounded-xl p-5 border text-left transition-all duration-200 hover:scale-[1.02]"
              style={{
                background:  active ? cl.bg : 'var(--color-surface)',
                borderColor: active ? cl.color : 'var(--color-border-subtle)',
                boxShadow:   active ? `0 0 18px ${cl.color}30` : 'none',
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <cl.icon className="w-5 h-5" style={{ color: cl.color }} />
                <span
                  className="text-[11px] font-mono px-2 py-0.5 rounded-full"
                  style={{ background: cl.bg, color: cl.color, border: `1px solid ${cl.border}` }}
                >{pct}%</span>
              </div>
              <div className="text-[28px] font-bold font-mono" style={{ color: cl.color }}>{count}</div>
              <div className="text-[12px] font-medium text-text-muted mt-0.5">{cl.label}</div>
              <div className="mt-3 h-1 bg-background rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cl.color }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Zone Heatmap */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-primary" />
          <h3 className="text-[16px] font-semibold text-text-main">Zone-by-Zone Criticality Heatmap</h3>
          <span className="text-[11px] text-text-muted ml-1">— click a zone to filter the table below</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {zones.map(zone => (
            <ZoneHeatCard
              key={zone.id}
              zone={zone}
              isSelected={selectedZone === zone.id}
              onClick={() => {
                const next = selectedZone === zone.id ? null : zone.id;
                setSelectedZone(next);
                setFilterZone(next ?? 'all');
              }}
            />
          ))}
        </div>
      </div>

      {/* Equipment Table */}
      <div className="bg-surface border border-border-subtle rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border-subtle flex flex-wrap justify-between items-center gap-3 bg-background/30">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-text-muted" />
            <h3 className="text-[15px] font-semibold text-text-main">Equipment Register</h3>
            <span className="ml-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
              {filteredEquipment.length} assets
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-text-muted" />
            {['all', ...zones.map(z => z.id)].map(id => (
              <button
                key={id}
                onClick={() => { setFilterZone(id); setSelectedZone(id === 'all' ? null : id); }}
                className="px-3 py-1 rounded-full text-[12px] font-medium border transition-colors"
                style={{
                  background:  filterZone === id ? 'rgba(59,130,246,0.2)' : 'var(--color-background)',
                  borderColor: filterZone === id ? '#3B82F6' : 'var(--color-border-subtle)',
                  color:       filterZone === id ? '#3B82F6' : 'var(--color-text-muted)',
                }}
              >{id === 'all' ? 'All Zones' : `Zone ${id}`}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-background/20 border-b border-border-subtle">
                {['Tag', 'Equipment Name', 'Type', 'Criticality', 'Health', 'Active Issue'].map(h => (
                  <th key={h} className="px-4 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEquipment.map(eq => <EquipmentRow key={eq.id} eq={eq} />)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Remediation Guide */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Wrench className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-text-main">Remediation & Response Guide</h3>
            <p className="text-[12px] text-text-muted">Select a criticality level to view its full response protocol, KPIs, and required tools</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {criticalityLevels.map(cl => {
            const active = selectedCrit === cl.id;
            return (
              <button
                key={cl.id}
                onClick={() => setSelectedCrit(cl.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border text-[13px] font-semibold transition-all duration-200"
                style={{
                  background:  active ? cl.bg : 'var(--color-surface)',
                  color:       active ? cl.color : 'var(--color-text-muted)',
                  borderColor: active ? cl.color : 'var(--color-border-subtle)',
                }}
              >
                <cl.icon className="w-4 h-4" />
                {cl.label}
              </button>
            );
          })}
        </div>
        <SolutionPanel level={selectedCrit} />
      </div>

      {/* Bottom analytics row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stacked bar */}
        <div className="bg-surface border border-border-subtle rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingDown className="w-4 h-4 text-text-muted" />
            <h4 className="text-[14px] font-semibold text-text-main">Criticality Stack by Zone</h4>
          </div>
          <div className="space-y-3">
            {zones.map(zone => {
              const m = equipmentMatrix[zone.id];
              const total = getTotalByZone(zone.id);
              return (
                <div key={zone.id}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[12px] text-text-muted font-mono">Zone {zone.id}</span>
                    <span className="text-[11px] text-text-muted">{total} assets</span>
                  </div>
                  <div className="h-5 flex rounded-md overflow-hidden gap-px">
                    {criticalityLevels.map(cl => {
                      const pct = (m[cl.id] / total) * 100;
                      return pct > 0 ? (
                        <div
                          key={cl.id}
                          title={`${cl.label}: ${m[cl.id]}`}
                          className="h-full"
                          style={{ width: `${pct}%`, backgroundColor: cl.color }}
                        />
                      ) : null;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-border-subtle">
            {criticalityLevels.map(cl => (
              <div key={cl.id} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: cl.color }} />
                <span className="text-[11px] text-text-muted">{cl.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Score Ranking */}
        <div className="bg-surface border border-border-subtle rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <ShieldAlert className="w-4 h-4 text-text-muted" />
            <h4 className="text-[14px] font-semibold text-text-main">Zone Risk Rankings</h4>
          </div>
          <div className="space-y-3">
            {zones
              .map(z => ({ ...z, score: parseFloat(getRiskScore(z.id)), total: getTotalByZone(z.id) }))
              .sort((a, b) => b.score - a.score)
              .map((z, rank) => {
                const risk = getRiskLabel(z.score);
                const pct  = (z.score / 10) * 100;
                return (
                  <div key={z.id} className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border-subtle">
                    <span className="text-[13px] font-bold font-mono text-text-muted w-5">#{rank + 1}</span>
                    <div className="flex-1">
                      <div className="text-[13px] font-medium text-text-main">{z.name}</div>
                      <div className="mt-1 h-1.5 bg-surface rounded-full overflow-hidden w-full">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: risk.color }} />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[18px] font-bold font-mono" style={{ color: risk.color }}>{z.score}</div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: risk.color }}>{risk.label}</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

    </div>
  );
}
