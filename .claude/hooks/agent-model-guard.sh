#!/usr/bin/env bash
# agent-model-guard.sh — PreToolUse blocker for the Agent tool.
# Blocks Agent calls that omit the `model` param (omitted = inherit = subagent runs on the
# orchestrator's own tier, silently burning top-tier limits). Policy: ~/.claude/CLAUDE.md
# "Model Orchestration". Exception: subagent_type "fork" always inherits by design.
# Exit 2 + stderr = block the call and feed the message back to Claude (retries with model set).
HOOK_INPUT="$(cat)" python3 - <<'PY'
import json, os, sys
try:
    data = json.loads(os.environ.get("HOOK_INPUT", ""))
except Exception:
    sys.exit(0)  # unparseable input -> never block
ti = data.get("tool_input") or {}
if ti.get("subagent_type") == "fork":
    sys.exit(0)
if ti.get("model"):
    sys.exit(0)
sys.stderr.write(
    "BLOCKED by agent-model-guard: Agent call has no explicit `model` param. "
    "Omitted model = inherit = subagent runs on the orchestrator's tier and burns top-tier limits. "
    "Re-issue the same Agent call with an explicit model chosen by task shape: "
    "sonnet (default executor: search/read/spec'd implementation/bulk), "
    "opus (hard implementation, deep debugging, high-stakes review), "
    "haiku (throwaway mechanical sweeps), "
    "fable (only for the single hardest judgment step). "
    "Ladder: ~/.claude/CLAUDE.md 'Model Orchestration'."
)
sys.exit(2)
PY
