# ADR-010: AI Execution Platform & Model Gateway Strategy

## 1. Executive Summary

Status: Accepted

Date: 2026-07-21

Authors:

- Career Companion Architecture

Decision Category: Technology / AI Execution

Selected Technology: LiteLLM

Career Companion will use LiteLLM as the AI Execution Platform and Model Gateway technology. LiteLLM becomes the only approved provider-facing mechanism for AI execution. Capabilities must never communicate directly with OpenAI, Gemini, Anthropic, OpenRouter, or any other LLM provider.

LiteLLM is selected because it provides provider abstraction, OpenAI-compatible access patterns, routing, retries, fallback, spend tracking, budgets, rate limits, observability hooks, and model-access governance while preserving provider replaceability.

Career Companion remains responsible for business logic, prompt governance, prompt registry authority, schema validation, capability validation, AI execution records, artifact authority, workflow authority, evidence authority, and audit integration.

## 2. Context

Career Companion architecture is frozen. ADR-001 through ADR-009 establish repository ownership, runtime execution, workflow coordination, information storage, platform services, technology evaluation, PostgreSQL as transactional metadata authority, S3-compatible object storage for immutable artifacts, and OpenSearch for derived search.

Career Companion now needs a governed AI execution platform for all AI-assisted capabilities, including future capability execution for qualification, JD intelligence, resume strategy, resume QA, recruiter communication drafting, interview preparation, interview debrief, and career intelligence.

AI execution must support multiple providers and models without coupling business capabilities to provider SDKs. It must also provide observability, cost governance, retries, fallbacks, model routing, prompt governance integration, structured output enforcement, and provider independence.

## 3. Problem Statement

Career Companion needs a single approved AI execution path.

Without a governed AI Execution Platform, capabilities could call providers directly, hardcode prompts, embed provider-specific business logic, skip schema validation, fail without standardized retries, lose token and cost visibility, produce unaudited outputs, or allow raw LLM responses to enter workflow.

The decision needed is which AI execution platform should provide the model gateway and provider abstraction while preserving Career Companion's frozen architecture.

## 4. Architectural Constraints

ADR-001: AI execution records and prompt metadata must persist through repository-owned boundaries. AI execution must not create persistence shortcuts.

ADR-002: each governed execution cycle executes at most one capability. AI calls occur inside the capability execution boundary and must not trigger hidden workflow progression.

ADR-003: workflow coordination is stateless and resumes from governed commits, not provider memory.

ADR-004: AI outputs are not authoritative information. They may become artifact inputs only after validation and registration.

ADR-005: Model Gateway is a platform service. Platform services support business execution but do not own business logic.

ADR-006: technology selection must be architecture-driven and evaluation-based.

ADR-007: PostgreSQL remains authoritative for transactional metadata, including AI execution records where persisted.

ADR-008: immutable artifact storage remains authoritative for artifact content paired with PostgreSQL metadata.

ADR-009: search remains derived and must not become AI memory authority or evidence authority.

## 5. Capability Requirements

Required capabilities:

- Provider abstraction.
- Provider independence.
- Model routing.
- Prompt execution.
- Prompt registry integration.
- Prompt versioning support.
- Structured output support.
- Schema validation integration.
- Retry policy.
- Fallback policy.
- Timeout handling.
- Token accounting.
- Cost tracking.
- AI execution telemetry.
- Execution records.
- Model versioning.
- Provider versioning.
- Security and safety controls.
- Cost governance.
- Future provider support.
- Gateway interface for capabilities.

Non-requirements:

- Workflow engine.
- Business logic ownership.
- Capability orchestration.
- Persistence implementation.
- Search indexing.
- Identity implementation.
- Deployment implementation.
- Agent runtime.
- Multi-agent orchestration.
- Tool execution.
- Memory architecture.

## 6. Candidate Technologies

### LiteLLM

LiteLLM provides a unified interface across many LLM providers using OpenAI input/output formats. Its documentation describes provider translation, consistent output format, retry and fallback logic through routing, proxy-based cost tracking and budgets, authentication hooks, logging hooks, rate limiting, virtual keys, observability callbacks, and spend tracking. LiteLLM also exposes prompt management endpoints and prompt management integration surfaces.

### Native Provider SDKs

Native provider SDKs offer direct access to individual providers and strong support for provider-native features such as structured outputs. OpenAI, Anthropic, and Gemini all document structured output capabilities. Direct SDKs maximize access to provider-specific features but weaken provider abstraction, routing consistency, and centralized governance unless Career Companion builds those controls itself.

