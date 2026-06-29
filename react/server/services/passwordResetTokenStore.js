import db from "../config/db.js";

let isPasswordResetTableReady = false;

const runQuery = (sql, values = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, values, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });

export const ensurePasswordResetTokenTable = async () => {
  if (isPasswordResetTableReady) {
    return;
  }

  await runQuery(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token_jti VARCHAR(100) NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      used_at DATETIME NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_password_reset_user_id (user_id),
      INDEX idx_password_reset_expires_at (expires_at)
    )
  `);

  isPasswordResetTableReady = true;
};

export const storePasswordResetToken = async (userId, tokenJti, expiresAt) => {
  await runQuery(
    "INSERT INTO password_reset_tokens (user_id, token_jti, expires_at) VALUES (?, ?, ?)",
    [userId, tokenJti, expiresAt],
  );
};

export const isPasswordResetTokenActive = async (tokenJti) => {
  const result = await runQuery(
    `
    SELECT id
    FROM password_reset_tokens
    WHERE token_jti = ?
      AND used_at IS NULL
      AND expires_at > NOW()
    LIMIT 1
  `,
    [tokenJti],
  );

  return Boolean(result.length);
};

export const markPasswordResetTokenUsed = async (tokenJti) => {
  await runQuery(
    "UPDATE password_reset_tokens SET used_at = NOW() WHERE token_jti = ? AND used_at IS NULL",
    [tokenJti],
  );
};

export const invalidateActivePasswordResetTokensForUser = async (userId) => {
  await runQuery(
    `
    UPDATE password_reset_tokens
    SET used_at = NOW()
    WHERE user_id = ?
      AND used_at IS NULL
  `,
    [userId],
  );
};