import { Sidebar } from './Sidebar';
import { Sun, Bell, User } from 'lucide-react';
import type { DashboardLayoutProps } from '@/types/dashboard';

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-12 h-16 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-foreground font-heading">
            CafePromo AI
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a
            href="#"
            className="text-muted-foreground font-medium hover:bg-muted transition-colors px-3 py-1 rounded-lg"
          >
            Cafe Selector
          </a>
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <Sun className="size-[18px]" />
            <span>Weather: 72°F Sunny</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="caramel-gradient text-primary-foreground px-5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all hover:shadow-lg active:scale-[0.98]">
            Run Analysis
          </button>
          <div className="flex items-center gap-2">
            <button className="text-muted-foreground p-2 cursor-pointer hover:bg-muted rounded-full transition-colors">
              <Bell className="size-5" />
            </button>
            <button className="text-muted-foreground p-2 cursor-pointer hover:bg-muted rounded-full transition-colors">
              <User className="size-5" />
            </button>
          </div>
        </div>
      </nav>

      <Sidebar />

      {/* Main Content Area */}
      <main className="md:ml-[280px] pt-20 px-4 md:px-12 pb-12">
        {children}
      </main>
    </div>
  );
}
