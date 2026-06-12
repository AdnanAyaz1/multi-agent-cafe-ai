export const AGENT_COLORS: Record<string, string> = {
  'menu-analyst': '#3b82f6',
  'weather-analyst': '#22c55e',
  strategist: '#f59e0b',
  critic: '#ef4444',
  synthesizer: '#a855f7',
};

export const DEFAULT_PIPELINE_STEPS = [
  { label: 'Menu Analysis', status: 'complete' as const, description: 'Scanning menu items and pricing' },
  { label: 'Weather Intelligence', status: 'complete' as const, description: 'Correlating weather patterns' },
  { label: 'Competitor Scan', status: 'active' as const, description: 'Monitoring competitor prices' },
  { label: 'Strategy Engine', status: 'pending' as const, description: 'Generating recommendations' },
  { label: 'Quality Review', status: 'pending' as const, description: 'Validating suggestions' },
];
