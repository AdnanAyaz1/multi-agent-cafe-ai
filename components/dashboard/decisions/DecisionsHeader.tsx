export function DecisionsHeader() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px w-12 bg-amber-500" />
        <p className="text-[11px] text-amber-500 uppercase tracking-[0.2em] font-semibold">Decision Center</p>
      </div>
      <h1 className="text-3xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight">
        AI Decisions
      </h1>
      <p className="text-zinc-400 text-sm lg:text-base max-w-lg">
        Review, approve, or reject AI-powered pricing and promotion decisions.
      </p>
    </div>
  );
}
