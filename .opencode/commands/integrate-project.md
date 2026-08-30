---
description: Fill this starter template's placeholder markdown documents with project truth, in either of two modes: integrate into an existing host project by analyzing the codebase with evidence, or bootstrap a new project through a staged interview where user statements are the source. Two-phase: draft with evidence, confirm by number, apply. Accepts `report-only` and optional `new` / `existing`.
---

## Scope

User input: `$ARGUMENTS`. Empty input means a full run in the auto-detected mode. `report-only` stops after the draft proposal: no writes at all. `new` or `existing` forces that mode; otherwise detect it in Discover. If the input contains neither a known mode nor `report-only`, ask before proceeding. Write targets are only the template documents: `AGENTS.md`, `docs/PROJECT.md`, `docs/ARCHITECTURE.md`, `docs/CONVENTIONS.md`, `docs/WORKFLOW.md`. In `existing` mode, the host project's own markdown (README, `**/*.md`, changelogs, ADRs, comments) is read-only evidence: never rewrite it as a target. This command only fills documentation: it never scaffolds code, never creates build or dependency configuration, and never runs installers or generators. Reading anywhere in the repository is allowed for evidence.

## Detect mode

Inventory the repository against the template's own files (`AGENTS.md`, `opencode.json`, `.opencode/**`, `docs/**`). If it contains real source, manifests, lockfiles, tracked configuration, or committed history beyond the template files, run `existing` mode: the codebase is the source of truth. If the repository holds only the template files or is otherwise empty, run `new` mode: the user is the source of truth. A folder that merely contains the template alongside untracked scratch files is still `new` mode; state the ambiguity and ask when unsure. If no template document exists at all, stop and ask: this command assumes the template has been copied into the target project.

## Existing mode: Discover and Analyze

Locate every template document listed in Scope and record whether it is present, missing, or moved. Read `AGENTS.md` first to recover the Documentation Router targets and Repository Map. For each present template document, identify unfilled placeholder sections: text asserting that something "is not established", empty sections, and any prose that does not describe the actual host project.

Work stack-agnostically. Build evidence for four dimensions, citing where each claim comes from:

- Scope and terminology (`PROJECT.md`): what the product does, its domain nouns, capabilities, and explicit non-goals. Prefer README, package metadata, feature modules, and public entry points.
- Architecture (`ARCHITECTURE.md`): technology stack, layers, module boundaries, ownership, data flow, external services. Prefer directory structure, imports, config, and contracts over prose.
- Conventions (`CONVENTIONS.md`): naming, file layout, error handling, testing style, formatting, and idioms actually present in the code. Prefer repeated real patterns over aspirational docs.
- Workflow (`WORKFLOW.md`): install, build, lint, typecheck, test, and run commands. Prefer scripts and task runners tracked in manifests and CI over guessed commands.

Evidence hierarchy: source code, manifests, lockfiles, and tracked configuration first; then the host project's own tooling output; then its markdown prose last. Prose alone is never sufficient to fill an architecture or workflow claim as fact: it caps out at `NEEDS-CONFIRMATION`. Do not open, print, copy, or embed credentials, secrets, or live API data. Do not invent commands, architecture, or scope that the repository does not evidence: an unevidenced section stays an honest placeholder rather than receiving fabricated truth.

## New mode: Interview

There is no codebase to mine, so gather truth through a staged Turkish interview, one dimension at a time in this order: scope and terminology, then stack and architecture, then conventions, then workflow commands. Ask a small batch of focused questions per dimension, adapt later questions to earlier answers, and stop a dimension as settled once the user's intent is specific enough to write down. Treat explicit user statements as a legitimate source (`USER-STATED`); vague or hedged answers are `NEEDS-CONFIRMATION` and must not be hardened into facts. Never guess a stack, tool, or command the user did not state, and never imply that scaffolded code, installed dependencies, or configured tooling exist: record workflow commands as stated intent, not as verified tooling. If any real code or configuration is present, switch to `existing` mode analysis for those dimensions instead of asking about them.

## Draft & Confirm

Present a Turkish numbered proposal table: `# | dosya | bolum | doldurulacak icerik ozeti | kanit/kaynak | sinif`. The evidence column names its kind: code, manifest, config, prose, or user statement. Classify each item `EVIDENCED` (safe to write on approval), `USER-STATED` (explicit user decision in `new` mode; safe to write on approval), or `NEEDS-CONFIRMATION` (weak, single-source, or hedged evidence; ask item by item). Approval is explicit and per-item, for example `uygula 1,3,5` or `uygula tum EVIDENCED`; silence is never approval, and no file changes before it. Preserve the template's fixed scaffold: Critical Rules, Task Protocol, and the Documentation Router structure stay unless the host project disproves them; do not delete a routed document to reduce context. Cap the proposal at the fifteen highest-impact sections per file, ranked by evidence strength; note deferred items and suggest a follow-up run.

## Fill

Apply only approved items. Replace placeholder prose with current-state project truth, keeping each routed document compact and specific. Use the smallest canonical document: put scope in `PROJECT.md`, boundaries in `ARCHITECTURE.md`, idioms in `CONVENTIONS.md`, commands in `WORKFLOW.md`; do not duplicate a fact across documents. Update the `AGENTS.md` Project summary, Repository Map, and Quick Commands to reflect filled documents. In `new` mode, write `USER-STATED` decisions as project truth exactly as stated, and leave unresolved dimensions as honest placeholders. Never append correction notes or history: overwrite stale placeholder text in place. Do not modify `.opencode/**`, `opencode.json`, global configuration, or host build and release assets.

## Validate & report

After writing, re-read each changed document to confirm no orphaned placeholder remains where content was approved, every Documentation Router target resolves to an existing file, and no fact is duplicated across routed documents. Confirm the diff only touches in-scope template documents. Run host validation commands only when `WORKFLOW.md` now evidences them; otherwise state that none are established. Report the mode used, the files analyzed, sections filled with evidence class, `NEEDS-CONFIRMATION` outcomes, remaining honest placeholders and why, and any follow-up run suggestion, concisely. In `new` mode, recommend re-running this command once real code and tooling exist, so `USER-STATED` claims get verified against evidence.

Keep the task instructions and technical work in English. Write all user-facing output — clarifying questions, the interview, approval requests, the proposal table, and reports — in Turkish. Preserve code, commands, paths, symbols, and literal tool output where appropriate.