### OpenRouter

OpenRouter provides a unified API, model routing, fallback behavior, provider selection, cost aggregation, and access to multiple models and providers. Its documentation describes provider routing, fallback configuration, provider selection options, and unified billing/analytics. It is strong as a hosted routing layer but introduces a third-party broker dependency and less local control over gateway governance.

### LangChain

LangChain provides model integrations, agent abstractions, structured output handling, retries for schema errors, and orchestration-oriented application patterns. Its structured output documentation describes provider strategy, tool strategy, schema validation, and automatic structured response handling. LangChain is powerful but is broader than an AI execution gateway and can blur capability, orchestration, and agent concerns.

### Custom AI Gateway

A custom AI gateway could be designed exactly around Career Companion architecture. It could own provider abstraction, routing, retries, fallback, observability, cost tracking, and prompt governance. However, it would require substantial implementation and maintenance effort before the platform has proven the need to own a bespoke gateway.

## 7. Weighted Evaluation Matrix

Scoring:

- 5: Strong fit with low risk.
- 4: Good fit with manageable risk.
- 3: Acceptable fit with known trade-offs.
- 2: Weak fit requiring mitigation.
- 1: Poor fit or significant risk.
- 0: Not compatible.

Weights:

- High = 3
- Medium = 2
- Low = 1

| Criterion | Weight | LiteLLM | Native Provider SDKs | OpenRouter | LangChain | Custom AI Gateway |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Architecture Alignment | 3 | 5 | 2 | 4 | 3 | 5 |
| Provider Abstraction | 3 | 5 | 1 | 5 | 4 | 5 |
| Provider Independence | 3 | 5 | 1 | 4 | 4 | 5 |
| Model Routing | 3 | 5 | 1 | 5 | 3 | 5 |
| Retry and Fallback | 3 | 5 | 2 | 5 | 4 | 5 |
| Cost Governance | 3 | 5 | 2 | 4 | 2 | 5 |
| Observability | 3 | 5 | 2 | 4 | 4 | 5 |
| Prompt Governance Fit | 3 | 4 | 1 | 2 | 3 | 5 |
| Structured Output Support | 3 | 4 | 5 | 3 | 5 | 5 |
| Gateway Boundary Fit | 3 | 5 | 1 | 4 | 2 | 5 |
| Security and Access Controls | 3 | 4 | 2 | 3 | 3 | 5 |
| Vendor Lock-in | 3 | 4 | 1 | 2 | 3 | 5 |
| Maintainability | 3 | 4 | 2 | 4 | 3 | 2 |
| Operational Simplicity | 3 | 4 | 2 | 4 | 3 | 1 |
| Testability | 3 | 4 | 2 | 3 | 3 | 3 |
| Migration Complexity | 2 | 4 | 2 | 3 | 3 | 2 |
| Ecosystem Maturity | 2 | 4 | 5 | 4 | 5 | 1 |

Weighted totals:

| Candidate | Weighted Score | Result |
| --- | ---: | --- |
| LiteLLM | 221 | Selected |
| Custom AI Gateway | 212 | Rejected for initial implementation burden |
| OpenRouter | 182 | Rejected for broker dependency |
| LangChain | 169 | Rejected as gateway strategy |
| Native Provider SDKs | 99 | Rejected |

## 8. Trade-off Analysis

### LiteLLM

Advantages:

- Strong provider abstraction and OpenAI-compatible interface.
- Routing, retries, fallback, cost tracking, budgets, rate limits, and observability support.
- Supports many providers and future model additions.
- Can be treated as a central gateway boundary.
- Reduces provider lock-in while preserving model access.
- Aligns with platform-service strategy.

Disadvantages:

- Career Companion must still govern prompts, schemas, validation, execution records, safety checks, and capability validation.
- LiteLLM feature behavior must be verified for selected providers and models.
- Prompt management support should not be treated as the sole Career Companion Prompt Registry authority unless a future ADR explicitly decides that.

### Native Provider SDKs

Advantages:

- Best access to provider-native features.
- Strong structured output support in some providers.
- Direct vendor documentation and support.

Disadvantages:

- No unified gateway.
- Provider-specific business logic risk.
- Higher lock-in.
- Duplicated retry, fallback, telemetry, cost tracking, and prompt handling.
- Violates the principle that capabilities must not call providers directly.

### OpenRouter

Advantages:

- Strong unified routing and fallback across providers.
- Unified API and billing/analytics.
- Good model discovery and routing controls.

Disadvantages:

