# AI Product Lifecycle

Status: v1 capstone guide  
Last updated: July 2026

## Purpose

The AI Product Lifecycle shows how Product Managers move from customer problem to scaled AI product without starting from model novelty.

The lifecycle orchestrates the Product Leadership Platform. It points to the repository that should own each artifact rather than duplicating the detailed framework content.

## Lifecycle Overview

| Stage | Purpose | Common Mistakes | Expected Outputs | Primary Repository |
| --- | --- | --- | --- | --- |
| Problem Discovery | Identify the customer, workflow, pain, and business consequence | Starting with model capability, vague problem statements, stakeholder opinion as evidence | Problem statement, workflow context, initial assumptions | Product Discovery Toolkit |
| Customer Discovery | Gather evidence about behavior, frequency, pain, trust, and current workarounds | Asking solution-leading questions, interviewing only internal stakeholders, ignoring observed behavior | Interview notes, discovery canvas, evidence ladder | Product Discovery Toolkit |
| AI Opportunity Assessment | Decide whether AI is the right type of solution | Treating every automation idea as AI, ignoring rules or UX alternatives, skipping data readiness | AI opportunity assessment, fit hypothesis, risk profile | AI Prioritization Framework |
| Prioritization | Compare AI opportunities against customer value, business value, readiness, risk, and cost | Prioritizing demos, confusing executive excitement with readiness, ignoring opportunity cost | Prioritized AI opportunity list, scorecard, recommendation | AI Prioritization Framework |
| Architecture Decisions | Choose traditional software, RAG, agent, hybrid, buy, configure, extend, build, or platform | Overengineering, agent hype, vendor-first thinking, underestimating operating complexity | Architecture recommendation, build-vs-buy decision, constraints | AI Product Playbook |
| Prototype | Test the riskiest workflow and trust assumptions with limited scope | Building full product too early, testing model output without workflow, ignoring fallback paths | Prototype brief, test plan, acceptance criteria | AI Product Playbook |
| Validation | Prove whether the product changes customer behavior and improves workflow outcomes | Measuring model quality only, relying on usage alone, skipping trust metrics | Validation scorecard, experiment results, adoption signals | Product Discovery Toolkit |
| Investment Decision | Communicate whether to build, extend, buy, park, or reject | Burying recommendation, hiding trade-offs, asking for investment without evidence | Decision memo, alternatives, risks, success criteria | Decision Memo Template |
| Execution | Build the product experience, platform support, evaluation loop, and operational model | Shipping AI as a feature instead of product system, weak escalation, poor observability | Roadmap, launch plan, trust safeguards, operational readiness | AI Product Playbook |
| Measurement | Connect AI system signals to workflow, customer, and business outcomes | Tracking accuracy alone, dashboard theater, missing cost-to-value | AI success metrics, evaluation plan, business impact review | AI Product Playbook |
| Scale | Expand only when adoption, trust, unit economics, and operations support it | Scaling before reliability, expanding without learning, ignoring governance | Scale decision, platform plan, product leadership brief | Product Leadership Briefs |

## How To Use This Lifecycle

1. Start with the stage where the decision is unclear.
2. Use the linked repository for the detailed artifact.
3. Return to this lifecycle to understand the next decision.
4. Write the investment decision before scaling.
5. Document the final product decision as a Product Leadership Brief.

## Repository Handoff Model

| From | To | Handoff Artifact |
| --- | --- | --- |
| Product Discovery Toolkit | AI Prioritization Framework | Validated customer problem and opportunity assessment |
| AI Prioritization Framework | AI Product Playbook | Prioritized AI opportunity and readiness profile |
| AI Product Playbook | Decision Memo Template | Architecture, trust, measurement, and execution recommendation |
| Decision Memo Template | Product Leadership Briefs | Approved decision, trade-offs, metrics, and outcome review |
| Product Leadership Briefs | Product OS | Public executive evidence and reusable operating principle |

## Related Repositories

- Product Discovery Toolkit: `../../product-discovery-toolkit/README.md`
- AI Prioritization Framework: `../../ai-prioritization-framework/README.md`
- Decision Memo Template: `../../decision-memo-template/README.md`
- Product Leadership Briefs: `../../product-leadership-briefs/README.md`
- Product OS: `../../../README.md`
