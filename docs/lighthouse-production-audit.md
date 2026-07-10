# Lighthouse Production Audit

Status: RC1 production quality audit  
Date: July 2026  
Target: `https://saurabh-product-os.vercel.app`  
Tooling: Lighthouse `13.4.0`, Chrome headless, production URLs

## Executive Summary

Product OS is not ready for public launch based on the production Lighthouse audit.

Accessibility and SEO are strong across every audited page. Every page scored `100` for Accessibility and `100` for SEO. The launch risks are concentrated in Performance and Best Practices.

The homepage scored `91` for Performance against a target of `95`. The other audited pages scored between `55` and `61` for Performance against a target of `90`. All pages scored `77` for Best Practices against a target of `100`, primarily because Microsoft Clarity introduces third-party cookie issues that Lighthouse reports through Chrome DevTools.

Launch recommendation: **NO GO** until performance and Best Practices issues are addressed or the launch targets are explicitly revised.

## Audit Methodology

Audited live production pages:

| Page | URL |
| --- | --- |
| Homepage | `https://saurabh-product-os.vercel.app` |
| Executive Brief | `https://saurabh-product-os.vercel.app/executive` |
| Professional Profile | `https://saurabh-product-os.vercel.app/profile` |
| Logix Product Leadership Brief | `https://saurabh-product-os.vercel.app/case-studies/logix` |
| Contact | `https://saurabh-product-os.vercel.app/contact` |

Audit command pattern:

```text
lighthouse <production-url> --output=json --chrome-flags="--headless=new --no-sandbox --disable-gpu"
```

Notes:

- Lighthouse was run against production, not local development.
- The audit used Lighthouse's default emulated mobile conditions.
- Raw JSON outputs were treated as temporary evidence artifacts and are not committed.

## Scores

| Page | Performance | Accessibility | Best Practices | SEO | Target met? |
| --- | ---: | ---: | ---: | ---: | --- |
| Homepage | 91 | 100 | 77 | 100 | No |
| Executive Brief | 57 | 100 | 77 | 100 | No |
| Professional Profile | 61 | 100 | 77 | 100 | No |
| Logix Product Leadership Brief | 59 | 100 | 77 | 100 | No |
| Contact | 55 | 100 | 77 | 100 | No |

## Target Assessment

| Page group | Target | Result |
| --- | --- | --- |
| Homepage Performance | `>=95` | Failed: `91` |
| Homepage Accessibility | `100` | Passed |
| Homepage Best Practices | `100` | Failed: `77` |
| Homepage SEO | `100` | Passed |
| Other pages Performance | `>=90` | Failed: `55-61` |
| Other pages Accessibility | `100` | Passed |
| Other pages Best Practices | `100` | Failed: `77` |
| Other pages SEO | `100` | Passed |

## Core Web Vitals And Diagnostics

| Page | FCP | LCP | Speed Index | TBT | CLS | TTFB |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Homepage | 0.9s | 1.4s | 1.2s | 380ms | 0 | 30ms |
| Executive Brief | 2.9s | 11.2s | 2.9s | 490ms | 0 | 30ms |
| Professional Profile | 2.8s | 11.2s | 2.9s | 380ms | 0 | 30ms |
| Logix Product Leadership Brief | 2.9s | 11.3s | 2.9s | 430ms | 0 | 30ms |
| Contact | 3.0s | 10.9s | 5.2s | 450ms | 0 | 30ms |

Interpretation:

- Server response time is healthy.
- Layout stability is excellent.
- SEO and accessibility are launch-ready.
- Performance failure is caused by client-side rendering/hydration cost, late LCP on content pages, and third-party analytics overhead rather than slow server response.

## Issues

### P0: Production Performance Below Launch Targets

Classification: **P0 launch blocker**

Affected pages:

- Homepage: Performance `91`, target `>=95`.
- Executive Brief: Performance `57`, target `>=90`.
- Professional Profile: Performance `61`, target `>=90`.
- Logix Product Leadership Brief: Performance `59`, target `>=90`.
- Contact: Performance `55`, target `>=90`.

Root cause:

- Content pages show very late LCP between `10.9s` and `11.3s`.
- TBT ranges from `380ms` to `490ms`.
- Lighthouse reports `89-97 KiB` of unused JavaScript savings across pages.
- Google Analytics and a shared Next.js client chunk are the largest unused JavaScript contributors.
- Microsoft Clarity adds additional third-party script and cookie overhead.

Impact:

- The site fails the sprint's explicit production launch thresholds.
- Recruiters and hiring managers on mobile may see slower content readiness on the most important decision pages.
- Public launch would happen with measurable production performance risk.

Recommended fix:

