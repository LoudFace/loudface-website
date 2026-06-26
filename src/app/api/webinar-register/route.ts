import { NextRequest, NextResponse } from 'next/server';

const NOTION_DB_ID = '65e632aafc4f4907814037903beba8a7';
const NOTION_VERSION = '2022-06-28';

export async function POST(request: NextRequest) {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    console.error('NOTION_TOKEN env var not set');
    return NextResponse.json({ success: false, message: 'Server configuration error.' }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body.' }, { status: 400 });
  }

  const { name, email, company, jobTitle, linkedin, consent } = body as {
    name?: string;
    email?: string;
    company?: string;
    jobTitle?: string;
    linkedin?: string;
    consent?: boolean;
  };

  if (!name || !email || !company || !jobTitle) {
    return NextResponse.json({ success: false, message: 'Required fields missing.' }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ success: false, message: 'Please enter a valid email address.' }, { status: 400 });
  }

  const notionPage = {
    parent: { database_id: NOTION_DB_ID },
    properties: {
      Name: {
        title: [{ text: { content: name } }],
      },
      Email: {
        email,
      },
      Company: {
        rich_text: [{ text: { content: company } }],
      },
      'Job Title': {
        rich_text: [{ text: { content: jobTitle } }],
      },
      ...(linkedin
        ? { LinkedIn: { url: linkedin } }
        : {}),
      Consent: {
        checkbox: Boolean(consent),
      },
      Webinar: {
        select: { name: 'AI Search Visibility — July 9 2026' },
      },
    },
  };

  try {
    const res = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': NOTION_VERSION,
      },
      body: JSON.stringify(notionPage),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('Notion API error:', err);
      return NextResponse.json({ success: false, message: 'Failed to save registration.' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Webinar registration error:', err);
    return NextResponse.json({ success: false, message: 'An error occurred. Please try again.' }, { status: 500 });
  }
}
