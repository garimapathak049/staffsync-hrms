import { CheckCheck } from 'lucide-react';
import api from '../services/api';
import { useFetch, act } from '../utils/hooks';
import { State } from '../components/ui';

export default function Notifications() {
  const { data, loading, error, reload } = useFetch('/notifications', { limit: 50 });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-zinc-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black">
              Notifications & Alerts
            </h1>
            {data?.unread > 0 && (
              <span className="px-3 py-1 rounded-full bg-rose-500 text-white font-mono font-black text-xs">
                {data.unread} NEW
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
            Realtime Audit Events & Incident Alerts
          </p>
        </div>

        {data?.unread > 0 && (
          <button
            className="px-5 py-2.5 rounded-full bg-zinc-100 border border-zinc-200 hover:border-black text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
            onClick={() => act(api.patch('/notifications/read-all'), 'All alerts acknowledged', reload)}
          >
            <CheckCheck size={16} />
            <span>Acknowledge All</span>
          </button>
        )}
      </div>

      <State loading={loading} error={error} empty={data && !data.items.length}>
        <div className="space-y-3">
          {data?.items?.map((n) => (
            <div
              key={n._id}
              className={`glass-card p-5 border transition-all duration-300 flex justify-between items-start gap-4 bg-white ${
                n.read
                  ? 'border-zinc-200 opacity-70 hover:opacity-100'
                  : 'border-black shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-black border border-zinc-200">
                    {n.category}
                  </span>
                  <span className="text-sm font-bold text-black">{n.title}</span>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                </div>
                <p className="text-xs text-zinc-600 mb-2 leading-relaxed">{n.message}</p>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>

              {!n.read && (
                <button
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 border border-zinc-200 hover:bg-black hover:text-white text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0"
                  onClick={() => act(api.patch(`/notifications/${n._id}/read`), null, reload)}
                >
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      </State>
    </div>
  );
}
