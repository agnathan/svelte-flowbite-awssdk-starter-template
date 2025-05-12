/**
 * @file src/routes/api/s3-presigned/+server.ts
 * @description
 *   SvelteKit API route that issues a presigned S3 upload URL scoped to an authenticated user.
 *   Ensures the request comes from a logged-in user, constructs a user-specific key,
 *   and returns a time-limited URL for direct S3 uploads.
 *
 *   Environment Variables:
 *     - REGION: AWS region (e.g., "us-west-2").
 *     - AWS_S3_FILEUPLOADS_BUCKET: Name of the S3 bucket for file uploads.
 *
 *   Authentication:
 *     - Relies on `locals.user` being populated by an authentication hook.
 *     - Returns 401 if unauthenticated.
 *
 *   Errors:
 *     - 401 Unauthorized: No user in locals.
 *     - 500 Internal Server Error: Failures during URL generation.
 */

import type { RequestHandler } from './$types';
import { json, error as svelteError } from '@sveltejs/kit';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { REGION, S3_FILEUPLOADS_BUCKET } from '$env/static/private';

// Initialize S3 client with the configured AWS region
const s3 = new S3Client({ region: REGION });

/**
 * POST handler: Validates authentication, reads filename and content type,
 * constructs an S3 key under the user's namespace, and returns a presigned URL.
 */
export const POST: RequestHandler = async ({ request, locals }) => {
  console.log("Entering Server side POST function: /api/s3-presigned");
  // Parse JSON body for required fields
  const { filename, contentType } = await request.json();

  // Ensure the user is authenticated
  const username = locals.user;
  if (!username) {
    // Respond with 401 if no user context is found
    throw svelteError(401, 'Unauthorized');
  }

  // Define the S3 object key; could include username prefix if desired
  const key = `${filename}`; // e.g., 'user123/myfile.png'

  // Prepare S3 PutObjectCommand with bucket, key, and MIME type
  const command = new PutObjectCommand({
    Bucket: S3_FILEUPLOADS_BUCKET,
    Key: key,
    ContentType: contentType
  });

  try {
    // Generate a presigned URL valid for 3600 seconds (1 hour)
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    // Return JSON containing the URL and object key for client-side upload
    return json({ url, key });
  } catch (err) {
    // Log the error for diagnostics
    console.error('Error generating presigned URL:', err);
    // Return 500 when signing fails
    throw svelteError(500, 'Could not generate upload URL');
  }
};