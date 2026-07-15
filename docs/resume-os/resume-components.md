# Resume Components

## Executive Summary

Resume OS uses reusable components instead of rewriting resumes from scratch.

Each component has a purpose, inputs, customization rules, ATS constraints, and evidence requirements. Components can be immutable, stable, role-specific, company-specific, or application-specific.

## Component Classification

| Classification | Meaning | Examples |
| --- | --- | --- |
| Immutable | Must not change per application | Name, company names, dates, education |
| Stable | Rarely changes, but can be reformatted | Contact links, credentials, awards |
| Role-specific | Changes based on target role archetype | Headline, summary emphasis, skills order |
| Company-specific | Changes based on company context | Marketplace framing, target project language |
| Application-specific | Unique to one application | Company-specific project or proof-of-work module |

## 1. Identity Header

| Attribute | Rule |
| --- | --- |
| Purpose | Identify the candidate and make contact/evidence links easy to find |
| Required inputs | Name, email, phone, location |
| Optional inputs | Relocation or work authorization statement |
| Maximum length | One header block |
| Selection logic | Always included |
| Customization degree | Immutable |
| ATS constraints | Use text, not images or icons-only labels |
| Human readability | Must scan in under two seconds |
| Evidence requirements | Must match canonical profile |
| What changes | Formatting only |
| What remains canonical | Name, contact details, location truth |

## 2. Target Headline

| Attribute | Rule |
| --- | --- |
| Purpose | Position the resume for the target role |
| Required inputs | Target archetype, seniority, domain |
| Optional inputs | Company context, strongest differentiator |
| Maximum length | One line |
| Selection logic | Choose based on primary archetype |
| Customization degree | Role-specific |
| ATS constraints | Include clear role terms without stuffing |
| Human readability | Should answer "what role is this person targeting?" |
| Evidence requirements | Must be supported by career history |
| What changes | AI, platform, growth, monetization, payments, or SaaS framing |
| What remains canonical | Actual level and credible domain scope |

Reference pattern: the eBay resume uses a monetization and loyalty-oriented headline.

## 3. Contact and Evidence Links

| Attribute | Rule |
| --- | --- |
| Purpose | Route readers to proof |
| Required inputs | Email, phone, LinkedIn |
| Optional inputs | GitHub, Product OS |
| Maximum length | One line in header |
| Selection logic | Include Product OS and GitHub by default unless the resume must be ultra-minimal |
| Customization degree | Stable |
| ATS constraints | Use full readable labels |
| Human readability | Avoid excessive links |
| Evidence requirements | URLs verified before submission |
| What changes | Link labels or inclusion |
| What remains canonical | Canonical URLs |

## 4. Professional Summary

| Attribute | Rule |
| --- | --- |
| Purpose | Explain role fit in 3 to 5 concise lines |
| Required inputs | Archetype, seniority, domains, strongest metrics |
| Optional inputs | Product OS sentence |
| Maximum length | 70 to 90 words |
| Selection logic | Use primary archetype plus strongest supporting domain |
| Customization degree | Role-specific |
| ATS constraints | Natural keyword coverage |
| Human readability | Must avoid generic adjectives |
| Evidence requirements | Every claim must map to evidence |
| What changes | Emphasis and ordering |
| What remains canonical | Titles, scope, metrics, domains actually worked in |

## 5. Experience Role Block

| Attribute | Rule |
| --- | --- |
| Purpose | Present stable role context |
| Required inputs | Company, title, dates, location |
| Optional inputs | one-line scope statement |
| Maximum length | One role header plus 2 to 5 bullets |
| Selection logic | Always include relevant recent roles |
| Customization degree | Stable |
| ATS constraints | Standard company/title/date layout |
| Human readability | Clear chronology |
| Evidence requirements | Canonical career history |
| What changes | Scope line emphasis |
| What remains canonical | Company, title, dates |

## 6. Experience Bullet

