import { useState } from 'react';
import { Settings, Eye, EyeOff, Zap, Shield, Lock, Mail, User, Building2, CheckCircle2 } from 'lucide-react';
import { registerUser } from '../services/api';

const roles = ['Maintenance Technician', 'Operations Engineer', 'Fleet Manager', 'Quality Inspector', 'System Administrator'];

export function Signup({ onNavigate }) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '', role: '', facility: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const update = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required.';
    if (!form.email.includes('@')) e.email = 'Valid email is required.';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.role) e.role = 'Please select a role.';
    if (!form.facility.trim()) e.facility = 'Facility name is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setServerError('');
    setIsLoading(true);
    try {
      await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        facility: form.facility,
      });
      setDone(true);
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#22C55E 1px, transparent 1px), linear-gradient(90deg, #22C55E 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-success/8 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 w-full max-w-md px-6 text-center">
          <div className="bg-surface border border-border-subtle rounded-2xl shadow-2xl shadow-black/40 p-10">
            <div className="bg-success/15 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-success/30">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-text-main mb-2">Access Requested</h2>
            <p className="text-text-muted text-sm mb-8 leading-relaxed">
              Your account request has been submitted. An administrator will review and activate your credentials shortly.
            </p>
            <button
              id="goto-login-from-signup"
              onClick={() => onNavigate('login')}
              className="w-full bg-primary hover:bg-primary/90 active:scale-[0.98] text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg shadow-primary/20"
            >
              Return to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden py-10">
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="bg-primary/20 p-2.5 rounded-xl border border-primary/30 shadow-lg shadow-primary/10">
            <Settings className="w-7 h-7 text-primary animate-[spin_12s_linear_infinite]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-main tracking-tight">Maintenance Wizard</h1>
            <p className="text-[11px] font-mono text-text-muted uppercase tracking-widest">Industrial Dashboard</p>
          </div>
        </div>

        <div className="bg-surface border border-border-subtle rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-border-subtle">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-primary" />
              <span className="text-[11px] font-mono text-primary uppercase tracking-wider">New Operator</span>
            </div>
            <h2 className="text-2xl font-bold text-text-main">Request Access</h2>
            <p className="text-sm text-text-muted mt-1">Create your operator credentials</p>

            {/* Steps indicator */}
            <div className="flex items-center gap-3 mt-5">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300 ${
                    step >= s
                      ? 'bg-primary border-primary text-white shadow-md shadow-primary/30'
                      : 'border-border-subtle text-text-muted'
                  }`}>
                    {s}
                  </div>
                  <span className={`text-xs font-mono transition-colors ${step >= s ? 'text-primary' : 'text-text-muted'}`}>
                    {s === 1 ? 'Credentials' : 'Assignment'}
                  </span>
                  {s < 2 && <div className={`flex-1 h-px w-12 transition-all duration-300 ${step > s ? 'bg-primary/40' : 'bg-border-subtle'}`} />}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <div className="px-8 py-6 flex flex-col gap-5">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-text-muted uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  <input
                    id="signup-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full bg-background border border-border-subtle rounded-lg pl-10 pr-4 py-3 text-sm text-text-main placeholder:text-text-muted/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                  />
                </div>
                {errors.name && <p className="text-xs text-critical">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-text-muted uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  <input
                    id="signup-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="operator@facility.com"
                    className="w-full bg-background border border-border-subtle rounded-lg pl-10 pr-4 py-3 text-sm text-text-main placeholder:text-text-muted/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                  />
                </div>
                {errors.email && <p className="text-xs text-critical">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-text-muted uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full bg-background border border-border-subtle rounded-lg pl-10 pr-10 py-3 text-sm text-text-main placeholder:text-text-muted/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Password strength */}
                <div className="flex gap-1 mt-0.5">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      form.password.length >= i * 3
                        ? form.password.length >= 10 ? 'bg-success' : form.password.length >= 6 ? 'bg-warning' : 'bg-critical'
                        : 'bg-border-subtle'
                    }`} />
                  ))}
                </div>
                {errors.password && <p className="text-xs text-critical">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-text-muted uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  <input
                    id="signup-confirm"
                    type="password"
                    value={form.confirm}
                    onChange={(e) => update('confirm', e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full bg-background border border-border-subtle rounded-lg pl-10 pr-4 py-3 text-sm text-text-main placeholder:text-text-muted/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                  />
                </div>
                {errors.confirm && <p className="text-xs text-critical">{errors.confirm}</p>}
              </div>

              <button
                id="signup-next"
                type="button"
                onClick={handleNext}
                className="w-full bg-primary hover:bg-primary/90 active:scale-[0.98] text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg shadow-primary/20"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="px-8 py-6 flex flex-col gap-5">
              {/* Role */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-text-muted uppercase tracking-wider">Operator Role</label>
                <select
                  id="signup-role"
                  value={form.role}
                  onChange={(e) => update('role', e.target.value)}
                  className="w-full bg-background border border-border-subtle rounded-lg px-4 py-3 text-sm text-text-main focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all duration-200 appearance-none"
                >
                  <option value="">Select your role...</option>
                  {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                {errors.role && <p className="text-xs text-critical">{errors.role}</p>}
              </div>

              {/* Facility */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-text-muted uppercase tracking-wider">Facility / Site</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  <input
                    id="signup-facility"
                    type="text"
                    value={form.facility}
                    onChange={(e) => update('facility', e.target.value)}
                    placeholder="Plant Alpha — Zone 3"
                    className="w-full bg-background border border-border-subtle rounded-lg pl-10 pr-4 py-3 text-sm text-text-main placeholder:text-text-muted/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                  />
                </div>
                {errors.facility && <p className="text-xs text-critical">{errors.facility}</p>}
              </div>

              {/* Info card */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3">
                <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-text-muted leading-relaxed">
                  Your account will be reviewed by a system administrator before activation. You'll receive an email notification once approved.
                </p>
              </div>

              {/* Server error */}
              {serverError && (
                <div className="bg-critical/10 border border-critical/30 rounded-lg px-4 py-3 text-sm text-critical flex items-center gap-2">
                  <Zap className="w-4 h-4 shrink-0" />
                  {serverError}
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex-1 bg-surface-hover hover:bg-border-subtle text-text-main font-semibold py-3 rounded-lg transition-all duration-200 border border-border-subtle">
                  Back
                </button>
                <button
                  id="signup-submit"
                  type="submit"
                  disabled={isLoading}
                  className="flex-[2] bg-primary hover:bg-primary/90 active:scale-[0.98] text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-60"
                >
                  {isLoading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Request Access
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="px-8 pb-8 text-center">
            <p className="text-sm text-text-muted">
              Already have an account?{' '}
              <button
                id="goto-login"
                onClick={() => onNavigate('login')}
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider">256-bit TLS Encrypted</span>
        </div>
      </div>
    </div>
  );
}
