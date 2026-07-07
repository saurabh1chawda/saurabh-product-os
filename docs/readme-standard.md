# README Standard

Status: RC1 launch standard  
Last updated: July 2026

## Purpose

This document defines the canonical README structure for flagship products in the Product Leadership Platform.

Every README should help visitors answer:

- What is this product?
- Who is it for?
- What problem does it solve?
- What can I use immediately?
- How does it connect to the broader ecosystem?

## Canonical README Structure

### 1. Product Header

Include:

- Product name
- Status
- Last updated
- Product Family
- Product Collection, where relevant
- One-sentence product description

### 2. Executive Summary

Explain the product's purpose in practical terms.

Keep it short enough for scanning.

### 3. Problem Statement

Describe the user or team problem the repository solves.

Avoid generic portfolio language.

### 4. Why This Exists

Explain why this repository exists as a standalone product and how it differs from Product OS.

### 5. Target Audience

Use primary and secondary audiences.

### 6. Product Overview

Name this section according to product type:

- Key Capabilities
- Toolkit Overview
- Framework Overview
- Template Overview
- Featured Briefs

### 7. Repository Structure

Show the directory map and explain folder responsibilities.

### 8. Getting Started or Usage Path

Tell visitors what to open first.

For Product OS, this can be local development. For artifact repositories, this should be a recommended reading or usage path.

### 9. Examples or Templates

Link to the highest-value reusable assets.

### 10. Product OS Relationship

Explain the separation:

- Product OS is the executive narrative layer.
- GitHub repositories are the reusable artifact layer.

### 11. Roadmap

Use v1, v2, and v3 milestones.

### 12. Contributing

State current contribution posture and future contribution paths.

### 13. License

State whether license is finalized and link to the licensing strategy when not finalized.

### 14. Status

Summarize maturity and launch readiness.

## Current README Audit

| Product | Strength | Inconsistency | Recommended Improvement |
| --- | --- | --- | --- |
| Product OS | Strong developer setup and architecture | Uses `Product OS <-> GitHub Relationship` while others use `Product OS Relationship` | Keep as-is; acceptable because Product OS is the anchor |
| AI Product Playbook | Clear audience, roadmap, and usage path | Templates are index-level only | Add one "Start here" path once framework depth improves |
| Product Leadership Briefs | Strong philosophy and featured briefs | No "Getting Started" heading | Add a short usage path before GA |
| AI Prioritization Framework | Strong framework and templates | No repository structure section beyond README narrative | Add explicit folder map before GA |
| Product Discovery Toolkit | Strong practical template list | No explicit repository structure section | Add folder map before GA |
| Decision Memo Template | Strong communication positioning | No explicit repository structure section | Add folder map before GA |

## High-Value Improvements Only

Do not rewrite every README for cosmetic consistency.

Before GA, prioritize:

1. Add explicit repository structure sections to standalone repositories that do not have them.
2. Add one recommended "Start here" path to every standalone repository.
3. Add license links after licensing strategy is finalized.
4. Add social preview or screenshot references.
5. Add related-product links across the ecosystem.

## Last Updated Convention

Use this format near the top of every README:

```text
Status: Foundation
Last updated: July 2026
Product Family: Product Discovery
Product Collection: Product Toolkit Collection
```

Use month and year only. Avoid daily updates unless the document is operational or release-critical.
