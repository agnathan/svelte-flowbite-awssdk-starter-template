/**
 * File: /auth/callback/+server.ts
 * Description: This is a SvelteKit server side function that implements the callback needed for
 *              AWS Cognito Authentication Workflow (Authorization Code Grant with PKCE)
 *
 * AWS Cognito Authentication Workflow (Authorization Code Grant with PKCE)
 * ----------------------------------------------------------------------------
 * This flow uses the Hosted UI, a code_challenge (PKCE), and token exchange
 * to securely authenticate users in a SvelteKit app or browser-based client.
 *
 * STEP 1: Generate a code_verifier and code_challenge
 * -----------------------------------------------------
 * const codeVerifier = generateCodeVerifier();           // random string (43-128 chars)
 * const codeChallenge = await generateCodeChallenge(codeVerifier); // base64url(sha256(codeVerifier))
 *
 * Store the codeVerifier (e.g., in a secure cookie or sessionStorage).
 *
 * STEP 2: Redirect the user to the AWS Cognito Hosted UI
 * -------------------------------------------------------
 * Build the URL:
 * https://<your-domain>.auth.<region>.amazoncognito.com/login
 *   ?response_type=code
 *   &client_id=<your-client-id>
 *   &redirect_uri=<your-redirect-uri>
 *   &scope=openid+email+profile
 *   &code_challenge=<code_challenge>
 *   &code_challenge_method=S256
 *
 * Redirect the user to that URL.
 *
 * STEP 3: Cognito redirects back with a code
 * -------------------------------------------
 * Cognito will redirect to:
 * https://<your-redirect-uri>?code=<authorization_code>
 *
 * Capture this `code` in your callback route/page.
 * Retrieve the stored `code_verifier`.
 *
 * STEP 4: Exchange the code for tokens
 * -------------------------------------
 * POST to https://<your-domain>.auth.<region>.amazoncognito.com/oauth2/token
 * Content-Type: application/x-www-form-urlencoded
 * Body:
 *   grant_type=authorization_code
 *   code=<authorization_code>
 *   redirect_uri=<your-redirect-uri>
 *   client_id=<your-client-id>
 *   code_verifier=<your-original-code-verifier>
 *
 * If successful, you'll receive:
 * {
 *   access_token: "...",
 *   id_token: "...",
 *   refresh_token: "...",
 *   token_type: "Bearer",
 *   expires_in: 3600
 * }
 *
 * STEP 5: Store tokens securely
 * ------------------------------
 * - Store tokens in HTTP-only cookies (recommended), or
 * - Use a SvelteKit store (for client-side access), or
 * - Use sessionStorage (if needed temporarily)
 *
 * STEP 6: Use tokens
 * -------------------
 * - Use `access_token` for authenticated API requests (Authorization header)
 * - Use `id_token` to identify the user (contains name, email, etc.)
 * - Use `refresh_token` to get new tokens without requiring re-login
 *
 * STEP 7: Logging out
 * --------------------
 * - Clear cookies or sessionStorage
 * - Optionally redirect to:
 *   https://<your-domain>.auth.<region>.amazoncognito.com/logout
 *     ?client_id=<your-client-id>
 *     &logout_uri=<your-post-logout-redirect>
 */

// Import SvelteKit's helper to return JSON responses in endpoints
import { json, redirect } from '@sveltejs/kit';
// Import the type definition for a SvelteKit request handler (for type safety)
import type { RequestHandler } from './$types';

import { generateCodeChallenge, generateCodeVerifier } from '$lib/auth/pkce';
// Import environment variables securely from your SvelteKit project's private environment file
// These are injected at build-time and never exposed to the client
import {
	COGNITO_CLIENT_ID, // Your AWS Cognito App Client ID
	COGNITO_REDIRECT_URI, // The URI Cognito will redirect to after login
	COGNITO_DOMAIN // Your AWS Cognito domain (e.g., yourapp.auth.us-west-2.amazoncognito.com)
} from '$env/static/private';


/**
 * Decodes the payload of a JWT (JSON Web Token) and returns it as a JavaScript object.
 * 
 * @param token - A JWT string in the format 'header.payload.signature'
 * @returns The decoded payload as a key-value object
 * @throws If the token does not contain a payload section
 */
function decodeJwtPayload(token: string): Record<string, any> {
	// Split the JWT into its three parts: header, payload, and signature
	const [, payload] = token.split('.');
  
	// If there's no payload, throw an error indicating the token is invalid
	if (!payload) throw new Error('Invalid JWT');
  
	// Base64URL decode the payload by replacing URL-safe characters
	const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
  
	// Parse the decoded JSON string into a JavaScript object and return it
	return JSON.parse(json);
  }
  

export const GET: RequestHandler = async ({ fetch, cookies, url }) => {
	console.log("Entering Server side GET function: /auth/callback");
	// Get the authorization code from the URL query parameters
	const code = url.searchParams.get('code');
	const verifier = cookies.get('pkce_verifier')

	if (!code || !verifier) {
		return json({ error: 'Missing code or PKCE verifier' }, { status: 400 });
	}

	// Get code verifier and challenge
	// const codeChallenge = generateCodeChallenge(verifier)

	const myHeaders = new Headers();
	myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
	myHeaders.append('Accept', 'application/json');
	// // myHeaders.append("Cookie", "XSRF-TOKEN=0b7f84da-76e7-4a7b-b3a1-830d91798b2c");
	
	const urlencoded = new URLSearchParams();
	urlencoded.append('grant_type', 'authorization_code');
	urlencoded.append('client_id', COGNITO_CLIENT_ID);
	urlencoded.append('code', code);
	urlencoded.append('redirect_uri', COGNITO_REDIRECT_URI);
	urlencoded.append('code_verifier', verifier);

	const requestOptions: RequestInit = {
		method: 'POST',
		headers: myHeaders,
		body: urlencoded
	};

	console.log("Fetching tokens from Cognito");
	console.log("requestOptions: ", requestOptions);
	const response = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, requestOptions);

	if (!response.ok) {
		throw redirect(302, '/auth/login');
		// const errorText = await response.text();
		// throw new Error(
		// 	`Token exchange failed: ${response.status} ${response.statusText} — ${errorText}`
		// );
	}

	const tokens = await response.json();

	const { id_token, access_token, refresh_token, expires_in } = tokens
	// console.log("id_token: ", id_token)
	// console.log("access_token: ", access_token)
	// console.log("id_token: ", decodeJwtPayload(id_token))
	// console.log("access_token: ", decodeJwtPayload(access_token))
	
	// Store tokens server-side in HttpOnly cookies
	cookies.set('id_token', id_token, {
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		path: '/',
		maxAge: expires_in
	});

	cookies.set('access_token', access_token, {
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		path: '/',
		maxAge: expires_in
	});

	cookies.set('refresh_token', refresh_token, {
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		path: '/',
		maxAge: 30 * 24 * 60 * 60
	});

	throw redirect(302, '/');
};
