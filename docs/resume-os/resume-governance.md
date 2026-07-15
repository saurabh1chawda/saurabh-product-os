# Resume Governance

## Executive Summary

Resume OS governance protects credibility.

Tailoring is allowed. Fabrication is not. Every generated resume is a draft until it passes human review and evidence verification.

## Non-Negotiable Rules

1. Never fabricate claims.
2. Never alter employment dates.
3. Never inflate titles.
4. Never change metrics without evidence.
5. Never claim simulated results as real production results.
6. Never claim a prototype is deployed unless it is.
7. Never expose confidential information.
8. Every bullet must map to canonical evidence.
9. Every generated resume must pass interview-defensibility review.
10. All URLs must be verified before submission.
11. Every resume must be versioned.
12. Final human review is mandatory.
13. Resume generator output is always a draft.
14. The candidate owns the final truthfulness decision.

## Approval Statuses

| Status | Meaning | Allowed Use |
| --- | --- | --- |
| Draft | Generated or manually assembled but not reviewed | Internal only |
| Evidence Verified | Facts, metrics, titles, dates, and claims checked | Ready for ATS/recruiter review |
| ATS Reviewed | Structure, parsing, keywords, and formatting checked | Ready for human scan |
| Recruiter Reviewed | 10 to 15 second relevance scan passed | Candidate review |
| Final | Candidate approved for submission | Can be exported |
| Submitted | Used in an application | Track outcome |
| Archived | No longer active | Reference only |

## Version Naming

DOCX:

```text
Saurabh-Chawda_<Company>_<Role>_<YYYY-MM-DD>_vX.docx
```

PDF:

```text
Saurabh-Chawda_<Company>_<Role>_<YYYY-MM-DD>_vX.pdf
```

Rules:

- Use company name as submitted.
- Use role title or short role slug.
- Increment version when content changes.
- Do not overwrite submitted versions.

## Evidence Governance

| Evidence Type | Required Review |
| --- | --- |
| Employment dates | Canonical career history |
| Title | Canonical career history |
| Metrics | Product OS, approved resume source, or verified private evidence |
| Product OS link | Live URL check |
| GitHub artifact | Live URL and repository status check |
| Company-specific project | Disclaimer and status review |
| Technical claim | Interview defensibility review |
| Leadership claim | Scope and authority review |

## Confidentiality Rules

Do not include:

- Client-confidential details
- Internal-only documents
- Non-public architecture details
- Sensitive financial data
- Employer private roadmap information
- Private customer names unless public and approved
- Exact internal tooling names when not public

## Simulated Project Rules

Company-specific projects are allowed when clearly labeled as:

- Simulation
- Case study
- Prototype
- Open-source proof-of-work
- Product teardown

They must not imply:

- Employment at the target company
- Access to internal data
- Production deployment
- Real customer results
- Company endorsement

## Generated Content Rules

Resume OS may generate drafts, but:

- Drafts must be reviewed by Saurabh.
- Generated claims must map to canonical evidence.
- Generated wording must be checked for overstatement.
- AI-written phrasing should be made specific and human.
- The final resume is owned by the candidate, not the generator.

## Submission Checklist

Before submission:

- Facts verified
- Metrics verified
- Two-page limit met
- ATS-safe layout confirmed
- Links verified
- PDF rendering checked
- File name correct
- Company and role correct
- No unsupported claims
- No confidential content
- ResumeVersion created
- ApplicationOutcome placeholder created

## Change Control

| Change Type | Required Action |
| --- | --- |
| New metric | Evidence review before use |
| New bullet variant | Map to Achievement record |
| New role archetype | Add taxonomy and selection rules |
| New Product OS link | Verify canonical URL |
| New project module | Add disclaimer rules |
| Submitted resume update | Create new version |

## Governance Principle

The best resume is not the most aggressive resume. It is the most relevant resume that can be defended in an interview.
