# Career Companion

## What Career Companion Is

Career Companion is the product definition workstream for an AI-powered career operating assistant. It is intended to help the user qualify opportunities, analyze job descriptions, plan resume strategy, assemble evidence-backed application materials, prepare for interviews, and capture career learning.

Career Companion does not exist as a runtime agent yet. This folder defines the product direction, MVP boundaries, governance expectations, and phased roadmap before any implementation begins.

## Relationship to Career OS

Career OS remains the operating system and source of truth for workflows, evidence, privacy rules, decision gates, templates, application tracking, and pilot governance.

Career Companion must use Career OS protocols. It must not replace, bypass, or silently alter Career OS workflows, templates, governance, metrics, or decision gates.

## Relationship to the Controlled Live Pilot

Career OS is currently being validated through a controlled live pilot. Career Companion is a parallel product-definition workstream and must remain isolated from that frozen live-pilot baseline.

Career Companion documentation may reference Career OS conceptually, but it must not modify `docs/career-os-pilot/`, pilot artifacts, dashboards, runbooks, templates, workflow definitions, or governance documents.

## Current Maturity Stage

Current stage: Product definition.

No runtime agent, automation layer, user interface, memory system, messaging integration, or autonomous workflow exists yet.

## Documentation Map

- [Product Charter](product-charter.md): defines product vision, MVP, operating modes, authority model, safety policy, requirements, metrics, and success criteria.
- [Roadmap](roadmap.md): defines phased work from product definition through controlled agent pilot.

## Core Operating Principle

Career Companion must strengthen Career OS execution. It should make the approved workflow easier, safer, faster, and more explainable without changing the workflow by default.

## Human Authority Principle

Human approval remains mandatory at consequential decision points. Career Companion may analyze, recommend, draft, prepare, and coach, but it must not submit applications, send recruiter messages, schedule interviews, accept or reject interviews, negotiate offers, or approve unsupported claims.

## Privacy Principle

Private career, application, recruiter, resume, interview, and offer data must remain private by default. Career Companion must treat unverified information as provisional and must never expose private data without explicit human approval.

## Current Scope

The current scope is documentation and product definition only. The MVP is expected to begin with one governed Career Companion Orchestrator exposing specialized operating modes.

Initial operating modes:

1. Opportunity Qualification
2. JD Intelligence
3. Resume Strategy
4. Resume Assembly
5. Resume QA
6. Recruiter Communication
7. Interview Preparation
8. Interview Coaching
9. Interview Debrief
10. Career Intelligence

These are coordinated capabilities under one orchestrator, not ten autonomous agents.

## Runtime Status

No functioning Career Companion agent exists yet.

