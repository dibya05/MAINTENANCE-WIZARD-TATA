import { useState, useEffect, useCallback } from 'react';
import { SlidersHorizontal, Download, Plus, MoreVertical, ChevronLeft, ChevronRight, RefreshCw, Search } from 'lucide-react';
import { getEquipment } from '../services/api';
import { equipmentList } from '../data'; // static fallback

const AREAS = ['All', 'Zone A', 'Zone B', 'Zone C', 'Zone D'];
const TYPES = ['All', 'CNC Lathe', 'Milling Machine', 'Conveyor System', 'Robotic Arm', 'Motor', 'Pump', 'Fan', 'Grinder', 'Press'];
const CRITICALITIES = ['All', 'Safety-Critical', 'High', 'Medium', 'Low'];
const PAGE_SIZE = 10;

export function EquipmentExplorer({ onNavigate, searchQuery, onSelectEquipment }) {
  const [allEquipment, setAllEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  // Filter state
  const [selectedAreas, setSelectedAreas] = useState(new Set(['All']));
  const [selectedTypes, setSelectedTypes] = useState(new Set(['All']));
  const [selectedCrits, setSelectedCrits] = useState(new Set(['All']));
  const [currentPage, setCurrentPage] = useState(1);

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEquipment();
      if (data.length === 0) {
        // DB empty — use static fallback
        setAllEquipment(equipmentList.map(eq => ({ ...eq, _id: eq.id })));
        setUsingFallback(true);
      } else {
        setAllEquipment(data);
        setUsingFallback(false);
      }
    } catch {
      setAllEquipment(equipmentList.map(eq => ({ ...eq, _id: eq.id })));
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEquipment(); }, [fetchEquipment]);

  // Toggle filter helpers
  const toggleFilter = (set, setFn, value) => {
    setFn(prev => {
      const next = new Set(prev);
      if (value === 'All') return new Set(['All']);
      next.delete('All');
      if (next.has(value)) next.delete(value);
      else next.add(value);
      if (next.size === 0) next.add('All');
      return next;
    });
    setCurrentPage(1);
  };

  // Filter logic
  const filtered = allEquipment.filter(eq => {
    const matchSearch = !searchQuery ||
      [eq.name, eq.tag, eq.type, eq.area].some(f => f?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchArea = selectedAreas.has('All') || selectedAreas.has(eq.area);
    const matchType = selectedTypes.has('All') || selectedTypes.has(eq.type);
    const matchCrit = selectedCrits.has('All') || selectedCrits.has(eq.criticality);
    return matchSearch && matchArea && matchType && matchCrit;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleRowClick = (eq) => {
    onSelectEquipment?.(eq._id ?? eq.id, eq);
    onNavigate('detail');
  };

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden p-5 gap-5 max-w-[1800px] mx-auto">

      {/* Left Filters Sidebar */}
      <aside className="w-64 bg-surface border border-border-subtle rounded-xl flex flex-col overflow-y-auto shrink-0">
        <div className="p-4 border-b border-border-subtle flex justify-between items-center sticky top-0 bg-surface z-10">
          <h2 className="text-[16px] font-semibold text-text-main">Filters</h2>
          <button
            onClick={() => {
              setSelectedAreas(new Set(['All']));
              setSelectedTypes(new Set(['All']));
              setSelectedCrits(new Set(['All']));
              setCurrentPage(1);
            }}
            className="text-primary text-xs font-semibold uppercase tracking-wider hover:underline"
          >
            Reset
          </button>
        </div>
        <div className="p-4 space-y-5 flex-1">
          <FilterSection title="Area">
            {AREAS.map(a => (
              <Checkbox
                key={a}
                label={a}
                checked={selectedAreas.has(a)}
                onChange={() => toggleFilter(selectedAreas, setSelectedAreas, a)}
              />
            ))}
          </FilterSection>
          <FilterSection title="Type">
            {TYPES.map(t => (
              <Checkbox
                key={t}
                label={t}
                checked={selectedTypes.has(t)}
                onChange={() => toggleFilter(selectedTypes, setSelectedTypes, t)}
              />
            ))}
          </FilterSection>
          <FilterSection title="Criticality">
            {CRITICALITIES.map(c => (
              <Checkbox
                key={c}
                label={c}
                checked={selectedCrits.has(c)}
                onChange={() => toggleFilter(selectedCrits, setSelectedCrits, c)}
              />
            ))}
          </FilterSection>
        </div>
      </aside>

      {/* Main Table Area */}
      <div className="flex-1 bg-surface border border-border-subtle rounded-xl flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="p-4 border-b border-border-subtle flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[17px] font-semibold">Equipment List</span>
            <span className="bg-background px-2 py-0.5 rounded font-mono text-[12px] text-text-muted border border-border-subtle">
              {filtered.length} assets
            </span>
            {usingFallback && (
              <span className="text-[10px] font-mono text-warning bg-warning/10 border border-warning/20 px-2 py-0.5 rounded-full">
                offline data
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchEquipment}
              disabled={loading}
              className="flex items-center justify-center w-8 h-8 rounded border border-border-subtle text-text-muted hover:bg-white/5 transition-colors disabled:opacity-40"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button className="flex items-center justify-center w-8 h-8 rounded border border-border-subtle text-text-muted hover:bg-white/5 transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button className="flex items-center justify-center w-8 h-8 rounded border border-border-subtle text-text-muted hover:bg-white/5 transition-colors">
              <Download className="w-4 h-4" />
            </button>
            <button className="bg-primary text-white px-4 py-1.5 rounded-lg hover:bg-primary/90 transition-colors text-[13px] font-semibold flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Asset
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-background border-b border-border-subtle z-10">
              <tr>
                <th className="py-3 px-4 w-2" />
                <th className="py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Tag No</th>
                <th className="py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Name</th>
                <th className="py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Type</th>
                <th className="py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Area</th>
                <th className="py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Criticality</th>
                <th className="py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Health</th>
                <th className="py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Updated</th>
                <th className="py-3 px-4 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-[13px]">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-10 text-center text-text-muted">
                    <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                    Loading equipment…
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-10 text-center text-text-muted">
                    <Search className="w-4 h-4 inline mr-2" />
                    No equipment matches your filters.
                  </td>
                </tr>
              ) : (
                paginated.map((eq) => {
                  const score = eq.healthScore ?? 0;
                  let statusColor = 'bg-success';
                  if (score < 50) statusColor = 'bg-critical';
                  else if (score < 70) statusColor = 'bg-warning';
                  else if (score < 85) statusColor = 'bg-warning/60';

                  const updated = eq.updatedAt
                    ? new Date(eq.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    : eq.lastUpdated ?? '—';

                  return (
                    <tr
                      key={eq._id ?? eq.id}
                      onClick={() => handleRowClick(eq)}
                      className="hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      <td className="p-0 w-1.5">
                        <div className={`w-1 h-full min-h-[44px] ${statusColor}`} />
                      </td>
                      <td className="py-2.5 px-4 font-mono text-text-main group-hover:text-primary">{eq.tag}</td>
                      <td className="py-2.5 px-4 font-medium text-text-main max-w-[200px] truncate">{eq.name}</td>
                      <td className="py-2.5 px-4 text-text-muted">{eq.type}</td>
                      <td className="py-2.5 px-4 text-text-muted">{eq.area}</td>
                      <td className="py-2.5 px-4">
                        <CriticalityBadge level={eq.criticality} />
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <span className={`inline-flex items-center justify-center w-10 h-5 rounded-full font-mono text-[11px] font-bold ${
                          score < 50  ? 'bg-critical/15 text-critical border border-critical/30' :
                          score < 70  ? 'bg-warning/15 text-warning border border-warning/30' :
                          score < 85  ? 'bg-warning/10 text-warning/80 border border-warning/20' :
                                        'bg-success/15 text-success border border-success/30'
                        }`}>
                          {score}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-text-muted font-mono text-[12px]">{updated}</td>
                      <td className="py-2.5 px-4 text-right opacity-0 group-hover:opacity-100">
                        <button
                          className="text-text-muted hover:text-text-main p-1 rounded hover:bg-white/10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 border-t border-border-subtle bg-background/50 flex justify-between items-center shrink-0">
          <span className="text-sm text-text-muted">
            Showing {paginated.length} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-1 px-2 border border-border-subtle rounded text-text-muted disabled:opacity-30 flex items-center gap-1 text-sm hover:bg-white/5 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push('…');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '…' ? (
                  <span key={`ellipsis-${i}`} className="text-text-muted px-1 text-sm">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-7 h-7 rounded font-mono text-[12px] flex items-center justify-center transition-colors ${
                      currentPage === p
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'text-text-muted hover:bg-white/5'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="flex items-center gap-1 p-1 px-2 border border-border-subtle rounded text-text-muted hover:bg-white/5 text-sm disabled:opacity-30 disabled:hover:bg-transparent"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSection({ title, children }) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div
        onClick={onChange}
        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
          checked ? 'bg-primary border-primary' : 'border-border-subtle bg-background group-hover:border-primary/50'
        }`}
      >
        {checked && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="text-[13px] text-text-muted group-hover:text-text-main transition-colors">{label}</span>
    </label>
  );
}

function CriticalityBadge({ level }) {
  const colors = {
    'Safety-Critical': 'border-critical text-critical',
    'High':            'border-orange-500 text-orange-500',
    'Medium':          'border-info text-info',
    'Low':             'border-text-muted text-text-muted',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border bg-transparent ${colors[level] ?? 'border-text-muted text-text-muted'}`}>
      {level}
    </span>
  );
}
