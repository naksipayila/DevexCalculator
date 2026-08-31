---
description: Audit code for behavior-preserving simplifications: hand-rolled logic replacing an existing abstraction, stdlib, or framework feature; needlessly complex control flow; clearly wrong data structures; and profile-evidenced performance hot spots. Two-phase: report with before/after evidence, confirm by number, apply. Accepts a path or report-only.
---

## Scope

User input: `$ARGUMENTS`. Empty input means a full scan. A path restricts detection and application to that subtree; reading outside the scope is allowed for evidence, but never write outside it. `report-only` stops after the findings report: no source changes. If the input is neither `report-only` nor an existing path, ask before proceeding. This command changes code only: it never reformats, renames, restyles, or touches files for reasons outside a finding. Documentation is written only when an applied change invalidates it.

## Inventory

Start by reading `AGENTS.md` and the routed `docs/CONVENTIONS.md` and `docs/WORKFLOW.md` to learn the project's actual idioms and validation commands. Record entry points, generated or vendored code boundaries, and test layout. Record `git status --short` when a git worktree exists; skip git steps otherwise. Treat existing worktree changes as user-owned: do not discard, reset, revert, stage, or overwrite them. Never touch `.opencode/**`, `opencode.json`, lockfiles, generated, or vendored code.

## Detect

Work stack-agnostically. Read function bodies, their callers, and their tests as needed to verify a claim; do not open, print, copy, or report global configuration, credentials, or live API data. A finding is only valid when the current code works and a rewrite preserves behavior; correctness bugs belong to a normal task, not here.

- Unused existing solutions: hand-rolled logic where an existing project utility, stdlib facility, or framework feature already provides the same behavior. Cite the exact existing abstraction; do not introduce a new helper, interface, adapter, or wrapper to fix verbosity.
- Complex control flow: deep nesting that flattens with early returns or guards, redundant boolean logic, and copy-paste branching that one existing project pattern already expresses, but only when `CONVENTIONS.md` or repeated code proves the pattern is idiomatic here.
- Wrong data structure or algorithm: a plainly better fit for the usage (membership tests on lists in hot paths, quadratic scans with an obvious index, and similar). State the complexity class change; do not report micro-optimizations with no measurable or structural benefit.
- Performance: report a hot spot only with profiler, benchmark, or compiler-tooling output defined in `WORKFLOW.md` or tracked project configuration. Without such tooling, this category stays closed; never claim "faster" on reasoning alone.
- Swallowed or duplicated error handling: manual checks where the framework already propagates or validates, only when the rewrite is provably equivalent under existing tests.

Cross-file duplication is out of scope: it belongs to `/optimize-project`. This command owns in-place, function-level rewrites.

Evidence hierarchy: existing tests plus the cited abstraction or tooling output, then a verified contract (callers, signatures, framework docs in the repository), then reading code alone. Text search or reading alone is never sufficient for `SAFE-TO-REWRITE`; it caps out at `NEEDS-CONFIRMATION`.

## Classify

Label every finding `SAFE-TO-REWRITE`, `NEEDS-CONFIRMATION`, or `KEEP` with a reason. `SAFE-TO-REWRITE` requires both a concrete replacement and behavior coverage: tests that cover the code, or a project validation command from `WORKFLOW.md` that exercises it. Unevidenced test or performance claims are not findings: an uncited guess stays out of the report rather than becoming `SAFE-TO-REWRITE`. Report at most the fifteen highest-impact findings, ranked by impact times evidence strength; note the count of deferred findings and suggest a follow-up run.

## Confirm

Present findings in a Turkish numbered table: `# | kategori | konum | mevcut → önerilen | kanıt | sınıf`. The proposal column names the existing abstraction or cites the profile evidence, never just "cleaner". Approval is explicit and per-item, for example `uygula 2,5` or `uygula tüm SAFE`; silence is never approval, and no source change may happen before it. Ask separately about each selected `NEEDS-CONFIRMATION` item.

## Apply

Apply only approved items, one rewrite per finding, smallest safe change first. Preserve public behavior, signatures, and error semantics exactly. After each rewrite, run the covering tests or the relevant `WORKFLOW.md` validation command; if validation fails, revert that item and report it unresolved. Without a git worktree, warn once that reverts are manual. Re-scan only the directly touched function once for newly redundant code; new findings re-enter the Confirm phase instead of being applied automatically.

## Document

Update routed documentation only when an applied rewrite invalidates it: removed helpers, changed idioms, or new validation commands recorded by this run. Keep documentation updates in the smallest canonical document.

## Validate & report

Review `git diff` and `git status --short` for scope or formatting churn; run `git diff --check` when in a git worktree. Confirm every applied diff touches only finding locations. Report the scope and mode reviewed, the findings table with evidence and classification, approved and rejected items, applied rewrites with validation results, reverts, documentation updates, deferred findings, unresolved items, and any no-change decision concisely. When nothing qualifies, say so plainly: a no-change result is valid.

Keep the task instructions and technical work in English. Write all user-facing output — clarifying questions, approval requests, the findings table, and reports — in Turkish. Preserve code, commands, paths, symbols, and literal tool output where appropriate.
