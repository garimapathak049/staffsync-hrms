import { useState } from 'react';
import { Search } from 'lucide-react';
import { useFetch } from '../utils/hooks';
import { State, Table, Badge } from '../components/ui';

export default function Team() {
  const { data, loading, error } = useFetch('/employees/team');
  const [q, setQ] = useState('');

  const rows =
    data?.items?.filter((u) =>
      `${u.name} ${u.employeeId}`.toLowerCase().includes(q.toLowerCase())
    ) || [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black">
            Team Squad Roster
          </h1>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
            Direct Reporting Personnel & Operational Capacity
          </p>
        </div>

        <div className="w-full sm:w-auto relative">
          <input
            className="nike-input text-xs py-2.5 pl-9 w-full sm:w-72"
            placeholder="Search team member..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        </div>
      </div>

      <div className="glass-card p-6 border-zinc-200 bg-white">
        <State loading={loading} error={error} empty={!rows.length}>
          <Table
            rows={rows}
            cols={[
              {
                h: 'Badge Code',
                r: (u) => <span className="font-mono text-black font-bold">{u.employeeId}</span>,
              },
              {
                h: 'Personnel Name',
                r: (u) => <span className="font-bold text-black block">{u.name}</span>,
              },
              { h: 'Department', r: (u) => <span className="text-zinc-700">{u.department}</span> },
              { h: 'Designation', r: (u) => <span className="text-zinc-500">{u.designation}</span> },
              { h: 'Contact Mobile', r: (u) => <span className="font-mono text-xs text-zinc-600">{u.phone || '—'}</span> },
              { h: 'Status', r: (u) => <Badge v={u.accountStatus} /> },
            ]}
          />
        </State>
      </div>
    </div>
  );
}
