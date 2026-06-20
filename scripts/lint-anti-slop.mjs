#!/usr/bin/env node
/**
 * Anti-slop linter.
 *
 * Reads text from a file argument or stdin, strips HTML, and counts rule
 * violations against the LoudFace anti-slop checklist. Emits a structured
 * report (markdown by default, JSON with --json) and exits non-zero when
 * any "blocker" rule fails — so /critique-content can gate on the script's
 * exit code instead of trusting an LLM to count.
 *
 * Usage:
 *   node scripts/lint-anti-slop.mjs path/to/draft.html
 *   node scripts/lint-anti-slop.mjs path/to/draft.md
 *   cat draft.md | node scripts/lint-anti-slop.mjs
 *   node scripts/lint-anti-slop.mjs --json path/to/draft.html
 *
 * Rules — sourced from ~/.claude/skills/arnels-assistant/SKILL.md +
 * references/anti-slop.md. The thresholds match what the skill documents.
 */

import fs from 'node:fs';
import path from 'node:path';

/* ── 1. Read input ───────────────────────────────────────────── */

const argv = process.argv.slice(2);
const jsonOutput = argv.includes('--json');
const fileArg = argv.find((a) => !a.startsWith('-'));

async function readInput() {
  if (fileArg) {
    const abs = path.resolve(fileArg);
    return { raw: fs.readFileSync(abs, 'utf-8'), source: abs };
  }
  // stdin
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => resolve({ raw: data, source: '<stdin>' }));
  });
}

/* ── 2. Strip HTML, separate prose from tables ───────────────── */

function htmlToProse(raw) {
  // Drop scripts, styles, svg.
  let body = raw
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '');

  // Tables get separated out — em-dash separators in table cells are
  // legitimate ("Tool — Price — Notes") and shouldn't blow the budget.
  let tableText = '';
  body = body.replace(/<table[\s\S]*?<\/table>/gi, (match) => {
    tableText += '\n' + match.replace(/<[^>]+>/g, ' ');
    return '\n[TABLE]\n';
  });

  // Block-level closers become newlines so we get sane paragraph splits.
  body = body.replace(/<\/(p|h[1-6]|li|div|tr|figcaption)>/gi, '\n');
  body = body.replace(/<(br|hr)\s*\/?>(?!\w)/gi, '\n');

  // Strip remaining tags.
  body = body.replace(/<[^>]+>/g, '');

  // Decode the common entities.
  body = body
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–');

  // Collapse extra whitespace, keep paragraph breaks.
  body = body.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

  return { prose: body, tableText: tableText.trim() };
}

/* ── 3. Rules ────────────────────────────────────────────────── */

const BANNED_WORDS = [
  // The arnels-assistant explicit banned list. Word-boundary matched
  // case-insensitive. Phrases are matched as-is.
  'delve',
  'leverage',
  'pivotal',
  'transformative',
  "in today's fast-paced",
  'navigate the landscape',
  'harness',
  'cutting-edge',
  'game-changer',
  'synergy',
  'best-in-class',
  'world-class',
  'unparalleled',
  // Paragraph-opener filler that the checklist bans:
  'moreover',
  'furthermore',
  'additionally',
];

