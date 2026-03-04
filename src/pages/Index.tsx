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

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Problem />
      <Solution />
      <HowItWorks />
      <Features />
      <Value />
      <WhyNow />
      <NetworkEffects />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