- Adds a broker dependency.
- Less control over enterprise gateway governance.
- Provider routing and data policies require careful review.
- Better as a possible provider behind the gateway than as the canonical gateway itself.

### LangChain

Advantages:

- Strong ecosystem for model integrations.
- Structured output patterns and retries.
- Useful application composition tools.

Disadvantages:

- Broader than a gateway.
- Can blur workflow, agent, capability, tool, and orchestration boundaries.
- Risk of moving business logic or orchestration into LangChain constructs.
- Better as a possible implementation helper behind capabilities than as the AI Execution Platform.

### Custom AI Gateway

Advantages:

- Maximum architectural control.
- Best fit if every gateway behavior must be bespoke.
- Could enforce Career Companion contracts exactly.

Disadvantages:

- High implementation and maintenance cost.
- Delays platform implementation.
- Requires building provider integrations, routing, fallback, cost tracking, observability, and model compatibility from scratch.
- Premature before real usage proves the need.

## 9. Selected Technology

LiteLLM is selected as the AI Execution Platform and Model Gateway technology.

LiteLLM will be used as the only provider-facing execution path for AI capabilities.

Career Companion will own:

- Prompt Registry authority.
- Prompt approval status.
- Prompt version policy.
- Capability input construction.
- Schema definitions.
- Structured output validation.
- Capability validation.
- AI Execution Record persistence.
- Artifact registration.
- Workflow integration.
- Evidence validation.
- Audit integration.

LiteLLM will provide:

- Provider abstraction.
- Model routing.
- Provider routing.
- Request execution.
- Retry support.
- Fallback support.
- Provider-normalized response surface.
- Token and cost accounting support.
- Gateway observability hooks.
- Model access governance support.

## 10. AI Execution Platform Architecture

AI execution flow:

```text
Capability
    ↓
AI Execution Platform
    ↓
Prompt Registry
    ↓
Model Router
    ↓
Model Gateway
    ↓
LLM Provider
    ↓
Structured Output Validator
    ↓
Capability
    ↓
Artifact
```

Architecture rules:

- Capabilities request AI execution through the AI Execution Platform only.
- The AI Execution Platform resolves prompt version and model route.
- The Model Gateway uses LiteLLM to execute provider-facing calls.
- Raw LLM responses must not enter workflow.
- Structured output validation occurs before capability validation.
- Capability validation occurs before artifact creation or registration.
- PostgreSQL remains authoritative for AI execution records and metadata.
- Search remains derived.
- Immutable artifact storage remains authoritative for artifact content.

## 11. Model Gateway Responsibilities

The Model Gateway owns:

- Provider abstraction.
- Model route execution.
- Provider route execution.
- Retry coordination within approved policy.
- Fallback coordination within approved policy.
- Timeout enforcement.
- Token accounting capture.
- Cost accounting capture.
- Provider response normalization.
- Gateway telemetry capture.
- Provider and model version reporting.

The Model Gateway does not own:

- Business logic.
- Workflow state.
- Capability orchestration.
- Prompt approval.
- Schema authority.
- Artifact authority.
- Evidence authority.
- Search authority.
- Memory authority.
- Human approval.

## 12. Prompt Registry Strategy

Prompt templates are governed assets.

The Prompt Registry must store:

- Prompt ID.
- Prompt name.
- Prompt purpose.
- Prompt version.
- Prompt status.
- Owning capability.
- Approved input schema reference.
- Expected output schema reference.
- Model compatibility metadata.
- Safety constraints.
- Review status.
- Created timestamp.
- Approved timestamp where applicable.

LiteLLM prompt management may support prompt delivery or integration, but Career Companion Prompt Registry remains the architectural authority unless a future ADR changes that.

Hardcoded prompts are prohibited.

## 13. Prompt Versioning Policy

Prompt versions are immutable after approval.

Rules:

- Every AI execution must reference an exact prompt version.
- Prompt changes require a new version.
- Deprecated prompts must remain available for audit of historical execution records.
- Prompt version must be included in every AI Execution Record.
- Prompt version must align with capability version and output schema version.
- Prompt versions may not be silently changed by provider routing.

## 14. Model Routing Strategy

Model routing is governed by policy.

Routing inputs:

- Capability ID.
- Workflow state.
- Prompt version.
- Required output schema.
- Sensitivity classification.
- Cost policy.
- Latency policy.
- Provider eligibility.
- Model eligibility.
- Fallback policy.

Routing outputs:

- Selected provider.
- Selected model.
- Model version where available.
- Fallback chain.
- Timeout policy.
- Retry policy.
- Cost accounting context.

