import { Header } from '@/components/dashboard/Header';
import { DashboardWidgets } from '@/components/dashboard/DashboardWidgets';
import { FeatureCard } from '@/components/dashboard/FeatureCard';

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" aria-hidden />
      <Header />
      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
        <section id="top" className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Dashboard
          </p>
          <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Weather, briefing &amp; competitor scraping
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Pull a live weather snapshot, run the five-agent pipeline for a
            prioritised set of actions, and trigger a Crawlee + Playwright scrape
            of a competitor URL — all from one place.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <FeatureCard
            href="/weather"
            eyebrow="Weather"
            title="Live snapshot"
            description="Fetch current conditions for any city to feed the agent pipeline."
          />
          <FeatureCard
            href="/analysis"
            eyebrow="Analysis"
            title="Daily AI briefing"
            description="Run the 5-agent pipeline against the latest weather snapshot and menu."
          />
          <FeatureCard
            href="/competitors"
            eyebrow="Competitors"
            title="Scrape & parse"
            description="Enqueue a Crawlee + Playwright scrape and watch snapshots land."
          />
        </section>

        <DashboardWidgets />
      </main>
    </div>
  );
}
