---
applyTo: "**"
excludeAgent: "code-review"
---

# SYSTEM PROTOCOL: HITL-FIRST INTERACTION MODEL
This file only governs how the agent collects user input through the GUI. It does not define general execution strategy, response style, or approval policy outside HITL behavior.

## CARDINAL RULE (NON-NEGOTIABLE)

Every assistant turn MUST end with a fresh GUI prompt. No exceptions other than the explicit terminal choices listed below.

## MANDATORY CLOSING TOOL CALL

- The closing GUI prompt MUST be issued via `vscode_askQuestions` when that tool is available in the current session.
- The last assistant action of every turn must be a `vscode_askQuestions` tool call (except when `vscode_askQuestions` is unavailable or fails after retries, in which case follow the fallback order in this file).
- Plain-text closing questions, summaries, or option lists do not satisfy this requirement.

- The conversation NEVER ends on the assistant's initiative. It only ends when the user, in the most recent GUI prompt answered in the current turn, selects one of these terminal choices: `Task Complete` or `Stop`. A freeform terminal phrase that explicitly says "stop" or "task complete" also qualifies.
- Nothing else is a valid reason to end without a closing GUI prompt. Specifically, the following are NEVER sufficient grounds to skip the closing prompt:
  - The task feels finished.
  - The answer is short, simple, conversational, or informational.
  - A previous turn already had a prompt.
  - A prompt earlier in the current turn was already answered (that prompt is consumed input — see §3 and §3.4).
  - The user's last message was a thank-you, an acknowledgment, a correction, or a follow-up request.
  - The user provided freeform text instead of selecting an option (treat freeform as a non-terminal answer unless it explicitly matches a terminal phrase above).
  - Tool failures, cancellations, or "no tools available" perceptions (retry, fall back, or use the §0.1 no-tool fallback — never silently drop the prompt).
- "Use HITL" means: the LAST user-facing action in the turn is a call to a GUI prompt tool from §0. Plain-text questions, plain-text "let me know if…" sentences, and plain-text option lists DO NOT satisfy this rule.
- If you ever notice yourself about to send a final message without a closing GUI prompt, STOP and issue the prompt first. If you've already sent such a message, treat it as a protocol violation and recover on the very next turn by acknowledging the miss in one short sentence and immediately issuing a fresh GUI prompt.

## 0. Tool Selection

Use whichever GUI prompt tool is available in the current session, following this priority:

1. **`vscode_askQuestions`** — mandatory for closing prompts whenever available (VS Code with Copilot Chat).
2. **Human-in-the-Loop MCP tools** — fallback when `vscode_askQuestions` is not available:
   - `get_user_choice` — present a list of options for the user to pick from.
   - `get_user_input` — collect a short freeform text value.
   - `get_multiline_input` — collect longer or specification-heavy text.
   - `show_confirmation_dialog` — ask a yes/no confirmation question.
   - `show_info_message` — display an informational notice.

   These tools come from the **Human-in-the-Loop** MCP server. Their actual registered names depend on the server prefix in the current session (e.g. `mcp_human-in-the-_get_user_choice`). Match by the suffix above when discovering available tools.

Throughout the rest of this document, **"prompt the user"** means: use the highest-priority tool available from the list above.

## 0.1 No-Tool Fallback
- If none of the GUI prompt tools listed above are available in the current session, state that limitation plainly and use a single concise plain-text question or next-step request only as a last resort.
- As soon as a supported GUI prompt tool becomes available again, resume the HITL protocol defined in this file.

## 1. Use GUI Prompts Instead Of Plain-Text Questions
- Do not ask the user for clarification, confirmation, or next-step decisions in plain chat text.
- When user input is required, prompt the user via the appropriate GUI tool.
- Bundle related missing information into one prompt when practical.

## 2. Prompt Shape
- For known branch choices or next steps, prompt the user with explicit options (include `Other` for custom actions and `Stop` or `Task Complete` when the user may end the interaction).
- For a missing short value, use one freeform prompt.
- For specification-heavy input, use a multiline prompt and place the response template in the prompt message.
- If the user selects `Other` and more detail is needed, follow with one additional prompt to collect the custom action.

## 2.1 Prompt Result Handling
- If the GUI prompt tool returns the user's answer within the same assistant turn, treat that answer as immediately available input and continue the task in that same turn.
- Do not stop at a placeholder such as `Awaiting your selection.` when the tool has already returned a selection.
- Do not restate that the assistant is waiting unless the prompt is actually still pending or the tool failed to return an answer.
- If the returned answer selects a concrete next step, execute or address that step immediately unless the user explicitly asked to stop.
- If the returned answer is a non-terminal choice such as `Continue`, `Review`, `Run`, `Fix`, `Other`, or any concrete follow-up action, that prompt is now consumed input and no longer counts as the closing prompt for the turn.
- After consuming a same-turn prompt result and continuing the task, the assistant must finish that continued work and then issue a new fresh closing GUI prompt before ending the turn.

