/**
 * Patent Valuation Mathematical Models
 * Implements various approaches for patent valuation including DCF, rNPV, Real Options, etc.
 */

/**
 * Discounted Cash Flow (DCF) / Income Approach
 * V_patent = Σ(CF_t / (1 + r)^t) for t=1 to T
 * 
 * @param {Array<number>} cashFlows - Annual cash flows [CF1, CF2, ..., CFT]
 * @param {number} discountRate - Discount rate (as decimal, e.g., 0.15 for 15%)
 * @returns {Object} - { presentValue, yearlyPV, totalYears }
 */
export const calculateDCF = (cashFlows, discountRate) => {
  const yearlyPV = cashFlows.map((cf, index) => {
    const year = index + 1;
    const pv = cf / Math.pow(1 + discountRate, year);
    return { year, cashFlow: cf, presentValue: pv };
  });

  const presentValue = yearlyPV.reduce((sum, item) => sum + item.presentValue, 0);

  return {
    presentValue,
    yearlyPV,
    totalYears: cashFlows.length,
    discountRate,
  };
};

/**
 * Risk-Adjusted NPV (rNPV)
 * V_rNPV = Σ(p_t * CF_t / (1 + r)^t)
 * 
 * @param {Array<{cashFlow: number, probability: number}>} scenarios - Array of cash flows with probabilities
 * @param {number} discountRate - Discount rate
 * @returns {Object} - { riskAdjustedValue, yearlyValues, expectedValue }
 */
export const calculateRNPV = (scenarios, discountRate) => {
  const yearlyValues = scenarios.map((scenario, index) => {
    const year = index + 1;
    const adjustedCF = scenario.cashFlow * scenario.probability;
    const pv = adjustedCF / Math.pow(1 + discountRate, year);
    return {
      year,
      cashFlow: scenario.cashFlow,
      probability: scenario.probability,
      adjustedCashFlow: adjustedCF,
      presentValue: pv,
    };
  });

  const riskAdjustedValue = yearlyValues.reduce((sum, item) => sum + item.presentValue, 0);
  const expectedValue = yearlyValues.reduce((sum, item) => sum + item.adjustedCashFlow, 0);

  return {
    riskAdjustedValue,
    yearlyValues,
    expectedValue,
    totalYears: scenarios.length,
  };
};

/**
 * Black-Scholes Option Pricing (simplified for Real Options)
 * Used to value the patent as a call option
 * 
 * @param {number} S - Present value of expected cash flows (underlying asset)
 * @param {number} K - Cost to develop/launch (exercise price)
 * @param {number} T - Time to expiry in years
 * @param {number} r - Risk-free rate
 * @param {number} sigma - Volatility of project value
 * @returns {Object} - Option value and parameters
 */
