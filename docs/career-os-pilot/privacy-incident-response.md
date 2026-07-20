# Career OS Pilot Privacy Incident Response

## Purpose

This document defines how to respond if private Career OS pilot data is accidentally committed, pushed, shared, or exposed.

## Incident Principles

- Contain first.
- Preserve enough evidence to understand impact.
- Do not spread sensitive values while investigating.
- Remove exposed data from active surfaces.
- Rotate credentials when needed.
- Document lessons learned.

## Accidental Commit of Recruiter Information

1. Stop work immediately.
2. Do not push.
3. Identify files and commits containing recruiter information.
4. Remove the information from the working tree.
5. If the commit has not been pushed, rewrite local history or create a corrective commit according to severity and owner approval.
6. Add or improve ignore rules if needed.
7. Run privacy validation.
8. Document the incident and prevention action.

## Accidental Commit of Resumes

1. Stop work immediately.
2. Do not push.
3. Identify whether DOCX, PDF, Markdown, JSON, or exported resume artifacts were committed.
4. Remove the files from the commit or rewrite local history before pushing.
5. Move real resume files to ignored private storage.
6. Confirm `.gitignore` covers the relevant file pattern or path.
7. Run privacy validation and `git status --short`.
8. Record lessons learned.

## Accidental Commit of Interview Notes

1. Stop work immediately.
2. Do not push.
3. Identify whether interview notes include confidential employer information.
4. Remove the notes from Git history before pushing when possible.
5. Move any necessary private notes to ignored private storage.
6. Do not summarize confidential interview questions in public docs.
7. Run privacy validation.
8. Record prevention steps.

## Accidental Push to GitHub

1. Treat as P0 until impact is understood.
2. Make the repository private if exposure risk requires immediate containment and permissions allow.
3. Identify exposed commits, files, and branches.
4. Remove sensitive content from the current branch.
5. Rewrite repository history only with explicit owner approval and after coordinating with anyone who may have cloned the repository.
6. Rotate any exposed credentials.
7. Verify GitHub releases, tags, pull requests, actions logs, and cached artifacts.
8. Document the incident, impact, remediation, and lessons learned.

## Removing Sensitive History

Use history rewriting only when necessary and approved. Recommended options include:

- `git filter-repo` where available.
- BFG Repo-Cleaner.
- A fresh repository re-import for severe incidents.

After rewriting history:

- Force-push only with explicit owner approval.
- Recreate safe tags if needed.
- Ask collaborators to reclone.
- Verify the sensitive content is absent from branches and tags.

## Rotating Credentials

Rotate credentials if any exposed file includes:

- API keys.
- OAuth tokens.
- Session cookies.
- Personal access tokens.
- Service-account credentials.
- Email credentials.
- Deployment secrets.

Credential rotation should happen before public communication whenever active misuse is possible.

## Communicating Impact

Impact communication should include:

- What type of data was exposed.
- When it was exposed.
- Where it was exposed.
- Whether it was pushed publicly.
- What containment action was taken.
- What data was removed.
- Whether credentials were rotated.
- What prevention step was added.

Do not include sensitive values in incident communications.

## Lessons Learned

Every incident review should answer:

- What failed?
- Why did the existing privacy boundary miss it?
- Was `.gitignore` sufficient?
- Was the file stored in the wrong place?
- Was the review checklist followed?
- What validation should be added or improved?
- What operating procedure should change?

Lessons learned should feed the pilot decision log and roadmap only after private details are removed.
