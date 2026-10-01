import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { BASE_URL } from "@/lib/constants";
import { sanitizeUrl } from "@/lib/utils";

const privacyContent = `# Privacy Policy

**Last Updated:** September 30, 2026

RaidFi ("RaidFi", "we", "us", or "our") operates [raidfi.site](https://raidfi.site) and related products and services, including its beta testing subdomain [beta.raidfi.site](https://beta.raidfi.site). This Privacy Policy applies equally to [raidfi.site](https://raidfi.site), [beta.raidfi.site](https://beta.raidfi.site), and all associated subdomains, applications, and services operated by RaidFi.

RaidFi is a Contribution Intelligence & Reputation Infrastructure platform for Web3. Our MVP tracks contribution signals from connected social platforms, structures that activity into analyzable data, and generates behavior-based reputation.

This Privacy Policy explains what information we collect, how we use it, how we protect it, and the choices available to you.

## 1. Information We Collect

### 1.1 Account Information

When you create or access a RaidFi account, we may collect information necessary to create and maintain your account, such as:

- Email address
- Account identifier
- Authentication information
- Account creation and login information

We only collect information necessary to provide the relevant RaidFi service.

### 1.2 Connected Social Accounts

RaidFi allows users to voluntarily connect supported social accounts.

Depending on the integrations available to you, these may include:

- X (formerly Twitter)
- Farcaster

Connecting a social account is voluntary. RaidFi does not require users to establish a real-world identity in order to use the platform.

When you connect a supported social account, we may receive information made available through the applicable platform's API, subject to that platform's permissions, policies, and terms.

This may include:

- Platform username or handle
- Platform account identifier
- Public profile information
- Public posts or activity
- Contribution and engagement signals
- Timestamps and activity history
- Other information permitted by the relevant platform API

### 1.3 Contribution Data

RaidFi processes social activity to generate structured contribution signals.

Depending on the platform and available data, these signals may include:

- Frequency of activity
- Consistency of participation
- Amplification activity such as reposts, retweets, or shares
- Engagement depth such as replies and discussions
- Temporal activity patterns
- Cross-platform activity

The purpose is to identify behavioral patterns rather than simply measure raw engagement volume.

### 1.4 Reputation Data

RaidFi may generate a reputation record from contribution data.

This can include:

- Reputation score
- Contribution history
- Consistency indicators
- Activity timelines
- Platform-specific contribution breakdowns
- Behavioral signals
- Manipulation-related signals
- Score adjustments or decay resulting from inactivity

RaidFi's reputation system is behavior-based and longitudinal. It is not intended to represent a user's real-world identity, financial standing, or personal worth.

### 1.5 Project and Analytics Data

For project users, RaidFi may process contributor and ecosystem information to provide analytics such as:

- Contributor rankings
- Contribution breakdowns
- Platform distribution
- Contribution heatmaps
- Contributor segmentation
- Signal and noise analysis

### 1.6 Technical Information

We may automatically collect limited technical information required to operate, secure, and improve the service, including:

- IP address
- Browser and device information
- Operating system
- Approximate location derived from technical information
- Log information
- Authentication and session information
- Error and diagnostic information

We do not collect more information than reasonably necessary for the relevant purpose.

## 2. How We Use Information

We may use collected information to:

- Create and maintain RaidFi accounts
- Authenticate users
- Connect voluntarily linked social accounts
- Track contribution activity
- Generate contribution signals
- Calculate and maintain reputation records
- Provide contributor dashboards
- Provide project analytics
- Detect suspicious or manipulated activity
- Improve the accuracy and reliability of our systems
- Monitor system performance and security
- Investigate abuse or violations of our Terms
- Communicate with users about the service
- Comply with applicable legal obligations

## 3. How Reputation Works

RaidFi converts behavioral data into structured contribution and reputation signals.

The MVP reputation system considers factors such as:

- Consistency
- Longevity
- Engagement quality
- Behavioral reliability
- Cross-platform presence where available

RaidFi may also use manipulation signals such as unusual temporal spikes, behavioral clustering, and low-depth activity ratios.

These signals may affect the weight or score assigned to activity.

RaidFi does not claim that its reputation system is perfectly accurate or completely resistant to manipulation.

## 4. Social Platform Data

RaidFi uses platform APIs to collect contribution information from supported social platforms.

The information available to RaidFi depends on the permissions and limitations imposed by each platform.

RaidFi operates within applicable platform terms and API requirements.

For X activity, contribution data is used for analytics and reputation purposes only. X activity is not used to attach rewards through Raid Pool campaigns.

Where another platform permits future reward-related use of its data, any such use will remain subject to that platform's applicable terms and policies.

## 5. Voluntary Account Linking

You control which supported social accounts you connect to RaidFi.

You may choose not to connect a social account.

Where technically supported, you may disconnect a previously connected account.

Disconnecting an account may affect RaidFi's ability to continue collecting contribution data from that platform. Previously collected information may be retained where necessary for legitimate operational, security, legal, or historical reputation purposes, subject to applicable law.

## 6. How We Share Information

RaidFi does not sell personal information.

We may share information in limited circumstances, including:

### Service Providers

We may use trusted third-party providers for services such as:

- Hosting
- Authentication
- Database infrastructure
- Analytics
- Security
- Communication
- Monitoring

These providers may process information only as necessary to provide services to RaidFi.

### Project Analytics

RaidFi may provide project users with contributor analytics generated through the platform.

The information presented to a project depends on the relevant product functionality, permissions, and the nature of the data being analyzed.

### Legal Requirements

We may disclose information where reasonably necessary to:

- Comply with applicable law
- Respond to lawful requests
- Protect the rights or safety of RaidFi, users, or others
- Detect or investigate fraud, abuse, or security incidents
- Enforce our Terms

### Business Transfers

If RaidFi is involved in a merger, acquisition, restructuring, financing, or sale of assets, information may be transferred as part of that transaction, subject to applicable legal requirements.

## 7. Data Retention

We retain information for as long as reasonably necessary to provide the service and for legitimate purposes such as:

- Maintaining account history
- Maintaining reputation and contribution records
- Security
- Fraud and abuse prevention
- Legal compliance
- Resolving disputes
- Enforcing agreements

Retention periods may vary depending on the type of information and the purpose for which it was collected.

When information is no longer reasonably required, we may delete, anonymize, or otherwise dispose of it in accordance with our practices and applicable law.

## 8. Data Security

We use reasonable technical and organizational measures designed to protect information against unauthorized access, alteration, disclosure, or destruction.

However, no internet-based service can guarantee absolute security.

You should use appropriate security practices when accessing your RaidFi account and connected third-party accounts.

## 9. Your Privacy Rights

Depending on where you live, you may have rights regarding your personal information, including the right to:

- Request access to information we hold about you
- Request correction of inaccurate information
- Request deletion of personal information
- Request restriction of certain processing
- Object to certain processing
- Request portability of certain information
- Withdraw consent where processing is based on consent

Some rights may be limited by applicable law or by legitimate reasons for retaining information.

To exercise a privacy right, contact us using the information below.

## 10. Children's Privacy

RaidFi is not intended for children under the age required by applicable law to provide consent to data processing.

We do not knowingly collect personal information from children in violation of applicable law.

If you believe a child has provided personal information to RaidFi, contact us so that we can review and take appropriate action.

## 11. Third-Party Services

RaidFi may integrate with third-party platforms and services.

Those services operate under their own privacy policies and terms.

RaidFi is not responsible for the privacy practices of third-party services outside our control.

You should review the privacy policies of any platform you connect to RaidFi.

## 12. International Data Processing

RaidFi may use infrastructure and service providers located in countries other than your country of residence.

Where personal information is transferred across borders, we will take steps required by applicable law to protect that information.

## 13. Subdomain Notice (Beta Environment)

Please note that [beta.raidfi.site](https://beta.raidfi.site) is a subdomain operated by RaidFi specifically for beta testing, preview builds, and experimental feature validation. This Privacy Policy governs all user interactions, account data, and contribution signals processed across both [raidfi.site](https://raidfi.site) and [beta.raidfi.site](https://beta.raidfi.site).

## 14. Changes to This Privacy Policy

We may update this Privacy Policy as RaidFi develops, new integrations are introduced, or legal requirements change.

When we make material changes, we may update the "Last Updated" date and provide additional notice where required.

Your continued use of RaidFi after an updated Privacy Policy becomes effective constitutes use of the service under the updated policy, subject to applicable law.

## 15. Contact

For privacy questions, requests, or concerns, contact:

**RaidFi**
Website: [https://raidfi.site](https://raidfi.site)
Email: **hello.raidfi@gmail.com**

---

**Privacy Policy | RaidFi | 2026**
`;

const Privacy = () => {
  useSEO({
    title: "Privacy Policy - RaidFi",
    description: "RaidFi Privacy Policy explains what information we collect, how we use it, how we protect it, and the choices available to you.",
    path: "/privacy",
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
              "name": "Privacy Policy - RaidFi",
              "description": "RaidFi Privacy Policy",
              "publisher": { "@type": "Organization", "name": "RaidFi" },
              "url": `${BASE_URL}/privacy`,
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
            {privacyContent}
          </ReactMarkdown>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
