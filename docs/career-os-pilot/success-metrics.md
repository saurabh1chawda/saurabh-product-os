# Career OS Pilot Success Metrics

## Metric Rules

The Career OS pilot uses directional interpretation because the initial sample is 10-20 submitted applications. Every rate must display its sample size. Discovered or saved roles are excluded from submitted-application denominators.

## 1. Operational Reliability

| Metric | Definition | Calculation | Data Source | Target | Interpretation Notes | Exclusions |
| --- | --- | --- | --- | --- | --- | --- |
| Validation pass rate | Percentage of required validation runs that pass. | Passed validation runs / total validation runs. | Validation command outputs. | 100%. | Any failed validation requires triage. | Exploratory commands outside the pilot workflow. |
| Number of P0 defects | Count of P0 defects found during the pilot. | Count of defects with severity P0. | Defect log. | 0. | Any P0 triggers STOP until resolved. | Duplicate reports of the same defect. |
| Number of P1 defects | Count of P1 defects found during the pilot. | Count of defects with severity P1. | Defect log. | 0 unresolved. | P1 defects trigger REVISE. | Duplicate reports of the same defect. |
| Corrupted-record count | Number of application, task, contact, event, JD, or resume records that become unreadable or materially inconsistent. | Count of corrupted records. | Registry validation, manual review. | 0. | Any corrupted record is at least P0 or P1 depending on impact. | Recoverable display-only issues. |
| Failed command count | Number of required workflow commands that fail. | Count failed required commands. | Terminal output and validation notes. | 0 recurring. | One-off operator error may be P2; recurring failure may be P1. | Commands not part of the pilot workflow. |
| Command-retry count | Number of times a required command must be rerun. | Count command retries. | Pilot observation notes. | Declining over time. | Repeated retries suggest workflow friction. | Intentional dry-run commands. |

## 2. Data Quality

| Metric | Definition | Calculation | Data Source | Target | Interpretation Notes | Exclusions |
| --- | --- | --- | --- | --- | --- | --- |
| Application traceability coverage | Submitted applications with JD Snapshot, Resume Snapshot, and application record. | Fully traceable submitted applications / submitted applications. | Application Registry. | 100%. | Missing traceability blocks reliable analysis. | Discovered or saved roles. |
| JD-link coverage | Submitted applications with a JD Snapshot reference. | Applications with JD Snapshot / submitted applications. | Application Registry. | 100%. | Live URL alone is insufficient. | Discovered or saved roles. |
| Resume-link coverage | Submitted applications with a Resume Snapshot reference. | Applications with Resume Snapshot / submitted applications. | Application Registry. | 100%. | Needed for resume-performance analysis. | Discovered or saved roles. |
| Event consistency | Applications whose lifecycle events match current stage and status. | Consistent applications / submitted applications. | Registry validation. | 100%. | Inconsistency may distort metrics. | Non-submitted opportunities. |
| Applications with explicit next action or valid waiting state | Active applications with either a next action or a valid waiting state. | Covered active applications / active applications. | Application Registry, Operations Console. | 100%. | Prevents operational dead ends. | Closed applications. |
| Received-outcome update completeness | Employer outcomes recorded after they are received. | Recorded received outcomes / received outcomes. | Application Registry, manual review. | 100%. | Outcomes must be explicit. | Inferred outcomes. |
| Duplicate-record rate | Duplicate submitted application records. | Duplicate records / submitted applications. | Registry validation, manual review. | 0%. | Duplicates inflate funnel metrics. | Legitimate separate roles at same company. |
| Missing-required-field rate | Required fields missing from submitted application records. | Missing required fields / required fields. | Registry validation. | 0%. | Missing fields reduce trust. | Optional fields. |

## 3. Privacy and Security

| Metric | Definition | Calculation | Data Source | Target | Interpretation Notes | Exclusions |
| --- | --- | --- | --- | --- | --- | --- |
| Privacy validation pass rate | Percentage of privacy validation runs that pass. | Passed privacy validations / total privacy validations. | Privacy validation output. | 100%. | Failure requires immediate review. | Non-pilot exploratory files outside scope. |
| Private records committed | Number of private application records committed to Git. | Count committed private records. | Git status, Git history review. | 0. | Any occurrence is P0. | Sanitized synthetic fixtures. |
| Private files ignored by Git | Private files covered by ignore or local-only policy. | Covered private files / private files. | Git status, privacy review. | 100%. | Ensures local-first privacy. | Public-safe synthetic files. |
| Accidental sensitive-data exposure incidents | Any exposure of recruiter, compensation, notes, interview details, or private application information. | Count incidents. | Privacy review. | 0. | Any incident is P0 until contained. | Anonymized aggregate insights. |

## 4. Workflow Efficiency

