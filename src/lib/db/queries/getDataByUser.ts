/**
 * @file dynamoHelpers.ts
 * @description Helper module for querying AWS DynamoDB to fetch user-specific project data.
 *              Exports a function that queries the 'Projects' table using a Cognito Identity ID.
 * @exports getDataByUser
 *
 * @param {DynamoDBClient} ddb      - An initialized AWS DynamoDB client.
 * @param {string}       identityId - Cognito Identity ID of the user to filter projects.
 * @returns {Promise<Array>}        - Promise resolving to an array of DynamoDB items for that user.
 */

// Import the necessary DynamoDB client and command from AWS SDK v3
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

export async function getDataByUser(
	ddb: DynamoDBClient, // Pre-configured DynamoDB client instance
	identityId: string // Cognito Identity ID to filter the query
): Promise<any[] | undefined> {
	// Return type: array of items or undefined if none
	// Build and send a QueryCommand to fetch items where userId equals the provided identityId
	const { Items } = await ddb.send(
		new QueryCommand({
			TableName: 'Projects', // DynamoDB table name
			KeyConditionExpression: 'userId = :uid', // Filter expression on the partition key
			ExpressionAttributeValues: {
				':uid': { S: identityId } // Map placeholder to actual identityId value
			}
		})
	);

	// Return the array of items (or undefined if no matches)
	return Items?.map(item => unmarshall(item)) ?? [];

}
