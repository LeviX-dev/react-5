import crypto from "crypto";

// DEV-ONLY in-memory refresh token tracking.
// Replace with Redis/DB persistence in production or multi-instance deployments.
const activeRefreshTokens = new Map(); // userId -> token hash
const revokedRefreshTokens = new Set(); // token hash blacklist

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const setActiveRefreshToken = (userId, token) => {
  if (!userId || !token) return;
  activeRefreshTokens.set(String(userId), hashToken(token));
};

export const isActiveRefreshToken = (userId, token) => {
  if (!userId || !token) return false;
  const storedHash = activeRefreshTokens.get(String(userId));
  if (!storedHash) return false;
  return storedHash === hashToken(token);
};

export const revokeRefreshToken = (token) => {
  if (!token) return;
  revokedRefreshTokens.add(hashToken(token));
};

export const isRefreshTokenRevoked = (token) => {
  if (!token) return true;
  return revokedRefreshTokens.has(hashToken(token));
};