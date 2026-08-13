import { useState } from 'react';
import {
  User, Mail, Building2, Shield, Settings, Camera,
  Bell, Cpu, Activity, LogOut, Lock, ChevronRight, Save,
  Zap, Clock, CheckCircle2,
} from 'lucide-react';

const stats = [
  { label: 'Work Orders', value: '1,247', icon: Cpu, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
  { label: 'Alerts Resolved', value: '89', icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10 border-success/20' },
  { label: 'Avg Response', value: '4.2m', icon: Clock, color: 'text-warning', bg: 'bg-warning/10 border-warning/20' },
  { label: 'Uptime', value: '99.8%', icon: Activity, color: 'text-info', bg: 'bg-info/10 border-info/20' },
];

const activityLog = [
  { action: 'Resolved critical alert on CNC-07', time: '2 hours ago', type: 'success' },
  { action: 'Updated maintenance schedule for Fleet A', time: '5 hours ago', type: 'info' },
  { action: 'Flagged data anomaly on Sensor-B12', time: '1 day ago', type: 'warning' },
  { action: 'Completed inspection — Hydraulic Press 3', time: '2 days ago', type: 'success' },
  { action: 'Logged equipment downtime for Conveyor-4', time: '3 days ago', type: 'critical' },
];

const typeColors = {
  success: 'bg-success text-success',
  info: 'bg-info text-info',
  warning: 'bg-warning text-warning',
  critical: 'bg-critical text-critical',
};

export function Profile({ user, onLogout, onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || 'Jane Smith',
    email: user?.email || 'jane.smith@facility.com',
    role: 'Maintenance Technician',
    facility: 'Plant Alpha — Zone 3',
    phone: '+1 (555) 204-8912',
    notifications: true,
    twoFactor: false,
  });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    // Save to local storage for persistence across reloads
    const updatedUser = { ...user, name: form.name, email: form.email, phone: form.phone };
    localStorage.setItem('mw_user', JSON.stringify(updatedUser));
    // We would also call an API here in a real app, e.g., await updateUserProfile(updatedUser)
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setEditMode(false);
  };

  const initials = form.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-background text-text-main">
      {/* Top Banner */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 via-surface to-background border-b border-border-subtle overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        {/* Back / Logout */}
        <div className="absolute top-5 left-5 right-5 flex justify-between items-center">
          <button
            id="profile-back-btn"
            onClick={() => onNavigate('fleet')}
            className="flex items-center gap-2 text-sm text-text-muted hover:text-text-main transition-colors bg-surface/60 backdrop-blur-sm border border-border-subtle rounded-lg px-3 py-2"
          >
            <Settings className="w-4 h-4" />
            Dashboard
          </button>
          <button
            id="profile-logout-btn"
            onClick={onLogout}
            className="flex items-center gap-2 text-sm text-critical/80 hover:text-critical transition-colors bg-surface/60 backdrop-blur-sm border border-critical/20 rounded-lg px-3 py-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-10">
        {/* Avatar + Name */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-16 mb-8 relative z-10">
          <div className="relative shrink-0">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary to-info flex items-center justify-center text-3xl font-bold text-white shadow-2xl shadow-primary/30 border-4 border-background">
              {initials}
            </div>
            <button className="absolute -bottom-2 -right-2 bg-surface border border-border-subtle rounded-lg p-1.5 hover:bg-surface-hover transition-colors shadow-md">
              <Camera className="w-3.5 h-3.5 text-text-muted" />
            </button>
          </div>

          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-2xl font-bold text-text-main">{form.name}</h1>
              <div className="bg-success/15 border border-success/30 rounded px-2 py-0.5 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[10px] font-mono text-success uppercase">Active</span>
              </div>
            </div>
            <p className="text-text-muted text-sm">{form.role} · {form.facility}</p>
          </div>

          {!editMode ? (
            <button
              id="profile-edit-btn"
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 active:scale-[0.98] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-primary/20"
            >
              <Settings className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditMode(false)} className="bg-surface border border-border-subtle hover:bg-surface-hover text-text-muted text-sm font-semibold px-4 py-2.5 rounded-lg transition-all">
                Cancel
              </button>
              <button
                id="profile-save-btn"
                onClick={handleSave}
                className="flex items-center gap-2 bg-success hover:bg-success/90 active:scale-[0.98] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-success/20"
              >
                {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className={`bg-surface border ${s.bg} rounded-xl p-4 flex flex-col gap-2`}>
              <div className={`${s.bg} w-9 h-9 rounded-lg border flex items-center justify-center`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-text-main">{s.value}</p>
                <p className="text-xs font-mono text-text-muted uppercase tracking-wider">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface border border-border-subtle rounded-xl p-1 mb-6 w-fit">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'activity', label: 'Activity', icon: Activity },
          ].map((t) => (
            <button
              key={t.id}
              id={`profile-tab-${t.id}`}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === t.id
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Info */}
            <div className="bg-surface border border-border-subtle rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border-subtle flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-text-main">Personal Information</h3>
              </div>
              <div className="p-6 flex flex-col gap-5">
                {[
                  { label: 'Full Name', key: 'name', icon: User, type: 'text' },
                  { label: 'Email Address', key: 'email', icon: Mail, type: 'email' },
                  { label: 'Phone Number', key: 'phone', icon: Bell, type: 'tel' },
                ].map(({ label, key, icon: Icon, type }) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-text-muted uppercase tracking-wider">{label}</label>
                    {editMode ? (
                      <input
                        type={type}
                        value={form[key]}
                        onChange={(e) => update(key, e.target.value)}
                        className="w-full bg-background border border-border-subtle rounded-lg px-4 py-2.5 text-sm text-text-main focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-text-muted shrink-0" />
                        <span className="text-sm text-text-main">{form[key]}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Operator Info */}
            <div className="bg-surface border border-border-subtle rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border-subtle flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-text-main">Operator Assignment</h3>
              </div>
              <div className="p-6 flex flex-col gap-5">
                {[
                  { label: 'Role', key: 'role', icon: Shield },
                  { label: 'Facility', key: 'facility', icon: Building2 },
                ].map(({ label, key, icon: Icon }) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-text-muted uppercase tracking-wider">{label}</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={form[key]}
                        onChange={(e) => update(key, e.target.value)}
                        className="w-full bg-background border border-border-subtle rounded-lg px-4 py-2.5 text-sm text-text-main focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-text-muted shrink-0" />
                        <span className="text-sm text-text-main">{form[key]}</span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Access Level */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono text-text-muted uppercase tracking-wider">Access Level</label>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map((i) => (
                        <div key={i} className={`w-6 h-2 rounded-sm ${i <= 3 ? 'bg-primary' : 'bg-border-subtle'}`} />
                      ))}
                    </div>
                    <span className="text-xs font-mono text-primary">Level 3 — Operator</span>
                  </div>
                </div>

                {/* Notifications toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-text-muted" />
                    <span className="text-sm text-text-main">Alert Notifications</span>
                  </div>
                  <button
                    onClick={() => editMode && update('notifications', !form.notifications)}
                    className={`relative w-10 h-5 rounded-full transition-all duration-300 ${form.notifications ? 'bg-primary' : 'bg-border-subtle'} ${editMode ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${form.notifications ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Security */}
        {activeTab === 'security' && (
          <div className="bg-surface border border-border-subtle rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border-subtle flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-text-main">Security Settings</h3>
            </div>
            <div className="divide-y divide-border-subtle">
              {[
                {
                  icon: Lock,
                  title: 'Change Password',
                  desc: 'Last changed 30 days ago',
                  action: 'Update',
                  color: 'text-primary',
                },
                {
                  icon: Shield,
                  title: 'Two-Factor Authentication',
                  desc: form.twoFactor ? 'Enabled — TOTP app' : 'Disabled — Highly recommended',
                  action: form.twoFactor ? 'Disable' : 'Enable',
                  color: form.twoFactor ? 'text-success' : 'text-warning',
                  toggle: true,
                },
                {
                  icon: Activity,
                  title: 'Active Sessions',
                  desc: '1 active session — This device',
                  action: 'Manage',
                  color: 'text-info',
                },
                {
                  icon: Zap,
                  title: 'Login Alerts',
                  desc: 'Email alerts on new sign-ins',
                  action: 'Configure',
                  color: 'text-primary',
                },
              ].map(({ icon: Icon, title, desc, action, color, toggle }) => (
                <div key={title} className="flex items-center justify-between px-6 py-5 hover:bg-surface-hover/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`${color.replace('text-', 'bg-').replace('text-', '')}/10 border ${color.replace('text-', 'border-')}/20 p-2 rounded-lg`}
                      style={{ backgroundColor: 'transparent' }}
                    >
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-main">{title}</p>
                      <p className="text-xs text-text-muted">{desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggle && update('twoFactor', !form.twoFactor)}
                    className={`flex items-center gap-1 text-xs font-mono ${color} hover:opacity-80 transition-opacity`}
                  >
                    {action}
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Activity */}
        {activeTab === 'activity' && (
          <div className="bg-surface border border-border-subtle rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border-subtle flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-text-main">Recent Activity</h3>
              <span className="ml-auto text-[11px] font-mono text-text-muted">Last 7 days</span>
            </div>
            <div className="divide-y divide-border-subtle">
              {activityLog.map(({ action, time, type }) => (
                <div key={action} className="flex items-center gap-4 px-6 py-4 hover:bg-surface-hover/50 transition-colors">
                  <div className={`w-2 h-2 rounded-full bg-${type === 'success' ? 'success' : type === 'info' ? 'info' : type === 'warning' ? 'warning' : 'critical'} shrink-0`} />
                  <p className="text-sm text-text-main flex-1">{action}</p>
                  <span className="text-xs font-mono text-text-muted shrink-0">{time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
