import React, { useEffect, useMemo, useState } from 'react';
import { addItem, ensureSeedData, getAll } from './db';
import { computeScores } from './scoring';
import CommandCenter from './components/CommandCenter';
import PatentVault from './components/PatentVault';
import PatentDetail from './components/PatentDetail';
import PlaceholderView from './components/PlaceholderView';

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
              <CommandCenter
                metrics={metrics}
                workstreams={workstreams}
                intelligence={intelligence}
                setView={setView}
                setModalOpen={setModalOpen}
              />
            )}

            {view === 'vault' && (
              <PatentVault
                filteredPatents={filteredPatents}
                workstreams={workstreams}
                filters={filters}
                setFilters={setFilters}
                handleOpenDetail={handleOpenDetail}
              />
            )}

            {view === 'detail' && selectedPatent && (
              <PatentDetail
                selectedPatent={selectedPatent}
                setView={setView}
                setDetailTab={setDetailTab}
                detailTab={detailTab}
              />
            )}

            {['risk', 'pulse', 'clients'].includes(view) && (
              <PlaceholderView
                viewLabel={NAV_ITEMS.find((item) => item.id === view)?.label}
              />
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