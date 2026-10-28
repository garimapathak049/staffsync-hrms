import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Lock, Phone, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { fetchMe } from '../store';
import { act, fmt } from '../utils/hooks';
import { Field } from '../components/ui';

export default function Profile() {
  const { user } = useSelector((s) => s.auth);
  const d = useDispatch();
  const [p, setP] = useState({
    phone: user.phone || '',
    address: user.address || '',
    emergencyContact: user.emergencyContact || {},
  });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });

  const ec = (k) => ({
    value: p.emergencyContact[k] || '',
    onChange: (e) =>
      setP({ ...p, emergencyContact: { ...p.emergencyContact, [k]: e.target.value } }),
  });

  return (
    <div>
      <div className="mb-8 border-b border-zinc-200 pb-6">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black">
          {user.role === 'HR' ? 'Security & Profile Hub' : 'Personal Profile & Settings'}
        </h1>
        <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
          Identity Credentials & Corporate Directory Details
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Employment Info & Contact */}
        <div className="lg:col-span-6 space-y-8">
          {/* Identity Card */}
          <div className="glass-card p-6 md:p-8 border-zinc-200 bg-white">
            <div className="flex items-center gap-2 mb-6">
              <User size={18} className="text-black" />
              <h3 className="text-sm font-black uppercase tracking-wider text-black">Employment Specifications</h3>
            </div>

            <div className="space-y-3">
              {[
                ['Full Legal Name', user.name],
                ['Enterprise Email', user.email],
                ['Employee Identification Badge', user.employeeId],
                ['Assigned Department', user.department],
                ['Designation', user.designation],
                ['Tenure Start Date', fmt(user.joiningDate)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center py-2 border-b border-zinc-100 text-xs">
                  <span className="text-zinc-500 font-medium">{k}</span>
                  <span className="text-black font-mono font-bold">{v || '—'}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-zinc-400 mt-4 leading-relaxed font-mono">
              Note: Hierarchy status, payroll bracket, and badge identity are cryptographically locked by HR administration.
            </p>
          </div>

          {/* Contact Details Form */}
          <form
            className="glass-card p-6 md:p-8 border-zinc-200 space-y-4 bg-white"
            onSubmit={async (e) => {
              e.preventDefault();
              if (await act(api.put('/employees/me', p), 'Contact specifications saved')) {
                d(fetchMe());
              }
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Phone size={18} className="text-black" />
              <h3 className="text-sm font-black uppercase tracking-wider text-black">Direct Communications</h3>
            </div>

            <Field label="Personal Mobile">
              <input
                className="nike-input text-xs"
                placeholder="+1 (555) 000-0000"
                value={p.phone}
                onChange={(e) => setP({ ...p, phone: e.target.value })}
              />
            </Field>

            <Field label="Residential Address">
              <input
                className="nike-input text-xs"
                placeholder="Street, City, Country"
                value={p.address}
                onChange={(e) => setP({ ...p, address: e.target.value })}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Emergency Contact Name">
                <input className="nike-input text-xs" placeholder="Full name" {...ec('name')} />
              </Field>
              <Field label="Emergency Contact Phone">
                <input className="nike-input text-xs" placeholder="+1..." {...ec('phone')} />
              </Field>
            </div>

            <button
              type="submit"
              className="px-8 py-3 rounded-full bg-black text-white font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all shadow-md mt-2"
            >
              Update Contact Records
            </button>
          </form>
        </div>

        {/* Right Column: Password / Security */}
        <div className="lg:col-span-6">
          <form
            className="glass-card p-6 md:p-8 border-zinc-200 space-y-4 bg-white"
            onSubmit={async (e) => {
              e.preventDefault();
              if (await act(api.post('/auth/change-password', pw), 'Password updated successfully')) {
                setPw({ currentPassword: '', newPassword: '' });
              }
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Lock size={18} className="text-black" />
              <h3 className="text-sm font-black uppercase tracking-wider text-black">Cryptographic Password Rotation</h3>
            </div>

            {user.mustChangePassword && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} />
                <span>Security Notice: Please replace your provisional default password.</span>
              </div>
            )}

            <Field label="Current Password">
              <input
                required
                type="password"
                className="nike-input text-xs"
                placeholder="••••••••"
                value={pw.currentPassword}
                onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
              />
            </Field>

            <Field label="New Password (8+ characters, alphanumeric)">
              <input
                required
                type="password"
                minLength={8}
                className="nike-input text-xs"
                placeholder="••••••••"
                value={pw.newPassword}
                onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
              />
            </Field>

            <button
              type="submit"
              className="px-8 py-3 rounded-full bg-black text-white font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all shadow-md mt-2"
            >
              Confirm Password Rotation
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