Routing must be deterministic given the same policy, eligible providers, eligible models, and execution context.

## 15. Structured Output Contract

Every AI response must be schema validated.

Structured output contract:

- Each AI-capable capability defines an expected output schema.
- Prompt version references the expected schema version.
- Model route must support the required structured output strategy or approved fallback strategy.
- Raw model response is captured only as permitted by privacy and audit policy.
- Parsed output must be validated before capability consumption.
- Invalid output must trigger retry, fallback, or failure according to policy.

AI output is not authoritative until capability validation accepts it and a governed artifact or record is created.

## 16. Output Validation Strategy

Validation sequence:

```text
Provider Response
    ↓
Gateway Normalization
    ↓
Structured Output Validation
    ↓
Capability Validation
    ↓
Policy Validation
    ↓
Artifact Eligibility
```

Validation rules:

- Raw LLM responses cannot enter workflow.
- Schema-invalid responses cannot become artifacts.
- Capability-invalid responses cannot become artifacts.
- Policy-invalid responses cannot become artifacts.
- Validation failure must be recorded in the AI Execution Record.
- Human review may be required for low-confidence or sensitive outputs.

## 17. Retry & Fallback Strategy

Retry and fallback are governed policies.

Retry may occur for:

- Provider timeout.
- Rate limit.
- Transient provider failure.
- Schema validation failure where retry is allowed.
- Recoverable gateway error.

Fallback may occur for:

- Provider outage.
- Model unavailability.
- Rate limit exhaustion.
- Context window mismatch.
- Policy-approved cost or latency routing.

Retry and fallback must not:

- Change business logic.
- Change prompt version without policy.
- Bypass structured output validation.
- Bypass capability validation.
- Bypass safety policy.
- Hide the original provider failure.

Every retry and fallback must be counted and recorded.

## 18. Timeout Strategy

Timeouts are governed by runtime and model routing policy.

Rules:

- Every AI execution has a timeout policy.
- Timeout produces a failed AI Execution Record.
- Timeout may trigger retry or fallback if policy allows.
- Timeout must not silently continue execution.
- Timeout must not advance workflow.
- Timeout must be visible to capability and runtime.

## 19. AI Execution Record

Every AI execution must generate an immutable AI Execution Record.

Required fields:

- Execution ID.
- Capability ID.
- Workflow Instance ID.
- Provider.
- Model.
- Prompt Version.
- Context Version.
- Tokens In.
- Tokens Out.
- Cost.
- Latency.
- Retry Count.
- Validation Result.
- Timestamp.

Additional recommended fields:

- Fallback Count.
- Final Provider.
- Final Model.
- Output Schema Version.
- Capability Version.
- Policy Version.
- Timeout Policy.
- Safety Result.
- Error Class.
- Error Reason.
- Correlation ID.

AI Execution Records are metadata records. Sensitive prompt or response content must be stored only where privacy policy allows.

## 20. Token & Cost Governance

AI execution must be cost-governed.

Requirements:

- Track tokens in.
- Track tokens out.
- Track provider-reported or calculated cost.
- Track capability-level usage.
- Track workflow-instance-level usage.
- Track retry and fallback cost.
- Apply budget and rate-limit policy where configured.
- Surface cost anomalies.

Cost governance must not change business output silently. If a lower-cost model is selected, the model route must still satisfy capability, schema, safety, and quality requirements.

## 21. AI Observability Strategy

AI execution must be observable.

Observability fields:

- Execution ID.
- Correlation ID.
- Capability ID.
- Workflow Instance ID.
- Prompt Version.
- Provider.
- Model.
- Latency.
- Retry count.
- Fallback count.
- Token counts.
- Cost.
- Validation result.
- Error class.
- Timeout result.
- Safety result.

Observability supports debugging, cost governance, quality review, safety review, retry analysis, and provider comparison.

## 22. Security & Safety Principles

Security and safety rules:

- Capabilities must not access provider credentials.
- Provider credentials are managed by the Model Gateway boundary.
- Prompt inputs must follow privacy and data minimization rules.
- Sensitive data must not be sent to providers unless policy allows.
- Provider data-retention characteristics must be known before routing sensitive work.
- Outputs must be validated before use.
- Unsafe outputs must be rejected or routed to human review.
- Provider-specific safety controls may be used but do not replace Career Companion validation.
- AI execution must be auditable.

## 23. Provider Independence Rule

Provider independence is mandatory.

Rules:

