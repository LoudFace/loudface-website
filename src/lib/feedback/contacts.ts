/**
 * The LoudFace people a client can hand a request to, per client. The client
 * picks one when sending; the team can reassign on the board (cover for
 * holidays, hand-offs). Moves to the client's Spine record later.
 */
const DEFAULT_CONTACTS = ['Andrea', 'Abhay', 'Tamara'];

const CLIENT_CONTACTS: Record<string, string[]> = {
  loudface: DEFAULT_CONTACTS,
};

export function contactsFor(client: string): string[] {
  return CLIENT_CONTACTS[client] ?? DEFAULT_CONTACTS;
}
