# Licensing Strategy

Status: RC1 launch standard  
Last updated: July 2026

## Purpose

This document defines the recommended licensing and reuse boundaries for the Product Leadership Platform.

The platform contains multiple asset types: application code, reusable templates, product frameworks, public documentation, personal career evidence, and brand assets. These should not all be treated the same way.

## Recommended License Model

Use a dual-boundary licensing strategy:

| Asset Type | Recommended Treatment | Rationale |
| --- | --- | --- |
| Application code | MIT License | Allows reuse of implementation patterns while keeping the platform open and inspectable |
| Reusable templates | Creative Commons Attribution 4.0 or MIT-style template permission | Encourages PMs to copy and adapt templates with attribution |
| Reusable frameworks | Creative Commons Attribution 4.0 | Allows public teaching and reuse while preserving attribution |
| Documentation standards | Creative Commons Attribution 4.0 | Supports reuse across future product repositories |
| Personal career content | All rights reserved unless explicitly marked reusable | Prevents reuse of personal profile, case evidence, and career narrative |
| Visual assets and screenshots | All rights reserved unless explicitly marked reusable | Avoids ambiguity around generated, branded, or portfolio-specific visuals |
| Product OS brand language | All rights reserved | Protects the identity and positioning of the platform |

## Recommended Repository-Level Approach

### Product OS

Recommended license posture:

- Code: MIT
- Personal career content: all rights reserved
- Product OS brand and visual assets: all rights reserved
- Reusable documentation patterns: attribution required

Product OS should include a clear license note because it mixes software, personal evidence, and portfolio content.

### AI Product Playbook

Recommended license posture:

- Frameworks and templates: Creative Commons Attribution 4.0
- Repository documentation: Creative Commons Attribution 4.0
- Example references: attribution required

### Product Leadership Briefs

Recommended license posture:

- Brief template: Creative Commons Attribution 4.0
- Product Decision Framework: Creative Commons Attribution 4.0
- Saurabh-specific brief evidence: all rights reserved

### AI Prioritization Framework

Recommended license posture:

- Framework, scoring model, templates, and workshop materials: Creative Commons Attribution 4.0
- Examples: attribution required

### Product Discovery Toolkit

Recommended license posture:

- Frameworks, templates, and workshop artifacts: Creative Commons Attribution 4.0
- Examples: attribution required

### Decision Memo Template

Recommended license posture:

- Memo templates and writing frameworks: Creative Commons Attribution 4.0
- Examples tied to Product OS evidence: attribution required

## Attribution Guidance

Recommended attribution:

```text
Adapted from Saurabh Chawda's Product Leadership Platform:
https://saurabh-product-os.vercel.app
```

For GitHub reuse:

```text
Based on the Product Leadership Platform by Saurabh Chawda.
```

## Personal Career Content Boundaries

The following should not be copied or reused as generic open-source content:

- Professional Profile copy
- Resume or career-positioning language
- Product Leadership Brief evidence tied to Saurabh's work
- Company-specific metrics and outcomes
- Interview resources
- Recruiter-facing positioning
- Personal images, screenshots, and branded Product OS visuals

These materials exist to evaluate Saurabh's product leadership. They are not reusable templates unless explicitly marked as such.

## Template Reuse Policy

Templates may be copied, adapted, and used in product work if attribution is preserved.

Template users may:

- Copy templates into internal documents.
- Modify prompts and sections.
- Use templates in workshops.
- Share adapted versions with attribution.

Template users may not:

- Remove attribution and republish as original work.
- Sell the templates as a standalone commercial product without permission.
- Reuse Saurabh-specific examples as their own experience.

## Framework Reuse Policy

Frameworks may be reused for learning, product reviews, workshops, and internal product operations with attribution.

Framework users should preserve:

- Framework name
- Source attribution
- Link to Product OS or the relevant repository
- Any stated limitations

## Launch Recommendation

Before GA:

1. Add a root `LICENSE` decision for Product OS.
2. Add a license note to every flagship repository README.
3. Add a short `LICENSE.md` or `NOTICE.md` to each standalone product package.
4. Mark personal evidence separately from reusable templates and frameworks.
5. Avoid public promotion until the reuse boundary is visible.
