/**
 * @file src/routes/api/upload-url/+server.ts
 * @description
 *   SvelteKit API route that generates a presigned S3 upload URL for clients.
 *   Clients send a filename and MIME content type, which are validated,
 *   used to derive a deterministic S3 object key (via SHA-256 of filename),
 *   and then a presigned URL is returned for secure, time-limited uploads.
 *
 *   Environment Variables:
 *     - REGION: AWS region (e.g., "us-west-2").
 *     - S3_FILEUPLOADS_BUCKET: Target S3 bucket name for uploads.
 *
 *   Error Handling:
 *     - 400 Bad Request: Invalid JSON payload or schema validation failure.
 *     - 500 Internal Server Error: Failure to generate signed URL.
 */

import { json, error, type RequestHandler } from '@sveltejs/kit';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createHash } from 'crypto';
import { z } from 'zod';

// Load environment variables (must be defined)
import { REGION, S3_FILEUPLOADS_BUCKET } from '$env/static/private';
if (!S3_FILEUPLOADS_BUCKET) {
  throw new Error('Missing S3_FILEUPLOADS_BUCKET env var');
}

// Initialize the AWS S3 client with the specified region
const s3 = new S3Client({ region: REGION });

// Define Zod schema to validate incoming JSON payload
const payloadSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().regex(/^[\w-]+\/[\w-+.]+$/, 'Invalid MIME type')
});

/**
 * POST handler: Validates input, generates a presigned S3 upload URL, and returns it.
 */
export const POST: RequestHandler = async ({ request }) => {
  console.log("Entering Server side POST function: /api/upload-url");
  let filename: string;
  let contentType: string;

  // Parse and validate the JSON body against our schema
  try {
    ({ filename, contentType } = payloadSchema.parse(await request.json()));
  } catch (err) {
    // Return HTTP 400 if validation fails
    throw error(400, `Bad request: ${(err as Error).message}`);
  }

  // Derive a deterministic object key using SHA-256 of the filename
  const hash = createHash('sha256').update(filename).digest('hex');
  // Extract file extension from MIME type (e.g., 'image/png' -> 'png')
  const ext = contentType.split('/').pop() ?? '';
  const key = `${hash}.${ext}`;

  // Prepare the S3 PutObjectCommand with bucket, key, and content type
  const cmd = new PutObjectCommand({
    Bucket: S3_FILEUPLOADS_BUCKET,
    Key: key,
    ContentType: contentType
  });

  try {
    // Generate a presigned URL valid for 1 hour (3600 seconds)
    const url = await getSignedUrl(s3, cmd, { expiresIn: 3600 });
    // Return the signed URL and object key to the client
    return json({ url, key });
  } catch (err) {
    // Log the error for debugging purposes
    console.error('Presign error:', err);
    // Return HTTP 500 on failure to generate URL
    throw error(500, 'Could not generate upload URL');
  }
};
