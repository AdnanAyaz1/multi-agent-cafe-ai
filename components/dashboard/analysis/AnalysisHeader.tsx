interface AnalysisHeaderProps {
  pipelineType: 'weather' | 'competitor';
}

const HEADERS = {
  weather: {
    label: 'Weather Pipeline',
    title: 'Weather-aware menu optimization',
    description: 'Five specialized agents chained together — analyzing weather and your menu to maximize revenue.',
  },
  competitor: {
    label: 'Competitor Pipeline',
    title: 'Competitor intelligence & action plan',
    description: 'Scrapes competitor sites, analyzes pricing gaps, and generates an action plan with recommended changes.',
  },
} as const;

export function AnalysisHeader({ pipelineType }: AnalysisHeaderProps) {
  const header = HEADERS[pipelineType];

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px w-12 bg-[#e89070]" />
        <p className="text-[11px] text-[#e89070] uppercase tracking-[0.2em] font-semibold font-mono">{header.label}</p>
      </div>
      <h1 className="text-3xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight">
        {header.title}
      </h1>
      <p className="text-zinc-400 text-sm lg:text-base max-w-lg">
        {header.description}
      </p>
    </div>
  );
}
