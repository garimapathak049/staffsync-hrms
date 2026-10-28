import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, ArrowRight, Shield, Zap, Sparkles } from 'lucide-react';
import { login } from '../store';
import { Logo } from '../components/ui';

export default function Login() {
  const d = useDispatch();
  const { user, loading, error } = useSelector((s) => s.auth);
  const [f, setF] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [err, setErr] = useState({});

  if (user) return <Navigate to="/app" replace />;

  const submit = (e) => {
    e.preventDefault();
    const x = {};
    if (!/^\S+@\S+\.\S+$/.test(f.email)) x.email = 'Enter a valid enterprise email';
    if (!f.password) x.password = 'Password is required';
    setErr(x);
    if (!Object.keys(x).length) d(login(f));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-black flex flex-col justify-between selection:bg-black selection:text-white relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-zinc-200/60 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <header className="p-6 md:p-10 flex justify-between items-center relative z-10">
        <Logo size={24} />
        <a
          href="/"
          className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-black transition-colors"
        >
          &larr; Back to Landing
        </a>
      </header>

      {/* Main Login Box */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          {/* Form Card */}
          <div className="glass-card p-8 md:p-10 border border-zinc-200 shadow-xl relative bg-white">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-[10px] font-black uppercase tracking-widest text-zinc-700 mb-3">
                <Shield size={12} /> Secure Gateway
              </div>
              <h2 className="text-3xl font-black tracking-tight text-black uppercase">
                Welcome Back
              </h2>
              <p className="text-sm text-zinc-500 mt-1 font-medium">
                Authenticate your corporate credentials to continue.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={submit} noValidate className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@staffsync.demo"
                  className={`nike-input ${err.email ? 'border-red-500' : ''}`}
                  value={f.email}
                  onChange={(e) => setF({ ...f, email: e.target.value })}
                />
                {err.email && <p className="text-red-500 text-xs mt-1 font-semibold">{err.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={show ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`nike-input pr-12 ${err.password ? 'border-red-500' : ''}`}
                    value={f.password}
                    onChange={(e) => setF({ ...f, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black p-1"
                  >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {err.password && <p className="text-red-500 text-xs mt-1 font-semibold">{err.password}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-black text-white font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 group mt-2 shadow-md"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <>
                    <span>Sign In to Terminal</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Pre-fill Pill Bar */}
            <div className="mt-8 pt-6 border-t border-zinc-100">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
                <Sparkles size={14} className="text-black" />
                <span>Instant Demo Access</span>
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setF({ email: 'hr@staffsync.demo', password: 'Demo@12345' })}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-black hover:bg-zinc-100 transition-all text-left text-xs"
                >
                  <div>
                    <span className="font-bold text-black block">HR Administrator</span>
                    <span className="text-[11px] text-zinc-500">Anita Sharma</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-black text-white font-black text-[10px] uppercase tracking-wider">
                    Auto Fill
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setF({ email: 'manager1@staffsync.demo', password: 'Demo@12345' })}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-black hover:bg-zinc-100 transition-all text-left text-xs"
                >
                  <div>
                    <span className="font-bold text-black block">Department Manager</span>
                    <span className="text-[11px] text-zinc-500">Rahul Verma</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-white font-black text-[10px] uppercase tracking-wider">
                    Auto Fill
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setF({ email: 'employee1@staffsync.demo', password: 'Demo@12345' })}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-black hover:bg-zinc-100 transition-all text-left text-xs"
                >
                  <div>
                    <span className="font-bold text-black block">Core Employee</span>
                    <span className="text-[11px] text-zinc-500">Aman Gupta</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-zinc-700 text-white font-black text-[10px] uppercase tracking-wider">
                    Auto Fill
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <footer className="p-6 text-center text-xs text-zinc-400 relative z-10">
        StaffSync Security Protocol • All Demo Accounts: <span className="text-zinc-600 font-mono font-bold">Demo@12345</span>
      </footer>
    </div>
  );
}
