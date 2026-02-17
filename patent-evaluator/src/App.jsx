import React from 'react';

const App = () => {
  return (
    <div className="min-h-screen bg-black text-amber-50 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden lg:flex w-72 flex-col gap-8 border-r border-amber-200/10 bg-gradient-to-b from-black via-zinc-950 to-zinc-900 px-8 py-10 intro-fade">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-400/20 border border-amber-200/30 flex items-center justify-center">
                <span className="text-amber-200 font-semibold">PE</span>
              </div>
              <div>
                <p className="text-lg font-semibold text-amber-100">Patent Evaluator</p>
                <p className="text-xs text-amber-200/60">Golden Intelligence</p>
              </div>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            {[
              'Command Center',
              'Patent Vault',
              'Risk Signals',
              'Research Pulse',
              'Client Spaces',
            ].map((item, index) => (
              <a
                key={item}
                href="#"
                className={`rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  index === 0
                    ? 'bg-amber-400/20 text-amber-100 border border-amber-200/30 shadow-[0_10px_30px_rgba(217,161,72,0.15)]'
                    : 'text-amber-100/70 hover:text-amber-100 hover:bg-amber-400/10'
                }`}
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-amber-200/20 bg-amber-500/10 p-5">
            <p className="text-sm text-amber-100">Weekly Insight</p>
            <p className="mt-2 text-xs text-amber-100/70">
              8 high-value filings are trending in quantum networking.
            </p>
            <button className="mt-4 w-full rounded-full border border-amber-200/30 bg-amber-400/20 px-4 py-2 text-xs font-semibold text-amber-100 transition hover:bg-amber-400/30">
              View Brief
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col">
          <header className="px-6 lg:px-12 pt-8 pb-6 intro-fade intro-delay-1">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-100/80">
                  <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(236,192,88,0.8)]" />
                  Live portfolio intelligence
                </div>
                <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-semibold text-amber-50">
                  Golden lens for patent strategy
                </h1>
                <p className="mt-3 max-w-2xl text-sm sm:text-base text-amber-100/70">
                  Monitor exposure, surface whitespace opportunities, and ship decisions faster with
                  AI-ranked evidence.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-300">
                  New Evaluation
                </button>
                <button className="rounded-full border border-amber-200/30 px-5 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/10">
                  Schedule Review
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-6 lg:px-12 pb-12">
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 intro-fade intro-delay-2">
              <div className="lg:col-span-2 rounded-3xl border border-amber-200/20 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-6 sm:p-8 shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-amber-100/50">Priority lane</p>
                    <h2 className="mt-3 text-2xl font-semibold text-amber-50">
                      Global filings sprint
                    </h2>
                    <p className="mt-3 text-sm text-amber-100/70">
                      14 filings flagged for accelerated prosecution with above-average grant odds.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-amber-200/20 bg-black/60 px-6 py-4">
                    <p className="text-xs text-amber-100/60">Confidence score</p>
                    <p className="mt-1 text-3xl font-semibold text-amber-300">92%</p>
                    <p className="text-xs text-amber-100/50">Updated 6 mins ago</p>
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Active patents', value: '128', detail: '+12 this week' },
                    { label: 'Risk alerts', value: '6', detail: '2 critical' },
                    { label: 'Value at stake', value: '$42M', detail: 'YoY +18%' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-amber-200/10 bg-black/50 px-4 py-4"
                    >
                      <p className="text-xs text-amber-100/60">{item.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-amber-100">{item.value}</p>
                      <p className="text-xs text-amber-200/50">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-amber-200/20 bg-amber-400/10 p-6 sm:p-8">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-100/60">AI focus</p>
                <h3 className="mt-3 text-2xl font-semibold text-amber-50">Coverage map</h3>
                <p className="mt-3 text-sm text-amber-100/70">
                  Balanced across communications, materials, and energy storage.
                </p>
                <div className="mt-6 space-y-4">
                  {[
                    { label: 'Signal strength', value: '88%' },
                    { label: 'Whitespace density', value: '31%' },
                    { label: 'Opposition heat', value: 'Medium' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <p className="text-sm text-amber-100/70">{item.label}</p>
                      <p className="text-sm font-semibold text-amber-100">{item.value}</p>
                    </div>
                  ))}
                </div>
                <button className="mt-8 w-full rounded-full border border-amber-200/30 bg-amber-400/20 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/30">
                  Open Heatmap
                </button>
              </div>
            </section>

            <section className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-6 intro-fade intro-delay-3">
              <div className="xl:col-span-2 rounded-3xl border border-amber-200/20 bg-black/60 p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-amber-50">Active workstreams</h3>
                    <p className="text-sm text-amber-100/60">Live orchestration across teams</p>
                  </div>
                  <button className="text-xs font-semibold text-amber-200/80 hover:text-amber-200">
                    View all
                  </button>
                </div>
                <div className="mt-6 space-y-4">
                  {[
                    { title: 'Photonics portfolio', status: 'In review', progress: '74%' },
                    { title: 'Biopolymer claims', status: 'Drafting', progress: '52%' },
                    { title: 'Grid storage strategy', status: 'Negotiation', progress: '81%' },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-amber-200/10 bg-black/50 px-5 py-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-amber-100">{item.title}</p>
                        <span className="rounded-full border border-amber-200/30 px-3 py-1 text-xs text-amber-100/70">
                          {item.status}
                        </span>
                      </div>
                      <div className="mt-3 h-1.5 w-full rounded-full bg-amber-200/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500"
                          style={{ width: item.progress }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-amber-200/60">Progress {item.progress}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-amber-200/20 bg-gradient-to-b from-zinc-900 to-black p-6 sm:p-8">
                <h3 className="text-xl font-semibold text-amber-50">Recent intelligence</h3>
                <p className="mt-2 text-sm text-amber-100/60">Last 24 hours</p>
                <div className="mt-6 space-y-4">
                  {[
                    { title: 'New priority citation', detail: 'JP-2025-9981 linked to your core claim.' },
                    { title: 'Competitor shift', detail: 'Zenith Labs increased filings by 18%.' },
                    { title: 'Grant velocity', detail: 'Median review time dropped to 11.2 months.' },
                  ].map((item) => (
                    <div key={item.title} className="rounded-2xl border border-amber-200/10 bg-black/50 px-4 py-4">
                      <p className="text-sm font-semibold text-amber-100">{item.title}</p>
                      <p className="mt-2 text-xs text-amber-100/60">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;