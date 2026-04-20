#!/usr/bin/env npx tsx
/**
 * Audit Validation Script
 *
 * Validates an audit record from Redis and produces a detailed report
 * showing every metric, its calculation, and any anomalies.
 *
 * Usage:
 *   npx tsx scripts/validate-audit.ts <audit-id>
 *   npx tsx scripts/validate-audit.ts <audit-id> --json    # JSON output
 *   npx tsx scripts/validate-audit.ts <audit-id> --raw     # Also dump raw query data
 *
 * Requires REDIS_URL in .env.local
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load env from .env.local (without dotenv dependency)
const envPath = resolve(process.cwd(), '.env.local');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
} catch {
  // .env.local may not exist
}

import { createClient } from 'redis';
import type { AuditRecord } from '../src/lib/audit/types';
import { validateAudit, formatReport } from '../src/lib/audit/validate';

async function main() {
  const args = process.argv.slice(2);
  const auditId = args.find((a) => !a.startsWith('--'));
  const jsonMode = args.includes('--json');
  const rawMode = args.includes('--raw');

  if (!auditId) {
    console.error('Usage: npx tsx scripts/validate-audit.ts <audit-id> [--json] [--raw]');
    console.error('');
    console.error('Options:');
    console.error('  --json    Output as JSON (for programmatic use)');
    console.error('  --raw     Also dump raw query data for debugging');
    process.exit(1);
  }

  if (!process.env.REDIS_URL) {
    console.error('Error: REDIS_URL not found in .env.local');
    process.exit(1);
  }

  // Connect to Redis
  const redis = createClient({ url: process.env.REDIS_URL });
  redis.on('error', (err) => console.error('[Redis]', err));
  await redis.connect();

  try {
    // Fetch audit record
    const raw = await redis.get(`audit:${auditId}`);
    if (!raw) {
      console.error(`Error: No audit found with ID "${auditId}"`);
      await redis.quit();
      process.exit(1);
    }

    const record = JSON.parse(raw) as AuditRecord;

    // Run validation
    const report = validateAudit(record);

    if (jsonMode) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(formatReport(report));

      // Raw query data dump (for debugging)
      if (rawMode && record.results) {
        console.log('\n' + '═'.repeat(70));
        console.log('  RAW QUERY DATA');
        console.log('═'.repeat(70));

        console.log('\n  ── Phase 1: Brand Baseline Queries ──');
        for (const q of record.results.brandBaseline.queries) {
          console.log(`\n  Query: "${q.prompt}"`);
          for (const r of q.results) {
            const mention = r.mentioned ? 'YES' : 'no';
            const cite = r.cited ? 'YES' : 'no';
            const responseLen = r.rawResponse?.length ?? 0;
            console.log(`    ${r.platform.padEnd(11)} mention=${mention.padEnd(3)} cited=${cite.padEnd(3)} sentiment=${r.sentiment.padEnd(8)} response=${responseLen}chars`);
          }
        }

        console.log('\n  ── Phase 2: Competitor Context Queries ──');
        for (const q of record.results.competitorContext.queries) {
          console.log(`\n  Query: "${q.prompt}" (target: ${q.targetCompetitor})`);
          for (const r of q.results) {
            const mention = r.mentioned ? 'YES' : 'no';
            const cite = r.cited ? 'YES' : 'no';
            const responseLen = r.rawResponse?.length ?? 0;
            console.log(`    ${r.platform.padEnd(11)} mention=${mention.padEnd(3)} cited=${cite.padEnd(3)} sentiment=${r.sentiment.padEnd(8)} response=${responseLen}chars`);
          }
        }

        console.log('\n  ── Phase 3: Category Visibility Queries ──');
        for (const q of record.results.categoryVisibility.queries) {
          console.log(`\n  Query: "${q.prompt}"`);
          for (const r of q.results) {
            const mention = r.mentioned ? 'YES' : 'no';
            const cite = r.cited ? 'YES' : 'no';
            const responseLen = r.rawResponse?.length ?? 0;
            console.log(`    ${r.platform.padEnd(11)} mention=${mention.padEnd(3)} cited=${cite.padEnd(3)} sentiment=${r.sentiment.padEnd(8)} response=${responseLen}chars`);
          }
        }

        console.log('\n  ── Competitors Identified ──');
        for (const c of record.results.competitorContext.competitors) {
          console.log(`    ${c.name.padEnd(25)} ${c.domain.padEnd(30)} keywords=${c.keywordIntersection}`);
        }

        if (record.diagnostics) {
          console.log('\n  ── Diagnostics Summary ──');
          console.log(`    Category: "${record.diagnostics.inferredCategory}"`);
          console.log(`    Entity Type: "${record.diagnostics.inferredEntityType}"`);
          console.log(`    Competitor Source: "${record.diagnostics.competitorSource}"`);
          console.log(`    API Calls: ${record.diagnostics.successfulCalls}/${record.diagnostics.totalApiCalls} success, ${record.diagnostics.failedCalls} failed, ${record.diagnostics.emptyCalls} empty`);
          console.log(`    Cost: $${record.diagnostics.totalCostUsd.toFixed(2)}`);
          console.log(`    Duration: ${Math.round(record.diagnostics.totalDurationMs / 1000)}s`);
        }
      }
    }
  } finally {
    await redis.quit();
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
