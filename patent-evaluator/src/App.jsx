import React, { useEffect, useMemo, useState } from 'react';
import { addItem, ensureSeedData, getAll } from './db';
import { computeScores } from './scoring';

const NAV_ITEMS = [
  { id: 'command', label: 'Command Center' },
  { id: 'vault', label: 'Patent Vault' },
  { id: 'risk', label: 'Risk Signals' },
  { id: 'pulse', label: 'Research Pulse' },
  { id: 'clients', label: 'Client Spaces' },
];

const DEFAULT_FORM = {
  number: '',
  title: '',
  jurisdiction: 'US',
  assignee: '',
  techTag: '',
  workstreamId: '',
  citationsForward: 8,
  citationsBackward: 6,
  claimsIndependent: 2,
  claimsDependent: 10,
  familySize: 4,
};

const App = () => {
  const [view, setView] = useState('command');
  const [patents, setPatents] = useState([]);
  const [workstreams, setWorkstreams] = useState([]);
  const [intelligence, setIntelligence] = useState([]);
  const [selectedPatentId, setSelectedPatentId] = useState(null);
  const [detailTab, setDetailTab] = useState('overview');
  const [filters, setFilters] = useState({ search: '', risk: 'All' });
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [formError, setFormError] = useState('');

  const refreshData = async () => {
    const [patentRows, workstreamRows, intelRows] = await Promise.all([
      getAll('patents'),
      getAll('workstreams'),
      getAll('intelligence'),
    ]);
    setPatents(patentRows);
    setWorkstreams(workstreamRows);
    setIntelligence(intelRows);
  };

  useEffect(() => {
    ensureSeedData().then(refreshData);
  }, []);

  const selectedPatent = patents.find((patent) => patent.id === selectedPatentId);

  const metrics = useMemo(() => {
    const total = patents.length;
    const riskAlerts = patents.filter((patent) => patent.riskLevel !== 'Low').length;
    const avgStrength = total
      ? Math.round(patents.reduce((sum, patent) => sum + patent.strengthScore, 0) / total)
      : 0;
    const avgConfidence = total
      ? Math.round(patents.reduce((sum, patent) => sum + patent.confidence, 0) / total)
      : 0;
    const valueUnits = patents.reduce((sum, patent) => {
      if (patent.valueProxy === 'High') return sum + 5;
      if (patent.valueProxy === 'Medium') return sum + 2;
      return sum + 1;
    }, 0);
    const valueAtStake = total ? `$${Math.round(valueUnits * 3.1)}M` : '$0M';
    const whitespace = Math.max(10, 100 - avgStrength);

    return {
      total,
      riskAlerts,
      avgStrength,
      avgConfidence,
      valueAtStake,
      whitespace,
    };
  }, [patents]);

  const filteredPatents = patents.filter((patent) => {
    const matchesSearch = `${patent.number} ${patent.title}`
      .toLowerCase()
      .includes(filters.search.toLowerCase());
    const matchesRisk = filters.risk === 'All' || patent.riskLevel === filters.risk;
    return matchesSearch && matchesRisk;
  });

  const handleOpenDetail = (patentId) => {
    setSelectedPatentId(patentId);
    setDetailTab('overview');
    setView('detail');
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!formData.number.trim()) {
      setFormError('Patent number is required.');
      return;
    }

    const numericData = {
      citationsForward: Number(formData.citationsForward || 0),
      citationsBackward: Number(formData.citationsBackward || 0),
      claimsIndependent: Number(formData.claimsIndependent || 0),
      claimsDependent: Number(formData.claimsDependent || 0),
      familySize: Number(formData.familySize || 0),
    };

    const scores = computeScores(numericData);
    const now = new Date().toISOString();

    const record = {
      number: formData.number.trim(),
      title: formData.title.trim() || 'Untitled filing',
      jurisdiction: formData.jurisdiction.trim() || 'US',
      assignee: formData.assignee.trim() || 'Unassigned',
      techTag: formData.techTag.trim() || 'General',
      workstreamId: formData.workstreamId ? Number(formData.workstreamId) : null,
      ...numericData,
      ...scores,
      legalEvents: ['Evaluation started'],
      updatedAt: now,
    };

    try {
      await addItem('patents', record);
      await addItem('intelligence', {
        title: 'New evaluation added',
        detail: `${record.number} scored ${record.strengthScore} with ${record.riskLevel} risk.`,
        timestamp: now,
      });
      await refreshData();
      setModalOpen(false);
      setFormData(DEFAULT_FORM);
      setSelectedPatentId(null);
      setView('command');
    } catch (error) {
      setFormError('Patent number already exists.');
    }
  };

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
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                className={`rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
                  view === item.id
                    ? 'bg-amber-400/20 text-amber-100 border border-amber-200/30 shadow-[0_10px_30px_rgba(217,161,72,0.15)]'
                    : 'text-amber-100/70 hover:text-amber-100 hover:bg-amber-400/10'
                }`}
              >
                {item.label}
              </button>
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
            <div className="flex flex-col gap-6">
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
                  <button
                    onClick={() => setModalOpen(true)}
                    className="rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-300"
                  >
                    New Evaluation
                  </button>
                  <button className="rounded-full border border-amber-200/30 px-5 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/10">
                    Schedule Review
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 lg:hidden">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setView(item.id)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      view === item.id
                        ? 'bg-amber-400 text-black'
                        : 'border border-amber-200/30 text-amber-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <main className="flex-1 px-6 lg:px-12 pb-12">
            {view === 'command' && (
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
            )}

            {view === 'vault' && (
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
            )}

            {view === 'detail' && selectedPatent && (
              <section className="intro-fade intro-delay-2">
                <button
                  onClick={() => setView('vault')}
                  className="text-xs font-semibold text-amber-200/80 hover:text-amber-200"
                >
                  Back to vault
                </button>
                <div className="mt-4 rounded-3xl border border-amber-200/20 bg-black/60 p-6 sm:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-amber-50">
                        {selectedPatent.number}
                      </h2>
                      <p className="mt-1 text-sm text-amber-100/70">{selectedPatent.title}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-amber-100/60">
                        <span className="rounded-full border border-amber-200/30 px-3 py-1">
                          {selectedPatent.jurisdiction}
                        </span>
                        <span className="rounded-full border border-amber-200/30 px-3 py-1">
                          {selectedPatent.assignee}
                        </span>
                        <span className="rounded-full border border-amber-200/30 px-3 py-1">
                          {selectedPatent.techTag}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Strength', value: selectedPatent.strengthScore },
                        { label: 'Risk', value: selectedPatent.riskLevel },
                        { label: 'Confidence', value: `${selectedPatent.confidence}%` },
                        { label: 'Value', value: selectedPatent.valueProxy },
                      ].map((item) => (
                        <div key={item.label} className="rounded-2xl border border-amber-200/20 bg-black/50 px-4 py-3">
                          <p className="text-xs text-amber-100/60">{item.label}</p>
                          <p className="mt-1 text-sm font-semibold text-amber-100">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {['overview', 'claims', 'family', 'legal'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setDetailTab(tab)}
                        className={`rounded-full px-4 py-2 text-xs font-semibold ${
                          detailTab === tab
                            ? 'bg-amber-400 text-black'
                            : 'border border-amber-200/30 text-amber-100'
                        }`}
                      >
                        {tab === 'overview'
                          ? 'Overview'
                          : tab === 'claims'
                            ? 'Claims & citations'
                            : tab === 'family'
                              ? 'Family & coverage'
                              : 'Legal events'}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {detailTab === 'overview' && (
                      <>
                        <div className="rounded-2xl border border-amber-200/20 bg-black/50 p-5">
                          <p className="text-sm font-semibold text-amber-100">Key drivers</p>
                          <ul className="mt-3 space-y-2 text-sm text-amber-100/70">
                            {selectedPatent.driversPositive.map((driver) => (
                              <li key={driver}>+ {driver}</li>
                            ))}
                            {selectedPatent.driversNegative.map((driver) => (
                              <li key={driver}>- {driver}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-2xl border border-amber-200/20 bg-black/50 p-5">
                          <p className="text-sm font-semibold text-amber-100">Recommended action</p>
                          <p className="mt-3 text-sm text-amber-100/70">
                            {selectedPatent.riskLevel === 'High'
                              ? 'Prioritize mitigation and reassessment of claim scope.'
                              : selectedPatent.strengthScore > 75
                                ? 'Consider licensing strategy and portfolio expansion.'
                                : 'Monitor and reinforce with additional filings.'}
                          </p>
                        </div>
                      </>
                    )}

                    {detailTab === 'claims' && (
                      <>
                        <div className="rounded-2xl border border-amber-200/20 bg-black/50 p-5">
                          <p className="text-sm font-semibold text-amber-100">Claims profile</p>
                          <div className="mt-3 space-y-2 text-sm text-amber-100/70">
                            <p>Independent claims: {selectedPatent.claimsIndependent}</p>
                            <p>Dependent claims: {selectedPatent.claimsDependent}</p>
                            <p>Claim breadth: {selectedPatent.claimsIndependent > 2 ? 'Broad' : 'Focused'}</p>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-amber-200/20 bg-black/50 p-5">
                          <p className="text-sm font-semibold text-amber-100">Citation signals</p>
                          <div className="mt-3 space-y-2 text-sm text-amber-100/70">
                            <p>Forward citations: {selectedPatent.citationsForward}</p>
                            <p>Backward citations: {selectedPatent.citationsBackward}</p>
                            <p>Network strength: {selectedPatent.citationsForward > 10 ? 'High' : 'Moderate'}</p>
                          </div>
                        </div>
                      </>
                    )}

                    {detailTab === 'family' && (
                      <>
                        <div className="rounded-2xl border border-amber-200/20 bg-black/50 p-5">
                          <p className="text-sm font-semibold text-amber-100">Family coverage</p>
                          <div className="mt-3 space-y-2 text-sm text-amber-100/70">
                            <p>Family size: {selectedPatent.familySize}</p>
                            <p>Primary jurisdiction: {selectedPatent.jurisdiction}</p>
                            <p>Coverage rating: {selectedPatent.familySize > 5 ? 'Expanded' : 'Focused'}</p>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-amber-200/20 bg-black/50 p-5">
                          <p className="text-sm font-semibold text-amber-100">Market alignment</p>
                          <p className="mt-3 text-sm text-amber-100/70">
                            Aligned with {selectedPatent.techTag} roadmap and core commercialization plans.
                          </p>
                        </div>
                      </>
                    )}

                    {detailTab === 'legal' && (
                      <div className="rounded-2xl border border-amber-200/20 bg-black/50 p-5">
                        <p className="text-sm font-semibold text-amber-100">Legal events</p>
                        <ul className="mt-3 space-y-2 text-sm text-amber-100/70">
                          {selectedPatent.legalEvents.map((event) => (
                            <li key={event}>{event}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {['risk', 'pulse', 'clients'].includes(view) && (
              <section className="intro-fade intro-delay-2">
                <div className="rounded-3xl border border-amber-200/20 bg-black/60 p-8 text-center">
                  <h2 className="text-2xl font-semibold text-amber-50">
                    {NAV_ITEMS.find((item) => item.id === view)?.label}
                  </h2>
                  <p className="mt-3 text-sm text-amber-100/60">
                    This module is planned for the next MVP iteration.
                  </p>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-2xl rounded-3xl border border-amber-200/20 bg-zinc-950 p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-amber-50">New Evaluation</h3>
                <p className="text-xs text-amber-100/60">
                  Enter a patent number and evidence inputs.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-full border border-amber-200/30 px-3 py-1 text-xs text-amber-100"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  value={formData.number}
                  onChange={(event) => handleFormChange('number', event.target.value)}
                  placeholder="Patent number"
                  className="rounded-2xl border border-amber-200/30 bg-black/60 px-4 py-3 text-sm text-amber-100 placeholder:text-amber-200/40 focus:outline-none focus:ring-1 focus:ring-amber-300"
                />
                <input
                  value={formData.title}
                  onChange={(event) => handleFormChange('title', event.target.value)}
                  placeholder="Title"
                  className="rounded-2xl border border-amber-200/30 bg-black/60 px-4 py-3 text-sm text-amber-100 placeholder:text-amber-200/40 focus:outline-none focus:ring-1 focus:ring-amber-300"
                />
                <input
                  value={formData.assignee}
                  onChange={(event) => handleFormChange('assignee', event.target.value)}
                  placeholder="Assignee"
                  className="rounded-2xl border border-amber-200/30 bg-black/60 px-4 py-3 text-sm text-amber-100 placeholder:text-amber-200/40 focus:outline-none focus:ring-1 focus:ring-amber-300"
                />
                <input
                  value={formData.techTag}
                  onChange={(event) => handleFormChange('techTag', event.target.value)}
                  placeholder="Technology tag"
                  className="rounded-2xl border border-amber-200/30 bg-black/60 px-4 py-3 text-sm text-amber-100 placeholder:text-amber-200/40 focus:outline-none focus:ring-1 focus:ring-amber-300"
                />
                <input
                  value={formData.jurisdiction}
                  onChange={(event) => handleFormChange('jurisdiction', event.target.value)}
                  placeholder="Jurisdiction"
                  className="rounded-2xl border border-amber-200/30 bg-black/60 px-4 py-3 text-sm text-amber-100 placeholder:text-amber-200/40 focus:outline-none focus:ring-1 focus:ring-amber-300"
                />
                <select
                  value={formData.workstreamId}
                  onChange={(event) => handleFormChange('workstreamId', event.target.value)}
                  className="rounded-2xl border border-amber-200/30 bg-black/60 px-4 py-3 text-sm text-amber-100 focus:outline-none"
                >
                  <option value="">Assign workstream</option>
                  {workstreams.map((stream) => (
                    <option key={stream.id} value={stream.id}>
                      {stream.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { field: 'citationsForward', label: 'Forward citations' },
                  { field: 'citationsBackward', label: 'Backward citations' },
                  { field: 'claimsIndependent', label: 'Independent claims' },
                  { field: 'claimsDependent', label: 'Dependent claims' },
                  { field: 'familySize', label: 'Family size' },
                ].map((item) => (
                  <div key={item.field} className="flex flex-col gap-2">
                    <label className="text-xs text-amber-100/60">{item.label}</label>
                    <input
                      type="number"
                      min="0"
                      value={formData[item.field]}
                      onChange={(event) => handleFormChange(item.field, event.target.value)}
                      className="rounded-2xl border border-amber-200/30 bg-black/60 px-3 py-2 text-sm text-amber-100 focus:outline-none focus:ring-1 focus:ring-amber-300"
                    />
                  </div>
                ))}
              </div>

              {formError && (
                <p className="text-sm text-red-300">{formError}</p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-full border border-amber-200/30 px-5 py-2 text-sm font-semibold text-amber-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-black"
                >
                  Run evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;