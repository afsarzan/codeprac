import React from 'react';

const CommandCenter = ({
  metrics,
  workstreams,
  intelligence,
  setView,
  setModalOpen,
}) => {
  return (
    <>
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 intro-fade intro-delay-2">
        <div className="lg:col-span-2 rounded-3xl border border-amber-200/20 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-6 sm:p-8 shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-amber-100/50">
                Priority lane
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-amber-50">
                Global filings sprint
              </h2>
              <p className="mt-3 text-sm text-amber-100/70">
                {metrics.total} filings flagged for accelerated prosecution with above-average
                grant odds.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200/20 bg-black/60 px-6 py-4">
              <p className="text-xs text-amber-100/60">Confidence score</p>
              <p className="mt-1 text-3xl font-semibold text-amber-300">
                {metrics.avgConfidence}%
              </p>
              <p className="text-xs text-amber-100/50">Updated moments ago</p>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: 'Active patents',
                value: metrics.total,
                detail: `${metrics.avgStrength}% avg strength`,
              },
              {
                label: 'Risk alerts',
                value: metrics.riskAlerts,
                detail: metrics.riskAlerts > 0 ? 'Monitor weekly' : 'No critical risks',
              },
              {
                label: 'Value at stake',
                value: metrics.valueAtStake,
                detail: 'Portfolio exposure',
              },
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
              { label: 'Signal strength', value: `${metrics.avgStrength}%` },
              { label: 'Whitespace density', value: `${metrics.whitespace}%` },
              { label: 'Opposition heat', value: metrics.riskAlerts > 2 ? 'High' : 'Medium' },
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
            <button
              className="text-xs font-semibold text-amber-200/80 hover:text-amber-200"
              onClick={() => setView('vault')}
            >
              View all
            </button>
          </div>
          <div className="mt-6 space-y-4">
            {workstreams.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-amber-200/10 bg-black/50 px-5 py-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-amber-100">{item.name}</p>
                  <span className="rounded-full border border-amber-200/30 px-3 py-1 text-xs text-amber-100/70">
                    {item.stage}
                  </span>
                </div>
                <div className="mt-3 h-1.5 w-full rounded-full bg-amber-200/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-amber-200/60">Progress {item.progress}%</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-amber-200/20 bg-gradient-to-b from-zinc-900 to-black p-6 sm:p-8">
          <h3 className="text-xl font-semibold text-amber-50">Recent intelligence</h3>
          <p className="mt-2 text-sm text-amber-100/60">Last 24 hours</p>
          <div className="mt-6 space-y-4">
            {intelligence.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-amber-200/10 bg-black/50 px-4 py-4"
              >
                <p className="text-sm font-semibold text-amber-100">{item.title}</p>
                <p className="mt-2 text-xs text-amber-100/60">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default CommandCenter;
