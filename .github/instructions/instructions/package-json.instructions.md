---
applyTo: "**/package.json"
---

# package.json review instructions

## Version synchronization

- The workspace **root** `package.json` is where library and toolchain version updates are made; it is the authoritative source for the actual pinned values of Node.js, npm, Nx, Angular, TypeScript, and other core toolchain versions.
- When the root `package.json` is updated with new versions, `.github/copilot-instructions.md` must also be updated to reflect those changes, so AI agents always read accurate pinned versions from that file without needing to parse `package.json`.
- For packages that participate in the shared Node/Nx workspace toolchain (for example, the main frontend app and shared frontend/libs), keep their toolchain and shared dependency versions aligned with the root `package.json` unless a project-specific override is explicitly justified and documented.
- Project-local `package.json` files that intentionally use an isolated toolchain (for example, standalone backends or tools with a different `packageManager` such as `pnpm`) are exempt from global version synchronization, but should remain internally consistent within their own subtree.
- When adding or updating a dependency in a package that uses the shared workspace toolchain, check for existing versions in the repo (starting from the root `package.json`) and align to the canonical version unless a project-specific override is justified and documented.

## Review checklist

- [ ] Where applicable, Node.js, npm, Nx, Angular, TypeScript, and other core tool versions in project-local `package.json` files match the workspace root `package.json`
- [ ] When root `package.json` versions change, `.github/copilot-instructions.md` is updated to reflect those changes
- [ ] No version drift between the root and project-local `package.json` files for shared dependencies in packages that use the shared workspace toolchain
- [ ] All changes to versions are justified and, if needed, documented in the PR description
- [ ] No duplicate or unnecessary dependencies are introduced
- [ ] If `package.json` is changed and the project uses a committed lockfile (for example, `package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock`), that lockfile is regenerated using the appropriate package manager (no manual edits)

## Rationale

Keeping versions in sync for the shared workspace toolchain avoids subtle build, test, and runtime issues, and ensures the monorepo remains maintainable and predictable. The root `package.json` is where version updates are made; `.github/copilot-instructions.md` must be kept in sync so AI agents always read accurate pinned versions from that single source of truth without needing to parse `package.json` directly.
