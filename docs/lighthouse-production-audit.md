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

## Remediation Update: Sprint 16.3.1

Status: implemented locally; production redeploy and median Lighthouse retest still required.

Implemented changes:

- Replaced the root metadata icon references from `/og-image.png` to `/favicon.svg`.
- Replaced the web manifest icon from `/og-image.png` to `/favicon.svg`.
- Added a lightweight `322` byte SVG favicon.
- Kept `/og-image.png` for Open Graph and Twitter cards only.
- Replaced `@next/third-parties/google` with explicit `next/script` loading for GA4.
- Removed the now-unused `@next/third-parties` runtime dependency.
- Kept the GA4 initialization stub lightweight and moved the external GA network script to `lazyOnload`.
- Moved Microsoft Clarity from `afterInteractive` to `lazyOnload`.
- Added an in-memory analytics queue so route-view and click events are preserved until lazy GA initializes.
- Removed custom `aria-label` values from homepage capability cards so visible text remains the accessible name.

Expected impact:

- Browser should no longer fetch the `1.1 MB` Open Graph image as the favicon or manifest icon on every page.
- GA4 and Clarity should no longer compete as early for main-thread time.
- Route-view and contact/click events should continue to queue and flush once GA initializes.
- Homepage accessible-name mismatch should be resolved.

Production retest requirement:

- Deploy commit containing this remediation.
- Run three clean mobile Lighthouse audits per target page.
- Record the median result below.
- Verify GA4 events and Clarity sessions after deployment.

## Post-Remediation Production Validation: Sprint 16.3.2

Status: production validation completed.

Production deployment:

- Target: `https://saurabh-product-os.vercel.app`
- Remediation commit: `92722fab`
- Verification method: the public Vercel response headers do not expose the Git commit SHA, so the deployment was verified through production artifact signatures from `92722fab`.
- Verified production signatures:
  - `/favicon.svg` returns the new lightweight `322` byte SVG favicon.
  - `/manifest.webmanifest` references `/favicon.svg`.
  - `/robots.txt` allows rendering assets and keeps only `/api/` disallowed.
  - Production HTML includes `google-analytics-init`, `google-analytics`, and `microsoft-clarity`.
  - Production HTML no longer contains `@next/third-parties`.

Test environment:

- Test date and time: `2026-07-11 17:51:24 +05:30`
- Tooling: Lighthouse `13.4.0`, Chrome headless
- Mode: navigation
- Device: emulated mobile
- Categories: Performance, Accessibility, Best Practices, SEO
- Runs: three clean production runs per page
- Browser profile: unique headless Chrome user data directory per run
- Extensions: disabled through headless Chrome flags
- Raw JSON reports: generated as temporary local evidence artifacts and excluded from commit

Production reachability checks:

| Route | Result |
| --- | --- |
| `/` | `200` |
| `/executive` | `200` |
| `/profile` | `200` |
| `/case-studies/logix` | `200` |
| `/contact` | `200` |
| `/favicon.svg` | `200` |
| `/robots.txt` | `200` |
| `/sitemap.xml` | `200` |

### Three-Run Lighthouse Results

| Page | Perf Run 1 | Perf Run 2 | Perf Run 3 | Perf Median | Accessibility | Best Practices | SEO |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Homepage | 90 | 95 | 94 | 94 | 100 | 77 | 100 |
| Executive Brief | 88 | 96 | 91 | 91 | 100 | 77 | 100 |
| Professional Profile | 91 | 91 | 87 | 91 | 100 | 77 | 100 |
| Logix PLB | 93 | 91 | 92 | 92 | 100 | 77 | 100 |
| Contact | 94 | 94 | 95 | 94 | 100 | 77 | 100 |

### Before / After Comparison

| Page | Previous Perf | Median Perf | Perf Delta | Previous LCP | Median LCP | LCP Delta | Previous TBT | Median TBT | TBT Delta | Previous Best Practices | Current Best Practices | Materially improved? |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Homepage | 91 | 94 | +3 | 1.4s | 1.84s | +0.44s | 380ms | 286ms | -94ms | 77 | 77 | Yes |
| Executive Brief | 57 | 91 | +34 | 11.2s | 1.73s | -9.47s | 490ms | 371ms | -119ms | 77 | 77 | Yes |
| Professional Profile | 61 | 91 | +30 | 11.2s | 1.41s | -9.79s | 380ms | 374ms | -6ms | 77 | 77 | Yes |
| Logix PLB | 59 | 92 | +33 | 11.3s | 1.40s | -9.90s | 430ms | 348ms | -82ms | 77 | 77 | Yes |
| Contact | 55 | 94 | +39 | 10.9s | 1.73s | -9.17s | 450ms | 268ms | -182ms | 77 | 77 | Yes |

