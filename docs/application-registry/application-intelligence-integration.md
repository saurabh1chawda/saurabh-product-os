# Application Intelligence Integration

Last updated: 2026-07-18

Application Intelligence consumes Application Registry records as read-only inputs.

## Denominator Rules

- Exclude `discovered` and `saved` records from application outcome rates.
- Count each application ID once, even if reopened.
- Active records count in pipeline metrics but not terminal outcome rates.
- Terminal records count in final outcome reporting.

## Timing Rules

Use event history for stage timing where available. Use materialized fields only as the current operational state.

## Sanitized Projection

Private application records should be projected into sanitized analytics records before any public reporting. Contact details, notes, and private recruiter context are excluded.

