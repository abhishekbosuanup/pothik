export const SAFETY_MODES = {
  general: {
    name: "General Safety",
    weights: {
      lighting: 1,
      crime: 1,
      emergency: 1,
      road: 1,
      activity: 1,
      timeRisk: 1,
      weatherRisk: 1,
    },
  },

  women: {
    name: "Women Safety",
    weights: {
      lighting: 1.25,
      crime: 1.30,
      emergency: 1.25,
      road: 1,
      activity: 1.20,
      timeRisk: 1.20,
      weatherRisk: 1,
    },
  },
};