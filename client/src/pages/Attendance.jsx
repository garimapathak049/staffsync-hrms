import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Clock, LogIn, LogOut } from 'lucide-react';
import api from '../services/api';
import { useFetch, act, fmtT } from '../utils/hooks';
import { State, Table, Pager, Badge } from '../components/ui';

function Mine() {
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useFetch('/attendance/me', { page, limit: 7 });
  const t = data?.today;
  const total = data?.items?.reduce((s, x) => s + x.workingHours, 0) || 0;

  return (
    <>
      {/* Check In / Out Hero Card */}
      <div className="glass-card p-6 md:p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-zinc-200 bg-white relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-black shadow-sm">
            <Clock size={28} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Current Session</span>
            <h3 className="text-xl md:text-2xl font-black text-black uppercase tracking-tight">
              {t ? (t.checkOut ? 'Day Completed' : `Checked in at ${fmtT(t.checkIn)}`) : 'Session Inactive'}
            </h3>
            <p className="text-xs text-zinc-500 font-medium">Biometric atomic server timestamp enabled.</p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4 w-full md:w-auto">
          {!t ? (
            <button
              className="w-full md:w-auto px-8 py-3.5 rounded-full bg-black text-white font-black uppercase tracking-widest text-xs hover:bg-zinc-800 hover:scale-105 transition-all shadow-md flex items-center justify-center gap-2"
              onClick={() => act(api.post('/attendance/check-in'), 'Clock-in verified', reload)}
            >
              <LogIn size={16} />
              <span>Clock In Now</span>
            </button>
          ) : !t.checkOut ? (
            <button
              className="w-full md:w-auto px-8 py-3.5 rounded-full bg-rose-600 text-white font-black uppercase tracking-widest text-xs hover:bg-rose-700 hover:scale-105 transition-all shadow-md flex items-center justify-center gap-2"
              onClick={() => act(api.post('/attendance/check-out'), 'Clock-out logged', reload)}
            >
              <LogOut size={16} />
              <span>Clock Out</span>
            </button>
          ) : (
            <Badge v={t.status} />
          )}
        </div>
      </div>

      {/* History Table */}
      <div className="glass-card p-6 border-zinc-200 bg-white">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-sm font-black uppercase tracking-wider text-black">Attendance Log History</h4>
          <span className="text-xs font-mono text-zinc-500">
            Total Hours Logged: <strong className="text-black font-black">{total.toFixed(2)}h</strong>
          </span>
        </div>

        <State loading={loading} error={error} empty={data && !data.items.length}>
          {data && (
            <>
              <Table
                rows={data.items}
                cols={[
                  { h: 'Date', r: (x) => <span className="font-mono text-black font-bold">{x.date}</span> },
                  { h: 'Time In', r: (x) => fmtT(x.checkIn) },
                  { h: 'Time Out', r: (x) => fmtT(x.checkOut) },
                  { h: 'Logged Hours', r: (x) => <span className="text-black font-bold">{x.workingHours}h</span> },
                  { h: 'Status', r: (x) => <Badge v={x.status} /> },
                ]}
              />
              <Pager page={page} total={data.total} limit={7} set={setPage} />
            </>
          )}
        </State>
      </div>
    </>
  );
}

function Staff({ hr }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useFetch(hr ? '/attendance' : '/attendance/team', {
    date,
    status,
    page,
    limit: 10,
  });

  const fix = (r) => {
    const reason = window.prompt('Reason for correction (required):');
    if (reason?.trim()) {
      const newStatus = window.prompt('New status (Present, Late, Half Day, Absent):', r.status);
      act(api.patch(`/attendance/${r._id}/correct`, { reason, status: newStatus }), 'Record corrected', reload);
    }
  };

  return (
    <>
      {/* Filters Bar */}
      <div className="glass-card p-4 md:p-6 mb-6 flex flex-wrap gap-4 items-center bg-white border-zinc-200">
        <div className="w-full sm:w-auto">
          <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Filter Date</label>
          <input
            type="date"
            className="nike-input text-xs py-2"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-full sm:w-auto">
          <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Status Classification</label>
          <select
            className="nike-input text-xs py-2 bg-white"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option>Present</option>
            <option>Late</option>
            <option>Half Day</option>
            <option>Absent</option>
          </select>
        </div>
      </div>

      {/* Main Attendance Table */}
      <div className="glass-card p-6 border-zinc-200 bg-white mb-6">
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
                        <span className="text-[10px] font-mono text-zinc-500">{x.employee?.employeeId}</span>
                      </div>
                    ),
                  },
                  { h: 'Department', r: (x) => <span className="text-zinc-700">{x.employee?.department}</span> },
                  { h: 'Time In', r: (x) => fmtT(x.checkIn) },
                  { h: 'Time Out', r: (x) => fmtT(x.checkOut) },
                  { h: 'Duration', r: (x) => <span className="text-black font-black">{x.workingHours}h</span> },
                  { h: 'Status', r: (x) => <Badge v={x.status} /> },
                  ...(hr
                    ? [
                        {
                          h: 'Actions',
                          r: (x) => (
                            <button
                              className="px-3 py-1.5 rounded-lg bg-zinc-100 border border-zinc-200 hover:border-black text-[11px] font-bold uppercase tracking-wider transition-colors"
                              onClick={() => fix(x)}
                            >
                              Correct
                            </button>
                          ),
                        },
                      ]
                    : []),
                ]}
              />
              <Pager page={page} total={data.total} limit={10} set={setPage} />
            </>
          )}
        </State>
      </div>

      {data?.notMarked?.length > 0 && (
        <div className="glass-card p-6 border-zinc-200 bg-white">
          <h4 className="text-xs font-black uppercase tracking-wider text-rose-600 mb-3">
            Personnel Not Clocked In ({date})
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.notMarked.map((u) => (
              <span
                key={u._id}
                className="px-3 py-1 rounded-xl bg-zinc-100 border border-zinc-200 text-xs font-medium text-zinc-700"
              >
                {u.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default function Attendance() {
  const { user } = useSelector((s) => s.auth);
  return (
    <div>
      <div className="mb-8 border-b border-zinc-200 pb-6">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black">
          Attendance Operations
        </h1>
        <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
          {user.role === 'EMPLOYEE' ? 'Personal Shift Telemetry' : 'Workforce Presence Management'}
        </p>
      </div>
      {user.role === 'EMPLOYEE' ? <Mine /> : <Staff hr={user.role === 'HR'} />}
    </div>
  );
}
