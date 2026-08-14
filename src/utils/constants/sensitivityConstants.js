// Voice sensitivity presets
export const sensitivityPresets = [
  { value: 0.3, label: '🌿 Very Quiet (Library)' },
  { value: 0.5, label: '🏠 Normal (Home)' },
  { value: 0.7, label: '☕ Slight Noise (Cafe)' },
  { value: 0.8, label: '🌆 Noisy (Street)' },
  { value: 0.9, label: '🚗 Very Noisy (Traffic)' },
];

export const sensitivityRange = {
  min: 0.0,
  max: 1.0,
  step: 0.05,
  default: 0.7, // Slight noise as default
};