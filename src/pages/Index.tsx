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
    title: "RaidFi - See Who Actually Contributes to Your Ecosystem",
    description: "RaidFi turns community activity across X, Discord and Telegram into contribution data and a reputation record that shows who consistently adds value.",
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
