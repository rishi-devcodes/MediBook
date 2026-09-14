import { Hero } from "@/components/home/Hero";
import { SpecialtyGrid } from "@/components/home/SpecialtyGrid";
import { FeaturedDoctors } from "@/components/home/FeaturedDoctors";
import { HowItWorks } from "@/components/home/HowItWorks";
import { TrustSection } from "@/components/home/TrustSection";
import { CTASection } from "@/components/home/CTASection";

export default function Home() {
  return (
    <main>
      <Hero />
      <SpecialtyGrid />
      <FeaturedDoctors />
      <HowItWorks />
      <TrustSection />
      <CTASection />
    </main>
  );
}
