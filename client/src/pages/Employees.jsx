import { useState } from 'react';
import { Search, UserPlus, X } from 'lucide-react';
import api from '../services/api';
import { useFetch, act } from '../utils/hooks';
import { State, Table, Pager, Badge, Field } from '../components/ui';

const blank = {
  name: '',
  email: '',
  password: '',
  role: 'EMPLOYEE',
  employeeId: '',
  department: '',
  designation: '',
  managerId: '',
};

export default function Employees({ title, role }) {
  const [q, setQ] = useState('');
  const [department, setDep] = useState('');
  const [status, setSt] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(null);

  const { data, loading, error, reload } = useFetch('/employees', {
    q,
    department,
    status,
    role,
    page,
    limit: 8,
  });
  const mgrs = useFetch('/employees', { role: 'MANAGER', limit: 100 });

  const save = async (e) => {
    e.preventDefault();
    const { _id, password, ...rest } = form;
    const body = { ...rest, role: role || form.role };
    if (!body.managerId) delete body.managerId;
    const ok = _id
      ? await act(api.put(`/employees/${_id}`, { ...body, role: undefined }), 'Record updated', reload)
      : await act(api.post('/employees', { ...body, password }), 'Account provisioned successfully', reload);
    if (ok) setForm(null);
  };

  const toggle = (u) =>
    window.confirm(`${u.accountStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'} ${u.name}?`) &&
    act(
      api.patch(`/employees/${u._id}/status`, {
        status: u.accountStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
      }),
      'Status changed',
      reload
    );

  const s = (k) => ({
    value: form[k] ?? '',
    onChange: (e) => setForm({ ...form, [k]: e.target.value }),
  });

  return (
    <div>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black">
            {title} Directory
          </h1>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
            Corporate Personnel Grid & Identity Management
          </p>
        </div>
        <button
          className="px-6 py-3 rounded-full bg-black text-white font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all shadow-md flex items-center gap-2"
          onClick={() => setForm({ ...blank, role: role || 'EMPLOYEE' })}
        >
          <UserPlus size={16} />
          <span>Provision {role ? 'Manager' : 'Employee'}</span>
        </button>
      </div>

      {/* Creation / Edit Modal Drawer */}
      {form && (
        <div className="glass-card p-6 md:p-8 mb-8 border-zinc-300 shadow-xl relative animate-slide-up bg-white">
          <div className="flex justify-between items-center mb-6 border-b border-zinc-200 pb-4">
            <h3 className="text-lg font-black uppercase tracking-tight text-black">
              {form._id ? 'Update Personnel Record' : 'Provision New Corporate Identity'}
            </h3>
            <button onClick={() => setForm(null)} className="text-zinc-400 hover:text-black">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={save} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field label="Full Name">
                <input required className="nike-input" placeholder="e.g. Maya Lin" {...s('name')} />
              </Field>

              <Field label="Enterprise Email">
                <input required type="email" className="nike-input" placeholder="name@staffsync.demo" {...s('email')} />
              </Field>

              {!form._id && (
                <Field label="Initial Password (min 8)">
                  <input required minLength={8} className="nike-input" placeholder="••••••••" {...s('password')} />
                </Field>
              )}

              {!form._id && !role && (
                <Field label="System Role">
                  <select className="nike-input bg-white" {...s('role')}>
                    <option value="EMPLOYEE">Standard Employee</option>
                    <option value="MANAGER">Department Manager</option>
                  </select>
                </Field>
              )}

              <Field label="Employee ID Code">
                <input className="nike-input" placeholder="EMP-092" {...s('employeeId')} />
              </Field>

              <Field label="Department">
                <input className="nike-input" placeholder="Engineering, Design, HR" {...s('department')} />
              </Field>

              <Field label="Designation">
                <input className="nike-input" placeholder="Senior Specialist" {...s('designation')} />
              </Field>

              <Field label="Reporting Manager">
                <select className="nike-input bg-white" {...s('managerId')}>
                  <option value="">None (Executive Level)</option>
                  {mgrs.data?.items?.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.department})
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-zinc-200">
              <button
                type="submit"
                className="px-8 py-3 rounded-full bg-black text-white font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all shadow-md"
              >
                Confirm & Save Record
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
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="glass-card p-4 md:p-6 mb-6 flex flex-wrap gap-4 items-center bg-white border-zinc-200">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">
            Search Keyword
          </label>
          <div className="relative">
            <input
              className="nike-input text-xs py-2 pl-9"
              placeholder="Search name, email, or badge code..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          </div>
        </div>

        <div className="w-full sm:w-auto">
          <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">
            Department
          </label>
          <input
            className="nike-input text-xs py-2"
            placeholder="e.g. Technology"
            value={department}
            onChange={(e) => {
              setDep(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="w-full sm:w-auto">
          <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">
            Account Status
          </label>
          <select
            className="nike-input text-xs py-2 bg-white"
            value={status}
            onChange={(e) => {
              setSt(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Accounts</option>
            <option>ACTIVE</option>
            <option>INACTIVE</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-card p-6 border-zinc-200 bg-white">
        <State loading={loading} error={error} empty={data && !data.items.length}>
          {data && (
            <>
              <Table
                rows={data.items}
                cols={[
                  {
                    h: 'Badge ID',
                    r: (u) => <span className="font-mono text-black font-bold">{u.employeeId}</span>,
                  },
                  {
                    h: 'Name & Contact',
                    r: (u) => (
                      <div>
                        <span className="font-bold text-black block">{u.name}</span>
                        <span className="text-[11px] text-zinc-500 font-mono">{u.email}</span>
                      </div>
                    ),
                  },
                  {
                    h: 'Role',
                    r: (u) => (
                      <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                        {u.role}
                      </span>
                    ),
                  },
                  { h: 'Department', r: (u) => <span className="text-zinc-700">{u.department || '—'}</span> },
                  { h: 'Designation', r: (u) => <span className="text-zinc-500">{u.designation || '—'}</span> },
                  { h: 'Reporting Manager', r: (u) => <span className="text-zinc-700">{u.managerId?.name || '—'}</span> },
                  { h: 'Status', r: (u) => <Badge v={u.accountStatus} /> },
                  {
                    h: 'Actions',
                    r: (u) => (
                      <div className="flex items-center gap-2">
                        <button
                          className="px-3 py-1.5 rounded-lg bg-zinc-100 border border-zinc-200 hover:border-black text-[11px] font-bold uppercase tracking-wider transition-colors"
                          onClick={() => setForm({ ...u, managerId: u.managerId?._id || '' })}
                        >
                          Edit
                        </button>
                        <button
                          className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold uppercase tracking-wider transition-colors ${
                            u.accountStatus === 'ACTIVE'
                              ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          }`}
                          onClick={() => toggle(u)}
                        >
                          {u.accountStatus === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    ),
                  },
                ]}
              />
              <Pager page={page} total={data.total} limit={8} set={setPage} />
            </>
          )}
        </State>
      </div>
    </div>
  );
}
