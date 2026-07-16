# Evidence Matching Engine

## Purpose

The evidence matching engine ranks verified Resume OS evidence against a job description. It selects evidence for relevance, strength, and defensibility, not only keyword overlap.

## Inputs

- Normalized `JobDescription`.
- Archetype scores.
- Competencies and keywords.
- Hidden hiring signals.
- Canonical achievements.
- Bullet library.
- Projects.
- Product OS assets.
- GitHub repositories.

## Weighted Formula

Final score is normalized to 100.

| Dimension | Weight |
| --- | ---: |
| Archetype alignment | 20% |
| Competency match | 20% |
| Keyword match | 15% |
| Domain match | 10% |
| Business-impact strength | 10% |
| Seniority alignment | 10% |
| Evidence strength | 5% |
| Recency | 5% |
| Technical / leadership depth fit | 5% |

Formula:

```text
score =
  archetype_alignment * 0.20 +
  competency_match * 0.20 +
  keyword_match * 0.15 +
  domain_match * 0.10 +
  business_impact_strength * 0.10 +
  seniority_alignment * 0.10 +
  evidence_strength * 0.05 +
  recency * 0.05 +
  depth_fit * 0.05 -
  penalties
```

All dimensions are scored from 0 to 100 before weighting.

## Normalization Method

- `technical_depth`, `leadership_depth`, and `business_impact_strength` use 0-5 scales and are converted to 0-100.
- Archetype alignment is the maximum applicable archetype score adjusted by primary/secondary fit.
- Competency match is the percentage of high-priority JD competencies supported by achievement tags.
- Keyword match is capped at 85 unless competencies also match.
- Domain match requires both domain tags and evidence source relevance.
- Recency is context-aware: older evidence may score well when domain relevance is strong.

## Penalties

| Penalty | Amount |
| --- | ---: |
| Unsupported keyword | -15 |
| Wrong domain emphasis | -10 |
| Low recency and weak relevance | -10 |
| Simulation presented too prominently | -20 |
| Weak evidence | -15 |
| Duplicate evidence in same resume section | -10 |
| Over-repetition of same achievement | -10 |
| Seniority mismatch | -15 |
| Technical overstatement risk | -20 |
| Confidentiality concern | -25 |

## Example Explanation

Achievement: `SIM-REV-001`

Score: `91`

Reasons:

- Strong monetization match.
- Strong revenue outcome.
- High recruiter value.
- Strong role-level alignment.
- Current JD prioritizes pricing and growth.

Penalty:

- Limited direct marketplace context.

## Achievement Metadata Rationale

The enriched achievement metadata is not a new claim layer. It is a retrieval layer.

- `importance_score` ranks overall usefulness for future resumes.
- `evidence_strength` reflects how strongly the achievement is supported by sources.
- `confidence_status` distinguishes verified, public, self-reported, simulation, prototype, and conceptual evidence.
- `keyword_tags`, `competency_tags`, and `domain_tags` support retrieval.
- `archetype_scores` allows role-specific ranking.
- `recruiter_value`, `hiring_manager_value`, and `ats_value` separate audience value.
- `technical_depth`, `leadership_depth`, and `business_impact_strength` help fit seniority.
- `interview_defensibility` measures whether the candidate can credibly explain the claim.
- `confidentiality_status` prevents unsafe disclosure.

## Output Requirements

Every matched evidence item must include:

- Evidence ID.
- Score.
- Score breakdown.
- JD phrases addressed.
- Product OS or GitHub proof links.
- Penalties.
- Confidence.
- Human-review flag.

