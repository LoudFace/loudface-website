import 'server-only';
import crypto from 'node:crypto';
import { getFeedbackStore } from './store';
import type { Role } from './types';

/**
 * Who works on the tool and for whom, edited by the team on the board's
 * People tab: team members (the names a request can be handed to), clients
 * (and which team members each can pick), and the private links people sign
 * in with. Kept in the same store as the requests, as one document.
 *
 * Links in the FEEDBACK_ACCESS env var still work as well; they are the
 * bootstrap that lets the first team member in to create the rest.
 */

export interface DirectoryClient {
  slug: string;
  name: string;
  /** Team members this client can pick. Empty means everyone on the team. */
  contacts: string[];
}

export interface DirectoryLink {
  id: string;
  token: string;
  client: string;
  name: string;
  role: Role;
  created_at: string;
  created_by: string;
}

export interface Directory {
  team: string[];
  clients: DirectoryClient[];
  links: DirectoryLink[];
}

export const DEFAULT_DIRECTORY: Directory = {
  team: ['Andrea', 'Abhay', 'Tamara'],
  clients: [{ slug: 'loudface', name: 'LoudFace', contacts: [] }],
  links: [],
};

export async function getDirectory(): Promise<Directory> {
  const stored = await getFeedbackStore().getDirectory();
  return stored ?? structuredClone(DEFAULT_DIRECTORY);
}

export async function saveDirectory(directory: Directory): Promise<void> {
  await getFeedbackStore().saveDirectory(directory);
}

/** The names a client can hand a request to. */
export async function contactsFor(client: string): Promise<string[]> {
  const directory = await getDirectory();
  const entry = directory.clients.find((c) => c.slug === client);
  const picked = (entry?.contacts ?? []).filter((name) => directory.team.includes(name));
  return picked.length > 0 ? picked : directory.team;
}

export function newLinkToken(): string {
  return crypto.randomBytes(33).toString('base64url');
}

export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
