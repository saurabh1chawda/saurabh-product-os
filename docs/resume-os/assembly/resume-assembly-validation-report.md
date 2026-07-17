# Resume Assembly Validation Report

## Executive Summary

Validated 7 synthetic fixture drafts. P0 failures: 0. Warnings: 2.

## Architecture

The assembly engine consumes JD Intelligence outputs, canonical achievements, bullet libraries, and Product OS mappings to produce a Resume Plan before a draft.

## Inputs and Outputs

Inputs are local JSON/YAML/Markdown files. Outputs are JSON and Markdown synthetic drafts.

## Assembly Rules

All bullets map to canonical achievements. Drafts remain human-review required.

## Section-Budgeting Results

All fixture drafts are estimated at or below two pages unless listed in warnings.

## Fixture Results

- ai-product-manager: validated
- enterprise-saas-product-manager: validated
- growth-product-manager: validated
- hybrid-ai-platform-pm: validated
- monetization-product-manager: validated
- payments-product-manager: validated
- platform-product-manager: validated

## ATS Constraint Results

ATS-safe structural checks passed for tables, columns, images, links, and headings.

## Evidence Integrity

All selected bullets map to canonical achievements.

## Product OS Integration

Product OS is included as proof, not employer experience.

## Page-Length Estimates

The estimator uses words, bullets, sections, and link count. DOCX/PDF rendering is deferred.

## Warnings

- ai-product-manager: More than 50% of recommended bullets come from one company; human justification required.
- hybrid-ai-platform-pm: Top archetype scores are close; human review recommended.

## Defects Found

None.

## Defects Fixed

- Added draft status enforcement.
- Added synthetic-output labeling.
- Added bullet and achievement trace checks.

## Remaining Limitations

- DOCX/PDF export is deferred.
- Page counts are estimates.
- Human approval remains mandatory.

## Readiness Decision

READY FOR LIVE PILOT
