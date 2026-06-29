import express from "express";
import {
  changeUserPassword,
  getAllUsers,
  getMyProfile,
  getUserById,
  getUsersLastLogin,
  updateMyProfile,
  updateUser,
  updateUserStatus,
} from "../controllers/usersController.js";
import { checkAuth } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(checkAuth);

router.get("/users", getAllUsers);
router.get("/users/last-login", getUsersLastLogin);
router.get("/users/me/profile", getMyProfile);
router.put("/users/me/profile", updateMyProfile);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.put("/users/:id/password", changeUserPassword);

router.put("/users/:id/status", updateUserStatus);

export default router;