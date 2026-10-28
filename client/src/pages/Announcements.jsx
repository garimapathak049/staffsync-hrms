import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus, X } from 'lucide-react';
import api from '../services/api';
import { useFetch, act, fmt } from '../utils/hooks';
import { State, Badge, Field } from '../components/ui';

export default function Announcements() {
  const { user } = useSelector((s) => s.auth);
  const hr = user.role === 'HR';
  const [cat, setCat] = useState('');
  const [form, setForm] = useState(null);
  const [open, setOpen] = useState(null);

  const { data, loading, error, reload } = useFetch('/announcements', { category: cat, limit: 20 });

  const save = async (e) => {
    e.preventDefault();
    const { _id, title, description, category, expiresAt } = form;
    const b = { title, description, category, ...(expiresAt && { expiresAt }) };
    if (
      await act(
        _id ? api.put(`/announcements/${_id}`, b) : api.post('/announcements', b),
        'Announcement broadcast saved',
        reload
      )
    ) {
      setForm(null);
    }
  };

  return (
    <div>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black">
            Company Broadcasts
          </h1>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
            Realtime Operational Notices & Organization Circulars
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            className="nike-input text-xs py-2.5 bg-white w-full sm:w-auto"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
          >
            <option value="">All Categories</option>
            {['General', 'Policy', 'Event', 'Holiday', 'Urgent'].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          {hr && (
            <button
              className="px-6 py-2.5 rounded-full bg-black text-white font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all shadow-md flex items-center gap-2 shrink-0"
              onClick={() => setForm({ title: '', description: '', category: 'General' })}
            >
              <Plus size={16} />
              <span>Broadcast Notice</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor Drawer */}
      {form && (
        <form onSubmit={save} className="glass-card p-6 md:p-8 mb-8 border-zinc-300 shadow-xl space-y-4 animate-slide-up bg-white">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-black uppercase tracking-tight text-black">
              {form._id ? 'Edit Company Circular' : 'Compose New Enterprise Notice'}
            </h3>
            <button type="button" onClick={() => setForm(null)} className="text-zinc-400 hover:text-black">
              <X size={20} />
            </button>
          </div>

          <Field label="Announcement Title">
            <input
              required
              className="nike-input"
              placeholder="e.g. Q4 Townhall & Product Strategy Briefing"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Field>

          <Field label="Detailed Information">
            <textarea
              required
              rows={4}
              className="nike-input resize-none"
              placeholder="Enter full memo..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Category Tag">
              <select
                className="nike-input bg-white"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {['General', 'Policy', 'Event', 'Holiday', 'Urgent'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>

            <Field label="Expiration Date (Optional)">
              <input
                type="date"
                className="nike-input text-xs"
                value={form.expiresAt?.slice(0, 10) || ''}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              />
            </Field>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-zinc-200">
            <button
              type="submit"
              className="px-8 py-3 rounded-full bg-black text-white font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all shadow-md"
            >
              Post Broadcast
            </button>
            <button
              type="button"
              className="px-6 py-3 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 hover:text-black text-xs font-bold uppercase tracking-wider transition-colors"
              onClick={() => setForm(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Announcements Stream */}
      <State loading={loading} error={error} empty={data && !data.items.length}>
        <div className="space-y-4">
          {data?.items?.map((a) => (
            <div
              key={a._id}
              className="glass-card p-6 border-zinc-200 hover:border-black transition-all duration-300 bg-white"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div
                  className="cursor-pointer flex-1"
                  onClick={() => setOpen(open === a._id ? null : a._id)}
                >
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-zinc-100 text-black border border-zinc-200">
                      {a.category}
                    </span>
                    {hr && <Badge v={a.published ? 'Approved' : 'Pending'} />}
                    <h3 className="text-lg font-bold text-black tracking-tight">{a.title}</h3>
                  </div>
                  <div className="text-xs text-zinc-500 font-mono">
                    Author: <span className="text-zinc-800 font-bold">{a.author?.name}</span> · {fmt(a.publishedAt || a.createdAt)}
                  </div>
                </div>

                {hr && (
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      className="px-3 py-1.5 rounded-lg bg-zinc-100 border border-zinc-200 hover:border-black text-xs font-bold uppercase tracking-wider transition-colors"
                      onClick={() => setForm({ ...a })}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-lg bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 text-xs font-bold uppercase tracking-wider transition-colors"
                      onClick={() =>
                        act(
                          api.patch(`/announcements/${a._id}/publish`, { published: !a.published }),
                          a.published ? 'Notice un-published' : 'Notice published to feed',
                          reload
                        )
                      }
                    >
                      {a.published ? 'Retract' : 'Publish'}
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold uppercase tracking-wider transition-colors"
                      onClick={() =>
                        window.confirm('Delete this announcement?') &&
                        act(api.delete(`/announcements/${a._id}`), 'Deleted', reload)
                      }
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {open === a._id && (
                <div className="mt-4 pt-4 border-t border-zinc-100 text-sm text-zinc-700 leading-relaxed animate-slide-up">
                  {a.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </State>
    </div>
  );
}
