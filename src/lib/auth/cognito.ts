import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { CognitoIdentityClient, GetIdCommand } from '@aws-sdk/client-cognito-identity';

// Environment variables
import { REGION, COGNITO_USER_POOL_ID, COGNITO_IDENTITY_POOL_ID } from '$env/static/private';

export const getAWSIdentityId = async ({ idToken }: { idToken: string }) => {
	console.log('getAWSIdentityId: ', idToken);
	if (!idToken) {
		throw new Error('Authentication is required and has failed or is missing.');
	}

	// 1. Exchange ID token for an Identity ID
	console.log('Getting Cognito Identity Client');
	const cIdentity = new CognitoIdentityClient({ region: REGION });
	console.log('Getting Cognito Identity ID');

	const command = new GetIdCommand({
		IdentityPoolId: COGNITO_IDENTITY_POOL_ID,
		Logins: {
			[`cognito-idp.${REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`]: idToken
		}
	});
	console.log('Sending GetIdCommand');
	const { IdentityId } = await cIdentity.send(command);
	console.log('Cognito Identity ID: ', IdentityId);
	if (!IdentityId) throw new Error('Failed to get Cognito Identity ID');

	return IdentityId;
};
