import { useEffect, useMemo, useState } from 'react';

const DIFFICULTIES = ['Easy','Medium','Hard'];
export const PATTERNS = ['Arrays','Two Pointers','Sliding Window','Binary Search','Linked Lists','Trees','Backtracking','Graphs','DP-1D','DP-2D','Greedy','Intervals','Heap','Bit Manipulation','Math'];
const COMPANIES = ['Google','Meta','Amazon','Microsoft','Apple','Uber'];

export default function Controls({ onAdd, filters, setFilters, theme, setTheme, onExport, onImport }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name:'', difficulty:'Easy', pattern:'Arrays', company:'', time:30, attempts:1, date: new Date().toISOString().slice(0,10), solved:true });

  useEffect(()=>{ document.documentElement.classList.toggle('dark', theme==='dark'); },[theme]);

  const update = (k,v)=> setForm(p=>({...p,[k]:v}));
  const submit = (e)=>{ e.preventDefault(); onAdd({ ...form, id: crypto.randomUUID(), companies: form.company.split(',').map(s=>s.trim()).filter(Boolean) }); setOpen(false); setForm(f=>({...f, name:''})); };

  const FilterPill = ({label, children})=> (
    <div className="flex items-center gap-2 bg-white/70 dark:bg-white/5 backdrop-blur px-3 py-2 rounded-xl border border-black/5 dark:border-white/10">
      <span className="text-xs text-slate-600 dark:text-slate-300">{label}</span>{children}
    </div>
  );

  return (
    <div className="mt-6 flex flex-col md:flex-row md:items-center gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={()=>setOpen(true)} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition">Quick Add</button>
        <FilterPill label="Pattern">
          <select value={filters.pattern} onChange={e=>setFilters(s=>({...s, pattern:e.target.value}))} className="bg-transparent outline-none text-sm">
            <option value="">All</option>
            {PATTERNS.map(p=> <option key={p} value={p}>{p}</option>)}
          </select>
        </FilterPill>
        <FilterPill label="Difficulty">
          <select value={filters.difficulty} onChange={e=>setFilters(s=>({...s, difficulty:e.target.value}))} className="bg-transparent outline-none text-sm">
            <option value="">All</option>
            {DIFFICULTIES.map(d=> <option key={d} value={d}>{d}</option>)}
          </select>
        </FilterPill>
        <FilterPill label="Company">
          <select value={filters.company} onChange={e=>setFilters(s=>({...s, company:e.target.value}))} className="bg-transparent outline-none text-sm">
            <option value="">All</option>
            {COMPANIES.map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
        </FilterPill>
      </div>
      <div className="flex items-center gap-2 md:ml-auto">
        <button onClick={onExport} className="px-3 py-2 text-sm rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700">Export</button>
        <label className="px-3 py-2 text-sm rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer">
          Import<input type="file" accept="application/json" className="hidden" onChange={e=>onImport(e.target.files?.[0])} />
        </label>
        <button onClick={()=>setTheme(t=>t==='light'?'dark':'light')} className="px-3 py-2 text-sm rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">{theme==='light'?'Dark':'Light'}</button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <form onSubmit={submit} className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl p-5 grid grid-cols-2 gap-3 border border-black/10 dark:border-white/10">
            <h3 className="col-span-2 text-lg font-semibold">Quick Add Problem</h3>
            <input required placeholder="Name" value={form.name} onChange={e=>update('name',e.target.value)} className="col-span-2 input" />
            <select value={form.difficulty} onChange={e=>update('difficulty',e.target.value)} className="input">
              {DIFFICULTIES.map(d=> <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={form.pattern} onChange={e=>update('pattern',e.target.value)} className="input">
              {PATTERNS.map(p=> <option key={p} value={p}>{p}</option>)}
            </select>
            <input placeholder="Company (comma)" value={form.company} onChange={e=>update('company',e.target.value)} className="input col-span-2" />
            <input type="number" min="1" placeholder="Time (min)" value={form.time} onChange={e=>update('time',+e.target.value)} className="input"/>
            <input type="number" min="1" placeholder="Attempts" value={form.attempts} onChange={e=>update('attempts',+e.target.value)} className="input"/>
            <input type="date" value={form.date} onChange={e=>update('date',e.target.value)} className="input"/>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.solved} onChange={e=>update('solved',e.target.checked)} />Solved</label>
            <div className="col-span-2 flex justify-end gap-2 mt-2">
              <button type="button" onClick={()=>setOpen(false)} className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800">Cancel</button>
              <button className="px-4 py-2 rounded-lg bg-blue-600 text-white">Add</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// minimal input style
export const inputStyles = `input,input[type=date],select{ @apply w-full rounded-lg border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 px-3 py-2 text-sm outline-none; }`;
