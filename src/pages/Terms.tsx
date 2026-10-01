import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { BASE_URL } from "@/lib/constants";
import { sanitizeUrl } from "@/lib/utils";

const termsContent = `# Terms of Service

**Last Updated:** September 30, 2026

These Terms of Service ("Terms") govern your access to and use of RaidFi ("RaidFi", "we", "us", or "our"), including [raidfi.site](https://raidfi.site), [beta.raidfi.site](https://beta.raidfi.site), the RaidFi application, dashboards, analytics, reputation features, and related services.

By accessing or using RaidFi, you agree to these Terms. If you do not agree with these Terms, do not use the service.

## 1. About RaidFi

RaidFi is Contribution Intelligence & Reputation Infrastructure for Web3.

RaidFi's MVP provides:

- Social contribution tracking
- Voluntarily linked social identities
- Behavior-based reputation
- Contributor analytics
- Project analytics

RaidFi is designed to structure contribution data and identify behavioral patterns.

The MVP does not include token incentives, financialization, Raid Pool reward campaigns, or Raid Teams.

Please note that [beta.raidfi.site](https://beta.raidfi.site) is a subdomain operated by RaidFi specifically for beta testing, preview builds, and experimental testing. These Terms govern your access to and use of services across both [raidfi.site](https://raidfi.site) and [beta.raidfi.site](https://beta.raidfi.site).

## 2. Eligibility

You may use RaidFi only if you are legally permitted to enter into these Terms under the laws applicable to you.

If you are using RaidFi on behalf of an organization, project, or other entity, you represent that you have authority to bind that entity to these Terms.

## 3. Accounts

Some RaidFi features require an account.

You are responsible for:

- Providing accurate information where required
- Keeping your account credentials secure
- Maintaining control of your account
- Not sharing access in a way that compromises account security
- Notifying RaidFi of unauthorized access

You are responsible for activity occurring through your account unless caused by a security issue attributable to RaidFi.

## 4. Social Account Connections

RaidFi allows users to voluntarily connect supported social accounts.

Current or planned supported integrations may include:

- X (formerly Twitter)
- Farcaster

You authorize RaidFi to access information made available through the applicable platform's API when you connect an account.

You must have the right to connect the account you provide.

You must not:

- Connect another person's account without authorization
- Circumvent platform authentication
- Provide false ownership information
- Use stolen or compromised credentials
- Attempt to bypass platform API restrictions

You may disconnect supported accounts where the relevant functionality is available.

## 5. Platform Terms and API Restrictions

Your use of connected third-party platforms remains subject to those platforms' own terms, rules, and policies.

RaidFi does not authorize you to violate those rules.

RaidFi is designed to operate within applicable platform API restrictions.

For example, X activity may be used for analytics and reputation purposes, but is not used to attach RaidFi rewards to X activity where the applicable platform rules prohibit such use.

No RaidFi feature should be interpreted as permission to circumvent a platform's terms, API restrictions, rate limits, or security controls.

## 6. Contribution Tracking

RaidFi processes available social activity to create structured contribution signals.

These may include:

- Frequency
- Consistency
- Amplification
- Engagement depth
- Temporal behavior
- Cross-platform activity where available

RaidFi does not guarantee that all activity will be detected or captured.

Platform APIs may impose limitations, delays, rate limits, incomplete data, or other restrictions that affect the information RaidFi can access.

## 7. Reputation System

RaidFi generates behavior-based reputation using historical contribution signals.

The reputation system may consider:

- Contribution consistency
- Behavioral longevity
- Engagement quality
- Behavioral reliability
- Cross-platform presence where available
- Signals associated with suspicious or manipulated behavior

Reputation may increase, remain stable, or decrease over time.

RaidFi may apply score dampening or reduced weighting where activity appears inconsistent with the behavioral patterns the system is designed to measure.

RaidFi does not guarantee that a reputation score accurately predicts future behavior or represents the complete value of a contributor.

Reputation scores are platform-generated signals and should not be treated as guarantees of employment, investment performance, financial returns, project success, or any other outcome.

## 8. Analytics

RaidFi may provide analytics to contributors and participating projects.

Analytics may include:

- Contributor rankings
- Activity timelines
- Contribution breakdowns
- Platform distribution
- Contribution heatmaps
- Contributor segmentation
- Signal and noise analysis

Analytics are generated from available data and system models.

RaidFi does not guarantee that analytics are complete, error-free, or continuously updated.

## 9. No Financial or Investment Advice

RaidFi is not a financial institution, investment adviser, broker, exchange, or financial service provider.

RaidFi does not provide investment, financial, legal, tax, or trading advice.

Nothing displayed through RaidFi should be interpreted as a recommendation to buy, sell, hold, invest in, or interact with any digital asset, token, protocol, project, or financial product.

## 10. No Guaranteed Rewards

RaidFi's MVP does not provide token incentives or financialized rewards.

Future RaidFi products may introduce additional campaign or reward functionality where permitted by applicable law and third-party platform rules.

Any future reward functionality may be subject to additional terms.

## 11. Acceptable Use

You agree not to use RaidFi to:

- Violate any applicable law or regulation
- Violate third-party platform terms
- Access accounts without authorization
- Submit fraudulent information
- Manipulate contribution data
- Create or operate accounts for abusive purposes
- Circumvent security controls
- Attempt to reverse engineer systems except where permitted by law
- Interfere with RaidFi's infrastructure
- Introduce malware or malicious code
- Conduct attacks against RaidFi or its users
- Abuse APIs or rate limits
- Attempt to artificially inflate reputation
- Coordinate fraudulent activity intended to manipulate analytics
- Use RaidFi to facilitate unlawful activity

## 12. Manipulation and Abuse

RaidFi may detect patterns associated with manipulation, including:

- Unnatural temporal spikes
- Similar behavioral patterns across accounts
- High volumes of low-depth activity
- Coordinated activity intended to artificially influence reputation

RaidFi may reduce the weight of suspicious activity or apply other reasonable measures to protect the integrity of its systems.

The MVP does not rely on automatic permanent bans as its primary manipulation response.

RaidFi may manually review edge cases.

## 13. User Content

If you submit content, information, links, or other materials through RaidFi, you remain responsible for that content.

You represent that you have the rights necessary to submit the content and that doing so does not violate applicable law or third-party rights.

You grant RaidFi the permissions reasonably necessary to process submitted content for the purpose of providing and improving the relevant RaidFi services.

## 14. Intellectual Property

RaidFi and its associated software, designs, branding, interfaces, documentation, databases, systems, and other materials are owned by or licensed to RaidFi unless otherwise stated.

These Terms do not transfer ownership of RaidFi intellectual property to you.

You may not copy, reproduce, distribute, modify, sell, sublicense, or commercially exploit RaidFi materials except where expressly permitted by RaidFi or applicable law.

RaidFi retains all rights not expressly granted under these Terms.

## 15. Third-Party Services

RaidFi may depend on or integrate with third-party services, including social platforms, authentication providers, infrastructure providers, and APIs.

RaidFi does not control third-party services.

Third-party services may change, become unavailable, restrict access, impose rate limits, modify APIs, or change their terms.

RaidFi is not responsible for changes or failures caused by third-party services outside its reasonable control.

## 16. Beta and Experimental Features

RaidFi may provide features through a controlled beta program, including features tested on [beta.raidfi.site](https://beta.raidfi.site).

Beta features may be incomplete, experimental, subject to change, or temporarily unavailable.

During beta, RaidFi may:

- Modify features
- Restrict access
- Change supported platforms
- Reset or modify test data
- Suspend features
- Remove access to specific functionality

Beta participation does not guarantee continued access to any feature.

## 17. Availability

We aim to keep RaidFi available and reliable, but we do not guarantee uninterrupted service.

The service may be unavailable because of:

- Maintenance
- Updates
- Infrastructure failures
- Security incidents
- Third-party service interruptions
- API restrictions
- Network failures
- Events outside our reasonable control

## 18. Disclaimer

RaidFi is provided on an "as is" and "as available" basis to the maximum extent permitted by applicable law.

To the extent permitted by law, RaidFi makes no warranties that:

- The service will always be available
- Data will always be complete or accurate
- Reputation scores will always be correct
- Analytics will always reflect all relevant activity
- The service will be free from errors
- The service will satisfy every user's particular requirements

RaidFi's reputation and analytics systems are designed to provide useful behavioral intelligence, not absolute truth.

## 19. Limitation of Liability

To the maximum extent permitted by applicable law, RaidFi and its directors, employees, contributors, contractors, and service providers will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages arising from or related to your use of the service.

This includes, where permitted by law, losses arising from:

- Service interruptions
- Incorrect or incomplete analytics
- Changes in reputation scores
- Third-party platform changes
- Loss of data
- Unauthorized account access
- Decisions made based on RaidFi analytics or reputation information

Nothing in these Terms excludes liability that cannot legally be excluded under applicable law.

## 20. Indemnification

To the extent permitted by applicable law, you agree to defend, indemnify, and hold harmless RaidFi and its directors, employees, contributors, contractors, and service providers from claims, damages, liabilities, costs, and expenses arising from:

- Your violation of these Terms
- Your misuse of RaidFi
- Your violation of third-party rights
- Your violation of applicable law
- Unauthorized use of connected accounts through your actions

## 21. Suspension and Termination

RaidFi may suspend or terminate access where reasonably necessary to:

- Protect the security of the service
- Investigate abuse or fraud
- Enforce these Terms
- Comply with legal requirements
- Protect users or third parties
- Respond to serious violations

You may stop using RaidFi at any time.

Where applicable, account deletion and data deletion requests are handled according to the RaidFi Privacy Policy and applicable law.

## 22. Changes to These Terms

RaidFi may update these Terms as the service develops.

When material changes are made, we may update the "Last Updated" date and provide additional notice where required.

Your continued use of RaidFi after updated Terms become effective constitutes acceptance of the updated Terms, subject to applicable law.

## 23. Governing Law

These Terms are governed by the laws of the Federal Republic of Nigeria, without regard to conflict-of-law principles.

Any dispute arising from these Terms or your use of RaidFi will be handled in the courts or dispute-resolution forum having jurisdiction under applicable law.

## 24. Contact

For questions regarding these Terms, contact:

**RaidFi**
Website: [https://raidfi.site](https://raidfi.site)
Email: **hello.raidfi@gmail.com**

---

**Terms of Service | RaidFi | 2026**
`;

