<p align="center">
  <img src="public/logo.png" alt="SkillSmith" height="48" />
</p>

<p align="center">
  <strong>Create, test, and share custom SKILL.md files for AI workflows.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> &nbsp;&middot;&nbsp;
  <a href="#how-it-works">How It Works</a> &nbsp;&middot;&nbsp;
  <a href="#skill-file-format">Skill Format</a> &nbsp;&middot;&nbsp;
  <a href="#getting-started">Getting Started</a> &nbsp;&middot;&nbsp;
  <a href="#tech-stack">Tech Stack</a> &nbsp;&middot;&nbsp;
  <a href="#project-structure">Project Structure</a>
</p>

---

## What is SkillSmith?

SkillSmith is an AI-powered platform that helps you craft structured **skill files** — reusable sets of instructions, edge cases, and examples that shape how AI models respond. Instead of writing one-off prompts, you build persistent skills that can be applied across conversations, shared with your team, or published to a community library.

Think of it as an IDE for prompt engineering — but instead of code, you're crafting expert knowledge that makes AI consistently better at specific tasks.

### The Problem

Most AI interactions start from zero. Every time you open a new chat, you re-explain your preferences, domain rules, and edge cases. Copy-pasting system prompts is brittle. There's no way to test if your instructions actually work, and no way to share what you've learned with others.

### The Solution

SkillSmith gives you a complete workflow:

1. **Describe what you need** in one sentence — AI generates a full skill file
2. **Refine it** with a guided editor or raw markdown
3. **Test it** with side-by-side comparisons and automated scoring
4. **Share it** as a template for others to discover and fork

---

## Features

### One-Line Builder

Describe what you want in plain English. The AI generates a complete, structured skill file with instructions, edge cases, and examples — ready to use or refine.

Three creation paths:
- **AI-Assisted** — Describe your skill, get a full draft in seconds
- **From Template** — Fork a community template and make it your own
- **Blank Slate** — Start from scratch with a clean editor

### Dual-Mode Editor

Switch between two editing modes depending on your preference:

- **Guided Mode** — A structured form that walks you through each section (name, description, instructions, edge cases, examples). Great for building skills methodically.
- **Markdown Mode** — A Monaco-powered editor for direct SKILL.md editing with syntax highlighting. For users who want full control.

Both modes stay in sync — edit in one, see changes in the other.

### AI-Assisted Editing

- **Draft with AI** — Generate an entire skill from a description
- **Section Suggestions** — Get AI-powered improvements for any individual section
- **Auto-Naming** — Generate a relevant skill name based on your description

### Split-Pane Testing Playground

The real differentiator. Send the same prompt twice:

- **Left pane**: Response **with** your skill applied
- **Right pane**: Response **without** your skill (baseline)

Compare them side by side. See exactly what your skill adds.

### Automated Test Suites

Go beyond manual testing:

- Create test cases with prompts and expected behaviors
- Run individual tests or batch-run entire suites
- AI auto-scores responses (0–100) across multiple dimensions
- Track results over time as you refine your skill

### Community Templates

Browse, fork, and publish skills:

- **Explore** public templates across categories (Writing, Code, Business, Education, Productivity)
- **Fork** any template to create your own variant
- **Publish** your skills for others to discover
- **Featured** section highlights high-quality community contributions

### Try Without Signing Up

The `/try` mode lets anyone build and test a skill without creating an account. Skills are saved to localStorage — sign up later to persist and share them.

---

## How It Works

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Create     │────▶│    Edit      │────▶│    Test      │────▶│    Share     │
│              │     │              │     │              │     │              │
│ One sentence │     │ Guided +     │     │ Split-pane   │     │ Publish to   │
│ or template  │     │ Markdown     │     │ comparison   │     │ community    │
│ or blank     │     │ + AI assist  │     │ + auto-score │     │ + fork       │
└─────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

---

## Skill File Format

Skills follow the **SKILL.md** format — YAML frontmatter for metadata, markdown sections for content:

```markdown
---
name: Code Review Mentor
description: >-
  When reviewing code, apply senior engineering standards
  with constructive, specific feedback.
---

# Code Review Mentor

## Instructions
- Review for correctness first, style second
- Flag security issues as blocking
- Suggest specific fixes, not just problems
- Acknowledge what's done well before critiquing

## Edge Cases
- Prototype code → lighter review, focus on architecture
- Generated code → verify it handles errors the generator missed
- Legacy code changes → don't demand full refactors, scope to the diff

## Examples

### Example 1: Missing Error Handling
**User:** Review this function:
`function getUser(id) { return db.query("SELECT * FROM users WHERE id = " + id); }`

**Claude:** Two issues here:

1. **SQL injection** (blocking): The `id` parameter is concatenated directly into the query string. Use parameterized queries: `db.query("SELECT * FROM users WHERE id = $1", [id])`

2. **No error handling**: If the query fails or returns no rows, the caller gets an unhandled rejection. Consider wrapping in try/catch and returning a clear result type.

The query itself is straightforward and correctly scoped — good instinct to keep it simple.
```

