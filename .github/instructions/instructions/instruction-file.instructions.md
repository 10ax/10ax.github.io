---
applyTo: ".github/instructions/**/*.md"
---

# Copilot instruction file conventions

## YAML front matter rules

At the start of the file, create a frontmatter block containing the `applyTo` keyword. Use glob syntax to specify what files or directories the instructions apply to.

For example:

```yaml
---
applyTo: "app/models/**/*.rb"
---
```

You can specify multiple patterns by separating them with commas. For example, to apply the instructions to all TypeScript files in the repository, you could use the following frontmatter block:

```yaml
---
applyTo: "**/*.ts,**/*.tsx"
---
```

To match all files in all directories, use:

```yaml
---
applyTo: "**"
---
```

**Do not use brace expansion syntax (e.g., `"**/*.{ts,tsx}"`) in the `applyTo` field.**
Always use a comma-separated list of patterns (e.g., `applyTo: "**/*.ts,**/*.tsx"`).

Optionally, to prevent the file from being used by exactly one Copilot agent—either Copilot coding agent or Copilot code review—add the `excludeAgent` keyword to the frontmatter block. Use either "code-review" or "coding-agent".

For example, the following file will only be read by Copilot coding agent.

```yaml
---
applyTo: "**"
excludeAgent: "code-review"
---
```

If the `excludeAgent` keyword is not included in the frontmatter block, both Copilot code review and Copilot coding agent will use your instructions.

## Best practices

- Use double quotes for the `applyTo` glob pattern list.
- Keep the front matter at the very top of the file, with no blank lines before it.
- Only use `excludeAgent` when you want to prevent a specific agent from applying the instructions in this file.
- Document the intent and scope of the instruction file clearly after the front matter.

## Rationale

Consistent front matter ensures Copilot agents can correctly interpret and apply instructions, and enables precise targeting or exclusion of rules for different agent types.
