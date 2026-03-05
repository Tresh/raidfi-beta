
CREATE TABLE public.whitepaper (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  version text NOT NULL DEFAULT '1.0',
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.whitepaper_changelogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL,
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.whitepaper ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whitepaper_changelogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_whitepaper" ON public.whitepaper FOR SELECT USING (is_published = true);
CREATE POLICY "admin_manage_whitepaper" ON public.whitepaper FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "public_read_changelogs" ON public.whitepaper_changelogs FOR SELECT USING (true);
CREATE POLICY "admin_manage_changelogs" ON public.whitepaper_changelogs FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

INSERT INTO public.whitepaper (content, version) VALUES (
$WP$# RAIDFI

### Contribution Intelligence & Reputation Infrastructure for Web3

**Whitepaper | Version 1.0 | 2026**

---

## Table of Contents

| # | Section |
|---|---------|
| 01 | [Executive Summary](#01-executive-summary) |
| 02 | [The Structural Problem in Web3 Contribution](#02-the-structural-problem-in-web3-contribution) |
| 03 | [Defining Contribution](#03-defining-contribution) |
| 04 | [RaidFi System Architecture](#04-raidfi-system-architecture) |
| 05 | [Contribution Tracking Layer](#05-contribution-tracking-layer) |
| 06 | [Reputation Engine](#06-reputation-engine) |
| 07 | [Raid Pool](#07-raid-pool) |
| 08 | [Raid Teams](#08-raid-teams) |
| 09 | [Analytics & Intelligence Layer](#09-analytics--intelligence-layer) |
| 10 | [What RaidFi Is Not](#10-what-raidfi-is-not) |
| 11 | [Long-Term Strategic Implications](#11-long-term-strategic-implications) |
| 12 | [Vision](#12-vision) |

---

## 01. Executive Summary

Web3 has successfully built financial infrastructure. It has not yet built structured contribution infrastructure.

Protocols depend on communities for distribution, awareness, adoption, and cultural propagation. Yet contribution remains informal, unstructured, easily manipulated, and largely unverifiable. Social metrics are inflated. Engagement is gamed. Projects cannot reliably distinguish signal from noise. Contributors cannot carry reputation across ecosystems. Capital is allocated based on surface metrics rather than verified performance.

**RaidFi is a Contribution Intelligence and Reputation Infrastructure Layer.**

It formalizes contribution as structured, analyzable data across the social platforms where Web3 communities operate. It introduces persistent, portable reputation tied to verifiable behavioral history. It enables optional contribution campaigns through Raid Pools without reducing the system to engagement farming.

RaidFi does not attempt to replace communities.
It does not attempt to tokenize attention.
It does not facilitate payments on platforms that prohibit it.
It does not exist to inflate vanity metrics.

> **It exists to make contribution measurable, portable, and credible.**

---

## 02. The Structural Problem in Web3 Contribution

### 2.1 Distribution Is Informal

Most Web3 growth relies on social amplification, community raids, influencer propagation, thread writing, ecosystem participation, meme distribution, and early contributor loyalty.

However, these activities are hard to verify, easy to fake, impossible to standardize, and fragmented across platforms.

Projects currently rely on screenshots, spreadsheets, bot-heavy engagement metrics, or subjective evaluation.

**There is no shared infrastructure layer for contribution verification.**

---

### 2.2 Engagement Metrics Are Structurally Misleading

Surface-level metrics such as likes, impressions, retweets, replies, and follower counts are not reliable measures of contribution quality.

They can be purchased, automated, Sybil-attacked, or coordinated artificially.

Investors and founders understand this intuitively, yet still rely on these metrics due to lack of alternatives.

---

### 2.3 No Portable Reputation

In traditional systems, reputation compounds over time through career history, credit history, and track record.

In Web3, a high-performing contributor in one ecosystem resets to zero in another. Raid leaders have no structured credibility layer. Contributors cannot prove long-term performance without manual references.

Reputation is siloed, informal, and non-transferable.

---

### 2.4 Misaligned Incentives

Engagement farming incentivizes short-term extraction, spam, low-quality amplification, and fake participation.

There is no structural reward for sustained credibility.

---

## 03. Defining Contribution

Before designing infrastructure, the term must be defined precisely.

### 3.1 What Contribution Means in General

Contribution is behavior that increases the value, visibility, resilience, or adoption of a system.

It is not activity. It is value-producing activity.

---

### 3.2 What Contribution Means in Web3

In Web3, contribution includes amplifying protocol updates, educating users, driving participation, participating in governance, hosting discussions, supporting launches, and executing coordinated visibility campaigns across social platforms.

Contribution is social. It happens on the platforms where communities live.

---

### 3.3 Why It Matters

Web3 protocols depend on network effects. Network effects depend on distribution. Distribution depends on contributors.

If contribution remains unstructured, distribution remains inefficient.

---

### 3.4 What Becomes Possible When Contribution Is Structured

| When contribution is measurable | The outcome |
|----------------------------------|-------------|
| Projects can allocate incentives rationally | Capital goes to verified contributors, not noise |
| Contributors can build durable credibility | Reputation compounds across ecosystems |
| Investors can evaluate ecosystem health accurately | Signal replaces surface metrics |
| Coordinated participation becomes scalable | Contribution becomes infrastructure |

---

## 04. RaidFi System Architecture

RaidFi is composed of four interdependent layers. These layers are modular but logically connected.

| Layer | Description |
|-------|-------------|
| **01. Contribution Tracking Layer** | Tracks behavioral signals across social platforms |
| **02. Reputation Engine** | Converts behavioral history into portable, persistent reputation |
| **03. Analytics & Intelligence Layer** | Delivers structured contributor and ecosystem analytics |
| **04. Raid Pool** | Optional campaign layer for structured contribution with rewards where platforms permit |

---

## 05. Contribution Tracking Layer

### 5.1 Social Tracking

RaidFi uses platform APIs to pull contribution data across the social platforms where Web3 communities operate.

Tracked platforms include Twitter/X, Discord, and Telegram, among others.

Signals include participation consistency, amplification patterns, temporal behavior, cross-platform activity, and engagement depth metrics.

The goal is not volume measurement. It is pattern recognition.

---

### 5.2 Platform Eligibility

RaidFi uses each platform's API to collect contribution data. What happens with that data depends entirely on what the platform's terms allow.

Twitter/X explicitly prohibits using data collected through its API in ways that result in payment or reward to individual users. That means X contribution feeds into analytics and reputation scoring only. No Raid Pool rewards can be attached to X activity.

Platforms whose terms permit their data to be used in reward contexts are eligible for Raid Pool campaigns.

| Platform Type | Analytics & Reputation | Raid Pool Rewards |
|---------------|------------------------|-------------------|
| Platforms that permit data use in reward contexts | Yes | Yes |
| Platforms with restrictions (e.g., Twitter/X) | Yes | No |

RaidFi operates strictly within each platform's terms. No workarounds. No exceptions.

---

### 5.3 Identity Linking

RaidFi links social identity across platforms where users voluntarily connect their accounts. This linkage allows contribution history to persist and compound across ecosystems.

*Trust Assumption: Users voluntarily connect identities. RaidFi does not enforce identity beyond what users opt into.*

---

## 06. Reputation Engine

Reputation is not a token. It is not a leaderboard score. It is a structured behavioral record.

---

### 6.1 What Reputation Means Generally

Reputation is a probabilistic estimate of future behavior based on historical performance.

---

### 6.2 What Reputation Means in Web3

In Web3, reputation must be portable, Sybil-resistant, behavior-based, longitudinal, non-transferable, and resistant to short-term gaming.

---

### 6.3 Reputation Scoring Dimensions

| Dimension | Description |
|-----------|-------------|
| Contribution consistency | Regularity and reliability of participation over time |
| Behavioral longevity | Duration of sustained contribution activity |
| Cross-platform activity | Contribution across multiple social platforms and communities |
| Campaign participation history | Track record within structured Raid Pool campaigns |
| Quality-weighted amplification | Social signals weighted by depth and impact, not volume |

Reputation increases slowly. It can decay through inactivity. It can be penalized through manipulation detection.

---

### 6.4 Incentive Logic

Short-term spam yields minimal long-term reputation impact. Sustained, verifiable behavior compounds credibility.

This shifts incentives from extraction to persistence.

---

### 6.5 Attack Vectors & Mitigation

| Attack Vector | Risk | Mitigation |
|---------------|------|------------|
| Sybil attacks | Multiple accounts simulating contribution | Behavioral clustering analysis and long-term consistency weighting |
| Engagement inflation | Bot amplification | Depth metrics and pattern irregularity detection |
| Coordinated manipulation | Group collusion to inflate scores | Cross-referenced interaction modeling and anomaly detection |

*No system is perfectly Sybil-proof. RaidFi reduces the economic incentive for Sybil attacks by making long-term credibility more valuable than short-term reward.*

---

## 07. Raid Pool

Raid Pool is RaidFi's campaign layer. It is optional, not the core product.

Projects deploy Raid Pool campaigns to coordinate structured social contribution across platforms. Contributors participate, get tracked, and where the platform permits, receive rewards distributed through the campaign.

**How it works:**

- A project creates a Raid Pool campaign with defined goals and reward parameters
- Contributors participate across eligible social platforms
- RaidFi pulls contribution data via each platform's API and tracks signals throughout the campaign
- On platforms whose terms allow their data to be used in reward contexts, rewards are allocated based on verified contribution
- On platforms like Twitter/X where terms prohibit this, activity is tracked and credited to reputation only, no rewards

> Raid Pool is not a farming scheme. Reward distribution is tied to verified, tracked contribution, not raw engagement numbers.

**What Raid Pool is not:**

- Not a click-farm
- Not a bot-friendly reward system
- Not a workaround for platform terms of service
- Not limited to any single platform

---

## 08. Raid Teams

Raid Teams are structured coordination units that participate in Raid Pool campaigns collectively.

**What they enable:**

- Collective performance tracking
- Reputation stacking across team members
- Performance benchmarking against other teams
- Structured project coordination at scale

Teams are not mandatory. Some projects may opt for individual participation only.

Over time, teams develop track records, forming a meta-layer of credibility above individual scores.

---

## 09. Analytics & Intelligence Layer

RaidFi provides contributor analytics dashboards, ecosystem health insights, distribution efficiency metrics, and contribution segmentation.

For projects, this means visibility into who is actually driving their community growth, and the ability to identify and reward the right contributors.

For investors, this introduces early detection of organic traction, identification of authentic contributor bases, and reduced reliance on vanity metrics.

---

## 10. What RaidFi Is Not

| RaidFi is NOT |
|---------------|
| A token farming protocol |
| A social media automation tool |
| A marketing agency |
| A pay-per-click network |
| A speculative token yield platform |
| A centralized engagement broker |
| A tool that violates platform terms of service |

**It is infrastructure for social contribution intelligence.**

---

## 11. Long-Term Strategic Implications

If successful, RaidFi enables portable contributor identity, contribution-based access gating, merit-based opportunity allocation, reduced manipulation in ecosystem growth, and more rational incentive allocation.

**Contribution becomes an economic primitive.**

---

## 12. Vision

Web3 has built decentralized finance, decentralized governance, decentralized storage, and decentralized identity experiments.

It has not yet built a structured, portable, verifiable contribution layer.

RaidFi aims to become that layer.

Not as hype infrastructure. But as behavioral infrastructure.

---

> *The system is not built for hype cycles.*
> *It is built for structural longevity.*

**[raidfi.site](https://raidfi.site)**

| | |
|---|---|
| Website | [raidfi.site](https://raidfi.site) |
| Twitter / X | [@raidfi_app](https://x.com/raidfi_app) |
| Discord | [discord.gg/kQuabXkDmw](https://discord.gg/kQuabXkDmw) |
| Documentation | Coming Soon |

*Whitepaper v1.0 | 2026 | Confidential*$WP$,
'1.0'
);

INSERT INTO public.whitepaper_changelogs (version, description) VALUES ('1.0', 'Initial whitepaper release');
