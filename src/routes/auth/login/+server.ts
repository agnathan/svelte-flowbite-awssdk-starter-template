/**
 * @file src/routes/auth/login/+server.ts
 * @description
 * SvelteKit GET handler that initiates an AWS Cognito OAuth2 authorization flow using PKCE.
 * 
 * This endpoint performs the following steps:
 *   1. Generates a PKCE code verifier and its corresponding code challenge.
 *   2. Stores the verifier in a secure, HttpOnly cookie (valid for 5 minutes) at `/auth/callback`.
 *   3. Constructs the AWS Cognito Hosted UI login URL with:
 *      - client_id
 *      - response_type=code
 *      - requested scopes (email, openid, phone)
 *      - redirect_uri
 *      - code_challenge (S256)
 *      - code_challenge_method=S256
 *   4. Issues a 302 redirect to the Cognito Hosted UI to prompt user authentication.
 * 
 * @requires $lib/auth/pkce            PKCE helper functions: generateCodeVerifier, generateCodeChallenge
 * @requires @sveltejs/kit             SvelteKit redirect utility and RequestHandler type
 * @requires $env/static/private       COGNITO_CLIENT_ID, COGNITO_REDIRECT_URI, COGNITO_DOMAIN
 * 
 * @example
 * // In your SvelteKit routes:
 * // GET /auth/login  →  this handler runs, sets PKCE cookie, and redirects to Cognito
 * 
 * @export {RequestHandler} GET        SvelteKit GET handler exported for the `/auth/login` route
 */


// Import PKCE utilities for generating the code verifier and code challenge
import { generateCodeChallenge, generateCodeVerifier } from '$lib/auth/pkce';
// Import redirect helper and RequestHandler type from SvelteKit
import { redirect, type RequestHandler } from '@sveltejs/kit';
// Load Cognito configuration from environment variables
import {
	COGNITO_CLIENT_ID,    // Your AWS Cognito App Client ID
	COGNITO_REDIRECT_URI, // The URI Cognito will redirect to after login
	COGNITO_DOMAIN        // Your AWS Cognito domain (e.g., yourapp.auth.us-west-2.amazoncognito.com)
} from '$env/static/private';

// Handle GET requests to initiate the OAuth2 authorization code flow with PKCE
export const GET: RequestHandler = async ({ cookies }) => {
	console.log("Entering Server side GET function: /auth/login");
	// 1. Generate a random PKCE code verifier
	const verifier = generateCodeVerifier();
	// 2. Derive the code challenge from the verifier (SHA256 + base64-url)
	const challenge = generateCodeChallenge(verifier);

	// 3. Store the verifier in a secure, HttpOnly cookie for later verification
	cookies.set('pkce_verifier', verifier, {
		httpOnly: true,  // prevent JavaScript access
		secure: true,    // send only over HTTPS
		sameSite: 'lax', // protect against CSRF
		path: '/auth/callback', // restrict cookie to callback route
		maxAge: 300     // expire after 5 minutes
	});

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
	// 5. Redirect the user to the Cognito login page
	throw redirect(302, loginUrl.toString());
};
