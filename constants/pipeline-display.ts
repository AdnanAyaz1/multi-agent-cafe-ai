export const AGENT_COLORS: Record<string, string> = {
  'menu-analyst': '#00d2ff',
  'weather-analyst': '#1fe19e',
  strategist: '#ffd79f',
  critic: '#f87171',
  synthesizer: '#a78bfa',
};

export const DEFAULT_PIPELINE_STEPS = [
  { label: 'Menu Analysis', status: 'complete' as const, description: 'Scanning menu items and pricing' },
  { label: 'Weather Intelligence', status: 'complete' as const, description: 'Correlating weather patterns' },
  { label: 'Competitor Scan', status: 'active' as const, description: 'Monitoring competitor prices' },
  { label: 'Strategy Engine', status: 'pending' as const, description: 'Generating recommendations' },
  { label: 'Quality Review', status: 'pending' as const, description: 'Validating suggestions' },
];
