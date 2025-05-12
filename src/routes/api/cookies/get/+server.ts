import { json, type RequestHandler } from "@sveltejs/kit";

// Handle GET requests to initiate the OAuth2 authorization code flow with PKCE
export const GET: RequestHandler = async ({ cookies }) => {
    return json({ cookies: cookies.getAll() })
};
