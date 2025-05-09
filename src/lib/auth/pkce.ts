/**
 * pkce-utils.ts
 * ------------------
 * Utility helpers for generating PKCE (Proof Key for Code Exchange) parameters
 * used in OAuth 2.0 authorization flows—specifically the high‑entropy
 * code verifier and its corresponding SHA‑256 based code challenge.
 *
 * How it works:
 * 1. `generateCodeVerifier()` creates a 32‑byte cryptographically‑secure random
 *    sequence and Base64‑URL encodes it (RFC 4648 §5).
 * 2. `generateCodeChallenge(verifier)` hashes the verifier with SHA‑256 and
 *    encodes the resulting digest the same way, yielding the code challenge.
 *
 * Author: Daniel Holmlund
 * Created: 2025‑05‑03
 * License: MIT
 */

import crypto from 'crypto';

/**
 * Encodes a binary buffer using the Base64‑URL alphabet (RFC 4648 §5) and
 * strips any trailing padding characters ("=").
 *
 * @param buffer - The byte array to encode.
 * @returns The Base64‑URL encoded string.
 */
const base64UrlEncode = (buffer: Uint8Array): string =>
	btoa(String.fromCharCode(...buffer))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');

/**
 * Generates a cryptographically secure **code verifier** as specified by
 * RFC 7636 §4.1. The function uses 32 bytes (256 bits) of entropy, which
 * results in a 43‑character Base64‑URL encoded string—well within the
 * required 43–128 character length range.
 *
 * @returns A Base64‑URL encoded PKCE code verifier.
 */
export const generateCodeVerifier = (): string => {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return base64UrlEncode(array);
};

/**
 * Derives the **code challenge** for a given verifier using the "S256" method
 * (SHA‑256 followed by Base64‑URL encoding without padding) as described
 * in RFC 7636 §4.2.
 *
 * @param codeVerifier - A previously generated PKCE code verifier.
 * @returns The associated code challenge string.
 */
export const generateCodeChallenge = (codeVerifier: string): string =>
	base64UrlEncode(crypto.createHash('sha256').update(codeVerifier).digest());