### Format Breakdown

| Section | Purpose |
|---|---|
| **Frontmatter** | `name` and `description` — when/how the skill activates |
| **Instructions** | Core behavioral rules the AI should follow |
| **Edge Cases** | How to handle unusual or ambiguous scenarios |
| **Examples** | Input/output pairs demonstrating the skill in action |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (for auth and data storage)
- A Google AI API key (for Gemini) or Anthropic API key (for Claude)

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/thevoiduniverse/skillsmith.git
cd skillsmith

# Run the setup script (installs deps + creates .env.local)
chmod +x setup.sh && ./setup.sh

# Add your AI API key to .env.local
# AI_MODEL=gemini-2.5-flash
# GOOGLE_API_KEY=your-key-here

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start building skills.

### Environment Variables

Create a `.env.local` file with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# AI Model
AI_MODEL=gemini-2.5-flash
GOOGLE_API_KEY=your-google-api-key

# Analytics (optional)
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### Database Setup

Run the Supabase migrations in order:

```bash
supabase db push
```

Or apply them manually from `supabase/migrations/`:

1. `001_initial_schema.sql` — Core tables (profiles, skills, test_cases, api_usage)
2. `002_seed_templates.sql` — Initial template data
3. `003_seed_showcase_templates.sql` — 12+ showcase templates
4. `004_rename_skillforge_to_skillsmith.sql` — Naming migration

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **UI/Animation** | Framer Motion |
| **Code Editor** | Monaco Editor |
| **3D Graphics** | Three.js + React Three Fiber |
| **Auth & Database** | Supabase (PostgreSQL + Auth) |
| **AI** | Google Generative AI (Gemini 2.5 Flash) |
| **Analytics** | PostHog, Vercel Analytics, Umami |
| **Deployment** | Vercel |

---

## Project Structure

```
skillsmith/
├── app/
│   ├── (app)/                  # Authenticated routes
│   │   ├── dashboard/          # User's skill library
│   │   ├── skills/
│   │   │   ├── new/            # Skill creation wizard
│   │   │   └── [id]/
│   │   │       ├── edit/       # Guided + markdown editor
│   │   │       └── test/       # Split-pane testing
│   │   └── templates/          # Forked templates
│   ├── (auth)/                 # Login / signup
│   ├── api/claude/             # AI endpoints (draft, test, suggest, evaluate)
│   ├── explore/                # Public template gallery
│   └── try/                    # Anonymous try mode
├── components/
│   ├── editor/                 # Editor shell, guided mode, markdown mode
│   ├── playground/             # Split comparison, test suites, chat panes
│   ├── dashboard/              # Skill cards, grid layout
│   ├── templates/              # Template gallery components
│   └── ui/                     # Design system (Button, Input, Card, etc.)
├── lib/
│   ├── skill-parser/           # Parse + serialize SKILL.md format
│   ├── claude/                 # AI client, prompts, rate limiting
│   ├── supabase/               # Auth + database clients
│   └── hooks/                  # React hooks (editor sync, data fetching)
└── supabase/migrations/        # Database schema + seed data
```

---

## API Endpoints

| Endpoint | Method | Description | Rate Limit |
|---|---|---|---|
| `/api/claude/draft` | POST | Generate a skill from a description | 5/hr anon, 50/hr auth |
| `/api/claude/test` | POST | Run split-pane comparison | 10/hr anon, 50/hr auth |
| `/api/claude/suggest` | POST | AI suggestions for a section | Token-limited |
| `/api/claude/suggest-name` | POST | Auto-generate skill name | Token-limited |
| `/api/claude/evaluate` | POST | Score test responses (0–100) | Token-limited |
| `/api/claude/generate-tests` | POST | Generate 3 test cases | Token-limited |

---

## Database Schema

Four core tables with row-level security:

- **`profiles`** — User data (extends Supabase auth)
- **`skills`** — Skill documents with title, content, visibility, category, fork tracking
- **`test_cases`** — Test prompts, expected behaviors, scores, and results
- **`api_usage`** — Per-user token consumption and request counts

---

## License

Private repository. All rights reserved.

---

<p align="center">
  Made for builders who ship with <strong>Claude</strong>
</p>
