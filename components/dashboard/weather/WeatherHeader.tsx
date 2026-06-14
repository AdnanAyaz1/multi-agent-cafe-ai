export function WeatherHeader({ city, condition }: { city?: string; condition?: string }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px w-12 bg-[#e07850]" />
        <p className="text-[11px] text-[#e07850] uppercase tracking-[0.2em] font-semibold font-mono">
          Weather Intelligence
        </p>
      </div>
      <h1 className="text-3xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight">
        {city ? (
          <>{city} <span className="text-white/40">Weather</span></>
        ) : (
          <>Weather Intelligence</>
        )}
      </h1>
      <p className="text-zinc-400 text-sm lg:text-base max-w-lg">
        {condition ? `${condition} — driving real-time menu optimization.` : 'Search any city to get AI-powered menu recommendations.'}
      </p>
    </div>
  );
}
