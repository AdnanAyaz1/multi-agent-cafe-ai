import { Header } from '@/components/dashboard/Header';
import WeatherDisplay from '@/components/dashboard/WeatherDisplay';

export default function WeatherPage() {
  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" aria-hidden />
      <Header />
      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
        <section className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Weather
          </p>
          <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Live weather snapshot
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Fetch current conditions for any city to feed the agent pipeline.
          </p>
        </section>
        <WeatherDisplay />
      </main>
    </div>
  );
}
