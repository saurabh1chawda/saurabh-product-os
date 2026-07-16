# Role Archetype Classifier

## Purpose

The archetype classifier identifies the dominant PM hiring pattern in a job description. It uses weighted evidence rather than simple keyword counts.

The classifier returns:

- Primary archetype.
- Primary score.
- Up to two secondary archetypes.
- Secondary scores.
- Confidence.
- Evidence for classification.
- Ambiguities.
- Human-review recommendation.

## Scoring Model

| Signal Type | Weight |
| --- | ---: |
| Strong responsibility signal | 30 |
| Required qualification signal | 25 |
| Domain/product signal | 15 |
| Expected metric signal | 10 |
| Technical depth signal | 10 |
| Leadership depth signal | 10 |

Scores are normalized to 100 per archetype. A primary archetype should exceed the next archetype by at least 10 points for high confidence.

## Archetype Signal Definitions

### AI Product Manager

- Positive signals: AI/ML, model quality, AI workflows, evaluation, automation, responsible AI.
- Strong signals: human-in-the-loop, RAG, agents, prompt/context design, model performance metrics.
- Negative signals: AI mentioned only as company category with no AI product responsibilities.
- Ambiguous signals: "data-driven", "automation", "intelligent products".
- Typical responsibilities: identify AI opportunities, evaluate quality, define AI UX, manage model and product trade-offs.
- Expected metrics: model quality, adoption, automation rate, task completion, trust, cost-to-serve.
- Technical depth: medium-high.
- Leadership depth: medium-high.
- Evidence patterns: AI prioritization, RAG vs agent reasoning, trust before automation.
- Product OS assets: AI Product Playbook, AI Prioritization Framework.

### Generative AI Product Manager

- Positive signals: GenAI, LLMs, prompts, copilots, assistants, content generation.
- Strong signals: evals, hallucination reduction, context design, retrieval, agent workflows.
- Negative signals: generic AI strategy with no product execution.
- Ambiguous signals: "AI-native", "AI transformation".
- Typical responsibilities: define LLM-powered experiences, evaluation loops, safety boundaries.
- Expected metrics: eval quality, adoption, task success, latency, cost, trust.
- Technical depth: high.
- Leadership depth: medium-high.
- Evidence patterns: AI lifecycle, AI operating model, RAG vs agent decisioning.
- Product OS assets: AI Product Playbook, AI Prioritization Framework, Decision Memo Template.

### Platform Product Manager

- Positive signals: APIs, platform, infrastructure, developer experience, service reliability.
- Strong signals: architecture, scalability, internal customers, technical roadmap, cross-team dependencies.
- Negative signals: pure marketing or content roadmap with no platform ownership.
- Ambiguous signals: "platform" used as business platform rather than technical product.
- Typical responsibilities: define platform strategy, improve reliability, support developers and internal teams.
- Expected metrics: uptime, latency, throughput, adoption, developer productivity.
- Technical depth: high.
- Leadership depth: high.
- Evidence patterns: platform modernization, API strategy, technical stakeholder alignment.
- Product OS assets: Product Leadership Briefs, Decision Memo Template.

### Growth Product Manager

- Positive signals: acquisition, activation, conversion, retention, experimentation, lifecycle.
- Strong signals: funnel, referrals, engagement, cohort analysis, onboarding, PLG.
- Negative signals: generic "grow product" wording without funnel ownership.
- Ambiguous signals: "scale growth" without metric ownership.
- Typical responsibilities: run experiments, improve funnel metrics, prioritize growth loops.
- Expected metrics: conversion, retention, engagement, revenue, referrals.
- Technical depth: medium.
- Leadership depth: medium.
- Evidence patterns: conversion improvements, referral contribution, engagement growth.
- Product OS assets: Product Leadership Briefs, Product Discovery Toolkit.

### Monetization Product Manager

- Positive signals: pricing, packaging, revenue, subscriptions, loyalty, rewards, marketplace monetization.
- Strong signals: ARPU, MRR, ARR, checkout, conversion, offer design.
- Negative signals: finance-only role without product ownership.
- Ambiguous signals: "business impact" without revenue levers.
- Typical responsibilities: optimize pricing, offers, packages, revenue experience.
- Expected metrics: revenue, conversion, attach rate, margin, retention.
- Technical depth: medium.
- Leadership depth: medium-high.
- Evidence patterns: revenue growth, ARR/MRR growth, loyalty or pricing strategy.
- Product OS assets: Product Leadership Briefs, Decision Memo Template.

