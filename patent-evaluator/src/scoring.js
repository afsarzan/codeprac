const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));

export const computeScores = (input) => {
  const {
    citationsForward = 0,
    citationsBackward = 0,
    claimsIndependent = 0,
    claimsDependent = 0,
    familySize = 0,
  } = input;

  const citationPower = clamp(20 + citationsForward * 4);
  const claimRobustness = clamp(15 + claimsIndependent * 10 + claimsDependent * 2);
  const familyCoverage = clamp(10 + familySize * 8);
  const novelty = clamp(70 - citationsBackward * 3);
  const legalRiskScore = clamp(90 - citationsBackward * 2 - Math.max(0, 6 - citationsForward));

  const strengthScore = Math.round(
    citationPower * 0.25 +
      claimRobustness * 0.2 +
      familyCoverage * 0.2 +
      novelty * 0.2 +
      legalRiskScore * 0.15
  );

  const confidence = clamp(60 + citationsForward * 2 + familySize * 2);
  const riskLevel = legalRiskScore < 45 ? 'High' : legalRiskScore < 70 ? 'Medium' : 'Low';
  const valueProxy = strengthScore >= 75 ? 'High' : strengthScore >= 55 ? 'Medium' : 'Low';

  const driversPositive = [];
  const driversNegative = [];

  if (citationsForward >= 12) {
    driversPositive.push('Strong forward citations');
  }
  if (familySize >= 6) {
    driversPositive.push('Wide jurisdictional coverage');
  }
  if (claimsIndependent >= 3) {
    driversPositive.push('Robust independent claim set');
  }

  if (citationsBackward >= 12) {
    driversNegative.push('High prior art density');
  }
  if (claimsIndependent <= 1) {
    driversNegative.push('Narrow claim breadth');
  }
  if (riskLevel === 'High') {
    driversNegative.push('Elevated invalidity exposure');
  }

  return {
    strengthScore,
    confidence,
    riskLevel,
    valueProxy,
    driversPositive: driversPositive.length ? driversPositive : ['Balanced portfolio signals'],
    driversNegative: driversNegative.length ? driversNegative : ['No critical risks detected'],
  };
};
