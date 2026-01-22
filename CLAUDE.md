# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Constitution (MANDATORY)

**Read `ONE_CONSTITUTION.md` first.** It overrides all other instructions.

Key constraints:
- ONE is an execution OS, not a productivity app
- Radical reduction: one objective, one priority, one action
- AI outputs must be factual, direct, minimal — never motivational
- 7 core systems are locked: Domino, 4-1-1, GPS, Focus, 66 Days, Shield, Review
- Before any output, apply the 5-question decision filter

## Project Overview

ONE is a **Focus Operating System** based on "The ONE Thing" methodology by Gary Keller. It enforces single-objective focus through the "Lock Principle" — users cannot create a new objective until the current one is completed or failed.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS with CSS variables for theming
- **State:** Zustand with localStorage persistence
- **UI:** Radix UI primitives + shadcn/ui components
- **Animation:** Framer Motion + GSAP
- **Icons:** Lucide React

## Architecture

### Routing Structure

```
/                    Landing page (marketing)
/app                 Dashboard (locked objective display)
/app/define          Objective cascade wizard (someday → right-now)
/app/focus           Focus session with bunker mode
/app/411             4-1-1 weekly planning
/app/gps             One-page goal plan
/app/habit           66-day habit challenge tracker
/app/shield          Four Thieves assessment
/app/review          Weekly reflection
/app/settings        Theme selection (Modern/Elegant)
```

### State Management

Central store in `store/useAppStore.ts` manages:
- `objective` — The current locked ONE Thing with cascade (someday → year → month → week → today → rightNow)
- `sessions` — Focus session history
- `habitChallenge` — 66-day tracking
- `dominoChain` — Momentum visualization (completed sessions as dominoes)
- `contractMeter` — Commitment tracking (tension rises with inactivity)

### Theming System

Two UI themes defined in `app/globals.css`:
- **Modern** (default): Dark background, electric green accents
- **Elegant**: Warm paper tones, terracotta accents

Theme is toggled via `components/theme-provider.tsx` using the `.theme-elegant` class on `<html>`.

### Key Patterns

**Goal Cascade:** Each objective flows from long-term vision to immediate action:
```
Someday Goal → Year Goal → Month Goal → Week Goal → Today Goal → Right-Now Action
```

**Bunker Mode:** Focus sessions require a checklist (phone silent, notifications off, door closed, noise handled) before starting.

**Domino Chain:** Visual momentum tracker — each completed focus session is a domino falling.

**Contract Meter:** Commitment gauge with states (stable → tension → broken → fulfilled).

## Key Files

| File | Purpose |
|------|---------|
| `store/useAppStore.ts` | Central Zustand store with all app state |
| `lib/types.ts` | TypeScript interfaces for all data models |
| `app/globals.css` | Design tokens and theme definitions |
| `tailwind.config.ts` | Extended theme (fonts, colors, animations) |
| `components/theme-provider.tsx` | Theme context and switching logic |
| `components/app/app-nav.tsx` | Sidebar navigation with collapse states |

## Type Definitions

Core types in `lib/types.ts`:
- `Objective` — The locked goal with full cascade
- `FocusSession` — Timer data, distractions, reflections
- `HabitChallenge` — 66-day tracking with streaks
- `DominoChain` — Momentum (total/completed dominos)
- `ContractMeter` — Commitment state and tension level
- `GPSPlan` — Goal + Priorities + Strategies structure
- `FourOneOne` — 4-week planning with outcomes

## Design Principles

See `DESIGN_PRINCIPLES.md` for:
- Core philosophy ("Focus OS, not task manager")
- Theme specifications
- Red flags for design decisions
- When to refuse requests that dilute the vision
