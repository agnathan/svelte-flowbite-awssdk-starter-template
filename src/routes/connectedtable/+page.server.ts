// Import SvelteKit types and libraries
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

import { getAWSIdentityId } from '$lib/auth/cognito';
import { getDynamoDBClient } from '$lib/db/awsClient';
import { getDataByUser } from '$lib/db/queries/getDataByUser';
// src/routes/+page.server.ts

export const load: PageServerLoad = async ({ locals, cookies }) => {
	console.log('Entering Server side load function: /connectedtable');
	console.log('locals: ', locals);

	console.log('cookies: ', cookies.getAll());
	const idTokencookies = cookies.get('id_token');
	const idTokenLocals = locals.user?.id_token;
	const idToken = cookies.get('id_token') || locals.user?.id_token;
	console.log('idToken: ', idToken);
	console.log('idTokenLocals: ', idTokenLocals);
	console.log('idTokencookies: ', idTokencookies);
	if (!idToken) throw error(401, 'Authentication required. IdToken is not set.');

	let identityId;
	let ddb;
	let data;
	try {
		console.log('Getting AWS Identity ID');
		identityId = await getAWSIdentityId({ idToken });
		console.log('AWS Identity ID: ', identityId);
	} catch {
		throw error(401, 'Authentication required. getAWSIdentityId failed.');
	}

	try {
		console.log('Getting DynamoDB Client');
		ddb = await getDynamoDBClient(idToken);
		console.log('DynamoDB Client: ', ddb);
	} catch {
		throw error(401, 'Authentication required. getDynamoDBClient failed.');
	}

	try {
		console.log('Getting Data by User');
		data = await getDataByUser(ddb, identityId);
		console.log('Data: ', data);
		return { data };
	} catch {
		throw error(401, 'Authentication required. getDataByUser failed.');
	}
};
