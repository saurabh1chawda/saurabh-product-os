# JD Data Model

## Object

`JobDescription` is the normalized input object consumed by the JD Intelligence Engine.

Each field must declare whether it is direct, inferred, or derived. Inferred fields require confidence scores. Sensitive or unsupported fields must be marked for human review instead of treated as facts.

## Field Definitions

| Field | Type | Required | Extraction Method | Confidence | Source Type | Human Confirmation |
| --- | --- | --- | --- | --- | --- | --- |
| jd_id | string | Yes | Generated from company, role, date, and hash | High | Derived | No |
| source | string | Yes | User input or file path | High | Direct | No |
| source_url | string/null | Optional | User input | Medium | Direct | Yes if external |
| captured_at | date-time | Yes | System timestamp | High | Derived | No |
| company_name | string | Yes | JD heading or source metadata | Medium-High | Direct | Yes if ambiguous |
| company_type | string/null | Optional | JD/company description | Medium | Inferred | Yes |
| industry | string/null | Optional | JD text or verified company context | Medium | Inferred | Yes |
| role_title | string | Yes | JD title | High | Direct | No |
| normalized_role_title | string | Yes | Normalization rules | Medium-High | Derived | Yes if ambiguous |
| stated_level | string/null | Optional | JD title or requirements | High | Direct | No |
| inferred_level | string/null | Optional | Responsibilities and seniority signals | Medium | Inferred | Yes |
| location | string/null | Optional | JD location field | High | Direct | No |
| work_model | enum | Optional | Remote/hybrid/onsite language | Medium-High | Direct/Inferred | Yes if ambiguous |
| employment_type | enum | Optional | Full-time/contract/internship language | High | Direct | No |
| reporting_context | string/null | Optional | Explicit reporting language only | Medium | Direct | Yes |
| product_domain | array | Optional | Domain terms | Medium | Derived | Yes |
| customer_type | array | Optional | Consumer, SMB, enterprise, developer, merchant | Medium | Derived | Yes |
| product_type | array | Optional | Platform, marketplace, SaaS, mobile, AI workflow | Medium | Derived | Yes |
| primary_archetype | string | Yes | Weighted classifier | Medium-High | Derived | Yes |
| secondary_archetypes | array | Optional | Weighted classifier | Medium | Derived | Yes |
| responsibilities | array | Yes | Section segmentation | Medium-High | Direct | Yes |
| required_qualifications | array | Yes | Section segmentation | Medium-High | Direct | Yes |
| preferred_qualifications | array | Optional | Section segmentation | Medium-High | Direct | Yes |
| technical_requirements | array | Optional | Competency extraction | Medium | Derived | Yes |
| leadership_requirements | array | Optional | Competency extraction | Medium | Derived | Yes |
| domain_requirements | array | Optional | Competency extraction | Medium | Derived | Yes |
| business_metrics | array | Optional | Metric and outcome terms | Medium | Derived | Yes |
| collaboration_signals | array | Optional | Signal rules | Medium | Derived | Yes |
| ownership_signals | array | Optional | Signal rules | Medium | Derived | Yes |
| decision_signals | array | Optional | Signal rules | Medium | Derived | Yes |
| ambiguity_signals | array | Optional | Signal rules | Medium | Inferred | Yes |
| keywords | array | Yes | Keyword engine | Medium | Derived | Yes |
| priority_keywords | array | Yes | Weighted keyword engine | Medium | Derived | Yes |
| company_language | array | Optional | Company-specific phrases | Medium | Direct/Derived | Yes |
| hidden_signals | array | Optional | Hidden-signal framework | Medium | Inferred | Yes |
| risks | array | Optional | Gap analysis | Medium | Derived | Yes |
| confidence_scores | object | Yes | Aggregated classifier and parser confidence | Medium | Derived | Yes |

## Fields That Must Never Be Inferred As Facts

The engine must never infer these values as confirmed facts:

- Compensation.
- Work authorization.
- Reporting manager.
- Team size.
- Company strategy.
- Internal product maturity.
- Technologies not stated or publicly verified.
- Revenue targets.
- Funding status.
- Specific product roadmap.

If useful, these can be marked as assumptions requiring human review.

## Confidence Model

| Confidence | Meaning | Handling |
| --- | --- | --- |
| High | Directly stated and unambiguous | Can be used in recommendations |
| Medium | Supported by multiple phrases or strong normalized pattern | Use with rationale |
| Low | Weak signal or single ambiguous phrase | Human review required |
| Unknown | Not present | Do not use as evidence |

## Source-Type Rules

- Direct: copied from or clearly stated in the JD.
- Derived: produced by deterministic normalization from direct text.
- Inferred: interpreted from multiple source phrases and always labeled.