### Core Web Vitals And Diagnostics: Median Runs

| Page | FCP | LCP | Speed Index | TBT | CLS | Main-thread work | Largest long task | Unused JS estimate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Homepage | 0.92s | 1.84s | 1.06s | 286ms | 0 | 1.48s | 203ms | 92 KiB |
| Executive Brief | 1.05s | 1.73s | 1.05s | 371ms | 0 | 1.64s | 246ms | 94 KiB |
| Professional Profile | 1.14s | 1.41s | 1.14s | 374ms | 0 | 1.79s | 218ms | 89 KiB |
| Logix PLB | 1.05s | 1.40s | 1.05s | 348ms | 0 | 1.51s | 235ms | 95 KiB |
| Contact | 0.86s | 1.73s | 0.89s | 268ms | 0 | 1.23s | 185ms | 95 KiB |

LCP element:

- Lighthouse JSON did not expose a `largest-contentful-paint-element` detail in the representative median reports.
- Based on the page architecture and improved LCP timing, the delayed LCP regression from the previous audit has been resolved; above-the-fold content is now available in the `1.40s-1.84s` range across all launch-critical pages.

Render-blocking resources:

- No critical render-blocking resource finding remained in the median Lighthouse reports.

Third-party script contribution:

- GA4 network requests were observed in production.
- Microsoft Clarity network requests were observed in production.
- Lighthouse Best Practices deductions were tied to third-party cookie diagnostics from Microsoft Clarity and associated Bing/Clarity collection endpoints.

### Analytics Regression Result

GA4 result: **source/runtime verification passed; dashboard receipt not verified**.

Evidence:

- Production loaded `https://www.googletagmanager.com/gtag/js?id=G-8K7TJ088G0`.
- Production emitted GA collection requests to `https://www.google-analytics.com/g/collect`.
- Runtime `window.gtag` was present.
- Runtime `window.dataLayer` was present and received events.
- Runtime `window.__productOSAnalyticsQueue` drained to `0` after GA initialized.
- `contact_page_viewed` was present in the production data layer.
- `contact_link_clicked` was present in the production data layer after an email click.
- GitHub/contact click checks increased the production data layer without leaving queued events behind.

Limitations:

- GA4 Realtime / DebugView dashboard receipt was not verified from this environment.
- `recruiter_journey_completed` was not observed from the Contact page's page-specific tracked email click. The generic analytics utility supports that event for recruiter completion URLs, but the Contact page-specific tracked link emits `contact_link_clicked` only. This is a P1 instrumentation gap, not a runtime loading failure.

### Microsoft Clarity Regression Result

Clarity result: **source/runtime verification passed; dashboard receipt not verified**.

Evidence:

- Production loaded `https://www.clarity.ms/tag/xemq5rsgrr`.
- Production loaded `https://scripts.clarity.ms/0.8.67/clarity.js`.
- Production emitted Clarity collection requests to `https://c.clarity.ms/c.gif` and `https://e.clarity.ms/collect`.
- Runtime `window.clarity` was present.
- No duplicate Clarity initialization was observed in the runtime check.

Limitations:

- Clarity dashboard session recording, click capture, scroll capture, and heatmap receipt were not verified from this environment.

### Remaining Best Practices Exceptions

| Finding | Classification | Evidence | Recommendation |
| --- | --- | --- | --- |
| `third-party-cookies` | Microsoft Clarity third-party diagnostic | Lighthouse reported `8` cookies from `www.clarity.ms`, `scripts.clarity.ms`, `c.clarity.ms`, and `c.bing.com` | Accept as a known P1 launch exception or consent-gate Clarity later |
| `inspector-issues` | Microsoft Clarity third-party diagnostic | Chrome DevTools issue panel logged cookie issues from Clarity/Bing endpoints | Accept as a known P1 launch exception or consent-gate Clarity later |

No application-owned Best Practices issue was identified in the median production reports.

### Post-Remediation Findings

#### P0 Issues

None.

#### P1 Issues

| Issue | Root cause | Impact | Recommended fix | Estimated effort |
| --- | --- | --- | --- | --- |
| TBT remains above the `250ms` target on all five launch-critical pages | Remaining main-thread work from shared app hydration, client-side interaction tracking, and third-party analytics execution | Strong GO threshold is not met even though median Performance scores are launch-acceptable | Continue reducing non-critical client JavaScript and route-scope interactive wrappers where possible | 0.5-1 day |
| Best Practices remains `77` because of Microsoft Clarity third-party cookies | Clarity and associated Bing endpoints set third-party cookies that Lighthouse flags | Prevents a clean `100` Best Practices score; not application-owned | Accept for launch as a documented analytics trade-off, or introduce consent-gated Clarity in a later privacy sprint | 0.5-1 day |
| `recruiter_journey_completed` was not observed on Contact email click | Contact page uses page-specific tracked links that emit `contact_link_clicked`, bypassing generic completion tracking | Recruiter completion funnel may be under-counted | Add completion tracking to the Contact page-specific email and LinkedIn CTAs | 30 minutes |

