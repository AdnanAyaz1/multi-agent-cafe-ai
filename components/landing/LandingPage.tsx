import { ShaderBackground } from "./ShaderBackground";
import { Navbar } from "./Navbar";
import { HeroSection } from "./HeroSection";
import { StatsSection } from "./StatsSection";
import { FeaturesSection } from "./FeaturesSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { TestimonialsSection } from "./TestimonialsSection";
import { PricingSection } from "./PricingSection";
import { CTASection } from "./CTASection";
import { FAQSection } from "./FAQSection";
import { Footer } from "./Footer";
import { SplashScreen } from "./SplashScreen";

export function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <SplashScreen />
      <ShaderBackground />
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

      <Navbar />

      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
