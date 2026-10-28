import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Calendar, MapPin, Users } from 'lucide-react';
import api from '../services/api';
import { useFetch, act, fmt } from '../utils/hooks';
import { State, Badge, Field } from '../components/ui';

export default function Trainings() {
  const { user } = useSelector((s) => s.auth);
  const manage = user.role !== 'EMPLOYEE';
  const [form, setForm] = useState(null);

  const { data, loading, error, reload } = useFetch('/trainings', { limit: 30 });

  const mine = (t) => user.role === 'HR' || t.createdBy?._id === user._id || t.createdBy === user._id;

  const save = async (e) => {
    e.preventDefault();
    const { _id, title, description, instructor, startDate, endDate, location, capacity, department } = form;
    const b = {
      title,
      description,
      instructor,
      startDate,
      endDate,
      location,
      capacity: Number(capacity),
      ...(user.role === 'HR' && department && { department }),
    };
    if (await act(_id ? api.put(`/trainings/${_id}`, b) : api.post('/trainings', b), 'Training program updated', reload)) {
      setForm(null);
    }
  };

  const f = (k, p = {}) => (
    <input
      className="nike-input text-xs"
      required={k !== 'location' && k !== 'department'}
      placeholder={k}
      {...p}
      value={form[k] ?? ''}
      onChange={(e) => setForm({ ...form, [k]: e.target.value })}
    />
  );

  return (
    <div>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black">
            Development Academies
          </h1>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
            Skill Expansion Programs & Professional Accreditations
          </p>
        </div>

        {manage && (
          <button
            className="px-6 py-2.5 rounded-full bg-black text-white font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all shadow-md flex items-center gap-2"
            onClick={() => setForm({ capacity: 20 })}
          >
            <Plus size={16} />
            <span>Launch Academy Program</span>
          </button>
        )}
      </div>

      {/* Editor Drawer */}
      {form && (
        <form onSubmit={save} className="glass-card p-6 md:p-8 mb-8 border-zinc-300 shadow-xl space-y-4 animate-slide-up bg-white">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-black uppercase tracking-tight text-black">
              {form._id ? 'Edit Academy Module' : 'Architect New Training Course'}
            </h3>
            <button type="button" onClick={() => setForm(null)} className="text-zinc-400 hover:text-black">
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Program Title">{f('title', { placeholder: 'e.g. Advanced System Architecture' })}</Field>
            <Field label="Lead Instructor / Specialist">{f('instructor', { placeholder: 'e.g. Dr. Alex Mercer' })}</Field>
          </div>

          <Field label="Course Description & Learning Outcomes">
            <textarea
              required
              rows={3}
              className="nike-input text-xs resize-none"
              placeholder="Outline curriculum..."
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Start Time">{f('startDate', { type: 'datetime-local' })}</Field>
            <Field label="End Time">{f('endDate', { type: 'datetime-local' })}</Field>
            <Field label="Location / Virtual Link">{f('location', { placeholder: 'Room 402 / Zoom' })}</Field>
            <Field label="Seat Capacity">{f('capacity', { type: 'number', min: 1 })}</Field>
          </div>

          {user.role === 'HR' && (
            <Field label="Department Scope (Optional)">{f('department', { placeholder: 'All or Department specific' })}</Field>
          )}

          <div className="flex items-center gap-3 pt-4 border-t border-zinc-200">
            <button
              type="submit"
              className="px-8 py-3 rounded-full bg-black text-white font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all shadow-md"
            >
              Save Academy
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

      {/* Grid of Trainings */}
      <State loading={loading} error={error} empty={data && !data.items.length}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data?.items?.map((t) => (
            <div
              key={t._id}
              className="glass-card p-6 md:p-8 flex flex-col justify-between border-zinc-200 hover:border-black transition-all duration-300 group bg-white"
            >
              <div>
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-1">
                      Instructor: {t.instructor}
                    </span>
                    <h3 className="text-xl font-black text-black uppercase tracking-tight group-hover:text-black transition-colors">
                      {t.title}
                    </h3>
                  </div>
                  <Badge v={t.status} />
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 mb-4 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-black" />
                    {fmt(t.startDate)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-zinc-600" />
                    {t.location || 'Remote'}
                  </span>
                </div>

                <p className="text-sm text-zinc-600 mb-6 leading-relaxed font-medium">
                  {t.description}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-black">
                    <Users size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-black block">
                      {t.enrolledCount} / {t.capacity} Enrolled
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                      {t.capacity - t.enrolledCount} Spots Available
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {user.role !== 'HR' && (
                    t.isEnrolled ? (
                      <button
                        className="px-4 py-2 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-black uppercase tracking-wider transition-colors"
                        onClick={() =>
                          act(api.delete(`/trainings/${t._id}/enroll`), 'Enrollment cancelled', reload)
                        }
                      >
                        Cancel Seat
                      </button>
                    ) : (
                      <button
                        className="px-6 py-2 rounded-full bg-black text-white font-black uppercase tracking-wider text-xs hover:bg-zinc-800 disabled:opacity-40 transition-all shadow-md"
                        disabled={t.status !== 'Scheduled' || t.enrolledCount >= t.capacity}
                        onClick={() => act(api.post(`/trainings/${t._id}/enroll`), 'Enrolled into academy', reload)}
                      >
                        {t.enrolledCount >= t.capacity ? 'Class Full' : 'Claim Seat'}
                      </button>
                    )
                  )}

                  {manage && mine(t) && (
                    <div className="flex items-center gap-1">
                      <button
                        className="px-3 py-1.5 rounded-lg bg-zinc-100 border border-zinc-200 hover:border-black text-[11px] font-bold uppercase tracking-wider transition-colors"
                        onClick={() =>
                          setForm({
                            ...t,
                            startDate: t.startDate?.slice(0, 16),
                            endDate: t.endDate?.slice(0, 16),
                          })
                        }
                      >
                        Edit
                      </button>
                      {['Completed', 'Closed'].map((s) => (
                        <button
                          key={s}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 text-[10px] font-bold uppercase tracking-wider transition-colors"
                          onClick={() =>
                            window.confirm(`Mark as ${s}?`) &&
                            act(api.patch(`/trainings/${t._id}/status`, { status: s }), 'Status updated', reload)
                          }
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </State>
    </div>
  );
}