| Attribute | Rule |
| --- | --- |
| Purpose | Show evidence of decisions, actions, scope, and outcomes |
| Required inputs | Achievement ID, approved wording, competency tags |
| Optional inputs | role-specific variant, keyword tags |
| Maximum length | 20 to 32 words preferred |
| Selection logic | Rank by role relevance, metric strength, and seniority signal |
| Customization degree | Role-specific |
| ATS constraints | Clear verbs and role keywords |
| Human readability | One idea per bullet |
| Evidence requirements | Must map to canonical achievement |
| What changes | Framing and emphasis |
| What remains canonical | Claim, metric, scope, outcome |

## 7. Company-Specific Project

| Attribute | Rule |
| --- | --- |
| Purpose | Demonstrate role-specific thinking for a target company |
| Required inputs | Project name, type, problem, scope, disclaimer |
| Optional inputs | live link, GitHub link, artifact screenshots |
| Maximum length | 3 to 5 bullets |
| Selection logic | Include when the project materially improves fit |
| Customization degree | Company-specific or application-specific |
| ATS constraints | Label clearly as project, prototype, simulation, or open-source |
| Human readability | Must not look like employment history |
| Evidence requirements | Must not claim real company results unless real |
| What changes | Target company context |
| What remains canonical | Project type and production status |

Reference pattern: the eBay resume uses LoyaltyIQ as company-aligned proof-of-work, not as employment history.

## 8. Flagship Product / Product OS Reference

| Attribute | Rule |
| --- | --- |
| Purpose | Add public proof when it strengthens differentiation |
| Required inputs | Product OS URL or relevant GitHub URL |
| Optional inputs | one-line explanation |
| Maximum length | 1 compact block |
| Selection logic | Use when public evidence is highly relevant |
| Customization degree | Role-specific |
| ATS constraints | Avoid long link lists |
| Human readability | Should make proof easier, not heavier |
| Evidence requirements | Link must be verified |
| What changes | Selected asset |
| What remains canonical | URL and artifact status |

## 9. Skills

| Attribute | Rule |
| --- | --- |
| Purpose | Support ATS and recruiter scan |
| Required inputs | canonical skill inventory |
| Optional inputs | target-role keyword ordering |
| Maximum length | 4 to 6 compact lines |
| Selection logic | Prioritize primary archetype skills |
| Customization degree | Role-specific |
| ATS constraints | Use parseable text and standard labels |
| Human readability | Group related skills |
| Evidence requirements | Skill must be explainable |
| What changes | Ordering and selected terms |
| What remains canonical | Actual skill truth |

## 10. Tools

| Attribute | Rule |
| --- | --- |
| Purpose | Show execution fluency |
| Required inputs | verified tool familiarity |
| Optional inputs | role-specific tools |
| Maximum length | 1 to 2 lines |
| Selection logic | Include only relevant tools |
| Customization degree | Role-specific |
| ATS constraints | Standard tool names |
| Human readability | Avoid tool dumping |
| Evidence requirements | Must be explainable |
| What changes | Selection and ordering |
| What remains canonical | Actual experience |

## 11. Certifications

Classification: Stable.

Rules:

- Include verified certifications only.
- Do not rename issuing bodies.
- Do not include expired credentials unless useful and labeled.

## 12. Awards

Classification: Stable.

Rules:

- Include verified awards only.
- Keep wording consistent with canonical evidence.
- Avoid overexplaining unless relevant to the role.

## 13. Publications

Classification: Stable or role-specific.

Rules:

- Include only public or approved publications.
- Prefer role-relevant publications.
- Use canonical titles and links.

## 14. Education

Classification: Immutable.

Rules:

- Institution, degree, and dates must not change.
- Formatting can change for space.
- Do not add coursework unless it is verified and relevant.

## 15. Optional Relocation or Work-Authorization Statement

Classification: Application-specific.

Rules:

- Include only when relevant.
- Must never be inferred.
- Use short, factual language.

## eBay Reference Model

| Type | eBay Resume Illustration |
| --- | --- |
| Immutable | Name, companies, dates, education, core verified metrics |
| Role-specific | Monetization headline, loyalty and rewards skills, selected growth bullets |
| Company-specific | LoyaltyIQ project, eBay-aligned terminology, marketplace loyalty context |
| Stable | Career history, awards, credentials |

The eBay resume should be treated as a structural model, not a source to rewrite.
