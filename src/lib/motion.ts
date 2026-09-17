export const motionTokens = {
  duration: {
    instant: 0.08,
    fast: 0.18,
    normal: 0.3,
  },
  easing: {
    smooth: [0.22, 1, 0.36, 1] as const,
  },
  distance: {
    sidebarReveal: 176,
  },
};

export const springs = {
  snappy: { type: "spring" as const, stiffness: 360, damping: 34, mass: 0.72 },
  gentle: { type: "spring" as const, stiffness: 180, damping: 26, mass: 0.9 },
};
