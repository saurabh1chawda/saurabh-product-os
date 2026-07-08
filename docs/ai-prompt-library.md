# AI Prompt Library

Status: RC1 prompt library  
Last updated: July 2026

## Executive Summary

The AI Prompt Library standardizes how AI assists content production for the Product Leadership Platform.

Prompts should accelerate drafting while preserving Product OS as the single source of truth. Every AI-generated output must be reviewed by a human before publishing handoff.

## Prompt Rules

- Provide the canonical source text or link context.
- Ask for one output type at a time.
- Require no invented metrics or claims.
- Require a CTA back to the source.
- Request concise, executive, practical writing.

## Executive Summary Prompt

Use for:

- Summarizing Product OS pages, Product Leadership Briefs, or repository artifacts.

Prompt:

```text
You are helping produce content for the Product Leadership Platform.

Source artifact:
[Paste source excerpt or summary]

Task:
Write a concise executive summary for [audience].

Requirements:
- Use only the facts in the source.
- Do not invent metrics, companies, claims, or outcomes.
- Preserve Product OS as the canonical source.
- Keep the tone executive, practical, and evidence-driven.
- End with one CTA: [CTA].

Output:
- 1 short headline
- 2-3 concise paragraphs
- 3 bullets with the strongest takeaways
```

## Carousel Generation Prompt

Use for:

- Turning frameworks or Product Leadership Briefs into LinkedIn carousel drafts.

Prompt:

```text
Source artifact:
[Paste source]

Create a LinkedIn carousel draft.

Audience:
[Recruiters / PMs / AI PMs / product leaders]

Requirements:
- One idea per slide.
- 7 slides maximum.
- No unsupported claims.
- Use simple, direct slide titles.
- Include a CTA to [source artifact].

Output format:
Slide 1: Cover
Slide 2: Problem
Slide 3: Context
Slide 4: Framework or decision
Slide 5: Trade-off
Slide 6: Takeaway
Slide 7: CTA
```

## Blog Draft Prompt

Use for:

- Drafting long-form explanation from a source artifact.

Prompt:

```text
Source artifact:
[Paste source]

Write a blog draft about:
[Topic]

Audience:
[Audience]

Requirements:
- Use Product OS as the source of truth.
- Do not duplicate the full source.
- Explain one core argument.
- Include practical takeaways.
- Include a CTA to [canonical source].
- Avoid hype and generic thought leadership language.

Structure:
1. Thesis
2. Problem
3. Source context
4. Decision or framework
5. Practical application
6. Takeaways
7. CTA
```

## Newsletter Section Prompt

Use for:

- Creating a concise newsletter segment.

Prompt:

```text
Source artifact:
[Paste source]

Write a newsletter section for product leaders.

Requirements:
- Keep it under 500 words.
- Focus on one lesson.
- Include one practical question for the reader.
- Include one CTA to [source].
- Do not introduce unsupported examples.

Output:
- Section title
- Short intro
- Main lesson
- Practical application
- Reflection question
- CTA
```

## Interview Answer Prompt

Use for:

- Preparing concise interview answers from Product Leadership Briefs.

Prompt:

```text
Source artifact:
[Paste Product Leadership Brief summary]

Interview question:
[Question]

Draft an interview answer.

Requirements:
- Use the situation, decision, trade-off, action, outcome, and learning structure.
- Keep it concise enough for a spoken answer.
- Do not sound scripted.
- Do not invent details.
- Mention the related Product OS resource naturally.

Output:
- 60-second answer
- 2-minute answer
- Follow-up points
```

## Speaking Notes Prompt

Use for:

- Preparing talk notes from Product OS themes.

Prompt:

```text
Source artifacts:
[Paste source summaries]

Talk topic:
[Topic]

Audience:
[Audience]

Create speaking notes.

Requirements:
- Start with the audience problem.
- Use one product decision example.
- Extract one reusable principle.
- Include practical takeaways.
- Avoid marketing language.

Output:
- Opening
- Three-part talk flow
- Example story
- Key takeaway
- Closing CTA
```

## Workshop Agenda Prompt

Use for:

- Turning a framework or toolkit into a workshop.

Prompt:

```text
Source artifact:
[Paste framework or toolkit summary]

Workshop audience:
[Audience]

Workshop duration:
[Duration]

Create a practical workshop agenda.

Requirements:
- Define learning outcomes.
- Include exercises.
- Include expected outputs.
- Link back to the source artifact.
- Keep the workshop usable without Product OS context.

Output:
- Title
- Audience
- Learning outcomes
- Agenda
- Materials
- Expected outputs
- Follow-up resources
```

## GitHub Release Notes Prompt

Use for:

- Drafting repository release notes.

Prompt:

```text
Repository:
[Repository name]

Release scope:
[What changed]

Related Product OS source:
[Link or summary]

Write GitHub release notes.

Requirements:
- Explain what changed.
- Explain why it matters.
- Explain how to use it.
- Include status and next step.
- Do not overstate maturity.

Output:
- Release title
- Summary
- What's new
- How to use it
- Related Product OS resources
- Next
```

## Prompt Quality Checklist

Before using a prompt, confirm:

- The source artifact is available.
- The audience is named.
- The channel is named.
- The CTA is named.
- The prompt forbids unsupported claims.

## Operating Principle

AI drafts. Product judgment edits.
