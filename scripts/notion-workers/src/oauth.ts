import { worker } from "./databases.js";

// Google OAuth 2.0 for Search Console read access.
// One-time setup:
//   1. Create OAuth 2.0 Client (Web application) in GCP → APIs & Services → Credentials
//   2. ntn workers env set GOOGLE_OAUTH_CLIENT_ID="..." GOOGLE_OAUTH_CLIENT_SECRET="..."
//   3. ntn workers deploy
//   4. ntn workers oauth show-redirect-url googleSearchConsole
//   5. Add that redirect URL to the OAuth client's "Authorized redirect URIs"
//   6. ntn workers oauth start googleSearchConsole  (browser auth dance)
//   7. ntn workers sync trigger gscMetrics
export const gscAuth = worker.oauth("googleSearchConsole", {
	name: "loudface-gsc",
	authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
	tokenEndpoint: "https://oauth2.googleapis.com/token",
	scope: "https://www.googleapis.com/auth/webmasters.readonly",
	clientId: process.env.GOOGLE_OAUTH_CLIENT_ID ?? "",
	clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? "",
	// Force consent screen so we get a refresh token even on re-auth.
	authorizationParams: { access_type: "offline", prompt: "consent" },
});
