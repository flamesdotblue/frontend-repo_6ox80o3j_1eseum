import { useEffect, useRef } from 'react';

function useScript(src){
  useEffect(()=>{ let s=document.querySelector(`script[src="${src}"]`); if(!s){ s=document.createElement('script'); s.src=src; s.async=true; document.body.appendChild(s);} },[src]);
}

export default function Dashboard({ problems, recommendations, badges }){
  useScript('https://cdn.jsdelivr.net/npm/chart.js');
  useScript('https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js');

  const radarRef=useRef(null), barRef=useRef(null), lineRef=useRef(null), heatRef=useRef(null);

  // stats
  const total=problems.length;
  const solved=problems.filter(p=>p.solved).length;
  const attempts=problems.reduce((a,p)=>a+p.attempts,0)||1;
  const successRate=Math.round((solved/attempts)*100);
  const avgTime=Math.round((problems.reduce((a,p)=>a+Number(p.time||0),0)/(total||1)));
  const streak=computeStreak(problems);

  useEffect(()=>{
    if(!window.Chart) return;
    const by=(k)=> problems.reduce((m,p)=>{ const key=typeof k==='function'?k(p):p[k]; m[key]=(m[key]||0)+1; return m; },{});

    // Radar: pattern mastery
    const patternMap=by('pattern');
    const radar=new Chart(radarRef.current,{ type:'radar', data:{ labels:Object.keys(patternMap), datasets:[{ label:'Mastery', data:Object.values(patternMap), backgroundColor:'rgba(59,130,246,0.2)', borderColor:'#3b82f6' }] }, options:{ scales:{ r:{ angleLines:{color:'rgba(255,255,255,.1)'}, grid:{color:'rgba(255,255,255,.1)'}, pointLabels:{ color: getComputedStyle(document.documentElement).classList.contains('dark')?'#fff':'#0f172a' } } }, plugins:{ legend:{display:false} } });

    // Bar: difficulty distribution
    const diffs=['Easy','Medium','Hard'];
    const diffCounts=diffs.map(d=>problems.filter(p=>p.difficulty===d).length);
    const bar=new Chart(barRef.current,{ type:'bar', data:{ labels:diffs, datasets:[{ data:diffCounts, backgroundColor:['#22c55e','#f59e0b','#ef4444'] }] }, options:{ plugins:{legend:{display:false}}, scales:{x:{grid:{display:false}}, y:{grid:{color:'rgba(255,255,255,.1)'}}} });

    // Line: progress over time
    const byDate=by(p=>p.date);
    const dates=Object.keys(byDate).sort();
    const cum=[]; let sum=0; dates.forEach(d=>{ sum+=byDate[d]; cum.push(sum); });
    const line=new Chart(lineRef.current,{ type:'line', data:{ labels:dates, datasets:[{ data:cum, fill:true, tension:.3, borderColor:'#60a5fa', backgroundColor:'rgba(96,165,250,.2)' }] }, options:{ plugins:{legend:{display:false}}, scales:{x:{grid:{display:false}}, y:{grid:{color:'rgba(255,255,255,.1)'}}} });

    // Heatmap calendar (scatter grid)
    const map=new Map(); problems.forEach(p=>{ const d=new Date(p.date); const key=d.toISOString().slice(0,10); map.set(key, (map.get(key)||0)+1); });
    const today=new Date(); const start=new Date(today); start.setDate(start.getDate()-180);
    const days=[]; for(let dt=new Date(start); dt<=today; dt.setDate(dt.getDate()+1)){ const key=dt.toISOString().slice(0,10); const week=Math.floor((dt-start)/ (7*24*3600*1000)); const dow=(dt.getDay()+6)%7; const val=map.get(key)||0; days.push({x:week, y:dow, r:6, v:val}); }
    const colors=['#0ea5e9','#38bdf8','#93c5fd','#bfdbfe'];
    const heat=new Chart(heatRef.current,{ type:'scatter', data:{ datasets:[{ data:days, pointStyle:'rectRounded', radius: ctx=> Math.max(3, Math.min(8, (ctx.raw.v||0)+3)), backgroundColor: ctx=> `rgba(59,130,246,${0.15 + Math.min(0.7,(ctx.raw.v||0)*0.15)})`, borderWidth:0 }] }, options:{ plugins:{legend:{display:false}}, scales:{ x:{display:false}, y:{display:false} } });

    return ()=>{ radar.destroy(); bar.destroy(); line.destroy(); heat.destroy(); };
  },[problems]);

  useEffect(()=>{
    if(!window.confetti) return;
    if(badges.justUnlocked?.length){ window.confetti({ particleCount: 120, spread: 70, origin: { y: .6 } }); }
  },[badges.justUnlocked]);

  return (
    <section className="mt-6 grid gap-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat title="Total" value={total} />
        <Stat title="Streak 🔥" value={streak} />
        <Stat title="Success %" value={`${successRate}%`} />
        <Stat title="Avg Time" value={`${avgTime}m`} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card><h3 className="card-title">Pattern Mastery</h3><canvas ref={radarRef} height="220"/></Card>
        <Card><h3 className="card-title">Difficulty</h3><canvas ref={barRef} height="220"/></Card>
        <Card><h3 className="card-title">Progress</h3><canvas ref={lineRef} height="220"/></Card>
        <Card><h3 className="card-title">Calendar</h3><canvas ref={heatRef} height="220"/></Card>
      </div>

      <Card>
        <h3 className="card-title">Recommendations</h3>
        <div className="grid md:grid-cols-2 gap-4 mt-2">
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-200 mb-1">Weakest Patterns</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-300 list-disc list-inside">
              {recommendations.weakPatterns.map(p=> <li key={p}>{p}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-200 mb-1">Due for Review</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-300 list-disc list-inside">
              {recommendations.due.map(p=> <li key={p.id}>{p.name} • {p.pattern} • due {new Date(p.nextReview).toLocaleDateString()}</li>)}
            </ul>
          </div>
        </div>
      </Card>

      {!!badges.unlocked.length && (
        <Card>
          <h3 className="card-title">Achievements</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {badges.unlocked.map(b=> <span key={b} className="px-3 py-1 rounded-full bg-blue-600/10 text-blue-700 dark:text-blue-300 border border-blue-600/20 text-sm">{b}</span>)}
          </div>
        </Card>
      )}
    </section>
  );
}

function Stat({title,value}){ return (
  <div className="rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-4">
    <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</div>
    <div className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</div>
  </div>
); }

function Card({children}){ return <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-4">{children}</div>; }

function computeStreak(items){
  const days=new Set(items.map(p=>p.date));
  let streak=0; for(let d=new Date(); ; d.setDate(d.getDate()-1)){ const key=d.toISOString().slice(0,10); if(days.has(key)){ streak++; } else break; }
  return streak;
}
