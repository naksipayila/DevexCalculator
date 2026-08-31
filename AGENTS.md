# Project

DevEx Calculator: Robux↔USD dönüştürücü (sabit $0.0038/R$), canlı USD/TRY çevirisi ve %30 Roblox komisyonu için net→brüt (gross price) hesaplayan, bağımlılıksız statik PWA.

# Critical Rules

- Use the minimum context needed for the current task; do not preload all documentation.
- Inspect current implementation, contracts, and tests before changing behavior.
- Search for an existing abstraction before adding a helper, interface, adapter, validator, serializer, error type, state container, factory, or test helper.
- Treat documentation as current-state engineering memory, not history. Replace or remove obsolete truth; never append correction notes.
- When docs, tests, and implementation disagree, investigate the contract and evidence before deciding which is stale.

# Repository Map

- `index.html`: markup, a11y attributes, cache-busted asset refs.
- `app.js`: all state, calculation logic, rate fetching, persistence, event handlers.
- `style.css`: design tokens, dark/light themes, layout.
- `sw.js`: cache-first app-shell service worker (versioned with `app.js`).
- `manifest.webmanifest`: PWA manifest.
- `docs/`: lazily loaded project knowledge.
- `opencode.json`: OpenCode session-context settings.
- `.opencode/commands/integrate-project.md`: template fill command that populates this template's placeholder docs (`AGENTS.md`, `docs/*.md`) with project truth, either by analyzing an existing host codebase (evidence-driven) or via a staged interview for a new project (user-stated); accepts `report-only` and optional `new` / `existing`.
- `.opencode/commands/optimize-project.md`: explicit project audit command (dead code, duplication, unused dependencies, redundant files and folders, documentation maintenance); accepts a path or `docs-only` / `code-only` / `report-only`.
- `.opencode/commands/simplify-project.md`: explicit code-simplification audit (hand-rolled logic with an existing abstraction, needlessly complex control flow, wrong data structures, profile-evidenced performance); behavior-preserving rewrites only, cross-file duplication stays with `/optimize-project`; accepts a path or `report-only`.

# Quick Commands

No install, build, lint, or test commands are established. Serve statically for manual checks (e.g. `python -m http.server 8000`; service worker needs a secure context). Validation is manual via the Playwright MCP configured in `opencode.json`. See `docs/WORKFLOW.md`.

# Documentation Router

Project scope and terminology: `@docs/PROJECT.md`

Architecture, boundaries, and ownership: `@docs/ARCHITECTURE.md`

Implementation conventions: `@docs/CONVENTIONS.md`

Build, tooling, and validation: `@docs/WORKFLOW.md`

When a task matches a route, use available read/file tools to load that document before relying on it. Read only relevant documentation.

# Task Protocol

- Small local change: read `AGENTS.md`, relevant source, and relevant tests when needed.
- Feature or subsystem change: also load routed docs, callers/consumers, and relevant tests.
- Architectural refactor: load `docs/ARCHITECTURE.md`, applicable routed docs, affected dependency relationships, and tests.
- Build or tooling change: load `docs/WORKFLOW.md` and relevant configuration.

Scale context by change risk. Do not infer architecture or commands that are not evidenced by the repository.

# Documentation Maintenance

After meaningful code changes, update documentation only if durable project knowledge changed. Update the smallest canonical document, then remove obsolete or duplicated text and compact that document.

Use local documentation GC for normal changes. Use `/integrate-project` when this template has been copied into an existing codebase or a new project is starting and its placeholder docs need project truth. Use `/optimize-project` for broad cleanup after major refactors, reorganizations, completed migrations, subsystem removal, clear documentation drift, or to audit accumulated dead code, duplication, and redundant files and folders. Use `/simplify-project` for a behavior-preserving code-quality pass: accumulated verbose patterns, hand-rolled logic with an existing abstraction, or a profile-evidenced hot spot.