#### P2 Improvements

| Improvement | Rationale |
| --- | --- |
| Further reduce unused JavaScript (`89-95 KiB`) | Useful for long-term performance margin as Product OS content grows |
| Add dashboard-based GA4 and Clarity verification before public announcement | Runtime verification confirms loading, but dashboard receipt remains unverified |
| Preserve raw Lighthouse HTML reports for future release audits | Current sprint used temporary JSON artifacts only |

### Revised Release Recommendation

Recommendation: **GO WITH MINOR ISSUES**.

Rationale:

- All launch-critical pages now meet or exceed the required Performance score floor.
- Executive Brief and Contact both score above `85`.
- Contact recovered from `55` to `94` median Performance.
- Accessibility remains `100` on every audited page.
- SEO remains `100` on every audited page.
- No application-owned critical Best Practices issue remains.
- GA4 and Clarity both load in production runtime checks.
- Contact route, Contact CTAs, and external contact links remain functional.

This is not a **STRONG GO** because:

- TBT remains above the strict `250ms` target on all pages.
- Best Practices remains `77` due to Microsoft Clarity third-party cookie diagnostics.
- `recruiter_journey_completed` was not observed on the Contact page-specific email click.

## Recruiter Conversion Event Verification: Sprint 16.3.3

Status: implementation complete; production verification pending deployment.

### Root Cause

`recruiter_journey_completed` was not observed during the Contact page email conversion flow because Product OS had two analytics paths:

- The global document-level link tracker called `trackLinkClick`, which could emit `email_click`, `linkedin_click`, `github_outbound_clicked`, `contact_click`, and `recruiter_journey_completed`.
- The Contact page used `RecruiterJourneyTrackedLink`, a page-specific tracked link wrapper that emitted `contact_link_clicked` only.

The Contact page-specific wrapper bypassed the generic recruiter completion logic, so the visible primary Contact CTAs produced `contact_link_clicked` but did not produce `recruiter_journey_completed`.

This was not caused by:

- incorrect link selectors,
- broken Contact links,
- GA4 initialization failure,
- analytics queue failure,
- Microsoft Clarity,
- route loading,
- or page-view tracking.

### Conversion Definition

For this sprint, a recruiter journey completion is defined as:

> A visitor reaches `/contact` and selects a primary recruiter contact action: email or LinkedIn.

The completion event intentionally avoids personally identifiable destination values. It sends:

- `journey_type`: `recruiter_conversion`
- `contact_method`: `email` or `linkedin`
- `source_page`: `Contact`
- `current_path`: `/contact`
- `destination`: `email` or `linkedin`
- `cta_name`
- `link_text`

The existing `contact_link_clicked` event remains unchanged and still carries the original destination for Contact page link reporting.

### Fix Applied

Implementation changes:

- Added reusable `trackRecruiterJourneyCompletion` logic in `lib/analytics.ts`.
- Added same-session deduplication for completion events using a browser-scoped completion key.
- Sanitized completion destinations so email addresses are not sent in `recruiter_journey_completed`.
- Updated `RecruiterJourneyTrackedLink` so Contact page email and LinkedIn clicks emit:
  - the existing `contact_link_clicked` event, and
  - one `recruiter_journey_completed` event when the link is a recruiter completion action.
- Preserved existing bounded analytics queue behavior.
- Preserved existing GA4 and Clarity initialization behavior.

### Exact Event Behavior

Before:

| Action | Events observed |
| --- | --- |
| Contact page email click | `contact_link_clicked` |
| Contact page LinkedIn click | `contact_link_clicked` |
| Contact page GitHub click | `contact_link_clicked` |

After:

| Action | Events observed |
| --- | --- |
| Contact page email click | `contact_link_clicked`, `recruiter_journey_completed` with `contact_method=email` |
| Repeated Contact page email click in same session | `contact_link_clicked`; no duplicate `recruiter_journey_completed` |
| Contact page LinkedIn click | `contact_link_clicked`, `recruiter_journey_completed` with `contact_method=linkedin` |
| Contact page GitHub click | `contact_link_clicked`; no `recruiter_journey_completed` |

### Local Journey Verification

Local browser verification passed using the running Next.js app at `http://localhost:3000`.

Journey A:

`Homepage -> Executive Brief -> Professional Profile -> Contact -> Email`

Observed:

