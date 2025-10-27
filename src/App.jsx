import { useEffect, useMemo, useState } from 'react';
import Hero from './components/Hero';
import Controls, { PATTERNS } from './components/Controls';
import Dashboard from './components/Dashboard';
import ProblemList from './components/ProblemList';

const sample = ()=>[
  {id:crypto.randomUUID(),name:'Two Sum',difficulty:'Easy',pattern:'Arrays',companies:['Google'],time:10,attempts:1,date:dateShift(-10),solved:true},
  {id:crypto.randomUUID(),name:'Longest Substring',difficulty:'Medium',pattern:'Sliding Window',companies:['Meta'],time:35,attempts:2,date:dateShift(-9),solved:true},
  {id:crypto.randomUUID(),name:'Merge Two Lists',difficulty:'Easy',pattern:'Linked Lists',companies:['Amazon'],time:15,attempts:1,date:dateShift(-8),solved:true},
  {id:crypto.randomUUID(),name:'Binary Search',difficulty:'Easy',pattern:'Binary Search',companies:['Google'],time:8,attempts:1,date:dateShift(-7),solved:true},
  {id:crypto.randomUUID(),name:'Combination Sum',difficulty:'Medium',pattern:'Backtracking',companies:['Apple'],time:50,attempts:2,date:dateShift(-6),solved:true},
  {id:crypto.randomUUID(),name:'Course Schedule',difficulty:'Medium',pattern:'Graphs',companies:['Uber'],time:45,attempts:2,date:dateShift(-5),solved:true},
  {id:crypto.randomUUID(),name:'House Robber',difficulty:'Medium',pattern:'DP-1D',companies:['Amazon'],time:30,attempts:1,date:dateShift(-4),solved:true},
  {id:crypto.randomUUID(),name:'Maximal Square',difficulty:'Medium',pattern:'DP-2D',companies:['Google'],time:60,attempts:3,date:dateShift(-3),solved:true},
  {id:crypto.randomUUID(),name:'Insert Interval',difficulty:'Medium',pattern:'Intervals',companies:['Meta'],time:25,attempts:1,date:dateShift(-2),solved:true},
  {id:crypto.randomUUID(),name:'Single Number',difficulty:'Easy',pattern:'Bit Manipulation',companies:['Microsoft'],time:12,attempts:1,date:dateShift(-1),solved:true},
];

const getStore=()=> JSON.parse(localStorage.getItem('leetpattern')||'null');
const setStore=(data)=> localStorage.setItem('leetpattern', JSON.stringify(data));

export default function App(){
  const [state,setState]=useState(()=> getStore() || { problems: sample(), theme:'dark' });
  const [filters,setFilters]=useState({ pattern:'', difficulty:'', company:'' });

  useEffect(()=> setStore(state),[state]);

  const add = (p)=> setState(s=> ({...s, problems:[p, ...s.problems]}));
  const update = (p)=> setState(s=> ({...s, problems: s.problems.map(x=> x.id===p.id? p : x)}));
  const remove = (id)=> setState(s=> ({...s, problems: s.problems.filter(x=> x.id!==id)}));

  const filtered = useMemo(()=> state.problems.filter(p=>
    (!filters.pattern || p.pattern===filters.pattern)
    && (!filters.difficulty || p.difficulty===filters.difficulty)
    && (!filters.company || (p.companies||[]).includes(filters.company))
  ),[state.problems, filters]);

  const recs = useMemo(()=> recommendations(state.problems),[state.problems]);
  const badges = useMemo(()=> achievements(state.problems),[state.problems]);

  const exportJson = ()=>{
    const blob=new Blob([JSON.stringify(state)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='leetpattern-backup.json'; a.click(); URL.revokeObjectURL(a.href);
  };
  const importJson = async(file)=>{ if(!file) return; const text=await file.text(); try{ const data=JSON.parse(text); if(data?.problems){ setState(data); } }catch{} };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-900 dark:text-white px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <Hero theme={state.theme} />
        <nav className="mt-6 flex flex-wrap items-center gap-3">
          {['Dashboard','Problems'].map(tab=> <a key={tab} href={`#${tab.toLowerCase()}`} className="px-3 py-2 rounded-lg bg-white/10 text-slate-200">{tab}</a>)}
        </nav>
        <Controls onAdd={add} filters={filters} setFilters={setFilters} theme={state.theme} setTheme={t=>setState(s=>({...s, theme:t}))} onExport={exportJson} onImport={importJson} />
        <Dashboard problems={filtered} recommendations={recs} badges={badges} />
        <ProblemList items={filtered} onChange={update} remove={remove} />
        <footer className="mt-10 text-center text-sm text-slate-500">Built for speed. Data stays in your browser.</footer>
      </div>
    </div>
  );
}

function dateShift(n){ const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); }

function recommendations(items){
  // weakest patterns: least solved among patterns present
  const counts = PATTERNS.map(p=> ({p, c: items.filter(i=>i.pattern===p).length}));
  const weak = counts.sort((a,b)=>a.c-b.c).slice(0,3).map(x=>x.p);
  // spaced repetition
  const due = items.map(i=>({
    ...i,
    nextReview: new Date(new Date(i.date).getTime() + 14*24*3600*1000 * (i.attempts||1)).toISOString()
  })).filter(i=> new Date(i.nextReview) <= new Date()).sort((a,b)=> new Date(a.nextReview)-new Date(b.nextReview)).slice(0,5);
  return { weakPatterns: weak, due };
}

function achievements(items){
  const thresholds=[1,10,50,100,300];
  const solved=items.length;
  const unlocked = thresholds.filter(t=> solved>=t).map(t=> `Solved ${t}`);
  const prev = getStore()?.badgesUnlocked || [];
  const justUnlocked = unlocked.filter(u=> !prev.includes(u));
  // persist along with state next tick
  setTimeout(()=>{ const s=getStore(); if(s){ s.badgesUnlocked=unlocked; setStore(s); } },0);
  return { unlocked, justUnlocked };
}
