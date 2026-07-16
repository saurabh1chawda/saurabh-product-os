# Component Recommendation Engine

## Purpose

The component recommendation engine selects reusable Resume OS modules for a job description. It recommends structure and evidence, not a finished resume.

## Recommendation Types

- Target headline.
- Summary module.
- Experience bullets.
- Project module.
- Product OS reference.
- Skills ordering.
- Tools inclusion.
- Certifications.
- Awards.
- Publications.
- Education.
- Relocation statement where known.
- Work authorization statement where known.

## Output Contract

Every recommendation must include:

- Recommended component.
- Alternative component.
- Reason.
- Evidence IDs.
- JD signals addressed.
- Confidence.
- Risks.
- Human-review requirement.

## Selection Rules

### Target Headline

Choose the headline that best matches the primary archetype and role level. Do not create a headline using unsupported domain claims.

### Summary Module

Select a summary direction that highlights:

- Primary archetype.
- Strongest verified evidence.
- One or two differentiators.
- Product OS only when it strengthens relevance.

### Experience Bullets

Use the bullet ranking engine. Do not generate new bullet copy.

### Project Module vs Product OS Module

Default rule:

- Use one strong role/company-specific project OR one concise Product OS proof module.
- Do not include both automatically.

Use a company-specific project when:

- The role has a clear domain or company-specific problem.
- The project is explicitly labeled as simulation, prototype, case study, or open-source work.
- It addresses a missing domain signal without pretending to be employment experience.

Use a Product OS flagship block when:

- The role values product judgment, frameworks, AI product thinking, or written communication.
- The Product OS asset is directly relevant to the role.
- It will not displace stronger work-experience evidence.

Use both only when:

- The JD explicitly asks for portfolio/work samples.
- The role is highly senior or AI/product-strategy oriented.
- Page length remains within constraints.

Use neither when:

- Work experience already provides strong direct fit.
- Additional modules create clutter.
- ATS readability would suffer.

### Skills Ordering

Skills should be ordered by:

1. Must-cover JD competencies with evidence.
2. Primary archetype skills.
3. Secondary archetype skills.
4. Product OS differentiators.
5. Tools and technical terms.

### Certifications, Awards, Publications, Education

Include these only when:

- They are canonical.
- They support role relevance.
- They do not crowd out stronger evidence.

## Risk Flags

- Unsupported headline domain.
- Summary overclaims AI, platform, or leadership depth.
- Project module reads like employment experience.
- Product OS block duplicates experience evidence.
- Skills section mirrors JD without proof.
- Work authorization or relocation is unknown.

