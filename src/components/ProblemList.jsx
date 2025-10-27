import { useMemo, useState } from 'react';

export default function ProblemList({ items, onChange, remove }){
  const [q,setQ]=useState('');
  const [sort,setSort]=useState('date');

  const filtered=useMemo(()=>{
    const s= q.toLowerCase();
    const arr = items.filter(p=> p.name.toLowerCase().includes(s));
    const cmp = { date:(a,b)=> b.date.localeCompare(a.date), time:(a,b)=> (a.time||0)-(b.time||0), attempts:(a,b)=> (a.attempts||0)-(b.attempts||0) }[sort];
    return [...arr].sort(cmp);
  },[items,q,sort]);

  return (
    <section className="mt-6">
      <div className="flex items-center gap-3 mb-2">
        <input placeholder="Search" value={q} onChange={e=>setQ(e.target.value)} className="w-full md:w-64 rounded-lg border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 px-3 py-2 text-sm outline-none"/>
        <select value={sort} onChange={e=>setSort(e.target.value)} className="rounded-lg border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 px-3 py-2 text-sm outline-none">
          <option value="date">Newest</option>
          <option value="time">Time</option>
          <option value="attempts">Attempts</option>
        </select>
      </div>
      <div className="rounded-xl border border-black/5 dark:border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500">
            <tr>
              <Th>Name</Th><Th>Diff</Th><Th>Pattern</Th><Th>Companies</Th><Th>Time</Th><Th>Attempts</Th><Th>Date</Th><Th></Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/10">
            {filtered.map(p=> <Row key={p.id} p={p} onChange={onChange} remove={remove} />)}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Th({children}){ return <th className="text-left font-medium py-2 px-3">{children}</th>; }

function Row({ p, onChange, remove }){
  const [edit,setEdit]=useState(false);
  const [form,setForm]=useState(p);
  const save=()=>{ onChange(form); setEdit(false); };
  return (
    <tr className="hover:bg-slate-50/60 dark:hover:bg-white/5">
      <Td>{edit? <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className="cell-input"/> : p.name}</Td>
      <Td>{edit? <select value={form.difficulty} onChange={e=>setForm(f=>({...f,difficulty:e.target.value}))} className="cell-input"><option>Easy</option><option>Medium</option><option>Hard</option></select> : p.difficulty}</Td>
      <Td>{edit? <input value={form.pattern} onChange={e=>setForm(f=>({...f,pattern:e.target.value}))} className="cell-input"/> : p.pattern}</Td>
      <Td>{edit? <input value={(form.companies||[]).join(', ')} onChange={e=>setForm(f=>({...f,companies:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}))} className="cell-input"/> : (p.companies||[]).join(', ')}</Td>
      <Td>{edit? <input type="number" value={form.time} onChange={e=>setForm(f=>({...f,time:+e.target.value}))} className="cell-input"/> : `${p.time}m`}</Td>
      <Td>{edit? <input type="number" value={form.attempts} onChange={e=>setForm(f=>({...f,attempts:+e.target.value}))} className="cell-input"/> : p.attempts}</Td>
      <Td>{edit? <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} className="cell-input"/> : p.date}</Td>
      <Td>
        {edit ? (
          <div className="flex gap-2">
            <button onClick={save} className="px-2 py-1 text-xs rounded bg-blue-600 text-white">Save</button>
            <button onClick={()=>setEdit(false)} className="px-2 py-1 text-xs rounded bg-slate-200 dark:bg-slate-700">Cancel</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button onClick={()=>setEdit(true)} className="px-2 py-1 text-xs rounded bg-slate-200 dark:bg-slate-700">Edit</button>
            <button onClick={()=>remove(p.id)} className="px-2 py-1 text-xs rounded bg-red-500/90 text-white">Delete</button>
          </div>
        )}
      </Td>
    </tr>
  );
}

function Td({children}){ return <td className="py-2 px-3 text-slate-700 dark:text-slate-200">{children}</td>; }