| Metric | Definition | Calculation | Data Source | Target | Interpretation Notes | Exclusions |
| --- | --- | --- | --- | --- | --- | --- |
| JD preparation time | Time to capture and prepare a JD Snapshot. | Minutes from source capture to stable local snapshot. | Pilot observation notes. | Track baseline. | High time may indicate capture friction. | Role discovery time. |
| Resume-generation time | Time to generate resume plan and draft. | Minutes from JD Intelligence output to draft. | Pilot observation notes. | Track baseline. | Should improve with reuse. | Human review time. |
| Human-review time | Time spent reviewing the resume before export. | Minutes of manual review. | Manual override log, observation notes. | Track baseline. | Must not be optimized below factual quality. | Waiting time. |
| Registry-administration time | Time to create and link application records after artifacts exist. | Minutes spent on registry creation, linking, status, tags, and next action. | Pilot observation notes. | Median below 10 minutes. | Primary administration-efficiency target. | Resume writing and application submission. |
| Artifact-linking time | Time to link JD, resume, export, and Product OS references. | Minutes linking artifacts. | Pilot observation notes. | Track baseline. | High time indicates traceability friction. | Artifact generation time. |
| Stage-update time | Time to record an explicit lifecycle change. | Minutes per update. | Pilot observation notes. | Track baseline. | Should be low and reliable. | Employer response waiting time. |
| Total application-processing time | Time from qualified opportunity to submitted application record. | Sum of workflow steps. | Pilot observation notes. | Track baseline. | Use for roadmap prioritization. | Outcome observation period. |

## 5. Operator Adoption

| Metric | Definition | Calculation | Data Source | Target | Interpretation Notes | Exclusions |
| --- | --- | --- | --- | --- | --- | --- |
| Percentage of active applications managed exclusively in Career OS | Active applications tracked without external spreadsheet dependency. | Career OS-only active applications / active applications. | Operator review. | 100%. | Primary adoption signal. | Applications intentionally excluded from pilot. |
| Number of times an external spreadsheet was used | Count external spreadsheet uses for pilot tracking. | Count uses. | Operator notes. | 0. | Any use indicates a missing workflow or trust gap. | Historical spreadsheets not used for pilot tracking. |
| Daily console usage on active search days | Whether Operations Console is used on search days. | Console-use days / active search days. | Operator notes. | 100%. | Adoption signal, not instrumentation proof. | Non-search days. |
| Percentage of dashboard actions considered useful | Actions judged useful by operator. | Useful actions / dashboard actions reviewed. | Pilot observation notes. | 80% or higher. | Low usefulness suggests warning/action tuning. | Duplicate actions. |
| Percentage of applications correctly surfaced in Today's Actions | Applications needing action and shown in Today's Actions. | Correctly surfaced applications / applications needing action. | Console review. | 100%. | Misses are operationally important. | Closed applications. |

## 6. Funnel Observation

| Metric | Definition | Calculation | Data Source | Target | Interpretation Notes | Exclusions |
| --- | --- | --- | --- | --- | --- | --- |
| Response Rate | Applications receiving an explicit employer response divided by submitted applications eligible for observation. | Explicit employer responses / eligible submitted applications. | Application Registry. | Directional. | Display sample size; do not infer from silence. | Immature applications. |
| Recruiter Screen Rate | Applications reaching recruiter screen divided by submitted applications eligible for observation. | Recruiter screens / eligible submitted applications. | Application Registry. | Directional. | Display sample size. | Immature applications. |
| Interview Rate | Applications reaching at least one substantive interview divided by submitted applications eligible for observation. | Substantive interviews / eligible submitted applications. | Application Registry. | Directional. | Display sample size. | Immature applications. |
| Hiring Manager Conversion | Applications reaching hiring manager interview divided by applications reaching recruiter screen. | Hiring manager interviews / recruiter screens. | Application Registry. | Directional. | Shows mid-funnel quality when sample is sufficient. | Applications without recruiter screen. |
| Offer Rate | Offers divided by submitted applications with mature outcomes. | Offers / submitted applications with mature outcomes. | Application Registry. | Directional. | Mature outcomes only. | Immature applications. |
| Average time to first response | Mean days from submission to explicit employer response. | Sum response days / applications with response. | Application Registry. | Directional. | Interpret with source/channel context. | Applications without response. |
| Average stage duration | Mean time spent in a stage. | Sum stage days / stage transitions. | Application events. | Directional. | Useful for process learning. | Stages without entry/exit data. |
| Application age | Days since submission for open applications. | Current date - submission date. | Application Registry. | Track. | Used for stale review. | Closed applications. |
| Mature outcome count | Count of submitted applications with terminal outcomes or sufficient observation maturity. | Count mature applications. | Application Registry. | Track. | Required for reliable funnel interpretation. | Immature applications. |
| Immature application count | Count of submitted applications still too new for outcome interpretation. | Count immature applications. | Application Registry. | Track. | Prevents premature conclusions. | Mature outcomes. |

## 7. Resume and Positioning Signals

