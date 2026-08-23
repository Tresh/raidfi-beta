import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import HowItWorks from "@/components/HowItWorks";
import WhatItMeasures from "@/components/WhatItMeasures";
import ForContributors from "@/components/ForContributors";
import ForProjects from "@/components/ForProjects";
import ReputationLayer from "@/components/ReputationLayer";
import ContributionIntelligence from "@/components/ContributionIntelligence";
import BuiltForWeb3 from "@/components/BuiltForWeb3";
import RaidPool from "@/components/RaidPool";
import WhatRaidFiIsNot from "@/components/WhatRaidFiIsNot";
import WhyThisMatters from "@/components/WhyThisMatters";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

import { useSEO } from "@/hooks/useSEO";

const Index = () => {
  useSEO({
    title: "RaidFi — Contribution Intelligence & Reputation Infrastructure for Web3",
    description: "RaidFi turns contribution across Web3 communities into structured data, meaningful insights, and a reputation that compounds over time.",
    path: "/",
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <WhatItMeasures />
        <ForContributors />
        <ForProjects />
        <ReputationLayer />
        <ContributionIntelligence />
        <BuiltForWeb3 />
        <RaidPool />
        <WhatRaidFiIsNot />
        <WhyThisMatters />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
