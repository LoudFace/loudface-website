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
import { buildSignInHtml, buildSignInText, buttonLabel, escapeHtml, headline } from '../inline-edit/signin-mail-html';
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
  const base = {
    host: 'site.com',
    origin: 'https://site.com',
    link: 'https://site.com/api/lf-edit/verify?token=a.b&x=1',
    lifetime: '12 hours',
  };
  const thumb = /<img [^>]*src="https:\/\/site\.com\/editor-invite\/(edit|comment)\.jpg"/;

  it('each kind has its own button and a headline naming who and which site', () => {
    assert.equal(buttonLabel('edit'), 'Open the site editor');
    assert.equal(buttonLabel('signin'), 'Open the site editor');
    assert.equal(buttonLabel('comment'), 'Start commenting');
    assert.equal(buttonLabel('join'), 'Confirm my email');
    assert.equal(headline({ kind: 'edit', host: 'site.com', invitedBy: 'lf@loudface.co' }), 'Lf invited you to edit site.com');
    assert.equal(headline({ kind: 'edit', host: 'site.com', invitedBy: 'arnel@loudface.co' }), 'Arnel invited you to edit site.com');
    assert.equal(headline({ kind: 'comment', host: 'site.com', invitedBy: 'jo.smith@client.com' }), 'Jo invited you to comment on site.com');
    assert.equal(headline({ kind: 'edit', host: 'site.com' }), 'You can now edit site.com');
    assert.equal(headline({ kind: 'signin', host: 'site.com' }), 'Sign in to edit site.com');
    assert.equal(headline({ kind: 'join', host: 'site.com' }), 'Confirm your email to comment on site.com');
  });

  it('carries the preheader, button, lifetime line, reason and the raw link', () => {
    const html = buildSignInHtml({ ...base, kind: 'edit', invitedBy: 'arnel@loudface.co' });
    assert.match(html, /Open the link to start\. No password, nothing to install\./);
    assert.match(html, /site\.com · Site editor/);
    assert.match(html, /Open the site editor<\/a>/);
    assert.match(html, /The button works for 12 hours\. After that, go to site\.com\/edit, type this email address, and you get a fresh link\./);
    assert.match(html, /You received this because arnel@loudface\.co added you to site\.com\. If you did not expect it, you can ignore this email\./);
    assert.match(html, /Site editor by LoudFace/);
    assert.match(html, /name="color-scheme" content="light"/);
    assert.equal(html.split('token=a.b&amp;x=1').length - 1, 3);
  });

  it('the lifetime comes from the value given, never fixed in the markup', () => {
    assert.match(buildSignInHtml({ ...base, kind: 'edit', lifetime: lifetimeLabel(INVITE_LINK_MINUTES) }), /works for 12 hours\./);
    assert.match(buildSignInHtml({ ...base, kind: 'signin', lifetime: '15 minutes' }), /works for 15 minutes\./);
  });

  it('edit and comment invitations have their own lead and steps', () => {
    const edit = buildSignInHtml({ ...base, kind: 'edit', invitedBy: 'lf@loudface.co' });
    assert.match(edit, /You can now change the words, pictures and links on the site yourself/);
    assert.match(edit, /Click any text or picture/);
    assert.match(edit, /Changed your mind\?/);
    assert.doesNotMatch(edit, /Press Comment/);
    const comment = buildSignInHtml({ ...base, kind: 'comment', invitedBy: 'lf@loudface.co' });
    assert.match(comment, /You can now leave notes right on the page/);
    assert.match(comment, /Click anywhere and type your note/);
    assert.match(comment, /Everyone on the site sees it/);
    assert.doesNotMatch(comment, /Press Publish/);
  });

  it('the screenshot and the steps appear on invitations only', () => {
    assert.match(buildSignInHtml({ ...base, kind: 'edit' }), thumb);
    assert.match(buildSignInHtml({ ...base, kind: 'comment' }), /editor-invite\/comment\.jpg/);
    for (const kind of ['signin', 'join'] as const) {
      const html = buildSignInHtml({ ...base, kind });
      assert.doesNotMatch(html, /<img|editor-invite|How it works/);
    }
  });

  it('the screenshot has real alt text and links to the sign-in link', () => {
    const html = buildSignInHtml({ ...base, kind: 'edit' });
    assert.match(html, /alt="The site with the editing bar on top and a headline being edited"/);
    assert.match(html, /<a href="https:\/\/site\.com\/api\/lf-edit\/verify\?token=a\.b&amp;x=1"[^>]*><img /);
  });

  it('the returning sign-in and the join mail share the shell without steps', () => {
    const signin = buildSignInHtml({ ...base, kind: 'signin' });
    assert.match(signin, /Sign in to edit site\.com/);
    assert.match(signin, /works for 12 hours\. After that, go to site\.com\/edit/);
    const join = buildSignInHtml({ ...base, kind: 'join' });
    assert.match(join, /Confirm my email<\/a>/);
    assert.match(join, /If you did not ask for this, ignore this email/);
  });

  it('escapes every interpolated value', () => {
    const html = buildSignInHtml({
      kind: 'comment',
      host: 'evil"><script>alert(1)</script>.com',
      origin: 'https://x.com"><script>',
      link: 'https://x.com/?a="><img src=x>',
      invitedBy: '<b>me</b>@x.co',
      lifetime: '12 <hours>',
    });
    assert.doesNotMatch(html, /<script>|<img src=x>|<b>/);
    assert.match(html, /&lt;script&gt;/);
    assert.equal(escapeHtml(`<>&"'`), '&lt;&gt;&amp;&quot;&#39;');
  });

  it('plain text carries the headline, lead, link, the three steps and the lifetime in order', () => {
    const text = buildSignInText({ ...base, kind: 'edit', invitedBy: 'arnel@loudface.co' });
    const order = [
      'Arnel invited you to edit site.com.',
      'You can now change the words',
      base.link,
      '1. Click any text or picture.',
      '2. Press Publish.',
      '3. Changed your mind?',
      'The button works for 12 hours.',
    ];
    const at = order.map((part) => text.indexOf(part));
    assert.ok(at.every((index) => index >= 0), `missing part in:\n${text}`);
    assert.deepEqual([...at].sort((a, b) => a - b), at);
    assert.doesNotMatch(buildSignInText({ ...base, kind: 'signin' }), /How it works/);
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
