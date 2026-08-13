import { Activity, Bot, Cpu, Settings, Ship, BarChart2 } from 'lucide-react';

export function Sidebar({ currentView, onNavigate }) {
  const navItems = [
    { id: 'fleet',     label: 'Fleet Overview',     icon: Ship },
    { id: 'explorer',  label: 'Equipment Explorer', icon: Cpu },
    { id: 'analysis',  label: 'Equipment Analysis', icon: BarChart2 },
    { id: 'assistant', label: 'AI Assistant',       icon: Bot },
    { id: 'quality',   label: 'Data Quality',       icon: Activity },
  ];

  return (
    <nav className="h-full flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="p-6 shrink-0 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-1.5 rounded-lg border border-primary/30 shrink-0">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-[17px] font-semibold text-text-main leading-tight truncate">
              Maintenance
            </h1>
            <p className="text-[11px] font-mono text-text-muted uppercase tracking-wider">
              Wizard
            </p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <ul className="flex flex-col gap-1 flex-grow px-3 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            currentView === item.id ||
            (item.id === 'explorer' && currentView === 'detail');
          return (
            <li key={item.id}>
              <button
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm shadow-primary/10'
                    : 'text-text-muted hover:text-text-main hover:bg-white/5 border border-transparent'
                }`}
              >
                <item.icon
                  className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'opacity-60'}`}
                />
                <span className="text-[13px] font-medium truncate">{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Bottom DB status */}
      <div className="p-4 shrink-0 border-t border-border-subtle">
        <div className="bg-background rounded-lg px-3 py-2.5 border border-border-subtle flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.5)] shrink-0" />
          <p className="text-[11px] text-text-muted font-mono uppercase tracking-wide truncate">
            System Online
          </p>
        </div>
      </div>
    </nav>
  );
}
