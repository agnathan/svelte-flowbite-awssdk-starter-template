import { redirect, type RequestHandler } from "@sveltejs/kit";

// Handle GET requests to initiate the OAuth2 authorization code flow with PKCE
export const GET: RequestHandler = async ({ cookies }) => {
	
    cookies.set('yomama', '1234567890', {
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		path: '/api/cookies/get',
		maxAge: 300
	});

	const loginUrl = new URL('http://localhost:5173/api/cookies/get');
    throw redirect(302, loginUrl.toString());
};
