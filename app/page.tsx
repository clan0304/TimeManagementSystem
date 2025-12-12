import { Navbar } from './(landing)/components/navbar';
import { HeroSection } from './(landing)/components/hero-section';
import { FeaturesSection } from './(landing)/components/features-section';
import { SystemsSection } from './(landing)/components/systems-section';
import { HowItWorksSection } from './(landing)/components/how-it-works-section';
import { CtaSection } from './(landing)/components/cta-section';
import { Footer } from './(landing)/components/footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090B] text-[#F8FAFC] overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient orb */}
        <div className="absolute top-[-20%] left-[50%] translate-x-[-50%] w-[800px] h-[800px] bg-[#22D3EE] opacity-[0.07] rounded-full blur-[120px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#F8FAFC 1px, transparent 1px), linear-gradient(90deg, #F8FAFC 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <SystemsSection />
      <HowItWorksSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
