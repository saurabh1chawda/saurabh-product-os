# eBay Live Resume Pilot Report

## 1. Executive Summary

The first live Resume OS pilot is blocked at input discovery. The manually tailored eBay benchmark resume is available locally and ignored by Git, but the real eBay job description was not found. Per the sprint rules, JD Intelligence and Resume Assembly were not run and no application-ready draft was generated.

Readiness decision: NOT READY - RETURN TO INPUT DISCOVERY.

## 2. Pilot Scope

The intended scope was to compare a Resume OS generated draft against the existing eBay manually tailored resume. The completed scope is limited to sanitized input discovery, benchmark structure review, blocker documentation, preliminary project strategy, and pilot scaffolding.

## 3. Inputs Used

- Benchmark resume text extract: `docs/resume-os/reference-resumes/ebay-spm-monetization-loyalty-reference.docx.txt`
- Benchmark resume PDF: `docs/resume-os/reference-resumes/ebay-spm-monetization-loyalty-reference.docx.pdf`
- Project metadata: `docs/resume-os/data/projects.yaml`
- Evidence indexes: `docs/resume-os/evidence/`

## 4. Role Analysis

Blocked. The role cannot be analyzed without the real JD.

## 5. Application Strategy

Preliminary only. The likely positioning is monetization, growth, loyalty, and platform strategy, but this must be confirmed by the actual JD.

## 6. Generated Resume Plan

Not generated.

## 7. Generated Draft Assessment

Not generated.

## 8. Benchmark Resume Assessment

The benchmark is strong, evidence-dense, and tailored toward monetization, loyalty, marketplace, and platform strategy. Its largest risks are second-page density, simulation labeling, and unclear JD alignment because the JD is missing.

## 9. Claim Integrity Comparison

Generated draft: not available.

Benchmark: employer metrics largely map to canonical evidence. LoyaltyIQ claims are simulation-supported and must not be presented as production experience.

## 10. Structural Comparison

Generated draft unavailable. Benchmark structure is broadly ATS-friendly but project formatting and density should be revised before final export.

## 11. Bullet Comparison

Blocked because no generated draft exists.

## 12. Headline and Summary Comparison

The benchmark headline and summary are strong candidate baselines if the JD confirms monetization and loyalty expectations.

## 13. Project Strategy

Decision: include project only after revision and only if JD confirms relevance. LoyaltyIQ must be labeled as a product simulation or portfolio project.

## 14. ATS Evaluation

Benchmark ATS score: 83. Generated score: N/A.

## 15. Recruiter Evaluation

Benchmark recruiter score: 84. Generated score: N/A.

## 16. Hiring Manager Evaluation

Benchmark hiring-manager score: 84. Generated score: N/A.

## 17. Human-Written Quality

Benchmark human-written quality score: 86. Generated score: N/A.

## 18. Manual Overrides

One P0 override is required: add the real eBay JD before generation.

## 19. Time and Effort

Input discovery and benchmark review were completed. Tailoring speed could not be measured because the live pipeline did not run.

## 20. Defects Found

P0: Real eBay JD missing.

## 21. Defects Fixed

None. No engine defect was confirmed because the pipeline did not reach JD Intelligence.

## 22. Remaining Risks

- Missing source JD.
- Potential overuse of LoyaltyIQ if JD does not require loyalty or marketplace proof.
- Simulation overclaim risk.
- Benchmark resume may contain private contact details and must remain ignored.

## 23. Regression Results

Regression commands must pass before commit. No live engine calibration was made.

## 24. Scorecard

Overall readiness: 0 because a P0 input blocker remains.

## 25. Readiness Decision

NOT READY - RETURN TO INPUT DISCOVERY.

## 26. Recommendation For DOCX/PDF Export

Do not proceed to DOCX/PDF export. Add the real JD and rerun the live pilot first.

