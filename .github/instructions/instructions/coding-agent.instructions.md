---
applyTo: "**"
excludeAgent: "code-review"
---

# Copilot coding agent (implementation) instructions

## Principles

- Follow the HITL protocol in `.github/instructions/hitl.instructions.md` for prompt structure and end-of-response behavior.

## Architecture & boundaries

- Identify the domain/bounded context first; keep changes contained within that backend or the corresponding frontend domain folder.


## Implementation quality

- Use descriptive, intention-revealing names; re-check names and comments after refactors. Names should match the value's actual role, not the larger object or workflow it is later used to create.
- Keep units small and single-purpose; extract helpers only when it reduces duplication without adding indirection.
- Avoid magic numbers/strings when they obscure intent (prefer constants/enums).
- Validate inputs at boundaries; fail fast with meaningful errors; don’t swallow exceptions.
- Prefer self-documenting code; add comments only for “why” and tricky edge cases.
- Remove empty comments and stale placeholder comments instead of leaving them behind.
- Do not leave generic TODOs or open questions in code without enough detail to be actionable; include the missing work, constraint, or tracking reference.

## Toolchain expectations

- Use the repo’s pinned toolchain versions from `.github/copilot-instructions.md` → “Technology stack & versions”.
- When invoking Nx through npm, always use `npm exec nx -- <command>` (include `--` immediately after `nx`).

## CI replication (what must stay green)

- `npm ci --no-audit --no-fund`
- `npm exec nx -- affected:build --base=origin/<base_ref> --exclude=tag:ci-exclude`
- `npm exec nx -- affected:test --base=origin/<base_ref> --exclude=tag:ci-exclude --exclude=tag:test-exclude`

## Developer "golden path" commands

- Bootstrap: from repo root run `npm ci`.
- For less flaky agent logs (PowerShell), set:
  - `$env:NX_TUI='false'`
  - `$env:NX_DAEMON='false'`

## PowerShell command hygiene

- Prefer PowerShell-native syntax in examples and execution (`$env:NAME='value'`, `Test-Path`, `Get-ChildItem`, `Select-String`).
- For multi-step commands in one line, chain with `;` and keep a single shell context (avoid spawning nested shells like `powershell -c ...`).
- Quote paths that may contain spaces (`"C:\path with spaces\file.csproj"`).
- In PowerShell, quote git refs that use braces (for example `git reset --hard 'HEAD@{upstream}'`); avoid unquoted `@{u}` shorthand.
- Before running file-path-dependent commands, verify the target exists with `Test-Path` to fail fast with clear diagnostics.

### XMate Web App (frontend)

- Build (dev): `npm exec nx -- build xmate --configuration development`
- Serve (dev): `npm exec nx -- serve xmate --configuration development`
- Lint: `npm exec nx -- lint xmate`

Notes:

- `xmate:build`/`xmate:serve` depend on `update-translations`, which runs `node merge-i18n.js`.
- `xmate:serve` also runs `ensure-extensions` (`node tools/ensure-extensions.js`); if VS Code CLI (`code`) is missing it may warn and continue.

### .NET backends

Prefer Nx targets so output paths and caching remain consistent:

- Planner build: `npm exec nx -- build planner`
- Planner ingestion build: `npm exec nx -- build planner-ingestion`
- 3D viewports builds: `npm exec nx -- build viewports3d-apiservice` / `npm exec nx -- build viewports3d-apphost`

If you must run dotnet directly, run it against the specific `.csproj` under the service folder.

### AI subtree runtimes (`apps/backend/ai/**`)

This subtree contains mixed runtimes (Python and Node/TypeScript), including `agents/`, `libs/`, and `mcp/`.

- Determine the project runtime from local manifests (`package.json`, `pyproject.toml`, `requirements*.txt`) before running commands.
- For Node/TS packages: do not assume root `node_modules` contains their devDependencies; run `npm ci` in the package directory before `npm run build`.
- For Python packages/services: use the project-local virtual environment and dependency files in that folder; do not assume root-level Node tooling applies.

## Layout pointers

- XMate app config: `apps/frontend/xmate/project.json`
- XMate source: `apps/frontend/xmate/src/app/**`
- Shared frontend libs: `libs/frontend/**`
- Nx config: `nx.json`, per-project `project.json`
- TypeScript paths: `tsconfig.base.json`
- ESLint flat config: `eslint.config.mjs`
