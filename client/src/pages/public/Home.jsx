import HeroSection from "../../components/sections/HeroSection";
import CommunitiesSection from "../../components/sections/CommunitiesSection";
import CTASection from "../../components/sections/CTASection";

export default function Home() {
  return (
    <div style={{ backgroundColor: "var(--color-cream)" }}>
      <HeroSection />
      <CommunitiesSection />
      <CTASection />
    </div>
  );
}