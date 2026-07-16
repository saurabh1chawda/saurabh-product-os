# Keyword Engine

## Purpose

The keyword engine extracts and ranks terms that matter for ATS matching and human relevance. It must improve discoverability without encouraging keyword stuffing.

## Keyword Types

- Exact JD keywords.
- Normalized keywords.
- Compound phrases.
- Technical terms.
- Product metrics.
- Domain terms.
- Leadership language.
- Company-specific wording.
- Required qualification terms.
- Preferred qualification terms.

## Keyword Classes

| Class | Definition | Resume Handling |
| --- | --- | --- |
| Must cover | Required qualification or central responsibility with verified evidence | Include naturally when supported |
| Strongly recommended | Important responsibility, repeated domain term, or seniority signal | Use if evidence exists |
| Supporting | Helpful context but not central | Include in skills or summary only if relevant |
| Optional | Nice-to-have or weakly related | Use sparingly |
| Boilerplate | Legal, benefits, generic values | Ignore for resume fit |
| Dangerous to mirror without evidence | Credential, technology, domain, or authority not supported by canonical data | Report as risk or gap |

## Weighting Rules

| Source | Weight |
| --- | ---: |
| Required qualification | 5 |
| Responsibility | 4 |
| Preferred qualification | 3 |
| Role overview | 2 |
| Company overview | 1 |
| Boilerplate | 0 |

Repeated terms may increase importance by up to 25 percent, but repetition alone must not dominate the ranking.

## Extraction Rules

- Keep multi-word phrases intact when they carry role meaning.
- Normalize common variants while preserving original wording.
- Identify seniority terms separately from skills.
- Identify product metrics separately from business nouns.
- Separate company-specific language from general ATS keywords.
- Flag terms that are not supported by Resume OS evidence.

## Examples

| JD Phrase | Normalized Keyword | Class | Notes |
| --- | --- | --- | --- |
| LLM-powered workflows | LLM workflows | Must cover | Only if AI PM evidence exists |
| increase activation | activation | Strongly recommended | Growth evidence required |
| partner with executives | executive communication | Strongly recommended | Leadership evidence required |
| MBA preferred | MBA | Dangerous to mirror without evidence | Do not claim |
| world-class culture | null | Boilerplate | Ignore |

## Forbidden Recommendations

The engine must not recommend JD language that:

- Cannot be supported by evidence.
- Is legally sensitive.
- Misrepresents seniority.
- Overstates technical expertise.
- Describes a required credential the candidate does not possess.
- Claims production AI experience where the evidence is a prototype, simulation, or framework.

