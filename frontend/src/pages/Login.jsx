import { useState } from 'react';
import { Settings, Eye, EyeOff, Zap, Shield, Lock, Mail } from 'lucide-react';
import { loginUser } from '../services/api';

export function Login({ onNavigate, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setIsLoading(true);
    try {
      const userData = await loginUser(email, password);
      onLogin(userData); // Pass full user object (includes token) to App
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-info/8 rounded-full blur-3xl pointer-events-none" />

      {/* Stats strip */}
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

        {/* Card */}
        <div className="bg-surface border border-border-subtle rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
          {/* Card header */}
          <div className="px-8 pt-8 pb-6 border-b border-border-subtle">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-[11px] font-mono text-primary uppercase tracking-wider">Secure Access</span>
            </div>
            <h2 className="text-2xl font-bold text-text-main">Sign In</h2>
            <p className="text-sm text-text-muted mt-1">Access your industrial control panel</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-6 flex flex-col gap-5">
            {error && (
              <div className="bg-critical/10 border border-critical/30 rounded-lg px-4 py-3 text-sm text-critical flex items-center gap-2">
                <Zap className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-text-muted uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@facility.com"
                  className="w-full bg-background border border-border-subtle rounded-lg pl-10 pr-4 py-3 text-sm text-text-main placeholder:text-text-muted/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-text-muted uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full bg-background border border-border-subtle rounded-lg pl-10 pr-10 py-3 text-sm text-text-main placeholder:text-text-muted/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end -mt-2">
              <button type="button" className="text-xs text-primary/70 hover:text-primary transition-colors font-mono">
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 active:scale-[0.98] text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 pb-8 text-center">
            <p className="text-sm text-text-muted">
              Don't have an account?{' '}
              <button
                id="goto-signup"
                onClick={() => onNavigate('signup')}
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Request Access
              </button>
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider">256-bit TLS Encrypted</span>
        </div>
      </div>
    </div>
  );
}
