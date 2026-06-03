---
applyTo: "**/*.ts,**/*.tsx,**/*.mts,**/*.cts"
---

# TypeScript instructions

## Type safety

- Do not use `any` (prefer `unknown` + narrowing).
- Keep explicit access modifiers (`public`/`private`/`protected`) and explicit function return types.
- Use `import type` for imports that are only used as TypeScript types, especially from heavy Angular/Syncfusion/Three.js packages or feature modules. Do not accidentally turn a type dependency into a runtime dependency that pulls code into an Angular chunk.
- If an imported symbol is used only in annotations, generic parameters, `satisfies`, or interface/type declarations, it must be type-only. Keep runtime imports separate from type-only imports when a package exports both.

## Readonly fields

- Mark every class field `readonly` when the reference is never reassigned after initialization. This is a hard requirement, not a style preference — non-`readonly` fields imply mutability and mislead readers.
- Apply to **every** Angular DI / signal / resource handle. The field holds a stable reference even when the underlying value changes:
  - `inject(...)` results — services, tokens, `ChangeDetectorRef`, `DestroyRef`, `Injector`, etc.
  - Signal factories: `signal(...)`, `computed(...)`, `linkedSignal(...)`, `model(...)`, `model.required(...)`.
  - Input/output factories: `input(...)`, `input.required(...)`, `output(...)`.
  - Query factories: `viewChild(...)`, `viewChild.required(...)`, `viewChildren(...)`, `contentChild(...)`, `contentChildren(...)`.
  - Resource handles: `resource(...)`, `httpResource(...)`, `rxResource(...)`, `rxGuardedResource(...)`.
  - Constants assigned in the field initializer or constructor and never written to again (maps, sets, frozen config, format strings, etc.).
- The `readonly` modifier locks the **reference**, not the value behind it — a `readonly signal<T>` still lets you call `.set(...)` / `.update(...)`. Use `readonly` even on writable signal containers; only drop it if the field itself is reassigned (extremely rare).
- Do **not** add `readonly` to fields that are genuinely reassigned later (e.g. `protected localLoading = true` mirrored from a signal inside an `effect`, mutable buffers, lifecycle-set blob URLs).
- When in doubt: grep the class for assignments to the field outside its declaration / constructor. If none, it is `readonly`.

## File organization

- Prefer “one concept per file” (for example one class/service/helper per file), unless co-location clearly improves readability.
- Before adding a new utility/helper function, check whether the behavior already exists in the touched area, a shared lib, or an installed dependency. Prefer reusing proven utilities over reimplementing common transformations.

## API documentation

- Add JSDoc for exported/public APIs.
- Document non-obvious state flows, side effects, and edge cases.
