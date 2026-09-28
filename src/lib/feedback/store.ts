import 'server-only';
import crypto from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createClient, WatchError, type RedisClientType } from 'redis';
import type {
  FeedbackRequest,
  Person,
  RequestComment,
  RequestEvent,
  TeamUpdate,
} from './types';

/**
 * Where feedback requests are kept.
 *
 * Everything outside this file talks to the FeedbackStore interface only.
 * Today it is Redis (already provisioned for the audit tool, REDIS_URL).
 * Moving to the Spine means writing a second implementation of the same
 * interface and switching `getFeedbackStore()`; the widget, the API routes
 * and the board do not change. `exportAll()` is the one-shot migration path.
 *
 * Local development without REDIS_URL falls back to JSON files in
 * .feedback-data/ (git-ignored), so the tool can be tried on a laptop.
 *
 * Redis keys:
 *   fb:req:<id>            one request, JSON
 *   fb:shot:<id>           its screenshot, JPEG data URL
 *   fb:idx:all             every request id, scored by creation time
 *   fb:idx:client:<slug>   one client's request ids, same scoring
 *   fb:seq:<slug>          per-client counter behind the human ref
 */

export interface NewRequestInput
  extends Pick<
    FeedbackRequest,
    'client_slug' | 'type' | 'urgency' | 'note' | 'page' | 'element' | 'device' | 'created_by'
  > {
  screenshot: string | null;
}

export interface FeedbackStore {
  create(input: NewRequestInput): Promise<FeedbackRequest>;
  get(id: string): Promise<FeedbackRequest | null>;
  list(filter: { client?: string }): Promise<FeedbackRequest[]>;
  update(id: string, changes: TeamUpdate, by: Person): Promise<FeedbackRequest | null>;
  addComment(id: string, body: string, by: Person): Promise<FeedbackRequest | null>;
  getScreenshot(id: string): Promise<string | null>;
  exportAll(): Promise<FeedbackRequest[]>;
}

let client: RedisClientType | null = null;

async function redis(): Promise<RedisClientType> {
  if (client?.isOpen) return client;
  if (!process.env.REDIS_URL) throw new Error('REDIS_URL is not set');
  client = createClient({ url: process.env.REDIS_URL });
  client.on('error', (err) => console.error('[feedback:redis]', err));
  await client.connect();
  return client;
}

const reqKey = (id: string) => `fb:req:${id}`;
const shotKey = (id: string) => `fb:shot:${id}`;
const clientIndex = (slug: string) => `fb:idx:client:${slug}`;
const ALL_INDEX = 'fb:idx:all';

async function readMany(ids: string[]): Promise<FeedbackRequest[]> {
  if (ids.length === 0) return [];
  const r = await redis();
  const rows = await r.mGet(ids.map(reqKey));
  return rows.filter((row): row is string => Boolean(row)).map((row) => JSON.parse(row));
}

/**
 * Read, change and write one request without losing a change made at the
 * same moment by someone else: WATCH aborts the write if the key moved,
 * and we retry on the fresh copy.
 */
async function mutateRedis(
  id: string,
  change: (request: FeedbackRequest) => boolean
): Promise<FeedbackRequest | null> {
  // WATCH belongs to a connection, so each edit gets its own short-lived one.
  const connection = (await redis()).duplicate();
  connection.on('error', (err) => console.error('[feedback:redis]', err));
  await connection.connect();
  try {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await connection.watch(reqKey(id));
      const row = await connection.get(reqKey(id));
      if (!row) {
        await connection.unwatch();
        return null;
      }
      const request = JSON.parse(row) as FeedbackRequest;
      if (!change(request)) {
        await connection.unwatch();
        return request;
      }
      try {
        await connection.multi().set(reqKey(id), JSON.stringify(request)).exec();
        return request;
      } catch (error) {
        if (!(error instanceof WatchError)) throw error;
      }
    }
    throw new Error('Too many edits at once. Try again.');
  } finally {
    await connection.quit().catch(() => undefined);
  }
}

function newRequest(input: NewRequestInput, seq: number): FeedbackRequest {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    ref: `${input.client_slug}-${seq}`,
    client_slug: input.client_slug,
    source: 'site_widget',
    type: input.type,
    urgency: input.urgency,
    note: input.note,
    page: input.page,
    element: input.element,
    device: input.device,
    has_screenshot: Boolean(input.screenshot),
    created_at: now,
    created_by: input.created_by,
    status: 'new',
    priority: null,
    owner: null,
    due_date: null,
    updated_at: now,
    comments: [],
    events: [{ at: now, by: input.created_by, field: 'created', from: null, to: 'new' }],
  };
}

