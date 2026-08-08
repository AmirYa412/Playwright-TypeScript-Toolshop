/** Decoded JWT payload fields this framework reads. Signature is never verified client-side. */
interface JwtPayload {
  exp: number;
}

/** Decodes a JWT's payload segment without verifying its signature. */
function decodePayload(token: string): JwtPayload {
  const payload = token.split('.')[1];
  if (!payload) throw new Error('Malformed JWT: missing payload segment');
  const json = Buffer.from(payload, 'base64url').toString('utf-8');
  return JSON.parse(json) as JwtPayload;
}

/** True if `token` expires within `skewSeconds` from now, is already expired, or can't be parsed. */
export function isExpiringSoon(token: string, skewSeconds: number): boolean {
  try {
    const { exp } = decodePayload(token);
    return exp * 1000 - Date.now() < skewSeconds * 1000;
  } catch {
    return true;
  }
}
