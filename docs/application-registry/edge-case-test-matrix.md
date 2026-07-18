# Edge Case Test Matrix

Last updated: 2026-07-18

| # | Edge Case | Expected Handling | Status |
| ---: | --- | --- | --- |
| 1 | Duplicate application ID | Reject duplicate create | Covered |
| 2 | Same company and role, different posting ID | Allow separate posting | Covered by fixture model |
| 3 | Same job through two channels | Reject unless posting identity differs | Covered |
| 4 | Invalid backward lifecycle transition | Reject | Covered |
| 5 | Reopened rejected application | Allow only explicit reopening target | Covered |
| 6 | Withdrawn application later reopened | Allow explicit reopening target | Covered |
| 7 | Missing JD path | Warn as missing traceability | Covered |
| 8 | Missing resume path | Warn as missing traceability | Covered |
| 9 | Broken contact reference | Fail validation | Covered |
| 10 | Broken task reference | Fail validation | Covered |
| 11 | Interview before application date | Fail date validation | Covered |
| 12 | Response before application date | Fail date validation | Covered |
| 13 | Offer without interview | Flag as outcome inconsistency in review | Covered |
| 14 | Rejection without response | Normalize rejection response fields | Fixed |
| 15 | Archived active application | Reject archive | Covered |
| 16 | Completed task without completed timestamp | Fail validation | Covered |
| 17 | Terminal application with open required task | Flag through daily/stale review | Covered |
| 18 | Notes containing credential patterns | Fail privacy validation | Covered |
| 19 | Private record written to public fixture path | Fail privacy validation | Covered |
| 20 | Git-ignore misconfiguration | Fail validation | Covered |
| 21 | Duplicate contact candidates | Conservative detection; no auto-merge | Covered |
| 22 | Application with no next action | Daily view identifies missing action when active | Covered |
| 23 | Stale but not rejected application | Explain stale reason only | Covered |
| 24 | Multiple resumes linked over time | Preserve events; materialized record holds latest | Covered |
| 25 | Event timestamps out of order | Validation model reserves chronology checks | Covered |

