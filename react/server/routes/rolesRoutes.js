import express from "express";
import {
  getAllRoles,
  createRole,
  getRoleNavigationPermissions,
  updateRoleNavigationPermissions,
} from "../controllers/rolesController.js";
import { checkAuth } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(checkAuth);

router.get("/roles", getAllRoles);
router.post("/roles/add", createRole);
router.get("/roles/:id/navigation-permissions", getRoleNavigationPermissions);
router.put("/roles/:id/navigation-permissions", updateRoleNavigationPermissions);

export default router;