# Decision Tree

Status: v1 decision flow  
Last updated: July 2026

Use this decision tree to move from opportunity to investment recommendation.

## Flow

```text
AI Opportunity
  |
  v
Is there a meaningful customer problem?
  |-- No  -> Reject
  |-- Yes
        |
        v
Would AI improve the workflow more than simpler alternatives?
  |-- No  -> Use rules, UX, process, or traditional software
  |-- Yes
        |
        v
Is business value measurable?
  |-- No  -> Validate Further
  |-- Yes
        |
        v
Are data, model, and evaluation readiness sufficient?
  |-- No  -> Prototype or Validate Further
  |-- Yes
        |
        v
Is trust risk manageable?
  |-- No  -> Add safeguards, reduce automation, or Park
  |-- Yes
        |
        v
Recommendation
  |-- Build Now
  |-- Prototype
  |-- Validate Further
  |-- Park
  |-- Reject
```

## Decision Guidance

### Build Now

Use when customer pain, business value, readiness, and trust conditions are strong.

### Prototype

Use when upside is strong but the team needs evidence about feasibility, workflow fit, evaluation, or user trust.

### Validate Further

Use when the problem may matter but evidence is not strong enough to increase investment.

### Park

Use when the opportunity could matter later but timing, readiness, economics, or strategy are weak today.

### Reject

Use when AI creates more complexity than customer or business value.
