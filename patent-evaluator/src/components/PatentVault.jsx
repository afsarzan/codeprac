import React from 'react';

const PatentVault = ({
  filteredPatents,
  workstreams,
  filters,
  setFilters,
  handleOpenDetail,
}) => {
  return (
    <section className="intro-fade intro-delay-2">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-amber-50">Patent Vault</h2>
          <p className="text-sm text-amber-100/60">
            Search, filter, and open any evaluated patent.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={filters.search}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, search: event.target.value }))
            }
            placeholder="Search by number or title"
            className="w-full sm:w-64 rounded-full border border-amber-200/30 bg-black/60 px-4 py-2 text-sm text-amber-100 placeholder:text-amber-200/40 focus:outline-none focus:ring-1 focus:ring-amber-300"
          />
          <select
            value={filters.risk}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, risk: event.target.value }))
            }
            className="rounded-full border border-amber-200/30 bg-black/60 px-4 py-2 text-sm text-amber-100 focus:outline-none"
          >
            {['All', 'Low', 'Medium', 'High'].map((level) => (
              <option key={level} value={level}>
                {level} risk
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-amber-200/20 bg-black/50">
        <div className="grid grid-cols-6 gap-4 px-6 py-4 text-xs uppercase tracking-[0.2em] text-amber-100/50">
          <span className="col-span-2">Patent</span>
          <span>Jurisdiction</span>
          <span>Strength</span>
          <span>Risk</span>
          <span>Workstream</span>
        </div>
        <div className="divide-y divide-amber-200/10">
          {filteredPatents.map((patent) => (
            <button
              key={patent.id}
              onClick={() => handleOpenDetail(patent.id)}
              className="grid grid-cols-6 gap-4 px-6 py-4 text-left text-sm text-amber-100/80 hover:bg-amber-400/5"
            >
              <div className="col-span-2">
                <p className="font-semibold text-amber-100">{patent.number}</p>
                <p className="text-xs text-amber-100/60">{patent.title}</p>
              </div>
              <span>{patent.jurisdiction}</span>
              <span>{patent.strengthScore}</span>
              <span
                className={`font-semibold ${
                  patent.riskLevel === 'High'
                    ? 'text-red-300'
                    : patent.riskLevel === 'Medium'
                      ? 'text-amber-300'
                      : 'text-emerald-300'
                }`}
              >
                {patent.riskLevel}
              </span>
              <span>
                {workstreams.find((item) => item.id === patent.workstreamId)?.name ||
                  'Unassigned'}
              </span>
            </button>
          ))}
          {filteredPatents.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-amber-100/60">
              No patents match your filters.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PatentVault;
