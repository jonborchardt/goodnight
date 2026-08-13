# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server with HMR
- `npm run build` — type-check (`tsc -b`) then bundle with Vite
- `npm run lint` — Oxlint (config in `.oxlintrc.json`)
- `npm run preview` — serve the production build locally

No test framework is set up.

## Architecture

Single-page React 19 + TypeScript app built with Vite, using MUI (`@mui/material` with Emotion) for UI. Entry point is `src/main.tsx`, which renders `src/App.tsx` inside `StrictMode` with MUI's `CssBaseline`.

Deployed to GitHub Pages via `.github/workflows/deploy.yml` on every push to `main`. Vite's `base` is set to `/goodnight/` in `vite.config.ts` to match the Pages URL — keep asset/router paths compatible with that base.

## Building the game

The game (Goodnight, Little Town) is built plan-by-plan under an orchestrator. When the user says "run the orchestrator" or "resume the orchestrator", read `docs/superpowers/plans/ORCHESTRATOR.md` and follow its Run protocol. Specs live in `docs/superpowers/specs/`.