const THROAT_CLEARING = [
  /\b(?:let'?s|let us)\s+dive\s+(?:in|into)\b/i,
  /\bin this (?:post|article|guide|piece)\b/i,
  /\bit'?s important to note\b/i,
  /\bwithout further ado\b/i,
];

const SIGNPOSTING = [
  /\bhere'?s the key takeaway\b/i,
  /\bthe most important thing\b/i,
  /\bwhat you need to know\b/i,
];

const ENDING_RESTATEMENT = [
  /\bin conclusion\b/i,
  /\bto sum (?:up|things up)\b/i,
  /\bto wrap (?:up|things up)\b/i,
  /\bin summary\b/i,
];

// ─── Meta-commentary patterns ─────────────────────────────────────
// Sentences where the AI narrates the article's own structure. Added
// 2026-05-25 after the Boutique piece shipped with "We're closing this
// with an unflattering paragraph on purpose, because the wedge-piece
// convention demands it." All BLOCKERS — meta-commentary should never
// appear in published copy. Voice file documents the rule; linter
// enforces it mechanically.
const META_COMMENTARY = [
  /\bthis (?:piece|article|section|paragraph|post|guide|playbook)\s+(?:is|will|means|covers|takes|leans|hands|names|narrates|is meant to|is intentionally|assumes|shows)\b/i,
  /\bon purpose,?\s+because\b/i,
  /\bthe (?:wedge[-\s]piece|listicle|comparison|article|piece|map|structure|convention)\s+(?:convention|format|template)?\s*demands\b/i,
  /\bevery good (?:wedge|comparison|listicle|article|piece)\s+\w+\s+needs\b/i,
  /\bwe['']re\s+(?:closing|including|publishing|writing|adding|opening|going to add|going to write|going to include)\s+this\b/i,
  /\bthe (?:structure|format|convention|template)\s+(?:here|demands|requires)\b/i,
  /\bin (?:keeping|service|the spirit)\s+of\s+(?:the\s+)?(?:convention|wedge|comparison|transparency)/i,
  /\bfor the purposes of (?:this|the)\b/i,
  /\b(?:that['']?s the listicle|this is the map|this is the listicle)\b/i,
];

// ─── Self-claim BLOCKERS (LoudFace-specific hallucinations) ────────
// Claims about LoudFace's process/timeline/cadence that contradict the
// Autopilot ship-from-day-one model. Added 2026-05-25 after the Boutique
// piece shipped with "4-6 week ramp where we instrument your measurement
// layer before shipping content" — contradicts KB row #9 "AI citations
// can land in 1 day if done right". These are blockers because they're
// unambiguous: LoudFace ships from week one, period.
const SELF_CLAIM_BLOCKERS = [
  // Multi-week/month ramps before shipping content
  /\b\d{1,2}\s*[-–to]+\s*\d{0,2}\s*[-]?\s*(?:week|month)s?\s+(?:ramp|onboarding|measurement|measure|audit period)\b/i,
  /\b(?:first|initial)\s+\d{1,2}\s*(?:weeks?|months?)\s+(?:measuring|of measurement|of audit|of instrumentation)\b/i,
  /\b(?:we|loudface)\s+(?:instrument|measure)\s+(?:your|the).{0,40}(?:before\s+shipping|prior\s+to\s+shipping|before\s+any\s+content)\b/i,
  /\bmeasurement\s+layer\s+before\s+shipping\b/i,
  /\b(?:no patience for|patience for) (?:the |our )?\d+[-–\s]*(?:week|month)s?\s+ramp\b/i,
];

// ─── Self-claim WARNINGS (need human verification) ─────────────────
// Patterns that MIGHT be legitimate market discussion vs LoudFace claims.
// Surfaced as warnings, not auto-blocks — the human reviewer decides if
// the surrounding context anchors the claim to LoudFace specifically.
const SELF_CLAIM_WARNINGS = [
  // Pricing band contradicting $5k retainer floor
  { pattern: /\$3[-–]5k\b/i, why: 'pricing band "$3-5k" — LoudFace floor is $5k across 3 Autopilot tiers, verify this is market discussion not a LoudFace anchor' },
  { pattern: /\$3[-–]5\s+thousand/i, why: 'pricing band "$3-5 thousand" — see above' },
  { pattern: /\$3,?000\s+to\s+\$5,?000/i, why: 'pricing band "$3000 to $5000" — see above' },
  { pattern: /below\s+\$3k\b/i, why: '"below $3k" — LoudFace floor is $5k; if this defines the boutique cutoff, the cutoff is wrong' },
  // Headcount claims that might be implying LoudFace size
  { pattern: /\b(?:our|loudface['']?s|the loudface)\s+(?:team|staff|crew)\s+of\s+\d+/i, why: 'explicit LoudFace headcount claim — verify against actual team size before ship' },
  { pattern: /\b\d+[-–]\d+\s+person\s+(?:team|crew|operation|agency)\b/i, why: 'N-N person team claim — if this is implicitly anchored to LoudFace, verify against actual team size' },
];

function countWords(text) {
  return (text.match(/\b\w+\b/g) || []).length;
}

function emDashCount(text) {
  return (text.match(/—/g) || []).length;
}

function checkBannedWords(prose) {
  const hits = {};
  const lower = prose.toLowerCase();
  for (const w of BANNED_WORDS) {
    // Use word-boundary for single words, substring for phrases.
    let count;
    if (/\s/.test(w)) {
      count = (lower.match(new RegExp(escapeRegex(w), 'g')) || []).length;
    } else {
      count = (lower.match(new RegExp(`\\b${escapeRegex(w)}\\b`, 'g')) || [])
        .length;
    }
    if (count > 0) hits[w] = count;
  }
  return hits;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function checkNotXY(prose) {
  // "Not X, it's Y" / "Not X — Y" / "Not just X — Y" — the false-drama
  // affirmative form. Strict budget: max 1 per piece.
  const patterns = [
    /\b[Nn]ot\s+(?:just\s+)?[^.!?\n]{2,80}?,\s+(?:it'?s|its|but)\b/g,
    /\b[Nn]ot\s+(?:just\s+)?[^.!?\n]{2,80}?\s+—\s+(?:it'?s|its|but)?/g,
  ];
  const hits = new Set();
  for (const pat of patterns) {
    for (const m of prose.matchAll(pat)) {
      hits.add(m[0].trim().slice(0, 120));
    }
  }
  return [...hits];
}

function checkBareNotY(prose) {
  // "X, not Y" — comma-separated negation pivot ("fast, not slow",
  // "Pick by fit, not by client logo prestige"). Excludes the false-drama
  // form ("..., not it's Y" / "..., not but Y") since checkNotXY counts those.
  // Looser budget than checkNotXY: max 2 per piece — natural rhetorical move.
  const pattern = /,\s+not\s+(\w[\w'-]*)/gi;
  const hits = [];
  for (const m of prose.matchAll(pattern)) {
    const nextWord = (m[1] || '').toLowerCase();
    if (nextWord === 'it' || nextWord === 'its' || nextWord === "it's" || nextWord === 'but') continue;
    const idx = m.index ?? 0;
    const start = Math.max(0, idx - 40);
    const end = Math.min(prose.length, idx + 60);
    hits.push(prose.slice(start, end).replace(/\s+/g, ' ').trim());
  }
  return hits;
}

function checkRuleOfThree(prose) {
  // "X, Y, and Z" patterns repeated 3+ times in close proximity are flagged.
  // A loose detector — captures comma+and triplets.
  const matches = [
    ...prose.matchAll(/\b(\w+(?:\s+\w+)?),\s+(\w+(?:\s+\w+)?),?\s+and\s+(\w+(?:\s+\w+)?)\b/gi),
  ].map((m) => m[0]);
  return matches;
}

function checkThroatClearing(prose) {
  const hits = [];
  for (const pat of THROAT_CLEARING) {
    const m = prose.match(pat);
    if (m) hits.push(m[0]);
  }
  return hits;
}

function checkSignposting(prose) {
  const hits = [];
  for (const pat of SIGNPOSTING) {
    const m = prose.match(pat);
    if (m) hits.push(m[0]);
  }
  return hits;
}

function checkEndingRestatement(prose) {
  // Only matters in the last ~600 characters (the "in conclusion" position).
  const tail = prose.slice(-1200);
  const hits = [];
  for (const pat of ENDING_RESTATEMENT) {
    const m = tail.match(pat);
    if (m) hits.push(m[0]);
  }
  return hits;
}

function checkMetaCommentary(prose) {
  const hits = [];
  for (const pat of META_COMMENTARY) {
    for (const m of prose.matchAll(new RegExp(pat.source, pat.flags + 'g'))) {
      const idx = m.index ?? 0;
      const start = Math.max(0, idx - 60);
      const end = Math.min(prose.length, idx + m[0].length + 80);
      hits.push(prose.slice(start, end).replace(/\s+/g, ' ').trim());
    }
  }
  return hits;
}

function checkSelfClaimBlockers(prose) {
  const hits = [];
  for (const pat of SELF_CLAIM_BLOCKERS) {
    for (const m of prose.matchAll(new RegExp(pat.source, pat.flags + 'g'))) {
      const idx = m.index ?? 0;
      const start = Math.max(0, idx - 60);
      const end = Math.min(prose.length, idx + m[0].length + 80);
      hits.push(prose.slice(start, end).replace(/\s+/g, ' ').trim());
    }
  }
  return hits;
}

function checkSelfClaimWarnings(prose) {
  const hits = [];
  for (const { pattern, why } of SELF_CLAIM_WARNINGS) {
    for (const m of prose.matchAll(new RegExp(pattern.source, pattern.flags + 'g'))) {
      const idx = m.index ?? 0;
      const start = Math.max(0, idx - 60);
      const end = Math.min(prose.length, idx + m[0].length + 80);
      hits.push({ snippet: prose.slice(start, end).replace(/\s+/g, ' ').trim(), why });
    }
  }
  return hits;
}

function emDashSnippets(prose) {
  const lines = prose.split('\n');
  const out = [];
  for (const line of lines) {
    let i = -1;
    while ((i = line.indexOf('—', i + 1)) !== -1) {
      const start = Math.max(0, i - 40);
      const end = Math.min(line.length, i + 40);
      out.push(line.slice(start, end).trim());
    }
  }
  return out;
}

/* ── 4. Build the report ─────────────────────────────────────── */

function runChecks({ prose, tableText, source }) {
  const proseWords = countWords(prose);
  const em = emDashCount(prose);
  const dashBudget = Math.max(1, Math.floor(proseWords / 300));
  const dashDensity = proseWords ? (em / (proseWords / 300)) : 0;

  const banned = checkBannedWords(prose);
  const notXY = checkNotXY(prose);
  const bareNotY = checkBareNotY(prose);
  const ruleOfThree = checkRuleOfThree(prose);
  const throat = checkThroatClearing(prose);
  const signposting = checkSignposting(prose);
  const ending = checkEndingRestatement(prose);
  const metaCommentary = checkMetaCommentary(prose);
  const selfClaimBlockers = checkSelfClaimBlockers(prose);
  const selfClaimWarnings = checkSelfClaimWarnings(prose);

  const findings = [];
  const blockers = [];

  // Meta-commentary — AI narrating the article's own structure.
  // BLOCKER on any hit. Added 2026-05-25 after the Boutique piece shipped
  // with "We're closing this with an unflattering paragraph on purpose,
  // because the wedge-piece convention demands it." See voice file +
  // KB row "Meta-commentary in copy is AI slop".
  if (metaCommentary.length > 0) {
    const finding = {
      rule: 'meta-commentary',
      severity: 'blocker',
      msg: `${metaCommentary.length} meta-commentary hit${metaCommentary.length === 1 ? '' : 's'} (rule: zero — sentences where the AI narrates the article's own structure must be cut). See voice file.`,
      samples: metaCommentary.slice(0, 8),
    };
    findings.push(finding);
    blockers.push(finding);
  }

  // Self-claim blockers — operational claims about LoudFace that
  // contradict the Autopilot ship-from-day-one model. Always blocker.
  if (selfClaimBlockers.length > 0) {
    const finding = {
      rule: 'self-claim-contradiction',
      severity: 'blocker',
      msg: `${selfClaimBlockers.length} self-claim contradiction hit${selfClaimBlockers.length === 1 ? '' : 's'} — LoudFace ships from week one (Autopilot). Ramps/measurement-before-shipping claims contradict the strategy page + KB row "AI citations can land in 1 day if done right".`,
      samples: selfClaimBlockers.slice(0, 8),
    };
    findings.push(finding);
    blockers.push(finding);
  }

  // Self-claim warnings — need human verification (could be legit
  // market discussion or could be a LoudFace anchor).
  if (selfClaimWarnings.length > 0) {
    const finding = {
      rule: 'self-claim-warning',
      severity: 'should-fix',
      msg: `${selfClaimWarnings.length} self-claim warning${selfClaimWarnings.length === 1 ? '' : 's'} — verify against the strategy page before ship. Each may be legit market discussion OR a hallucinated LoudFace anchor.`,
      samples: selfClaimWarnings.slice(0, 8).map((w) => `${w.snippet}  →  why: ${w.why}`),
    };
    findings.push(finding);
    // Not auto-added to blockers — human reviewer must ack.
  }

  // Em-dash policy — ZERO TOLERANCE. Any em-dash in published content is a
  // blocker. Replace with commas, periods, or parentheses. Tables are
  // excluded (already separated out above) so unit/range em-dashes inside
  // comparison cells don't trigger.
  if (em > 0) {
    const finding = {
      rule: 'em-dashes',
      severity: 'blocker',
      msg: `${em} em-dash${em === 1 ? '' : 'es'} present (rule: zero em-dashes in articles — replace with commas, periods, or parentheses)`,
      samples: emDashSnippets(prose).slice(0, 12),
    };
    findings.push(finding);
    blockers.push(finding);
  }

  // "Not X, it's Y" — false-drama affirmative form. Strict: max 1.
  if (notXY.length > 1) {
    const finding = {
      rule: 'not-x-its-y-construction',
      severity: notXY.length > 2 ? 'blocker' : 'should-fix',
      msg: `${notXY.length} false-drama "Not X, it's Y" constructions (rule: max 1/piece)`,
      samples: notXY.slice(0, 5),
    };
    findings.push(finding);
    if (finding.severity === 'blocker') blockers.push(finding);
  }

  // "X, not Y" — bare negation pivot. Looser budget: max 2.
  if (bareNotY.length > 2) {
    const finding = {
      rule: 'bare-x-not-y-construction',
      severity: bareNotY.length > 4 ? 'blocker' : 'should-fix',
      msg: `${bareNotY.length} bare "X, not Y" comma-pivot constructions (rule: max 2/piece)`,
      samples: bareNotY.slice(0, 5),
    };
    findings.push(finding);
    if (finding.severity === 'blocker') blockers.push(finding);
  }

  // Banned words — every hit is a blocker.
  if (Object.keys(banned).length) {
    const finding = {
      rule: 'banned-words',
      severity: 'blocker',
      msg: `Banned vocabulary hits: ${Object.entries(banned)
        .map(([w, n]) => `"${w}"×${n}`)
        .join(', ')}`,
      samples: Object.keys(banned),
    };
    findings.push(finding);
    blockers.push(finding);
  }

  // Throat-clearing — blocker on first hit.
  if (throat.length) {
    const finding = {
      rule: 'throat-clearing',
      severity: 'blocker',
      msg: `Throat-clearing opener detected: ${throat.join(', ')}`,
      samples: throat,
    };
    findings.push(finding);
    blockers.push(finding);
  }

  // Signposting — should-fix.
  if (signposting.length) {
    findings.push({
      rule: 'signposting',
      severity: 'should-fix',
      msg: `Signposting phrases: ${signposting.join(', ')}`,
      samples: signposting,
    });
  }

  // Ending restatement — blocker (most jarring AI tic).
  if (ending.length) {
    const finding = {
      rule: 'ending-restatement',
      severity: 'blocker',
      msg: `Closing-restatement phrase in tail: ${ending.join(', ')}`,
      samples: ending,
    };
    findings.push(finding);
    blockers.push(finding);
  }

  // Rule-of-three — informational only; surfaced as suggestion when 4+ are found.
  if (ruleOfThree.length >= 4) {
    findings.push({
      rule: 'rule-of-three',
      severity: 'suggestion',
      msg: `${ruleOfThree.length} "X, Y, and Z" triplets — vary the rhythm`,
      samples: ruleOfThree.slice(0, 5),
    });
  }

  return {
    source,
    proseWords,
    tableWords: tableText ? countWords(tableText) : 0,
    em,
    dashBudget,
    dashDensity: Number(dashDensity.toFixed(2)),
    findings,
    blockers,
    pass: blockers.length === 0,
  };
}

/* ── 5. Render ───────────────────────────────────────────────── */

function renderMarkdown(report) {
  const lines = [];
  lines.push(`# Anti-slop lint — ${report.pass ? '✓ pass' : '⨯ FAIL'}`);
  lines.push('');
  lines.push(`- Source: \`${report.source}\``);
  lines.push(`- Prose: ${report.proseWords} words${report.tableWords ? ` (+${report.tableWords} in tables, excluded)` : ''}`);
  lines.push(`- Em-dashes: ${report.em} (rule: zero — any em-dash in articles is a blocker)`);
  lines.push('');
  if (report.findings.length === 0) {
    lines.push('No findings. Ship it.');
    return lines.join('\n');
  }
  const tone = { blocker: '🚨', 'should-fix': '⚠️', suggestion: '💡' };
  for (const f of report.findings) {
    lines.push(`## ${tone[f.severity] ?? ''} ${f.severity.toUpperCase()} — ${f.rule}`);
    lines.push(f.msg);
    if (f.samples?.length) {
      lines.push('');
      lines.push('Samples:');
      for (const s of f.samples) lines.push(`- ${s}`);
    }
    lines.push('');
  }
  return lines.join('\n').trim();
}

/* ── 6. Main ─────────────────────────────────────────────────── */

const { raw, source } = await readInput();
const { prose, tableText } = htmlToProse(raw);
const report = runChecks({ prose, tableText, source });

if (jsonOutput) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(renderMarkdown(report));
}

process.exit(report.pass ? 0 : 1);