export const calculateRealOptions = (S, K, T, r, sigma) => {
  // Black-Scholes formula for European call option
  const d1 = (Math.log(S / K) + (r + (sigma * sigma) / 2) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  // Standard normal cumulative distribution function (approximation)
  const normalCDF = (x) => {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - prob : prob;
  };

  const Nd1 = normalCDF(d1);
  const Nd2 = normalCDF(d2);

  const callValue = S * Nd1 - K * Math.exp(-r * T) * Nd2;

  // Calculate intrinsic value (immediate exercise)
  const intrinsicValue = Math.max(0, S - K);
  
  // Time value of option
  const timeValue = callValue - intrinsicValue;

  return {
    optionValue: callValue,
    intrinsicValue,
    timeValue,
    d1,
    d2,
    Nd1,
    Nd2,
    parameters: { S, K, T, r, sigma },
  };
};

/**
 * Cost Approach
 * V_cost = C_reproduction - D_physical - D_functional - D_economic
 * 
 * @param {number} reproductionCost - Cost to recreate similar patent
 * @param {number} physicalDepreciation - Physical depreciation
 * @param {number} functionalDepreciation - Functional obsolescence
 * @param {number} economicDepreciation - Economic obsolescence
 * @returns {Object}
 */
export const calculateCostApproach = (
  reproductionCost,
  physicalDepreciation = 0,
  functionalDepreciation = 0,
  economicDepreciation = 0
) => {
  const totalDepreciation = physicalDepreciation + functionalDepreciation + economicDepreciation;
  const adjustedValue = reproductionCost - totalDepreciation;

  return {
    adjustedValue: Math.max(0, adjustedValue),
    reproductionCost,
    totalDepreciation,
    depreciationBreakdown: {
      physical: physicalDepreciation,
      functional: functionalDepreciation,
      economic: economicDepreciation,
    },
    depreciationRate: reproductionCost > 0 ? (totalDepreciation / reproductionCost) * 100 : 0,
  };
};

/**
 * Market Approach
 * V_market = P_comparable × Adjustment_factor
 * 
 * @param {number} comparablePrice - Price of comparable patent
 * @param {Object} adjustmentFactors - Adjustment factors for differences
 * @returns {Object}
 */
export const calculateMarketApproach = (comparablePrice, adjustmentFactors = {}) => {
  const {
    territoryAdjustment = 1.0,
    lifeAdjustment = 1.0,
    technologyAdjustment = 1.0,
    revenueAdjustment = 1.0,
  } = adjustmentFactors;

  const totalAdjustment = territoryAdjustment * lifeAdjustment * technologyAdjustment * revenueAdjustment;
  const adjustedValue = comparablePrice * totalAdjustment;

  return {
    adjustedValue,
    comparablePrice,
    totalAdjustment,
    adjustmentFactors: {
      territory: territoryAdjustment,
      life: lifeAdjustment,
      technology: technologyAdjustment,
      revenue: revenueAdjustment,
    },
  };
};

/**
 * Quality Score Model
 * Q = Σ(w_i * z_i) where z_i = (x_i - μ_i) / σ_i
 * 
 * @param {Object} indicators - Raw indicator values
 * @param {Object} benchmarks - Mean and std dev for each indicator
 * @param {Object} weights - Weights for each indicator
 * @returns {Object}
 */
export const calculateQualityScore = (indicators, benchmarks, weights) => {
  const normalizedScores = {};
  let totalWeightedScore = 0;

  Object.keys(indicators).forEach((key) => {
    const value = indicators[key];
    const { mean, stdDev } = benchmarks[key] || { mean: value, stdDev: 1 };
    const weight = weights[key] || 0;

    // Calculate z-score
    const zScore = stdDev !== 0 ? (value - mean) / stdDev : 0;
    const weightedScore = weight * zScore;

    normalizedScores[key] = {
      rawValue: value,
      zScore,
      weight,
      weightedScore,
    };

    totalWeightedScore += weightedScore;
  });

  // Normalize to 0-100 scale (assuming z-scores typically range -3 to +3)
  const normalizedQuality = Math.max(0, Math.min(100, 50 + totalWeightedScore * 10));

  return {
    qualityScore: normalizedQuality,
    totalWeightedScore,
    normalizedScores,
  };
};

/**
 * Multi-Impact Quality Model
 * Q = α*M_i + β*T_i + γ*A_i where α + β + γ = 1
 * 
 * @param {number} marketImpact - Market impact score
 * @param {number} technologyImpact - Technology impact score
 * @param {number} assigneeImpact - Assignee impact score
 * @param {Object} weights - { alpha, beta, gamma }
 * @returns {Object}
 */
export const calculateMultiImpactScore = (
  marketImpact,
  technologyImpact,
  assigneeImpact,
  weights = { alpha: 0.4, beta: 0.4, gamma: 0.2 }
) => {
  const { alpha, beta, gamma } = weights;

  // Ensure weights sum to 1
  const totalWeight = alpha + beta + gamma;
  const normalizedWeights = {
    alpha: alpha / totalWeight,
    beta: beta / totalWeight,
    gamma: gamma / totalWeight,
  };

  const qualityScore =
    normalizedWeights.alpha * marketImpact +
    normalizedWeights.beta * technologyImpact +
    normalizedWeights.gamma * assigneeImpact;

  return {
    qualityScore,
    normalizedWeights,
    components: {
      market: { value: marketImpact, contribution: normalizedWeights.alpha * marketImpact },
      technology: { value: technologyImpact, contribution: normalizedWeights.beta * technologyImpact },
      assignee: { value: assigneeImpact, contribution: normalizedWeights.gamma * assigneeImpact },
    },
  };
};