const Terms = () => {
  useSEO({
    title: "Terms of Service - RaidFi",
    description: "RaidFi Terms of Service govern your access to and use of RaidFi platform, applications, dashboards, analytics, and reputation features.",
    path: "/terms",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-28 pb-16 max-w-4xl">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "Terms of Service - RaidFi",
              "description": "RaidFi Terms of Service",
              "publisher": { "@type": "Organization", "name": "RaidFi" },
              "url": `${BASE_URL}/terms`,
            }),
          }}
        />
        <article className="prose prose-invert max-w-none whitepaper-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ href, children, ...props }) => {
                if (href?.startsWith("#")) {
                  return (
                    <a
                      href={href}
                      onClick={(e) => {
                        e.preventDefault();
                        const el = document.getElementById(href.slice(1));
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      className="text-primary hover:underline cursor-pointer"
                      {...props}
                    >
                      {children}
                    </a>
                  );
                }
                return <a href={sanitizeUrl(href)} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
              },
              h2: ({ children, ...props }) => {
                const text = typeof children === "string" ? children : Array.isArray(children) ? children.map((c) => (typeof c === "string" ? c : "")).join("") : "";
                const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/^-+|-+$/g, "");
                return <h2 id={id} {...props}>{children}</h2>;
              },
            }}
          >
            {termsContent}
          </ReactMarkdown>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
