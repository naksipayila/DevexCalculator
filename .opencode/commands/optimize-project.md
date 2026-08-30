---
description: Audit the project for dead code, duplication, unused dependencies, redundant files and folders, and documentation drift. Two-phase: report with evidence, confirm by number, apply. Accepts a path or docs-only / code-only / report-only.
---

## Scope

User input: `$ARGUMENTS`. Empty input means a full audit. A path restricts detection and application to that subtree; reading outside the scope is allowed for evidence, but never write outside it. `docs-only` runs only the documentation phase. `code-only` skips proactive documentation work but still syncs documentation invalidated by approved changes. `report-only` stops after the findings report: no application and no documentation writes. If the input is neither a known mode nor an existing path, ask before proceeding.

## Inventory

Start by reading `AGENTS.md` and inventorying the documentation it routes to. Record the dependency manifests, ignore rules, and entry points the stack exposes. Record `git status --short` when a git worktree exists; skip git steps otherwise. Treat existing worktree changes as user-owned: do not discard, reset, revert, stage, or overwrite them. If an intended change conflicts with unclear existing work, stop and ask. A no-change result is valid.

## Detect

Work stack-agnostically. Prefer the project's own tooling (lint, typecheck, compiler unused-symbol rules, dependency audit) discovered through `docs/WORKFLOW.md` and tracked configuration over text search alone. Read source, tests, and tracked project configuration only as needed to verify a claim; do not open, print, copy, or report global configuration, credentials, or live API data.

- Dead code: unused exports, symbols, or whole modules. Before declaring anything unused, check dynamic usage: reflection, dependency injection, route or plugin registration, config-driven imports, barrel re-exports, entry points, scripts, fixtures, and generated or vendored code.
- Duplication: repeated helpers, logic, validation, serialization, or test patterns, including near-duplicate whole files. Consolidate toward an existing canonical abstraction; do not add a new helper, interface, adapter, or wrapper to fix duplication.
- Unused dependencies: manifest entries with no real import or tooling usage. Check build, test, lint, plugin, and framework-driven usage before flagging.
- Stale configuration: unused scripts entries, config keys, and ignore rules that no longer map to anything.
- Redundant files: unreferenced orphan files, committed build artifacts, backups, and temp files. Verify a file is not an entry point, configuration, template, fixture, or documentation asset first.
- Redundant folders: empty directories and leftover single-file directories from completed refactors or removed subsystems.
- Orphan documentation: files under `docs/**` that no `AGENTS.md` route references.

Evidence hierarchy: project tooling output, then reference searches plus a verified contract, then text search alone. Text search alone is never sufficient evidence for `SAFE-TO-REMOVE`; it caps out at `NEEDS-CONFIRMATION`.

## Classify

Label every finding `SAFE-TO-REMOVE`, `NEEDS-CONFIRMATION`, or `KEEP` with a reason. Every label requires cited evidence. Report at most the fifteen highest-impact findings per category, ranked by impact times evidence strength; note the count of deferred findings and suggest a follow-up run for them. Do not report a finding without evidence, and do not soften an unevidenced guess into `SAFE-TO-REMOVE`.

## Confirm

Present findings in a Turkish numbered table: `# | kategori | konum | kanıt özeti | sınıf | önerilen aksiyon`. Approval is explicit and per-item, for example `uygula 1,4,7` or `uygula tüm SAFE`; silence is never approval, and no source, file, folder, tooling, or configuration change may happen before it. Ask separately about each selected `NEEDS-CONFIRMATION` item. Documentation GC does not require approval unless the mode is `report-only`. Never change `.opencode/**`, global configuration, or release and install assets.

## Apply

Apply only approved items, smallest safe change first. Without a git worktree, removals are unrecoverable: warn once, then confirm every deletion individually; bulk `SAFE-TO-REMOVE` sweeps are forbidden. After applying, re-scan only the directly affected area once for cascading dead code and unused dependencies; new findings re-enter the Confirm phase instead of being applied automatically.

## Document

Retain accurate, durable rationale and canonical ownership. Update or remove text only with evidence that it is obsolete, duplicated, or superseded; do not delete routed documentation merely to reduce context. When documentation, tests, and implementation disagree, investigate the contract before deciding which is stale. Repair verified broken routes and links. After applying changes, update every routed document that the changes invalidate, then compact that document.

## Validate & report

Validate changed paths, symbols, commands, routes, and links; run `git diff --check` when in a git worktree; then review `git diff` and `git status --short` for scope or formatting churn. Run project validation commands only when defined in `docs/WORKFLOW.md`; otherwise state that none are established. Do not run builds or releases.

Report the scope and mode reviewed, the findings table with evidence and classification, approved and rejected items, material changes or deletions, documentation updates, validations run or skipped, deferred findings, unresolved items, and any no-change decision concisely.

Keep the task instructions and technical work in English. Write all user-facing output — clarifying questions, approval requests, the findings table, and reports — in Turkish. Preserve code, commands, paths, symbols, and literal tool output where appropriate.
