import { createHash } from 'node:crypto';

const META_GRAPH_API_VERSION = 'v25.0';
/** Required by Meta whenever action_source is 'website'. Bookings start from the Cal modal. */
const EVENT_SOURCE_URL = 'https://www.loudface.co/contact';

type MetaScheduleEvent = {
  bookingUid: string;
  email: string;
  name?: string;
  eventTime: number;
};

function hashUserData(value: string | undefined): string | undefined {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return undefined;

  return createHash('sha256').update(normalized).digest('hex');
}

function hashName(name: string | undefined): { fn?: string; ln?: string } {
  const normalized = name?.trim().toLowerCase();
  if (!normalized) return {};

  const [firstName, ...lastName] = normalized.split(/\s+/);
  return {
    fn: hashUserData(firstName),
    ln: hashUserData(lastName.join(' ')),
  };
}

/** Sends the server-side Schedule event for a confirmed Cal.com booking. */
export async function sendMetaScheduleEvent({
  bookingUid,
  email,
  name,
  eventTime,
}: MetaScheduleEvent): Promise<void> {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return;

  const endpoint = new URL(
    `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${encodeURIComponent(pixelId)}/events`
  );
  endpoint.searchParams.set('access_token', accessToken);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [
          {
            event_name: 'Schedule',
            event_time: Math.floor(eventTime),
            event_id: `cal_booking_${bookingUid}`,
            action_source: 'website',
            event_source_url: EVENT_SOURCE_URL,
            user_data: {
              em: hashUserData(email),
              ...hashName(name),
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('[meta-capi] Schedule delivery failed', response.status, response.statusText);
    }
  } catch {
    console.error('[meta-capi] Schedule delivery failed');
  }
}
