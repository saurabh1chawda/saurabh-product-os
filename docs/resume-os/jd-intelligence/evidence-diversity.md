# Evidence Diversity Rules

## Purpose

Evidence diversity prevents Resume OS from over-relying on one company, one achievement, or one type of proof. The future Resume Assembly Engine should feel balanced, current, and defensible.

## Baseline Rules

| Rule | Baseline |
| --- | --- |
| Maximum top-ranked achievements from one company | No more than 50% of recommended bullets from one company unless justified |
| Current role representation | Current role must be represented for senior, lead, AI, platform, and hybrid roles |
| Company diversity | At least two companies represented across major experience evidence when possible |
| Repeated achievement use | No achievement reused more than once by default |
| Recent impact | At least one recent high-impact metric included |
| Technical or leadership signal | At least one role-relevant technical or leadership signal included |
| Product OS balance | Product OS supports claims but does not replace employer evidence |

## Exceptions

Exceptions are allowed when:

- The role is highly specialized and one company has uniquely relevant evidence.
- The current role is the strongest and most recent proof source.
- The JD explicitly prioritizes a narrow domain.
- Older evidence is weaker or less relevant.

Every exception must include:

- Reason.
- Affected company.
- Evidence IDs.
- Human-review note.

## Balance Checks

The validator should warn when:

- More than 50% of recommended bullets come from one company.
- The same achievement appears repeatedly.
- Current role evidence is missing.
- Technical roles overuse growth evidence.
- Growth roles overuse architecture evidence.
- IC roles overuse people-management language.
- AI roles overstate GenAI or model ownership.
- Payment roles underweight reliability and trust.

## Output Requirements

Each fixture result should include:

- Company distribution.
- Repeated achievement count.
- Current-role representation.
- Business-impact representation.
- Technical/leadership representation.
- Diversity warnings.

