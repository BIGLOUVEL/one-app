# ONE — Focus Operating System

An execution OS built around radical focus and causal certainty. Based on "The ONE Thing" methodology.

## What is ONE?

ONE is not a task manager. It's a decision validation system that ensures you're doing the right thing, at the right time, for the right reason.

**Core question:** "Is the action I'm doing right now the single best use of my time to move toward my goal?"

## Core Systems

- **Domino** — Objective progress proof (1 session = 1 domino)
- **4-1-1** — Time horizon alignment
- **GPS** — Causal chain: Goal → Priority → Strategy
- **Focus** — One action per session, clear success or failure
- **66 Days** — Identity formation through consistency
- **Shield** — Attention protection
- **Review** — Reality over comfort

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** Zustand
- **UI:** Radix UI + shadcn/ui
- **Animation:** Framer Motion

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── page.tsx              # Landing
├── app/
│   ├── page.tsx          # Dashboard
│   ├── define/           # Objective cascade
│   ├── focus/            # Focus sessions
│   ├── 411/              # 4-1-1 planning
│   ├── gps/              # One-page plan
│   ├── habit/            # 66-day challenge
│   ├── shield/           # Four Thieves
│   ├── review/           # Weekly review
│   └── settings/         # Preferences
components/
├── app/                  # Feature components
├── ui/                   # Base components
└── theme-provider.tsx    # Theme system
store/
└── useAppStore.ts        # Central state
lib/
├── types.ts              # Type definitions
└── utils.ts              # Utilities
```

## Design

Two themes available:
- **Modern** (default) — Dark, electric green accents
- **Elegant** — Warm paper, terracotta accents

## Documentation

- `ONE_CONSTITUTION.md` — Product guardrails (mandatory)
- `CLAUDE.md` — AI development guidance
- `DESIGN_PRINCIPLES.md` — Visual design rules
