import jwt from "jsonwebtoken";

export const checkAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authorization token missing",
    });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || "dev_access_secret_change_me",
    );
    req.user = decoded;
    return next();
  } catch (error) {
    console.warn("JWT failed:", error.message);
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};