# Assembly Input Model

## ResumeAssemblyInput

| Field | Type | Required | Default | Source | Immutable | User Editable | Human Confirmation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| assembly_id | string | Yes | Generated | Engine | Yes | No | No |
| created_at | date-time | Yes | Current timestamp | Engine | Yes | No | No |
| candidate_profile | object | Yes | Canonical profile | Resume OS data | Yes | No | Yes for private fields |
| jd_intelligence_output | object | Yes | None | JD Intelligence | Yes | No | Yes |
| target_company | string | Yes | JD company | JD Intelligence | No | Yes | Yes |
| target_role | string | Yes | JD role | JD Intelligence | No | Yes | Yes |
| target_level | string | Optional | Inferred/stated level | JD Intelligence | No | Yes | Yes |
| target_location | string/null | Optional | JD location | JD Intelligence | No | Yes | Yes |
| primary_archetype | string | Yes | JD primary archetype | JD Intelligence | No | No | Yes |
| secondary_archetypes | array | Optional | JD secondary archetypes | JD Intelligence | No | No | Yes |
| selected_resume_template | string | Yes | ats-two-page | Resume OS | No | Yes | No |
| page_limit | number | Yes | 2 | Resume OS | No | Yes | Yes if changed |
| section_preferences | object | Optional | Standard sections | User/engine | No | Yes | Yes |
| project_preference | enum | Optional | auto | User/engine | No | Yes | Yes |
| product_os_preference | enum | Optional | auto | User/engine | No | Yes | Yes |
| relocation_statement | string/null | Optional | null | User only | No | Yes | Yes |
| work_authorization_statement | string/null | Optional | null | User only | No | Yes | Yes |
| output_format_preferences | array | Optional | json, markdown | User/engine | No | Yes | No |
| user_overrides | object | Optional | empty | User | No | Yes | Yes |
| prohibited_claims | array | Optional | empty | User/QA | No | Yes | Yes |
| required_human_review_items | array | Yes | gaps and warnings | Engine | No | No | Yes |

## Rules

- Work authorization and relocation must never be inferred.
- User overrides cannot alter canonical facts.
- Prohibited claims block generation if selected content depends on them.
- Human-review items must carry forward into the output.

