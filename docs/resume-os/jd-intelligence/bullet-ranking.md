# Bullet Ranking Engine

## Purpose

The bullet ranking engine selects approved bullet variants from the Resume OS bullet library. It does not write new final resume bullets.

## Core Rules

- Every selected bullet must map to a canonical achievement.
- Prefer the bullet variant matching the primary archetype.
- Use secondary-archetype bullets only when they add distinct evidence.
- Avoid multiple bullets using the same achievement unless explicitly justified.
- Avoid overloading one company with too many bullets.
- Preserve career chronology.
- Prioritize recent roles.
- Prioritize quantified impact.
- Preserve technical and leadership depth for senior roles.
- Do not select a bullet solely for keyword coverage.

## Selection Heuristics

| Factor | Preference |
| --- | --- |
| Primary archetype match | Highest |
| Quantified business impact | High |
| Recent role relevance | High |
| Required competency support | High |
| Product OS proof link available | Medium |
| Secondary archetype support | Medium |
| Older but rare domain evidence | Contextual |
| Unquantified or weakly sourced evidence | Low |

## Recommended Resume Distribution

| Role Type | Bullet Count |
| --- | ---: |
| Current role | 4-5 |
| Previous major roles | 3-4 |
| Older roles | 1-2 |
| Early data role | 0-1 depending on relevance |

## Diversity Requirements

- Minimum impact diversity: at least two impact types when possible, such as revenue, engagement, reliability, discovery, or delivery.
- Minimum domain diversity: avoid making every bullet about one domain unless the JD is narrow.
- Maximum repeated competency count: no more than three bullets should emphasize the same competency unless it is a central role requirement.
- Minimum recent-role representation: current or most recent role should usually carry the strongest evidence.

## Duplicate Avoidance

If two bullet variants map to the same achievement:

- Select the variant that best matches the primary archetype.
- Keep the alternative as a fallback.
- Do not include both unless one appears in the experience section and one appears in a project module with explicit justification.

## Output Requirements

Each ranked bullet must include:

- Bullet library file.
- Bullet text.
- Achievement ID.
- Role archetype.
- Score.
- JD signals addressed.
- Evidence source.
- Duplicate-risk flag.
- Human-review flag.

