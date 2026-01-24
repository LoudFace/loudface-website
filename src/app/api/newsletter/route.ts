import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Email is required.' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // TODO: Integrate with your email service provider
    // Examples:
    // - Mailchimp: POST to /lists/{list_id}/members
    // - ConvertKit: POST to /forms/{form_id}/subscribe
    // - Resend: POST to /audiences/{audience_id}/contacts
    // - SendGrid: POST to /marketing/contacts

    // For now, log the subscription (replace with actual integration)
    console.log(`Newsletter subscription: ${email}`);

    // Return success
    return NextResponse.json(
      { success: true, message: 'Successfully subscribed!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);

    return NextResponse.json(
      { success: false, message: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
