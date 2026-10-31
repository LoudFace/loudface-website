import { after, NextResponse } from 'next/server';
import {
  APPROVE_ACTION,
  REJECT_ACTION,
  parsePrepared,
  sendApprovedSchedule,
  verifySlackSignature,
} from '@/lib/meta-approval';

/**
 * The LoudFace Bot's Interactivity Request URL: every button click on a LoudFace Bot message lands here.
 * Today it handles the booked-call approval card (lib/meta-approval.ts): ✅ sends the prepared Schedule event to
 * Meta, ❌ sends nothing. Both replace the buttons with who decided and what happened. Another bot feature adds
 * its own action_id branch below; Slack allows one request URL per app.
 *
 * Slack expects an answer within 3 seconds, so the Meta request runs after the response (after()).
 */

type SlackAction = { action_id?: string; value?: string };
type SlackPayload = {
  type?: string;
  user?: { id?: string; username?: string };
  actions?: SlackAction[];
  response_url?: string;
  message?: { blocks?: Record<string, unknown>[]; text?: string };
};

async function replaceCard(responseUrl: string, message: SlackPayload['message'], outcome: string) {
  // Keep everything the card showed, swap the buttons for the outcome.
  const blocks = (message?.blocks ?? []).filter((b) => b.type !== 'actions');
  blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: outcome }] });
  try {
    const response = await fetch(responseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ replace_original: true, text: message?.text ?? outcome, blocks }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) console.error(`[slack-interactivity] card update failed: ${response.status}`);
  } catch (error) {
    console.error('[slack-interactivity] card update threw', error);
  }
}

export async function POST(request: Request) {
  const secret = process.env.SLACK_SIGNING_SECRET;
  if (!secret) {
    console.error('[slack-interactivity] SLACK_SIGNING_SECRET not configured');
    return NextResponse.json({ error: 'not configured' }, { status: 500 });
  }

  const rawBody = await request.text();
  const ok = verifySlackSignature(
    rawBody,
    request.headers.get('x-slack-request-timestamp'),
    request.headers.get('x-slack-signature'),
    secret
  );
  if (!ok) return NextResponse.json({ error: 'invalid signature' }, { status: 401 });

  let payload: SlackPayload;
  try {
    payload = JSON.parse(new URLSearchParams(rawBody).get('payload') ?? '');
  } catch {
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
  }

  const action = payload.actions?.[0];
  const who = payload.user?.id ? `<@${payload.user.id}>` : 'someone';
  const at = `<!date^${Math.floor(Date.now() / 1000)}^{date_short_pretty} at {time}|now>`;
  const responseUrl = payload.response_url;
  if (payload.type !== 'block_actions' || !action || !responseUrl) return new NextResponse(null, { status: 200 });

  if (action.action_id === REJECT_ACTION) {
    after(() => replaceCard(responseUrl, payload.message, `❌ Not qualified, marked by ${who} ${at}. Nothing was sent to Meta.`));
    return new NextResponse(null, { status: 200 });
  }

  if (action.action_id === APPROVE_ACTION) {
    const prepared = parsePrepared(action.value ?? '');
    after(async () => {
      if (!prepared) {
        await replaceCard(responseUrl, payload.message, `⚠️ ${who} clicked ✅ but the card's event could not be read. Nothing was sent to Meta.`);
        return;
      }
      const result = await sendApprovedSchedule(prepared);
      await replaceCard(
        responseUrl,
        payload.message,
        result.ok
          ? `✅ Qualified, marked by ${who} ${at}. Meta received the Schedule event.`
          : `⚠️ ${who} clicked ✅ ${at}, but the event did not reach Meta: ${result.reason}.`
      );
    });
    return new NextResponse(null, { status: 200 });
  }

  // A link button (Open booking) also posts here; nothing to do.
  return new NextResponse(null, { status: 200 });
}
