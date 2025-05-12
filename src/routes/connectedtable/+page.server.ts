// Import SvelteKit types and libraries
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

import { getAWSIdentityId } from '$lib/auth/cognito';
import { getDynamoDBClient } from '$lib/db/awsClient';
import { getDataByUser } from '$lib/db/queries/getDataByUser';
// src/routes/+page.server.ts


export const load: PageServerLoad = async ({ locals, cookies }) => {

  const idToken = cookies.get('id_token') || locals.user?.id_token;
  if (!idToken) throw error(401, 'Authentication required.');

  try {
    const identityId = await getAWSIdentityId({ idToken });
    const ddb        = await getDynamoDBClient(idToken);
    const data       = await getDataByUser(ddb, identityId);
    return { data };
  } catch {
    throw error(401, 'Authentication required.');
  }
};