### Consumer Product Manager

- Positive signals: consumer, mobile, marketplace, engagement, retention, user experience.
- Strong signals: user journeys, personalization, lifecycle, discovery, trust and safety.
- Negative signals: purely internal tooling with no consumer surface.
- Ambiguous signals: "customers" when customer type is unclear.
- Typical responsibilities: improve customer experience, activation, engagement, retention.
- Expected metrics: engagement, conversion, retention, NPS, satisfaction.
- Technical depth: medium.
- Leadership depth: medium.
- Evidence patterns: engagement growth, content discovery, user funnel improvement.
- Product OS assets: Product Discovery Toolkit, Product Leadership Briefs.

### Payments / FinTech Product Manager

- Positive signals: payments, wallets, financial services, settlement, compliance, reliability.
- Strong signals: transaction success, payment rails, fraud, risk, reconciliation, uptime.
- Negative signals: non-financial checkout wording with no payment ownership.
- Ambiguous signals: "commerce" without payment responsibility.
- Typical responsibilities: launch payment capabilities, manage reliability and compliance, improve transaction flows.
- Expected metrics: transaction volume, success rate, uptime, customers onboarded.
- Technical depth: medium-high.
- Leadership depth: high.
- Evidence patterns: enterprise payments, prepaid transaction volume, platform adoption.
- Product OS assets: Product Leadership Briefs, Decision Memo Template.

### Enterprise SaaS Product Manager

- Positive signals: enterprise, SaaS, B2B, admins, workflows, integrations, retention.
- Strong signals: customer discovery, roadmap, onboarding, account expansion, enterprise stakeholders.
- Negative signals: consumer-only roles.
- Ambiguous signals: "customers" without sales motion.
- Typical responsibilities: discovery, prioritization, roadmap, enterprise adoption.
- Expected metrics: ARR, retention, activation, onboarding, usage, expansion.
- Technical depth: medium.
- Leadership depth: high.
- Evidence patterns: enterprise discovery, customer engagement, stakeholder alignment.
- Product OS assets: Product Discovery Toolkit, Product Leadership Briefs.

### Product Lead / Lead Product Manager

- Positive signals: lead, strategy, roadmap ownership, cross-functional leadership, mentoring.
- Strong signals: executive communication, portfolio trade-offs, operating cadence, alignment.
- Negative signals: narrowly scoped execution-only roles.
- Ambiguous signals: "lead initiatives" without senior authority.
- Typical responsibilities: set direction, drive decisions, align teams, communicate trade-offs.
- Expected metrics: business outcomes, delivery velocity, strategic adoption.
- Technical depth: varies by domain.
- Leadership depth: high.
- Evidence patterns: decision systems, roadmap acceleration, cross-functional execution.
- Product OS assets: Product OS, Product Leadership Briefs, Decision Memo Template.

### Senior Product Manager

- Positive signals: senior, ownership, roadmap, metrics, discovery, delivery, stakeholder management.
- Strong signals: ambiguous problem spaces, measurable outcomes, cross-functional execution.
- Negative signals: entry-level execution-only work.
- Ambiguous signals: "PM" with senior scope but no level.
- Typical responsibilities: own product area, define roadmap, align stakeholders, deliver outcomes.
- Expected metrics: adoption, revenue, retention, reliability, customer impact.
- Technical depth: medium.
- Leadership depth: medium-high.
- Evidence patterns: quantified PM outcomes across roles.
- Product OS assets: Product OS, Product Leadership Briefs.

## Confidence Rules

- High confidence: primary score >= 80 and 10+ points above second place.
- Medium confidence: primary score >= 65 and 5+ points above second place.
- Low confidence: primary score below 65 or multiple archetypes within 5 points.

## Human Review Triggers

- AI company but unclear AI product responsibilities.
- Title level conflicts with responsibilities.
- Platform language could mean business platform or technical platform.
- Role combines growth, monetization, and consumer language.
- Required domain expertise is not present in canonical evidence.

