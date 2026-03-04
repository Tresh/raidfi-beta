const NetworkEffects = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground">
            Compounding Intelligence
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            RaidFi's defensibility grows with every contributor, project, and data point
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {[
            {
              title: "More Contributors, Richer Reputation Graph",
              desc: "Every new contributor adds verified performance data. The reputation graph becomes more comprehensive, accurate, and valuable with scale.",
            },
            {
              title: "More Projects, Deeper Analytics",
              desc: "Each project that integrates RaidFi contributes cross-project performance data, creating a unified intelligence layer no single platform can replicate.",
            },
            {
              title: "More Data, Stronger Signal",
              desc: "As the dataset grows, scoring models improve, contributor differentiation sharpens, and the intelligence becomes decision-grade for projects allocating resources.",
            },
            {
              title: "Network Effect, Infrastructure Lock-In",
              desc: "Contributor reputation becomes portable and persistent. Once established, switching costs increase, RaidFi becomes embedded infrastructure, not a replaceable tool.",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="glass-card rounded-xl p-6 hover:border-primary/20 transition-all duration-300 flex gap-4 items-start"
            >
              <span className="text-primary text-xs font-medium mt-1 min-w-[20px]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-base font-medium mb-1 text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NetworkEffects;
