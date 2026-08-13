import { useState, useMemo } from 'react';
import { Activity, Copy, AlertCircle, Clock, History as HistoryIcon, Download, Search } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

const REJECTED_ROWS_DATA = [
   { row: '1042', field: 'pressure_psi', rule: 'OUT_OF_BOUNDS', ruleColor: 'critical', raw: '9999.00', reason: 'Value exceeds max safe threshold (5000)', file: 'telemetry_dump.csv', rawItalic: false },
   { row: '2091', field: 'timestamp', rule: 'FORMAT_ERROR', ruleColor: 'warning', raw: '27-10-23T10:15', reason: 'Expected ISO-8601 format', file: 'sensor_log_002.json', rawItalic: false },
   { row: '2092', field: 'asset_id', rule: 'MISSING_REQUIRED', ruleColor: 'critical', raw: 'null', reason: 'Primary key cannot be null', file: 'sensor_log_002.json', rawItalic: true },
   { row: '4005', field: 'temperature_c', rule: 'TYPE_MISMATCH', ruleColor: 'warning', raw: '"high"', reason: 'Expected numeric, got string', file: 'telemetry_dump.csv', rawItalic: false },
];

export function DataQuality({ globalSearchQuery }) {
  const [rejectedSearch, setRejectedSearch] = useState('');

  const filteredRejectedRows = REJECTED_ROWS_DATA.filter(r => {
      if(!rejectedSearch) return true;
      const q = rejectedSearch.toLowerCase();
      return r.field.toLowerCase().includes(q) || r.reason.toLowerCase().includes(q) || r.file.toLowerCase().includes(q) || r.rule.toLowerCase().includes(q);
  });

  const exportToCSV = () => {
     // Create CSV header
     const headers = ['Row #', 'Field', 'Rule Violated', 'Raw Value', 'Reason', 'Source File'];
     
     // Create CSV rows
     const csvRows = filteredRejectedRows.map(row => {
        return [
           row.row,
           row.field,
           row.rule,
           // Escape quotes in the raw value string
           `"${row.raw.replace(/"/g, '""')}"`,
           `"${row.reason.replace(/"/g, '""')}"`,
           row.file
        ].join(',');
     });
     
     // Combine header and rows
     const csvString = [headers.join(','), ...csvRows].join('\n');
     
     // Create a blob and trigger download
     const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
     const link = document.createElement('a');
     const url = URL.createObjectURL(blob);
     link.setAttribute('href', url);
     link.setAttribute('download', 'rejected_rows_export.csv');
     link.style.visibility = 'hidden';
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <QualityCard 
            title="Overall Completeness" 
            icon={Activity} 
            value="98.2" 
            unit="%" 
            chart="donut" 
         />
         <QualityCard 
            title="Duplicate Records" 
            icon={Copy} 
            value="42" 
            badge={{ text: '+5 since yesterday', color: 'warning' }} 
         />
         <QualityCard 
            title="Rejected Rows" 
            icon={AlertCircle} 
            value="14" 
            badge={{ text: 'Needs Action', color: 'critical' }} 
            criticalBorder
         />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         {/* Heatmap Area */}
         <div className="bg-surface border border-border-subtle rounded-xl lg:col-span-8 flex flex-col">
            <div className="p-5 border-b border-border-subtle flex justify-between items-center bg-background/30">
               <h3 className="text-[16px] font-semibold text-text-main">Freshness by Area (vs Time)</h3>
               <button className="text-[11px] font-semibold text-primary uppercase tracking-wider hover:underline">Export Map</button>
            </div>
            <div className="p-6 flex-1 flex flex-col bg-background relative">
               <div className="flex gap-4 mb-4">
                  <HeatmapLegend color="bg-success" label="Fresh (<1s)" />
                  <HeatmapLegend color="bg-warning" label="Delayed (>5s)" />
                  <HeatmapLegend color="bg-critical" label="Stale (>1m)" />
                  <HeatmapLegend color="bg-border-subtle" label="No Data" />
               </div>
               
               <div className="flex-1 min-h-[250px] relative mt-2">
                  <HeatmapGrid />
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 pointer-events-none">
                     <span className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Areas</span>
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none">
                     <span className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Time</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Import History */}
         <div className="bg-surface border border-border-subtle rounded-xl lg:col-span-4 flex flex-col overflow-hidden">
            <div className="p-5 border-b border-border-subtle flex justify-between items-center bg-background/30 shrink-0">
               <h3 className="text-[16px] font-semibold text-text-main">Import History</h3>
               <HistoryIcon className="w-4 h-4 text-text-muted" />
            </div>
            <div className="flex-1 overflow-y-auto p-5 bg-background relative space-y-6">
               <div className="absolute left-[29px] top-6 bottom-6 w-px bg-border-subtle z-0"></div>
               
               <HistoryItem 
                  filename="batch_data_Q3.csv"
                  time="Oct 27, 10:42 AM"
                  desc="12,402 rows processed"
                  status="success"
               />
               <HistoryItem 
                  filename="sensor_log_002.json"
                  time="Oct 27, 10:30 AM"
                  desc="Failed: Timeout"
                  status="critical"
               />
               <HistoryItem 
                  filename="telemetry_dump.csv"
                  time="Oct 27, 10:15 AM"
                  desc="14 rows rejected"
                  status="warning"
               />
               <HistoryItem 
                  filename="init_sync_daily.xml"
                  time="Oct 27, 10:00 AM"
                  desc="11,900 rows processed"
                  status="success"
               />
            </div>
         </div>
      </div>

      {/* Rejected Rows Table */}
      <div className="bg-surface border border-border-subtle rounded-xl flex flex-col overflow-hidden">
         <div className="p-5 border-b border-border-subtle flex justify-between items-center bg-background/30">
            <h3 className="text-[16px] font-semibold text-text-main">Rejected Rows</h3>
            <div className="flex items-center gap-3">
               <div className="relative">
                  <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search rows..." 
                    value={rejectedSearch}
                    onChange={(e) => setRejectedSearch(e.target.value)}
                    className="bg-background border border-border-subtle rounded-lg pl-9 pr-3 py-1.5 text-[13px] focus:outline-none focus:border-primary/50 w-64" 
                  />
               </div>
               <button 
                  onClick={exportToCSV}
                  className="bg-primary text-white text-[11px] font-semibold px-4 py-2 rounded-lg uppercase tracking-wider hover:bg-primary-hover transition-colors"
               >
                  Export List
               </button>
            </div>
         </div>
         <div className="overflow-x-auto bg-background">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-surface border-b border-border-subtle">
                     <th className="p-4 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Row #</th>
                     <th className="p-4 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Field</th>
                     <th className="p-4 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Rule Violated</th>
                     <th className="p-4 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Raw Value</th>
                     <th className="p-4 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Reason</th>
                     <th className="p-4 text-[11px] font-semibold text-text-muted uppercase tracking-wider">Source File</th>
                  </tr>
               </thead>
               <tbody className="text-[13px] divide-y divide-border-subtle">
                  {filteredRejectedRows.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-text-muted">No rejected rows found matching "{rejectedSearch}"</td>
                    </tr>
                  ) : (
                    filteredRejectedRows.map((r, idx) => (
                      <RejectedRow key={idx} {...r} />
                    ))
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}

function QualityCard({ title, icon: Icon, value, unit, badge, chart, criticalBorder }) {
   const pieData = [
      { name: 'Complete', value: 98.2 },
      { name: 'Missing', value: 1.8 }
   ];
   const COLORS = ['#3B82F6', '#26344F'];

   return (
      <div className={`bg-surface border rounded-xl p-6 flex flex-col justify-between h-[140px] ${criticalBorder ? 'border-l-4 border-l-critical border-border-subtle' : 'border-border-subtle'}`}>
         <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">{title}</span>
            <Icon className={`w-5 h-5 ${criticalBorder ? 'text-critical' : 'text-text-muted'}`} />
         </div>
         <div className="flex items-center justify-between mt-4">
            <div className="text-3xl font-bold font-mono text-text-main">{value}<span className="text-lg font-sans font-normal text-text-muted">{unit}</span></div>
            
            {chart === 'donut' && (
               <div className="w-16 h-16 mr-[-10px]">
                  <PieChart width={64} height={64}>
                     <Pie
                        data={pieData}
                        cx={32}
                        cy={32}
                        innerRadius={20}
                        outerRadius={30}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                     >
                        {pieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Pie>
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#131C2C', border: '1px solid #26344F', borderRadius: '8px', fontSize: '12px' }}
                        itemStyle={{ color: '#E2E8F0' }}
                     />
                  </PieChart>
               </div>
            )}
            
            {badge && (
               <div className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[11px] font-mono border ${
                  badge.color === 'warning' ? 'bg-warning/15 text-warning border-warning/30' : 'bg-critical/15 text-critical border-critical/30'
               }`}>
                  <div className={`w-2 h-2 rounded-full ${badge.color === 'warning' ? 'bg-warning' : 'bg-critical'}`}></div>
                  {badge.text}
               </div>
            )}
         </div>
      </div>
   )
}

function HeatmapLegend({ color, label }) {
   return (
      <div className="flex items-center gap-2">
         <div className={`w-3 h-3 rounded-sm ${color}`}></div>
         <span className="text-[11px] font-medium text-text-muted">{label}</span>
      </div>
   )
}

function HistoryItem({ filename, time, desc, status }) {
   let color = 'bg-success border-success text-text-main';
   if (status === 'critical') color = 'bg-critical border-critical text-critical';
   if (status === 'warning') color = 'bg-warning border-warning text-text-main';

   return (
      <div className="relative z-10 flex gap-4">
         <div className="mt-1 shrink-0">
            <div className={`w-6 h-6 rounded-full bg-surface border-2 flex items-center justify-center ${color.split(' ')[1]}`}>
               <div className={`w-2 h-2 rounded-full ${color.split(' ')[0]}`}></div>
            </div>
         </div>
         <div className="pb-2">
            <div className="font-mono text-[13px] text-text-main mb-0.5">{filename}</div>
            <div className="text-[11px] text-text-muted mb-1">{time}</div>
            <div className={`text-[13px] ${status === 'critical' ? 'text-critical font-medium' : 'text-text-main'}`}>{desc}</div>
         </div>
      </div>
   )
}

function RejectedRow({ row, field, rule, ruleColor, raw, reason, file, rawItalic }) {
   return (
      <tr className="hover:bg-white/5 transition-colors">
         <td className="p-4 text-text-muted font-mono">{row}</td>
         <td className="p-4 font-medium text-text-main">{field}</td>
         <td className="p-4">
            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
               ruleColor === 'critical' ? 'bg-critical/15 text-critical border-critical/30' : 'bg-warning/15 text-warning border-warning/30'
            }`}>
               {rule}
            </span>
         </td>
         <td className={`p-4 font-mono text-text-muted ${rawItalic ? 'italic opacity-50' : ''}`}>{raw}</td>
         <td className="p-4 text-text-main">{reason}</td>
         <td className="p-4"><a href="#" className="text-primary hover:underline font-mono text-[12px]">{file}</a></td>
      </tr>
   )
}

function HeatmapGrid() {
   // Generate stable random values for the heatmap to prevent flickering
   const cells = useMemo(() => {
      return Array.from({ length: 72 }).map((_, i) => {
         // Simple seeded random to keep values stable across renders
         const x = Math.sin(i + 1) * 10000;
         const rand = x - Math.floor(x);
         
         let bg = 'bg-success';
         if (rand > 0.8) bg = 'bg-warning';
         if (rand > 0.95) bg = 'bg-critical';
         if (rand < 0.1) bg = 'bg-border-subtle';
         
         return <div key={i} className={`${bg} rounded-[2px] opacity-80 hover:opacity-100 transition-opacity cursor-crosshair border border-background hover:border-white/20`} />
      });
   }, []);

   return (
      <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 gap-1.5 pl-8 pb-6">
         {cells}
      </div>
   );
}
