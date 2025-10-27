import Spline from '@splinetool/react-spline';

export default function Hero({ theme }) {
  return (
    <section className="relative h-[40vh] w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/Gt5HUob8aGDxOUep/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/40 to-transparent pointer-events-none" />
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-white drop-shadow">LeetPattern</h1>
        <p className="mt-2 md:mt-3 text-slate-200/90 max-w-2xl">Minimal, elegant LeetCode progress tracker with patterns, analytics, and spaced repetition.</p>
      </div>
    </section>
  );
}
