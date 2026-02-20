import React, { useState } from 'react';
import {
  calculateDCF,
  calculateRNPV,
  calculateRealOptions,
  calculateCostApproach,
  calculateMarketApproach,
  calculateQualityScore,
  calculateMultiImpactScore,
} from '../valuations';

// DCF/Income Approach Component
export const DCFEvaluation = () => {
  const [cashFlows, setCashFlows] = useState([200, 200, 200, 200, 200]);
  const [discountRate, setDiscountRate] = useState(0.15);
  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    const res = calculateDCF(cashFlows, discountRate);
    setResult(res);
  };

  const updateCashFlow = (index, value) => {
    const newCashFlows = [...cashFlows];
    newCashFlows[index] = parseFloat(value) || 0;
    setCashFlows(newCashFlows);
  };

  const addYear = () => setCashFlows([...cashFlows, 0]);
  const removeYear = () => cashFlows.length > 1 && setCashFlows(cashFlows.slice(0, -1));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200/20 bg-black/50 p-5">
        <h3 className="text-lg font-semibold text-amber-100 mb-4">
          Discounted Cash Flow (DCF) / Income Approach
        </h3>
        <p className="text-sm text-amber-100/70 mb-4">
          V<sub>patent</sub> = Σ(CF<sub>t</sub> / (1 + r)<sup>t</sup>) for t=1 to T
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-amber-100 mb-2">
              Discount Rate (r)
            </label>
            <input
              type="number"
              step="0.01"
              value={discountRate}
              onChange={(e) => setDiscountRate(parseFloat(e.target.value))}
              className="w-full rounded-lg border border-amber-200/30 bg-black/50 px-4 py-2 text-amber-100"
              placeholder="0.15"
            />
            <p className="text-xs text-amber-100/60 mt-1">
              e.g., 0.15 for 15%
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-amber-100">
                Annual Cash Flows ($k)
              </label>
              <div className="space-x-2">
                <button
                  onClick={addYear}
                  className="text-xs px-3 py-1 rounded-full bg-amber-400/20 text-amber-100 hover:bg-amber-400/30"
                >
                  + Year
                </button>
                <button
                  onClick={removeYear}
                  className="text-xs px-3 py-1 rounded-full bg-amber-400/20 text-amber-100 hover:bg-amber-400/30"
                >
                  - Year
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {cashFlows.map((cf, index) => (
                <div key={index}>
                  <label className="text-xs text-amber-100/60">Year {index + 1}</label>
                  <input
                    type="number"
                    value={cf}
                    onChange={(e) => updateCashFlow(index, e.target.value)}
                    className="w-full rounded-lg border border-amber-200/30 bg-black/50 px-3 py-2 text-amber-100 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleCalculate}
            className="w-full rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-black hover:bg-amber-300"
          >
            Calculate DCF Value
          </button>
        </div>
      </div>

      {result && (
        <div className="rounded-2xl border border-amber-200/20 bg-black/50 p-5">
          <h4 className="text-md font-semibold text-amber-100 mb-4">Results</h4>
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
              <p className="text-xs text-amber-100/60">Patent Present Value</p>
              <p className="text-2xl font-bold text-amber-100">
                ${result.presentValue.toFixed(2)}k
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-amber-100 mb-2">Yearly Breakdown</p>
              <div className="space-y-2">
                {result.yearlyPV.map((item) => (
                  <div
                    key={item.year}
                    className="flex justify-between text-sm text-amber-100/70 py-2 border-b border-amber-200/10"
                  >
                    <span>Year {item.year}</span>
                    <span>CF: ${item.cashFlow}k</span>
                    <span>PV: ${item.presentValue.toFixed(2)}k</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Risk-Adjusted NPV Component
export const RNPVEvaluation = () => {
  const [scenarios, setScenarios] = useState([
    { cashFlow: 200, probability: 0.9 },
    { cashFlow: 200, probability: 0.85 },
    { cashFlow: 200, probability: 0.8 },
    { cashFlow: 200, probability: 0.75 },
    { cashFlow: 200, probability: 0.7 },
  ]);
  const [discountRate, setDiscountRate] = useState(0.15);
  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    const res = calculateRNPV(scenarios, discountRate);
    setResult(res);
  };

  const updateScenario = (index, field, value) => {
    const newScenarios = [...scenarios];
    newScenarios[index][field] = parseFloat(value) || 0;
    setScenarios(newScenarios);
  };

  const addYear = () => setScenarios([...scenarios, { cashFlow: 0, probability: 1.0 }]);
  const removeYear = () => scenarios.length > 1 && setScenarios(scenarios.slice(0, -1));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200/20 bg-black/50 p-5">
        <h3 className="text-lg font-semibold text-amber-100 mb-4">
          Risk-Adjusted NPV (rNPV)
        </h3>
        <p className="text-sm text-amber-100/70 mb-4">
          V<sub>rNPV</sub> = Σ(p<sub>t</sub> · CF<sub>t</sub> / (1 + r)<sup>t</sup>)
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-amber-100 mb-2">
              Discount Rate (r)
            </label>
            <input
              type="number"
              step="0.01"
              value={discountRate}
              onChange={(e) => setDiscountRate(parseFloat(e.target.value))}
              className="w-full rounded-lg border border-amber-200/30 bg-black/50 px-4 py-2 text-amber-100"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-amber-100">
                Annual Cash Flows & Success Probabilities
              </label>
              <div className="space-x-2">
                <button
                  onClick={addYear}
                  className="text-xs px-3 py-1 rounded-full bg-amber-400/20 text-amber-100 hover:bg-amber-400/30"
                >
                  + Year
                </button>
                <button
                  onClick={removeYear}
                  className="text-xs px-3 py-1 rounded-full bg-amber-400/20 text-amber-100 hover:bg-amber-400/30"
                >
                  - Year
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {scenarios.map((scenario, index) => (
                <div key={index} className="grid grid-cols-3 gap-3 items-center">
                  <div>
                    <label className="text-xs text-amber-100/60">Year {index + 1}</label>
                  </div>
                  <div>
                    <label className="text-xs text-amber-100/60">Cash Flow ($k)</label>
                    <input
                      type="number"
                      value={scenario.cashFlow}
                      onChange={(e) => updateScenario(index, 'cashFlow', e.target.value)}
                      className="w-full rounded-lg border border-amber-200/30 bg-black/50 px-3 py-2 text-amber-100 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-amber-100/60">Probability (0-1)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={scenario.probability}
                      onChange={(e) => updateScenario(index, 'probability', e.target.value)}
                      className="w-full rounded-lg border border-amber-200/30 bg-black/50 px-3 py-2 text-amber-100 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleCalculate}
            className="w-full rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-black hover:bg-amber-300"
          >
            Calculate rNPV
          </button>
        </div>
      </div>

      {result && (
        <div className="rounded-2xl border border-amber-200/20 bg-black/50 p-5">
          <h4 className="text-md font-semibold text-amber-100 mb-4">Results</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
                <p className="text-xs text-amber-100/60">Risk-Adjusted Value</p>
                <p className="text-2xl font-bold text-amber-100">
                  ${result.riskAdjustedValue.toFixed(2)}k
                </p>
              </div>
              <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
                <p className="text-xs text-amber-100/60">Expected Total CF</p>
                <p className="text-2xl font-bold text-amber-100">
                  ${result.expectedValue.toFixed(2)}k
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-amber-100 mb-2">Yearly Breakdown</p>
              <div className="space-y-2">
                {result.yearlyValues.map((item) => (
                  <div
                    key={item.year}
                    className="grid grid-cols-4 text-xs text-amber-100/70 py-2 border-b border-amber-200/10"
                  >
                    <span>Year {item.year}</span>
                    <span>CF: ${item.cashFlow}k</span>
                    <span>p: {(item.probability * 100).toFixed(0)}%</span>
                    <span>PV: ${item.presentValue.toFixed(2)}k</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Real Options Valuation Component
export const RealOptionsEvaluation = () => {
  const [params, setParams] = useState({
    S: 1000,
    K: 800,
    T: 3,
    r: 0.05,
    sigma: 0.3,
  });
  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    const res = calculateRealOptions(params.S, params.K, params.T, params.r, params.sigma);
    setResult(res);
  };

  const updateParam = (field, value) => {
    setParams({ ...params, [field]: parseFloat(value) || 0 });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200/20 bg-black/50 p-5">
        <h3 className="text-lg font-semibold text-amber-100 mb-4">
          Real Options Valuation (Black-Scholes)
        </h3>
        <p className="text-sm text-amber-100/70 mb-4">
          Patent as a call option: V<sub>option</sub> = f(S, K, T, r, σ)
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-amber-100 mb-2">
              S: Present Value of Cash Flows ($k)
            </label>
            <input
              type="number"
              value={params.S}
              onChange={(e) => updateParam('S', e.target.value)}
              className="w-full rounded-lg border border-amber-200/30 bg-black/50 px-4 py-2 text-amber-100"
            />
            <p className="text-xs text-amber-100/60 mt-1">Underlying asset value</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-100 mb-2">
              K: Development Cost ($k)
            </label>
            <input
              type="number"
              value={params.K}
              onChange={(e) => updateParam('K', e.target.value)}
              className="w-full rounded-lg border border-amber-200/30 bg-black/50 px-4 py-2 text-amber-100"
            />
            <p className="text-xs text-amber-100/60 mt-1">Exercise price</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-100 mb-2">
              T: Time to Decision (years)
            </label>
            <input
              type="number"
              step="0.1"
              value={params.T}
              onChange={(e) => updateParam('T', e.target.value)}
              className="w-full rounded-lg border border-amber-200/30 bg-black/50 px-4 py-2 text-amber-100"
            />
            <p className="text-xs text-amber-100/60 mt-1">Until patent expiry</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-100 mb-2">
              r: Risk-Free Rate
            </label>
            <input
              type="number"
              step="0.01"
              value={params.r}
              onChange={(e) => updateParam('r', e.target.value)}
              className="w-full rounded-lg border border-amber-200/30 bg-black/50 px-4 py-2 text-amber-100"
            />
            <p className="text-xs text-amber-100/60 mt-1">e.g., 0.05 for 5%</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-amber-100 mb-2">
              σ: Volatility
            </label>
            <input
              type="number"
              step="0.01"
              value={params.sigma}
              onChange={(e) => updateParam('sigma', e.target.value)}
              className="w-full rounded-lg border border-amber-200/30 bg-black/50 px-4 py-2 text-amber-100"
            />
            <p className="text-xs text-amber-100/60 mt-1">
              Uncertainty in project value (e.g., 0.3 for 30%)
            </p>
          </div>
        </div>

        <button
          onClick={handleCalculate}
          className="w-full mt-4 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-black hover:bg-amber-300"
        >
          Calculate Option Value
        </button>
      </div>

      {result && (
        <div className="rounded-2xl border border-amber-200/20 bg-black/50 p-5">
          <h4 className="text-md font-semibold text-amber-100 mb-4">Results</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
                <p className="text-xs text-amber-100/60">Option Value</p>
                <p className="text-2xl font-bold text-amber-100">
                  ${result.optionValue.toFixed(2)}k
                </p>
              </div>
              <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
                <p className="text-xs text-amber-100/60">Intrinsic Value</p>
                <p className="text-lg font-bold text-amber-100">
                  ${result.intrinsicValue.toFixed(2)}k
                </p>
              </div>
              <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
                <p className="text-xs text-amber-100/60">Time Value</p>
                <p className="text-lg font-bold text-amber-100">
                  ${result.timeValue.toFixed(2)}k
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200/20 bg-black/50 p-4">
              <p className="text-sm font-medium text-amber-100 mb-2">Black-Scholes Parameters</p>
              <div className="grid grid-cols-2 gap-3 text-sm text-amber-100/70">
                <div>d₁: {result.d1.toFixed(4)}</div>
                <div>N(d₁): {result.Nd1.toFixed(4)}</div>
                <div>d₂: {result.d2.toFixed(4)}</div>
                <div>N(d₂): {result.Nd2.toFixed(4)}</div>
              </div>
            </div>

            <div className="rounded-xl border border-blue-400/20 bg-blue-400/10 p-4">
              <p className="text-xs text-amber-100/70">
                <strong>Interpretation:</strong> The option value of ${result.optionValue.toFixed(2)}k
                captures the flexibility to delay or expand commercialization. This exceeds the
                intrinsic value (${result.intrinsicValue.toFixed(2)}k) by ${result.timeValue.toFixed(2)}k
                due to uncertainty and time remaining.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Cost & Market Approach Component
export const CostMarketEvaluation = () => {
  const [approach, setApproach] = useState('cost');
  const [costParams, setCostParams] = useState({
    reproductionCost: 500,
    physicalDepreciation: 50,
    functionalDepreciation: 30,
    economicDepreciation: 20,
  });
  const [marketParams, setMarketParams] = useState({
    comparablePrice: 600,
    territoryAdjustment: 1.0,
    lifeAdjustment: 0.9,
    technologyAdjustment: 1.1,
    revenueAdjustment: 1.0,
  });
  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    if (approach === 'cost') {
      const res = calculateCostApproach(
        costParams.reproductionCost,
        costParams.physicalDepreciation,
        costParams.functionalDepreciation,
        costParams.economicDepreciation
      );
      setResult({ type: 'cost', data: res });
    } else {
      const res = calculateMarketApproach(marketParams.comparablePrice, {
        territoryAdjustment: marketParams.territoryAdjustment,
        lifeAdjustment: marketParams.lifeAdjustment,
        technologyAdjustment: marketParams.technologyAdjustment,
        revenueAdjustment: marketParams.revenueAdjustment,
      });
      setResult({ type: 'market', data: res });
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200/20 bg-black/50 p-5">
        <h3 className="text-lg font-semibold text-amber-100 mb-4">
          Cost & Market Approaches
        </h3>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setApproach('cost')}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${
              approach === 'cost'
                ? 'bg-amber-400 text-black'
                : 'border border-amber-200/30 text-amber-100'
            }`}
          >
            Cost Approach
          </button>
          <button
            onClick={() => setApproach('market')}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${
              approach === 'market'
                ? 'bg-amber-400 text-black'
                : 'border border-amber-200/30 text-amber-100'
            }`}
          >
            Market Approach
          </button>
        </div>

        {approach === 'cost' ? (
          <div className="space-y-4">
            <p className="text-sm text-amber-100/70 mb-4">
              V<sub>cost</sub> = C<sub>reproduction</sub> - D<sub>physical</sub> - D<sub>functional</sub> - D<sub>economic</sub>
            </p>
            <div>
              <label className="block text-sm font-medium text-amber-100 mb-2">
                Reproduction Cost ($k)
              </label>
              <input
                type="number"
                value={costParams.reproductionCost}
                onChange={(e) =>
                  setCostParams({ ...costParams, reproductionCost: parseFloat(e.target.value) || 0 })
                }
                className="w-full rounded-lg border border-amber-200/30 bg-black/50 px-4 py-2 text-amber-100"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-amber-100 mb-2">
                  Physical Depreciation ($k)
                </label>
                <input
                  type="number"
                  value={costParams.physicalDepreciation}
                  onChange={(e) =>
                    setCostParams({ ...costParams, physicalDepreciation: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full rounded-lg border border-amber-200/30 bg-black/50 px-4 py-2 text-amber-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-100 mb-2">
                  Functional Depreciation ($k)
                </label>
                <input
                  type="number"
                  value={costParams.functionalDepreciation}
                  onChange={(e) =>
                    setCostParams({ ...costParams, functionalDepreciation: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full rounded-lg border border-amber-200/30 bg-black/50 px-4 py-2 text-amber-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-100 mb-2">
                  Economic Depreciation ($k)
                </label>
                <input
                  type="number"
                  value={costParams.economicDepreciation}
                  onChange={(e) =>
                    setCostParams({ ...costParams, economicDepreciation: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full rounded-lg border border-amber-200/30 bg-black/50 px-4 py-2 text-amber-100"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-amber-100/70 mb-4">
              V<sub>market</sub> = P<sub>comparable</sub> × Adjustment factor
            </p>
            <div>
              <label className="block text-sm font-medium text-amber-100 mb-2">
                Comparable Price ($k)
              </label>
              <input
                type="number"
                value={marketParams.comparablePrice}
                onChange={(e) =>
                  setMarketParams({ ...marketParams, comparablePrice: parseFloat(e.target.value) ||0 })
                }
                className="w-full rounded-lg border border-amber-200/30 bg-black/50 px-4 py-2 text-amber-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-amber-100 mb-2">
                  Territory Adjustment
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={marketParams.territoryAdjustment}
                  onChange={(e) =>
                    setMarketParams({ ...marketParams, territoryAdjustment: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full rounded-lg border border-amber-200/30 bg-black/50 px-4 py-2 text-amber-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-100 mb-2">
                  Life Adjustment
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={marketParams.lifeAdjustment}
                  onChange={(e) =>
                    setMarketParams({ ...marketParams, lifeAdjustment: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full rounded-lg border border-amber-200/30 bg-black/50 px-4 py-2 text-amber-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-100 mb-2">
                  Technology Adjustment
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={marketParams.technologyAdjustment}
                  onChange={(e) =>
                    setMarketParams({ ...marketParams, technologyAdjustment: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full rounded-lg border border-amber-200/30 bg-black/50 px-4 py-2 text-amber-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-100 mb-2">
                  Revenue Adjustment
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={marketParams.revenueAdjustment}
                  onChange={(e) =>
                    setMarketParams({ ...marketParams, revenueAdjustment: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full rounded-lg border border-amber-200/30 bg-black/50 px-4 py-2 text-amber-100"
                />
              </div>
            </div>
            <p className="text-xs text-amber-100/60">
              Use 1.0 for no adjustment, &gt;1.0 for positive adjustment, &lt;1.0 for negative
            </p>
          </div>
        )}

        <button
          onClick={handleCalculate}
          className="w-full mt-4 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-black hover:bg-amber-300"
        >
          Calculate Value
        </button>
      </div>

      {result && (
        <div className="rounded-2xl border border-amber-200/20 bg-black/50 p-5">
          <h4 className="text-md font-semibold text-amber-100 mb-4">Results</h4>
          {result.type === 'cost' ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
                <p className="text-xs text-amber-100/60">Adjusted Value</p>
                <p className="text-2xl font-bold text-amber-100">
                  ${result.data.adjustedValue.toFixed(2)}k
                </p>
              </div>
              <div className="space-y-2 text-sm text-amber-100/70">
                <div className="flex justify-between py-2 border-b border-amber-200/10">
                  <span>Reproduction Cost</span>
                  <span>${result.data.reproductionCost.toFixed(2)}k</span>
                </div>
                <div className="flex justify-between py-2 border-b border-amber-200/10">
                  <span>Physical Depreciation</span>
                  <span>-${result.data.depreciationBreakdown.physical.toFixed(2)}k</span>
                </div>
                <div className="flex justify-between py-2 border-b border-amber-200/10">
                  <span>Functional Depreciation</span>
                  <span>-${result.data.depreciationBreakdown.functional.toFixed(2)}k</span>
                </div>
                <div className="flex justify-between py-2 border-b border-amber-200/10">
                  <span>Economic Depreciation</span>
                  <span>-${result.data.depreciationBreakdown.economic.toFixed(2)}k</span>
                </div>
                <div className="flex justify-between py-2 font-semibold">
                  <span>Total Depreciation ({result.data.depreciationRate.toFixed(1)}%)</span>
                  <span>-${result.data.totalDepreciation.toFixed(2)}k</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
                <p className="text-xs text-amber-100/60">Adjusted Value</p>
                <p className="text-2xl font-bold text-amber-100">
                  ${result.data.adjustedValue.toFixed(2)}k
                </p>
              </div>
              <div className="space-y-2 text-sm text-amber-100/70">
                <div className="flex justify-between py-2 border-b border-amber-200/10">
                  <span>Comparable Price</span>
                  <span>${result.data.comparablePrice.toFixed(2)}k</span>
                </div>
                <div className="flex justify-between py-2 border-b border-amber-200/10">
                  <span>Territory Adjustment</span>
                  <span>×{result.data.adjustmentFactors.territory.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-amber-200/10">
                  <span>Life Adjustment</span>
                  <span>×{result.data.adjustmentFactors.life.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-amber-200/10">
                  <span>Technology Adjustment</span>
                  <span>×{result.data.adjustmentFactors.technology.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-amber-200/10">
                  <span>Revenue Adjustment</span>
                  <span>×{result.data.adjustmentFactors.revenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 font-semibold">
                  <span>Total Adjustment Factor</span>
                  <span>×{result.data.totalAdjustment.toFixed(3)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Quality Score Component
export const QualityScoreEvaluation = ({ selectedPatent }) => {
  const [approach, setApproach] = useState('weighted');
  const [indicators, setIndicators] = useState({
    citations: selectedPatent?.citationsForward || 8,
    claims: selectedPatent?.claimsIndependent || 2,
    familySize: selectedPatent?.familySize || 4,
    age: 5,
    jurisdictions: 3,
  });
  const [weights, setWeights] = useState({
    citations: 0.3,
    claims: 0.2,
    familySize: 0.2,
    age: 0.15,
    jurisdictions: 0.15,
  });
  const [multiImpact, setMultiImpact] = useState({
    marketImpact: 75,
    technologyImpact: 80,
    assigneeImpact: 70,
    alpha: 0.4,
    beta: 0.4,
    gamma: 0.2,
  });
  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    if (approach === 'weighted') {
      const benchmarks = {
        citations: { mean: 10, stdDev: 5 },
        claims: { mean: 3, stdDev: 2 },
        familySize: { mean: 5, stdDev: 3 },
        age: { mean: 7, stdDev: 4 },
        jurisdictions: { mean: 4, stdDev: 2 },
      };
      const res = calculateQualityScore(indicators, benchmarks, weights);
      setResult({ type: 'weighted', data: res });
    } else {
      const res = calculateMultiImpactScore(
        multiImpact.marketImpact,
        multiImpact.technologyImpact,
        multiImpact.assigneeImpact,
        { alpha: multiImpact.alpha, beta: multiImpact.beta, gamma: multiImpact.gamma }
      );
      setResult({ type: 'multiImpact', data: res });
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200/20 bg-black/50 p-5">
        <h3 className="text-lg font-semibold text-amber-100 mb-4">
          Quality Score Models
        </h3>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setApproach('weighted')}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${
              approach === 'weighted'
                ? 'bg-amber-400 text-black'
                : 'border border-amber-200/30 text-amber-100'
            }`}
          >
            Weighted Index
          </button>
          <button
            onClick={() => setApproach('multiImpact')}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${
              approach === 'multiImpact'
                ? 'bg-amber-400 text-black'
                : 'border border-amber-200/30 text-amber-100'
            }`}
          >
            Multi-Impact
          </button>
        </div>

        {approach === 'weighted' ? (
          <div className="space-y-4">
            <p className="text-sm text-amber-100/70 mb-4">
              Q = Σ(w<sub>i</sub> · z<sub>i</sub>) where z<sub>i</sub> = (x<sub>i</sub> - μ<sub>i</sub>) / σ<sub>i</sub>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(indicators).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-amber-100 mb-2 capitalize">
                    {key}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={indicators[key]}
                      onChange={(e) =>
                        setIndicators({ ...indicators, [key]: parseFloat(e.target.value) || 0 })
                      }
                      className="flex-1 rounded-lg border border-amber-200/30 bg-black/50 px-3 py-2 text-amber-100 text-sm"
                      placeholder="Value"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={weights[key]}
                      onChange={(e) =>
                        setWeights({ ...weights, [key]: parseFloat(e.target.value) || 0 })
                      }
                      className="w-20 rounded-lg border border-amber-200/30 bg-black/50 px-3 py-2 text-amber-100 text-sm"
                      placeholder="Weight"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-amber-100/70 mb-4">
              Q = α·M<sub>i</sub> + β·T<sub>i</sub> + γ·A<sub>i</sub> where α + β + γ = 1
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-amber-100 mb-2">
                  Market Impact (M<sub>i</sub>)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={multiImpact.marketImpact}
                    onChange={(e) =>
                      setMultiImpact({ ...multiImpact, marketImpact: parseFloat(e.target.value) || 0 })
                    }
                    className="flex-1 rounded-lg border border-amber-200/30 bg-black/50 px-3 py-2 text-amber-100"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={multiImpact.alpha}
                    onChange={(e) =>
                      setMultiImpact({ ...multiImpact, alpha: parseFloat(e.target.value) || 0 })
                    }
                    className="w-20 rounded-lg border border-amber-200/30 bg-black/50 px-3 py-2 text-amber-100 text-sm"
                    placeholder="α"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-100 mb-2">
                  Technology Impact (T<sub>i</sub>)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={multiImpact.technologyImpact}
                    onChange={(e) =>
                      setMultiImpact({ ...multiImpact, technologyImpact: parseFloat(e.target.value) || 0 })
                    }
                    className="flex-1 rounded-lg border border-amber-200/30 bg-black/50 px-3 py-2 text-amber-100"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={multiImpact.beta}
                    onChange={(e) =>
                      setMultiImpact({ ...multiImpact, beta: parseFloat(e.target.value) || 0 })
                    }
                    className="w-20 rounded-lg border border-amber-200/30 bg-black/50 px-3 py-2 text-amber-100 text-sm"
                    placeholder="β"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-amber-100 mb-2">
                  Assignee Impact (A<sub>i</sub>)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={multiImpact.assigneeImpact}
                    onChange={(e) =>
                      setMultiImpact({ ...multiImpact, assigneeImpact: parseFloat(e.target.value) || 0 })
                    }
                    className="flex-1 rounded-lg border border-amber-200/30 bg-black/50 px-3 py-2 text-amber-100"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={multiImpact.gamma}
                    onChange={(e) =>
                      setMultiImpact({ ...multiImpact, gamma: parseFloat(e.target.value) || 0 })
                    }
                    className="w-20 rounded-lg border border-amber-200/30 bg-black/50 px-3 py-2 text-amber-100 text-sm"
                    placeholder="γ"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleCalculate}
          className="w-full mt-4 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-black hover:bg-amber-300"
        >
          Calculate Quality Score
        </button>
      </div>

      {result && (
        <div className="rounded-2xl border border-amber-200/20 bg-black/50 p-5">
          <h4 className="text-md font-semibold text-amber-100 mb-4">Results</h4>
          {result.type === 'weighted' ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
                <p className="text-xs text-amber-100/60">Quality Score</p>
                <p className="text-2xl font-bold text-amber-100">
                  {result.data.qualityScore.toFixed(2)} / 100
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-amber-100 mb-2">Component Breakdown</p>
                <div className="space-y-2">
                  {Object.entries(result.data.normalizedScores).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between text-sm text-amber-100/70 py-2 border-b border-amber-200/10"
                    >
                      <span className="capitalize">{key}</span>
                      <span>Value: {value.rawValue}</span>
                      <span>z: {value.zScore.toFixed(2)}</span>
                      <span>w×z: {value.weightedScore.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
                <p className="text-xs text-amber-100/60">Quality Score</p>
                <p className="text-2xl font-bold text-amber-100">
                  {result.data.qualityScore.toFixed(2)} / 100
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-amber-100 mb-2">Impact Components</p>
                <div className="space-y-2">
                  {Object.entries(result.data.components).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between text-sm text-amber-100/70 py-2 border-b border-amber-200/10"
                    >
                      <span className="capitalize">{key}</span>
                      <span>Value: {value.value.toFixed(2)}</span>
                      <span>Contribution: {value.contribution.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-xs text-amber-100/60">
                Normalized weights: α={result.data.normalizedWeights.alpha.toFixed(2)},
                β={result.data.normalizedWeights.beta.toFixed(2)},
                γ={result.data.normalizedWeights.gamma.toFixed(2)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
