import express from "express";
import { signup, login, forgotPassword, logout, verifyResetPasswordToken, resetPassword, changePassword, getAllUsernames } from "../controllers/authController.js";


import { checkAuth } from "../middleware/authMiddleware.js";
const router = express.Router();

// ✅ Public routes (no auth required)
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/logout", logout);
router.get("/reset-password/verify", verifyResetPasswordToken);
router.post("/reset-password", resetPassword);
router.get("/usernames", getAllUsernames);

// ✅ Protected routes (auth required)
router.post("/change-password", checkAuth, changePassword);


export default router;