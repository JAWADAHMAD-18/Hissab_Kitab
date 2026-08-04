import { Hero } from "@/components/client/Hero";
import { HowItWorks } from "@/components/client/HowItWorks";
import { WhyHisabKitab } from "@/components/client/WhyHisabKitab";
import { FounderNote } from "@/components/client/FounderNote";
import { FinalCTA } from "@/components/client/FinalCTA";
import { Footer } from "@/components/client/Footer";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <WhyHisabKitab />
      <FounderNote />
      <FinalCTA />
      <Footer />
    </main>
  );
}






