// src/routes/logout/+server.ts

/**
 * Logout Endpoint Handler
 * 
 * This SvelteKit server route handles user logout by:
 * 1. Deleting authentication-related cookies (`access_token`, `id_token`, `refresh_token`)
 * 2. Redirecting the user to the AWS Cognito logout endpoint, which clears the Cognito session
 * 
 * The logout redirect URI must be whitelisted in the Cognito app client settings.
 * 
 * Environment Variables Used:
 * - AWS_COGNITO_CLIENT_ID: The Cognito App Client ID
 * - AWS_COGNITO_LOGOUT_URI: The URI Cognito should redirect to after logout
 * - AWS_COGNITO_DOMAIN: The Cognito hosted UI domain
 */

// Import the RequestHandler type and redirect utility from SvelteKit
import type { RequestHandler } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

// Import Cognito configuration values from private environment variables
import {
	AWS_COGNITO_CLIENT_ID,
	AWS_COGNITO_LOGOUT_URI,
	AWS_COGNITO_DOMAIN
} from '$env/static/private';

// Handle GET requests to the /logout endpoint
export const GET: RequestHandler = async ({ cookies }) => {
	// Delete authentication-related cookies from the client
	cookies.delete('access_token', { path: '/' });
	cookies.delete('id_token', { path: '/' });
	cookies.delete('refresh_token', { path: '/' });

	// Build the Cognito logout URL
	const logoutUrl = new URL(`${AWS_COGNITO_DOMAIN}/logout`);
	
	// Add required query parameters to logout from Cognito:
	// - client_id: identifies the app
	// - logout_uri: where Cognito should redirect the user after logout
	logoutUrl.searchParams.set('client_id', AWS_COGNITO_CLIENT_ID);
	logoutUrl.searchParams.set('logout_uri', AWS_COGNITO_LOGOUT_URI); // Must be whitelisted in Cognito settings

	// Redirect the user to the Cognito logout endpoint
	throw redirect(302, logoutUrl.toString());
};
