// AWS DynamoDB
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { COGNITO_IDENTITY_POOL_ID, COGNITO_USER_POOL_ID, REGION } from '$env/static/private';

// 2. Create a DynamoDB client scoped to that identity
export async function getDynamoDBClient(idToken: string) {
	const ddb = new DynamoDBClient({
		region: REGION,
		credentials: fromCognitoIdentityPool({
			identityPoolId: COGNITO_IDENTITY_POOL_ID,
			clientConfig: { region: REGION },
			logins: {
				[`cognito-idp.${REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`]: idToken
			}
		})
	});
	return ddb;
}
