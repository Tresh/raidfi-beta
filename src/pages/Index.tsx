import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Solution from "@/components/Solution";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Value from "@/components/Value";
import WhyNow from "@/components/WhyNow";
import NetworkEffects from "@/components/NetworkEffects";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

import { useSEO } from "@/hooks/useSEO";

const Index = () => {
  useSEO({
    title: "RaidFi — Get Credit for Promoting Crypto Projects",
    description: "Post about crypto projects, submit the link, and earn XP. RaidFi turns your posts into a track record you keep — and shows projects who really grew them.",
    path: "/",
  });
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Solution />
        {/*<HowItWorks />*/}
        <Features />
        <Value />
        {/*<WhyNow />
        <NetworkEffects />*/}
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
