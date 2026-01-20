import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Email is required.'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Please enter a valid email address.'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
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
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Successfully subscribed!'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Newsletter subscription error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        message: 'An error occurred. Please try again.'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