- No direct provider SDK usage inside capabilities.
- No hardcoded provider-specific prompts inside capabilities.
- No provider-specific business logic inside capabilities.
- No workflow decisions based on provider-specific response shape.
- No raw provider response entering workflow.
- No provider-specific output accepted without normalized validation.

Providers remain replaceable behind LiteLLM and the Model Gateway.

## 24. Future Evolution

Future ADRs may define:

- Specific provider allowlist.
- Model portfolio.
- Prompt registry implementation.
- Prompt approval workflow.
- AI safety policy.
- AI observability sink.
- AI execution record schema.
- Model evaluation framework.
- Cost budget thresholds.
- Provider data-retention policy.

This ADR should be reviewed if:

- LiteLLM cannot support required provider controls.
- Structured output validation cannot be enforced consistently.
- Cost governance cannot be trusted.
- Provider independence is weakened.
- Prompt governance requires a different system of record.
- A custom gateway becomes justified by scale or compliance.

## 25. Alternatives Rejected

### Native Provider SDKs

Rejected because they create provider coupling, duplicate gateway concerns, and make routing, fallback, cost, and observability inconsistent.

### OpenRouter

Rejected as the canonical gateway because it introduces a broker dependency and less local governance control. It may be used later as a provider route behind LiteLLM if policy permits.

### LangChain

Rejected as the AI Execution Platform because it is broader than a gateway and can blur orchestration, agent, capability, and workflow boundaries.

### Custom AI Gateway

Rejected for initial implementation because it has high build and maintenance cost. It remains a future option if LiteLLM cannot satisfy governance, security, observability, or provider independence needs.

## 26. Validation Checklist

Future implementation must validate:

- Capabilities cannot call providers directly.
- All AI calls pass through the AI Execution Platform.
- Provider credentials are unavailable to capabilities.
- Prompt IDs and versions are required.
- Hardcoded prompts are rejected.
- Model route is policy-governed.
- AI response is schema validated.
- Capability validation occurs after schema validation.
- Raw LLM response cannot enter workflow.
- AI Execution Record is created for every execution.
- Tokens in and out are recorded.
- Cost is recorded.
- Latency is recorded.
- Retry count is recorded.
- Fallback count is recorded where applicable.
- Timeout behavior is recorded.
- Validation failures do not create artifacts.
- Search remains derived.
- PostgreSQL remains metadata authority.
- Immutable artifact storage remains artifact content authority.

## 27. Architecture Review Board Decision

Architecture Alignment: PASS

Governance Compliance: PASS

Operational Risk: ACCEPTABLE WITH CONTROLS

Migration Complexity: ACCEPTABLE

Decision: Accepted. LiteLLM is approved as Career Companion's AI Execution Platform and Model Gateway technology.

## References

- [ADR-001: Persistence Model & Repository Strategy](ADR-001-persistence-model-and-repository-strategy.md)
- [ADR-002: Runtime Execution Strategy](ADR-002-runtime-execution-strategy.md)
- [ADR-003: Workflow Coordination Strategy](ADR-003-workflow-coordination-strategy.md)
- [ADR-004: Information Storage Strategy](ADR-004-information-storage-strategy.md)
- [ADR-005: Platform Services Strategy](ADR-005-platform-services-strategy.md)
- [ADR-006: Technology Evaluation & Selection Principles](ADR-006-technology-evaluation-and-selection-principles.md)
- [ADR-007: Authoritative Transactional Store Technology](ADR-007-authoritative-transactional-store-technology.md)
- [ADR-008: Immutable Artifact Storage Technology](ADR-008-immutable-artifact-storage-technology.md)
- [ADR-009: Derived Search & Retrieval Platform](ADR-009-derived-search-and-retrieval-platform.md)
- [Architecture Principles](../architecture-principles.md)
- [Capability Architecture](../capability-architecture.md)
- [Runtime Architecture](../runtime-architecture.md)
- [LiteLLM Documentation](https://docs.litellm.ai/)
- [LiteLLM Features](https://www.litellm.ai/features)
- [LiteLLM API Reference](https://www.litellm.org/)
- [OpenRouter API Reference](https://openrouter.ai/docs/api/reference/overview)
- [OpenRouter Provider Routing](https://openrouter.ai/docs/guides/routing/provider-selection)
- [LangChain Structured Output](https://docs.langchain.com/oss/python/langchain/structured-output)
- [OpenAI Function Calling and Structured Outputs](https://help.openai.com/en/articles/8555517)
- [Anthropic Structured Outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
- [Gemini Structured Outputs](https://ai.google.dev/gemini-api/docs/structured-output)
