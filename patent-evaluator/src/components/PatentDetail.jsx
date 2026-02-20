import React, { useState } from 'react';

const PatentDetail = ({ selectedPatent, setView, setDetailTab, detailTab }) => {
  return (
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
  );
};

export default PatentDetail;
