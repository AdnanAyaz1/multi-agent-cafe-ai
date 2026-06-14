export function AnalysisHeader() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px w-12 bg-[#e89070]" />
        <p className="text-[11px] text-[#e89070] uppercase tracking-[0.2em] font-semibold font-mono">Agent Pipeline</p>
      </div>
      <h1 className="text-3xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight">
        Watch AI think
      </h1>
      <p className="text-zinc-400 text-sm lg:text-base max-w-lg">
        Five specialized agents chained together — analyzing weather, competitors, and your menu to maximize revenue.
      </p>
    </div>
  );
}
