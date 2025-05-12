// src/routes/auth/callback/+server.ts
import { COGNITO_CLIENT_ID, COGNITO_DOMAIN, COGNITO_REDIRECT_URI } from '$env/static/private';
import { error, redirect, type RequestHandler } from '@sveltejs/kit';
// import { exchangeCodeForTokens } from '$lib/auth/cognito';  // your exchange logic
// import { CLIENT_ID } from '$env/static/private';

export const GET: RequestHandler = async ({ cookies, url }) => {
	console.log('Entering Server side GET function: /auth/callback');
	const code = url.searchParams.get('code');

	// const storedState = cookies.get('auth_state');
	const codeVerifier = cookies.get('pkce_verifier');

	if (!code || !codeVerifier) {
		throw error(400, 'Missing/invalid OAuth2 code, state, or PKCE verifier');
	}

	const myHeaders = new Headers();
	myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
	myHeaders.append('Accept', 'application/json');

	const urlencoded = new URLSearchParams();
	urlencoded.append('grant_type', 'authorization_code');
	urlencoded.append('client_id', COGNITO_CLIENT_ID);
	urlencoded.append('code', code);
	urlencoded.append('redirect_uri', COGNITO_REDIRECT_URI);
	urlencoded.append('code_verifier', codeVerifier);

	const requestOptions: RequestInit = {
		method: 'POST',
		headers: myHeaders,
		body: urlencoded
	};

	console.log('Fetching tokens from Cognito');
	console.log('requestOptions: ', requestOptions);
	const response = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, requestOptions);

	if (!response.ok) {
		const errorText = await response.text();
		console.error('Token exchange failed:', {
			status: response.status,
			statusText: response.statusText,
			error: errorText
		});
		throw redirect(302, '/auth/login');
	}

	const tokens = await response.json();
	console.log('tokens: ', tokens);
	// Clean up
	cookies.delete('auth_state', { path: '/auth' });
	cookies.delete('pkce_verifier', { path: '/auth' });

	// Set your session cookie (or however you manage user sessions)
	cookies.set('id_token', tokens.id_token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: tokens.expires_in
	});

	cookies.set('access_token', tokens.access_token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: tokens.expires_in
	});

	cookies.set('refresh_token', tokens.refresh_token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: tokens.expires_in
	});

	throw redirect(302, '/');
};
