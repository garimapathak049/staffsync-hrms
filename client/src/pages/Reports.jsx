import { useState } from 'react';
import { Download, FileSpreadsheet, Filter } from 'lucide-react';
import api, { errMsg } from '../services/api';
import { toast } from '../utils/toast';

const R = [
  { key: 'headcount', label: 'Workforce Headcount Ledger', desc: 'Active headcount, departments, managerial reporting tree.' },
  { key: 'attendance', label: 'Attendance Telemetry Logs', desc: 'Atomic clock-ins, duration hours, late anomalies.' },
  { key: 'leaves', label: 'Leave & Absence Audit', desc: 'Approved requests, policy breakdown, review remarks.' },
  { key: 'trainings', label: 'Training Enrollment Records', desc: 'Participant lists, completions, certification tracks.' }
];

export default function Reports() {
  const [f, setF] = useState({ from: '', to: '', department: '' });

  const dl = async (type) => {
    try {
      const r = await api.get(`/analytics/export/${type}`, { params: f, responseType: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(r.data);
      a.download = `${type}-telemetry-export.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast('Export package downloaded successfully', 'success');
    } catch (e) {
      toast(e.response ? 'Export telemetry failed' : errMsg(e), 'danger');
    }
  };

  return (
    <div>
      <div className="mb-8 border-b border-zinc-200 pb-6">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black">
          Enterprise Reports & Data Export
        </h1>
        <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
          Cryptographically Validated Telemetry & CSV Intelligence Exports
        </p>
      </div>

      {/* Date Filter Card */}
      <div className="glass-card p-6 mb-8 border-zinc-200 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} className="text-black" />
          <h3 className="text-xs font-black uppercase tracking-wider text-black">Export Scope Configuration</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">From Date</label>
            <input
              type="date"
              className="nike-input text-xs"
              value={f.from}
              onChange={(e) => setF({ ...f, from: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">To Date</label>
            <input
              type="date"
              className="nike-input text-xs"
              value={f.to}
              onChange={(e) => setF({ ...f, to: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Department Filter</label>
            <input
              className="nike-input text-xs"
              placeholder="e.g. Engineering (Optional)"
              value={f.department}
              onChange={(e) => setF({ ...f, department: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {R.map((item) => (
          <div
            key={item.key}
            className="glass-card p-6 flex flex-col justify-between border-zinc-200 hover:border-black transition-all duration-300 group bg-white"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-black mb-4 group-hover:scale-110 group-hover:bg-black group-hover:text-white transition-all shadow-sm">
                <FileSpreadsheet size={22} />
              </div>
              <h4 className="text-base font-black uppercase tracking-tight text-black mb-2">
                {item.label}
              </h4>
              <p className="text-xs text-zinc-600 font-medium leading-relaxed mb-6">
                {item.desc}
              </p>
            </div>

            <button
              onClick={() => dl(item.key)}
              className="w-full py-3 rounded-full bg-zinc-100 border border-zinc-200 text-black font-black uppercase tracking-widest text-xs hover:bg-black hover:text-white hover:border-black transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
