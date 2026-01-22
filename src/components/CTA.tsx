import { Button } from "@/components/ui/button";

const CTA = () => {
  return (
    <section className="py-24 bg-secondary">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground">
            Ready to Transform Social Engagement?
          </h2>

          <p className="text-muted-foreground mb-8">
            Swipht is building the infrastructure for valuing, ranking, 
            and rewarding social contribution in Web3.
          </p>

          <Button size="lg" asChild>
            <a href="#waitlist">Join Waitlist</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
