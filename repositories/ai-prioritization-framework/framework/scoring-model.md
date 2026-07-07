# Scoring Model

Status: v1 scoring philosophy  
Last updated: July 2026

## Philosophy

Scoring should improve product discussion, not replace product judgment.

The AI Prioritization Framework uses a weighted scoring model because AI opportunities rarely fail for one reason. A technically feasible idea can still fail because customer value is weak, data is poor, costs are high, or trust risk is unacceptable.

## Recommended Dimensions

Score each criterion from 1 to 5.

| Score | Meaning |
| --- | --- |
| 1 | Weak or unsupported |
| 2 | Some signal, high uncertainty |
| 3 | Moderate signal, meaningful unknowns |
| 4 | Strong signal, manageable risk |
| 5 | Very strong signal, clear evidence |

## Criteria

- Customer Pain
- Workflow Frequency
- Business Impact
- Strategic Alignment
- Data Readiness
- Model Feasibility
- Operational Complexity
- Trust & Risk
- Time to Value
- Cost to Serve

## Recommendation Bands

| Recommendation | When to Use |
| --- | --- |
| Build Now | Strong customer value, strong business value, high readiness, manageable trust risk |
| Prototype | Strong upside but meaningful feasibility, trust, or adoption uncertainty |
| Validate Further | Problem may matter, but evidence is not strong enough to increase investment |
| Park | Opportunity is interesting but weak timing, readiness, or strategic fit |
| Reject | AI adds complexity without enough customer or business value |

## Weighting Guidance

Customer value and trust risk should carry more weight than novelty.

Suggested weighting:

- Customer Value: 30%
- Business Value: 25%
- Execution Readiness: 25%
- Trust & Risk: 20%

Teams may adjust weights for regulated, enterprise, consumer, or platform contexts.

## Scoring Rule

If customer value is weak, do not prioritize the opportunity even if technical feasibility is high.

If trust risk is unacceptable, do not prioritize automation until safeguards are improved.
