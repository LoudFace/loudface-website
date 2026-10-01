/**
 * Client feedback requests — the record shape.
 *
 * Deliberately shaped like a Spine row (snake_case, one flat record, a
 * client_slug on every row, an append-only event trail) so the store behind
 * it can move from Redis to the Spine without the widget or the board
 * changing. `source` already allows the Slack and email intake that comes
 * later. See docs/FEEDBACK.md.
 */

export const REQUEST_TYPES = ['bug', 'change', 'new', 'question'] as const;
export type RequestType = (typeof REQUEST_TYPES)[number];

export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  bug: 'Bug',
  change: 'Change',
  new: 'New page or feature',
  question: 'Question',
};

/** Set by the client. The team's own ranking lives in `priority`. */
export const URGENCIES = ['urgent', 'this_week', 'no_rush'] as const;
export type Urgency = (typeof URGENCIES)[number];

export const URGENCY_LABELS: Record<Urgency, string> = {
  urgent: 'Urgent',
  this_week: 'This week',
  no_rush: 'No rush',
};

export const STATUSES = [
  'new',
  'accepted',
  'in_progress',
  'ready_for_review',
  'done',
  'wont_do',
] as const;
export type RequestStatus = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<RequestStatus, string> = {
  new: 'New',
  accepted: 'Accepted',
  in_progress: 'In progress',
  ready_for_review: 'Ready for your check',
  done: 'Done',
  wont_do: "Won't do",
};

/** Team-only. Null until someone triages the request. */
export const PRIORITIES = ['high', 'medium', 'low'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export type Role = 'team' | 'client';
export type RequestSource = 'site_widget' | 'slack' | 'email';

export interface Person {
  name: string;
  role: Role;
}

export interface PageContext {
  url: string;
  path: string;
  title: string;
}

/** The section the client pointed at. Null for a general request. */
export interface ElementContext {
  selector: string;
  text: string;
  /** Position in page coordinates, so the team can scroll back to it. */
  rect: { x: number; y: number; width: number; height: number };
}

export interface DeviceContext {
  user_agent: string;
  viewport: { width: number; height: number };
  pixel_ratio: number;
}

export interface RequestComment {
  id: string;
  author: Person;
  body: string;
  created_at: string;
}

/** Append-only trail of every change, the same idea as Spine change events. */
export interface RequestEvent {
  at: string;
  by: Person;
  field: string;
  from: string | null;
  to: string | null;
}

export interface FeedbackRequest {
  id: string;
  /** Human reference, unique per client: "loudface-12". */
  ref: string;
  client_slug: string;
  source: RequestSource;

  type: RequestType;
  urgency: Urgency;
  note: string;

  page: PageContext | null;
  element: ElementContext | null;
  device: DeviceContext | null;
  has_screenshot: boolean;

  created_at: string;
  created_by: Person;

  // The client picks the owner when sending; after that only the team edits
  // these. Clients read status, owner and due_date, never priority.
  status: RequestStatus;
  priority: Priority | null;
  owner: string | null;
  due_date: string | null;

  updated_at: string;
  comments: RequestComment[];
  events: RequestEvent[];
}

/** What a client sees: the team's internal ranking is left out. */
export type ClientView = Omit<FeedbackRequest, 'priority' | 'events'>;

export function toClientView(request: FeedbackRequest): ClientView {
  const view: Partial<FeedbackRequest> = { ...request };
  delete view.priority;
  delete view.events;
  return view as ClientView;
}

export interface TeamUpdate {
  status?: RequestStatus;
  urgency?: Urgency;
  priority?: Priority | null;
  owner?: string | null;
  due_date?: string | null;
  type?: RequestType;
}
