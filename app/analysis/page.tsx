import { Header } from '@/components/dashboard/Header';
import AnalysisPanel from '@/components/dashboard/AnalysisPanel';

export default function AnalysisPage() {
  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" aria-hidden />
      <Header />
      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
        <section className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Analysis
          </p>
          <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Five-agent daily briefing
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Run the full pipeline (Menu → Weather → Strategist → Critic → Synthesizer)
            against the latest weather snapshot and the cafe&apos;s menu.
          </p>
        </section>
        <AnalysisPanel />
      </main>
    </div>
  );
}
