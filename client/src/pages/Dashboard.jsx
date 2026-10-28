import { useSelector } from 'react-redux';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Users,
  UserCheck,
  UserX,
  FileText,
  GraduationCap,
  Clock,
  Zap,
  Sparkles
} from 'lucide-react';
import { useFetch, fmtT } from '../utils/hooks';
import { State, Stat, Badge } from '../components/ui';

const COL = ['#18181B', '#3B82F6', '#F59E0B', '#EC4899', '#10B981', '#8B5CF6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black text-white p-3 rounded-xl shadow-xl text-xs">
        <p className="font-bold text-zinc-300 mb-1">{label}</p>
        <p className="text-white font-black">{`${payload[0].name || 'Value'}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const Charts = ({ d }) => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
    {/* Attendance Trend Bar Chart */}
    <div className="lg:col-span-6">
      <div className="glass-card p-6 h-full flex flex-col justify-between bg-white">
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              TELEMETRY
            </span>
            <h3 className="text-lg font-bold text-black tracking-tight">Attendance Pulse (7 Days)</h3>
          </div>
          <span className="text-xs text-zinc-500 font-mono">Real-time</span>
        </div>
        <div style={{ height: 260 }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={d.attendanceTrend}>
              <XAxis dataKey="date" stroke="#9CA3AF" tickFormatter={(x) => x.slice(5)} tickLine={false} />
              <YAxis allowDecimals={false} stroke="#9CA3AF" tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="present" fill="#18181B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

    {/* Department Distribution Pie */}
    <div className="lg:col-span-3">
      <div className="glass-card p-6 h-full flex flex-col justify-between bg-white">
        <div className="mb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
            ALLOCATION
          </span>
          <h3 className="text-base font-bold text-black tracking-tight">Department Mix</h3>
        </div>
        <div style={{ height: 260 }} className="w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={d.departments}
                dataKey="value"
                nameKey="label"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={4}
              >
                {d.departments?.map((_, i) => (
                  <Cell key={i} fill={COL[i % COL.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

    {/* Leave Requests Pie */}
    <div className="lg:col-span-3">
      <div className="glass-card p-6 h-full flex flex-col justify-between bg-white">
        <div className="mb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">
            STATUS
          </span>
          <h3 className="text-base font-bold text-black tracking-tight">Leave Balance Status</h3>
        </div>
        <div style={{ height: 260 }} className="w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={d.leaveStatus}
                dataKey="value"
                nameKey="label"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={4}
              >
                {d.leaveStatus?.map((_, i) => (
                  <Cell key={i} fill={COL[i % COL.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </div>
);

function Staff({ url, manager }) {
  const { data, loading, error } = useFetch(url);

  return (
    <State loading={loading} error={error}>
      {data && (
        <>
          <div className="grid grid-cols-12 gap-6">
            <Stat label={manager ? 'Team Headcount' : 'Total Workforce'} value={data.totals.total} icon={Users} />
            <Stat label="Present On-Duty" value={data.totals.presentToday} icon={UserCheck} />
            <Stat label="Absent Today" value={data.totals.absentToday} icon={UserX} />
            <Stat label="Pending Approvals" value={data.totals.pendingLeaves} icon={FileText} />
            {!manager && (
              <>
                <Stat label="Active Personnel" value={data.totals.active} icon={Users} />
                <Stat label="Active Managers" value={data.totals.managers} icon={Users} />
              </>
            )}
            <Stat label="Late Arrivals" value={data.totals.lateToday} icon={Clock} />
            <Stat label="Upcoming Academies" value={data.totals.upcomingTrainings} icon={GraduationCap} />
          </div>

          <Charts d={data} />

          {manager && data.performance && (
            <div className="glass-card p-6 mt-6 border-zinc-200 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-black" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-black">Team Velocity Metrics</h4>
              </div>
              <p className="text-zinc-700 text-sm mb-2">
                Average Working Hours (30 Days): <strong className="text-black font-black">{data.performance.avgWorkingHours30d}h</strong> · Total Logged Sessions: <strong className="text-black">{data.performance.attendanceRecords30d}</strong>
              </p>
              <p className="text-zinc-500 text-xs font-mono">{data.performance.note}</p>
            </div>
          )}
        </>
      )}
    </State>
  );
}

function Employee() {
  const a = useFetch('/attendance/me', { limit: 1 });
  const l = useFetch('/leaves/me');
  const n = useFetch('/announcements', { limit: 3 });
  const t = useFetch('/trainings', { status: 'Scheduled', limit: 3 });

  const today = a.data?.today;
  const pend = l.data?.items.filter((x) => x.status === 'Pending').length;

  return (
    <State loading={a.loading || l.loading} error={a.error || l.error}>
      <div className="grid grid-cols-12 gap-6">
        <Stat
          label="Today's Session"
          value={today ? (today.checkOut ? 'Clocked Out' : today.status) : 'Not Clocked In'}
          icon={UserCheck}
        />
        <Stat label="Check-In Timestamp" value={fmtT(today?.checkIn)} icon={Clock} />
        <Stat label="Check-Out Timestamp" value={fmtT(today?.checkOut)} icon={Clock} />
        <Stat label="Pending Leave Requests" value={pend} icon={FileText} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Balances */}
        <div className="glass-card p-6 flex flex-col justify-between bg-white">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-black">
                Leave Balances
              </h4>
              <span className="text-[10px] text-zinc-500 uppercase">Policy Standard</span>
            </div>
            <div className="space-y-3">
              {l.data &&
                Object.entries(l.data.balances).map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                    <span className="text-xs font-bold text-zinc-700">{k}</span>
                    <span className="text-sm font-black text-black">
                      {v.remaining} <span className="text-xs text-zinc-500 font-normal">/ {v.entitled}</span>
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Announcements */}
        <div className="glass-card p-6 flex flex-col justify-between bg-white">
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-blue-600 mb-4">
              Company Broadcasts
            </h4>
            <div className="space-y-3">
              {n.data?.items.map((x) => (
                <div key={x._id} className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition-colors">
                  <div className="font-bold text-xs text-black mb-1">{x.title}</div>
                  <div className="text-[10px] uppercase font-bold text-zinc-500">{x.category}</div>
                </div>
              ))}
              {!n.data?.items?.length && (
                <span className="text-xs text-zinc-400">No active broadcasts.</span>
              )}
            </div>
          </div>
        </div>

        {/* Trainings */}
        <div className="glass-card p-6 flex flex-col justify-between bg-white">
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-4">
              Development Academies
            </h4>
            <div className="space-y-3">
              {t.data?.items.map((x) => (
                <div key={x._id} className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-black mb-0.5">{x.title}</div>
                    <div className="text-[10px] text-zinc-500">{x.trainer}</div>
                  </div>
                  <Badge v={x.isEnrolled ? 'Approved' : 'Scheduled'} />
                </div>
              ))}
              {!t.data?.items?.length && (
                <span className="text-xs text-zinc-400">No sessions scheduled.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </State>
  );
}

export default function Dashboard() {
  const { user } = useSelector((s) => s.auth);

  return (
    <div>
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-zinc-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-[10px] font-black uppercase tracking-widest text-zinc-700 mb-2">
            <Zap size={12} className="fill-black" /> Enterprise Operational Grid
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black">
            Welcome back, {user.name.split(' ')[0]}.
          </h1>
        </div>
        <div className="text-xs font-mono text-zinc-500">
          Last synchronization: <span className="text-emerald-600 font-bold">Live</span>
        </div>
      </div>

      {user.role === 'HR' ? (
        <Staff url="/analytics/hr" />
      ) : user.role === 'MANAGER' ? (
        <Staff url="/analytics/manager" manager />
      ) : (
        <Employee />
      )}
    </div>
  );
}