function applyUpdate(request: FeedbackRequest, changes: TeamUpdate, by: Person): boolean {
  const now = new Date().toISOString();
  const events: RequestEvent[] = [];
  for (const field of ['status', 'priority', 'owner', 'due_date', 'type'] as const) {
    if (!(field in changes)) continue;
    const next = changes[field] ?? null;
    const previous = request[field] ?? null;
    if (next === previous) continue;
    events.push({ at: now, by, field, from: previous, to: next });
    (request as unknown as Record<string, unknown>)[field] = next;
  }
  if (events.length === 0) return false;
  request.events.push(...events);
  request.updated_at = now;
  return true;
}

function applyComment(request: FeedbackRequest, body: string, by: Person): void {
  const now = new Date().toISOString();
  const comment: RequestComment = { id: crypto.randomUUID(), author: by, body, created_at: now };
  request.comments.push(comment);
  request.updated_at = now;
}

const redisStore: FeedbackStore = {
  async create(input) {
    const r = await redis();
    const request = newRequest(input, await r.incr(`fb:seq:${input.client_slug}`));
    const id = request.id;

    const score = Date.parse(request.created_at);
    const tx = r.multi();
    tx.set(reqKey(id), JSON.stringify(request));
    if (input.screenshot) tx.set(shotKey(id), input.screenshot);
    tx.zAdd(ALL_INDEX, { score, value: id });
    tx.zAdd(clientIndex(input.client_slug), { score, value: id });
    await tx.exec();
    return request;
  },

  async get(id) {
    const r = await redis();
    const row = await r.get(reqKey(id));
    return row ? (JSON.parse(row) as FeedbackRequest) : null;
  },

  async list({ client: slug }) {
    const r = await redis();
    const ids = await r.zRange(slug ? clientIndex(slug) : ALL_INDEX, 0, -1, { REV: true });
    return readMany(ids);
  },

  async update(id, changes, by) {
    return mutateRedis(id, (request) => applyUpdate(request, changes, by));
  },

  async addComment(id, body, by) {
    return mutateRedis(id, (request) => {
      applyComment(request, body, by);
      return true;
    });
  },

  async getScreenshot(id) {
    const r = await redis();
    return r.get(shotKey(id));
  },

  async exportAll() {
    return this.list({});
  },
};

/* ── Local fallback: JSON files, development only ─────────────────────── */

const DATA_DIR = path.join(process.cwd(), '.feedback-data');

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(path.join(DATA_DIR, file), 'utf8')) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, value: unknown): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, file), JSON.stringify(value, null, 2));
}

// One queue for every file write, so two quick edits cannot overwrite each other.
let fileQueue: Promise<unknown> = Promise.resolve();
function serial<T>(task: () => Promise<T>): Promise<T> {
  const run = fileQueue.then(task, task);
  fileQueue = run.catch(() => undefined);
  return run;
}

const fileStore: FeedbackStore = {
  create: (input) => serial(async () => {
    const requests = await readJson<FeedbackRequest[]>('requests.json', []);
    const seq = requests.filter((r) => r.client_slug === input.client_slug).length + 1;
    const request = newRequest(input, seq);
    requests.push(request);
    await writeJson('requests.json', requests);
    if (input.screenshot) {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(path.join(DATA_DIR, `${request.id}.shot`), input.screenshot);
    }
    return request;
  }),
  async get(id) {
    const requests = await readJson<FeedbackRequest[]>('requests.json', []);
    return requests.find((r) => r.id === id) ?? null;
  },
  async list({ client: slug }) {
    const requests = await readJson<FeedbackRequest[]>('requests.json', []);
    return requests.filter((r) => !slug || r.client_slug === slug).reverse();
  },
  update: (id, changes, by) => serial(async () => {
    const requests = await readJson<FeedbackRequest[]>('requests.json', []);
    const request = requests.find((r) => r.id === id);
    if (!request) return null;
    if (applyUpdate(request, changes, by)) await writeJson('requests.json', requests);
    return request;
  }),
  addComment: (id, body, by) => serial(async () => {
    const requests = await readJson<FeedbackRequest[]>('requests.json', []);
    const request = requests.find((r) => r.id === id);
    if (!request) return null;
    applyComment(request, body, by);
    await writeJson('requests.json', requests);
    return request;
  }),
  async getScreenshot(id) {
    if (!/^[0-9a-f-]{36}$/.test(id)) return null;
    return fs.readFile(path.join(DATA_DIR, `${id}.shot`), 'utf8').catch(() => null);
  },
  async exportAll() {
    return this.list({});
  },
};

export function getFeedbackStore(): FeedbackStore {
  if (!process.env.REDIS_URL && process.env.NODE_ENV !== 'production') return fileStore;
  return redisStore;
}
