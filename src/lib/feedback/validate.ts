import 'server-only';
import {
  PRIORITIES,
  REQUEST_TYPES,
  STATUSES,
  URGENCIES,
  type DeviceContext,
  type ElementContext,
  type PageContext,
  type Priority,
  type RequestStatus,
  type RequestType,
  type TeamUpdate,
  type Urgency,
} from './types';

/** Screenshots arrive as JPEG data URLs. Vercel caps a request body at 4.5 MB. */
const MAX_SCREENSHOT_CHARS = 3_000_000;
const MAX_NOTE = 5000;

const str = (value: unknown, max: number): string =>
  typeof value === 'string' ? value.slice(0, max) : '';

const num = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : 0;

function oneOf<T extends string>(list: readonly T[], value: unknown): T | null {
  return typeof value === 'string' && (list as readonly string[]).includes(value)
    ? (value as T)
    : null;
}

export interface ParsedNewRequest {
  type: RequestType;
  urgency: Urgency;
  owner: string;
  note: string;
  page: PageContext | null;
  element: ElementContext | null;
  device: DeviceContext | null;
  screenshot: string | null;
}

export function parseNewRequest(body: unknown, contacts: string[]): ParsedNewRequest | string {
  if (!body || typeof body !== 'object') return 'The request was empty.';
  const input = body as Record<string, unknown>;

  const type = oneOf(REQUEST_TYPES, input.type);
  if (!type) return 'Pick a request type.';
  const urgency = oneOf(URGENCIES, input.urgency);
  if (!urgency) return 'Pick how urgent it is.';
  const owner = typeof input.owner === 'string' && contacts.includes(input.owner) ? input.owner : null;
  if (!owner) return 'Pick who should handle it.';
  const note = str(input.note, MAX_NOTE).trim();
  if (!note) return 'Write a short note.';

  const rawPage = input.page as Record<string, unknown> | null | undefined;
  const page: PageContext | null = rawPage
    ? { url: str(rawPage.url, 2000), path: str(rawPage.path, 1000), title: str(rawPage.title, 300) }
    : null;

  const rawElement = input.element as Record<string, unknown> | null | undefined;
  const rawRect = (rawElement?.rect ?? {}) as Record<string, unknown>;
  const element: ElementContext | null = rawElement
    ? {
        selector: str(rawElement.selector, 1000),
        text: str(rawElement.text, 300),
        rect: { x: num(rawRect.x), y: num(rawRect.y), width: num(rawRect.width), height: num(rawRect.height) },
      }
    : null;

  const rawDevice = input.device as Record<string, unknown> | null | undefined;
  const rawViewport = (rawDevice?.viewport ?? {}) as Record<string, unknown>;
  const device: DeviceContext | null = rawDevice
    ? {
        user_agent: str(rawDevice.user_agent, 500),
        viewport: { width: num(rawViewport.width), height: num(rawViewport.height) },
        pixel_ratio: typeof rawDevice.pixel_ratio === 'number' ? rawDevice.pixel_ratio : 1,
      }
    : null;

  let screenshot: string | null = null;
  if (typeof input.screenshot === 'string' && input.screenshot) {
    if (!input.screenshot.startsWith('data:image/jpeg;base64,')) return 'The screenshot format is wrong.';
    if (input.screenshot.length > MAX_SCREENSHOT_CHARS) return 'The screenshot is too large.';
    screenshot = input.screenshot;
  }

  return { type, urgency, owner, note, page, element, device, screenshot };
}

export function parseTeamUpdate(body: unknown): TeamUpdate | string {
  if (!body || typeof body !== 'object') return 'Nothing to change.';
  const input = body as Record<string, unknown>;
  const update: TeamUpdate = {};

  if ('status' in input) {
    const status = oneOf<RequestStatus>(STATUSES, input.status);
    if (!status) return 'Unknown status.';
    update.status = status;
  }
  if ('urgency' in input) {
    const urgency = oneOf<Urgency>(URGENCIES, input.urgency);
    if (!urgency) return 'Unknown urgency.';
    update.urgency = urgency;
  }
  if ('type' in input) {
    const type = oneOf<RequestType>(REQUEST_TYPES, input.type);
    if (!type) return 'Unknown type.';
    update.type = type;
  }
  if ('priority' in input) {
    if (input.priority === null || input.priority === '') update.priority = null;
    else {
      const priority = oneOf<Priority>(PRIORITIES, input.priority);
      if (!priority) return 'Unknown priority.';
      update.priority = priority;
    }
  }
  if ('owner' in input) {
    update.owner = str(input.owner, 80).trim() || null;
  }
  if ('due_date' in input) {
    const due = str(input.due_date, 10);
    if (due && !/^\d{4}-\d{2}-\d{2}$/.test(due)) return 'The delivery date must look like 2026-10-01.';
    update.due_date = due || null;
  }
  return update;
}

export function parseComment(body: unknown): string | null {
  const text = str((body as Record<string, unknown> | null)?.body, 3000).trim();
  return text || null;
}
