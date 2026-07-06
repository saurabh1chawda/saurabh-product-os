# Repository Metadata Checklist

Status: Draft  
Last updated: July 2026

This checklist documents the recommended GitHub repository settings for the Product OS flagship repository. Some settings cannot be changed from the local repository, so they are captured here for manual configuration.

## Recommended Repository Settings

| Setting | Recommendation |
| --- | --- |
| Repository name | `product-os` or `saurabh-product-os` |
| Description | Evidence-backed AI Product Operating System showing product judgment, decision systems, leadership briefs, and measurable product outcomes. |
| Homepage URL | `https://saurabh-product-os.vercel.app` |
| Visibility | Public when licensing and personal-content boundaries are finalized |
| Default branch | `main` |
| License | Add before public open-source launch |
| Issues | Enable when contribution model is ready |
| Discussions | Optional; useful only if the repository becomes a public learning resource |
| Wiki | Keep disabled; use versioned docs inside the repository |
| Projects | Optional; use only for public roadmap tracking |

## Recommended Topics

- `product-management`
- `ai-product-management`
- `product-strategy`
- `product-leadership`
- `product-operating-system`
- `decision-systems`
- `case-studies`
- `nextjs`
- `typescript`
- `portfolio`

## Visibility Assumptions

Product OS contains personal career material, product leadership writing, reusable frameworks, and application code. Before switching to a fully public open-source posture, clarify:

- Which code can be reused.
- Which frameworks can be copied.
- Which personal profile and career content should remain attribution-protected.
- Which assets are public, generated, licensed, or brand-specific.

## Default Branch Expectations

- `main` should represent production-ready repository state.
- Every commit on `main` should keep `pnpm lint`, `pnpm typecheck`, and `pnpm build` passing.
- Documentation updates should be committed with clear scope.
- Release notes should be added for material public-facing changes.

## Manual Launch Tasks

- Add repository description.
- Add homepage URL.
- Add topics.
- Add license.
- Add screenshots to README.
- Confirm default branch protection expectations.
- Confirm Vercel deployment link.
- Confirm README links after repository rename, if renamed.
