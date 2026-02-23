# Showcase Templates Design

## Goal
Add 10 new templates to the template library that demonstrate the **range** of what well-crafted skills can do. Each template showcases a distinct skill design pattern.

## Templates

| # | Template | Category | Pattern | Featured |
|---|----------|----------|---------|----------|
| 1 | Socratic Tutor | Education | Persona + pedagogical method | Yes |
| 2 | Commit Message Writer | Code | Structured output from unstructured input | No |
| 3 | Devil's Advocate | Business | Adversarial reasoning | Yes |
| 4 | Tone Police | Writing | Analysis/scoring | No |
| 5 | Sprint Retro Facilitator | Productivity | Multi-phase workflow | Yes |
| 6 | Explain Like I'm 5 | Education | Adaptive complexity | Yes |
| 7 | SQL Query Explainer | Code | Reverse engineering | No |
| 8 | Sales Objection Handler | Business | Role-play/simulation | Yes |
| 9 | Changelog Writer | Code | Multi-source synthesis | No |
| 10 | Decision Matrix Builder | Productivity | Interactive framework | No |

## Implementation
- Add as SQL migration `003_seed_showcase_templates.sql`
- UUIDs: `10000000-0000-0000-0000-000000000011` through `10000000-0000-0000-0000-000000000020`
- Each template gets 3 test cases
- Follow the expert quality framework from the new DRAFT_SYSTEM_PROMPT
