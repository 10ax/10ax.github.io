---
applyTo: "**"
excludeAgent: "code-review"
---

# Docs & MCP tools (avoid outdated syntax)

## General rule

- For framework/library API questions and recently introduced features, prefer the most relevant MCP docs/examples tools before relying on memory.
- If a technology-specific MCP tool is available in the current session, use it as source of truth for current syntax and best practices.
- If the relevant MCP tool is not available in the current session, ask the user to enable it before proceeding with guidance that depends on new APIs.

## Angular / Syncfusion

- For Angular API questions or new Angular v21 features, use the Angular MCP tools (`mcp_angular-cli_get_best_practices`, `mcp_angular-cli_search_documentation`, `mcp_angular-cli_find_examples`).
- For Syncfusion questions, use the `SyncfusionAngularAssistant` tool (`mcp_syncfusion-an_SyncfusionAngularAssistant`).
