// src/routes/auth/login/+server.ts
import { redirect, type RequestHandler } from '@sveltejs/kit';
// Import PKCE utilities for generating the code verifier and code challenge
import { generateCodeChallenge, generateCodeVerifier } from '$lib/auth/pkce';
import {
	COGNITO_CLIENT_ID, // Your AWS Cognito App Client ID
	COGNITO_REDIRECT_URI, // The URI Cognito will redirect to after login
	COGNITO_DOMAIN // Your AWS Cognito domain (e.g., yourapp.auth.us-west-2.amazoncognito.com)
} from '$env/static/private';
import { v4 as uuidv4 } from 'uuid';

export const GET: RequestHandler = async ({ cookies, url }) => {
	// 1. Generate a random PKCE code verifier
	const verifier = generateCodeVerifier();
	// 2. Derive the code challenge from the verifier (SHA256 + base64-url)
	const challenge = generateCodeChallenge(verifier);
	const state = uuidv4();

	console.log(
		"process.env.NODE_ENV === 'production': ",
		process.env.NODE_ENV === 'production',
		process.env.NODE_ENV
	);

	const isProd = process.env.NODE_ENV === 'production';
	// Store both verifier and state
	cookies.set('pkce_verifier', verifier, {

		httpOnly: true,
		secure: isProd,      
		sameSite: isProd ? 'none' : 'lax',   
		path: '/',            // send on every route
		maxAge: 300
		// httpOnly: true,
		// secure: process.env.NODE_ENV === 'production',
		// sameSite: 'lax',
		// path: '/auth', // <-- broader path
		// maxAge: 300 // 5 minutes
	});
	cookies.set('auth_state', state, {
		httpOnly: true,
		secure: isProd,      
		sameSite: isProd ? 'none' : 'lax',
		path: '/',            // send on every route
		maxAge: 300
		// httpOnly: true,
		// secure: process.env.NODE_ENV === 'production',
		// sameSite: 'lax',
		// path: '/auth',
		// maxAge: 300
	});

    console.log("/auth/login cookies: ", cookies.getAll());

	// const redirectUri = url.origin + '/auth/callback';
	// const loginUrl = new URL(`${COGNITO_DOMAIN}/oauth2/authorize`);
	// loginUrl.searchParams.set('response_type', 'code');
	// loginUrl.searchParams.set('client_id', COGNITO_CLIENT_ID);
	// loginUrl.searchParams.set('redirect_uri', redirectUri);
	// loginUrl.searchParams.set('state', state);
	// loginUrl.searchParams.set('code_challenge_method', 'S256');
	// loginUrl.searchParams.set('code_challenge', challenge);


	// 4. Build the Cognito Hosted UI login URL with required query parameters
	const loginUrl = new URL(`${COGNITO_DOMAIN}/login`);
	// Identify the client application
	loginUrl.searchParams.set('client_id', COGNITO_CLIENT_ID);
	// Use authorization code flow
	loginUrl.searchParams.set('response_type', 'code');
	// Request scopes for user info
	loginUrl.searchParams.set('scope', 'email openid phone');
	// Where Cognito should redirect after successful login
	loginUrl.searchParams.set('redirect_uri', COGNITO_REDIRECT_URI);
	// Attach the PKCE code challenge
	loginUrl.searchParams.set('code_challenge', challenge);
	// Specify the code challenge method
	loginUrl.searchParams.set('code_challenge_method', 'S256');

	console.log('loginUrl:', loginUrl);

	throw redirect(302, loginUrl.toString());
};
