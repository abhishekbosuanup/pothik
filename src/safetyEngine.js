// Pothik Safety Engine

export function calculateSafetyScore(
  factors,
  mode = "general"
) {
  const {
    lighting = 0,
    crime = 0,
    emergency = 0,
    road = 0,
    activity = 0,
    timeRisk = 0,
    weatherRisk = 0,
  } = factors;

  const modes = {
    general: {
      lighting: 1,
      crime: 1,
      emergency: 1,
      road: 1,
      activity: 1,
      timeRisk: 1,
      weatherRisk: 1,
    },

    women: {
      lighting: 1.25,
      crime: 1.30,
      emergency: 1.25,
      road: 1,
      activity: 1.20,
      timeRisk: 1.20,
      weatherRisk: 1,
    },
  };

  const weights =
    modes[mode] || modes.general;

  const rawScore =
    lighting * weights.lighting +
    crime * weights.crime +
    emergency * weights.emergency +
    road * weights.road +
    activity * weights.activity +
    timeRisk * weights.timeRisk +
    weatherRisk * weights.weatherRisk;

  const maxPossible =
    20 * weights.lighting +
    25 * weights.crime +
    15 * weights.emergency +
    15 * weights.road +
    10 * weights.activity +
    10 * weights.timeRisk +
    5 * weights.weatherRisk;

  const normalizedScore =
    (rawScore / maxPossible) * 100;

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(normalizedScore)
    )
  );
}

export function getSafetyLevel(score) {
  if (score >= 80) {
    return "Safer Choice";
  }

  if (score >= 60) {
    return "Moderate Risk";
  }

  return "Higher Risk";
}

export function getSafetyColor(score) {
  if (score >= 80) {
    return "#16a34a";
  }

  if (score >= 60) {
    return "#f59e0b";
  }

  return "#dc2626";
}

export function calculateBalancedScore(
  safetyScore,
  duration,
  minDuration,
  maxDuration
) {
  let timeScore = 100;

  const timeRange =
    maxDuration - minDuration;

  if (timeRange > 0) {
    timeScore =
      100 -
      ((duration - minDuration) /
        timeRange) *
        100;
  }

  return (
    safetyScore * 0.65 +
    timeScore * 0.35
  );
}