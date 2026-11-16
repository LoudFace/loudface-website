/**
 * The People panel's one invite flow (2026-11-16): who is offered which role,
 * what the panel says after each outcome, the single list of people, and the
 * HTML of the sign-in mails. Expected wording comes from the product spec.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test, { describe, it } from 'node:test';

import {
  EMPTY_ACCESS_NOTE,
  NEXT_STEPS,
  NOT_OWNER_NOTE,
  ROLE_OPTIONS,
  addedDate,
  alreadyHasAccess,
  effectiveRole,
  existingRole,
  inviteLifetime,
  inviteOutcome,
  invalidInvite,
  lifetimeLabel,
  onlyOwners,
  peopleRows,
  roleAllowed,
} from '../inline-edit/invite-flow';
import { INVITE_LINK_MINUTES, SIGN_IN_MINUTES } from '../inline-edit/editors-list';
import { buildSignInHtml, buttonLabel, escapeHtml, introSentence } from '../inline-edit/signin-mail-html';
import { resendKey } from '../inline-edit/mail-config';

const root = path.resolve(__dirname, '..', '..', '..');
const source = (file: string) => readFileSync(path.join(root, file), 'utf8');

describe('role choice', () => {
  it('offers the two roles in order with the spec wording', () => {
    assert.deepEqual(
      ROLE_OPTIONS.map((option) => `${option.label} — ${option.detail}`),
      [
        'Can edit — changes text, pictures and links, and publishes',
        'Can comment — leaves notes on the page, changes nothing',
      ],
    );
  });

  it('an owner may pick either role and starts on Can edit', () => {
    assert.equal(roleAllowed(true, 'edit'), true);
    assert.equal(roleAllowed(true, 'comment'), true);
    assert.equal(effectiveRole(null, true), 'edit');
    assert.equal(effectiveRole('comment', true), 'comment');
  });

  it('anyone else may only comment, whatever was picked', () => {
    assert.equal(roleAllowed(false, 'edit'), false);
    assert.equal(roleAllowed(false, 'comment'), true);
    assert.equal(effectiveRole(null, false), 'comment');
    assert.equal(effectiveRole('edit', false), 'comment');
    assert.equal(NOT_OWNER_NOTE, 'Only LoudFace can add editors. Ask your LoudFace contact.');
  });
});

describe('link lifetime', () => {
  it('says the real lifetime: every link in the editor lasts 12 hours', () => {
    assert.equal(SIGN_IN_MINUTES, 720);
    assert.equal(INVITE_LINK_MINUTES, 720);
    assert.equal(inviteLifetime('edit'), '12 hours');
    assert.equal(inviteLifetime('comment'), '12 hours');
  });

  it('reads other lengths in plain words', () => {
    assert.equal(lifetimeLabel(60), '1 hour');
    assert.equal(lifetimeLabel(15), '15 minutes');
    assert.equal(lifetimeLabel(1), '1 minute');
  });
});

describe('result states', () => {
  it('sent: names the person and the real lifetime', () => {
    assert.deepEqual(inviteOutcome('edit', 'Sam@Example.com', true, 'site.com/edit'), {
      kind: 'sent',
      text: 'Invitation sent to sam@example.com. The link in it works for 12 hours.',
    });
  });

  it('added but the email failed: gives the address to send them', () => {
    assert.deepEqual(inviteOutcome('comment', 'sam@example.com', false, 'site.com/edit'), {
      kind: 'unmailed',
      text: 'sam@example.com has access now, but the email did not go out. Send them this address: site.com/edit — they type their email there and get a link.',
    });
  });

  it('invalid email is refused before anything is sent', () => {
    assert.equal(invalidInvite('nope'), 'That does not look like an email address');
    assert.equal(invalidInvite('a|b@example.com'), 'That does not look like an email address');
    assert.equal(invalidInvite('sam@example.com'), null);
  });

  it('already has access: says which role they have', () => {
    const lists = { owners: ['lf@loudface.co'], editors: ['ed@client.com'], commenters: ['co@client.com'] };
    assert.equal(existingRole('LF@loudface.co', lists), 'owner');
    assert.equal(existingRole('ed@client.com', lists), 'edit');
    assert.equal(existingRole('co@client.com', lists), 'comment');
    assert.equal(existingRole('new@client.com', lists), null);

    assert.equal(alreadyHasAccess('lf@loudface.co', 'owner', 'edit'), 'lf@loudface.co is already an owner and has full access');
    assert.equal(alreadyHasAccess('ed@client.com', 'edit', 'edit'), 'ed@client.com can already edit this site');
    assert.equal(
      alreadyHasAccess('ed@client.com', 'edit', 'comment'),
      'ed@client.com can already edit this site, so they can comment too',
    );
    assert.equal(alreadyHasAccess('co@client.com', 'comment', 'comment'), 'co@client.com can already comment on this site');
  });

  it('a commenter may still be invited to edit, and a stranger to either', () => {
    assert.equal(alreadyHasAccess('co@client.com', 'comment', 'edit'), null);
    assert.equal(alreadyHasAccess('new@client.com', null, 'edit'), null);
    assert.equal(alreadyHasAccess('new@client.com', null, 'comment'), null);
  });

  it('"what happens next" has the three lines with the real address', () => {
    assert.deepEqual(NEXT_STEPS('site.com/edit'), [
      'They get an email with a sign-in link.',
      'They open it and they are in. No password, no account to create.',
      'To come back later they go to site.com/edit and type their email.',
    ]);
  });
});

describe('people with access', () => {
  const access = (owner: boolean, you = 'ed@client.com') => ({
    owners: [{ email: 'lf@loudface.co' }],
    editors: [{ email: 'ed@client.com', addedBy: 'lf@loudface.co', addedAt: '2026-09-18T12:00:00Z' }],
    you,
    owner,
  });
  const commenters = [
    { email: 'co@client.com', addedBy: 'ed@client.com', addedVia: 'invite', addedAt: '2026-10-30T09:00:00Z' },
    { email: 'sh@client.com', addedBy: '', addedVia: 'link', addedAt: '2026-10-31T09:00:00Z' },
  ];

  it('one list, owners then editors then commenters, with the spec wording', () => {
    const rows = peopleRows(access(true), commenters);
    assert.deepEqual(
      rows.map((row) => [row.email, row.detail, row.you]),
      [
        ['lf@loudface.co', 'Owner · LoudFace', false],
        ['ed@client.com', 'Can edit · added by lf, 18 September 2026', true],
        ['co@client.com', 'Can comment · invited by ed', false],
        ['sh@client.com', 'Can comment · joined with the share link', false],
      ],
    );
  });

  it('Remove is offered for editors and commenters to owners only, never for an owner row', () => {
    assert.deepEqual(
      peopleRows(access(true), commenters).map((row) => row.removeFrom),
      [null, 'editors', 'commenters', 'commenters'],
    );
    assert.deepEqual(
      peopleRows(access(false), commenters).map((row) => row.removeFrom),
      [null, null, null, null],
    );
  });

  it('someone who is an editor and a commenter is listed once, as the editor', () => {
    const both = [{ email: 'ED@client.com', addedBy: 'x@y.co', addedVia: 'invite', addedAt: '' }];
    const rows = peopleRows(access(true), both);
    assert.equal(rows.length, 2);
    assert.equal(rows[1].role, 'edit');
  });

  it('only owners listed reads as the empty state', () => {
    const rows = peopleRows({ owners: [{ email: 'lf@loudface.co' }], editors: [], you: 'lf@loudface.co', owner: true }, []);
    assert.equal(onlyOwners(rows), true);
    assert.equal(EMPTY_ACCESS_NOTE, 'Only LoudFace has access so far.');
    assert.equal(onlyOwners(peopleRows(access(true), [])), false);
  });

  it('a missing or unreadable date adds nothing', () => {
    assert.equal(addedDate(''), '');
    assert.equal(addedDate('yesterday'), '');
  });
});

describe('sign-in mail html', () => {
  const base = { host: 'site.com', link: 'https://site.com/api/lf-edit/verify?token=a.b&x=1', lifetime: '12 hours' };

  it('each kind has its own button and one sentence naming who and which site', () => {
    assert.equal(buttonLabel('edit'), 'Open the site editor');
    assert.equal(buttonLabel('signin'), 'Open the site editor');
    assert.equal(buttonLabel('comment'), 'Start commenting');
    assert.equal(buttonLabel('join'), 'Confirm my email');
    assert.equal(introSentence({ kind: 'edit', host: 'site.com', invitedBy: 'lf@loudface.co' }), 'lf@loudface.co invited you to edit site.com.');
    assert.equal(introSentence({ kind: 'comment', host: 'site.com', invitedBy: 'ed@client.com' }), 'ed@client.com invited you to leave comments on site.com.');
  });

  it('carries the button, the lifetime, the return address and the raw link', () => {
    const html = buildSignInHtml({ ...base, kind: 'edit', invitedBy: 'lf@loudface.co' });
    assert.match(html, /max-width:480px/);
    assert.match(html, /Open the site editor<\/a>/);
    assert.match(html, /The link works for 12 hours\. Later, go to site\.com\/edit and type this email address for a new link\. No password needed\./);
    assert.equal(html.split('token=a.b&amp;x=1').length - 1, 2);
  });

  it('escapes every interpolated value', () => {
    const html = buildSignInHtml({
      kind: 'comment',
      host: 'evil"><script>alert(1)</script>.com',
      link: 'https://x.com/?a="><img src=x>',
      invitedBy: '<b>me</b>@x.co',
      lifetime: '12 <hours>',
    });
    assert.doesNotMatch(html, /<script>|<img|<b>/);
    assert.match(html, /&lt;script&gt;/);
    assert.equal(escapeHtml(`<>&"'`), '&lt;&gt;&amp;&quot;&#39;');
  });

  it('the join mail says to ignore it if the reader did not ask', () => {
    assert.match(buildSignInHtml({ ...base, kind: 'join' }), /If you did not ask for this, ignore this email/);
  });
});

describe('mail key', () => {
  const keep = { own: process.env.LF_EDIT_RESEND_KEY, shared: process.env.RESEND_API_KEY };
  test.afterEach(() => {
    for (const [name, value] of [['LF_EDIT_RESEND_KEY', keep.own], ['RESEND_API_KEY', keep.shared]] as const) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });

  it('prefers the editor key and falls back to the shared one', () => {
    process.env.RESEND_API_KEY = 'shared';
    delete process.env.LF_EDIT_RESEND_KEY;
    assert.equal(resendKey(), 'shared');
    process.env.LF_EDIT_RESEND_KEY = 'own';
    assert.equal(resendKey(), 'own');
  });

  it('the mail and the health route read the same helper', () => {
    assert.match(source('src/lib/inline-edit/signin-mail.ts'), /resendKey\(\)/);
    assert.match(source('src/app/api/lf-edit/health/route.ts'), /resendKey: Boolean\(resendKey\(\)\)/);
    assert.doesNotMatch(source('src/app/api/lf-edit/health/route.ts'), /process\.env\.RESEND_API_KEY/);
  });

  it('a returning sign-in is subject-lined with the host and every mail sends an html part', () => {
    const mail = source('src/lib/inline-edit/signin-mail.ts');
    assert.match(mail, /`Your sign-in link for \$\{host\}`/);
    assert.match(mail, /html,\n\s*\}\),/);
  });
});
