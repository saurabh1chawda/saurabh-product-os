# Narrative Layer Design Decisions

## Decision 1: Keep Narrative Separate From Assembly

Narrative output is written as a post-processing artifact, not back into the original assembly draft. This preserves traceability and makes review safer.

## Decision 2: Use Rule IDs

Each transformation is tagged with a rule ID so that changes can be audited and reversed.

## Decision 3: Validate Protected Tokens

The validator checks metrics, dates, evidence IDs, bullet IDs, Product OS URLs, and project labels after transformation.

## Decision 4: Score Communication Separately

Narrative quality scores are separate from factual integrity and ATS scores. Factual integrity and traceability must remain 100 before narrative score matters.

## Decision 5: Prefer Measured Executive Tone

The target voice is confident and precise. It should not sound like marketing copy, AI-generated hype, or generic product-management language.