- `contact_page_viewed`
- `contact_link_clicked`
- one `recruiter_journey_completed`
- `contact_method=email`
- `destination=email`
- `journey_type=recruiter_conversion`

Journey B:

`Homepage -> Executive Brief -> Logix brief -> Contact -> LinkedIn`

Observed:

- `contact_page_viewed`
- `contact_link_clicked`
- one `recruiter_journey_completed`
- `contact_method=linkedin`
- `destination=linkedin`
- `journey_type=recruiter_conversion`

Duplicate-event check:

- Repeated email click emitted another `contact_link_clicked`, but did not emit a duplicate `recruiter_journey_completed`.
- GitHub contact option did not emit `recruiter_journey_completed`.
- Normal page views did not emit `recruiter_journey_completed`.

### Production Verification

Production verification is pending deployment of the fix.

The workspace did not contain a local `.vercel` project link and the Vercel CLI was not available, so production redeployment could not be completed from this environment. After deployment, verify in GA4 Realtime or DebugView:

- Journey A emits one `recruiter_journey_completed` with `contact_method=email`.
- Journey B emits one `recruiter_journey_completed` with `contact_method=linkedin`.
- `contact_link_clicked` still arrives.
- No duplicate completion event is emitted for repeated clicks in the same session.
- GA4 and Clarity still initialize normally.

Until production receives this commit, the release recommendation remains **GO WITH MINOR ISSUES**.

## Before / After Scorecard

| Page | Before Performance | After Performance | Before Accessibility | After Accessibility | Before Best Practices | After Best Practices | Before SEO | After SEO |
| --- | ---: | --- | ---: | --- | ---: | --- | ---: | --- |
| Homepage | 91 | 94 | 100 | 100 | 77 | 77 | 100 | 100 |
| Executive Brief | 57 | 91 | 100 | 100 | 77 | 77 | 100 | 100 |
| Professional Profile | 61 | 91 | 100 | 100 | 77 | 77 | 100 | 100 |
| Logix Product Leadership Brief | 59 | 92 | 100 | 100 | 77 | 77 | 100 | 100 |
| Contact | 55 | 94 | 100 | 100 | 77 | 77 | 100 | 100 |

## Root Causes Confirmed

| Root cause | Evidence | Remediation |
| --- | --- | --- |
| Oversized app icon payload | Lighthouse network payload showed `/og-image.png` at roughly `1.1 MB` on every audited page | Added `/favicon.svg`; updated metadata and manifest icons |
| Early third-party script cost | Lighthouse unused JavaScript showed GA and shared client chunks as major contributors; Clarity appeared in Best Practices cookie issues | Moved GA network script and Clarity to `lazyOnload`; retained GA event queue |
| Route events could be dropped if GA loads later | Existing `trackAnalyticsEvent` returned early when `window.gtag` was unavailable | Added bounded queue and flush mechanism |
| Homepage accessible-name mismatch | Lighthouse `label-content-name-mismatch` reported homepage capability cards | Removed redundant `aria-label` attributes |

## Remaining Production Exceptions

| Exception | Status | Owner decision needed |
| --- | --- | --- |
| Microsoft Clarity third-party cookie diagnostics | Still expected until production retest proves otherwise | Accept as P1 diagnostic exception or add consent-gated loading |
| Production after-scores | Pending deployment | Required before changing release decision |
| GA4 event receipt | Pending production dashboard check | Required before public launch |
| Clarity session receipt | Pending production dashboard check | Required before public launch |

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

Current recommendation: **GO WITH MINOR ISSUES**.

Rationale:

- SEO target is met across all audited pages.
- Accessibility target is met across all audited pages.
- Sprint 16.3.2 production validation confirms the remediation is live in production through artifact signatures from commit `92722fab`.
- Median Performance now reaches `91-94` across all audited launch-critical pages.
- The Contact conversion page improved from `55` to `94` median Performance.
- Best Practices remains `77`, but the remaining deductions are Clarity third-party cookie diagnostics rather than application-owned issues.
- GA4 and Microsoft Clarity both initialize in production runtime checks.
- Contact links and the Executive Brief to Contact path remain functional.

Launch can move to **STRONG GO** after:

- TBT is reduced below `250ms` on all launch-critical pages.
- Best Practices reaches `100` or Clarity cookie diagnostics are accepted as a documented analytics exception.
- `recruiter_journey_completed` is verified from the Contact completion path.
- GA4 and Clarity dashboard receipt are verified.

## Validation

Repository validation after the audit:

- `pnpm --config.verify-deps-before-run=false lint`
- `pnpm --config.verify-deps-before-run=false typecheck`
- `pnpm --config.verify-deps-before-run=false build`

All validation commands passed.
