// src/routes/auth/callback/+server.ts
import { error, redirect, type RequestHandler } from '@sveltejs/kit';
// import { exchangeCodeForTokens } from '$lib/auth/cognito';  // your exchange logic
// import { CLIENT_ID } from '$env/static/private';

export const GET: RequestHandler = async ({ cookies, url }) => {
	console.log('Entering Server side GET function: /auth/callback');
	console.log("cookies: ", cookies.getAll());
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');

	// const storedState = cookies.get('auth_state');
	const codeVerifier = cookies.get('pkce_verifier');

	if (!code || !state || !codeVerifier) {
		throw error(400, 'Missing/invalid OAuth2 code, state, or PKCE verifier');
	}

	//   // Exchange the code + verifier for tokens
	//   const tokens = await exchangeCodeForTokens({
	//     clientId: CLIENT_ID,
	//     code,
	//     redirectUri: url.origin + '/auth/callback',
	//     codeVerifier
	//   });

	//   // Clean up
	//   cookies.delete('auth_state',   { path: '/auth' });
	//   cookies.delete('pkce_verifier', { path: '/auth' });

	//   // Set your session cookie (or however you manage user sessions)
	//   cookies.set('session_token', tokens.id_token, {
	//     httpOnly: true,
	//     secure: process.env.NODE_ENV === 'production',
	//     sameSite: 'lax',
	//     path: '/',
	//     maxAge: tokens.expires_in
	//   });

	throw redirect(302, '/');
};
