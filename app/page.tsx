import WeatherDisplay from '@/components/dashboard/WeatherDisplay';
import AnalysisPanel from '@/components/dashboard/AnalysisPanel';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <WeatherDisplay />
      <AnalysisPanel />
    </div>
  );
}