- Audit global client-side JavaScript and reduce hydration on static executive pages.
- Defer non-critical analytics until after first interaction or idle time.
- Consider disabling Microsoft Clarity for launch or loading it only after consent/intent.
- Review global link tracking and route-level interaction wrappers for unnecessary client execution.
- Keep hero and primary content server-rendered with minimal client components.
- Re-run Lighthouse after each optimization.

Estimated effort:

- 1-2 engineering days for a focused performance pass.

### P1: Best Practices Fails Because Of Microsoft Clarity Third-Party Cookies

Classification: **P1 should fix before public announcement**

Affected pages:

- All audited pages scored `77` for Best Practices.

Root cause:

- Lighthouse reports `8` third-party cookies.
- Cookie sources include `www.clarity.ms`, `scripts.clarity.ms`, `c.clarity.ms`, and `c.bing.com`.
- Chrome DevTools logged cookie issues related to Microsoft Clarity.

Impact:

- Best Practices target of `100` is missed on every audited page.
- Third-party cookie restrictions may reduce analytics reliability.
- Privacy-sensitive reviewers may see avoidable production hygiene risk.

Recommended fix:

- Remove Microsoft Clarity from the public launch build, or
- Load Clarity behind explicit consent, or
- Keep GA4 only for launch analytics and reintroduce Clarity after privacy/consent handling is defined.

Estimated effort:

- 0.5-1 engineering day.

### P1: Contact Page Has The Weakest Performance

Classification: **P1 should fix before public announcement**

Affected page:

- Contact: Performance `55`, Speed Index `5.2s`, LCP `10.9s`, TBT `450ms`.

Root cause:

- Same global JavaScript and analytics overhead as other pages.
- Contact is a conversion page, so any delay has higher business impact.

Impact:

- Recruiter conversion path may feel slower than necessary.
- Contact page is the final step in the hiring journey and should be one of the fastest pages.

Recommended fix:

- Prioritize Contact in the performance pass.
- Minimize client components on Contact.
- Keep email/LinkedIn/GitHub links static and server-rendered.
- Remove non-essential scripts from this route if possible.

Estimated effort:

- 0.5 day if handled with the global performance pass.

### P2: Homepage Accessible Name Mismatch In Story Category Cards

Classification: **P2 post-launch improvement**

Affected page:

- Homepage.

Root cause:

- Story category card links use visible card text, but `aria-label` replaces the accessible name with shorter text such as `View product stories related to Growth & Monetization`.
- Lighthouse reports that visible text inside the element is not included in the accessible name.

Impact:

- Accessibility category still scored `100`, but voice-control and assistive technology behavior may be less predictable.

Recommended fix:

- Remove the custom `aria-label` when the visible card text is already descriptive, or
- Include the visible card title in the accessible name.

Estimated effort:

- 30 minutes.

### P2: Unused JavaScript And Legacy JavaScript Warnings

Classification: **P2 post-launch improvement**

Affected pages:

- All audited pages.

Root cause:

- Lighthouse reports unused JavaScript savings of `89-97 KiB`.
- A shared Next.js chunk includes legacy JavaScript/polyfill patterns with an estimated `14 KiB` savings opportunity.
- GA contributes roughly `68-69 KiB` of unused JavaScript in the audit.

Impact:

- Contributes to performance misses.
- May become more important as Product OS content grows.

Recommended fix:

- Review browser target/baseline configuration.
- Review whether global analytics and link tracking can be split or delayed.
- Keep reusable interaction components route-scoped rather than globally active where possible.

Estimated effort:

- 1 day, likely bundled with P0 performance work.

## Recommendations

1. Make one focused performance sprint before public launch.
2. Disable or consent-gate Microsoft Clarity before public announcement.
3. Re-run Lighthouse on all five audited pages after performance changes.
4. Treat Contact, Executive Brief, Profile, and Logix as priority pages because they drive recruiter trust and conversion.
5. Preserve the current SEO and accessibility foundation; those areas are already strong.

## Launch Readiness Assessment

Current recommendation: **NO GO**.

Rationale:

- SEO target is met across all audited pages.
- Accessibility target is met across all audited pages.
- Performance target is missed on all audited pages.
- Best Practices target is missed on all audited pages.
- The most important recruiter pages are below the stated performance threshold.

Launch can move to **GO WITH MINOR ISSUES** only after:

- Homepage Performance reaches `>=95`.
- Executive Brief, Profile, Logix, and Contact Performance reach `>=90`.
- Best Practices reaches `100` or the team explicitly accepts Microsoft Clarity cookie findings as a known exception.

Launch can move to **GO** after:

- All targets are met.
- No P0 issues remain.
- P1 issues are either fixed or explicitly accepted with owner approval.

## Validation

Repository validation after the audit:

- `pnpm --config.verify-deps-before-run=false lint`
- `pnpm --config.verify-deps-before-run=false typecheck`
- `pnpm --config.verify-deps-before-run=false build`

All validation commands passed.
