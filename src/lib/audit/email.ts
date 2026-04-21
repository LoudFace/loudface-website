/**
 * Post-audit email. Fires after a successful audit to hand the user a
 * shareable link plus a short teaser summary. Captures retention even if
 * they closed the browser tab — otherwise the audit is a dead drop.
 *
 * Soft-deps on two env vars. If either is missing we log and no-op rather
 * than failing the audit:
 *   - RESEND_API_KEY: Resend API token
 *   - AUDIT_EMAIL_FROM: verified sending address, e.g. "LoudFace Audit <audit@loudface.co>"
 *
 * The recipient URL defaults to the production host. Override with
 * AUDIT_PUBLIC_URL for staging or local previews.
 */

import { Resend } from 'resend';
import type { AuditRecord } from './types';

const DEFAULT_PUBLIC_URL = 'https://loudface.co';

export async function sendAuditCompleteEmail(record: AuditRecord): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.AUDIT_EMAIL_FROM;
  const publicUrl = process.env.AUDIT_PUBLIC_URL ?? DEFAULT_PUBLIC_URL;

  if (!apiKey || !from) {
    console.log('[Audit Email] RESEND_API_KEY or AUDIT_EMAIL_FROM not set — skipping email delivery.');
    return;
  }

  if (!record.results || !record.input.email) {
    console.warn('[Audit Email] Missing results or email — skipping for audit', record.id);
    return;
  }

  const auditLink = `${publicUrl}/audit/${record.id}`;
  const { scores, actionItems } = record.results;
  const brand = record.input.companyName;
  const grade = scores.overallGrade;
  const topActions = actionItems.slice(0, 3);

  const subject = `${brand} — AI Visibility Audit: Grade ${grade}`;
  const html = buildEmailHtml({ brand, grade, scores, topActions, auditLink });
  const text = buildEmailText({ brand, grade, scores, topActions, auditLink });

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: record.input.email,
      subject,
      html,
      text,
    });
    if (error) {
      console.error('[Audit Email] Resend returned error:', error);
      return;
    }
    console.log(`[Audit Email] Sent to ${record.input.email} for audit ${record.id}`);
  } catch (err) {
    // Never throw from the email path — audit is already complete and saved.
    console.error('[Audit Email] Failed to send:', err);
  }
}

interface EmailContentArgs {
  brand: string;
  grade: string;
  scores: { discoveryVisibility: number; shareOfVoice: number; platformCoverage: number };
  topActions: Array<{ priority: string; title: string; description: string }>;
  auditLink: string;
}

function buildEmailHtml({ brand, grade, scores, topActions, auditLink }: EmailContentArgs): string {
  const actionListHtml = topActions
    .map(
      (a) => `
        <tr>
          <td style="padding:12px 16px;border-top:1px solid #e5e7eb;vertical-align:top;">
            <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#111827;">${escapeHtml(a.title)}</p>
            <p style="margin:0;font-size:13px;color:#4b5563;line-height:1.5;">${escapeHtml(truncate(a.description, 220))}</p>
          </td>
        </tr>`,
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(brand)} AI Visibility Audit</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#111827;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:40px 32px 24px;">
              <p style="margin:0 0 16px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#6366f1;font-weight:600;">AI Visibility Audit</p>
              <h1 style="margin:0 0 8px;font-size:26px;font-weight:600;color:#111827;line-height:1.2;">${escapeHtml(brand)}</h1>
              <p style="margin:0;font-size:14px;color:#6b7280;">Your audit is ready.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:10px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;">Overall Grade</p>
                    <p style="margin:0 0 12px;font-size:40px;font-weight:600;color:#111827;line-height:1;">${escapeHtml(grade)}</p>
                    <p style="margin:0;font-size:13px;color:#4b5563;">
                      Discovery: <strong>${scores.discoveryVisibility}%</strong>
                      &nbsp;·&nbsp; Share of Voice: <strong>${scores.shareOfVoice}%</strong>
                      &nbsp;·&nbsp; Platforms: <strong>${scores.platformCoverage}/4</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${
            topActions.length > 0
              ? `<tr>
            <td style="padding:0 32px 16px;">
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;font-weight:600;">Top actions</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${actionListHtml}
              </table>
            </td>
          </tr>`
              : ''
          }
          <tr>
            <td align="center" style="padding:8px 32px 40px;">
              <a href="${escapeHtml(auditLink)}" style="display:inline-block;padding:14px 28px;background:#171717;color:#ffffff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:500;">View the full audit</a>
              <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">Or open the link directly: <a href="${escapeHtml(auditLink)}" style="color:#6366f1;">${escapeHtml(auditLink)}</a></p>
            </td>
          </tr>
        </table>
        <p style="margin:24px 0 0;font-size:11px;color:#9ca3af;">LoudFace · AI Visibility Audit</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildEmailText({ brand, grade, scores, topActions, auditLink }: EmailContentArgs): string {
  const actionLines = topActions.map((a, i) => `${i + 1}. ${a.title}\n   ${truncate(a.description, 180)}`).join('\n\n');
  return [
    `${brand} — AI Visibility Audit`,
    '',
    `Overall Grade: ${grade}`,
    `Discovery: ${scores.discoveryVisibility}% · Share of Voice: ${scores.shareOfVoice}% · Platforms: ${scores.platformCoverage}/4`,
    '',
    topActions.length > 0 ? 'Top actions:' : '',
    actionLines,
    '',
    `View the full audit: ${auditLink}`,
    '',
    '— LoudFace',
  ]
    .filter(Boolean)
    .join('\n');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function truncate(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return t.slice(0, max).replace(/\s+\S*$/, '') + '…';
}