| Metric | Definition | Calculation | Data Source | Target | Interpretation Notes | Exclusions |
| --- | --- | --- | --- | --- | --- | --- |
| Applications per resume variant | Submitted applications using each Resume Variant. | Count by Resume Variant. | Application Registry. | Display sample size. | Required next to every rate. | Applications without Resume Snapshot. |
| Responses per resume variant | Explicit employer responses by Resume Variant. | Count responses by Resume Variant. | Application Registry. | Directional. | Control for source/channel context. | Immature applications. |
| Interviews per resume variant | Substantive interviews by Resume Variant. | Count interviews by Resume Variant. | Application Registry. | Directional. | Small samples are not conclusive. | Immature applications. |
| Offers per resume variant | Offers by Resume Variant. | Count offers by Resume Variant. | Application Registry. | Directional. | Mature outcomes only. | Immature applications. |
| Manual override count | Number of manual overrides applied. | Count override records. | Manual override log. | Track. | High counts may reveal reusable component gaps. | Non-substantive formatting fixes. |
| Override category frequency | Frequency of override taxonomy categories. | Count overrides by category. | Manual override log. | Track. | Helps prioritize component-library improvements. | Duplicate entries. |
| Average override time | Mean time spent applying overrides. | Total override minutes / override count. | Manual override log. | Track. | High time suggests assembly or narrative gap. | Waiting time. |
| Archetype performance | Funnel metrics grouped by Role Archetype. | Funnel metric by Role Archetype with sample size. | Application Intelligence. | Directional. | Display sample size. | Roles without archetype. |
| Role-pack performance | Funnel metrics grouped by Role Pack. | Funnel metric by Role Pack with sample size. | Application Intelligence. | Directional. | Role Pack may combine multiple competencies. | Roles without Role Pack. |

Results from 10-20 applications are directional, not conclusive.

## 8. Product-Learning Metrics

| Metric | Definition | Calculation | Data Source | Target | Interpretation Notes | Exclusions |
| --- | --- | --- | --- | --- | --- | --- |
| Friction incidents per application | Count of workflow friction incidents per submitted application. | Friction incidents / submitted applications. | Pilot observation notes. | Declining over time. | Primary workflow-learning signal. | Defects already counted separately. |
| Repeated-friction count | Count of friction patterns repeated across applications. | Count repeated patterns. | Weekly review. | Track. | Repetition drives roadmap priority. | One-off operator errors. |
| Unused field count | Fields consistently unused during pilot operation. | Count unused fields. | Operator review. | Track. | May indicate schema/UI simplification opportunities. | Optional fields intentionally reserved. |
| Ignored console section count | Console sections not used during active search days. | Count ignored sections. | Operator notes. | Track. | May indicate low-value display. | Placeholder modules. |
| Missing-information requests | Times the operator needs information not visible or not captured. | Count requests. | Pilot observation notes. | Track. | Drives roadmap. | Information intentionally private or out of scope. |
| Manual workaround count | Times the operator leaves the normal workflow to complete a task. | Count workarounds. | Pilot observation notes. | 0 recurring. | Recurring workaround may become P1 or P2. | Approved manual submission. |
| Feature requests grounded in observed usage | Feature requests tied to real pilot evidence. | Count evidence-backed requests. | Weekly review. | Track. | Only evidence-backed requests enter roadmap review. | Speculative ideas. |
| Workflow confidence score | Operator confidence in Career OS managing active applications. | 1-5 rating. | Weekly review. | 4 or higher. | Subjective but useful. | Non-pilot usage. |
| Overall workflow rating from 1-5 | End-to-end operator rating. | 1-5 rating. | Final pilot review. | 4 or higher. | Final usability signal. | Individual feature ratings. |

## Pilot Scorecard

| Metric | Target | Warning Threshold | Failure Threshold | Review Frequency | Owner |
| --- | --- | --- | --- | --- | --- |
| Validation pass rate | 100% | Below 100% once | Recurring failure or unresolved validation failure | Weekly and before software change | Saurabh Chawda |
| P0 defects | 0 | Any suspected P0 | Any confirmed unresolved P0 | Immediate | Saurabh Chawda |
| P1 defects | 0 unresolved | 1 unresolved P1 | Multiple unresolved P1s | Weekly | Saurabh Chawda |
| Application traceability coverage | 100% | Below 100% for one active application | Below 100% at weekly review | Per application and weekly | Saurabh Chawda |
| Privacy validation pass rate | 100% | Any warning | Any failure | Weekly and before commit | Saurabh Chawda |
| Private records committed | 0 | Any suspected private tracked file | Any private record committed | Before commit | Saurabh Chawda |
| Median registry-administration time | Below 10 minutes | 10-15 minutes | Above 15 minutes across repeated applications | Weekly | Saurabh Chawda |
| External spreadsheet use | 0 | 1 use | Repeated use | Weekly | Saurabh Chawda |
| Today's Actions correctness | 100% | One missed action | Repeated missed actions | Daily active search days | Saurabh Chawda |
| Workflow confidence score | 4 or higher | 3 | 1-2 | Weekly | Saurabh Chawda |

