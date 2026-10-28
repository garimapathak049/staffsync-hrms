import { useEffect, useState } from 'react';
import { Zap, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Logo = ({ size = 22, light = false }) => (
  <div className="inline-flex items-center gap-2.5 font-black tracking-tighter select-none group cursor-pointer">
    <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-[#D4FF00] shadow-[0_4px_12px_rgba(0,0,0,0.15)] group-hover:rotate-6 transition-transform">
      <Zap size={18} className="fill-[#D4FF00] stroke-[2.5]" />
    </div>
    <span className="text-xl font-black uppercase tracking-tight text-black">
      STAFF<span className="text-zinc-600">SYNC</span>
      <span className="ml-1 text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-black text-[#D4FF00] font-mono font-bold align-top">PRO</span>
    </span>
  </div>
);

export const Toasts = () => {
  const [list, setList] = useState([]);
  useEffect(() => {
    const h = (e) => {
      setList((l) => [...l, e.detail]);
      setTimeout(() => setList((l) => l.filter((x) => x.id !== e.detail.id)), 4000);
    };
    window.addEventListener('toast', h);
    return () => window.removeEventListener('toast', h);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 pointer-events-none">
      {list.map((t) => (
        <div
          key={t.id}
          className="bg-black text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3.5 pointer-events-auto animate-slide-up max-w-md border border-zinc-800"
        >
          <div className="w-7 h-7 rounded-xl bg-[#D4FF00] text-black flex items-center justify-center shrink-0">
            {t.type === 'danger' ? <AlertCircle size={16} className="stroke-[2.5]" /> : <CheckCircle2 size={16} className="stroke-[2.5]" />}
          </div>
          <p className="text-sm font-semibold tracking-wide text-zinc-100 flex-1">{t.message}</p>
        </div>
      ))}
    </div>
  );
};

export const State = ({ loading, error, empty, children }) => {
  if (loading) {
    return (
      <div className="min-h-[250px] flex flex-col items-center justify-center gap-3 text-zinc-500">
        <div className="w-10 h-10 border-4 border-zinc-200 border-t-black rounded-full animate-spin" />
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Loading system data...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3 my-4">
        <AlertCircle size={20} className="text-rose-600 shrink-0" />
        <span className="font-semibold text-sm">{error}</span>
      </div>
    );
  }
  if (empty) {
    return (
      <div className="text-center py-16 px-4 rounded-3xl border border-zinc-200 bg-white">
        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3 text-zinc-400">
          <Info size={24} />
        </div>
        <p className="text-zinc-500 font-medium text-sm">Nothing to display right now.</p>
      </div>
    );
  }
  return children;
};

export const Badge = ({ v }) => {
  const styles = {
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Present: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Late: 'bg-amber-50 text-amber-700 border-amber-200',
    Scheduled: 'bg-zinc-100 text-black border-zinc-300 font-black',
    'Half Day': 'bg-sky-50 text-sky-700 border-sky-200',
    Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    Absent: 'bg-rose-50 text-rose-700 border-rose-200',
    INACTIVE: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    Cancelled: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    Closed: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  }[v] || 'bg-zinc-100 text-zinc-600 border-zinc-200';

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${styles}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      {v}
    </span>
  );
};

export const Table = ({ cols, rows }) => (
  <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
    <table className="w-full text-left text-sm text-zinc-700">
      <thead className="bg-[#F8F9FA] text-[11px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-200">
        <tr>
          {cols.map((c) => (
            <th key={c.h} className="py-4 px-6 font-bold tracking-wider">{c.h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-100">
        {rows.map((r, i) => (
          <tr key={r._id || i} className="hover:bg-zinc-50/80 transition-colors">
            {cols.map((c) => (
              <td key={c.h} className="py-4 px-6 font-medium text-zinc-800">{c.r(r)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const Pager = ({ page, total, limit, set }) => {
  const pages = Math.ceil((total || 0) / limit);
  if (pages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-xs text-zinc-500">
      <div className="font-semibold tracking-wide">
        Showing Page <span className="text-black font-bold">{page}</span> of {pages} · {total} entries recorded
      </div>
      <div className="flex items-center gap-2">
        <button
          className="px-4 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 text-black font-bold disabled:opacity-40 disabled:pointer-events-none transition-all uppercase tracking-wider text-[11px] shadow-sm"
          disabled={page <= 1}
          onClick={() => set(page - 1)}
        >
          Previous
        </button>
        <button
          className="px-4 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 text-black font-bold disabled:opacity-40 disabled:pointer-events-none transition-all uppercase tracking-wider text-[11px] shadow-sm"
          disabled={page >= pages}
          onClick={() => set(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export const Field = ({ label, children }) => (
  <div className="mb-4">
    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">{label}</label>
    {children}
  </div>
);

export const Stat = ({ label, value, icon: Icon }) => (
  <div className="col-span-12 sm:col-span-6 lg:col-span-3">
    <div className="glass-card p-6 h-full flex flex-col justify-between group relative overflow-hidden bg-white">
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">{label}</span>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-black group-hover:scale-110 group-hover:bg-black group-hover:text-white transition-all shadow-sm">
            <Icon size={18} strokeWidth={2.2} />
          </div>
        )}
      </div>
      <div>
        <div className="text-3xl lg:text-4xl font-black tracking-tight text-black group-hover:text-black transition-colors">
          {value ?? '—'}
        </div>
      </div>
    </div>
  </div>
);
