---
name: design-loop
description: Run the portable design feedback loop for website work in this repo. Use for design-loop, website redesign, landing page redesign, homepage redesign, hero concepts, section design, web visual polish, restyle, make this website look better, improve the web design, visual direction exploration, or any website task where Codex should generate multiple directions, screenshot them, score them, critique them, iterate, and wait for the human pick.
---

# Design loop

Use this as a true loop, not as a one-pass design prompt. The source of truth is the portable playbook at `/Users/arnel/design-skills/skills/design-loop/PORTABLE.md`.

Invoking this skill is an explicit request to run the design loop with Codex's parallel subagents when they are available. Use subagents for the two quality-critical isolation steps: blind concept fan-out and independent critique. If subagents are unavailable in a future environment, fall back to separate sequential passes and say that the harness is weaker.

## Start

1. Read `/Users/arnel/design-skills/skills/design-loop/PORTABLE.md` completely.
2. Set `DL=/Users/arnel/design-skills/skills/design-loop`.
3. Read the repo `DESIGN.md`, `$DL/rubric.md`, `~/.atelier/taste-laws.md`, and `~/.atelier/rejections.md` when present.
4. If the repo lacks `DESIGN.md`, create one from `$DL/reference/seed-design-md.md` before judging design work.
5. Treat this skill as website-only for this repo. Use `--register web`.

## Run the loop

1. Generate from evidence:
   - Run `python3 $DL/design_board.py --register web --surface <surface>`.
   - Pass `--diverge` for a fresh redesign or when the user asks for a major visual change.
   - Run `python3 $DL/gallery_pick.py --register web --surface <surface>`.
   - Write a steal/twist receipt and verify it with `python3 $DL/gallery_pick.py --verify --receipt <file>`.
   - Do not design until the gate prints `GALLERY-GROUNDED`.
2. Fan out real alternatives:
   - Make 4 to 5 independent concepts for redesign work.
   - Spawn one Codex subagent per concept when available.
   - Give each subagent the same brief, the relevant target files or route, `DESIGN.md`, the verified gallery receipt, and exactly one assigned screenshot/DNA reference, layout spine, and motion direction.
   - Use style tags only as secondary category labels after the screenshot/DNA reference is chosen. Do not generate from a style tag alone.
   - Do not let concept subagents see each other's work until all concepts are rendered.
   - If subagents are unavailable, do sequential clean-room passes with separate notes per concept and disclose the weaker isolation.
3. See the work:
   - Run `python3 $DL/shot.py <file-or-url>` for every concept.
   - Read desktop and mobile screenshots before judging.
   - For motion-heavy work, run `python3 $DL/filmstrip.py <file-or-url> --frames 6` and read the filmstrip.
4. Judge from renders:
   - Score each concept against `$DL/rubric.md`.
   - Run an independent critique pass for each concept. Use a fresh subagent per critique when available.
   - The critic must not be the same pass that generated the concept and must judge from screenshots, not source code alone.
   - Reject concepts that are generic, derivative, broken on mobile, or weaker than the reference bar.
5. Fix and re-shoot:
   - Pick the strongest direction only after visual evidence and critique.
   - Patch its named gaps, re-run screenshots, and re-score.
   - Continue until the weak axis is no longer improving or the concept clears the bar.
6. Present and wait:
   - Show the strongest options side by side with screenshots, scores, tradeoffs, and any design-token departures.
   - Do not auto-ship. The human picks.
7. Log the pick:
   - After the human picks, run `python3 $DL/capture_pick.py` as described in `PORTABLE.md`.
   - Run `--dry-run` first.

Keep the same behavior Claude had: generate, see, judge, fix, present, human pick, then log. The only Codex swap is the fan-out mechanism.
