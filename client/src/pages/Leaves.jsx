import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Send } from 'lucide-react';
import api from '../services/api';
import { useFetch, act, fmt } from '../utils/hooks';
import { State, Table, Pager, Badge, Field } from '../components/ui';

function Mine() {
  const { data, loading, error, reload } = useFetch('/leaves/me');
  const [f, setF] = useState({ leaveType: 'Casual', startDate: '', endDate: '', reason: '' });

  const days = (() => {
    if (!f.startDate || !f.endDate) return 0;
    let n = 0;
    const d = new Date(f.startDate),
      e = new Date(f.endDate);
    while (d <= e) {
      if (![0, 6].includes(d.getUTCDay())) n++;
      d.setUTCDate(d.getUTCDate() + 1);
    }
    return n;
  })();

  const submit = async (e) => {
    e.preventDefault();
    if (await act(api.post('/leaves', f), 'Leave request filed', reload)) {
      setF({ ...f, startDate: '', endDate: '', reason: '' });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Application Form */}
      <div className="lg:col-span-4">
        <form onSubmit={submit} className="glass-card p-6 md:p-8 space-y-5 border-zinc-200 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <Send size={16} className="text-black" />
            <h3 className="text-base font-black uppercase tracking-tight text-black">Request Time Off</h3>
          </div>

          <Field label="Leave Classification">
            <select
              className="nike-input bg-white"
              value={f.leaveType}
              onChange={(e) => setF({ ...f, leaveType: e.target.value })}
            >
              {['Casual', 'Sick', 'Earned', 'Unpaid'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date">
              <input
                required
                type="date"
                className="nike-input text-xs"
                value={f.startDate}
                onChange={(e) => setF({ ...f, startDate: e.target.value })}
              />
            </Field>
            <Field label="End Date">
              <input
                required
                type="date"
                min={f.startDate}
                className="nike-input text-xs"
                value={f.endDate}
                onChange={(e) => setF({ ...f, endDate: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Reason & Details">
            <textarea
              required
              rows={3}
              maxLength={500}
              placeholder="State the purpose of absence..."
              className="nike-input text-xs resize-none"
              value={f.reason}
              onChange={(e) => setF({ ...f, reason: e.target.value })}
            />
          </Field>

          <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-700">
            <span>Billable Working Days (Excl. W/E):</span>
            <span className="font-mono text-black font-black text-sm">{days}d</span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-full bg-black text-white font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all shadow-md"
          >
            Submit Leave Application
          </button>

          {data?.balances && (
            <div className="pt-6 border-t border-zinc-100 space-y-2.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">
                Available Policy Quotas
              </span>
              {Object.entries(data.balances).map(([k, v]) => (
                <div key={k} className="flex justify-between items-center text-xs py-1.5 px-3 rounded-lg bg-zinc-50">
                  <span className="text-zinc-600 font-medium">{k}</span>
                  <span className="font-mono font-bold text-black">
                    {v.remaining} <span className="text-zinc-400 font-normal">/ {v.entitled}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* Requests History List */}
      <div className="lg:col-span-8">
        <div className="glass-card p-6 border-zinc-200 bg-white">
          <h3 className="text-sm font-black uppercase tracking-wider text-black mb-6">
            My Requests Timeline
          </h3>

          <State loading={loading} error={error} empty={data && !data.items.length}>
            {data && (
              <Table
                rows={data.items}
                cols={[
                  { h: 'Classification', r: (x) => <span className="font-bold text-black">{x.leaveType}</span> },
                  { h: 'Timeline', r: (x) => <span className="text-xs font-mono">{`${fmt(x.startDate)} – ${fmt(x.endDate)}`}</span> },
                  { h: 'Days', r: (x) => <span className="text-black font-mono font-bold">{x.days}d</span> },
                  { h: 'Status', r: (x) => <Badge v={x.status} /> },
                  { h: 'Remarks', r: (x) => <span className="text-xs text-zinc-500">{x.reviewRemarks || '—'}</span> },
                  {
                    h: 'Action',
                    r: (x) =>
                      x.status === 'Pending' && (
                        <button
                          className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-bold uppercase tracking-wider transition-colors"
                          onClick={() =>
                            window.confirm('Revoke this leave request?') &&
                            act(api.patch(`/leaves/${x._id}/cancel`), 'Application cancelled', reload)
                          }
                        >
                          Revoke
                        </button>
                      ),
                  },
                ]}
              />
            )}
          </State>
        </div>
      </div>
    </div>
  );
}

function Review({ hr }) {
  const [status, setStatus] = useState('Pending');
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useFetch(hr ? '/leaves' : '/leaves/team', {
    status,
    page,
    limit: 10,
  });

  const decide = (x, decision) => {
    const remarks = window.prompt(`${decision} — optional audit remarks:`);
    if (remarks !== null) {
      act(api.patch(`/leaves/${x._id}/review`, { decision, remarks }), `Application ${decision.toLowerCase()}`, reload);
    }
  };

  return (
    <>
      <div className="glass-card p-4 md:p-6 mb-6 flex items-center justify-between bg-white border-zinc-200">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black uppercase tracking-wider text-zinc-500">Approval State</span>
          <select
            className="nike-input text-xs py-2 w-auto bg-white"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            {['Pending', 'Approved', 'Rejected', 'Cancelled'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-card p-6 border-zinc-200 bg-white">
        <State loading={loading} error={error} empty={data && !data.items.length}>
          {data && (
            <>
              <Table
                rows={data.items}
                cols={[
                  {
                    h: 'Employee',
                    r: (x) => (
                      <div>
                        <span className="font-bold text-black block">{x.employee?.name}</span>
                        <span className="text-[10px] text-zinc-500">{x.employee?.department}</span>
                      </div>
                    ),
                  },
                  { h: 'Classification', r: (x) => <span className="font-bold text-black">{x.leaveType}</span> },
                  {
                    h: 'Timeline',
                    r: (x) => (
                      <span className="font-mono text-xs text-zinc-700">
                        {fmt(x.startDate)} – {fmt(x.endDate)} ({x.days}d)
                      </span>
                    ),
                  },
                  { h: 'Reason', r: (x) => <span className="text-xs text-zinc-600 max-w-xs block truncate">{x.reason}</span> },
                  {
                    h: 'Current State',
                    r: (x) => (
                      <div>
                        <Badge v={x.status} />
                        {x.reviewer && <div className="text-[10px] text-zinc-500 mt-1">Reviewer: {x.reviewer.name}</div>}
                      </div>
                    ),
                  },
                  {
                    h: 'Actions',
                    r: (x) =>
                      x.status === 'Pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white font-black uppercase text-[10px] tracking-wider transition-colors"
                            onClick={() => decide(x, 'Approved')}
                          >
                            Approve
                          </button>
                          <button
                            className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-600 hover:text-white font-black uppercase text-[10px] tracking-wider transition-colors"
                            onClick={() => decide(x, 'Rejected')}
                          >
                            Reject
                          </button>
                        </div>
                      ),
                  },
                ]}
              />
              <Pager page={page} total={data.total} limit={10} set={setPage} />
            </>
          )}
        </State>
      </div>
    </>
  );
}

export default function Leaves() {
  const { user } = useSelector((s) => s.auth);
  return (
    <div>
      <div className="mb-8 border-b border-zinc-200 pb-6">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black">
          {user.role === 'EMPLOYEE' ? 'Leave Quotas & Applications' : 'Leave Verification Workflow'}
        </h1>
        <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
          Atomic Absence Telemetry & Approval Gateways
        </p>
      </div>
      {user.role === 'EMPLOYEE' ? <Mine /> : <Review hr={user.role === 'HR'} />}
    </div>
  );
}