## 3. Terminal-State Rule
- End every chat interaction with a GUI prompt to the user. This is mandatory and overrides any inclination to "wrap up" with prose.
- When available, the closing GUI prompt must be issued with `vscode_askQuestions`; treat this as mandatory and not optional.
- This applies to substantive work, direct answers, clarifications, blocked states, partial completions, validation failures, conversational replies, error reports, and apologies. There are no content-based exemptions.
- Treat this as a per-turn requirement, not a per-task requirement. A GUI prompt used earlier in the conversation, or answered at the start of the current turn, does not satisfy the closing requirement for the current assistant message.
- For direct answers or final summaries, provide the substantive answer first, then immediately prompt the user for next steps before closing the turn.
- Even when no clarification is needed and the assistant can fully answer autonomously, the turn must still end with a fresh GUI prompt.
- The conversation is open-ended by default. Only an explicit terminal choice from the user (see Cardinal Rule and §3.4) closes it. Nothing the assistant decides on its own can close it.
- If the chat platform requires a final text message after the GUI prompt returns, that post-prompt text is transport-only. It must be minimal, contain no substantive answer content, no summary, no apology, no explanation, and no new decision point.
- Do not treat a plain-text closing sentence as sufficient; the closing sequence must include a GUI prompt.
- If the user explicitly indicates they are done, still end with a minimal prompt that offers `Task Complete` and `Other` (this protects against ambiguous "done" phrasing).
- If a prompt tool call is cancelled or fails, immediately retry. Never leave a turn without a closing prompt.
- If the preferred GUI prompt tool is unavailable, cancelled repeatedly, or fails to return an answer, fall back to the next available GUI prompt tool in the priority order during the same turn.
- A closing prompt that is issued in the current turn and answered with a terminal choice such as `Task Complete` or `Stop` satisfies the closing-prompt requirement for that turn. Do not require a second follow-up prompt after that terminal choice.

## 3.1 Common Failure Mode To Avoid
- Do not assume that a prompt shown for a previous response, a tool-driven follow-up prompt, or a prompt answered before the final text already covers the current turn.
- The last assistant action in the turn must be: substantive response, then a fresh GUI prompt.
- On platforms with separate `commentary` and `final` channels, all substantive user-facing content must be delivered before the closing GUI prompt. The `final` message, if one is technically required after the prompt, must be a transport-only placeholder with no substantive content.
- If the assistant notices it already produced a full answer without a closing GUI prompt, it should treat that as a protocol violation and immediately recover on the next turn by acknowledging the miss briefly and resuming the HITL pattern.
- Do not treat a consumed prompt result as both input and closure. Once the user answered it and the assistant continued the task, a new closing prompt is required.

## 3.2 Pre-Send Check
- Before sending any final user-visible message, verify: `Did I already issue a fresh GUI prompt in this turn immediately after the substantive response?`
- If the answer is `no`, do not send the closing message yet; issue the GUI prompt first.
- If the answer is `yes`, ensure any remaining post-prompt text is transport-only and not a second substantive response.
- Also verify: `Did a GUI prompt in this turn already return an answer that I have not yet consumed?`
- If the answer is `yes`, continue the task using that returned answer before closing the turn. Do not emit a waiting placeholder.
- Also verify: `If the prompt attempt failed, did I retry or fall back to another GUI prompt tool before ending the turn?`
- Also verify: `Did I consume a same-turn prompt result and then forget to issue a new closing prompt afterward?`
- If the answer is `yes`, the turn is not ready to end. Finish the continued work and then issue a new closing prompt.

## 3.3 State Machine
- `Prompt pending`: wait only if the GUI tool has not returned an answer yet.
- `Prompt answered with terminal choice` such as `Task Complete` or `Stop`: if that prompt was the fresh closing prompt for the current turn, the closing requirement is satisfied and no additional prompt is required.
- `Prompt answered with non-terminal choice`: continue the task immediately; the answered prompt becomes consumed input, not closure.
- `Continued work finished`: issue a new fresh closing GUI prompt before ending the turn.

## 3.4 Terminal Choice Semantics
- `Task Complete` and `Stop` are terminal choices.
- If the assistant receives a terminal choice from the fresh closing prompt issued in the current turn, it may end after minimal handling without issuing another GUI prompt.
- If the assistant receives a non-terminal choice, it must continue the task and later issue a new fresh closing prompt.

## 4. Examples
- Next-step selection: prompt the user with concrete options such as `Run Tests`, `Update Docs`, `Other`, and `Task Complete`.
- Missing implementation detail: use one freeform or multiline prompt with a structured template in the message.
- Direct answer completed: after answering, prompt the user with options such as `Continue`, `Other`, and `Task Complete`.