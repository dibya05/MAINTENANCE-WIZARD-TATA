import { useState } from 'react';
import { Bell, Search, Settings, X, AlertTriangle, CheckCircle2, Activity } from 'lucide-react';

const PAGE_TITLES = {
  fleet:     'Fleet Overview',
  explorer:  'Equipment Explorer',
  assistant: 'AI Assistant',
  quality:   'Data Quality Dashboard',
  analysis:  'Equipment Analysis',
  profile:   'Profile',
};

const NOTIFICATIONS = [
  { id: 1, type: 'critical', title: 'Critical: PMP-104A',     desc: 'Bearing vibration exceeded threshold (14.2 mm/s)', time: '2m ago' },
  { id: 2, type: 'warning',  title: 'Warning: COMP-820',      desc: 'Discharge pressure fluctuating ±15 PSI',          time: '5m ago' },
  { id: 3, type: 'info',     title: 'AI Analysis Complete',   desc: 'P-102 bearing fault report generated',            time: '14m ago' },
  { id: 4, type: 'success',  title: 'Maintenance Logged',     desc: 'HX-302 routine inspection completed',             time: '1h ago' },
];

const noteColors = {
  critical: 'text-critical',
  warning:  'text-warning',
  info:     'text-info',
  success:  'text-success',
};

const noteIcons = {
  critical: <AlertTriangle className="w-4 h-4 text-critical" />,
  warning:  <AlertTriangle className="w-4 h-4 text-warning" />,
  info:     <Activity className="w-4 h-4 text-info" />,
  success:  <CheckCircle2 className="w-4 h-4 text-success" />,
};

export function TopBar({ currentView, onMenuClick, user, onProfileClick, searchQuery, onSearchChange }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [readIds, setReadIds] = useState(new Set());

  if (currentView === 'detail') {
    return null; // Detail view has its own header
  }

  const title = PAGE_TITLES[currentView] || 'Dashboard';
  const unread = NOTIFICATIONS.filter(n => !readIds.has(n.id)).length;

  const markAllRead = () => setReadIds(new Set(NOTIFICATIONS.map(n => n.id)));

  return (
    <header className="flex justify-between items-center w-full px-5 h-16 sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-border-subtle shrink-0">
      {/* Left: menu toggle + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-white/5 transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="6"  y2="6" />
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>

        {currentView === 'assistant' && <BotIcon />}
        <h2 className="text-[18px] font-semibold text-text-main tracking-tight">{title}</h2>
      </div>

      {/* Right: search + actions */}
      <div className="flex items-center gap-3">
        {/* Search (only on relevant views) */}
        {['fleet', 'explorer', 'quality'].includes(currentView) && (
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              type="text"
              placeholder={currentView === 'quality' ? 'Search rows…' : 'Search equipment, tags…'}
              value={searchQuery || ''}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-[280px] h-9 bg-background border border-border-subtle rounded-lg pl-9 pr-3 text-[13px] text-text-main placeholder-text-muted focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-colors"
            />
          </div>
        )}

        <div className="flex items-center gap-1 border-l border-border-subtle pl-3 ml-1">
          {/* Notifications */}
          <div className="relative">
            <button
              id="topbar-notifications-btn"
              onClick={() => setShowNotifications(v => !v)}
              className="relative w-9 h-9 flex items-center justify-center rounded-full text-text-muted hover:text-text-main hover:bg-white/5 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-critical border-2 border-surface" />
              )}
            </button>

            {/* Notification panel */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-surface border border-border-subtle rounded-xl shadow-2xl shadow-black/40 z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-background/40">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-text-main">Notifications</span>
                    {unread > 0 && (
                      <span className="bg-critical/20 text-critical text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-critical/30">
                        {unread}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={markAllRead} className="text-[11px] text-primary hover:underline font-mono">
                      Mark all read
                    </button>
                    <button onClick={() => setShowNotifications(false)} className="text-text-muted hover:text-text-main transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-border-subtle max-h-72 overflow-y-auto">
                  {NOTIFICATIONS.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => setReadIds(s => new Set([...s, n.id]))}
                      className={`px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer flex gap-3 ${readIds.has(n.id) ? 'opacity-50' : ''}`}
                    >
                      <div className="mt-0.5 shrink-0">{noteIcons[n.type]}</div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[12px] font-semibold ${noteColors[n.type]}`}>{n.title}</p>
                        <p className="text-[12px] text-text-muted mt-0.5 leading-snug">{n.desc}</p>
                        <p className="text-[10px] font-mono text-text-muted/60 mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full text-text-muted hover:text-text-main hover:bg-white/5 transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Avatar / Profile */}
          <button
            id="topbar-profile-btn"
            onClick={onProfileClick}
            title={user?.name || 'Profile'}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-info text-white border border-primary/30 flex items-center justify-center text-xs font-bold ml-1 hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/20"
          >
            {user?.name
              ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
              : 'MW'}
          </button>
        </div>
      </div>

      {/* Overlay to close notifications */}
      {showNotifications && (
        <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
      )}
    </header>
  );
}

function BotIcon() {
  return (
    <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center border border-primary/30 text-primary shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" />
        <path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
      </svg>
    </div>
  );
}
