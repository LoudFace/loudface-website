'use client';

import { useState } from 'react';
import type { Directory, DirectoryClient } from '@/lib/feedback/directory';
import { formatDate } from '@/components/feedback/format';
import styles from './board.module.css';

/**
 * The People tab: who is on the team, which clients use the tool, and the
 * private links people sign in with. Every change saves at once.
 */

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

async function call<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(path, { ...init, headers: { 'content-type': 'application/json' } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? 'That did not save. Try again.');
  return body as T;
}

export function People({ directory, onChange }: { directory: Directory; onChange: (next: Directory) => void }) {
  const [error, setError] = useState<string | null>(null);
  const [newMember, setNewMember] = useState('');
  const [newClient, setNewClient] = useState('');
  const [linkName, setLinkName] = useState('');
  const [linkClient, setLinkClient] = useState(directory.clients[0]?.slug ?? '');
  const [linkRole, setLinkRole] = useState<'client' | 'team'>('client');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [fresh, setFresh] = useState<string | null>(null);

  async function saveLists(team: string[], clients: DirectoryClient[]) {
    setError(null);
    try {
      const { directory: next } = await call<{ directory: Directory }>('/api/feedback/directory', {
        method: 'PUT',
        body: JSON.stringify({ team, clients }),
      });
      onChange(next);
      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    }
  }

  async function addMember() {
    const name = newMember.trim();
    if (!name) return;
    if (await saveLists([...directory.team, name], directory.clients)) setNewMember('');
  }

  function removeMember(name: string) {
    const clients = directory.clients.map((c) => ({ ...c, contacts: c.contacts.filter((n) => n !== name) }));
    void saveLists(
      directory.team.filter((n) => n !== name),
      clients
    );
  }

  async function addClient() {
    const name = newClient.trim();
    if (!name) return;
    const slug = slugify(name);
    if (await saveLists(directory.team, [...directory.clients, { slug, name, contacts: [] }])) {
      setNewClient('');
      setLinkClient(slug);
    }
  }

  function toggleContact(slug: string, member: string) {
    const clients = directory.clients.map((c) => {
      if (c.slug !== slug) return c;
      const has = c.contacts.includes(member);
      return { ...c, contacts: has ? c.contacts.filter((n) => n !== member) : [...c.contacts, member] };
    });
    void saveLists(directory.team, clients);
  }

  async function addLink() {
    setError(null);
    try {
      const { link } = await call<{ link: Directory['links'][number] }>('/api/feedback/directory/links', {
        method: 'POST',
        body: JSON.stringify({ name: linkName, client: linkClient, role: linkRole }),
      });
      onChange({ ...directory, links: [...directory.links, link] });
      setLinkName('');
      setFresh(link.id);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function removeLink(id: string) {
    setError(null);
    try {
      await call(`/api/feedback/directory/links/${id}`, { method: 'DELETE' });
      onChange({ ...directory, links: directory.links.filter((l) => l.id !== id) });
      setConfirmId(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function copy(id: string, url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setError('Copying is blocked here. Select the link and copy it by hand.');
    }
  }

  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  const clientName = (slug: string) => directory.clients.find((c) => c.slug === slug)?.name ?? slug;

  return (
    <div className={styles.people}>
      {error && <p className={styles.error}>{error}</p>}

      <section className={styles.panel}>
        <h2 className={styles.panelHead}>Team members</h2>
        <p className={styles.meta}>The names a client can hand a request to, and the owners on the board.</p>
        <div className={styles.tags}>
          {directory.team.map((name) => (
            <span key={name} className={styles.tag}>
              {name}
              <button type="button" aria-label={`Remove ${name}`} onClick={() => removeMember(name)}>
                ×
              </button>
            </span>
          ))}
        </div>
        <form
          className={styles.inline}
          onSubmit={(e) => {
            e.preventDefault();
            void addMember();
          }}
        >
          <input id="fb-new-member" value={newMember} onChange={(e) => setNewMember(e.target.value)} placeholder="New team member's name" />
          <button type="submit" className={styles.button}>
            Add member
          </button>
        </form>
      </section>

      <section className={styles.panel}>
        <h2 className={styles.panelHead}>Clients</h2>
        <p className={styles.meta}>Tick who each client can pick. No ticks means the client can pick anyone on the team.</p>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Client</th>
                <th>Id</th>
                {directory.team.map((name) => (
                  <th key={name}>{name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {directory.clients.map((c) => (
                <tr key={c.slug}>
                  <td>{c.name}</td>
                  <td className={styles.ref}>{c.slug}</td>
                  {directory.team.map((name) => (
                    <td key={name}>
                      <input
                        type="checkbox"
                        aria-label={`${c.name} can pick ${name}`}
                        checked={c.contacts.includes(name)}
                        onChange={() => toggleContact(c.slug, name)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form
          className={styles.inline}
          onSubmit={(e) => {
            e.preventDefault();
            void addClient();
          }}
        >
          <input id="fb-new-client" value={newClient} onChange={(e) => setNewClient(e.target.value)} placeholder="New client's name" />
          <button type="submit" className={styles.button}>
            Add client
          </button>
          {newClient.trim() && <span className={styles.meta}>Id: {slugify(newClient)}</span>}
        </form>
      </section>

      <section className={styles.panel}>
        <h2 className={styles.panelHead}>Private links</h2>
        <p className={styles.meta}>
          One link per person. Send it in a direct message: anyone with the link can sign in as that person.
        </p>
        <form
          className={styles.inline}
          onSubmit={(e) => {
            e.preventDefault();
            void addLink();
          }}
        >
          <input id="fb-link-name" value={linkName} onChange={(e) => setLinkName(e.target.value)} placeholder="Person's name" />
          <select id="fb-link-client" value={linkClient} onChange={(e) => setLinkClient(e.target.value)} aria-label="Client">
            {directory.clients.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <select id="fb-link-role" value={linkRole} onChange={(e) => setLinkRole(e.target.value as 'client' | 'team')} aria-label="Role">
            <option value="client">Client (sees only this client)</option>
            <option value="team">Team (sees every client and this board)</option>
          </select>
          <button type="submit" className={styles.button}>
            Make link
          </button>
        </form>

        {directory.links.length === 0 ? (
          <p className={styles.meta}>No links made here yet.</p>
        ) : (
          <ul className={styles.links}>
            {directory.links
              .slice()
              .reverse()
              .map((link) => {
                const url = `${origin}/fb/${link.token}`;
                return (
                  <li key={link.id} className={link.id === fresh ? styles.linkFresh : undefined}>
                    <div className={styles.linkTop}>
                      <strong>{link.name}</strong>
                      <span className={styles.meta}>
                        {clientName(link.client)} · {link.role === 'team' ? 'Team' : 'Client'} · made by {link.created_by},{' '}
                        {formatDate(link.created_at)}
                      </span>
                    </div>
                    <code className={styles.url}>{url}</code>
                    <div className={styles.inline}>
                      <button type="button" className={styles.link} onClick={() => copy(link.id, url)}>
                        {copied === link.id ? 'Copied' : 'Copy link'}
                      </button>
                      {confirmId === link.id ? (
                        <>
                          <span className={styles.meta}>Switch this link off?</span>
                          <button type="button" className={styles.danger} onClick={() => removeLink(link.id)}>
                            Yes, remove
                          </button>
                          <button type="button" className={styles.link} onClick={() => setConfirmId(null)}>
                            Keep it
                          </button>
                        </>
                      ) : (
                        <button type="button" className={styles.link} onClick={() => setConfirmId(link.id)}>
                          Remove
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
          </ul>
        )}
        <p className={styles.meta}>Links set up in the hosting settings (yours and Arnel&rsquo;s) do not show here.</p>
      </section>
    </div>
  );
}
