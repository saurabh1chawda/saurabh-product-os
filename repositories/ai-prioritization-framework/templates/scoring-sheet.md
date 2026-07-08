# Scoring Sheet

Status: v1 production worksheet  
Last updated: July 2026

Use this worksheet to evaluate one AI opportunity during roadmap planning, discovery synthesis, or executive investment review.

Score each criterion from 1 to 5:

| Score | Meaning |
| ---: | --- |
| 1 | Weak or unsupported |
| 2 | Some signal, high uncertainty |
| 3 | Moderate signal, meaningful unknowns |
| 4 | Strong signal, manageable risk |
| 5 | Very strong signal, clear evidence |

## Opportunity Summary

| Field | Response |
| --- | --- |
| Opportunity name |  |
| Product area |  |
| Customer segment |  |
| Decision owner |  |
| Review date |  |
| Recommendation | Build Now / Prototype / Validate Further / Park / Reject |

## Criterion Scoring

| Criterion | Score | Evidence | Notes |
| --- | --- | --- | --- |
| Customer Pain |  |  |  |
| Workflow Frequency |  |  |  |
| Business Impact |  |  |  |
| Strategic Alignment |  |  |  |
| Data Readiness |  |  |  |
| Model Feasibility |  |  |  |
| Operational Complexity |  |  |  |
| Trust & Risk |  |  |  |
| Time to Value |  |  |  |
| Cost to Serve |  |  |  |

## Weighted Scoring

| Dimension | Weight | Criteria Included | Dimension Score | Weighted Contribution |
| --- | ---: | --- | ---: | ---: |
| Customer Value | 30 | Customer Pain, Workflow Frequency |  |  |
| Business Value | 25 | Business Impact, Strategic Alignment |  |  |
| Execution Readiness | 25 | Data Readiness, Model Feasibility, Operational Complexity, Time to Value, Cost to Serve |  |  |
| Trust & Risk | 20 | Trust & Risk |  |  |
| Total | 100 |  |  |  |

Scoring formula:

```text
Weighted contribution = (dimension score / 5) * dimension weight
Final score = sum of weighted contributions
```

## Dimension Summary

| Dimension | Strength | Risk | Decision Note |
| --- | --- | --- | --- |
| Customer Value |  |  |  |
| Business Value |  |  |  |
| Execution Readiness |  |  |  |
| Trust & Risk |  |  |  |

## Recommendation

Choose one:

- Build Now
- Prototype
- Validate Further
- Park
- Reject

Use [Recommendation Guide](../framework/recommendation-guide.md) for thresholds and gating rules.

## Rationale

Why is this the right recommendation?

## Decision Conditions

| Condition | Response |
| --- | --- |
| What would make this Build Now? |  |
| What would make this Prototype? |  |
| What would make this Validate Further? |  |
| What would make this Park? |  |
| What would make this Reject? |  |

## Conditions to Revisit

What would need to change for the recommendation to change?

## Export Targets

Supported now:

- Markdown: use this file directly.
- CSV: export the Criterion Scoring and Weighted Scoring tables.
- Excel: copy tables into separate worksheet tabs.
- Google Sheets: copy tables into separate worksheet tabs and preserve score formulas.

Future:

- Notion database template.

Recommended tabs for spreadsheet exports:

1. Opportunity Summary
2. Criterion Scoring
3. Weighted Scoring
4. Recommendation
5. Decision Log
