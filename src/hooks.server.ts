// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Don't protect the /auth/login and /auth/callback routes
	if (
		// event.url.pathname.startsWith('/') ||
		event.url.pathname.startsWith('/auth/login') ||
		event.url.pathname.startsWith('/auth/callback') 
	) {
		return resolve(event);
	}

	// Read token from HttpOnly cookies
	const id_token = event.cookies.get('id_token');
	const access_token = event.cookies.get('access_token');
	const refresh_token = event.cookies.get('refresh_token');

	// If user is not logged in, redirect to login
	if (!id_token || !access_token || !refresh_token) {
		// console.log('User is not logged in, redirecting to login');
		// console.log('id_token:', id_token);
		// console.log('access_token:', access_token);
		// console.log('refresh_token:', refresh_token);
		throw redirect(302, '/auth/login');
	}

	// Store user data on event.locals
	event.locals.user = { id_token, access_token, refresh_token }; // You can decode the token here if needed

	return resolve(event);
};
